var fs = require('fs');
var PACKAGE_JSON = JSON.parse(fs.readFileSync('./package.json'));

var getStatus = function(){
  return {
    mem: process.memoryUsage(),
    uptime: process.uptime(),
    piid: process.pid,
    version: PACKAGE_JSON.version
  };
};

var statsConfig = {
  handler: function(req, reply){
    reply(getStatus());
  }
};

var setupStatusEmit = function(sockets){
  var sendStatus = function(){
    sockets.broadcast('system::status', getStatus());
    return setTimeout(sendStatus, 1000);
  };
  setTimeout(sendStatus, 1000);
};

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  var sockets = options.sockets;
  server.route([
    {
      method: 'GET',
      path: config.route + (config.path||'status'),
      config: statsConfig
    }
  ]);
  setupStatusEmit(sockets);
  next();
};
