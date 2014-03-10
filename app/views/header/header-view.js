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
        size: [window.innerWidth/this.options.scale,60], 
        properties: { backgroundColor: '#efefef' } 
    });

    this._add( surface );

    this.templates = {
    	score: "<label>Score </label> ",
    	moves: "<label>Moves left </label> "
    };

    this.score = new Surface({
    	size: [320, 40],
    	classes: ["header"],
    	properties: {textAlign:"center"}
    });

    this.moves = new Surface({
    	size: [320, 40],
    	classes: ["header"],
    	properties: {textAlign:"center"}
    });

    this._add(new Modifier({
    	transform:Transform.translate(-160,15,1), 
    	origin: [.5,0]
    })).add(this.moves);

    this._add(new Modifier({
    	transform:Transform.translate(160,15,1), 
    	origin: [.5,0]
    })).add(this.score);
    
}

HeaderView.prototype = Object.create( View.prototype );
HeaderView.prototype.constructor = HeaderView;
HeaderView.DEFAULT_OPTIONS = {}

HeaderView.prototype.update = function(values){
	this.score.setContent(this.templates.score + "<span>" + values.score + "</span>");
	this.moves.setContent(this.templates.moves + "<span>" + values.moves + "</span>");
}


module.exports = HeaderView;
