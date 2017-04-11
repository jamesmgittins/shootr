var GameText = {
	initialize:function(){
		GameText.status.initialize();
		GameText.credits.initialize();
		GameText.damage.initialize();
		GameText.bigText.initialize();
		GameText.levelComplete.initialize();
	},
	update:function(timeDiff) {
		GameText.status.update(timeDiff);
		GameText.credits.update(timeDiff);
		GameText.bigText.update(timeDiff);
		GameText.damage.update(timeDiff);
		GameText.levelComplete.update(timeDiff);
	},
	resize:function(){
		GameText.status.resize();
		GameText.credits.resize();
		GameText.bigText.resize();
		GameText.damage.resize();
	}
};

GameText.shieldDisplay = {
	tintMod:1.5,
	tintNumber:0,
	startRgb : hexToRgb("#0D47A1"),
	endRgb : hexToRgb("#1976D2"),
	create:function(container) {

		var sideSpace = (renderer.width - renderer.height) / 2;
		var maxHeight = renderer.height * 0.3;

		GameText.shieldDisplay.shieldContainer = new PIXI.Container();


		var maskSprite = PIXI.Sprite.fromImage("img/ship-emblem.svg");

		GameText.shieldDisplay.shieldContainer.mask = maskSprite;
		GameText.shieldDisplay.shieldContainer.addChild(maskSprite);

		var background = new PIXI.Graphics();
		background.beginFill(0xFFFFFF);
		background.drawRect(0, 0, maskSprite.width, maskSprite.height);
		background.tint = 0x560b0b;
		GameText.shieldDisplay.shieldContainer.addChild(background);

		GameText.shieldDisplay.shieldLevel = new PIXI.Graphics();
		GameText.shieldDisplay.shieldLevel.beginFill(0xFFFFFF);
		GameText.shieldDisplay.shieldLevel.drawRect(0, 0, maskSprite.width, maskSprite.height);
		GameText.shieldDisplay.shieldLevel.tint = 0x0D47A1;

		GameText.shieldDisplay.shieldContainer.addChild(GameText.shieldDisplay.shieldLevel);

		GameText.shieldDisplay.shieldContainer.scale.x = GameText.shieldDisplay.shieldContainer.scale.y = sideSpace > maxHeight ? maxHeight / maskSprite.width : sideSpace / maskSprite.width;

		GameText.shieldDisplay.shieldContainer.position.y = renderer.height - (maskSprite.height * GameText.shieldDisplay.shieldContainer.scale.y);
		GameText.shieldDisplay.shieldContainer.position.x = (sideSpace - (maskSprite.height * GameText.shieldDisplay.shieldContainer.scale.y)) / 2;

		container.addChild(GameText.shieldDisplay.shieldContainer);
	},
	update:function(timeDiff) {
		var percentage = PlayerShip.playerShip.currShield / PlayerShip.playerShip.maxShield;

		// update shield display
		if (GameText.shieldDisplay.percentage != percentage) {
			GameText.shieldDisplay.shieldLevel.clear();
			GameText.shieldDisplay.shieldLevel.beginFill(0xFFFFFF);
			var bounds = GameText.shieldDisplay.shieldContainer.mask;
			GameText.shieldDisplay.shieldLevel.drawRect(
				0,
				bounds.height - (bounds.height * percentage),
				bounds.width,
				bounds.height);
			GameText.shieldDisplay.shieldLevel.tint = 0x0D47A1;
			GameText.shieldDisplay.percentage = percentage;
		}

		if (PlayerShip.playerShip.lastDmg >= PlayerShip.playerShip.shieldDelay) {

			GameText.shieldDisplay.tintNumber += GameText.shieldDisplay.tintMod * timeDiff;

			var colorFactor = Math.max(0,Math.min(1,GameText.shieldDisplay.tintNumber));
			GameText.shieldDisplay.shieldLevel.tint = rgbToHex(
				GameText.shieldDisplay.startRgb.r + (GameText.shieldDisplay.endRgb.r - GameText.shieldDisplay.startRgb.r) * colorFactor,
				GameText.shieldDisplay.startRgb.g + (GameText.shieldDisplay.endRgb.g - GameText.shieldDisplay.startRgb.g) * colorFactor,
				GameText.shieldDisplay.startRgb.b + (GameText.shieldDisplay.endRgb.b - GameText.shieldDisplay.startRgb.b) * colorFactor
			);


			if (GameText.shieldDisplay.tintNumber >= 1 && GameText.shieldDisplay.tintMod > 0)
						GameText.shieldDisplay.tintMod *= -1;

			if (GameText.shieldDisplay.tintNumber <= 0 && GameText.shieldDisplay.tintMod < 0)
						GameText.shieldDisplay.tintMod *= -1;
		}
	}
};

