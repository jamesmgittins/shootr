var Constants = {
	localStorageVariable: "shootrGameModel",
	starJumpScaling : 1.4,
	difficultyLevelScaling : 1.4,
	shieldLevelScaling : 1.39,
	weaponLevelScaling : 1.38,
	shipLevelPriceScaling : 1.43,
	levelsPerBoss:8,
	maxScreenShake:2,
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

function starLevelModify(level) {
	return Math.ceil(level / 2.5);
}

function calculateShipLevel() {
	return Math.max(Math.floor(((gameModel.p1.frontWeapon ? gameModel.p1.frontWeapon.level : 0) +
		(gameModel.p1.turretWeapon ? gameModel.p1.turretWeapon.level : 0) +
		(gameModel.p1.rearWeapon ? gameModel.p1.rearWeapon.level : 0) +
		(gameModel.p1.shield ? gameModel.p1.shield.level : 0)) / 4.1), 1);
}

function calculateAdjustedStarLevel(starLevel) {
	return Math.max(calculateShipLevel(), starLevel);
}

function valueForRoute(route) {
	return 0.4 * Math.pow(1.4, route);
}

function calculateIncome() {
	var amount = 0;
	for (var i=0; i<gameModel.history.length; i++) {
		amount += valueForRoute(gameModel.history[i].completedLevel);
	}
	return amount;
}

function calculateIncomeSinceLastCheck(time) {
	if (gameModel.lastTradeUpdate < new Date().getTime() - time) {
		var timeDifference = (new Date().getTime() - gameModel.lastTradeUpdate) / 1000;
		var amountEarned = timeDifference * calculateIncome();
		addCredits(amountEarned, true);
		gameModel.lastTradeUpdate = new Date().getTime();
		return amountEarned;
	}
	return 0;
}

function findInHistory(systemA, systemB) {

	var foundOne = false;

	gameModel.history.forEach(function(history){
		if ((systemsEqual(history.start, systemA) && systemsEqual(history.end, systemB)) ||
			 (systemsEqual(history.start, systemB) && systemsEqual(history.end, systemA))) {
			foundOne = history;
		}
	});
	return foundOne;
}

function addToHistory(systemA, systemB) {
	if (!findInHistory(systemA, systemB)) {
		gameModel.history.push({start:systemA,end:systemB,completedLevel:calculateAdjustedStarLevel(Math.max(Math.abs(systemB.x), Math.abs(systemB.y)))});
	}
}

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
			maxScreenShake : Constants.maxScreenShake,
			detailLevel : 1,
			dmgNumbers : true,
			antialiasing : false,
			p1 : {
				ship: Shipyard.generateShip(1, 7, false),
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
			bossesDefeated : 0,
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

function addCredits (value, fromTrade) {
	if (currentState == states.running && !fromTrade) {
		gameModel.p1.temporaryCredits += value;
	} else {
		gameModel.p1.credits += value;
		gameModel.p1.totalCredits += value;
	}

	save();
}
