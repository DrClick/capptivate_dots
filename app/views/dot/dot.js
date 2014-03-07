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
    	yellow: "#e7dd00",
	};

	this.visible = false;
	this.position = new Transitionable(this.options.stage);
	this.highlightScale = new Transitionable(1);
	
	_create.call(this); 
}

Dot.prototype = Object.create( View.prototype );
Dot.prototype.constructor = Dot;
Dot.DEFAULT_OPTIONS = {
	stage: 0,
	grid: 90,
	board: 640,
	baseAnimationTime: 100,
	diameter: 40,
	highlightScale: 2.5,
	highlightDuration: 400
};


function _create(){
    this.surface = new Surface({
        classes: ["dot"],
        size: [this.options.diameter, this.options.diameter],
        properties: {
            borderRadius: this.options.diameter/2 + "px",
            backgroundColor: this.colors[this.options.color]
        }
    });

    this.highlightSurface = new Surface({
        classes: ["dot"],
        size: [this.options.diameter, this.options.diameter],
        properties: {
            borderRadius: this.options.diameter/2 + "px",
            backgroundColor: this.colors[this.options.color]
        }
    });


    this.surface.on("mousedown", _clickHandler.bind(this));
    this.surface.on("touchstart", _clickHandler.bind(this));

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

function _clickHandler(evt){
	console.log(evt);
	this._eventOutput.emit("clicked");

	this.highlightScale.set(this.options.highlightScale,{duration: this.options.highlightDuration});	
}


function _calcOffset(index, verticle){
	var top = verticle ? 120 : -this.options.board/2;
	var grid_base = (this.options.board - (this.options.grid * 6));
	return top + grid_base + (index * this.options.grid);
}


Dot.prototype.reset = function(){
	this.position.set(0);
	this.visible = false;
}

Dot.prototype.render = function(){
	var spec = [];

	if(this.visible){
		var position = this.position.get();
		//check that it has not run past its bounds
		if(position > this.offset){
			position = this.offset;
		}

		//add the dot
		spec.push({
			transform : Transform.translate(this.x, position, 3),
			target : this.surface.render(),
			origin: [.5,0]
		});

		if(position == this.offset){
			//add the highlight
			var highlightScale = this.highlightScale.get();
			if(highlightScale != this.options.highlightScale){
				var highlightPos = position - (highlightScale * this.options.diameter - this.options.diameter)/2;
				spec.push({
					transform : Transform.multiply(
						Transform.translate(this.x, highlightPos, 2),
						Transform.scale(highlightScale,highlightScale,1)),
					target : this.highlightSurface.render(),
					opacity: 1/ (1.5 * highlightScale),
					origin: [.5,0]
				});
			}//end if not expanded
			else{
				this.highlightScale.set(0);
			}
		}

	}//end if visible

	return spec;
}

module.exports = Dot;