GameText.status = {
	lootIcons:[],
	initialize: function() {
		if (GameText.status.container) {
			for (var i = GameText.status.container.children.length - 1; i >= 0; i--) {
				var item = GameText.status.container.children[i];
				GameText.status.container.removeChild(item);
				item.destroy();
			}
		} else {
			GameText.status.container = new PIXI.Container();
			gameContainer.addChild(GameText.status.container);
		}

		var sideSpace = (renderer.width - renderer.height) / 2;
		var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
		var barWidth = Math.round(sideSpace / 8);

		GameText.status.enemies = new PIXI.Text(distance.toFixed(1) + " Light Years to Target", {
			font: fontSize + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 0,
			align: 'center'
		});
		GameText.status.enemies.tint = MainMenu.buttonTint;
		GameText.status.enemies.anchor = {
			x: 0.5,
			y: 0.5
		};
		GameText.status.enemies.position = {
			x: Math.max(sideSpace / 2, GameText.status.enemies.getBounds().width / 1.9),
			y: 80 * scalingFactor
		};

		GameText.status.container.addChild(GameText.status.enemies);

		GameText.status.credits = new PIXI.Text(formatMoney(gameModel.p1.credits) + " credits", {
			font: fontSize + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 0,
			align: 'center'
		});
		GameText.status.credits.lastCredits = 0;
		GameText.status.credits.timer = 1;
		GameText.status.credits.tint = MainMenu.buttonTint;
		GameText.status.credits.anchor = {
			x: 0.5,
			y: 0.5
		};
		GameText.status.credits.position = {
			x: Math.max(sideSpace / 2, GameText.status.credits.getBounds().width / 1.5),
			y: 30 * scalingFactor
		};

		GameText.status.container.addChild(GameText.status.credits);


		GameText.status.fps = new PIXI.Text('60 fps', {
			font: fontSize + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 0,
			align: 'center'
		});
		GameText.status.fps.tint = MainMenu.buttonTint;
		GameText.status.fps.anchor = {
			x: 0.5,
			y: 0
		};
		GameText.status.fps.position = {
			x: renderer.width - GameText.status.fps.getBounds().width / 1.5,
			y: 0
		};

		GameText.status.container.addChild(GameText.status.fps);

		// distance plot
		GameText.status.distanceLine = new PIXI.Graphics();
		GameText.status.distanceLine.lineStyle(Math.round(1 * scalingFactor), Constants.itemColors.super);
		GameText.status.distanceLine.moveTo(barWidth, 110 * scalingFactor);
		GameText.status.distanceLine.lineTo(sideSpace - barWidth, 110 * scalingFactor);
		GameText.status.container.addChild(GameText.status.distanceLine);

		GameText.status.distanceMarker = new PIXI.Graphics();
		GameText.status.distanceMarker.lineStyle(Math.round(1 * scalingFactor), MainMenu.buttonTint);
		GameText.status.distanceMarker.moveTo(barWidth, 102 * scalingFactor);
		GameText.status.distanceMarker.lineTo(barWidth, 118 * scalingFactor);
		GameText.status.container.addChild(GameText.status.distanceMarker);


		GameText.shieldDisplay.create(GameText.status.container);

		GameText.status.lootContainer = new PIXI.Container();
		GameText.status.container.addChild(GameText.status.lootContainer);

		GameText.status.gameBorder = new PIXI.Graphics();
		GameText.status.gameBorder.lineStyle(1, 0xFFFFFF);
		GameText.status.gameBorder.drawRect(sideSpace, -5, renderer.height, renderer.height + 10);
		GameText.status.gameBorder.tint = 0x005500;

		GameText.status.container.addChild(GameText.status.gameBorder);

		GameText.status.container.visible = false;
	},
	show: function() {
		GameText.status.initialize();
		GameText.status.container.visible = true;
		GameText.shieldDisplay.percentage = 0;
	},
	hide: function() {
		GameText.status.container.visible = false;
	},
	update: function(timeDiff) {
		if (!GameText.status.container.visible)
			return;

		var sideSpace = (renderer.width - renderer.height) / 2;
		var barWidth = Math.round(sideSpace / 8);

		GameText.shieldDisplay.update(timeDiff);

		var distanceMarkerPosition = barWidth + (sideSpace - (barWidth * 2)) - ((Math.max(0, timeLeft) / levelTime) * (sideSpace - (barWidth * 2)));
		GameText.status.distanceMarker.clear();
		GameText.status.distanceMarker.lineStyle(Math.round(1 * scalingFactor), MainMenu.buttonTint);
		GameText.status.distanceMarker.moveTo(distanceMarkerPosition, 102 * scalingFactor);
		GameText.status.distanceMarker.lineTo(distanceMarkerPosition, 118 * scalingFactor);

		GameText.status.enemies.text = (distance * Math.max(0, timeLeft) / levelTime).toFixed(1) + " Light Years to Target";
		GameText.status.fps.text = fps + " fps";

		GameText.status.credits.timer += timeDiff;
		var creditChange = calculateIncomeSinceLastCheck(500);
		if (GameText.status.credits.lastCredits != gameModel.p1.temporaryCredits || creditChange > 0) {
			GameText.status.credits.text = formatMoney(gameModel.p1.credits) + " credits\n+ " + formatMoney(gameModel.p1.temporaryCredits);
			if (GameText.status.credits.lastCredits != gameModel.p1.temporaryCredits) {
				GameText.status.credits.lastCredits = gameModel.p1.temporaryCredits;
				GameText.status.credits.timer = 0;
			}
		}
		GameText.status.credits.tint = GameText.status.credits.timer < 0.1 ? MainMenu.selectedButtonTint : MainMenu.buttonTint;

		// if an icon not yet displayed
		if (GameText.status.lootContainer.children.length < GameText.status.lootIcons.length) {

			// get next one and add to container
			var newCrate = GameText.status.lootIcons[GameText.status.lootContainer.children.length];
			newCrate.alpha = 0;
			newCrate.position = {
				x:renderer.width - (sideSpace / 2) - (newCrate.width / 2),
				y:-newCrate.height
			};
			GameText.status.lootContainer.addChild(newCrate);

		}

		// move crates down if needed
		if (GameText.status.lootContainer.children.length > 0 &&
			GameText.status.lootContainer.children[GameText.status.lootContainer.children.length-1].position.y < renderer.height * 0.03) {
			var speed = 160 * scalingFactor * timeDiff;
			GameText.status.lootContainer.children.forEach(function(crate){
				crate.position.y += speed;
				if (crate.alpha < 1) {
					crate.alpha += 1.5 * timeDiff;
				} else {
					crate.alpha = 1;
				}
			});
		}

	},
	resize: function() {
		var visible = GameText.status.container.visible;
		GameText.status.initialize();
		GameText.status.container.visible = visible;
	}
};

