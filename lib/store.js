var config = require('./config').section('store', {type: 'memory'});
var Stores = require('prodio-stores');

Stores.init(config);

module.exports = Stores;
