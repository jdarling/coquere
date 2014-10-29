var async = require('async');
var Recipe = require('../../lib/orm').Recipe;

var listRecords = function(req, reply){
  var self = this;
  self.asArray(req.query, function(err, records){
    reply(err||records);
  });
};

var getRecord = function(req, reply){
  var self = this;
  self.get(req.params.id, function(err, record){
    reply(err||record);
  });
};

var postRecord = function(req, reply){
  var self = this;
  Recipe.validate(req.payload, function(err, recipe){
    if(err){
      return reply(err);
    }
    self.insert(recipe, function(err, record){
      reply(err||{
        root: 'recipe',
        recipe: record
      });
    });
  });
};

var postRecords = function(req, reply){
  var self = this;
  var records = req.payload;
  if(!records instanceof Array){
    return reply(new Error('Must supply an array of recipes'));
  }
  var inserts = [];
  async.eachLimit(records, 10, function(record, next){
    Recipe.validate(record, function(err, recipe){
      if(err){
        return next();
      }
      self.insert(recipe, function(err, record){
        inserts.push(record);
        next();
      });
    });
  }, function(){
    reply(inserts);
  });
};

var putRecord = function(req, reply){
  var self = this;
  Recipe.validate(req.payload, function(err, recipe){
    if(err){
      return reply(err);
    }
    self.update(req.params.id, recipe, function(err, response){
      reply(err||{
        root: 'recipe',
        recipe: response
      });
    });
  });
};

var deleteRecord = function(req, reply){
  var self = this;
  self.delete(req.params.id, function(err, response){
    reply(err||response);
  });
};

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  var store = options.stores(config.collectionName||'recipes');

  server.route([
    {
      method: 'GET',
      path: config.route + 'recipes',
      handler: listRecords.bind(store)
    },
    {
      method: 'GET',
      path: config.route + 'recipe/{id}',
      handler: getRecord.bind(store)
    },
    {
      method: 'POST',
      path: config.route + 'recipe',
      handler: postRecord.bind(store)
    },
    {
      method: 'PUT',
      path: config.route + 'recipe',
      handler: postRecord.bind(store)
    },
    {
      method: 'PUT',
      path: config.route + 'recipe/{id}',
      handler: putRecord.bind(store)
    },
    {
      method: 'POST',
      path: config.route + 'recipe/{id}',
      handler: putRecord.bind(store)
    },
    {
      method: 'DELETE',
      path: config.route + 'recipe/{id}',
      handler: deleteRecord.bind(store)
    },
    {
      method: 'POST',
      path: config.route + 'recipes',
      handler: postRecords.bind(store)
    }
  ]);
  next();
};
