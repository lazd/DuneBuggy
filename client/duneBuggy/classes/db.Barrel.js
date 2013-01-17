db.Barrel = new Class({
	toString: 'Barrel',
	extend: db.MapItem,
	options: {
		hp: 7,
		mass: 0.015,
		model: {
			url: "duneBuggy/models/barrel.js",
			textures: [
				"duneBuggy/textures/Barrel_explosive.jpg"
			],
			size: 0.28,
			wrapTextures: false,
			meshClass: Physijs.CylinderMesh
		}
	}
});
