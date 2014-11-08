var Cookie = require('hapi-auth-cookie');
var users = require('../../lib/store')('users');
var Hapi = require('hapi');
var bcrypt = require('bcrypt');
var User = require('../../lib/orm').User;
var Login = require('../../lib/orm').Login;
var Boom = require('boom');

var DEFAULT_USER={
  username: 'admin',
  password: 'setup',
  active: true,
  rights: [
    'users:rename',
    'users:create',
    'users:list',
    'users:update',
    'users:delete',
    'recipes:update:all',
    'recipes:delete:all'
  ]
};

var validate = function(username, password, callback){
  var self = this, hashed=false;
  if(arguments.length===2){
    callback=password;
    password=username.password;
    username=username.username;
    hashed=true;
  }
  users.asArray({username: username, active: true}, function(err, records){
    if(err){
      return callback(err);
    }
    var user = (records[records.root]||[]).shift();
    if(!user){
      return callback(null, false);
    }
    if(hashed){
      if(password===user.password){
        return callback(null, true, user);
      }
      return callback(null, false);
    }
    bcrypt.compare(password, user.password, function(err, valid){
      if(valid){
        return callback(null, true, user);
      }
      return callback(null, false);
    });
  });
};

var createUser = function(req, reply){
  var self = this;
  if((req.auth.credentials.rights||[]).indexOf('users:create')===-1){
    return reply(Hapi.boom.unauthorized(null, 'users:create'));
  }
  req.payload.active = true;
  User.validate(req.payload, function(err, user){
    if(err){
      return reply(err);
    }
    users.insert(req.payload, function(err, account){
      if(err){
        return reply(err);
      }
      return reply(account);
    });
  });
};

var listUsers = function(req, reply){
  var self = this;
  if((req.auth.credentials.rights||[]).indexOf('users:list')===-1){
    return reply(Hapi.boom.unauthorized(null, 'users:list'));
  }
  self.asArray(req.query, function(err, records){
    reply(err||records);
  });
};

var getUser = function(req, reply){
  var self = this;
  if((req.auth.credentials.rights||[]).indexOf('users:list')===-1){
    return reply(Hapi.boom.unauthorized(null, 'users:list'));
  }
  self.get(req.params.id, function(err, record){
    reply(err||record);
  });
};

var doUserUpdate = function(id, req, reply){
  var updates = req.payload;
  var doUpdate = function(user){
    users.update(id, user, function(err, account){
      if(err){
        return reply(err);
      }
      reply({
        root: 'user',
        user: account
      });
    });
  };
  users.get(id, function(err, raw){
    if(err){
      return reply(err);
    }
    var user = raw[raw.root];
    if(!user){
      return reply(new Error('Invalid account'));
    }
    if((req.auth.credentials.rights||[]).indexOf('users:update')!==-1){
      if(updates.rights instanceof Array){
        user.rights = updates.rights;
      }
      if(updates.email){
        user.email = updates.email;
      }
      if((req.auth.credentials.rights||[]).indexOf('users:rename')!==-1){
        if(updates.username){
          user.username = updates.username;
        }
      }
    }
    if(updates.password){
      return bcrypt.hash(updates.password, 8, function(err, hash) {
        if(err){
          return reply(err);
        }
        user.password = hash;
        doUpdate(user);
      });
    }
    return doUpdate(user);
  });
};

var updateUser = function(req, reply){
  var id = req.params.id;
  if((req.auth.credentials.rights||[]).indexOf('users:update')===-1){
    return reply(Hapi.boom.unauthorized(null, 'users:update'));
  }
  doUserUpdate(id, req, reply);
};

var updateSelf = function(req, reply){
  doUserUpdate(req.auth.credentials._id, req, reply);
};

var getSelf = function(req, reply){
  return reply(req.auth.credentials||false);
};

var deleteUser = function(req, reply){
  var id = req.params.id;
  if((req.auth.credentials.rights||[]).indexOf('users:delete')===-1){
    if(id !== req.auth.credentials._id){
      return reply(Hapi.boom.unauthorized(null, 'users:delete'));
    }
  }
  users.get(id, function(err, record){
    var user = record[record.root];
    if(!user){
      return reply(new Error('User not found'));
    }
    user.active = false;
    users.update(id, user, function(err){
      if(err){
        return reply(new Error('Update failed'));
      }
      return reply(true);
    });
  });
};

var login = function(req, reply){
  Login.validate(req.payload, function(err, creds){
    if(err){
      return reply(err);
    }

    validate(creds.username, creds.password, function(err, isValid, user){
      if(err){
        return reply(err);
      }
      if(isValid){
        req.auth.session.set(user);
        return reply({
          root: 'user',
          user: user
        });
      }
      return reply(Boom.unauthorized('Invalid username or password.'));
    });
  });
};

var logout = function(req, reply){
  req.auth.session.clear();
  return reply(true);
};

var uuid = function(){
  var rand = function(count){
    var out = '', i=0;
    for (; i<count; i++) {
      out += (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return out;
  }
  return rand(2)+'-'+rand(1)+'-'+rand(1)+'-'+rand(1)+'-'+rand(3);
};

module.exports = function(options, next){
  var server = options.hapi;
  var config = options.config;
  server.pack.register(Cookie, function (err){
    server.auth.strategy('auth', 'cookie', {
      password: process.env.AUTH_COOKIE_PASSWORD||config.password||uuid(),
      cookie: 'coquere',
      redirectTo: false,
      validateFunc: validate,
      isSecure: config.isSecure||false,
      clearInvalid: true
    });

    server.route([
      {
        method: 'POST',
        path: config.route + 'user/{id}',
        handler: updateUser.bind(users),
        config: {
          auth: 'auth'
        }
      },
      {
        method: 'POST',
        path: config.route + 'login',
        config: {
          handler: login,
          auth: {
            mode: 'try',
            strategy: 'auth'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false,
              clearInvalid: true
            }
          }
        }
      },
      {
        method: 'POST',
        path: config.route + 'logout',
        handler: logout
      },
      {
        method: 'GET',
        path: config.route + 'user/me',
        config: {
          handler: getSelf.bind(users),
          auth: {
            mode: 'try',
            strategy: 'auth'
          },
          plugins: {
            'hapi-auth-cookie': {
              redirectTo: false,
              clearInvalid: true
            }
          }
        }
      },
      {
        method: 'POST',
        path: config.route + 'user/me',
        handler: updateSelf.bind(users),
        config: {
          auth: 'auth'
        }
      },
      {
        method: 'POST',
        path: config.route + 'user',
        handler: createUser.bind(users),
        config: {
          auth: 'auth'
        }
      },
      {
        method: 'DELETE',
        path: config.route + 'user/{id}',
        handler: deleteUser.bind(users),
        config: {
          auth: 'auth'
        }
      },
      {
        method: 'GET',
        path: config.route + 'users',
        handler: listUsers.bind(users),
        config: {
          auth: 'auth'
        }
      },
      {
        method: 'GET',
        path: config.route + 'user/{id}',
        handler: getUser.bind(users),
        config: {
          auth: 'auth'
        }
      },
    ]);
  });
  users.asArray({}, function(err, records){
    if(err){
      server.error(err);
      return next();
    }
    if(!(records[records.root]||[]).shift()){
      return bcrypt.hash(DEFAULT_USER.password, 8, function(err, hash){
        if(err){
          server.error(err);
          return next();
        }
        DEFAULT_USER.password = hash;
        return users.insert(DEFAULT_USER, function(err, user){
          return next();
        });
      });
    }
    return next();
  });
};
