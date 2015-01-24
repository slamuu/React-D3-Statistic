'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');
var ChartStack = require('chart/stack');
var $ = require('jquery');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      data: false,
      colors: [],
      activeYear: null,
      activeDatasets: {},
      activeStatistic: 'users',
      statistics: [
        'users', 'volume', 'files'
      ]
    };
  },
  
  componentWillMount: function() {
    $.getJSON('json/distribution.json', function(data) {
      var activeDatasets = this.state.activeDatasets,
          getColor = d3.scale.linear()
            .domain([0, data.length - 1])
            .range(['#1a345e', '#87a2c5']);

      var colors = _.map(data, function(d, i) {
        if (typeof(activeDatasets[i]) == 'undefined') {
          activeDatasets[i] = true;
        }

        return getColor(i);
      });

      this.setState({ 
        data: data,
        colors: colors
      });
    }.bind(this));
  },

  onSetStatistic: function(statistic) {
    this.setState({
      statistic: statistic
    });
  },

  onToggleDataset: function(i) {
    var activeDatasets = this.state.activeDatasets;

    activeDatasets[i] = !activeDatasets[i];

    this.setState({ 
      activeDatasets: activeDatasets
    });
  },

  render: function() {
    var cx = React.addons.classSet,
        self = this,
        state = this.state,
        data = [],
        colors = state.colors,
        statistics = state.statistics,
        activeYear = state.activeYear,
        activeStatistic = state.activeStatistic,
        activeDatasets = state.activeDatasets,
        types = [],
        months = [];

    if (activeYear) {
      data = _.find(state.data, { year: activeYear });
    }

    if (data.length && data[0]) {
      months = _.map(data[0].data, function(data, i) {
        return data.month;
      });
    }

    var selectableYears = [];

    var datasets = _.map(data, function(datasets, i) {
      var isDatasetActive = activeDatasets[i];

      selectableYears.push(
        <option value=""
      );

      return _.map(datasets.data, function(dataset, j) {
        return isDatasetActive ? dataset[statistic] : 0;
      });
    });

    var typeControl = _.map(data, function(d, i) {
      var style = {};

      if (activeDatasets[i]) {
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

    var statisticControl = _.map(statistics, function(statistic, i) {
      var classes = cx({
            'control-legend': true,
            'active': activeStatistic == statistic
          });
      
      return (
        <li className={classes} onClick={self.onSetStatistic.bind(null, statistic)} key={i}>
          <div className="control-label">{statistic}</div>
        </li>
      );
    });

    return (
      <div className="distribution">
        <div className="year-controls">
          <select className="select-year"> 
            {selectableYears}
          </select>
        </div>

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