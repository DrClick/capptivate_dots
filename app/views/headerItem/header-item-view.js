var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');

/*
 *  @constructor
 *  @name HeaderItemView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function HeaderItemView () {
    View.apply(this, arguments);

    var surface = new Surface({ 
        size: [100,60], properties: { backgroundColor: 'white' } 
    });

    this.node.add( surface );
    
}

HeaderItemView.prototype = Object.create( View.prototype );
HeaderItemView.prototype.constructor = HeaderItemView;
HeaderItemView.DEFAULT_OPTIONS = {}


module.exports = HeaderItemView;
