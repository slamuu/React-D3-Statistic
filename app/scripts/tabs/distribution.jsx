'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react/addons');
var ChartStack = require('chart/stack');
var $ = require('jquery');

var monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

var Drupal = window.Drupal && window.Drupal.settings || {};

module.exports = React.createClass({
  getInitialState: function() {
    return {
      datas: [],
      topYearly: [],
      topMonthly: [],

      colors: [],
      statistics: [],
      types: [],
      years: [],

      active: {
        data: [],
        month: null,
        year: 'All Years',
        statistic: 'files'
      },

      toggle: {
        types: {},
      }
    };
  },
  
  componentWillMount: function() {
    var topYearlyUrl, topMonthlyUrl, distributionUrl;

    if (Drupal && Drupal.statistics) {
      topYearlyUrl = Drupal.statistics.topYearly;
      topMonthlyUrl = Drupal.statistics.topMonthly;
      distributionUrl = Drupal.statistics.distribution;
    }

    $.get(topYearlyUrl || 'json/top-yearly.json', function(datas) {
      this.setState({
        topYearly: datas
      });
    }.bind(this));

    $.get(topMonthlyUrl || 'json/top-monthly.json', function(datas) {
      this.setState({
        topMonthly: datas
      });
    }.bind(this));

    $.get(distributionUrl || 'json/distribution.json', function(datas) {
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
              data: []
            })
          }

          _.each(statData.data, function(typeData) {
            var typeTotal = _.find(statTotal.data, { 
              type: typeData.type 
            });

            if (!typeTotal) {
              statTotal.data.push(typeTotal = {
                type: typeData.type,
                data: _.range(0, years.length, 0)
              });
            }

            typeTotal.data[i] = _.reduce(typeData.data, function(memo, value) {
              return memo + value;
            });
          });
        });
      });

      datas.unshift({
        year: 'All Years',
        data: yearly
      });
      
      this.setState({
        datas: datas,
        years: years
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
        typeData,
        statistics,
        types = [],
        self = this,
        state = this.state,
        datas = state.datas,
        toggledTypes = {},
        activeStatistic = this.getActive('statistic');

    data = _.find(datas, { year: year });

    // Populate statistic values
    statistics = _.pluck(data.data, 'statistic');

    if (!activeStatistic || _.indexOf(statistics, activeStatistic) == -1) {
      activeStatistic = statistics[0];
    }

    if (typeData = _.find(data.data, { statistic: activeStatistic })) {
      _.each(typeData.data, function(data, i) {
        types.push(data.type);
        self.setToggle('types', data.type, true);
      });
    }

    this.setActive('year', year);
    this.setActive('month', null);
    this.setActive('data', data);

    this.setState({
      statistics: statistics,
      types: types
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

  setToggle: function(group, name, value) {
    var toggle = this.state.toggle;

    if (_.isObject(toggle[group])) {
      toggle[group][name] = !!value;
      this.setState({ toggle: toggle });
    }
  },

  onToggle: function(group, name) {
    var toggle = this.state.toggle;

    if (_.isObject(toggle[group])) {
      toggle[group][name] = !toggle[group][name];
      this.setState({ toggle: toggle });
    }
  },

  getToggled: function(name) {
    return this.state.toggle[name];
  },
    
  onToggleAll: function(toggled) {
    _.each(this.state.types, function(type) {
      this.setToggle('types', type, toggled);
    }.bind(this));
  },

  getTopTen: function(type) {
    var state = this.state,
        activeMonth = this.getActive('month'),
        activeYear = this.getActive('year'),
        activeStatistic = this.getActive('statistic'),
        data, topTenData, topTenTime, tableBody;

    if (activeYear == 'All Years' || activeMonth == null) {
      data = _.find(state.topYearly, {
        statistic: activeStatistic
      });
    }
    else {
      data = _.find(state.topMonthly, { 
        statistic: activeStatistic
      });
    }

    if (data) {
      if (activeYear == 'All Years') {
        var years = state.years;

        if (activeMonth != null && years[activeMonth]) {
          topTenData = _.find(data.data, { year: years[activeMonth] });
          topTenTime = topTenData && topTenData.year;
        }
      }
      else {
        topTenData = _.find(data.data, { year: activeYear });

        if (activeMonth == null) {
          topTenTime = activeYear;
        }
        else {
          topTenData = _.find(topTenData.data, { month: activeMonth });
          topTenTime = monthLabels[activeMonth] + ', ' + activeYear;
        }
      }
    }

    if (topTenData && (topTenData = _.find(topTenData.data, { type: type }))) {
      topTenData = _.sortBy(topTenData.data, function(obj) {
        return -1 * parseFloat(obj['users']);
      }).slice(0, 10);

      tableBody = _.map(topTenData, function(data, i) {
        return (
          <tr key={i}>
            <td className="top-10-rank">{i + 1}</td>
            <td className="top-10-name">
              <a className="top-10-link">{data.id}</a><br />
              {data.name}
            </td>
            <td className="top-10-type">{type}</td>
            <td className="top-10-files">{data.files}</td>
            <td className="top-10-volume">{data.volume}</td>
            <td className="top-10-users">{data.users}</td>
          </tr>
        );
      });

      var onToggleTopTen = function(type, event) {
        var table = $('.top-10-table#' + type).toggle();

        if ($(event.target).is('.top-10-toggle')) {
          $(event.target).text(table.is(':visible') ? '-' : '+')
        }
      };

      return (
        <div className="top-10" key={type}>
          <div className="top-10-toggle" onClick={onToggleTopTen.bind(null, type)}>+</div>
          <div className="top-10-title">
            Top 10 Dataset for {type} by Users during {topTenTime}
          </div>

          <table className="top-10-table" id={type}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Tool</th>
                <th>Files</th>
                <th>Volume (GB)</th>
                <th>Users</th>
              </tr>
            </thead>

            <tbody>{tableBody}</tbody>
          </table>
        </div>
      );
    }
  },

  render: function() {
    var cx = React.addons.classSet,
        self = this,
        colors = [],
        state = this.state,
        datas = state.datas,
        types = state.types,
        statistics = state.statistics,
        datasets,
        xTicks,
        xLabel,
        yLabel;

    var activeData = this.getActive('data'),
        toggledTypes = this.getToggled('types'),
        activeMonth = this.getActive('month'),
        activeYear = this.getActive('year'),
        activeStatistic = this.getActive('statistic');

    if (activeData && (datasets = _.find(activeData.data, { statistic: activeStatistic }))) {
      // Create color scale for different types
      var colorScale = d3.scale.linear()
        .domain([0, activeData.data.length - 1])
        .range(['#1a345e', '#87a2c5']);

      xTicks = datasets.xtick ? datasets.xtick : monthLabels;

      if (datasets.yaxis) {
        yLabel = datasets.yaxis;
      }

      if (datasets.xaxis) {
        xLabel = datasets.xaxis;
      }

      // If type is not toggled, return zero filled array.
      datasets = _.map(datasets.data, function(dataset, i) {
        colors[i] = colorScale(i);

        if (toggledTypes[dataset.type]) {
          return dataset.data;
        }
        else {
          return _.range(0, dataset.data.length, 0);
        }
      });
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

    // Render the buttons for toggling types
    var typeControl = _.map(types, function(type, i) {
      var style = {};

      if (toggledTypes[type] && colors[i]) {
        style.backgroundColor = colors[i];
      }
      else {
        style.backgroundColor = '#ccc';
      }

      return (
        <li 
          className="control-legend"
          onClick={self.onToggle.bind(null, 'types', type)}
          key={i}>
            <div className="control-label" style={style}>{type}</div>
        </li>
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

    var topTenContents = _.map(toggledTypes, function(toggled, type) {
      if (toggled) {
        return self.getTopTen(type);
      }
    });

    var onBarClick = function(bar, i, stack) {
      self.setActive('month', i);
    };
    
    return (
      <div className="distribution">
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

        <div className="right-column distribution-chart">
          <div className="chart-container">
            <ChartStack 
              onBarClick={onBarClick}
              datasets={datasets}
              colors={colors}
              stackLabels={types}
              xTicks={xTicks}
              yLabel={yLabel}
              xLabel={xLabel}
              ref="chart" />
          </div>
        </div>
          
        <div className="left-column distribution-tools">
          <div className="type-controls">
            <div className="select-title-label">Select Tools</div>
            <div className="toggle-type">
              <span className="label" onClick={this.onToggleAll.bind(null, true)}>All</span>
              &nbsp;/&nbsp;
              <span className="label" onClick={this.onToggleAll.bind(null, false)}>None</span>
            </div>

            <ul className="control-legends">
              {typeControl}
            </ul>
          </div>
        </div>

        <div className="right-column distribution-topten">
          {topTenContents}
        </div>
        
        <div className="clear-fix"></div>
      </div>
    );
  }
});