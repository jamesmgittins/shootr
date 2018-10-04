ArmsDealer = {
	menuTitle: "Arms Dealer",
	backButton: {
		index : -1,
		title: "Back",
		click: function() {
			ArmsDealer.hide();
			StationMenu.show();
		},
		buttonDesc:buttonTypes.back
	},
	currentSelection: 0,
	bButton: function() {},
	gridWidth : 8,
	showCurrentCredits : true,
	recoveredItems : []
};



ArmsDealer.hide = function() {
	ArmsDealer.menuContainer.visible = false;

	for (var i = ArmsDealer.menuContainer.children.length - 1; i >= 0; i--) {
		var item = ArmsDealer.menuContainer.children[i];
		item.destroy(true);
	}

	if (ArmsDealer.dialogContainer && typeof ArmsDealer.dialogContainer.destroy === "function")
		ArmsDealer.dialogContainer.destroy(true);
	// ArmsDealer.dialogContainer = undefined;
};

ArmsDealer.show = function() {
	ArmsDealer.initialize();
	ArmsDealer.menuContainer.visible = true;
};

var arrow = {
	up: "\u2191",
	down: "\u2193"
};

ArmsDealer.shieldComparison = function(item) {
	var shield = typeof gameModel.p1.shield !== "undefined" ? gameModel.p1.shield : {
		capacity: 0,
		chargePerSecond: 0,
		chargeDelay: 6,
		id:0,
		price : 0
	};
	return {
		upgrade : item.price > shield.price,
		capacity: item.capacity >= shield.capacity ? arrow.up : arrow.down,
		chargePerSecond: item.chargePerSecond >= shield.chargePerSecond ? arrow.up : arrow.down,
		chargeDelay: item.chargeDelay <= shield.chargeDelay ? arrow.up : arrow.down,
		equipped:item.id == shield.id
	};
};

ArmsDealer.weaponComparison = function(item, compareTo) {

	var frontWeapon = typeof gameModel.p1.frontWeapon !== "undefined" ? gameModel.p1.frontWeapon : {
		dps: 0,
		shotsPerSecond: 0,
		accuracy: 0,
		id : 0
	};
	var turretWeapon = typeof gameModel.p1.turretWeapon !== "undefined" ? gameModel.p1.turretWeapon : {
		dps: 0,
		shotsPerSecond: 0,
		accuracy: 0,
		id : 0
	};
	var rearWeapon = typeof gameModel.p1.rearWeapon !== "undefined" ? gameModel.p1.rearWeapon : {
		dps: 0,
		shotsPerSecond: 0,
		accuracy: 0,
		id : 0
	};

	if (compareTo) {
		return {
			upgrade: item.dps > compareTo.dps,
			dps: (item.dps >= compareTo.dps ? arrow.up : arrow.down),
			shotsPerSecond: (item.shotsPerSecond >= compareTo.shotsPerSecond ? arrow.up : arrow.down),
			accuracy: (item.accuracy >= compareTo.accuracy ? arrow.up : arrow.down),
			equipped : item.id == frontWeapon.id || item.id == rearWeapon.id || item.id == turretWeapon.id
		};
	}

	return {
		upgrade: item.dps > frontWeapon.dps || item.dps > turretWeapon.dps || item.dps > rearWeapon.dps,
		dps: (item.dps >= frontWeapon.dps ? arrow.up : arrow.down) + (item.dps >= turretWeapon.dps ? arrow.up : arrow.down) + (item.dps >= rearWeapon.dps ? arrow.up : arrow.down),
		shotsPerSecond: (item.shotsPerSecond >= frontWeapon.shotsPerSecond ? arrow.up : arrow.down) + (item.shotsPerSecond >= turretWeapon.shotsPerSecond ? arrow.up : arrow.down) + (item.shotsPerSecond >= rearWeapon.shotsPerSecond ? arrow.up : arrow.down),
		accuracy: (item.accuracy >= frontWeapon.accuracy ? arrow.up : arrow.down) + (item.accuracy >= turretWeapon.accuracy ? arrow.up : arrow.down) + (item.accuracy >= rearWeapon.accuracy ? arrow.up : arrow.down),
		equipped : item.id == frontWeapon.id || item.id == rearWeapon.id || item.id == turretWeapon.id
	};
};

