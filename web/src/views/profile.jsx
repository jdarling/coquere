var React = require('react');

var Views = {};

var ProfileView = Views.ProfileView = React.createClass({
  render: function(){
    var data = this.props.data||{};
    return (
      <dl>
        <dt>Username:</dt><dd>{data.username}</dd>
        <dt>Email:</dt><dd>{data.email}</dd>
      </dl>
    );
  }
});

module.exports = Views;
