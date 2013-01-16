db.Comm = new Class({
	extend: EventEmitter,
	makeTrigger: function(evt) {
		var that = this;
		return function(message) {
			that.trigger.call(that, evt, message);
		}
	},
	destruct: function() {
		// TODO: Send server some kind of destruct message?
	},
	construct: function(options) {
		options = jQuery.extend({
			server: 'localhost:1935'
		}, options);
		
		// Prepend http
		options.server = 'http://'+options.server;
		
		this.player = options.player;
		this.tank = options.tank;
		
		var that = this;
		
		this.lastMessageTime = 0;
		this.lastPosition = [0, 0];
		this.lastRotation = 0;
		this.lastTRotation = 0;
	
		// Create socket connection
		this.socket = io.connect(options.server);
		
		this.socket.on('join', this.makeTrigger('join'));
		
		this.socket.on('failed', function(message) {
			// try to reconnect
			that.connected();
		});
		
		this.socket.on('player list', this.makeTrigger('player list'));
		
		this.socket.on('killed', this.makeTrigger('killed'));
		
		this.socket.on('fire', this.makeTrigger('fire'));
		
		this.socket.on('hit', this.makeTrigger('hit'));
		
		this.socket.on('leave', this.makeTrigger('leave'));
		
		this.socket.on('move', this.makeTrigger('move'));
		
		this.bind(this.position);
		this.bind(this.fire);
		this.bind(this.died);
		this.bind(this.hit);
	},
	
	connected: function() {
		var time = new Date().getTime();
		var tankPosition = this.tank.getPositionPacket();
		
		var packet = {
			evt: 'joined',
			name: this.player.name,
			time: time,
			pos: tankPosition.pos,
			rot: tankPosition.rot,
			tRot: tankPosition.tRot
		};

		// Broadcast position
		this.socket.emit('join', packet);
	},
	position: function() {
		var time = new Date().getTime();
		
		// Never send faster than db.config.comm.interval
		if (time-this.lastMessageTime >= db.config.comm.interval) {
			var tankPosition = this.tank.getPositionPacket();

			// If tank moved, send packet
			if (Math.abs(this.lastRotation-tankPosition.rot) >= 0.01 ||
				Math.abs(this.lastTRotation-tankPosition.tRot) >= 0.01 ||
				Math.abs(this.lastPosition[0]-tankPosition.pos[0]) >= 0.01 ||
				Math.abs(this.lastPosition[1]-tankPosition.pos[1]) >= 0.01) {
				
				// Build packet
				var packet = {
					time: time,
					pos: tankPosition.pos,
					rot: tankPosition.rot,
					tRot: tankPosition.tRot - tankPosition.rot // Include tank rotation so turret is rendered correctly
				};

				// Store last position broadcasted
				this.lastRotation = tankPosition.rot;
				this.lastTRotation = tankPosition.tRot;
				this.lastPosition[0] = tankPosition.pos[0];
				this.lastPosition[1] = tankPosition.pos[1];

				// Broadcast position
				this.socket.emit('move', packet);
				this.lastMessageTime = time;
			}
		}
	},
	fire: function(pos, rot, type) {
		this.socket.emit('fire', {
			pos: pos,
			rot: rot,
			type: type
		});
	},
	died: function(otherPlayerName) {
		this.socket.emit('killed', {
			killer: otherPlayerName
		});
	},
	hit: function(otherPlayerName, type) {
		this.socket.emit('hit', {
			name: otherPlayerName,
			type: type
		});
	}
});
