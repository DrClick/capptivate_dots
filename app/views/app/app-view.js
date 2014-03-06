var View            = require('famous/view');
var Transform       = require('famous/transform');
var Surface         = require('famous/surface'); 
var Modifier        = require('famous/modifier');
var Dot             = require("views/dot-view");
var Timer           = require("famous/utilities/timer");

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

    var colors = ["red", "blue", "yellow", "purple", "green"];



    var colorIndex = Math.round(Math.random() * 4);
    var color = colors[colorIndex];
    

    //create the board
    this.dots = [];
    for (var j = 0; j < 6; j++) {
        this.dots[j] = [];
        for (var i = 0; i < 6; i++) {
            var colorIndex = Math.round(Math.random() * 4);
            var color = colors[colorIndex];
            
            var dot = new Dot({x:i, color: color});
            this.dots[j].push(dot);
            this._add(dot); 
        };
    };

    
    //Load the board
    var currentRow = 5;
    var buildInterval = Timer.setInterval(
        function(){
            if(currentRow >= 0){
                for (var i = 0; i < 6; i++) {
                    this.dots[currentRow][i].drop(currentRow);
                }
                currentRow--;
            }//end if in range
            else{
                Timer.clear(buildInterval);
            }
        }.bind(this),100);

}//end create
    

module.exports = AppView;