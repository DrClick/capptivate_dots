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
        size: [window.innerWidth/this.options.scale,120], properties: { backgroundColor: '#efefef' } 
    });

    this._add( surface );

    this.power_1 = new Surface({
    	size: [213.33, 120],
    	classes: ["footer"],
    	content: "0",
    	properties: {
    		backgroundImage: "url('/original_project/app/views/footer/dots_power_1.png')"
    	}
    });

    this.power_2 = new Surface({
    	size: [213.33, 120],
    	classes: ["footer"],
    	content: "0",
    	properties: {
    		backgroundImage: "url('/original_project/app/views/footer/dots_power_2.png')"
    	}
    });

    this.power_3 = new Surface({
    	size: [213.33, 120],
    	classes: ["footer"],
    	content: "0",
    	properties: {
    		backgroundImage: "url('/original_project/app/views/footer/dots_power_3.png')"
    	}
    });

    this._add(new Modifier({
    	transform:Transform.translate(-173.33,45,1), 
    	origin: [.5,1]
    })).add(this.power_1);

    this._add(new Modifier({
    	transform:Transform.translate(40,45,1), 
    	origin: [.5,1]
    })).add(this.power_2);

    this._add(new Modifier({
    	transform:Transform.translate(253.33,45,1), 
    	origin: [.5,1]
    })).add(this.power_3);
    
}

FooterView.prototype = Object.create( View.prototype );
FooterView.prototype.constructor = FooterView;
FooterView.DEFAULT_OPTIONS = {}

module.exports = FooterView;
