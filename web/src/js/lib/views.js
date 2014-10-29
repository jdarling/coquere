var Views = function(autoLoad){
  var self = this;
  self._views = {};
  if(autoLoad instanceof Array){
    autoLoad.forEach(function(views){
      self.addViews(views);
    });
  }
};

Views.prototype.add = function(views){
  var self = this;
  (views instanceof Array?views:[views]).forEach(function(view){
    var keys = Object.keys(view);
    keys.forEach(function(name){
      self._views[name] = view[name];
    });
  });
};

Views.prototype.get = function(name){
  var self = this;
  return self._views[name];
};

module.exports = new Views();
