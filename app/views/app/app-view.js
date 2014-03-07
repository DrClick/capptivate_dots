var View            = require('famous/view');
var Transform       = require('famous/transform');
var Surface         = require('famous/surface'); 
var Modifier        = require('famous/modifier');

var Timer           = require("famous/utilities/timer");
var Engine          = require("famous/engine");

var Board           = require("models/board-model");


function AppView() {
    View.apply(this, arguments);
    _create.call(this);
}
AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;
AppView.DEFAULT_OPTIONS = {};

function _create(){
    this.surface = new Surface({
        classes: ["game"],
        size: [640, 960]
    });

    this.modifier = new Modifier({
        origin: [.5,.5],
        size: [640, 960],
        transform: Transform.translate(0, 100, 1)

    });

    this._add(this.modifier).add(this.surface);

    


    this._add(Board.boardView);
    Board.init();
    Board.drop();

 

}//end create


    

module.exports = AppView;