GameText.damage = {
	fontSize : 14,
	texts: [],
	discardedText : [],
	speed: -50,
	initialize: function() {
		GameText.damage.container = new PIXI.Container();
		uiContainer.addChild(GameText.damage.container);
	},
	resize: function() {
		var textSize = (GameText.damage.fontSize * scalingFactor).toFixed();
		GameText.damage.texts.forEach(function(text){
			text.style.font = textSize + 'px Dosis';
		});
	},
	update: function(timeDiff) {
		GameText.damage.texts.forEach(function(text){
			if (text.visible) {
				text.alpha -= 1.5 * timeDiff;
				if (text.alpha <= 0) {
					text.visible = false;
					GameText.damage.discardedText.push(text);
				} else {
					text.position.y += (GameText.damage.speed * timeDiff) * scalingFactor;
				}
			}
		});
	},
	newText: function(damage, ship) {

		if (!gameModel.dmgNumbers)
			return;

		var text = false;

		GameText.damage.texts.forEach(function(existingText){
			if (existingText.visible && existingText.shipId == ship.id) {
				text = existingText;
				text.damageValue += damage;
			}
		});

		if (!text) {
			if (GameText.damage.discardedText.length > 0) {
				text = GameText.damage.discardedText.pop();
			} else {
				var textSize = (GameText.damage.fontSize * scalingFactor).toFixed();
				text = new PIXI.Text('+10', {
					font: textSize + 'px Dosis',
					fill: '#FFF',
					stroke: "#000",
					strokeThickness: 0,
					align: 'center'
				});
				text.anchor.set(0.5);
				text.visible = false;
				GameText.damage.container.addChild(text);
				GameText.damage.texts.push(text);
			}
			text.damageValue = damage;
			text.shipId = ship.id;
		}
		text.text = formatMoney(text.damageValue);
		text.visible = true;
		text.position.x = ship.xLoc * scalingFactor;
		text.position.y = (ship.yLoc - 24) * scalingFactor;
		text.alpha = 1;
	}
};

