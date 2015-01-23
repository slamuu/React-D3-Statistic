'use strict';

var React = require('react');
var d3 = require('d3');
var _ = require('lodash');

module.exports = {
  animate: function(target, duration, easing, complete) {
    var self = this,
        state = this.state,
        interpolators = {};

    if (_.isFunction(duration)) {
      complete = duration;
      duration = null;
    }
    else if (_.isFunction(easing)) {
      complete = duration;
      easing = null;
    }

    _.forOwn(target, function(value, key) {
      if (_.isFunction(value)) {
        interpolators[key] = value;
      } else {
        interpolators[key] = d3.interpolate(state[key], value);
      }
    });

    var transition = d3.select(this.getDOMNode()).transition();

    if (duration) {
      transition.duration(duration);
    }

    if (easing) {
      transition.ease(easing);
    }

    transition
      .tween(target, function() {
        return function(t) {
          if (self.isMounted()) {
            self.setState(_.mapValues(interpolators, function(interpolator, key) {
              return interpolator(t);
            }));
          }
        };
      });

    if (_.isFunction(complete)) {
      transition.each('end', complete.bind(self));
    }
    
    return transition;
  }
};
