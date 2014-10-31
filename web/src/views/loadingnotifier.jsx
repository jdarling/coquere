var React = require('react/addons');

var Views = {};

var LoadingNotifier = Views.LoadingNotifier = React.createClass({
  render: function() {
    return (
      <p>Loading...</p>
    );
  }
});

module.exports = Views;
