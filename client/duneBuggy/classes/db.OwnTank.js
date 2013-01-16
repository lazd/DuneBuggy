db.OwnTank = new Class({
	toString: 'OwnTank',
	extend: db.Tank,
	
	construct: function(options) {
		this.bind(this.update);
		this.controlsLoopCb = this.controlsLoopCb.bind(this);

		// Store last position and tracks
		this.lastPosition = this.getRoot().position.clone();

		// Store bullets and last fire time
		this.bullets = [];
		this.lastFireTime = {};
		
		this.velocity = new THREE.Vector3(0, 0, 0);
		
		// the controls of the tank
		this.controls = {
			moveForward: false,
			moveBackward: false,
			moveLeft: false,
			moveRight: false,
			fire: false
		};
		
		
		var input = this.input = {
			power: null,
			direction: null,
			steering: 0
		};
		document.addEventListener('keydown', function( ev ) {
			switch ( ev.keyCode ) {
				case 37: // left
					this.input.direction = 1;
					break;

				case 38: // forward
					this.input.power = true;
					break;

				case 39: // right
					this.input.direction = -1;
					break;

				case 40: // back
					this.input.power = false;
					break;
			}
		}.bind(this));
		document.addEventListener('keyup', function( ev ) {
			switch ( ev.keyCode ) {
				case 37: // left
					this.input.direction = null;
					break;

				case 38: // forward
					this.input.power = null;
					break;

				case 39: // right
					this.input.direction = null;
					break;

				case 40: // back
					this.input.power = null;
					break;
			}
		}.bind(this));
	},
	
	update: function(delta) {
		this.inherited(arguments);
		
		var time = new Date().getTime();

		// Get the tanks current position
		var tankPosition = this.getRoot().position;
		var tankRotation = this.getRoot().rotation.y;
		var turretRotation = this.getTurret().rotation.y+tankRotation;

		if (this.controls.fire && (!this.lastFireTime[this.game.currentWeapon] || time-this.lastFireTime[this.game.currentWeapon] >= db.config.weapons[this.game.currentWeapon].interval)) {
			var type = this.game.currentWeapon;
			var bulletPosition = tankPosition.clone();

			// Position bullet at muzzle, not center of tank
			var deltaX = Math.sin(turretRotation) * 25;
			var deltaZ = Math.cos(turretRotation) * 25;
			bulletPosition.x += deltaX;
			bulletPosition.z += deltaZ;

			// Create ordinance
			var bulletModel;
			if (type == 'missile') {
				bulletModel = new db.Missile({
					game: this.game,
					position: bulletPosition,
					rotation: turretRotation,
					type: 'friend'
				});
			}
			else {
				bulletModel = new db.Bullet({
					game: this.game,
					position: bulletPosition,
					rotation: turretRotation,
					type: 'friend'
				});
			}

			// Store bullet
			this.bullets.push({
				instance: bulletModel,
				type: type,
				time: time
			});

			// Emit event
			this.trigger('fire', {
				pos: [bulletPosition.x, bulletPosition.z],
				rot: turretRotation,
				type: type
			});

			var soundInfo = db.config.weapons[this.game.currentWeapon].sound;
			this.game.sound.play(soundInfo.file, soundInfo.volume);

			// Store last fire time
			this.lastFireTime[this.game.currentWeapon] = time;
		}
		
		
		if ( this.input && this.vehicle ) {
			if ( this.input.direction !== null ) {
				this.input.steering += this.input.direction / 50;
				if ( this.input.steering < -.6 ) this.input.steering = -.6;
				if ( this.input.steering > .6 ) this.input.steering = .6;
			}
			this.vehicle.setSteering( this.input.steering, 0 );
			this.vehicle.setSteering( this.input.steering, 1 );

			if ( this.input.power === true ) {
				this.vehicle.applyEngineForce( 300 );
			} else if ( this.input.power === false ) {
				this.vehicle.setBrake( 20, 2 );
				this.vehicle.setBrake( 20, 3 );
			} else {
				this.vehicle.applyEngineForce( 0 );
			}
		}
	},
	
	getPositionPacket: function() {
		var tankPosition = this.getRoot().position;
		var tankRotation = this.getRoot().rotation;
		var turretRotation = this.getTurret().rotation;

		return {
			pos: [tankPosition.x, tankPosition.z],
			rot: tankRotation.y,
			tRot: turretRotation.y
		};
	},
	
	translateZ: function(by) {
		this.getRoot().position.z += by;
	},
	
	translateX: function(by) {
		this.getRoot().position.x += by;
	},
	
	rotate: function(by) {
		this.tankOrientation += by;
	},
	
	evaluateControls: function(delta, controls, store) {
		return;
		
		var speed = this.speed;
		var wheelOrientation = this.wheelOrientation;

		var tankOrientation = this.tankOrientation;
		
		if (controls.moveForward) {
			speed = db.config.tank.maxSpeed;
		}

		if (controls.moveBackward) {
			speed = db.config.tank.maxReverseSpeed;
		}
		
		if (controls.moveLeft) {
			wheelOrientation = db.config.tank.maxWheelRotation;
		}

		if (controls.moveRight) {
			wheelOrientation = -db.config.tank.maxWheelRotation;
		}

		// speed decay
		if (!(controls.moveForward || controls.moveBackward)) {
			if (speed > 0) {
				var k = db.util.exponentialEaseOut(speed / db.config.tank.maxSpeed);

				speed = THREE.Math.clamp(speed - k * delta * db.config.tank.frontDeceleration, 0, db.config.tank.maxSpeed);

			} else {
				var k = db.util.exponentialEaseOut(speed / db.config.tank.maxReverseSpeed);

				speed = THREE.Math.clamp(speed + k * delta * db.config.tank.backDeceleration, db.config.tank.maxReverseSpeed, 0);
			}
		}

		// steering decay
		if (!(controls.moveLeft || controls.moveRight)) {
			wheelOrientation = 0;
		}
		
		// Calculate
		var forwardDelta = speed * delta;
		tankOrientation += db.config.tank.steeringRadiusRatio * wheelOrientation;

		var vX = Math.sin(this.tankOrientation) * speed;
		var vZ = Math.cos(this.tankOrientation) * speed;

		var velo = this.root.getLinearVelocity();
		this.root.setLinearVelocity({x: vX, y: velo.y, z: vZ });
		//this.root.rotation.y = tankOrientation;
	    //this.root.__dirtyRotation = true;

		var newX = this.root.position.x + vX * delta;
		var newZ = this.root.position.z + vZ * delta;

		if (store) {
			this.speed = speed;
			this.wheelOrientation = wheelOrientation;
          
			this.tankOrientation = tankOrientation;
		}

		return {
			forwardDelta: forwardDelta,
			position: {
				x: newX,
				z: newZ
			},
			velocity: {
				x: vX,
				z: vZ
			},
			tankOrientation: tankOrientation
		}
	}
});
