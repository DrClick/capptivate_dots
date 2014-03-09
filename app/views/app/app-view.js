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
    
    this.touchPos = data.p;

    
    //attach line to anchor
    if(this.anchors.length > 0){

        var anchor = this.anchors[this.anchors.length-1];
        var currentDot = Board.dots[anchor[1]][anchor[0]];
        var currentDotCenter = _getCenterOfDot(currentDot);
        var neighbors = Board.getConnectableNeighbors(anchor);

        
        //this is the input length scaled to the scene
        var scaledX = this.touchPos[0] / this.options.scale;
        var scaledY = this.touchPos[1] / this.options.scale;

        for (var i = neighbors.length - 1; i >= 0; i--) {
            var neighbor = neighbors[i];
            var centerOfNeighbor = _getCenterOfDot(neighbor);

            var delta = {
                x: centerOfNeighbor.x - (currentDotCenter.x + scaledX),
                y: centerOfNeighbor.y - (currentDotCenter.y + scaledY)
            }
            var distance = Math.sqrt(Math.pow(delta.x,2) + Math.pow(delta.y,2));

            
            if (distance < Board.dotDiameter * .8){
                neighbor.boing();

                var isBackTracking = false;
                //check to see if the user is unwinding
                if(this.anchors.length >= 2){
                    var previousDot = Board.getDot(this.anchors[this.anchors.length -2]);
                    if(previousDot.options.x == neighbor.options.x &&
                        previousDot.options.y == neighbor.options.y){
                        isBackTracking = true;
                        //cut off the latest anchor
                        this.anchors.pop();
                    }
                }

                if(!isBackTracking){
                    //reanchor to the new dot
                    this.anchors.push([neighbor.options.x, neighbor.options.y]);
                }
                
                console.log("delta", delta);
                console.log("currentPos", this.touchPos);
                console.log("neighbor", neighbor);

                this.touchPos = [-delta.x * this.options.scale, -delta.y * this.options.scale];
                
                scaledX = this.touchPos[0] / this.options.scale;
                scaledY = this.touchPos[1] / this.options.scale;
            }
        };


            
            //reload all the variables in case a new dot was anchored
            anchor = this.anchors[this.anchors.length-1];
            if (!anchor) {return;}
            currentDot = Board.dots[anchor[1]][anchor[0]];
            currentDotCenter = _getCenterOfDot(currentDot);


            var context = Board.boardView.canvasSurface.getContext("2d");
            context.clearRect(0,0,640, 960);

        
            for (var i = 0; i < this.anchors.length-1; i++) {
                var a = Board.getDot(this.anchors[i]);
                var b = Board.getDot(this.anchors[i + 1]);

                console.log("a", a.x, a.offset);
                console.log("b", b.x, b.offset);

                context.beginPath();
                context.moveTo(a.x + 320, a.offset + 20);
                context.lineTo(b.x + 320, b.offset + 20);
                context.lineWidth = 8;
                context.strokeStyle = currentDot.options.color
                context.stroke();
            };


            context.beginPath();
            context.moveTo(currentDotCenter.x, currentDotCenter.y);
            context.lineTo(currentDotCenter.x + scaledX, currentDotCenter.y + scaledY);
            context.lineWidth = 8;
            context.strokeStyle = currentDot.options.color
            context.stroke();
    }//end if anchors
    
}

function _getCenterOfDot(dot){
    return {x: dot.x + Board.boardSize/2, y: dot.offset + Board.dotDiameter/2};
}



function _dragEnd(data){
    //reset the touch position
    this.touchPos = [0,0];
    
    var context = Board.boardView.canvasSurface.getContext("2d");
    context.clearRect(0,0,640, 960);
    
    if(this.anchors.length >= 2){
        Board.score(this.anchors);
    }


    this.anchors = [];

    //TO Remove connected dots
}//end function

    
AppView.prototype.start = function(){
    Board.init();
    Board.drop();
}
    

module.exports = AppView;