var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface'); 
var Modifier = require('famous/modifier');

/*
 *  @constructor
 *  @name FooterView
 *  @extends {@link View}
 *  @description
 *      overwrite me.
 */
function FooterView () {
    View.apply(this, arguments);

   var surface = new Surface({ 
        size: [window.innerWidth,60], properties: { backgroundColor: '#efefef' } 
    });

    this._add( surface );
    
}

FooterView.prototype = Object.create( View.prototype );
FooterView.prototype.constructor = FooterView;
FooterView.DEFAULT_OPTIONS = {}

module.exports = FooterView;
