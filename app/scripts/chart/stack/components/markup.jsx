'use strict';

var React = require('react');
var Animate = require('utils/animate');

module.exports = React.createClass({
  mixins: [Animate],

  getInitialState: function() {
    return {
      fill: 'black',
      x: 0, 
      y: 0
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.animate(nextProps, 1000, 'cubic-in-out');
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  render: function() {
    return (
      <text 
        fontFamily="sans-serif"
        fontSize="10px"
        textAnchor="middle"
        fill={this.state.fill}
        x={this.state.x} 
        y={this.state.y}>
          {this.props.children}
      </text>
    );
  }
});