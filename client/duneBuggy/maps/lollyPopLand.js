db.maps['Lollypop Land'] = {
	name: 'Lollypop Land',
	items: [
		// test// { type: 'OilTank', 			pos: [32, 32], 	rot: 0 },

		// Base 1
		//{ type: 'Barrel', 			pos: [-40, -852], 	rot: 0 },
		//{ type: 'Crate', 			pos: [-48, -848], 	rot: 0 },

		{ type: 'OilTank', 			pos: [32, -838], 	rot: 0 },
		{ type: 'OilTank', 			pos: [-32, -838], 	rot: 0 },
		{ type: 'OilTank', 			pos: [0, -802], 	rot: 0 },
		{ type: 'OilTank', 			pos: [0, -838], 	rot: 0 },
		{ type: 'OilTank', 			pos: [32, -802], 	rot: 0 },
		{ type: 'OilTank', 			pos: [-32, -802], 	rot: 0 },

		{ type: 'WallSection', 		pos: [64, -800], 	rot: 0 },

		{ type: 'WallConnector', 	pos: [64, -832], 	rot: 0 },

		{ type: 'WallCorner', 		pos: [64, -864], 	rot: 0 },

		{ type: 'WallConnector', 	pos: [32, -864], 	rot: Math.PI/2 },

		{ type: 'WallSection', 		pos: [0,  -864], 	rot: Math.PI/2 },

		{ type: 'WallConnector', 	pos: [-32, -864], 	rot: Math.PI/2 },

		{ type: 'WallCorner', 		pos: [-64, -864], 	rot: Math.PI/2 },

		{ type: 'WallConnector', 	pos: [-64, -832], 	rot: 0 },

		{ type: 'WallSection', 		pos: [-64, -800], 	rot: 0 },


		// Base 2
		//{ type: 'Barrel', 			pos: [-40, 852], 	rot: 0 },
		//{ type: 'Crate', 			pos: [-48, 848], 	rot: 0 },

		{ type: 'OilTank', 			pos: [32, 838], 	rot: 0 },
		{ type: 'OilTank', 			pos: [-32, 838], 	rot: 0 },
		{ type: 'OilTank', 			pos: [0, 802], 		rot: 0 },
		{ type: 'OilTank', 			pos: [0, 838], 		rot: 0 },
		{ type: 'OilTank', 			pos: [32, 802], 	rot: 0 },
		{ type: 'OilTank', 			pos: [-32, 802], 	rot: 0 },

		{ type: 'WallSection', 		pos: [64, 800], 	rot: 0 },

		{ type: 'WallConnector', 	pos: [64, 832], 	rot: 0 },

		{ type: 'WallCorner', 		pos: [64, 864], 	rot: 0 },

		{ type: 'WallConnector', 	pos: [32, 864], 	rot: Math.PI/2 },

		{ type: 'WallSection', 		pos: [0,  864], 	rot: Math.PI/2 },

		{ type: 'WallConnector', 	pos: [-32, 864], 	rot: Math.PI/2 },

		{ type: 'WallCorner', 		pos: [-64, 864], 	rot: Math.PI/2 },

		{ type: 'WallConnector', 	pos: [-64, 832], 	rot: 0 },

		{ type: 'WallSection', 		pos: [-64, 800], 	rot: 0 },

	    // Turrent, incomplete // { type: 'Turret', pos: [96,64], rot: Math.PI/4*3 },
	
		{ type: 'Barrel', 			pos: [20, 20], 	rot: 0 },
		{ type: 'Barrel', 			pos: [30, 30], 	rot: 0 },
		{ type: 'Barrel', 			pos: [40, 40], 	rot: 0 },
	]
};


var map = {
	name: 'Lollypop Land',
	items: [
		{ type: 'Barrel', pos: [444, 66, -496], rot: [0, 0, 0] },
		{ type: 'Barrel', pos: [437, 66, -499], rot: [0, 0, 0] },
		{ type: 'Barrel', pos: [440, 66, -502], rot: [0, 0, 0] },
		{ type: 'Barrel', pos: [443, 66, -505], rot: [0, 0, 0] }
	]
};

/*
var mapSize = 1800;
var barrels = 20;

var spacing = mapSize/Math.sqrt(barrels);

for (var i = 0; i < mapSize; i += spacing) {
	for (var j = 0; j < mapSize; j += spacing) {
		//map.items.push({ type: 'Barrel', pos: [i, 300, j], rot: [0, 0, 0] });
		
		// Pile
		map.items.push({ type: 'Barrel', pos: [Math.random()*50+400, 130+Math.random()*30, Math.random()*50+300], rot: [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI] });
		//map.items.push({ type: 'Barrel', pos: [Math.random()*50-400, 130+Math.random()*30, Math.random()*50+300], rot: [Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI] });
	}
}
*/

db.maps['Lollypop Land'] = map;
