(function() {
	var explosionTexture = THREE.ImageUtils.loadTexture(
		"duneBuggy/textures/explosion.png"
	);
	
	db.Explosion = new Class({
		options: {
			particleCount: 1000,
			time: 2000,
			startRandom: 15,
			size: 25,
			velocity: 1,
			velocityDecay: 0.989
		},
		construct: function(options) {
			// Combine default parameters with class parameters and instance parameters 
			var options = this.options = jQuery.extend(true, {}, this.options, options);

			// Bind update functions
			this.bind(this.update);

			// create the particle variables
			var particles = new THREE.Geometry();
		
			var material = new THREE.ParticleBasicMaterial({
				color: 0xFFFFFF,
				size: options.size,
				opacity: 1,
				map: explosionTexture,
				blending: THREE.AdditiveBlending,
				transparent: true,
				depthTest: false
			});

			/*
			// Squares
			var material = new THREE.ParticleBasicMaterial({
				color: 0xFFFFFF,
				size: options.size,
				opacity: 1,
				transparent: true
			});
			*/

			//var material = new THREE.ParticleBasicMaterial( { map: new THREE.Texture( generateSprite() ), blending: THREE.AdditiveBlending } );

			// now create the individual particles
			for(var p = 0; p < options.particleCount; p++) {
				// create a particle with random
				// position values, -250 -> 250
				var pX = Math.random() * options.startRandom - options.startRandom/2,
					pY = Math.random() * options.startRandom - options.startRandom/2,
					pZ = Math.random() * options.startRandom - options.startRandom/2,
				    particle = new THREE.Vector3(pX, pY, pZ);

				// create a velocity vector
				particle.velocity = new THREE.Vector3(
					Math.random()*options.velocity-options.velocity/2,	// x
					Math.random()*options.velocity,	// y should go up more
					Math.random()*options.velocity-options.velocity/1.5); // z

				// add it to the geometry
				particles.vertices.push(particle);
			}

			this.particles = particles;

			// create the particle system
			this.particleSystem = new THREE.ParticleSystem(particles, material);

			// Start position
			this.particleSystem.position.copy(options.position);

			// Add to game
			this.game = options.game;
			this.game.scene.add(this.particleSystem);
			this.game.hook(this.update);
	
			this.startTime = new Date().getTime();
			this.particlesGone = 0;
	
			/*
			this.getCurColor = getColorAnimator([
				0xFFFFFF,
				0xFFFF00,
				0xFFAA00,
				0xAAAAAA,
				0x000000
			], this.options.time);
			*/

			db.game.sound.play('explosion', db.game.getVolumeAt(options.position));
		},
		destruct: function() {
			this.game.unhook(this.update);
			this.game.scene.remove(this.particleSystem);
		},
		update: function(delta) {
			var time = new Date().getTime();
			var age = time - this.startTime;

		
			/*
			if (age >= this.options.time)
				return this.destruct();
			*/

			if (this.particlesGone >= this.options.particleCount)
				return this.destruct();
		
			var life = 1-(age/this.options.time);

			for (var i = this.particles.vertices.length-1; i >= 0; i--) {
				var particle = this.particles.vertices[i];
				// Change the particle's position
				particle.addSelf(particle.velocity);

				if (particle.y < -this.options.size) {
					this.particlesGone++;
					this.particles.vertices.splice(i, 1);
					continue;
				}

				// Decrease the velocity
				particle.velocity.x = particle.velocity.x*this.options.velocityDecay;
				particle.velocity.y = particle.velocity.y*this.options.velocityDecay;
				particle.velocity.z =  particle.velocity.z*this.options.velocityDecay;

				// Fall from the sky
				particle.velocity.y -= 0.05*(1-life);
			}

			this.particleSystem.material.opacity = life;
		
			//this.particleSystem.material.color.setHex(this.getCurColor(age));

			this.particleSystem.geometry.verticesNeedUpdate = true;
			this.particleSystem.geometry.elementsNeedUpdate = true;

		}
	});
}());