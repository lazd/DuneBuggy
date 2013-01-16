db.WallCorner = new Class({
	toString: 'WallCorner',
	extend: db.MapItem,
	options: {
		hp: 1000,
		mass: 0,
		model: {
			url: "duneBuggy/models/wall_corner.js",
			yPosition: 10,
			size: db.config.size.wall
		}
	}
});
