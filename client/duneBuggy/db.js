/*
DuneBuggy - A multiplayer dune buggy battle game for the web
Copyright (C) 2012 Lawrence Davis

DuneBuggy is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

DuneBuggy is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var db = {
	maps: {},
	config: {
		camera: {
			type: 'chase',
			follow: 'tank'
		},
		game: {
			startY: 140
		},
		physics: {
			gravity: -175 // -150 is more moon-like, -175 feels more realistic
		},
		comm: {
			server: 'home.lazd.net:1935', // hostname:port (without http://)
			interval: 15
		},
		colors: {
			friend: 0x886A00,
			enemy: 0x880000
		},
		controls: {
			mouse: {
				sensitivity: 2,
				inverted: false
			},
			gamepad: {
				sensitivity: 1.25,
				inverted: true
			}
		},
		sound: {
			enabled: false,
			silentDistance: 1500,
			sounds: {
				fire_bullet: "duneBuggy/sounds/fire_bullet.ogg",
				fire_missile: "duneBuggy/sounds/fire_missile.ogg",
				fire_enemy: "duneBuggy/sounds/fire_enemy.ogg",
				hit_building: "duneBuggy/sounds/hit_building.ogg",
				hit_tank: "duneBuggy/sounds/hit_tank.ogg",
				hit_tank_self: "duneBuggy/sounds/hit_tank_self.ogg",
				explosion: "duneBuggy/sounds/explosion.ogg"
			}
		},
		buggy: {
			hp: 100,
			
			max_power: 600,
			boost_power: 1400,
			brake_power: 50,
			mass: 12,
			
			k: 0.95, // almost full damping
			suspension_stiffness: 30,
			max_suspension_travel_cm: 350,
			friction_slip: 0.8,
			max_suspension_force: 14000,
			suspension_rest_length: 0.400,

			wheel_radius: 5.5,

			steering_increment: 1/25,
			max_steering_radius: 0.25
		},
		weapons: {
			bullet: {
				interval: 125,
				time: 2000,
				impulse: 25,
				damage: 10,
				mass: 0.01,
				dimensions: {
					width: 1, // 0.5
					height: 1, // 0.5
					depth: 4 // 2
				},
				sound: {
					file: 'fire_bullet',
					volume: 0.85
				}
			},
			missile: {
				interval: 1000,
				time: 3000,
				damage: 75,
				mass: 5,
				sound: {
					file: 'fire_missile',
					volume: 0.35
				}
			}
		},
		size: {
			tank: 0.1,
			missile: 0.02,
			turret: 0.35,
			crate: 0.045,
			wall: 10,
			ground: 10
		},
		models: [
			'buggy_body',
			'buggy_turret',
			'buggy_turretMount',
			'buggy_wheelLeft',
			'buggy_wheelRight',
			'terrain',
			'missilePhoenix',
			'barrel'
		]
	}
};


db.config.buggy.suspension_damping = db.config.buggy['k'] * 2.0 * Math.sqrt(db.config.buggy.suspension_stiffness);
db.config.buggy.suspension_compression = db.config.buggy['k'] * 2.0 * Math.sqrt(db.config.buggy.suspension_stiffness);
