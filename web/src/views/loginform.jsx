var React = require('react');
var Loader = require('../lib/loader');
var Support = require('../lib/support');
var el = Support.el;
var alertify = require('../vendor/alertify/alertify').alertify;
var bus = require('../lib/eventbus');

var Views = {};

var LoginForm = Views.LoginForm = React.createClass({
  doLogin: function(e){
    var frm = this.refs.loginform.getDOMNode();
    e.preventDefault();
    Loader.postForm(frm, function(err, data){
      if(err){
        return alertify.error('Invalid username or password.');
      }
      if(data){
        bus.emit('login', data);
        return window.location.hash = 'home';
      }
      el(frm, 'input[type=password]').value='';
    });
  },
  render: function(){
    return (
      <form ref="loginform" action="/api/v1/login" onSubmit={this.doLogin}>
        <fieldset>
          <label>Username:<input type="text" name="username" /></label>
          <label>Password: <input type="password" name="password" /></label>
          <button onClick={this.doLogin}>Login</button>
        </fieldset>
      </form>
    );
  }
});

module.exports = Views;
