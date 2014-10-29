var Hapi = require('hapi');

var routeConfig = {
  handler: {
    proxy: {
      mapUri: function(req, cb){
        if(!req.query.url){
          req.raw.res.end('Need URL');
        }else{
          req.log('info', 'Fetch external url: '+req.query.url);
          return cb(null, req.query.url);
        }
      },
      passThrough: true
    }
  }
};

module.exports = function(options, next){
	var config = options.config;
  var server = options.hapi;

  server.route([
    {
      method: 'GET',
      path: config.route + 'proxy',
      config: routeConfig
    },
    {
      method: 'POST',
      path: config.route + 'proxy',
      config: routeConfig
    },
    {
      method: 'PUT',
      path: config.route + 'proxy',
      config: routeConfig
    },
    {
      method: 'DELETE',
      path: config.route + 'proxy',
      config: routeConfig
    },
  ]);
  next();
};
