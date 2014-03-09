var View            = require('famous/view');
var Transform       = require('famous/transform');
var Surface         = require('famous/surface'); 
var Modifier        = require('famous/modifier');

var Timer           = require("famous/utilities/timer");
var Engine          = require("famous/engine");
var GenericSync     = require("famous/input/generic-sync");
var MouseSync       = require("famous/input/mouse-sync");
var TouchSync       = require("famous/input/touch-sync");
var Transitionable  = require("famous/transitions/transitionable");

var Board           = require("models/board-model");


function AppView() {
    View.apply(this, arguments);

    this.touchPos = [];
    this.anchors = [];

    _create.call(this);
    _calcOffsets.call(this);
}
AppView.prototype = Object.create(View.prototype);
AppView.prototype.constructor = AppView;
AppView.DEFAULT_OPTIONS = {};

function _create(){
    this._add(Board.boardView);


    //create syncs to handle updates
    this.touchPos = [0,0]
    this.sync = new GenericSync(function() {
        return this.touchPos;
    }.bind(this));
       

    _handleTouch.call(this);
}//end create

function _calcOffsets(){
    var boardWidth = Board.boardSize * this.options.scale;
    var dotWidth = Board.dotDiameter * this.options.scale;
    var gridWidth = Board.gridSize * this.options.scale;
    this.gridOffset = (boardWidth - 6*gridWidth);

    var topBaseOffset = 160 * this.options.scale + gridWidth + dotWidth/2;
    var leftBaseOffset = (window.innerWidth - boardWidth)/2 + this.gridOffset;

    this.topOffset = topBaseOffset;
    this.leftOffset = leftBaseOffset;

}

function _handleTouch() {
    Board.boardView.pipe(this.sync);

    //Board.boardView.on("touchstart", _anchorLine.bind(this));
    Board.boardView.on("mousedown", _anchorLine.bind(this));

    this.sync.on('start', _dragStart.bind(this));
    this.sync.on('update', _dragUpdate.bind(this));
    this.sync.on('end', _dragEnd.bind(this));
}

function _anchorLine(data){
    console.log("anchor start");
    var initPos = [data.x, data.y];
    var gridWidth = Board.gridSize * this.options.scale;

    var dotIndex = [
        Math.round((initPos[0] - this.leftOffset)/gridWidth),
        Math.round((initPos[1] - this.topOffset)/gridWidth)
    ];
    if(dotIndex[0] > -1 && dotIndex[0] < 6 && dotIndex[1] > -1 && dotIndex[1] < 6 ){
        this.anchors.push(dotIndex);
    }
}

function _dragStart(data){}

function _dragUpdate(data){
    
    console.log(data);
    this.touchPos = data.p;

    if(this.anchors.length > 0){
        debugger
        var anchor = this.anchors[this.anchors.length-1];
        var x = (Board.boardSize - 6 * Board.gridSize) + anchor[0] * Board.gridSize;
        var y = 160 + (Board.boardSize - 6 * Board.gridSize) +  anchor[1]* Board.gridSize+ 20;

        var context = Board.boardView.canvasSurface.getContext("2d");
        context.clearRect(0,0,640, 960);
        context.beginPath();
        context.moveTo(x,y);
        context.lineTo(x + data.p[0] / this.options.scale, y + data.p[1] / this.options.scale);
        context.lineWidth = 8;
        context.strokeStyle = Board.dots[anchor[1]][anchor[0]].options.color
        context.stroke();
    }//end if anchors
    
}

function _dragEnd(data){
    var velocity = data.v;
    var position = this.touchPos;

    console.log(position);

    //reset the touch position
    this.touchPos = [0,0];

    if(this.anchors.length == 1){
        this.anchors = [];
    }

    //TO Remove connected dots
}//end function

    
AppView.prototype.start = function(){
    Board.init();
    Board.drop();
}
    

module.exports = AppView;