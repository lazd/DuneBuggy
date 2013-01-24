db.OilTank = new Class({
	toString: 'OilTank',
	extend: db.MapItem,
	options: {
		hp: 150,
		mass: 0,
		model: {
			name: "oil_tank",
			yPosition: 1,
			size: 0.2,
			wrapTextures: false,
			castShadow: true,
			meshClass: Physijs.CylinderMesh
		}
	}
});
