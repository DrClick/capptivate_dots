var EventHandler = require("famous/event-handler");
var Dot          = require("views/dot-view");
var BoardView    = require("views/board-view");
var Timer        = require("famous/utilities/timer");

var board = {

	initialized : false,
	dots : [[],[],[],[],[],[]],
	colors : ["rgba(137,232,144,1)", "#975db5", "#89bbff", "#ea5d45", "#e7dd00"],
	gridSize: 90,
	boardSize: 640,
	dotDiameter: 40,
	boardView: new BoardView(),
    _eventInput: new EventHandler(),
    _eventOutput: new EventHandler(),
    firstDirtyRow : 5

};

board.init = function(){
	this.initialized = true;
	
	//wire up event in and out
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);


    //create the board
    for (var j = 0; j < 6; j++) {
        this.dots[j] = [];
        for (var i = 0; i < 6; i++) {
            var colorIndex = Math.round(Math.random() * 4);
            var color = this.colors[colorIndex];
            
            var dot = new Dot({x:i, y: j, color: color});

            this.dots[j].push(dot);
            this.boardView._add(dot);


            dot.pipe(this.boardView._eventOutput); 
        };
    };
}//end init


board.drop = function(){
	 //Load the board
    var currentRow = this.firstDirtyRow;

    var dropARow = function(){
        if(currentRow >= 0){
            for (var i = 0; i < 6; i++) {
                var dotToDrop = this.dots[currentRow][i];
                dotToDrop.drop();
            }
            currentRow--;
        }//end if in range
        else{
            Timer.clear(buildInterval);
        }
    };

    dropARow.call(this);
    var buildInterval = Timer.setInterval(dropARow.bind(this),80);
}//end drop

board.reset = function(){
	if(this.init){
	    for (var i = this.dots.length - 1; i >= 0; i--) {
	        for (var j = this.dots[i].length - 1; j >= 0; j--) {
	            this.dots[i][j].reset();
	        };
	    };
	}//end if initizlized
}//end reset

board.getConnectableNeighbors = function(position){
    var neighbors = [];
    var x = position[0];
    var y = position[1];
    var currentDot = this.dots[y][x];


    //only 4 ways to hit another dot, NSEW and same color
    if(x - 1 >= 0 && this.dots[y][x - 1].options.color == currentDot.options.color)
        {neighbors.push(this.dots[y][x - 1]);}//N
    if(x + 1 <= 5 && this.dots[y][x + 1].options.color == currentDot.options.color)
        {neighbors.push(this.dots[y][x + 1]);}//S
    if(y + 1 <= 5 && this.dots[y + 1][x].options.color == currentDot.options.color)
        {neighbors.push(this.dots[y + 1][x]);}//E
    if(y - 1 >= 0 && this.dots[y - 1][x].options.color == currentDot.options.color)
        {neighbors.push(this.dots[y - 1][x]);}//W

    return neighbors;
}

board.getDot = function(position){
    return this.dots[position[1]][position[0]];
}

board.score = function(dotPointers){
    var isSquare = this.determineIfSquare(dotPointers);
    var dotsToRemove = this.calculateWhichDotsToRemove(dotPointers, isSquare);

    //reset the first dirty row indicator. Thie keeps a pause from happening
    //while dropping
    this.firstDirtyRow = 0;


    //shrink them
    for (var i = dotsToRemove.length - 1; i >= 0; i--) {
        var dot = dotsToRemove[i];

        //update the first Dirty Row
        if(dot.options.y >= this.firstDirtyRow){this.firstDirtyRow = dot.options.y;}


        dot.shrink();
        _updateBoard.call(this, dot, isSquare);
    };

    this._eventOutput.emit("moveCompleted", dotsToRemove.length);



    //redrop the board 
    Timer.setTimeout(function(){
        this.drop();
    }.bind(this),0);
}

board.calculateWhichDotsToRemove = function(dotPointers, isSquare){

    //simple is to remove only the ones selected
    //more complicated is having to remove all of the ones of the same color
    //and anything contained in the square
    
    var dotsToRemove = [];

    if(isSquare){
        var color = this.getDot(dotPointers[0]).options.color;
        dotsToRemove = _getDotsByColor.call(this, color);
    }
    else{
        for (var i = 0; i < dotPointers.length; i++) {
            dotsToRemove.push(this.getDot(dotPointers[i]));
        }
    }

    return dotsToRemove;
}

board.determineIfSquare = function(dotPointers){
    var dotNumbers = _mapPointersToIndex(dotPointers);
    
    //http://jsperf.com/in-array-bit-setting
    //This method is faster than what I originally tried with setting bits
    var seenBefore = {};
    var isSquare = false;

    for (var i = 0; i < dotNumbers.length; i++) {
      var dot = dotNumbers[i];

      if (!seenBefore[dot]) {
        seenBefore[dot] = true;
      } else {
        isSquare = true;
        break;
      }
    }



    return isSquare;
}


board.showIsSquare = function(color){
    this.boardView.surface.setProperties({
        backgroundColor: color
    });
    this.boardView.modifier.setOpacity(.3);

    var dotsOfAColor = _getDotsByColor.call(this, color);
    
    for (var i = dotsOfAColor.length - 1; i >= 0; i--) {
        dotsOfAColor[i].boing();
    };

    if ("vibrate" in navigator) {
        navigator.vibrate("1000");
    }
}


board.clearIsSquare = function(){
    this.boardView.surface.setProperties({
        backgroundColor: "transparent"
    });
    this.boardView.modifier.setOpacity(1);
}


function _getDotsByColor(color){
    var dots = [];
    for (var i = this.dots.length - 1; i >= 0; i--) {
        for (var j = this.dots[0].length - 1; j >= 0; j--) {
            var dot = this.dots[i][j];
            if(dot.options.color == color){
                dots.push(dot);
            }
        }
    }

    return dots;
}

function _mapPointersToIndex(dotPointers){
    //takes an array of dot pointers and converts them to index (0-35)
    return dotPointers.map(function(point){ return point[1] * 6 + point[0]});
}

function _updateBoard(dot, isSquareUpdate){
    var dotRow = dot.options.y;
    var dotColumn = dot.options.x;

    //change the row of all dots above it
    for (var i = dotRow - 1; i >= 0; i--) {
        var dotToUpdate = this.dots[i][dotColumn];
        //update the dots property
        dotToUpdate.options.y++;

        //move it in the matrix
        this.dots[i+1][dotColumn] = dotToUpdate
    };

    //get a new random color, but if square update, dont allow
    //the same color
    var color = this.colors[Math.round(Math.random() * 4)];
    while(isSquareUpdate && color == dot.options.color){
        color = this.colors[Math.round(Math.random() * 4)];
    }

    dot.reset(dot.options.x, 0, color);
    this.dots[0][dotColumn] = dot;
}


module.exports = board;