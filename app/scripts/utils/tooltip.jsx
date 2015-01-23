'use strict';

var React = require('react');
var Animate = require('utils/animate');
var $ = require('jquery');

module.exports = React.createClass({
  mixins: [Animate],

  getInitialState: function() {
    return {
      visible: false,
      x: 0, 
      y: 0
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var elem = $(this.getDOMNode()),
        height = elem.outerHeight(),
        width = elem.outerWidth();

    elem.css({
      'margin-top': -height - 5,
      'margin-left': -width / 2,
    });
  },
  
  setPosition: function(props) {
    this.animate({
      x: props.x,
      y: props.y
    });
  },
  
  onShow: function() {
    if (!this.state.visible) {
      this.setState({ visible: true });
    }
  },
  
  onHide: function() {
    if (this.state.visible) {
      this.setState({ visible: false });
    }
  },
  
  render: function() {
    var styles = {
      top: (this.state.y || 0) + 'px',
      left: (this.state.x || 0) + 'px',
      display: this.state.visible ? 'block' : 'none'
    };
    
    return (
      <div 
        className="tooltip"
        style={styles}>
          {this.props.children}
      </div>
    );
  }
});