ArmsDealer.createItemIcon = function(item, options) {

  var itemContainer = new PIXI.Container();
  
	var scale = scalingFactor;

	if (options.scale)
    scale = scalingFactor * options.scale;

	var backgroundCol = item.hyper ? Constants.itemColors.hyper : item.ultra ? Constants.itemColors.ultra : item.super ? Constants.itemColors.super :Constants.itemColors.normal;
	var borderCol = item.hyper ? Constants.itemBorders.hyper : item.ultra ? Constants.itemBorders.ultra : item.super ? Constants.itemBorders.super :Constants.itemBorders.normal;

	var border = new PIXI.Graphics();
	border.beginFill(backgroundCol);
	border.lineStyle(2 * gameModel.resolutionFactor, borderCol);
	border.drawRect(0, 0, 128 * scale, 128 * scale);
	border.beginFill(borderCol);
	border.drawRect(0, 0, 128 * scale, 24 * scale);
	itemContainer.addChild(border);

	var levelTooHigh = false;

	if (options.slotLevel && options.slotLevel < item.level) {
		levelTooHigh = true;
	} else {
		if (item.type == "shield" && item.level > gameModel.p1.ship.shieldLevel)
			levelTooHigh = true;

		if (item.type == "weapon" && item.level > Math.max(gameModel.p1.ship.frontWeaponLevel, gameModel.p1.ship.turretWeaponLevel, gameModel.p1.ship.rearWeaponLevel))
			levelTooHigh = true;
	}

	var levelText = getText(item.level, 20 * scale, {
		fill: levelTooHigh ? '#A00' : backgroundCol,
		stroke: levelTooHigh? '#A00' : borderCol,
		strokeThickness: levelTooHigh ? 3 : 0
	});

	levelText.position = {
		x: 3 * scale,
		y: levelTooHigh ? -1 * scale : 1 * scale
	};

	itemContainer.addChild(levelText);

	var comparison;
	if (item.type == "weapon") {
		comparison = ArmsDealer.weaponComparison(item, options.compareItem);
	} else if (item.type == "shield"){
		comparison = ArmsDealer.shieldComparison(item, options.compareItem);
	} else {
		comparison = Shipyard.comparison(item);
	}
	if (comparison.equipped) {

		var equippedText = getText("EQUIPPED", 20 * scale, {
			fill: backgroundCol,
			stroke: backgroundCol
		});

		equippedText.anchor = {x:1, y:0};
		equippedText.position = {
			x: (128 - 5) * scale,
			y: 1 * scale
		};
		equippedText.tint = equippedText.defaultTint = 0xAAAAAA;
		itemContainer.addChild(equippedText);
	} else {

		if (comparison.upgrade) {
			border.beginFill(backgroundCol);
			border.lineStyle(0, borderCol);
			border.drawPolygon([97 * scale, 25 * scale, 110 * scale, 8 * scale, 123 * scale, 25 * scale]);
		} else {
			border.beginFill(borderCol);
			border.lineStyle(0, borderCol);
			border.drawPolygon([97 * scale, 24 * scale, 110 * scale, 40 * scale, 123 * scale, 24 * scale]);
		}
	}

	var price = options.buy ? item.price : item.price / 2;

	var priceText = getText(formatMoney(price) + " Credits", 18 * scale, {
		fill: '#FFF',
		stroke: "#000",
		strokeThickness: 3
	});

	priceText.anchor = {x:0.5, y:1};
	priceText.position = {
		x: 64 * scale,
		y: (128 - 3) * scale
	};

	if (options.loadout) {
		if (item.type == "weapon") {
			priceText.text = formatMoney(item.dps) + " DPS";
		} else {
			priceText.text = formatMoney(item.capacity) + " Capacity";
		}
  }
  
	itemContainer.addChild(priceText);

  priceText.tint = priceText.defaultTint = levelText.tint = levelText.defaultTint = border.tint = border.defaultTint = 0xAAAAAA;
    
  var svgToUse;

  if (item.type == Constants.itemTypes.weapon) {
    svgToUse = Weapons.getIconSvg(item);
  } else if (item.type == Constants.itemTypes.shield) {
    svgToUse = Shields.getIconSvg(item);
  } else {
    svgToUse = "img/ship-emblem-no-shield.svg";
  }

  var pic = new PIXI.Sprite(PIXI.Texture.fromImage(svgToUse, undefined, undefined, 0.4));

  pic.scale.x = pic.scale.y = 0.3 * scale;

  pic.anchor = {x:0.5,y:0.5};
  pic.position = {x:64 * scale,y:64 * scale};

  pic.tint = pic.defaultTint = 0xAAAAAA;

  itemContainer.addChild(pic);

	return itemContainer;
};

