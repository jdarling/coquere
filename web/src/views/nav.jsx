var Loader = require('../lib/loader');
var React = require('react');
var Views = {};
var bus = require('../lib/eventbus');

var Link = Views.Link = React.createClass({
  displayName: 'Link',

  getHref: function () {
    return '#'+this.props.to;
    //return this.makeHref(this.props.to, this.props.params, this.props.query);
  },

  render: function(){
    var props = {
      href: this.getHref(),
      onClick: this.handleClick
    };

    return React.DOM.a(props, this.props.children);
  }
});

var NavController = Views.NavController = React.createClass({
  getInitialState: function(){
    return {
      me: this.props.me
    };
  },
  logout: function(e){
    e.preventDefault();
    Loader.post('/api/v1/logout', function(err, data){
      this.handleLogout(err||data);
    }.bind(this));
  },
  handleLogin: function(info){
    this.setState({
      me: info||null
    });
  },
  handleLogout: function(info){
    this.setState({
      me: null
    });
    return window.location.hash = 'home';
  },
  componentDidMount: function(){
    bus.on('login', this.handleLogin);
    bus.on('logout', this.handleLogout);
  },
  componentWillUnmount: function(){
    bus.removeListener('login', this.handleLogin);
    bus.removeListener('logout', this.handleLogout);
  },
  render: function(){
    var loginout = [];
    if(this.state.me){
      loginout.push(<li key="logout" className="float-right"><a href="" onClick={this.logout}>Logout</a></li>);
      loginout.push(<li key="profile" className="float-right"><Link to="profile">Profile</Link></li>);
    }
    if(!this.state.me){
      loginout.push(<li key="login" className="float-right"><Link to="login">Login</Link></li>);
      loginout.push(<li key="signup" className="float-right"><Link to="signup">Signup</Link></li>);
    }
    return (
      <ul data-component="nav">
        <li><Link to="recipes">Recipes</Link></li>
        <li><Link to="recipes/new">Add Recipe</Link></li>
        {loginout}
      </ul>
    );
  }
});

module.exports = Views;