GameText.credits = {
	maxTexts: 10,
	currText: 0,
	texts: [],
	speed: -50,
	initialize: function() {
		GameText.credits.container = new PIXI.Container();

		for (var i = 0; i < GameText.credits.maxTexts; i++) {
			var textSize = (20 * scalingFactor).toFixed();
			GameText.credits.texts[i] = new PIXI.Text('+10', {
				font: textSize + 'px Dosis',
				fill: '#FFF',
				stroke: "#000",
				strokeThickness: 0,
				align: 'center'
			});
			GameText.credits.texts[i].tint = MainMenu.buttonTint;
			GameText.credits.texts[i].anchor.set(0.5);
			GameText.credits.texts[i].visible = false;
			GameText.credits.container.addChild(GameText.credits.texts[i]);
		}

		uiContainer.addChild(GameText.credits.container);
	},
	resize: function() {
		var textSize = (20 * scalingFactor).toFixed();
		for (var i = 0; i < GameText.credits.maxTexts; i++) {
			GameText.credits.texts[i].style.font = textSize + 'px Dosis';
		}
	},
	update: function(timeDiff) {
		for (var i = 0; i < GameText.credits.maxTexts; i++) {
			if (GameText.credits.texts[i].visible) {
				GameText.credits.texts[i].alpha -= 0.3 * timeDiff;
				if (GameText.credits.texts[i].alpha <= 0) {
					GameText.credits.texts[i].visible = false;
				} else {
					GameText.credits.texts[i].position.y += (GameText.credits.speed * timeDiff) * scalingFactor;
				}
			}
		}
	},
	newCreditText: function(x, y, text) {
		GameText.credits.currText++;
		if (GameText.credits.currText >= GameText.credits.maxTexts) {
			GameText.credits.currText = 0;
		}
		GameText.credits.texts[GameText.credits.currText].visible = true;
		GameText.credits.texts[GameText.credits.currText].text = text;
		GameText.credits.texts[GameText.credits.currText].position.x = x * scalingFactor;
		GameText.credits.texts[GameText.credits.currText].position.y = y * scalingFactor;
		GameText.credits.texts[GameText.credits.currText].alpha = 1;
	}
};

GameText.bigText = {
	maxTexts: 3,
	currText: 0,
	texts: [],
	speed: -50,
	resize: function() {
		var textSize = (32 * scalingFactor).toFixed();
		for (var i = 0; i < GameText.bigText.maxTexts; i++) {
			GameText.bigText.texts[i].style.font = textSize + 'px Dosis';
		}
	},
	initialize: function() {
		GameText.bigText.container = new PIXI.Container();

		var textSize = (32 * scalingFactor).toFixed();

		for (var i = 0; i < GameText.bigText.maxTexts; i++) {
			GameText.bigText.texts[i] = new PIXI.Text('+10', {
				font: textSize + 'px Dosis',
				fill: '#FFF',
				stroke: "#000",
				strokeThickness: 0,
				align: 'center'
			});
			GameText.bigText.texts[i].tint = MainMenu.buttonTint;
			GameText.bigText.texts[i].anchor.set(0.5);
			GameText.bigText.texts[i].visible = false;
			GameText.bigText.container.addChild(GameText.bigText.texts[i]);
		}

		uiContainer.addChild(GameText.bigText.container);
	},
	update: function(timeDiff) {
		for (var i = 0; i < GameText.bigText.maxTexts; i++) {
			if (GameText.bigText.texts[i].visible) {
				GameText.bigText.texts[i].alpha -= 0.3 * timeDiff;
				if (GameText.bigText.texts[i].alpha <= 0) {
					GameText.bigText.texts[i].visible = false;
				} else {
					GameText.bigText.texts[i].position.y += (GameText.bigText.speed * timeDiff) * scalingFactor;
				}
			}
		}
	},
	newBigText: function(text) {
		GameText.bigText.currText++;
		if (GameText.bigText.currText >= GameText.bigText.maxTexts) {
			GameText.bigText.currText = 0;
		}
		GameText.bigText.texts[GameText.bigText.currText].visible = true;
		GameText.bigText.texts[GameText.bigText.currText].text = text;
		GameText.bigText.texts[GameText.bigText.currText].position.x = (canvasWidth / 2) * scalingFactor;
		GameText.bigText.texts[GameText.bigText.currText].position.y = (canvasHeight / 2) * scalingFactor;
		GameText.bigText.texts[GameText.bigText.currText].alpha = 1;
	}
};

