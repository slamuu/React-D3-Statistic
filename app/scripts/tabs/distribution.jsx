'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');
var ChartStack = require('chart/stack');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      colors: [],
      active: [],
      statistic: false
    };
  },

  getDefaultProps: function() {
    return {
      data: [],
      statistics: [],
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var state = this.state,
        active = state.active;

    if (!state.statistic && nextProps.statistics && nextProps.statistics.length) {
      state.statistic = nextProps.statistics[0];
    }

    if (nextProps.data) {
      var getColor = d3.scale.linear()
        .domain([0, nextProps.data.length - 1])
        .range(['#1a345e', '#87a2c5']);

      state.colors = _.map(nextProps.data, function(d, i) {
        if (typeof(active[i]) == 'undefined') {
          active[i] = true;
        }

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

  onSetStatistic: function(statistic) {
    this.setState({
      statistic: statistic
    });
  },

  onToggleDataset: function(i) {
    var active = this.state.active;

    active[i] = !active[i];

    this.setState({ 
      active: active
    });
  },

  render: function() {
    var cx = React.addons.classSet,
        self = this,
        props = this.props,
        state = this.state,
        data = props.data,
        colors = state.colors,
        statistic = state.statistic,
        active = state.active,
        types = [],
        months = [];

    if (data && data[0]) {
      months = _.map(data[0].data, function(data, i) {
        return data.month;
      });
    }

    var datasets = _.map(data, function(datasets, i) {
      var isActive = active[i];

      return _.map(datasets.data, function(dataset, j) {
        return isActive ? dataset[statistic] : 0;
      });
    });

    var typeControl = _.map(data, function(d, i) {
      var style = {};

      if (active[i]) {
        style.backgroundColor = colors[i];
      }
      else {
        style.backgroundColor = '#ccc';
      }
      
      types[i] = d.type;

      return (
        <li className="control-legend" onClick={self.onToggleDataset.bind(null, i)} key={i}>
          <div className="control-label" style={style}>{d.type}</div>
        </li>
      );
    });

    var statisticControl = _.map(props.statistics, function(stat, i) {
      var classes = cx({
            'control-legend': true,
            'active': statistic == stat
          });
      
      return (
        <li className={classes} onClick={self.onSetStatistic.bind(null, stat)} key={i}>
          <div className="control-label">{stat}</div>
        </li>
      );
    });

    return (
      <div className="distribution">
        <div className="statistics-controls">
          <ul className="control-legends">
            {statisticControl}
          </ul>
        </div>

        <ChartStack 
          datasets={datasets}
          colors={colors}
          stackLabels={types}
          xLabels={months}
          ref="chart" />

        <div className="type-controls">
          <ul className="control-legends">
            {typeControl}
          </ul>
        </div>
      </div>
    );
  }
});