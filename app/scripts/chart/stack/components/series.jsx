'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');
var Bar = require('./bar');
var Animate = require('utils/animate');
var Tooltip = require('utils/tooltip');

module.exports = React.createClass({
  mixins: [Animate],

  getInitialState: function() {
    return {
      bars: [],
      active: true
    };
  },

  getDefaultProps: function() {
    return {
      yOffset: 0,
      xOffset: 0,
      data: [],
      stackIndex: 0,
      offsets: [],
      onBarMouseEnter: _.identity,
      onBarMouseLeave: _.identity,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var bars = this.getBarPositions(nextProps);
    this.animate({ bars: bars }, 1000, 'cubic-in-out');
  },

  componentDidMount: function() {
    var props = this.props,
        bars = this.getBarPositions(props),
        initial = [];

    _.each(bars, function(bar, i) {
      initial[i] = _.clone(bar);
      initial[i].y = props.yScale(0) + props.yOffset;
      initial[i].height = 0;
    });

    this.setState({ bars: initial });
    this.animate({ bars: bars }, 1000, 'cubic-in-out');
  },

  getBarPositions: function(props) {
    var props = props || this.props,
        data = props.data,
        offsets = props.offsets,
        yScale = props.yScale,
        xScale = props.xScale,
        xOffset = props.xOffset || 0,
        yOffset = props.yOffset || 0,
        offsets = offsets || this.state.offsets;

    return _.map(data, function(value, i) {
      return {
        value: value,
        height: yScale(0) - yScale(value),
        width: xScale.rangeBand(),
        x: xScale(i) + xOffset,
        y: yScale(offsets[i]) + yOffset
      };
    });
  },

  render: function() {
    var self = this,
        props = this.props,
        state = this.state,
        refs = this._owner.refs,
        stackIndex = props.stackIndex,
        onMouseEnter = props.onBarMouseEnter,
        onMouseLeave = props.onBarMouseLeave,
        yScale = props.yScale,
        xScale = props.xScale;

    var bars = _.map(state.bars, function(bar, i) {
      return (
        <Bar 
          width={bar.width} 
          height={bar.height} 
          x={bar.x} 
          y={bar.y} 
          color={props.color} 
          ref={'bar' + i} 
          key={i} 
          onMouseEnter={onMouseEnter.bind(null, bar, i, stackIndex)} 
          onMouseLeave={onMouseLeave.bind(null, bar, i, stackIndex)} />
      );
    });

    return (
      <g>{bars}</g>
    );
  }
});