ArmsDealer.createItemLayout = function(item, buy, full, noIcon) {

	if (!full)
		return ArmsDealer.createItemIcon(item, {buy:buy});

	var itemContainer = new PIXI.Container();

	var iconWidth = 128;

	if (noIcon)
		iconWidth = 0;

	var name = getText((item.ultra ||  item.hyper ? item.ultraName + "\n": "") + item.name, 22 * scalingFactor, {});

	name.position = {
		x: (iconWidth + 10) * scalingFactor,
		y: 5 * scalingFactor
	};
	name.tint = name.defaultTint = MainMenu.buttonTint;


	var details = getText("", 16 * scalingFactor, {});

	details.position = {
		x: (iconWidth + 10) * scalingFactor,
		y: name.position.y + name.height + 5 * scalingFactor
	};
	details.tint = details.defaultTint = MainMenu.buttonTint;

	var level = getText("", 16 * scalingFactor, {});

	var comparison;
	if (item.type == Constants.itemTypes.weapon) {
		comparison = ArmsDealer.weaponComparison(item);
		details.text = (item.ultra || item.hyper ? item.ultraText + "\n" : "") + formatMoney(item.dps) + " DPS " + comparison.dps + "\n"  + (item.bullets > 1 ? item.bullets + "x " : "") + formatMoney(item.shotsPerSecond) + " Shots per second " + comparison.shotsPerSecond + "\n" + (item.accuracy * 100).toFixed(2) + "% Accuracy " + comparison.accuracy;
		level.text = "Level " + item.level + (comparison.equipped ? " Weapon Slot [EQUIPPED]" : " Weapon Slot Required");
		level.tint = level.defaultTint = item.level > Math.max(gameModel.p1.ship.frontWeaponLevel, gameModel.p1.ship.turretWeaponLevel, gameModel.p1.ship.rearWeaponLevel) ? MainMenu.unselectableTint : MainMenu.buttonTint;
	} else if (item.type == Constants.itemTypes.shield) {
		comparison = ArmsDealer.shieldComparison(item);
		details.text = (item.ultra || item.hyper ? item.ultraText + "\n" : "") + formatMoney(item.capacity) + " Capacity " + comparison.capacity + "\n" + formatMoney(item.chargePerSecond) + " Recharge Rate" + comparison.chargePerSecond + "\n" + item.chargeDelay.toFixed(2) + " Second Recharge Delay " + comparison.chargeDelay;
		level.text = "Level " + item.level + (comparison.equipped ? " Shield Slot [EQUIPPED]" : " Shield Slot Required");
		level.tint = level.defaultTint = item.level > gameModel.p1.ship.shieldLevel ? MainMenu.unselectableTint : MainMenu.buttonTint;
	} else if (item.type == Constants.itemTypes.ship) {
		comparison = Shipyard.comparison(item);
		level.text = "Level " + item.level;
	}

	if (full)
		level.position = {
			x: (iconWidth + 10) * scalingFactor,
			y: details.position.y + details.height + 5 * scalingFactor
		};
	else
		level.position = {
			x: (iconWidth + 10) * scalingFactor,
			y: name.position.y + name.height + 5 * scalingFactor
		};

	var price = getText(buy ? formatMoney(item.price) + " credits" : formatMoney(item.price / 2) + " credits", 16 * scalingFactor, {});

	price.position = {
		x: (iconWidth + 10) * scalingFactor,
		y: level.position.y + level.height + 5 * scalingFactor
	};
	price.tint = price.defaultTint = buy && item.price > gameModel.p1.credits ? MainMenu.unselectableTint : MainMenu.buttonTint;

	itemContainer.addChild(name);
	if (full)
  	itemContainer.addChild(details);
	itemContainer.addChild(level);
	itemContainer.addChild(price);

	if (!noIcon) {
		var icon = ArmsDealer.createItemIcon(item, {buy:buy});
		// icon.anchor = {x:1,y:0};
		icon.position = {x:0, y:10 * scalingFactor};
		icon.children.forEach(function(child) {
			child.tint = 0xFFFFFF;
		});
		itemContainer.addChild(icon);
	}

	return itemContainer;
};



