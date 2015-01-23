'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');

var ChartStack = require('chart/stack');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      colors: [],
      active: false
    };
  },

  getDefaultProps: function() {
    return {
      data: [],
      statistics: [],
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var state = this.state;

    if (!state.active && nextProps.statistics && nextProps.statistics.length) {
      state.active = nextProps.statistics[0];
    }

    if (nextProps.data) {
      var getColor = d3.scale.linear()
        .domain([0, nextProps.data.length - 1])
        .range(['#1a345e', '#87a2c5']);

      state.colors = _.map(nextProps.data, function(d, i) {
        return getColor(i);
      });
    }

    this.setState(state);
  },
  
  componentWillMount: function() {
    this.componentWillReceiveProps(this.props);
  },
  
  getColor: function(i) {
    if (!this.colorScale) {
      this.colorScale = d3.scale.linear()
        .domain([0, this.props.data.length - 1])
        .range(['#1a345e', '#87a2c5']);
    }
    
    return this.colorScale(i);
  },

  setStatistic: function(statistic) {
    this.setState({
      active: statistic
    });
  },

  toggleDataset: function(index) {
    var chart = this.refs.chart;

    if (chart && chart.onToggle) {
      chart.onToggle(index);
    }
  },

  render: function() {
    var cx = React.addons.classSet,
        self = this,
        props = this.props,
        state = this.state,
        data = props.data,
        colors = state.colors,
        active = state.active,
        months = [];

    if (data && data[0]) {
      months = _.map(data[0].data, function(data, i) {
        return data.month;
      });
    }

    var datasets = _.map(data, function(d, i) {
      return _.map(d.data, function(statistics, j) {
        return active in statistics && statistics[active] || 0;
      });
    });

    var statistics = _.map(props.statistics, function(statistic, i) {
      var classes = cx({
            'control-legend': true,
            'active': statistic == active
          });
      
      return (
        <li className={classes} onClick={self.setStatistic.bind(null, statistic)} key={i}>
          <div className="control-label">{statistic}</div>
        </li>
      );
    });

    return (
      <div className="distribution">
        <div className="statistics-controls">
          <ul className="control-legends">
            {statistics}
          </ul>
        </div>

        <ChartStack 
          datasets={datasets} 
          colors={colors} 
          xLabels={months}
          ref="chart" />
      </div>
    );
  }
});