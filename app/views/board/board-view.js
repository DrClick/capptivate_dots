var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');
var CanvasSurface = require('famous/surfaces/canvas-surface');

/*
 *  @constructor
 *  @name BoardView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function BoardView () {
    View.apply(this, arguments);
    _create.call(this);
}
BoardView.prototype = Object.create( View.prototype );
BoardView.prototype.constructor = BoardView;
BoardView.DEFAULT_OPTIONS = {}

function _create(){
    this.surface = new Surface({
        classes: ["game"],
        properties: {
            border: "solid 1px blue"
        }
    });

    this.modifier = new Modifier({
        transform: Transform.translate(0, 0, 2)
    });
    this._add(this.modifier).add(this.surface);
    
    
	this.canvasModifier = new Modifier({
        transform: Transform.translate(0, 0, -1),
        origin: [0,0]
    });
    this.canvasSurface = new CanvasSurface({
    	size: [640,960],
    	properties: {position:"absolute"} //WHY did I have to do this?
    });
    this._add(this.canvasModifier).add(this.canvasSurface);

    this.surface.pipe(this._eventOutput);
 
}

module.exports = BoardView;
