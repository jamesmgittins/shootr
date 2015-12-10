var gameModel = {
	levelsUnlocked : 1,
	currentLevel : 1,
	p1 : {
		shipSeed: 1,
		credits: 0,
		totalCredits: 0,
		upgrades:[]
	},
	p2 : {
		shipSeed: 12345,
		credits: 0,
		totalCredits: 0,
		upgrades:[]
	}
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

	loadUpgrades();
}

function loadUpgrades() {
    for (var j = 0; j < upgrades.length; j++) {
        upgrades[j].qty = 0;
        for (var i = 0; i < gameModel.p1.upgrades.length; i++) {
            if (gameModel.p1.upgrades[i].id == upgrades[j].id) {
                upgrades[j].qty = gameModel.p1.upgrades[i].qty;
                applyUpgrade(upgrades[j]);
            }
        }
        for (var i = 0; i < gameModel.p2.upgrades.length; i++) {
            if (gameModel.p2.upgrades[i].id == upgrades[j].id) {
                upgrades[j].qty = gameModel.p2.upgrades[i].qty;
                applyUpgrade(upgrades[j]);
            }
        }
    }
}

function applyUpgrade(upgrade) {
    var newValue = upgrade.baseVal * Math.pow(upgrade.effectMultiplier, upgrade.qty);
    eval(upgrade.id + "=" + newValue);
}

function buyUpgrade(id) {
    for (var j = 0; j < upgrades.length; j++) {
        if (upgrades[j].id == id) {
            if (upgradePrice(upgrades[j]) <= gameModel.p1.credits &&
                (upgrades[j].qty < upgrades[j].maxQty || upgrades[j].maxQty == -1)) {

                gameModel.p1.credits -= upgradePrice(upgrades[j]);
                var alreadyBought1 = false;

                for (var i = 0; i < gameModel.p1.upgrades.length; i++) {
                    if (gameModel.p1.upgrades[i].id == id) {
                        alreadyBought1 = true;
                        gameModel.p1.upgrades[i].qty++;
                    }
                }

                if (!alreadyBought1) {
                    gameModel.p1.upgrades.push({id:upgrades[j].id,qty:1});
                }

                GameText.bigText.newBigText(upgrades[j].desc);

                upgrades[j].qty++;
                applyUpgrade(upgrades[j]);
                save();
                ShootrUI.updateUpgrades();
            }
        }
    }
}

function upgradePrice(upgrade) {
    //var qty = 0;
    //for (var i = 0; i < upgrades.length; i++) {
    //    qty += upgrades[i].qty;
    //}
    return upgrade.basePrice * Math.pow(upgrade.priceMult, upgrade.qty);
    //return upgrade.basePrice * Math.pow(1.11, qty);
}

function resetSaveGame() {
    localStorage.removeItem('gameModel');
    location.reload(true);
}

function addCredits (value) {
	gameModel.p1.credits += value;
	gameModel.p1.totalCredits += value;
	save();
}

var upgrades = [
	{
		desc:"+5% Fire Rate",
		basePrice: 750,
        baseVal: 1000,
		priceMult: 1.40,
		effectMultiplier: 0.95,
		id:"Bullets.playerBullets.shotFrequency",
		levelUnlocked: 1,
		maxQty: 40
	},
	{
		desc:"+30% Shot Damage",
		basePrice: 20,
		baseVal: 1.8,
		priceMult: 1.36,
		effectMultiplier: 1.3,
		id:"Bullets.playerBullets.strength",
		levelUnlocked: 1,
		maxQty: -1
	},
    {
        desc: "+5% Shot Speed",
        basePrice: 1200,
        baseVal: 150,
        priceMult: 1.55,
        effectMultiplier: 1.05,
        id: "Bullets.playerBullets.shotSpeed",
        levelUnlocked: 1,
        maxQty: 20
    },
    {
        desc: "+40% Shield Capacity",
        basePrice: 100,
        baseVal: 10,
        priceMult: 1.45,
        effectMultiplier: 1.4,
        id: "PlayerShip.playerShip.maxShield",
        levelUnlocked: 1,
        maxQty: -1
    },
    {
        desc: "+30% Shield Regen Speed",
        basePrice: 500,
        baseVal: 2,
        priceMult: 1.35,
        effectMultiplier: 1.3,
        id: "PlayerShip.playerShip.shieldRegen",
        levelUnlocked: 1,
        maxQty: -1
    },
    {
        desc: "-10% Shield Regen Delay",
        basePrice: 2000,
        baseVal: 5000,
        priceMult: 3.9,
        effectMultiplier: 0.9,
        id: "PlayerShip.playerShip.shieldDelay",
        levelUnlocked: 1,
        maxQty: 10
    },
	{
        desc: "+5% Ship Speed",
        basePrice: 300,
        baseVal: 100,
        priceMult: 2.30,
        effectMultiplier: 1.05,
        id: "PlayerShip.playerShip.maxSpeed",
        levelUnlocked: 1,
        maxQty: 10
    }
];