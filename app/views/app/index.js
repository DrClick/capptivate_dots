var View            = require('famous/view');
var Transform       = require('famous/transform');
var Surface         = require('famous/surface'); 
var Modifier        = require('famous/modifier');

var Dot             = require("views/dot-view");

function AppView() {
    View.apply(this, arguments);
    _create.call(this);
}
AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;
AppView.DEFAULT_OPTIONS = {};

function _create(){
    this.surface = new Surface({
        classes: ["board"],
        size: [640, 640],
        properties: {
            border: "solid 1px white"
        }
    });

    this.modifier = new Modifier({
        origin: [.5,.5],
        size: [640, 640]
    });

    this._add(this.modifier).add(this.surface);


    var dot = new Dot();
    this._add(dot);

}//end create
    

module.exports = AppView;