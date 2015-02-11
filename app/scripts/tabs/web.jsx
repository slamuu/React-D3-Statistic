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

      colors: [],
      types: [],

      active: {
        data: null,
        month: null,
        year: 'All Years'
      },

      toggle: {
        types: {},
      }
    };
  },
  
  componentWillMount: function() {
    var webUrl = Drupal && Drupal.statistics && Drupal.statistics.web;

    $.get(webUrl || 'json/web.json', function(datas) {
      var years = _.pluck(datas, 'year'),
          yearly = [];
     	
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
        typeData,
        types = [],
        self = this,
        state = this.state,
        datas = state.datas,
        toggledTypes = {};

    data = _.find(datas, { year: year });

    if (data) {
      _.each(data.data, function(data, i) {
        types.push(data.type);
        self.setToggle('types', data.type, true);
      });
    }

    this.setActive('year', year);
    this.setActive('data', data);
    
    this.setState({
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

  render: function() {
    var cx = React.addons.classSet,
        self = this,
        colors = [],
        state = this.state,
        datas = state.datas,
        types = state.types,
        datasets,
        xTicks,
        xLabel,
        yLabel;

    var activeData = this.getActive('data'),
        toggledTypes = this.getToggled('types'),
        activeYear = this.getActive('year');

    if (activeData) {
      // Create color scale for different types
      var colorScale = d3.scale.linear()
        .domain([0, activeData.data.length - 1])
        .range(['#1a345e', '#87a2c5']);

      xTicks = activeData.xtick ? activeData.xtick : monthLabels;

      if (activeData.yaxis) {
        yLabel = activeData.yaxis;
      }

      if (activeData.xaxis) {
        xLabel = activeData.xaxis;
      }

      // If type is not toggled, return zero filled array.
      datasets = _.map(activeData.data, function(dataset, i) {
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
    
    var onChangeYear = function(event) {
      self.setYear(event.target.value);
    };
    
    return (
      <div className="web">
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
              <li className="control-legend active">
                <div className="control-label">Users</div>
              </li>
            </ul>
          </div>
        </div>

        <br />

        <div className="right-column web-chart">
          <div className="chart-container">
            <ChartStack 
              datasets={datasets}
              colors={colors}
              stackLabels={types}
              xTicks={xTicks}
              yLabel={yLabel}
              xLabel={xLabel}
              ref="chart" />
          </div>
        </div>

        <div className="left-column web-tools">
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
        
        <div className="clear-fix"></div>
      </div>
    );
  }
});