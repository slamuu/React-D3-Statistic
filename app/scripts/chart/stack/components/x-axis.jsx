'use strict';

var d3 = require('d3');
var React = require('react');
var Markup = require('./markup');

module.exports = React.createClass({
  componentWillReceiveProps: function(props) {
    var xAxis = d3.svg.axis()
      .tickSize(0)
      .tickPadding(6)
      .scale(props.scale)
      .tickFormat(function(i) { 
        return 'ticks' in props ? props.ticks[i] : i; 
      })
      .orient('bottom');

    var axis = d3
      .select(this.refs.xAxis.getDOMNode())
      .call(xAxis);

    axis
      .selectAll('line')
      .attr('shape-rendering', 'crispEdges')
      .attr('stroke', '#000');

    axis
      .select('path')
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', 'none')
      .attr('stroke', 'none');

    axis
      .selectAll('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '10px');
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },
  
  render: function() {
    var props = this.props,
        x = props.xOffset,
        y = props.yOffset + props.height,
        t = 'translate(' + x + ',' + y + ')',
        label;

    if (props.label) {
      var lx = props.width / 2 + x,
          ly = y + 30;

      label = (
        <Markup x={lx} y={ly}>{props.label}</Markup>
      );
    }

    return (
      <g>
        <g ref="xAxis" className="x axis" transform={t}></g>
        {label}
      </g>
    );
  }
});