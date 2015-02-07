/*global d3:false */
'use strict';

var React = require('react');
var Feed = require('utils/feed');
var Tabs = require('utils/tabs');

var Archive = require('tabs/archive');
var Distribution = require('tabs/distribution');
var Web = require('tabs/web');
var $ = require('jquery');

$(function() {
	React.render(
		<Tabs>
			<Distribution tab="Data Distribution" />
			<Archive tab="Data Archive" />
			<Web tab="Web Statistics" />
	  </Tabs>,
	  document.getElementById('react-container')
	);
});