require("famous/polyfills");

//famous
var FamousEngine 	= require("famous/engine");
var Surface 		= require("famous/surface");
var Modifier 		= require("famous/modifier");
var Transform       = require("famous/transform");

//Views
var AppView = require("views/app-view");

var context = FamousEngine.createContext();


//create the base modifier
var scaleX = window.innerHeight / 960;
var scaleY = window.innerWidth / 640;
var scale = Math.min(scaleX, scaleY);
console.log(scale);
var modifier = new Modifier({
    origin		: [0.5, 0.5],
    //transform   : Transform.scale(scale, scale, 0) 
});

var appView = new AppView();


context.add(appView);
