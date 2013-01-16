db.util = {};

/**
	Given an integer, return the RGB color representation
*/
db.util.getRGB = function(hex) {
	var obj = {};
	obj.r = (hex & 0xFF0000) >> 16;
	obj.g = (hex & 0x00FF00) >> 8;
	obj.b = (hex & 0x0000FF);
	return obj;
};

/**
	Given an object with r, g, and b properties, return the hex color representation
*/
db.util.getHex = function(rgb) {
	var color = 0x000000;
	color += rgb.r << 16;
	color += rgb.g << 8;
	color += rgb.b;
	return color;
};

/**
	Easing function for decelleration etc
*/
db.util.exponentialEaseOut = function (k) {
	return k === 1 ? 1 : - Math.pow(2, - 10 * k) + 1;
};

/**
	Return a function that will animate a color
*/
db.util.getColorAnimator = function(colors, time) {
	// Convert all colors to RGB
	for (var i = 0; i < colors.length; i++) {
		colors[i] = getRGB(colors[i]);
	}

	var curColor = 0;
	return function(elapsed) {
		if (elapsed >= time)
			return getHex(colors[colors.length-1]);

		var pct = elapsed/time;

		var curColor = Math.floor(pct*(colors.length-1));

		var start = colors[curColor];
		var end = colors[curColor+1];

		// TODO: calc this once
		var diff = {
			r: end.r-start.r,
			g: end.g-start.g,
			b: end.b-start.b
		};

		var startPct = curColor/(colors.length-1);
		var nextPct = (curColor+1)/(colors.length-1);
		var curPct = (pct-startPct) * (colors.length-1);

		var color = 0x000000;
		color += start.r + (diff.r * curPct) << 16;
		color += start.g + (diff.g * curPct) << 8;
		color += start.b + (diff.b * curPct);
		return color;
	}
};

db.util.generateSprite = function() {
	var canvas = document.createElement( 'canvas' );
	canvas.width = 16;
	canvas.height = 16;

	var context = canvas.getContext( '2d' );
	var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
	gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
	gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
	gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
	gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

	context.fillStyle = gradient;
	context.fillRect( 0, 0, canvas.width, canvas.height );

	return canvas;
};
