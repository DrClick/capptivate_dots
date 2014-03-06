var View 				= require('famous/view');
var Transform 			= require('famous/transform');
var Surface 			= require('famous/surface'); 
var Modifier 			= require('famous/modifier');
var WallTransition  	= require("famous/transitions/wall-transition")

/*
 *  @constructor
 *  @name EmptyView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function Dot () {
    View.apply(this, arguments);
	
	_create.call(this); 
}

Dot.prototype = Object.create( View.prototype );
Dot.prototype.constructor = Dot;
Dot.DEFAULT_OPTIONS = {}


function _create(){
    this.surface = new Surface({
        classes: ["dot"],
        size: [50, 50],
        properties: {
            borderRadius: "25px",
            backgroundColor: "pink"
        }
    });

    this.modifier = new Modifier({
        origin: [.5,.5],
        transform: Transform.translate(0,0,0)
    });

    this._add(this.modifier).add(this.surface);
}//end create



Dot.prototype.events = function () {

    Engine.on('resize', this.resize.bind(this));
    return this;

}

Dot.prototype.unbindEvents = function () {
    
}

Dot.prototype.resize = function () {
    return this;
}

module.exports = Dot;
