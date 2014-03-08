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

    //calc the closest dot and the distance to that dot
    var initPos = [data.x, data.y];
    var boardWidth = Board.boardSize * this.options.scale;
    var dotWidth = Board.dotDiameter * this.options.scale;
    var gridWidth = Board.gridSize * this.options.scale;
    var gridOffset = (boardWidth - 6*gridWidth);

    var topBaseOffset = (160 + gridWidth + dotWidth/2) * this.options.scale;
    var leftBaseOffset = (window.innerWidth - boardWidth)/2 + gridOffset;

    var topOffset = topBaseOffset;
    var leftOffset = leftBaseOffset;

    var dotIndex = [
        Math.round((initPos[0] - leftOffset)/gridWidth),
        Math.round((initPos[1] - topOffset)/gridWidth)
    ];

   
    
    this.anchors.push(dotIndex);

}

function _dragStart(data){}

function _dragUpdate(data){
    
    console.log(data);
    this.touchPos = data.p;
    
    //TODO: hit dots
    //TODO: draw vector
}

function _dragEnd(data){
    var velocity = data.v;
    var position = this.touchPos;

    console.log(position);

    //TO Remove connected dots
}//end function

    
AppView.prototype.start = function(){
    Board.init();
    Board.drop();
}
    

module.exports = AppView;