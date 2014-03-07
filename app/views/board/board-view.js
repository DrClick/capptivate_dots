var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');

/*
 *  @constructor
 *  @name BoardView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function BoardView () {
    View.apply(this, arguments);

    _create.bind(this);
}
BoardView.prototype = Object.create( View.prototype );
BoardView.prototype.constructor = BoardView;
BoardView.DEFAULT_OPTIONS = {}

function _create(){
    this.surface = new Surface({
        classes: ["game"],
        size: [640, 960],
        properties: {
            border: "solid 1px white"
        }
    });

    this.modifier = new Modifier({
        origin: [.5,.5],
        size: [640, 960],
        transform: Transform.translate(0, 0, 2)

    });

    this._add(this.modifier).add(this.surface);
}

module.exports = BoardView;
