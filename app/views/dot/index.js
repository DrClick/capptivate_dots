var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');

/*
 *  @constructor
 *  @name EmptyView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function EmptyView () {
    View.apply(this, arguments);

    var surface = new Surface({ 
        size: [100,100], properties: { backgroundColor: 'white' } 
    });

    this.node.add( surface );
    
}

EmptyView.prototype = Object.create( View.prototype );
EmptyView.prototype.constructor = EmptyView;

EmptyView.DEFAULT_OPTIONS = {}

EmptyView.prototype.events = function () {

    Engine.on('resize', this.resize.bind(this));
    return this;

}

EmptyView.prototype.unbindEvents = function () {
    
}

EmptyView.prototype.resize = function () {
    return this;
}

module.exports = EmptyView;
