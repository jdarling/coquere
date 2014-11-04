var Loader = require('../../lib/loader');
var Support = require('../../lib/support');
var el = Support.el;
var els = Support.els;
var React = require('react');
var views = require('./views');
var async = require('async');

var hideLoading = function(){
  el('#loading').style.display='none';
  el('#outlet').style.display='';
};

var showLoading = function(){
  el('#loading').style.display='';
  el('#outlet').style.display='none';
};

var displayPage = function(pageName, data){
  var path = (pageName||'').split('/');
  var nav = path.shift();
  var template = el('#'+(pageName||'home'));
  var pane = el('#outlet');
  var content = template.content.cloneNode(true);
  var components = (els(content, '[data-component]')||[]);
  showLoading();
  while(pane.firstChild){
    pane.removeChild(pane.firstChild);
  }
  pane.appendChild(content);
  if(components.length){
    return async.each(components, function(el, next){
      var componentName = el.dataset.component;
      var api = el.dataset.api;
      var Component = views.get(componentName);
      if(!Component){
        throw new Error(componentName+' is not registered');
      }
      if(api){
        return Loader.get(api, function(err, response){
          if(err){
            throw new Error(err);
          }
          React.render(Component({data: response, container: el}), el);
          return next();
        });
      }

      React.render(Component({data: data, container: el}), el);
      return next();
    }, function(){
      hideLoading();
    });
  }
  hideLoading();
};

var nav = Satnav({
  html5: false,
  force: true,
  poll: 100
});

nav
  .navigate({
    path: '/',
    directions: (function(){
      var e = el('#home');
      var dataApi = e?e.getAttribute('data-api'):false;
      if(dataApi){
        return Loader.get(dataApi, function(err, data){
          return displayPage('home', err||data);
        });
      }
      return displayPage('home');
    })
  })
  ;
var e = els('template[nav]'), i=0, l=e.length;
e.forEach(function(e){
  nav = nav.navigate(
    (function(id, linkTo, dataApi){
      return {
        path: linkTo,
        directions: dataApi?function(params){
          var uri = dataApi.replace(/{([^}]+)}/g,  function(full, sym){
            return params[sym];
          });
          Loader.get(uri, function(err, data){
            displayPage(id, err||data);
          });
        }:function(params){
          displayPage(id);
        }
      }
    })(e.getAttribute('id'), e.getAttribute('nav'), e.dataset.api)
  );
});

nav
  .change(function(params, old){
    showLoading();
    nav.resolve();
    return this.defer;
  })
  .otherwise('/');
  ;
nav.go();
