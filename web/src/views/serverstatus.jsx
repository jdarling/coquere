var React = require('react');
var socket = require('../lib/socket');

var Views = {};

Views.ServerStatus = React.createClass({
  updateStatus: function(data){
    this.setState({status: data});
  },
  getInitialState: function(){
    return {
      status: this.props.data||{mem: {}}
    };
  },
  componentWillMount: function(){
    socket.removeAllListeners('system::status');
    socket.on('system::status', this.updateStatus);
  },
  componentWillUnmount: function(){
  },
  render: function(){
    return (
      <div>
        <div><strong>Server Version:</strong> v{this.state.status.version}</div>
        <div><strong>Memory:</strong> {this.state.status.mem.heapUsed} of {this.state.status.mem.heapTotal}</div>
        <progress className="all-100" value={this.state.status.mem.heapUsed} max={this.state.status.mem.heapTotal}></progress>
        <div><strong>Uptime:</strong> {this.state.status.uptime}s</div>
      </div>
    )
  }
});

module.exports = Views;
