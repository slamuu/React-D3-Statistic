'use strict';

var d3 = require('d3');
var React = require('react');
var numeral = require('numeral');
var Markup = require('./markup');

module.exports = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    nextProps.scale.domain([nextProps.min, nextProps.max]);

    var axis = d3
      .select(this.refs.yAxis.getDOMNode())
      .transition()
      .call(this.getYAxis());
    
    axis
      .selectAll('line')
      .attr('shape-rendering', 'crispEdges')
      .attr('stroke', '#fff')
      .attr('stroke-opacity', '0.1');
      
    axis
      .select('path')
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', 'none')
      .attr('stroke', 'none');

    axis
      .selectAll('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px');
  },

  getYAxis: function() {
    if (!this.yAxis) {
      this.yAxis = d3.svg.axis()
        .scale(this.props.scale)
        .tickSize(-this.props.width)
        .tickFormat(function(d) {
          return numeral(d).format('0[.]0a').replace(/\.0$/, '');
        })
        .orient('left');
    }
    return this.yAxis;
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  render: function() {
    var props = this.props,
        x = props.xOffset,
        y = props.yOffset,
        transform = 'translate(' + x + ',' + y + ')',
        label;

    if (props.label) {
      var lx = 10,
          ly = props.height / 2 + props.yOffset - 5;

      label = (
        <Markup x={lx} y={ly} transform={'rotate(-90 ' + lx + ',' + ly + ')'}>{props.label}</Markup>
      );
    }

    return (
      <g>
        <g ref="yAxis" className="y axis" transform={transform}></g>
        {label}
      </g>
    );
  }
});