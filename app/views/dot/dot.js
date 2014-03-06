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
	stage: -350,
	grid: 90,
	board: 640,
	baseAnimationTime: 500
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

    this.x = _calcOffset.call(this, this.options.x);
   
}//end create

Dot.prototype.drop = function(index){
	var offset = _calcOffset.call(this, index);
	var duration = this.options.baseAnimationTime;

	this.visible = true;


	this.position.set(offset, 
		{
            method: 'wall',
            period: 400,
            dampingRatio: .3,
            restitution: .8
    	}
    );

	//  this.modifier.setOpacity(1);
	// // this.modifier.setTransform(
	// // 	Transform.translate(this.x, offset-this.options.grid, 0),
	// // 	{duration: duration},
	// // 	function(){

	// 		this.modifier.setTransform(
	// 			Transform.translate(this.x, offset, 0), 
	// 			{
	// 		            method: 'wall',
	// 		            period: 400,
	// 		            dampingRatio: 0
		        	
	// 	        }
	// 	    );
	// // 	}.bind(this)
	// // );
	
}


function _calcOffset(index){
	var top = -this.options.board/2;
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
		return {
			transform : Transform.translate(this.x, position, 0),
			target : this.surface.render(),
			origin: [.5,.5]
		};
	}//end if visible
}

module.exports = Dot;