ArmsDealer.initialize = function() {
	if (!ArmsDealer.menuContainer) {
		ArmsDealer.menuContainer = new PIXI.Container();
		gameContainer.addChild(ArmsDealer.menuContainer);
	} else {
		for (var i = ArmsDealer.menuContainer.children.length - 1; i >= 0; i--) {
			var item = ArmsDealer.menuContainer.children[i];
			item.destroy(true);
		}
	}
	ArmsDealer.dialogContainer = false;

	ArmsDealer.gridWidth = Math.floor((renderer.width * 0.9) / ((128 + 4) * scalingFactor));

	ArmsDealer.menuContainer.visible = false;
	ArmsDealer.menuBackground = new PIXI.Graphics();
	ArmsDealer.menuBackground.beginFill(MainMenu.backgroundColor);
	ArmsDealer.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);
	ArmsDealer.menuBackground.alpha = MainMenu.backgroundAlpha;

	ArmsDealer.menuContainer.addChild(ArmsDealer.menuBackground);

	var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

	ArmsDealer.titleText = getText(ArmsDealer.menuTitle, fontSize, {align: 'center'});

	ArmsDealer.titleText.tint = MainMenu.titleTint;
	ArmsDealer.titleText.position = {
		x: renderer.width * 0.05 + 25,
		y: renderer.height * 0.05 + 25
	};
	ArmsDealer.menuContainer.addChild(ArmsDealer.titleText);

	ArmsDealer.currentCredits = getText(formatMoney(gameModel.p1.credits) + " Credits", fontSize, {align: 'center'});

	ArmsDealer.currentCredits.tint = MainMenu.titleTint;
	ArmsDealer.currentCredits.anchor = {
		x: 1,
		y: 0
	};
	ArmsDealer.currentCredits.position = {
		x: renderer.width * 0.95 - 25,
		y: renderer.height * 0.05 + 25
	};
	ArmsDealer.menuContainer.addChild(ArmsDealer.currentCredits);

	ArmsDealer.buyText = getText("Buy  ("+ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder)+")", fontSize, {align: 'center'});

	ArmsDealer.buyText.position = {
		x: renderer.width * 0.4,
		y: renderer.height * 0.05 + 25
	};
	ArmsDealer.buyText.anchor = {
		x: 0.5,
		y: 0
	};
	ArmsDealer.buyText.tint = MainMenu.buttonTint;
	ArmsDealer.buyTab = {
		text: ArmsDealer.buyText,
		click: function() {
			ArmsDealer.tabSelector.clear();
			ArmsDealer.tabSelector.lineStyle(2 * scalingFactor, MainMenu.buttonTint);
			ArmsDealer.tabSelector.drawRect(ArmsDealer.buyText.position.x - (ArmsDealer.buyText.width / 2) - 20 * scalingFactor, ArmsDealer.buyText.position.y - 2, ArmsDealer.buyText.width + 40 * scalingFactor, ArmsDealer.buyText.height + 4);
			ArmsDealer.tabSelector.visible = true;
			ArmsDealer.currentTab = "buy";
			ArmsDealer.buyButtons.forEach(function(button) {
				button.text.visible = true;
			});
			ArmsDealer.sellButtons.forEach(function(button) {
				button.text.visible = false;
			});
			if (ArmsDealer.buyButtons.length > 0)
				ArmsDealer.select(ArmsDealer.buyButtons[0]);
		}
	};
	ArmsDealer.menuContainer.addChild(ArmsDealer.buyText);

	ArmsDealer.tabSelector = new PIXI.Graphics();

	ArmsDealer.menuContainer.addChild(ArmsDealer.tabSelector);

	ArmsDealer.sellText = getText("Sell  ("+ShootrUI.getInputButtonDescription(buttonTypes.rightShoulder)+")", fontSize, {align: 'center'});

	ArmsDealer.sellText.position = {
		x: renderer.width * 0.6,
		y: renderer.height * 0.05 + 25
	};
	ArmsDealer.sellText.anchor = {
		x: 0.5,
		y: 0
	};
	ArmsDealer.sellText.tint = MainMenu.buttonTint;
	ArmsDealer.menuContainer.addChild(ArmsDealer.sellText);

	ArmsDealer.sellAllText = {
		text:getText("Sell Junk", fontSize, {align: 'center'}),
		click : function() {

			var junkItems = [];
			var totalValue = 0;

			// find junk
			gameModel.p1.weapons.forEach(function(weapon) {
				if (weapon.id != gameModel.p1.frontWeapon.id && weapon.id != gameModel.p1.turretWeapon.id && weapon.id != gameModel.p1.rearWeapon.id && !ArmsDealer.weaponComparison(weapon).upgrade) {
					junkItems.push(weapon);
					totalValue += weapon.price / 2;
				}
			});
			gameModel.p1.shields.forEach(function(shield) {
				if (shield.id != gameModel.p1.shield.id && !ArmsDealer.shieldComparison(shield).upgrade) {
					junkItems.push(shield);
					totalValue += shield.price / 2;
				}
			});

			Modal.show({
        text:"Sell " + junkItems.length + " junk items for " + formatMoney(totalValue) + " Credits?",
        ok : function() {

					var weapons = [];

					gameModel.p1.weapons.forEach(function(weapon) {
						var keepItem = true;
						junkItems.forEach(function(junkItem){
							if (junkItem.id === weapon.id)
								keepItem = false;
						});
						if (keepItem)
							weapons.push(weapon);
					});

					gameModel.p1.weapons = weapons;

					var shields = [];
					gameModel.p1.shields.forEach(function(shield) {
						var keepItem = true;
						junkItems.forEach(function(junkItem){
							if (junkItem.id === shield.id)
								keepItem = false;
						});
						if (keepItem)
							shields.push(shield);
					});

					gameModel.p1.shields = shields;

          gameModel.p1.credits += totalValue;
          Sounds.powerup.play();
          save();
					ArmsDealer.initialize();
					ArmsDealer.menuContainer.visible = true;
					ArmsDealer.sellTab.click();
        },
        cancel : function(){

        }
      });

		}
	};

	ArmsDealer.sellAllText.text.position = {
		x: renderer.width * 0.7,
		y: renderer.height * 0.05 + 25
	};
	ArmsDealer.sellAllText.text.anchor = {
		x: 0.5,
		y: 0
	};
	ArmsDealer.sellAllText.text.tint = MainMenu.buttonTint;
	ArmsDealer.menuContainer.addChild(ArmsDealer.sellAllText.text);

	ArmsDealer.sellTab = {
		text: ArmsDealer.sellText,
		click: function() {
			ArmsDealer.tabSelector.clear();
			ArmsDealer.tabSelector.lineStyle(2 * scalingFactor, MainMenu.buttonTint);
			ArmsDealer.tabSelector.drawRect(ArmsDealer.sellText.position.x - (ArmsDealer.sellText.width / 2) - 20 * scalingFactor, ArmsDealer.sellText.position.y - 2, ArmsDealer.sellText.width + 40 * scalingFactor, ArmsDealer.sellText.height + 4);
			ArmsDealer.tabSelector.visible = true;
			ArmsDealer.currentTab = "sell";
			ArmsDealer.buyButtons.forEach(function(button) {
				button.text.visible = false;
			});
			ArmsDealer.sellButtons.forEach(function(button) {
				button.text.visible = true;
			});
			if (ArmsDealer.sellButtons.length > 0)
				ArmsDealer.select(ArmsDealer.sellButtons[0]);
		}
	};

	ArmsDealer.backButton.text = getText(ArmsDealer.backButton.title + " (" + ShootrUI.getInputButtonDescription(ArmsDealer.backButton.buttonDesc) + ")", fontSize, {align: 'center'});

	ArmsDealer.backButton.text.tint = MainMenu.buttonTint;

	ArmsDealer.backButton.text.anchor = {
		x: 0,
		y: 1
	};
	ArmsDealer.backButton.text.position = {
		x: renderer.width * 0.05 + 25,
		y: renderer.height * 0.95 - 25
	};
	ArmsDealer.menuContainer.addChild(ArmsDealer.backButton.text);

	var currentStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
	var seed = currentStar.seed * gameModel.timeStep;

	var level = calculateAdjustedStarLevel(currentStar.level);

	Math.seedrandom(seed);
	ArmsDealer.buyOptions = [];

	// check for recovered items
	if(ArmsDealer.recoveredItems && ArmsDealer.recoveredItems.length > 0) {
		ArmsDealer.recoveredItems.forEach(function(item){
			var alreadyGotIt = false;
			gameModel.p1.weapons.forEach(function(weapon){
				if (weapon.id == item.id)
					alreadyGotIt = true;
			});
			gameModel.p1.shields.forEach(function(shield){
				if (shield.id == item.id)
					alreadyGotIt = true;
			});
			if (!alreadyGotIt)
				ArmsDealer.buyOptions.push(item);
		});
	}

	var numOptions = Math.round(5 + Math.random() * 2);
	for (var j = 0; j <numOptions; j++)
		ArmsDealer.buyOptions.push(Math.random() > 0.8 ? Shields.generateShield(level, seed++, Weapons.rarity[0]) : Weapons.generateWeapon(level, seed++, Weapons.rarity[0]));

	ArmsDealer.buyButtons = [];
	// ArmsDealer.gridWidth = 9
	var colWidth = (renderer.width * 0.9) / ArmsDealer.gridWidth;
	var position = {
		x: colWidth / 2,
		y: ArmsDealer.buyText.position.y + 30 * scalingFactor
	};

	ArmsDealer.buyOptions.forEach(function(item, index) {
		var itemBought = false;
		gameModel.purchaseHistory.forEach(function(history) {
			if (history == item.seed)
				itemBought = true;
		});
		if (!itemBought) {
			var text = ArmsDealer.createItemLayout(item, true);
			text.position.x = position.x;
			text.position.y = position.y;
			ArmsDealer.menuContainer.addChild(text);
			position.x = position.x + colWidth;
			if (position.x > colWidth * ArmsDealer.gridWidth) {
				position = {
					x: colWidth / 2,
					y: position.y + text.height + 30 * scalingFactor
				};
			}

			ArmsDealer.buyButtons.push({
				text: text,
				index: index,
				weapon : item,
				buy : true
			});
		}

	});

	ArmsDealer.sellOptions = [];

	if (gameModel.p1.frontWeapon) ArmsDealer.sellOptions.push(gameModel.p1.frontWeapon);
	if (gameModel.p1.turretWeapon) ArmsDealer.sellOptions.push(gameModel.p1.turretWeapon);
	if (gameModel.p1.rearWeapon) ArmsDealer.sellOptions.push(gameModel.p1.rearWeapon);
	if (gameModel.p1.shield) ArmsDealer.sellOptions.push(gameModel.p1.shield);

	gameModel.p1.weapons.forEach(function(weapon) {
		var included = false;
		ArmsDealer.sellOptions.forEach(function(item){
			if (item.id == weapon.id)
				included = true;
		});
		if (!included) ArmsDealer.sellOptions.push(weapon);
	});
	gameModel.p1.shields.forEach(function(shield) {
		var included = false;
		ArmsDealer.sellOptions.forEach(function(item){
			if (item.id == shield.id)
				included = true;
		});
		if (!included) ArmsDealer.sellOptions.push(shield);
	});
	ArmsDealer.sellButtons = [];
	var sellPosition = {
		x: colWidth / 2,
		y: ArmsDealer.buyText.position.y + 30 * scalingFactor
	};
	ArmsDealer.sellOptions.forEach(function(item, index) {
		var text = ArmsDealer.createItemLayout(item, false);
		text.position.x = sellPosition.x;
		text.position.y = sellPosition.y;
		ArmsDealer.menuContainer.addChild(text);
		sellPosition.x = sellPosition.x + colWidth;
		if (sellPosition.x > colWidth * ArmsDealer.gridWidth) {
			sellPosition = {
				x: colWidth / 2,
				y: sellPosition.y + text.height + 30 * scalingFactor
			};
		}
		ArmsDealer.sellButtons.push({
			text: text,
			index: index,
			weapon : item,
			buy : false
		});
	});

	ArmsDealer.buyTab.click();

};

