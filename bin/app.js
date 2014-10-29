require('longjohn');
var logger = require('../lib/logger');
var config = require('../lib/config').config;
var cluster = require('cluster');
var useCluster = (process.env.NODE_ENV==='production')||config.cluster;

if(!useCluster){
  logger.info('Running in single threaded model');
  module.exports = require('./process');
}else{
  var numCPUs = config.numWorkers||require('os').cpus().length;
  //numCPUs = 4;

  if(cluster.isMaster){
    for(var i = 0; i < numCPUs; i++){
      cluster.fork();
    }

    cluster.on('listening', function(worker, address){
      logger.info("Worker (" + worker.process.pid + ") is now connected to " + address.address + ":" + address.port);
    });
    cluster.on('exit', function(worker, code, signal){
      var exitCode = worker.process.exitCode;
      logger.info('Worker (' + worker.process.pid + ') died ('+exitCode+'). restarting...');
      cluster.fork();
    });
    module.exports = cluster;
  }else{
    module.exports = require('./process');
  }
}
