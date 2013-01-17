db.DuneBuggyGame = new Class({
	toString: 'DuneBuggyGame',
	extend: db.Game,

	defaults: {
		cameraType: 'chase',
		cameraFollow: 'turret',
		debug: {
			bulletCollisions: false
		}
	},

	construct: function(options) {
		this.options = jQuery.extend({}, this.defaults, options);
		
		// Bind functions
		this.bind(this.processEnemyBullets);
		this.bind(this.processOwnBullets);
		this.bind(this.moveTank);
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
		
		// Tank
		/*
		this.tank = new db.OwnTank({
			game: this
		});
		*/
		var camera = this.camera;
		this.tank = new db.Buggy({
			game: this,
			isSelf: true,
			alliance: 'self',
			callback: function() {
				// Uncomment for direct attachment
				// camera.rotation.set(0, Math.PI, 0);
				// camera.position.set(0, 75, -300);
				// camera.lookAt(this.root);
				// this.root.add(camera);
			}
		});
		
		this.camera.position.y = 50;
		this.camera.position.x = 0;
		this.camera.position.z = -20;
		
		// Create camera that follows tank
		this.cameraControls = new db.CameraControls({
			tank: this.tank,
			scene: this.scene,
			camera: this.camera,
			type: this.options.cameraType
		});
		
		// Catch fire events
		this.tank.on('fire', this.handleFire);
		
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
			meshes: function() {
				var meshes = [];
				this._list.forEach(function(enemy) {
					meshes.push(enemy.getBody());
				});
				return meshes;
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
				
				var enemyTank = new db.Buggy({
					game: that,
					type: 'enemy',
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
			sounds: db.config.sounds
		});
		
		// Communication
		this.comm = new db.Comm({
			player: this.player,
			tank: this.tank,
			server: db.config.comm.server
		});
		
		// Add radar, if available
		if (db.Radar) this.radar = new db.Radar({ game: this });
		
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
		// Remove bullets fried by enemies
		//this.hook(this.processEnemyBullets);

		// Evaluate collisions for out bullets
		//this.hook(this.processOwnBullets);

		// Evaluate controls?
		//this.hook(this.moveTank);
		
		// Evaluate keyboard controls
		this.hook(this.tank.controlsLoopCb.bind(this.tank));
		
		// Send position updates to everyone
		this.hook(this.comm.position);
		
		// Move the camera with the tank
		this.hook(this.cameraControls.update);
		
		/******************
		Environment setup
		******************/
		// Ambient light
		this.ambientLight = new THREE.AmbientLight(0xCCCCCC);
		this.scene.add(this.ambientLight);
	
		// Directional light
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		this.directionalLight.position.set(50, 150, 150);
		this.scene.add(this.directionalLight);
		
		// Ground plane
		//this.ground = new db.FlatGround({ game: this });
		this.ground = new db.Ground({ game: this });
		
		/******************
		Initialization
		******************/
		// Start communication
		this.comm.connected();
		
		// Load a map
		this.loadMap(db.maps['Lollypop Land']);
		
		this.camera.position.set(0,300,0);
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		
		// Start rendering
		this.start();
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
			this.tank.reset(message.pos, message.rot, message.tRot);
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
				type: 'enemy'
			});
		}
		else {
			bulletModel = new db.Bullet({
				game: this,
				position: new THREE.Vector3(message.pos[0], 0, message.pos[1]),
				rotation: message.rot,
				type: 'enemy'
			});
		}
		
		// Calculated volume based on distance
		var volume = this.getVolumeAt(bulletPosition);
		
		// Play sound
		var soundInfo = db.config.weapons[message.type].sound;
		this.sound.play(soundInfo.file, soundInfo.volume*volume);
		
		this.enemyBullets.push({
			instance: bulletModel,
			type: message.type,
			time: time
		});
	},
	
	getVolumeAt: function(point) {
		var distance = this.tank.getRoot().position.distanceTo(point);
		var volume = 1 - distance/db.config.sound.silentDistance;
		return Math.min(Math.max(volume, 0), 1);
	},
	
	handleHit: function(message) {
		// Decrement HP
		this.player.hp -= db.config.weapons[message.type].damage;
		
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
	
	processEnemyBullets: function() {
		var time = new Date().getTime();
		removeBulletLoop: for (var i = 0; i < this.enemyBullets.length; i++) {
			var bullet = this.enemyBullets[i];
			if (!bullet) { // odd bug, not sure why
				console.error('Bug: Tried to remove ENEMY bullet that did not exist at index %s with length %s', i, this.enemyBullets.length);
				continue;
			}
			
			var bulletModel = bullet.instance.getModel();
			
			var age = time-bullet.time;
			if (age > db.config.weapons[bullet.type].time) {
				bullet.instance.destruct();
				this.enemyBullets.splice(i, 1);
				i--;
				continue removeBulletLoop;
			}
			
			// MAP ITEMS
			for (var j = 0; j < this.mapItems.length; j++) {
				var mapItem = this.mapItems[j];
				var itemModel = mapItem.getHitBox();
				
				if (this.isHit(itemModel, bulletModel, bullet.type)) {
					this.sound.play('hit_building', this.getVolumeAt(mapItem.getRoot().position));
					
					// Remove HP from map item
					{ // TEMPORARY REMOVE THIS
						mapItem.takeHit(db.config.weapons[bullet.type].damage);
						if (mapItem.isDestroyed()) {
							this.mapItems.splice(j, 1);
							j--;
						}
					}
					
					bullet.instance.destruct();
					this.enemyBullets.splice(i, 1);
					i--;
					continue removeBulletLoop;
				}
			}
			
			// Your tank
			if (this.isHit(this.tank.getHitBox(), bulletModel, bullet.type)) {
				// Remove bullets that hit me
				bullet.instance.destruct();
				this.enemyBullets.splice(i, 1);
				i--;
				continue removeBulletLoop;
			}
		}
	},
	
	// Calculated line of sight: doesn't work great for objects, as bullet may be inside of the object!
	isHit: function(target, bullet, type) {
		// Ray starts at bullet position
		var rayStart = bullet.position.clone();
	
		// Calculate a point in space in front of the bullet
		var deltaX = Math.sin(bullet.rotation.y) * 10;
		var deltaZ = Math.cos(bullet.rotation.y) * 10;
		var focusX = rayStart.x + deltaX;
		var focusZ = rayStart.z + deltaZ;
		var rayEnd = new THREE.Vector3(focusX, bullet.position.y, focusZ);
		
		// Get the direction for the ray
		var rayDirection = new THREE.Vector3();
		rayDirection.sub(rayEnd, rayStart).normalize();
		
		// Fire a ray from the bullet to 10 units ahead
		var ray = new THREE.Ray(rayStart, rayDirection);
		
		// See if the target is in the line of fire
		var intersects = ray.intersectObject(target);
		
		if (this.options.debug.bulletCollisions) {
			console.log('Target: ',			target);
			console.log('bullet: ',			bullet);
			console.log('Ray start: ',		rayStart.x, rayStart.y, rayStart.z);
			console.log('Ray end: ',		rayEnd.x, rayEnd.y, rayEnd.z);
			console.log('Ray direction: ',	rayDirection.x, rayDirection.y, rayDirection.z);
			console.log('Target: ',			target.position.x, target.position.y, target.position.z);
			console.log('Intersects: ',		intersects.length ? intersects[0].distance : 'no');
		}
		
		// must be greater or equal to max distance a bullet can move in one frame
		// That happens to be about 15...
		return !!(intersects.length && intersects[0].distance < db.config.weapons[type].hitDistance);
	},
	
	processOwnBullets: function() {
		var time = new Date().getTime();
		
		// Check bullet collisions
		bulletCollisionLoop: for (var i = 0; i < this.tank.bullets.length; i++) {
			var bullet = this.tank.bullets[i];
			if (!bullet) { // odd bug, not sure why
				console.error('Bug: Tried to remove ENEMY bullet that did not exist at index %s with length %s', i, this.tank.bullets.length);
				continue;
			}
				
			var age = time-bullet.time;
			if (age > db.config.weapons[bullet.type].time) {
				bullet.instance.destruct();
				this.tank.bullets.splice(i, 1);
				i--;
			}
			else { // Check for collisions
				var bulletModel = bullet.instance.getModel();
				
				// MAP ITEMS
				for (var j = 0; j < this.mapItems.length; j++) {
					var mapItem = this.mapItems[j];
					var itemModel = mapItem.getHitBox();

					if (this.isHit(itemModel, bulletModel, bullet.type)) {
						if (this.options.debug.bulletCollisions)
							console.warn('Bullet hit map item...');

						this.sound.play('hit_building', this.getVolumeAt(mapItem.getRoot().position));
						
						// Tell the server the map item took a hit
						//this.comm.hit(mapItemName);

						// Remove HP from map item
						mapItem.takeHit(db.config.weapons[bullet.type].damage);
						if (mapItem.isDestroyed()) {
							this.mapItems.splice(j, 1);
							j--;
						}
						
						// Remove the bullet from the scene
						bullet.instance.destruct();
						this.tank.bullets.splice(i, 1);
						i--;
						continue bulletCollisionLoop;
					}
				}
				
				for (var j = 0; j < this.enemies._list.length; j++) {
					var enemy = this.enemies._list[j];
					if (this.isHit(enemy.getHitBox(), bulletModel, bullet.type)) {
						if (this.options.debug.bulletCollisions)
							console.warn('Hit %s!', enemy.getName());
				
						enemy.takeHit();
						
						this.sound.play('hit_tank', this.getVolumeAt(enemy.getRoot().position));
						this.comm.hit(enemy.getName(), bullet.type);
				
						bullet.instance.destruct();
						this.tank.bullets.splice(i, 1);
						i--;
						continue bulletCollisionLoop;
					}
				}
			}
		}
	},
	
	moveTank: function(delta) {
		return;
		var tankObj = this.tank;
		
		// Calculate the future position of the tank
		var curPos = tankObj.getPosition();
		var newPos = tankObj.evaluateControls(delta, this.tank.controls, true);
		
		// Adjust position
		newPos.position = [
			curPos.x + newPos.velocity.x * delta,
			curPos.z + newPos.velocity.z * delta
		];
		
		// Set position
		//tankObj.setPosition(newPos.position, newPos.tankOrientation);
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
