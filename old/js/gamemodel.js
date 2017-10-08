var Constants = {
	difficultyLevelScaling : 1.4,
	shieldLevelScaling : 1.38,
	weaponLevelScaling : 1.38,
	shipLevelPriceScaling : 1.43
}

var gameModel = {
	weaponIdCounter:0
};

function save() {
	if (typeof (Storage) === "undefined")
		return;

	setTimeout(function () {
	    localStorage.setItem("gameModel", JSON.stringify(gameModel));
	});
}

function load() {
	if (typeof (Storage) === "undefined")
		return;

	if (localStorage.getItem("gameModel") !== null)
	    gameModel = JSON.parse(localStorage.getItem("gameModel"));
	else {
		gameModel = {
			levelsUnlocked : 1,
			currentLevel : 1,
			timeStep : 1,
			purchaseHistory : [],
			masterVolume : 0.5,
			maxScreenShake : 5,
			dmgNumbers : false,
			p1 : {
				ship: Shipyard.generateShip(1, 1, false),
				weapons: [Weapons.generateWeapon(1,123,false)],
				shields: [ArmsDealer.generateShield(1, 234, false)],
				credits: 0,
				totalCredits: 0,
				temporaryCredits : 0,
				upgrades:[]
			},
			p2 : {
				ship: {seed:1, range:10},
				weapons: [],
				shields: [],
				credits: 0,
				totalCredits: 0,
				upgrades:[]
			},
			currentSystem: {x:0,y:0},
			targetSystem: {x:0,y:0},
			history: [],
			weaponIdCounter: gameModel.weaponIdCounter
		};
		gameModel.p1.turretWeapon = gameModel.p1.weapons[0];
		gameModel.p1.shield = gameModel.p1.shields[0];
	}
}

function resetSaveGame() {
    localStorage.removeItem('gameModel');
    location.reload(true);
}

function addCredits (value) {
	if (currentState == states.running) {
		gameModel.p1.temporaryCredits += value;
	} else {
		gameModel.p1.credits += value;
		gameModel.p1.totalCredits += value;
	}

	save();
}
