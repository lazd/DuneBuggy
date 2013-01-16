db.OilTank = new Class({
	toString: 'OilTank',
	extend: db.MapItem,
	options: {
		hp: 150,
		mass: 0,
		model: {
			url: "duneBuggy/models/oil_tank.js",
			yPosition: 1,
			size: 0.2,
			wrapTextures: false,
			meshClass: Physijs.CylinderMesh
		},
		hitBox: new THREE.CylinderGeometry(10, 10, 12),
		hitBoxYPosition: 6
	}
});
