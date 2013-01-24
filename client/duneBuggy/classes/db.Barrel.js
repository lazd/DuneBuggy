db.Barrel = new Class({
	toString: 'Barrel',
	extend: db.MapItem,
	options: {
		hp: 7,
		mass: 0.015,
		model: {
			name: "barrel",
			textures: [
				"duneBuggy/textures/Barrel_explosive.jpg"
			],
			castShadow: true,
			size: 0.28,
			wrapTextures: false,
			meshClass: Physijs.CylinderMesh
		}
	}
});
