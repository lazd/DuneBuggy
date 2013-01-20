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
	
	var hasGamepad = !!this.game.gamepad.gamepads.length;
	var gamepad = {};
	if (hasGamepad) {
		var gamepadState = this.game.gamepad.gamepads[0].state;
		
		gamepad.direction = gamepadState['LEFT_STICK_X']*-1;
		gamepad.forward = gamepadState['X'] || gamepadState['RB_SHOULDER'];
		gamepad.reverse = gamepadState['A'] || gamepadState['LB_SHOULDER'];
		
		gamepad.fire = gamepadState['LB'];
		gamepad.handBrake = gamepadState['RB'];
		
		gamepad.boost = gamepadState['RIGHT_STICK'];
		
		gamepad.reset = gamepadState['BACK'];
		
	}
	
	var tankPosition = this.getRoot().position;
	
	// TODO: Reliably get tank rotation here or find another way to position the turret
	// var tankRotation = this.getRoot().rotation.y+Math.PI/2;
	var tankRotation = this.getRoot().worldY+Math.PI/2;
	
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
	
	// Steering
	if (keyboard.pressed(this.keyMap.keyStateLeft) || keyboard.pressed(this.keyMap.keyStateLeft2))
		this.controls.direction = 1;
	else if (keyboard.pressed(this.keyMap.keyStateRight) || keyboard.pressed(this.keyMap.keyStateRight2))
		this.controls.direction = -1;
	else if (hasGamepad) {
		this.controls.direction = null; // no keyboard controls
		this.controls.steering = gamepad.direction;
	}
	else
		this.controls.direction = 0;

	// Power
	if (keyboard.pressed(this.keyMap.keyStateUp) || keyboard.pressed(this.keyMap.keyStateUp2) || gamepad.forward)
		this.controls.forward = true;
	else
		this.controls.forward = false;

	if (keyboard.pressed(this.keyMap.keyStateDown) || keyboard.pressed(this.keyMap.keyStateDown2) || gamepad.reverse)
		this.controls.reverse = true;
	else
		this.controls.reverse = false;
	
	// Braking
	if (keyboard.pressed(this.keyMap.handBrake) || gamepad.handBrake)
		this.controls.brake = true;
	else
		this.controls.brake = false;
	
	// Weapons
	this.controls.fire = keyboard.pressed(this.keyMap.keyStateFire) || mouse.buttons().left || gamepad.fire;
	
	this.controls.boost = keyboard.pressed(this.keyMap.boost) || gamepad.boost;
	
	this.controls.reset = keyboard.pressed(this.keyMap.reset) || gamepad.reset;
};
