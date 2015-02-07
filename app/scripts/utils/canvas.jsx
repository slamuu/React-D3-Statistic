'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <svg preserveAspectRatio="xMinYMin meet" viewBox={'0 0 ' + this.props.width + ' ' + this.props.height}>
        {this.props.children}
      </svg>
    );
  }
});