db.Buggy.prototype.keyMap = {
	keyStateUp: "up",
	keyStateUp2: "w",
	keyStateDown: "down",
	keyStateDown2: "s",
	keyStateLeft: "left",
	keyStateLeft2: "a",
	keyStateRight: "right",
	keyStateRight2: "d",
	keyStateFire: "ctrl",
	handBrake: "space",
	reset: "backtick",
	boost: "shift"
};


db.Buggy.prototype.controlsLoopCb = function(delta, now) {
	var keyboard = db.Keyboard;
	var mouse = db.Mouse;
	
	var tankPosition = this.getRoot().position;
	
	// TODO: Reliably get tank rotation here or find another way to position the turret
	var tankRotation = this.getRoot().rotation.y+Math.PI/2;
	
	var turretRotation = this.getTurret().rotation.y;
	
	var mouse2D = mouse.position();
	
	// Turret follows mouse from overhead view
	if (this.game.options.cameraType == 'overhead') {
		var tank = [window.innerWidth/2, window.innerHeight/2];
	
		var z = tank[1]-mouse2D[1];
		var x = tank[0]-mouse2D[0];
	
		var targetAngle = Math.atan2(x, z);
	
		this.getTurret().rotation.y = targetAngle - tankRotation;
	}
	else if (this.game.options.cameraType == 'chase' && this.game.options.cameraFollow == 'tank') {
		// Find mouse in 3D space
		var mouse3D = this.game.get3DCoords(mouse2D[0], mouse2D[1]);
    
		// Get direction
		var x = tankPosition.x-mouse3D.x;
		var z = tankPosition.z-mouse3D.z;
		var targetAngle = Math.atan2(x, z);
	  
		this.getTurret().rotation.y = targetAngle - tankRotation + Math.PI*1.5;
	}
	else if (this.game.pointerLocked) {
		// do nothing
		if (this.game.customRotation !== undefined)
			this.getTurret().rotation.y = this.game.customRotation - tankRotation;
	}
	else {
		var screenVal = (window.innerWidth/2-mouse2D[0])/window.innerWidth;
		
		var targetAngle = screenVal * Math.PI*2;
		
		this.getTurret().rotation.y = targetAngle - tankRotation - Math.PI*1.5;
	}
		
	if (keyboard.pressed(this.keyMap.keyStateLeft) || keyboard.pressed(this.keyMap.keyStateLeft2))
		this.controls.direction = 1;
	else if (keyboard.pressed(this.keyMap.keyStateRight) || keyboard.pressed(this.keyMap.keyStateRight2))
		this.controls.direction = -1;
	else
		this.controls.direction = null;
		
	if (keyboard.pressed(this.keyMap.keyStateUp) || keyboard.pressed(this.keyMap.keyStateUp2))
		this.controls.power = true;
	else
		this.controls.power = false;

	if (keyboard.pressed(this.keyMap.keyStateDown) || keyboard.pressed(this.keyMap.keyStateDown2))
		this.controls.reverse = true;
	else
		this.controls.reverse = false;
		
	if (keyboard.pressed(this.keyMap.handBrake))
		this.controls.brake = true;
	else
		this.controls.brake = false;
	
	this.controls.fire = keyboard.pressed(this.keyMap.keyStateFire) || mouse.buttons().left;
	
	this.controls.boost = keyboard.pressed(this.keyMap.boost);
	
	this.controls.reset = keyboard.pressed(this.keyMap.reset);
};
