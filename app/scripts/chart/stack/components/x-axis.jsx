'use strict';

var d3 = require('d3');
var React = require('react');

module.exports = React.createClass({
  componentWillReceiveProps: function(props) {
    var xAxis = d3.svg.axis()
      .tickSize(0)
      .tickPadding(6)
      .scale(props.xScale)
      .tickFormat(function(i) { 
        return 'format' in props ? props.format[i] : i; 
      })
      .orient('bottom');

    var node = d3.select(this.refs.xAxis.getDOMNode()).call(xAxis);

    node
      .selectAll('line')
      .attr('shape-rendering', 'crispEdges')
      .attr('stroke', '#000');

    node
      .select('path')
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', 'none')
      .attr('stroke', 'none');

    node
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
        t = 'translate(' + x + ',' + y + ')';

    return (
      <g ref="xAxis" className="x axis" transform={t}></g>
    );
  }
});