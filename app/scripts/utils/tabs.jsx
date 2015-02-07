'use strict';

var React = require('react/addons');

module.exports = React.createClass({
  getDefaultProps: function() {
    return {
    	active: 0
    };
  },

  getInitialState: function() {
  	return {
  		active: 0
  	};
  },

  componentWillReceiveProps: function(nextProps) {
  	if ('active' in nextProps) {
  		this.setState({
  			active: nextProps.active
  		});
  	}
  },
  
  setTab: function(i) {
  	this.setState({ active: i });
  },

  render: function() {
  	var self = this,
  			cx = React.addons.classSet,
  			active = this.state.active,
  			children = this.props.children,
  			links = [],
  			panes = [];

  	React.Children.forEach(children, function(child, i) {
  		var tab;

  		if (tab = child.props.tab) {
	  		var linkClasses = cx({
	  			'tab-link': true,
	  			'active': active == i
	  		});

	  		var paneClasses = cx({
	  			'tab-pane': true,
	  			'hidden': active != i
	  		});

        var onClick = function(event) {
          event.preventDefault();
          self.setTab(i);
        };

	  		panes.push(<div className={paneClasses} key={i}>{child}</div>);
	  		links.push(<span className={linkClasses} key={i} onClick={onClick}>{tab}</span>);
	  	}
  	});

    return (
      <div className="tabs">
      	<div className="tab-links">{links}</div>
        <div className="tab-panes">{panes}</div>
      </div>
    );
  }
});