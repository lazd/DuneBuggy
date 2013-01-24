db.Radar = new Class({
	toString: 'Radar',
	
	defaultOptions: {
		scanSpeed: 1000,
		zoom: 0.1,
		game: null,
		follow: 'tank' // turret
	},
	
	construct: function(options) {
		this.options = jQuery.extend({}, this.defaultOptions, options);
		this.game = options.game;
		
		this.bind(this.update);
		
		this.game.hook(this.update);
	},
	
	destruct: function() {
		this.game.unhook(this.update);
		
		document.body.removeChild(this.canvas);
		clearInterval(this.interval);
	},
	
	init: function() {
		// Create a canvas and add it to the DOM
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'radar';
		document.body.appendChild(this.canvas);
		
		// Store the size of the canvas
		this.size = this.canvas.offsetWidth;
		
		this.canvas.width = this.size;
		this.canvas.height = this.size;
		
		// Store a reference to the drawing context
		this.ctx = this.canvas.getContext('2d');
		
		// Draw around the center
		this.ctx.translate(this.size/2, this.size/2);
	},
	
	drawCircle: function(x, y, color) {
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		
		this.ctx.arc(x, y, 2.5, 0, Math.PI * 2, true);
		
		this.ctx.closePath();
		this.ctx.fill();
	},
	
	getPos: function(position, offset, zoom) {
		var newPos = {
			x: (offset.x-position.x)*zoom,
			z: (offset.z-position.z)*zoom
		};
		
		return newPos;
	},
	
	update: function() {
		// Follow turret
		var rotation;
		if (this.options.follow === 'tank') {
			rotation = this.game.tank.getRoot().eulerRotation.y || 0;
		}
		else if (this.options.follow === 'turret')
			rotation = this.game.tank.getRoot().rotation.y + this.game.tank.getTurret().rotation.y;
		
		this.ctx.clearRect(-this.size/2, -this.size/2, this.size, this.size);
		this.ctx.rotate(rotation);
		
		var objects = this.game.getPositions();
		
		// Remove self from radar
		var self = objects.shift();
		var offset = self.pos;
		
		this.drawCircle(0, 0, '#'+db.config.colors.friend.toString(16));
			
		var scope = this;
		objects.filter(function (object) {
			return object.type === 'Tank';
		})
		.map(function (object) {
			var pos = scope.getPos(object.pos, offset, scope.options.zoom);
			pos.color = '#' + (object.alliance === 'enemy' ? db.config.colors.enemy : db.config.colors.friend).toString(16);
			
			return pos;
		})
		.forEach(function (pos) {
			var maxPos = scope.size/2-2;
			
			// Draw the blip
			if (Math.pow(-pos.x, 2) + Math.pow(-pos.z, 2) > Math.pow(maxPos, 2)) {
				var theta = Math.atan(pos.z / pos.x);
				if (pos.x < 0) theta += Math.PI;
				pos.x = Math.cos(theta) * maxPos;
				pos.z = Math.sin(theta) * maxPos;
			}
			scope.drawCircle(pos.x, pos.z, pos.color);
		});
		
		this.ctx.rotate(-rotation);
	}
});