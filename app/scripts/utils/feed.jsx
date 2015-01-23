'use strict';

(function() {
  var _ = require('lodash');

  var bump = function(d) {
    var x = 1 / (0.1 + Math.random()),
        y = 2 * Math.random() - 0.5,
        z = 10 / (0.1 + Math.random()),
        n = d.length;

    for (var i = 0; i < n; i++) {
      var w = (i / n - y) * z;
      d[i] += x * Math.exp(-w * w);
    }

    return d;
  };

  var Feed = function(min, max) {
    this.min = typeof min !== "undefined" && min != null ? min : 0;
    this.max = typeof max !== "undefined" && max != null ? max : 10;
  };

  Feed.prototype.generate = function(n) {
    var d = [], i, 
        r = this.max - this.min,
        m = this.min;

    for (i = 0; i < n; ++i) {
      d[i] = r * Math.random() + m;
    }

    return d;
  };


  Feed.prototype.statistic = function(type) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var volume = this.generate(12);
    var users = this.generate(12);
    var files = this.generate(12);

    var datas = _.map(months, function(month, i) {
      return {
        "month": month,
        "volume": volume[i],
        "users": users[i] * 2,
        "files": files[i]
      };
    });

    return {
      "type": type,
      "data": datas
    };
  };

  module.exports = Feed;
})();