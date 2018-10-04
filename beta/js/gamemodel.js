var Constants = {
	canvasWidth : 640,
	canvasHeight : 640,
	localStorageVariable: "shootrGameModelBeta",
	difficultyLevelScaling : 1.4,
	shieldLevelScaling : 1.39,
	weaponLevelScaling : 1.38,
	shipLevelPriceScaling : 1.45,
	tradeRouteScaling: 1.44,
	levelsPerBoss:5,
	maxScreenShake:2.7,
	starDistancePerLevel:1.8,
	starDistance:8,
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
		shield:"shield",
		ship:"ship"
	},
	uiColors : {
		// background : 0x1B5E20,
		background : 0x124215,
		lightText : 0xB2DFDB,
		darkText : 0x80D8FF
	},
	controlText : "Keyboard & Mouse\nW A S D to move ship and scroll in galaxy map\nMouse to aim turret, mousewheel to zoom galaxy map"
	+ "\nLeft click to select a star system in the galaxy map\nQ & E to barrel roll to avoid enemy bullets\nP to pause during gameplay"
	+ "\n\nGamepad Controls\nLeft Stick to move ship\nRight Stick to aim turret\nLeft & Right Shoulder buttons to barrel roll"
	+ "\nStart / Options to pause during gameplay"
};
var gameModel = {
	weaponIdCounter:1,
	p1:{}
};

function maxLevelAllowed() {
	return Boss.currentLevel() + 1;
}

function calculateShipLevel() {
	return Math.max(Math.floor(((gameModel.p1.frontWeapon ? gameModel.p1.frontWeapon.level : 0) +
		(gameModel.p1.turretWeapon ? gameModel.p1.turretWeapon.level : 0) +
		(gameModel.p1.rearWeapon ? gameModel.p1.rearWeapon.level : 0) +
		(gameModel.p1.shield ? gameModel.p1.shield.level : 0)) / 4.1), 1);
}

function calculateAdjustedStarLevel(starLevel) {
	return Math.max(starLevel, Boss.calculateLevel(gameModel.bossesDefeated) + starLevel - 1);
}

function valueForRoute(route) {
	return Talents.passiveCredits(1.5 * Math.pow(Constants.tradeRouteScaling, route));
}

function calculateIncome() {
	var amount = 0;
	for (var i=0; i<gameModel.history.length; i++) {
		amount += valueForRoute(gameModel.history[i].completedLevel);
	}
	return amount * getTradeModifier();
}

function calculateIncomeSinceLastCheck(time) {
	var currTime = Date.now();
	if (gameModel.lastTradeUpdate < currTime - time) {
		var timeDifference = Math.min(7200, (currTime - gameModel.lastTradeUpdate) / 1000); // cap time to 86400 = 2 Hours
		var amountEarned = timeDifference * calculateIncome();
		addCredits(amountEarned, true);
		gameModel.lastTradeUpdate = currTime;
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
		var destinationStar = StarChart.generateStar(systemB.x, systemB.y);
		gameModel.history.push({
			start:systemA,
			end:systemB,
			completedLevel:calculateAdjustedStarLevel(destinationStar.level)
		});
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
				ship: Shipyard.generateShip(1, 45),
				weapons: [PlasmaCannon.plasmaCannon(1,123,Weapons.rarity[1])],
				shields: [Shields.generateShield(1, 234, false)],
				credits: 500,
				totalCredits: 0,
				temporaryCredits : 0,
				perkPoints:0,
				upgrades : {speed:0,defence:0,damage:0,buying:0,trading:0,range:0},
				shipBlueprints :[]
			},
			currentSystem: {x:0,y:0},
			targetSystem: {x:0,y:0},
			history: [],
			historyWhenBossDefeated: [],
			bossesDefeated : 0,
			weaponIdCounter: gameModel.weaponIdCounter,
			resolutionFactor:1,
			lastTradeUpdate: Date.now()
		};
		gameModel.p1.turretWeapon = gameModel.p1.weapons[0];
		gameModel.p1.shield = gameModel.p1.shields[0];
	}
	purgeDupes();
	Howler.volume(gameModel.masterVolume);
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

function getCritChance() {
	return gameModel.p1.ship.critChance || 0.05;
}

function getCritDamage() {
	return gameModel.p1.ship.critDamage + Talents.passiveCritDamage();
}

function getUpgradedRange() {
	return (100 + gameModel.p1.upgrades.range) / 100;
}

function getUpgradedSpeed() {
	return (150 * gameModel.p1.ship.speed) + gameModel.p1.upgrades.speed;
}

function getDamageReduction() {
	return 100 / (100 + gameModel.p1.upgrades.defence + Talents.passiveDmgReduction());
}

function getDamageModifier() {
	return (100 + gameModel.p1.upgrades.damage + Talents.damageIncrease()) / 100;
}

function getBuyPriceModifier() {
	return 100 / (100 + gameModel.p1.upgrades.buying);
}

function getTradeModifier() {
	return (100 + gameModel.p1.upgrades.trading) / 100;
}

var pilotUpgrades = [
	{
		id : "speed",
		name : "Reaction Training",
		description : "Increase ship movement speed by 1%",
		basePrice : 5000,
		levelFactor : 2.5
	},
	{
		id : "range",
		name : "Endurance Training",
		description : "Increase ship flight range by 1%",
		basePrice : 10000,
		levelFactor : 2.4
	},
	{
		id : "defence",
		name : "Evasion Training",
		description : "Increase damage reduction by 1%",
		basePrice : 50000,
		levelFactor : 2
	},
	{
		id : "damage",
		name : "Targeting Training",
		description : "Increase all damage dealt by 1%",
		basePrice : 100000,
		levelFactor : 1.9
	},
	{
		id : "buying",
		name : "Barter Training",
		description : "Reduce all costs by 1%",
		basePrice : 250000,
		levelFactor : 1.9
	},
	{
		id : "trading",
		name : "Business Training",
		description : "Increase trade route value by 1%",
		basePrice : 500000,
		levelFactor : 2.8
	}
];
