'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');
var ChartStack = require('chart/stack');
var $ = require('jquery');

var Drupal = window.Drupal && window.Drupal.settings || {};

var monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

module.exports = React.createClass({
  getInitialState: function() {
    return {
      datas: false,
      colors: [],
      statistics: [],
      active: {
        year: 'All Years',
        statistic: 'files'
      }
    };
  },
  
  componentWillMount: function() {
    var archiveUrl = Drupal && Drupal.statistics && Drupal.statistics.archive;
    
    $.get(archiveUrl || 'json/archive.json', function(datas) {
      var years = _.pluck(datas, 'year'),
          yearly = [];
      
      // Aggregate the statistic values to show yearly totals
      _.each(datas, function(data, i) {
        _.each(data.data, function(statData) {
          var statTotal = _.find(yearly, { statistic: statData.statistic });

          if (!statTotal) {
            yearly.push(statTotal = {
              statistic: statData.statistic,
              yaxis: statData.yaxis || null,
              xtick: years,
              data: _.range(0, years.length, 0)
            })
          }

          statTotal.data[i] = _.reduce(statData.data, function(memo, value) {
            return memo + value;
          });
        });
      });

      datas.unshift({
        year: 'All Years',
        data: yearly
      });
      
      this.setState({
        datas: datas
      });
      
      if (!this.getActive('year')) {
        this.setYear(d3.max(years));
      }
      else {
        this.setYear(this.getActive('year'));
      }
    }.bind(this));
  },

  setYear: function(year) {
    var data,
        statistics,
        self = this,
        state = this.state,
        datas = state.datas,
        activeStatistic = this.getActive('statistic');

    data = _.find(datas, { year: year });

    // Populate statistic values
    statistics = _.pluck(data.data, 'statistic');

    if (!activeStatistic || _.indexOf(statistics, activeStatistic) == -1) {
      activeStatistic = statistics[0];
    }

    this.setActive('year', year);
    this.setState({
      data: data,
      statistics: statistics
    });
  },

  setActive: function(name, value) {
    var active = this.state.active;
    active[name] = value;
    this.setState({ active: active });
  },

  getActive: function(name) {
    return this.state.active[name];
  },

  render: function() {
    var activeStatistic, activeYear, 
        toggledTypes, datasets;

    var cx = React.addons.classSet,
        self = this,
        colors = ['#87a2c5'],
        state = this.state,
        data = state.data,
        datas = state.datas,
        statistics = state.statistics,
        toggled = false,
        types,
        xTicks,
        xLabel,
        yLabel;

    activeYear = this.getActive('year');
    activeStatistic = this.getActive('statistic');

    if (activeStatistic == 'files') {
      types = ['Files Archived'];
    }
    else if (activeStatistic == 'volume') {
      types = ['GB Archived'];
    }
    else {
      types = ['Total'];
    }

    if (data && (datasets = _.find(data.data, { statistic: activeStatistic }))) {
      xTicks = datasets.xtick ? datasets.xtick : monthLabels;
      
      if (datasets.yaxis) {
        yLabel = datasets.yaxis;
      }

      if (datasets.xaxis) {
        xLabel = datasets.xaxis;
      }

      datasets = [datasets.data];
    }

    // Render the select options for selecting year
    var yearControl = _.map(datas, function(data, i) {
      return (
        <option 
          value={data.year}
          key={i}>
            {data.year}
        </option>
      );
    });

    // Render the buttons for setting statistic
    var statisticControl = _.map(statistics, function(statistic, i) {
      var classes = cx({
            'control-legend': true,
            'active': activeStatistic == statistic
          });
      
      return (
        <li 
          className={classes}
          onClick={self.setActive.bind(null, 'statistic', statistic)}
          key={i}>
            <div className="control-label">{statistic}</div>
        </li>
      );
    });

    var onChangeYear = function(event) {
      self.setYear(event.target.value);
    };

    return (
      <div className="archive">
        <div className="left-column">
          <div className="years-control">
            <div className="select-title-label">Select Year</div>
            <select 
              className="select-year"
              onChange={onChangeYear}
              value={activeYear}>
                {yearControl}
            </select>
          </div>
        </div>

        <div className="right-column">
          <div className="statistics-controls">
            <ul className="control-legends">
              {statisticControl}
            </ul>
          </div>
        </div>

        <br />

        <div className="chart-container">
          <ChartStack 
            width={800}
            datasets={datasets}
            stackLabels={types}
            colors={colors}
            xTicks={xTicks}
            yLabel={yLabel}
            xLabel={xLabel}
            ref="chart" />
        </div>
      </div>
    );
  }
});