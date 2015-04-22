'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');
var Canvas = require('utils/canvas');
var Tooltip = require('utils/tooltip');
var Markup = require('./components/markup');
var Series = require('./components/series');
var XAxis = require('./components/x-axis');
var YAxis = require('./components/y-axis');
var Base64 = require('base64').Base64;
var numeral = require('numeral');
var $ = require('jquery');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      totals: [],
      size: {
        width: 0,
        height: 0
      },
      tooltip: {
        stackIndex: 0,
        columnIndex: 0,
        bar: 0
      }
    };
  },
  
  getDefaultProps: function() {
    return {
      datasets: [],
      colors: [],
      xTicks: [],
      width: 600,
      height: 300,
      padding: 50
    };
  },
  
  componentWillReceiveProps: function(nextProps) {
    var self = this,
        padding = nextProps.padding,
        width = nextProps.width,
        height = nextProps.height,
        datasets = nextProps.datasets,
        zipped = _.zip.call(null, datasets),
        size = {
          width: width - 2 * padding,
          height: height - 2 * padding
        },
        totals = _.map(zipped, function(values) {
          return _.reduce(values, function(memo, value) { 
            return memo + value; 
          }, 0);
        });

    this.setState({
      totals: totals,
      size: size
    });

    this.getYScale()
      .domain([0, d3.max(totals)])
      .range([size.height, 0]);

    var lengths = _.map(datasets, function(dataset) {
      return dataset.length;
    });

    this.getXScale()
      .domain(d3.range(d3.max(lengths)))
      .rangeRoundBands([0, size.width], 0.1);
  },
  
  componentWillMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  getImageData: function() {
    var svg = d3.select(this.getDOMNode()),
        data = 'data:image/svg+xml;',
        html;

    if (svg) {
      svg
        .attr('version', 1.1)
        .attr('xmlns', 'http://www.w3.org/2000/svg');

      html = (new XMLSerializer).serializeToString(svg.node());

      data += 'base64,' + Base64.encode(html);
    }
    return data;
  },
  
  getYScale: function() {
    if (!this.yScale) {
      this.yScale = d3.scale.linear();
    }
    return this.yScale;
  },
  
  getXScale: function() {
    if (!this.xScale) {
      this.xScale = d3.scale.ordinal();
    }
    return this.xScale;
  },
  
  getOffsets: function(index) {
    var datasets = this.props.datasets,
        dataset = datasets[index],
        length = datasets.length,
        offsets = [];

    for (var i = index; i < length; i++) {
      offsets.push(datasets[i]);
    }

    return _.map(dataset, function(value, i) {
      return _.reduce(offsets, function(memo, offset) {
        return memo + offset[i];
      }, 0);
    });
  },

  onBarMouseEnter: function(bar, columnIndex, stackIndex) {
    var tooltip = this.refs.tooltip,
        props = this.props,
        state = this.state,
        padding = props.padding,
        totals = state.totals,
        elem = $(this.getDOMNode()),
        wscale = elem.outerWidth() / props.width,
        hscale = elem.outerHeight() / props.height;

    if (tooltip) {
      var yScale = this.getYScale(),
          xScale = this.getXScale();

      clearTimeout(this.timer);

      this.setState({
        tooltip: {
          columnIndex: columnIndex,
          stackIndex: stackIndex,
          bar: bar,
        }
      });
      console.log(bar.x, xScale.rangeBand(), hscale);
      tooltip.onShow();
      tooltip.setPosition({
        y: bar.y * wscale,
        x: (bar.x + xScale.rangeBand() / 2) * hscale
      });
    }
  },

  onBarMouseLeave: function(bar, columnIndex, stackIndex) {
    var tooltip = this.refs.tooltip;

    this.timer = setTimeout(function() {
      tooltip.onHide();
    }, 500);
  },

  tooltip: function() {
    var state = this.state,
        props = this.props,
        stackLabels = props.stackLabels,
        datasets = props.datasets,
        tooltip = state.tooltip,
        bar = tooltip.bar,
        totals = state.totals,
        columnIndex = tooltip.columnIndex,
        stackIndex = tooltip.stackIndex,
        datasets = props.datasets;

    if (bar) {
      var percentages = _.filter(_.map(datasets, function(dataset, i) {
        if (dataset[columnIndex]) {
          var value = dataset[columnIndex].toFixed(2),
              percent = dataset[columnIndex] / totals[columnIndex];

          return (
            <li key={i} className={i == stackIndex ? 'active' : ''}>
              <span className="stack-label">{stackLabels[i]}:&nbsp;</span>
              <span className="stack-statistic">
                <span className="stack-value">
                  {numeral(value).format('0,0')}&nbsp;
                </span>
                <span className="stack-percent">
                  ({numeral(percent).format('0.00%')})
                </span>
              </span>
            </li>
          );
        }
        }));

      return (
        <div className="tooltip-content">
          <ul className="list-unstyled">
            {percentages}

            <li className="stack-totals">
              <span className="stack-label">Total:&nbsp;</span>
              <span className="stack-value">
                {numeral(totals[columnIndex]).format('0,0')}
              </span>
            </li>
          </ul>
        </div>
      );
    }
  },
  
  render: function() {
    var xAxis, yAxis, self = this,
        props = this.props,
        state = this.state,
        datasets = props.datasets,
        padding = props.padding,
        colors = props.colors,
        xTicks = props.xTicks,
        size = state.size,
        totals = state.totals,
        xScale = this.getXScale(),
        yScale = this.getYScale();

    var totals = _.map(totals, function(total, i) {
      return (
        <Markup
          key={i}
          animate={true}
          x={xScale(i) + (xScale.rangeBand() / 2) + padding} 
          y={yScale(total) + padding - 10}>
            {numeral(total).format('0.00a')}
        </Markup>
      );
    });
    
    var series = _.map(datasets, function(dataset, i) {
      return (
        <Series
          onBarMouseEnter={self.onBarMouseEnter}
          onBarMouseLeave={self.onBarMouseLeave}
          onBarClick={props.onBarClick}
          xOffset={padding}
          yOffset={padding}
          data={dataset}
          offsets={self.getOffsets(i)}
          stackIndex={i}
          xScale={xScale}
          yScale={yScale}
          color={colors[i]}
          ref={'dataSeries' + i}
          key={i} />
      );
    });
    
    return (
      <div className="chart">
        <Canvas width={this.props.width} height={this.props.height}>
          <g className="totals">{totals}</g>
          <g className="series">{series}</g> 
          
          <YAxis 
            label={props.yLabel}
            scale={yScale}
            min={0}
            max={d3.max(state.totals)}
            width={size.width}
            height={size.height}
            xOffset={padding}
            yOffset={padding}
            ref="yAxis" />

          <XAxis 
            scale={xScale} 
            label={props.xLabel}
            ticks={xTicks}
            width={size.width} 
            height={size.height}
            xOffset={padding}
            yOffset={padding + 2}
            ref="xAxis" />
        </Canvas>

        <Tooltip ref="tooltip">{this.tooltip()}</Tooltip>
      </div>
    );
  }
});