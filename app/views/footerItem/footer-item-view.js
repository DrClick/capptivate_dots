var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');

/*
 *  @constructor
 *  @name FooterItemView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function FooterItemView () {
    View.apply(this, arguments);

    var surface = new Surface({ 
        size: [100,100], properties: { backgroundColor: 'white' } 
    });

    this.node.add( surface );
    
}

FooterItemView.prototype = Object.create( View.prototype );
FooterItemView.prototype.constructor = FooterItemView;

FooterItemView.DEFAULT_OPTIONS = {}

FooterItemView.prototype.events = function () {

    Engine.on('resize', this.resize.bind(this));
    return this;

}

FooterItemView.prototype.unbindEvents = function () {
    
}

FooterItemView.prototype.resize = function () {
    return this;
}

module.exports = FooterItemView;
