try{
  var logger = require('../../lib/logger');
}catch(e){
  try{
    var bunyan = require('bunyan');
    var logger = bunyan.createLogger({name: 'bunyan-logger'});
  }catch(e){
    throw new Error('Bunyan logger requires bunyan.  Use "npm install bunyan" to resolve');
  }
}
if(!logger.child){
  throw new Error('Bunyan logger requires bunyan.  Use "npm install bunyan" to resolve');
}
var utils = require('../../lib/utils');
var noop = function(){};

var LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

var logEvent = function logEvent(ctx, data, request){
  var obj = {};
  var type = typeof(data.data);

  if(request){
    obj.req_id = request.id;
    obj.url = request.url.path;
    obj.method = request.method.toUpperCase();

    obj.request = {};
    if(ctx.includePayload && request && request.payload){
      obj.request.payload = request.payload;
    }

    if(ctx.includeParams && request && request.params && Object.keys(request.params).length){
      obj.request.params = request.params;
    }

    if(ctx.includeHeaders && request && request.headers){
      obj.request.headers = request.headers;
    }

    if(ctx.includeResponse && request && request.response){
      var res = {}, include = false;
      if(request.response.statusCode){
        res.statusCode = request.response.statusCode;
        include = true;
      }
      if(request.response.headers){
        res.headers = request.response.headers;
        include = true;
      }
      if(request.response.source){
        try{
          res.payload = typeof(request.response.source)==='object'?
            JSON.parse(JSON.stringify(request.response.source)):
            request.response.source;
            include = true;
        }catch(e){
        }
      }
      if(include){
        obj.response = res;
      }
    }
  }

  if(ctx.includeTags){
    obj.tags = ctx.joinTags ? data.tags.join(ctx.joinTags) : data.tags;
  }

  if(type!=='string'&&type!=='undefined'&&ctx.includeData){
    obj.data = ctx.mergeData?utils.extend(obj, data.data):data.data;
  }

  if(type==='undefined'&&ctx.skipUndefined){
    return;
  }

  if(type==='string'){
    return ctx.log[ctx.level](obj, data.data);
  }

  ctx.log[ctx.level](obj);
};

var setDefault = function setDefault(on, member, value){
  if(typeof(on[member])==='undefined'){
    on[member] = value;
  }
};

var bunyan = function bunyan(server, options, next){
  if(!options.logger){
    return next(new Error('options.logger required'));
  }
  var log = options.logger;
  var handler = options.handler||noop;

  setDefault(options, 'includeTags', false);
  setDefault(options, 'includeData', true);
  setDefault(options, 'mergeData', false);
  setDefault(options, 'skipUndefined', false);
  setDefault(options, 'joinTags', false);
  setDefault(options, 'includePayload', true);
  setDefault(options, 'includeParams', true);
  setDefault(options, 'includeResponse', true);
  setDefault(options, 'includeHeaders', true);

  server.ext('onRequest', function(request, next){
    var _log = request.log;
    request.log = function(){
      _log.apply(request, arguments);
    };
    request.bunyan = log.child({req_id: request.id}, true);
    LOG_LEVELS.forEach(function(level){
      request.log[level]=request.bunyan[level].bind(request.bunyan);
    });
    next();
  });

  server.log = (function(){
    var _super = server.log;
    return function(){
      var args = Array.prototype.slice.apply(arguments);
      var type = args.shift();
      var msg = args.join('\t');
      _super.call(server, type, msg);
    };
  })();

  server.events.on('log', function(data, tags){
    var ctx = {
      level: tags.error?'error':'info',
      log: log,
      includeTags: options.includeTags,
      includeData: options.includeData,
      mergeData: options.mergeData,
      skipUndefined: options.skipUndefined,
      includePayload: options.includePayload,
      includeParams: options.includeParams,
      includeResponse: options.includeResponse,
      includeHeaders: options.includeHeaders,
      joinTags: options.joinTags
    };
    if(handler.call(ctx, 'log', data, tags)){
      return;
    }
    logEvent(ctx, data);
  });

  server.events.on('request', function(request, data, tags){
    var ctx = {
      level: tags.error?'warn':'info',
      log: log,
      includeTags: options.includeTags,
      includeData: options.includeData,
      mergeData: options.mergeData,
      skipUndefined: options.skipUndefined,
      includePayload: options.includePayload,
      includeParams: options.includeParams,
      includeResponse: options.includeResponse,
      includeHeaders: options.includeHeaders,
      joinTags: options.joinTags
    };
    if(handler.call(ctx, 'request', request, data, tags)){
      return;
    }
    logEvent(ctx, data, request);
  });
};

bunyan.attributes ={
  name: 'bunyan-logger'
};

module.exports = function(options, next){
  var config = {
    plugin: {
      register: bunyan
    },
    options: utils.extend(options.config, {
      logger: logger
    })
  };
  options.hapi.pack.register(config, function(err){
    if(err){
      throw err;
    }
  });
  next();
};