ArmsDealer.resize = function() {
	if (ArmsDealer.menuContainer) {
		var visible = ArmsDealer.menuContainer.visible;
		ArmsDealer.initialize();
		ArmsDealer.menuContainer.visible = visible;
	}
};

ArmsDealer.checkMouseOver = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	for (var i = 0; i < ArmsDealer.buyButtons.length; i++) {
		if (MainMenu.checkButton(ArmsDealer.buyButtons[i])) {
			ArmsDealer.select(ArmsDealer.buyButtons[i]);
			return true;
		}
	}

	for (i = 0; i < ArmsDealer.sellButtons.length; i++) {
		if (MainMenu.checkButton(ArmsDealer.sellButtons[i])) {
			ArmsDealer.select(ArmsDealer.sellButtons[i]);
			return true;
		}
	}
	// nothing hovered if we get to here so hide the hover
	ArmsDealer.hideItemHover();

	if (ArmsDealer.dialogContainer) {
		if (MainMenu.checkButton(ArmsDealer.dialogCancel)) {
			ArmsDealer.select(ArmsDealer.dialogCancel);
			return true;
		}
		if (MainMenu.checkButton(ArmsDealer.dialogOk)) {
			ArmsDealer.select(ArmsDealer.dialogOk);
			return true;
		}
	}

	if (MainMenu.checkButton(ArmsDealer.buyTab)) {
		ArmsDealer.select(ArmsDealer.buyTab);
		return true;
	}

	if (MainMenu.checkButton(ArmsDealer.sellTab)) {
		ArmsDealer.select(ArmsDealer.sellTab);
		return true;
	}

	if (MainMenu.checkButton(ArmsDealer.sellAllText)) {
		ArmsDealer.select(ArmsDealer.sellAllText);
		return true;
	}

	if (MainMenu.checkButton(ArmsDealer.backButton)) {
		ArmsDealer.select(ArmsDealer.backButton);
		return true;
	}

	return false;
};

