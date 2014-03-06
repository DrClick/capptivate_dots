var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');
var WallTransition  = require("famous/transitions/wall-transition")


function AppView() {
    View.apply(this, arguments);
    _create.call(this);
}
AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;
AppView.DEFAULT_OPTIONS = {};

function _create(){
    this.surface = new Surface({
        classes: ["dot"],
        size: [50, 50],
        properties: {
            borderRadius: "25px",
            backgroundColor: "pink"
        }
    });

    this.modifier = new Modifier({
        origin: [.5,.5]
    });

    this._add(this.modifier).add(this.surface);
}//end create
    

module.exports = AppView;