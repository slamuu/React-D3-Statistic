'use strict';

var React = require('react');
var Animate = require('utils/animate');

module.exports = React.createClass({
  mixins: [Animate],

  getInitialState: function() {
    return {
      color: '',
      width: 0,
      height: 0,
      x: 0, 
      y: 0  
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(nextProps);
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  render: function() {
    var state = this.state,
        props = this.props;

    return (
      <rect 
        fill={state.color} 
        width={state.width} 
        height={state.height} 
        x={state.x} 
        y={state.y} 
        onMouseEnter={props.onMouseEnter} 
        onMouseLeave={props.onMouseLeave} />
    );
  }
});