ArmsDealer.showDialog = function(index, buy) {

	var item = buy ? ArmsDealer.buyOptions[index] : ArmsDealer.sellOptions[index];

	ArmsDealer.dialogContainer = new PIXI.Container();

	var background = new PIXI.Graphics();
	background.beginFill(MainMenu.modalBackgroundTint);
	background.drawRect(renderer.width * 0.25, renderer.height * 0.2, renderer.width * 0.5, renderer.height * 0.6);
	background.alpha = 0.99;
	ArmsDealer.dialogContainer.addChild(background);

	var itemLayout = ArmsDealer.createItemLayout(item, buy, true);
	itemLayout.position = {x:renderer.width / 2 - itemLayout.width / 2, y:renderer.height/2.5 - itemLayout.height / 2};

	ArmsDealer.dialogContainer.addChild(itemLayout);

	var text = getText(buy ? "Buy for " + formatMoney(item.price * getBuyPriceModifier()) + " credits" : "Sell for " + formatMoney(item.price / 2) + " credits", 22 * scalingFactor, {});
	text.position = {x:renderer.width / 2 - text.width / 2, y:renderer.height * 0.6 - text.height / 2};
	text.tint = MainMenu.buttonTint;
	ArmsDealer.dialogContainer.addChild(text);

	ArmsDealer.dialogOk = {text:getText("Okay", 22 * scalingFactor, {})};
	ArmsDealer.dialogOk.text.position = {x:renderer.width * 0.4 - ArmsDealer.dialogOk.text.width / 2, y:renderer.height * 0.7 - ArmsDealer.dialogOk.text.height / 2};
	ArmsDealer.dialogOk.text.tint = MainMenu.buttonTint;

	ArmsDealer.dialogSelection = "okay";

	ArmsDealer.dialogOk.click = function() {
		if (buy)
			ArmsDealer.buyItem(index);
		else
			ArmsDealer.sellItem(index);
	};
	ArmsDealer.dialogContainer.addChild(ArmsDealer.dialogOk.text);

	ArmsDealer.dialogCancel = {text:getText("Cancel", 22 * scalingFactor, {})};
	ArmsDealer.dialogCancel.text.position = {x:renderer.width * 0.6 - ArmsDealer.dialogCancel.text.width / 2, y:renderer.height * 0.7 - ArmsDealer.dialogCancel.text.height / 2};
	ArmsDealer.dialogCancel.text.tint = MainMenu.buttonTint;
	ArmsDealer.dialogCancel.click = function() {
		ArmsDealer.cancelItem();
	};
	ArmsDealer.dialogContainer.addChild(ArmsDealer.dialogCancel.text);

	ArmsDealer.menuContainer.addChild(ArmsDealer.dialogContainer);

	if (lastUsedInput == inputTypes.controller)  {
		ArmsDealer.select(ArmsDealer.dialogOk);
	}
};

ArmsDealer.cancelItem = function() {
	ArmsDealer.menuContainer.removeChild(ArmsDealer.dialogContainer);
	// ArmsDealer.dialogContainer.destroy(true);
	// ArmsDealer.dialogContainer = false;
};

ArmsDealer.buyItem = function(index) {
	var item = ArmsDealer.buyOptions[index];
	if (item.price * getBuyPriceModifier() <= gameModel.p1.credits) {
		gameModel.p1.credits -= item.price * getBuyPriceModifier();
		gameModel.purchaseHistory.push(item.seed);

		if (item.type == "weapon") {
			gameModel.p1.weapons.push(item);
		} else {
			gameModel.p1.shields.push(item);
		}

		save();
		ArmsDealer.initialize();
		ArmsDealer.menuContainer.visible = true;
		Sounds.powerup.play();
	} else {
		Sounds.enemyShot.play();
	}
};

