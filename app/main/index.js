require("famous/polyfills");

//famous
var FamousEngine 	= require("famous/engine");
var Surface 		= require("famous/surface");
var Modifier 		= require("famous/modifier");
var Transform       = require("famous/transform");

var Transitionable = require('famous/transitions/transitionable');
var SpringTransition = require('famous/transitions/spring-transition');
var WallTransition = require('famous/transitions/wall-transition');

Transitionable.registerMethod('spring', SpringTransition);
Transitionable.registerMethod('wall', WallTransition);

//Views
var AppView = require("views/app-view");

var context = FamousEngine.createContext();


//create the base modifier
var scaleX = window.innerHeight / 960;
var scaleY = window.innerWidth / 640;
var scale = Math.min(scaleX, scaleY);


var modifier = new Modifier({
    origin		: [0.5, 0.5],
    size 		: [640, 960],
    transform   : Transform.scale(scale, scale, 1) 
});

var appView = new AppView({scale: scale});




context.add(modifier).add(appView);

appView.start();
