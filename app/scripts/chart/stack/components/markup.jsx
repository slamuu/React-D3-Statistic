'use strict';

var React = require('react');
var Animate = require('utils/animate');

module.exports = React.createClass({
  mixins: [Animate],

  getInitialState: function() {
    return {
      animate: false,
      fill: 'black',
      x: 0, 
      y: 0
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.animate || this.state.animate) {
      this.animate(nextProps, 1000, 'cubic-in-out');
    }
    else {
      this.setState(nextProps);
    }
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
        transform={this.state.transform}
        x={this.state.x} 
        y={this.state.y}>
          {this.props.children}
      </text>
    );
  }
});