ArmsDealer.sellItem = function(index) {
	var item = ArmsDealer.sellOptions[index];
	gameModel.p1.credits += item.price / 2;

	if (item.type == "weapon") {
		var weapons = [];
		gameModel.p1.weapons.forEach(function(weapon) {
			if (weapon.id != item.id)
				weapons.push(weapon);
		});
		if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.id == item.id)
			gameModel.p1.frontWeapon = undefined;

		if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.id == item.id)
			gameModel.p1.turretWeapon = undefined;

		if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.id == item.id)
			gameModel.p1.rearWeapon = undefined;

		gameModel.p1.weapons = weapons;
	} else {
		var shields = [];
		gameModel.p1.shields.forEach(function(shield) {
			if (shield.id != item.id)
				shields.push(shield);
		});

		if (gameModel.p1.shield && gameModel.p1.shield.id == item.id)
			gameModel.p1.shield = undefined;

		gameModel.p1.shields = shields;
	}

	save();
	ArmsDealer.initialize();
	ArmsDealer.menuContainer.visible = true;
	Sounds.powerup.play();
	ArmsDealer.sellTab.click();

	if (ArmsDealer.sellButtons[index]) {
		ArmsDealer.select(ArmsDealer.sellButtons[index]);
	} else {
		if (ArmsDealer.sellButtons[index - 1]) {
			ArmsDealer.select(ArmsDealer.sellButtons[index - 1]);
		}
	}
};

ArmsDealer.checkClicks = function() {

	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (MainMenu.checkButton(ArmsDealer.backButton)) {
		ArmsDealer.backButton.click();
		return true;
	}

	if (MainMenu.checkButton(ArmsDealer.buyTab)) {
		ArmsDealer.buyTab.click();
		return true;
	}
	if (MainMenu.checkButton(ArmsDealer.sellTab)) {
		ArmsDealer.sellTab.click();
		return true;
	}
	if (MainMenu.checkButton(ArmsDealer.sellAllText)) {
		ArmsDealer.sellAllText.click();
		return true;
	}

	if (ArmsDealer.dialogContainer) {
		if (MainMenu.checkButton(ArmsDealer.dialogCancel)) {
			ArmsDealer.dialogCancel.click();
		}
		if (ArmsDealer.dialogContainer && MainMenu.checkButton(ArmsDealer.dialogOk)) {
			ArmsDealer.dialogOk.click();
		}
	}


	ArmsDealer.buyButtons.forEach(function(button) {
		if (MainMenu.checkButton(button)) {
// 			ArmsDealer.buyItem(button.index);
			ArmsDealer.showDialog(button.index, true);
			return true;
		}
	});

	ArmsDealer.sellButtons.forEach(function(button) {
		if (MainMenu.checkButton(button)) {
// 			ArmsDealer.sellItem(button.index);
			ArmsDealer.showDialog(button.index, false);
			return true;
		}
	});

	return false;
};

ArmsDealer.select = function(button) {
	if (!button || !button.text)
		return;

	ArmsDealer.backButton.text.tint = MainMenu.buttonTint;
	ArmsDealer.buyTab.text.tint = MainMenu.buttonTint;
	ArmsDealer.sellTab.text.tint = MainMenu.buttonTint;
	ArmsDealer.sellAllText.text.tint = MainMenu.buttonTint;

	if (ArmsDealer.dialogContainer) {
		ArmsDealer.dialogCancel.text.tint = MainMenu.buttonTint;
		ArmsDealer.dialogOk.text.tint = MainMenu.buttonTint;
	}

	ArmsDealer.buyButtons.forEach(function(buyButton, index) {
		if (buyButton.index == button.index && ArmsDealer.currentTab == "buy")
			ArmsDealer.currentSelection = index;
		buyButton.text.children.forEach(function(child) {
			child.tint = child.defaultTint;
		});
	});

	ArmsDealer.sellButtons.forEach(function(sellButton, index) {
		if (sellButton.index == button.index && ArmsDealer.currentTab == "sell")
			ArmsDealer.currentSelection = index;
		sellButton.text.children.forEach(function(child) {
			if (child.tint != Loadout.invalidLevelTint)
				child.tint = child.defaultTint;
		});
	});

	if (button.text.children && button.text.children.length > 0)
		button.text.children.forEach(function(child) {
			if (child.tint != Loadout.invalidLevelTint)
				child.tint = MainMenu.selectedButtonTint;
		});
	else
		button.text.tint = MainMenu.selectedButtonTint;

	if (button.weapon)
		ArmsDealer.showItemHover(button);
};

ArmsDealer.moveSelection = function(colDelta, rowDelta) {
	var buttons = ArmsDealer.currentTab == "buy" ? ArmsDealer.buyButtons : ArmsDealer.sellButtons;
	var selection = gridSelection(colDelta, rowDelta, ArmsDealer.currentSelection, buttons.length, ArmsDealer.gridWidth);
	ArmsDealer.select(buttons[selection]);
};

ArmsDealer.up = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (ArmsDealer.dialogContainer) {
		if (ArmsDealer.dialogSelection == "okay") {
			ArmsDealer.dialogSelection = "cancel";
			ArmsDealer.select(ArmsDealer.dialogCancel);
		}
		else {
			ArmsDealer.dialogSelection = "okay";
			ArmsDealer.select(ArmsDealer.dialogOk);
		}
		return true;
	}

	ArmsDealer.moveSelection(0, -1);

	return true;
};

