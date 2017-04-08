var Constants = {
	localStorageVariable: "shootrGameModel",
	difficultyLevelScaling : 1.4,
	shieldLevelScaling : 1.38,
	weaponLevelScaling : 1.38,
	shipLevelPriceScaling : 1.43,
	levelsPerBoss:5,
	itemColors : {
		normal:0x2E7D32,
		super:0x1565C0,
		ultra:0x4527A0,
		hyper:0xEF6C00
	},
	itemBorders : {
		normal:0xC8E6C9,
		super:0xBBDEFB,
		ultra:0xD1C4E9,
		hyper:0xFFE0B2
	},
	itemBordersOld : {
		normal:0x1B5E20,
		super:0x0D47A1,
		ultra:0x311B92,
		hyper:0xE65100
	},
	itemTypes : {
		weapon:"weapon",
		shield:"shield"
	},
	uiColors : {
		// background : 0x1B5E20,
		background : 0x124215,
		lightText : 0xB2DFDB,
		darkText : 0x80D8FF
	}
};

var gameModel = {
	weaponIdCounter:1
};

var calculateShipLevel = function() {
	return Math.floor(((gameModel.p1.frontWeapon ? gameModel.p1.frontWeapon.level : 0) +
		(gameModel.p1.turretWeapon ? gameModel.p1.turretWeapon.level : 0) +
		(gameModel.p1.rearWeapon ? gameModel.p1.rearWeapon.level : 0) +
		(gameModel.p1.shield ? gameModel.p1.shield.level : 0)) / 4);
};

var calculateIncome = function() {
	var amount = 0;
	for (var i=0; i<gameModel.history.length; i++) {
		amount += 10 * Math.pow(1.4,Math.max(
			Math.abs(gameModel.history[i].start.x),
			Math.abs(gameModel.history[i].start.y),
			Math.abs(gameModel.history[i].end.x),
			Math.abs(gameModel.history[i].end.y)
		));
	}
	return amount * 100;
};

var calculateIncomeSinceLastCheck = function() {
	if (gameModel.lastTradeUpdate < new Date().getTime() - 120000) {
		var timeDifference = (new Date().getTime() - gameModel.lastTradeUpdate) / 3600000;
		var amountEarned = timeDifference * calculateIncome();
		addCredits(amountEarned);
		gameModel.lastTradeUpdate = new Date().getTime();
		return amountEarned;
	}
	return 0;
};

function save() {
	if (typeof (Storage) === "undefined")
		return;

	purgeDupes();

	setTimeout(function () {
	    localStorage.setItem(Constants.localStorageVariable, JSON.stringify(gameModel));
	});
}

// had issue where 2 shields of same id appeared in inventory
// this should clean up if it happens again
function purgeDupes() {
	var idsTested = [];
	var weaponsToKeep = [];
	var shieldsToKeep = [];

	gameModel.p1.weapons.forEach(function(item){
		if (!idsTested[item.id]) {
			weaponsToKeep.push(item);
			idsTested[item.id] = true;
		}
	});

	gameModel.p1.shields.forEach(function(item){
		if (!idsTested[item.id]) {
			shieldsToKeep.push(item);
			idsTested[item.id] = true;
		}
	});

	gameModel.p1.weapons = weaponsToKeep;
	gameModel.p1.shields = shieldsToKeep;
}

function load() {
	if (typeof (Storage) === "undefined")
		return;

	if (localStorage.getItem(Constants.localStorageVariable) !== null)
	    gameModel = JSON.parse(localStorage.getItem(Constants.localStorageVariable));
	else {
		gameModel = {
			levelsUnlocked : 1,
			currentLevel : 1,
			timeStep : 1,
			purchaseHistory : [],
			masterVolume : 0.5,
			maxScreenShake : 5,
			dmgNumbers : false,
			antialiasing : true,
			p1 : {
				ship: Shipyard.generateShip(1, 3, false),
				weapons: [Weapons.plasmaCannon(1,123,Weapons.rarity[0])],
				shields: [ArmsDealer.generateShield(1, 234, false)],
				credits: 0,
				totalCredits: 0,
				temporaryCredits : 0,
				perkPoints:0
			},
			currentSystem: {x:0,y:0},
			targetSystem: {x:0,y:0},
			history: [],
			weaponIdCounter: gameModel.weaponIdCounter,
			resolutionFactor:1,
			lastTradeUpdate: new Date().getTime()
		};
		gameModel.p1.turretWeapon = gameModel.p1.weapons[0];
		gameModel.p1.shield = gameModel.p1.shields[0];
	}
	purgeDupes();
}

function resetSaveGame() {
    localStorage.removeItem(Constants.localStorageVariable);
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
