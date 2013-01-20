db.DuneBuggyGame = new Class({
	toString: 'DuneBuggyGame',
	extend: db.Game,
	
	defaults: $.extend({}, db.config),

	construct: function(options) {
		// Bind functions
		this.bind(this.handleFire);
		
		this.bind(this.handleJoin);
		this.bind(this.handleLeave);
		this.bind(this.handleMove);
		this.bind(this.handleEnemyFire);
		this.bind(this.handleHit);
		this.bind(this.handlePlayerList);
		this.bind(this.handleKill);
		
		// Variables
		var that = this;
		this.enemyBullets = [];
		this.mapItems = [];
		this.customRotation = Math.PI/2;
		this.currentWeapon = 'bullet';
		
		// TODO: abstract key listening
		$(document).on('keydown', function(evt) {
			if (evt.which == 86) // switch camera when V is pressed
				that.switchView();
			else if (evt.which == 81)
				that.currentWeapon = that.currentWeapon == 'bullet' ? 'missile' : 'bullet';
			else if (evt.which == 67)
				that.switchCamera();
			else if (evt.which == 80)
				that.sound.enabled = !that.sound.enabled;
		});
		
		$(document).on('mousemove', function(e) {
			e = e.originalEvent;
			var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
			var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
			
			if (this.pointerLocked && this.cameraControls.options.type == 'chase' && this.cameraControls.options.chase.follow == 'turret') {
				var targetAngle = this.customRotation + movementX*-1 * Math.PI/1024;
				this.customRotation = targetAngle;
			}
		}.bind(this));
		
		/******************
		Player setup
		******************/
		// Player's initial state
		this.player = {
			name: navigator.platform+' '+~~((new Date).getTime()/100%1000)+Math.floor(Math.random()*100),
			hp: 100
		};
		
		
		/******************
		Scene setup
		******************/
		this.scene.setGravity(new THREE.Vector3(0, this.options.physics.gravity, 0));

		/******************
		Enemy setup
		******************/
		this.enemies = {
			_list: [],
			_map: {}, // new WeakMap()
			get: function(nameOrId) {
				if (typeof nameOrId == 'string') {
					return this._map[nameOrId]; // return enemies._map.get(nameOrId);
				}
				else if (typeof nameOrId == 'number') {
					return this._list(nameOrId);
				}
			},
			has: function(nameOrId) {
				return !!this.get(nameOrId);
			},
			do: function(nameOrId, operation, arguments) {
				var enemy = this.get(nameOrId);
				if (enemy) {
					enemy[operation].apply(enemy, arguments);
					return true;
				}
				return false;
			},
			forEach: function(callback) {
				this._list.forEach(callback);
			},
			list: function() {
				return this._list;
			},
			delete: function(nameOrId) {
				var enemy = this.get(nameOrId);
				if (enemy) {
					// Remove from map
					delete this._map[enemy.name]; // this._map.delete(enemy.name);
				
					// Remove from array
					var enemyIndex = this._list.indexOf(enemy);
					if (~enemyIndex)
						this._list.splice(enemyIndex, 1);
				
					// destroy
					enemy.destruct();

					return true;
				}
				return false;
			},
			add: function(enemyInfo) {
				if (this.has(enemyInfo.name)) {
					this.delete(enemyInfo.name);
					console.error('Bug: Player %s added twice', enemyInfo.name);
				}
				else {
					if (enemyInfo.name === null) {
						console.error('Bug: enemyInfo contained null player name');
						console.log(enemyInfo);
						console.trace();
					}
					console.log('%s has joined the fray', enemyInfo.name);
				}
				
				// TODO: include velocities?
				var enemyTank = new db.Buggy({
					game: that,
					alliance: 'enemy',
					name: enemyInfo.name,
					position: new THREE.Vector3(enemyInfo.pos[0], 0, enemyInfo.pos[1]),
					rotation: enemyInfo.rot,
					turretRotation: enemyInfo.tRot
				});

				this._list.push(enemyTank);
				this._map[enemyInfo.name] = enemyTank; // this._map.set(enemyInfo.name, otherTank);
			}
		};
		
		/******************
		Create utility instances
		******************/
		// Sound
		this.sound = new db.Sound({
			sounds: this.options.sounds
		});
		
		/******************
		Environment setup
		******************/
		// Ambient light
		this.ambientLight = new THREE.AmbientLight(0xEEEEEE);
		this.scene.add(this.ambientLight);
	
		// Directional light
		this.light = new THREE.DirectionalLight(0xFFFFFF, 2);
		this.light.position.set(2200, 2200, -4000);
		this.scene.add(this.light);
		
		// Load a map
		this.loadMap(db.maps['Lollypop Land']);
		
		this.camera.position.set(0,300,0);
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		
		// Start rendering
		this.start();
	},
	
	initialize: function() {
		console.log('Initializing game...');
		
		// Ground plane
		this.ground = new db.Ground({ game: this });
		
		// Buggy
		this.tank = new db.Buggy({
			game: this,
			isSelf: true,
			alliance: 'self',
			callback: function() {
				console.log('Player model loaded...');
			}
		});
		
		// Create camera that follows tank
		this.cameraControls = new db.CameraControls({
			tank: this.tank,
			scene: this.scene,
			camera: this.camera,
			type: this.options.cameraType
		});
		
		// Catch fire events
		this.tank.on('fire', this.handleFire);
		
		// Communication
		this.comm = new db.Comm({
			player: this.player,
			tank: this.tank,
			server: this.options.comm.server
		});
		
		// Add radar
		this.radar = new db.Radar({ game: this });
		
		this.comm.on('fire', this.handleEnemyFire);
		
		this.comm.on('hit', this.handleHit);
		
		this.comm.on('player list', this.handlePlayerList);
		
		this.comm.on('killed', this.handleKill);
		
		this.comm.on('join', this.handleJoin);
		
		this.comm.on('leave', this.handleLeave);
		
		this.comm.on('move', this.handleMove);
		
		/******************
		Rendering hooks
		******************/
		// Evaluate keyboard controls
		this.hook(this.tank.controlsLoopCb.bind(this.tank));
		
		// Send position updates to everyone
		this.hook(this.comm.position);
		
		// Move the camera with the tank
		this.hook(this.cameraControls.update);
		
		/******************
		Initialization
		******************/
		// Start communication
		this.comm.connected();
	},

	destruct: function() {
		this.comm.destruct();
		this.sound.destruct();
	},
	
	handleJoin: function(message) {
		this.enemies.add(message);
	},
	
	handleLeave: function(message) {
		if (this.enemies.delete(message.name)) {
			console.log('%s has left', message.name);
		}
	},
	
	handleMove: function(message) {
		if (message.name == this.player.name) {
			// server told us to move
			console.log('Server reset position');
			
			// Return to center
			this.tank.setPosition(message.pos, message.rot, message.rot+message.tRot, message.aVeloc, message.lVeloc, false);
		}
		else {
			if (!this.enemies.do(message.name, 'setPosition', [message.pos, message.rot, message.rot+message.tRot, message.aVeloc, message.lVeloc, true])) {
				this.enemies.add(message);
			}
		}
	},
	
	handleKill: function(message) {
		var enemy = this.enemies.get(message.name);
		
		new db.Explosion({
			game: this,
			position: enemy.getPosition()
		});
		
		if (message.killer == this.player.name)
			console.warn('You killed %s!', message.name);
		else
			console.log('%s was killed by %s', message.name, message.killer);
	},
	
	handlePlayerList: function(message) {
		for (var otherPlayerName in message) {
			// don't add self
			if (otherPlayerName == this.player.name) continue;
			
			var otherPlayer = message[otherPlayerName];
			this.enemies.add(otherPlayer);
		}
	},
	
	handleEnemyFire: function(message) {
		var time = new Date().getTime();
		
		var bulletPosition = new THREE.Vector3(message.pos[0], 0, message.pos[1]);
		
		var bulletModel;
		if (message.type == 'missile') {
			bulletModel = new db.Missile({
				game: this,
				position: bulletPosition,
				rotation: message.rot,
				alliance: 'enemy'
			});
		}
		else {
			bulletModel = new db.Bullet({
				game: this,
				position: new THREE.Vector3(message.pos[0], 0, message.pos[1]),
				rotation: message.rot,
				alliance: 'enemy'
			});
		}
		
		// Calculated volume based on distance
		var volume = this.getVolumeAt(bulletPosition);
		
		// Play sound
		var soundInfo = this.options.weapons[message.type].sound;
		this.sound.play(soundInfo.file, soundInfo.volume*volume);
		
		this.enemyBullets.push({
			instance: bulletModel,
			alliance: 'enemy',
			time: time
		});
	},
	
	getVolumeAt: function(point) {
		var distance = this.tank.getRoot().position.distanceTo(point);
		var volume = 1 - distance/this.options.sound.silentDistance;
		return Math.min(Math.max(volume, 0), 1);
	},
	
	handleHit: function(message) {
		// Decrement HP
		this.player.hp -= this.options.weapons[message.type].damage;
		
		this.sound.play('hit_tank_self');
		console.log('You were hit with a %s by %s! Your HP: %d', message.type, message.name, this.player.hp);
		
		if (this.player.hp <= 0) {
			// Player is dead
			this.handleDie(message.name);
		}
	},
	
	handleFire: function(props) {
		this.comm.fire(props.pos, props.rot, this.currentWeapon);
	},
	
	handleDie: function(otherPlayerName) {
		new db.Explosion({
			game: this,
			position: this.tank.getRoot().position
		});
		
		this.comm.died(otherPlayerName);
		
		// Restore health
		this.player.hp = 100;
		
		// Reset rotation
		this.customRotation = Math.PI/2;
		
		console.warn('You were killed by %s', otherPlayerName);
	},
	
	addMapItem: function(item) {
		var ItemClass = db[item.type];
		if (!ItemClass) {
			console.error('Cannot add map item: '+item);
			return null;
		}
		var mapItem = new ItemClass({
			game: this,
			position: new THREE.Vector3(item.pos[0], item.pos[1], item.pos[2]),
			rotation: new THREE.Vector3(item.rot[0], item.rot[1], item.rot[2]),
		});
	
		return mapItem;
	},
	
	loadMap: function(map) {
		var items = map.items;
		for (var i = 0; i < items.length; i++) {
			this.mapItems.push(this.addMapItem(items[i]));
		}
	},
	
	switchCamera: function() {
		this.cameraControls.options.chase.follow = this.cameraControls.options.chase.follow == 'tank' ? 'turret' : 'tank';
	},
	
	switchView: function() {
		this.options.cameraType = this.cameraControls.options.type = this.cameraControls.options.type == 'overhead' ? 'chase' : 'overhead';
	},
	
	getPositions: function() {
		var objects = [];
		
		// Self
		var pos = this.tank.getRoot().position.clone();
		objects.push({
			type: 'Tank',
			alliance: 'self',
			pos: pos
		});
		
		// Enemies
		this.enemies.forEach(function(enemy) {
			var pos = enemy.getRoot().position.clone();
			objects.push({
				type: 'Tank',
				alliance: 'enemy',
				pos: pos
			});
		});
		
		// Map items
		/*
		this.mapItems.forEach(function(mapItem) {
			var pos = mapItem.getRoot().position.clone();
			objects.push({
				type: mapItem.toString(),
				alliance: 'none',
				pos: pos
			});
		});
		*/
		
		return objects;
	}
});