ArmsDealer.down = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (ArmsDealer.dialogContainer) {
		if (ArmsDealer.dialogSelection == "okay") {
			ArmsDealer.dialogSelection = "cancel";
			ArmsDealer.select(ArmsDealer.dialogCancel);
		}
		else {
			ArmsDealer.dialogSelection = "okay";
			ArmsDealer.select(ArmsDealer.dialogOk);
		}
		return true;
	}

	ArmsDealer.moveSelection(0, 1);

	return true;
};

ArmsDealer.left = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (ArmsDealer.dialogContainer) {
		if (ArmsDealer.dialogSelection == "okay") {
			ArmsDealer.dialogSelection = "cancel";
			ArmsDealer.select(ArmsDealer.dialogCancel);
		}
		else {
			ArmsDealer.dialogSelection = "okay";
			ArmsDealer.select(ArmsDealer.dialogOk);
		}
		return true;
	}

	ArmsDealer.moveSelection(-1, 0);

	return true;
};

ArmsDealer.right = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (ArmsDealer.dialogContainer) {
		if (ArmsDealer.dialogSelection == "okay") {
			ArmsDealer.dialogSelection = "cancel";
			ArmsDealer.select(ArmsDealer.dialogCancel);
		}
		else {
			ArmsDealer.dialogSelection = "okay";
			ArmsDealer.select(ArmsDealer.dialogOk);
		}
		return true;
	}

	ArmsDealer.moveSelection(1, 0);

	return true;
};

ArmsDealer.aButtonPress = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (ArmsDealer.dialogContainer) {
		if (ArmsDealer.dialogSelection == "okay")
			ArmsDealer.dialogOk.click();
		else
			ArmsDealer.dialogCancel.click();
		return true;
	}

	if (ArmsDealer.currentTab == "buy" && ArmsDealer.buyButtons.length > ArmsDealer.currentSelection)
		ArmsDealer.showDialog(ArmsDealer.buyButtons[ArmsDealer.currentSelection].index, true);

	if (ArmsDealer.currentTab == "sell" && ArmsDealer.sellButtons.length > ArmsDealer.currentSelection)
		ArmsDealer.showDialog(ArmsDealer.sellButtons[ArmsDealer.currentSelection].index, false);

	return true;
};

ArmsDealer.bButtonPress = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	if (ArmsDealer.dialogContainer) {
		ArmsDealer.dialogCancel.click();
		return true;
	}

	ArmsDealer.backButton.click();
	return true;
};

ArmsDealer.l1ButtonPress = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	ArmsDealer.buyTab.click();
	return true;
};

ArmsDealer.r1ButtonPress = function() {
	if (!ArmsDealer.menuContainer || !ArmsDealer.menuContainer.visible)
		return false;

	ArmsDealer.sellTab.click();
	return true;
};


ArmsDealer.showItemHover = function(button) {
  if (lastUsedInput == inputTypes.controller)
    return;

  if (ArmsDealer.itemHover && ArmsDealer.itemHover.item.id != button.weapon.id) {
		ArmsDealer.itemHover.destroy(true);
    ArmsDealer.itemHover = false;
  }
  if (!ArmsDealer.itemHover) {
    ArmsDealer.itemHover = new PIXI.Container();
    var itemDetails = ArmsDealer.createItemLayout(button.weapon, button.buy, true, true);
    var bg = new PIXI.Graphics();
    bg.beginFill(MainMenu.modalBackgroundTint);
    bg.drawRect(0,0,itemDetails.getBounds().width + itemDetails.getBounds().x * 2,itemDetails.getBounds().height + itemDetails.getBounds().y * 2);
    bg.alpha = 0.95;
    ArmsDealer.itemHover.addChild(bg);
    ArmsDealer.itemHover.addChild(itemDetails);
    ArmsDealer.itemHover.item = button.weapon;
    ArmsDealer.menuContainer.addChild(ArmsDealer.itemHover);
  }
  if (ArmsDealer.itemHover) {
    var hoverPositionX = cursorPosition.x;
    var hoverPositionY = cursorPosition.y;

    if (lastUsedInput == inputTypes.controller) {
      var buttonBounds = button.text.getBounds();
      hoverPositionX = buttonBounds.x < renderer.width / 2 ? buttonBounds.x + buttonBounds.width : buttonBounds.x;
      hoverPositionY = buttonBounds.y;
    }
    var bounds = ArmsDealer.itemHover.getBounds();
    if (renderer.width / 2 > hoverPositionX) {
      ArmsDealer.itemHover.position = {x:hoverPositionX, y:Math.min(hoverPositionY, renderer.height - bounds.height - 50 * scalingFactor)};
    } else {
      ArmsDealer.itemHover.position = {x:hoverPositionX - bounds.width,y:Math.min(hoverPositionY, renderer.height - bounds.height - 50 * scalingFactor)};
    }
  }
};

ArmsDealer.hideItemHover = function() {
  if (ArmsDealer.itemHover) {
		ArmsDealer.itemHover.destroy(true);
    ArmsDealer.itemHover = false;
  }
};
