var View 				= require('famous/view');
var Transform 			= require('famous/transform');
var Surface 			= require('famous/surface'); 
var Modifier 			= require('famous/modifier');
var Transitionable  	= require("famous/transitions/transitionable");
var WallTransition  	= require("famous/transitions/wall-transition");


/*
 *  @constructor
 *  @name EmptyView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function Dot () {
    View.apply(this, arguments);
    this.colors = {
    	green: "#89e88f",
    	purple: "#975db5",
    	blue: "#89bbff",
    	red: "#ea5d45",
    	yellow: "#e7dd00"
	};

	this.visible = false;
	this.position = new Transitionable(this.options.stage);
	
	_create.call(this); 
}

Dot.prototype = Object.create( View.prototype );
Dot.prototype.constructor = Dot;
Dot.DEFAULT_OPTIONS = {
	stage: 0,
	grid: 90,
	board: 640,
	baseAnimationTime: 100
};


function _create(){
    this.surface = new Surface({
        classes: ["dot"],
        size: [40, 40],
        properties: {
            borderRadius: "20px",
            backgroundColor: this.colors[this.options.color]
        }
    });

    this.x = _calcOffset.call(this, this.options.x, false);
   
}//end create

Dot.prototype.drop = function(index){
	this.offset = _calcOffset.call(this, index, true);
	var duration = this.options.baseAnimationTime * index;

	this.visible = true;


	this.position.set(this.offset, 
		{
            method: 'wall',
            period: 200,
            dampingRatio: .3,
            restitution: .7
    	}
    );	
}


function _calcOffset(index, verticle){
	var top = verticle ? 120 : -this.options.board/2;
	var grid_base = (this.options.board - (this.options.grid * 6));
	return top + grid_base + (index * this.options.grid);
}

Dot.prototype.events = function () {

    Engine.on('resize', this.resize.bind(this));
    return this;

}

Dot.prototype.unbindEvents = function () {
    
}

Dot.prototype.resize = function () {
    return this;
}

Dot.prototype.render = function(){
	if(this.visible){
		var position = this.position.get();
		//check that it has not run past its bounds
		if(position > this.offset){
			position = this.offset;
		}
		return {
			transform : Transform.translate(this.x, position, 0),
			target : this.surface.render(),
			origin: [.5,0]
		};
	}//end if visible
}

module.exports = Dot;
