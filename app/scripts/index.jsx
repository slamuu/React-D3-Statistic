/*global d3:false */
'use strict';

var React = require('react');
var Feed = require('utils/feed');
var Tabs = require('utils/tabs');

var Archive = require('tabs/archive');
var Distribution = require('tabs/distribution');

var types = ["Type 1", "Type 2", "Type 3", "Type 4"];
var feed = new Feed(3, 10);
var feed2 = new Feed(10, 20);
var data = [];

var stats = {
	distribution: ["Stat 1", "Stat 2", "Stat 3"],
	archive: ["Stat 1", "Stat 2"]
};

for (var i = 0; i < types.length; i++) {
  data.push(feed.statistic(types[i]));
}

console.log(data); 

React.render(
	<Tabs>
		<Distribution tab="Distribution" data={data} statistics={stats.distribution} />
		<Archive tab="Archive" data={data} statistics={stats.archive} />
  </Tabs>,
  document.getElementById('react-container')
);