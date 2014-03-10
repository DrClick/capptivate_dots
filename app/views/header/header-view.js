var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');

/*
 *  @constructor
 *  @name HeaderView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function HeaderView () {
    View.apply(this, arguments);

    var surface = new Surface({ 
        size: [window.innerWidth,60], properties: { backgroundColor: '#efefef' } 
    });

    this._add( surface );
    
}

HeaderView.prototype = Object.create( View.prototype );
HeaderView.prototype.constructor = HeaderView;
HeaderView.DEFAULT_OPTIONS = {}


module.exports = HeaderView;
