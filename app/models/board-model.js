var EventHandler = require("famous/event-handler");
var Dot          = require("views/dot-view");
var BoardView    = require("views/board-view");
var Timer        = require("famous/utilities/timer");

var board = {

	initialized : false,
	dots : [[],[],[],[],[],[]],
	colors : ["red", "blue", "yellow", "purple", "green"],
	gridSize: 90,
	boardSize: 640,
	dotDiameter: 40,
	boardView: new BoardView()

};

board.init = function(){
	this.initialized = true;
	
	//wire up event in and out
	this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);

    


    //create the board
    for (var j = 0; j < 6; j++) {
        this.dots[j] = [];
        for (var i = 0; i < 6; i++) {
            var colorIndex = Math.round(Math.random() * 4);
            var color = this.colors[colorIndex];
            
            var dot = new Dot({x:i, y: j, color: color});

            dot.on("clicked", _dotclickedHandler.bind(this));
            this.dots[j].push(dot);
            this.boardView._add(dot);


            dot.pipe(this.boardView._eventOutput); 
        };
    };
}//end init


board.drop = function(){
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
    console.log(dotPointers);
    for (var i = 0; i < dotPointers.length; i++) {
        var dot = this.getDot(dotPointers[i]);
        dot.shrink();
    };
}



function _dotclickedHandler(){
	console.log("dot clicked");
}





module.exports = board;