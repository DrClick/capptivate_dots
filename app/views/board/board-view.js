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

    var surface = new Surface({ 
        size: [100,100], properties: { backgroundColor: 'white' } 
    });

    this.node.add( surface );
    
}

BoardView.prototype = Object.create( View.prototype );
BoardView.prototype.constructor = BoardView;

BoardView.DEFAULT_OPTIONS = {}

BoardView.prototype.events = function () {

    Engine.on('resize', this.resize.bind(this));
    return this;

}

BoardView.prototype.unbindEvents = function () {
    
}

BoardView.prototype.resize = function () {
    return this;
}

module.exports = BoardView;