GameText.levelComplete = {
	secondsPerLoot:3,
	lastButtonPress : 0,
	lootTimer:0,
	lastParticle:0,
	lootLayouts:[],
	update:function(timeDiff){
		if (!this.container.visible)
			return;

		this.lastParticle += timeDiff;
		this.lastButtonPress += timeDiff;

		if (this.lastParticle > 0.5) {
			this.lastParticle = 0;
			var sideSpace = (renderer.width - renderer.height) / 2;
			Stars.powerupParts.newPowerupPart(renderer.width * Math.random() - sideSpace, renderer.height * Math.random());
		}
		var currentIndex;
		if (this.lootOpening) {
			this.lootTimer += timeDiff;
			currentIndex = Math.floor(this.lootTimer / this.secondsPerLoot);

			if (this.lootLayouts[currentIndex - 1]) {
				this.lootLayouts[currentIndex - 1].visible = false;
			}

			var currentLayout = this.lootLayouts[currentIndex];
			if (currentLayout) {
				currentLayout.visible = true;
				currentLayout.scale.x = currentLayout.scale.y = Math.min(this.lootTimer - currentIndex * this.secondsPerLoot, 1);
				currentLayout.position = {x:renderer.width / 2 - (currentLayout.width / 2), y:renderer.height / 2 - (currentLayout.height / 2)};
			}

			if (this.lootTimer > gameModel.lootCollected.length * this.secondsPerLoot) {
				this.lootLayouts.forEach(function(layout){layout.visible=false;});
				this.textMessage.text = "Level Complete\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to Continue";
				this.textMessage.visible = true;
			}
		}

		if ((playerOneButtonsPressed[0] || spaceBar || this.clicked) && this.lastButtonPress > 0.4) {

			this.clicked = false;
			this.lastButtonPress = 0;

			if (this.lootOpening) {
				currentIndex = Math.floor(this.lootTimer / this.secondsPerLoot);
				this.lootTimer = (currentIndex + 1) * this.secondsPerLoot;
			}
			if (gameModel.lootCollected.length > 0 && this.lootTimer === 0) {
				this.lootOpening = true;
				this.textMessage.visible = false;
			}
			if (gameModel.lootCollected.length === 0 || this.lootTimer > gameModel.lootCollected.length * this.secondsPerLoot) {
				changeState(states.station);
			}
		}
	},
	initialize:function() {
		this.container = new PIXI.Container();
		gameContainer.addChild(this.container);
		this.container.visible=false;
	},
	show:function() {
		this.container.visible = true;
		this.lootOpening = false;
		this.lootTimer = 0;

		this.textMessage = new PIXI.Text("Level Complete\nYou have collected "  + formatMoney(gameModel.p1.temporaryCredits) + " credits\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to Continue", {
			font: 32 * scalingFactor + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 0,
			align: 'center'
		});
		this.textMessage.tint = MainMenu.buttonTint;
		this.textMessage.anchor = {x:0.5,y:0.5};
		this.textMessage.position = {x:renderer.width / 2, y:renderer.height / 2};

		this.container.addChild(this.textMessage);

		if (gameModel.lootCollected.length > 0) {
			this.textMessage.text = "Level Complete\nYou have collected "  + formatMoney(gameModel.p1.temporaryCredits) + " credits\nand " + gameModel.lootCollected.length + " crate" + (gameModel.lootCollected.length>1?"s":"") + "\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to inspect the contents";
			this.lootLayouts.forEach(function(layout) {
				layout.position = {x:renderer.width / 2 - (layout.width / 2), y:renderer.height / 2 - (layout.height / 2)};
				layout.visible = false;
				GameText.levelComplete.container.addChild(layout);
			});
		}
	},
	hide:function() {
		this.container.visible=false;

		var arr = this.container.children;
		arr.forEach(function(ele){
			GameText.levelComplete.container.removeChild(ele);
			ele.destroy();
		});
	},
	checkForClick:function() {
		if (this.container.visible)
			this.clicked = true;
	}
};
