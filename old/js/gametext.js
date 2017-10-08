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

GameText.status = {
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

		GameText.status.enemies = new PIXI.Text(distance.toFixed(1) + " Light Years From Destination", {
			font: fontSize + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
			align: 'center'
		});
		GameText.status.enemies.tint = MainMenu.buttonTint;
		GameText.status.enemies.anchor = {
			x: 0.5,
			y: 0.5
		};
		GameText.status.enemies.position = {
			x: Math.max(sideSpace / 2, GameText.status.enemies.getBounds().width / 1.9),
			y: 100 * scalingFactor
		};

		GameText.status.container.addChild(GameText.status.enemies);

		GameText.status.credits = new PIXI.Text(formatMoney(gameModel.p1.credits) + " credits", {
			font: fontSize + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
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
			strokeThickness: 1,
			align: 'center'
		});
		GameText.status.fps.tint = MainMenu.buttonTint;
		GameText.status.fps.anchor = {
			x: 0.5,
			y: 0.5
		};
		GameText.status.fps.position = {
			x: renderer.width - Math.max(sideSpace / 2, GameText.status.fps.getBounds().width / 1.5),
			y: 80
		};

		GameText.status.container.addChild(GameText.status.fps);

		// distance plot
		GameText.status.distanceLine = new PIXI.Graphics();
		GameText.status.distanceLine.lineStyle(Math.round(1 * scalingFactor), 0x808080);
		GameText.status.distanceLine.moveTo(barWidth, 150 * scalingFactor);
		GameText.status.distanceLine.lineTo(sideSpace - barWidth, 150 * scalingFactor);
		GameText.status.container.addChild(GameText.status.distanceLine);

		GameText.status.distanceMarker = new PIXI.Graphics();
		GameText.status.distanceMarker.lineStyle(Math.round(1 * scalingFactor), 0x808080);
		GameText.status.distanceMarker.moveTo(barWidth, 140 * scalingFactor);
		GameText.status.distanceMarker.lineTo(barWidth, 160 * scalingFactor);
		GameText.status.container.addChild(GameText.status.distanceMarker);

		// shield bar stuff
		GameText.status.shieldBarBackground = new PIXI.Graphics();
		GameText.status.shieldBarBackground.beginFill(0x200000);
		GameText.status.shieldBarBackground.drawRect(sideSpace - barWidth * 3, renderer.height * 0.5, barWidth, renderer.height * 0.45);

		GameText.status.container.addChild(GameText.status.shieldBarBackground);

		GameText.status.shieldLabel = new PIXI.Text('S\nH\nI\nE\nL\nD', {
			font: Math.round(10 * scalingFactor) + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
			align: 'center'
		});
		GameText.status.shieldLabel.tint = MainMenu.buttonTint;
		GameText.status.shieldLabel.anchor = {
			x: 0.5,
			y: 0.5
		};
		GameText.status.shieldLabel.position = {
			x: sideSpace - barWidth * 3.2,
			y: (renderer.height * 0.5) + (renderer.height * 0.225)
		};

		GameText.status.container.addChild(GameText.status.shieldLabel);

		GameText.status.shieldBar = new PIXI.Graphics();
		GameText.status.shieldBar.beginFill(0xFFFFFF);
		GameText.status.shieldBar.drawRect(sideSpace - barWidth * 3, renderer.height * 0.5, barWidth, renderer.height * 0.45);

		GameText.status.container.addChild(GameText.status.shieldBar);

		GameText.status.shieldOutline = new PIXI.Graphics();
		GameText.status.shieldOutline.lineStyle(1, 0xFFFFFF);
		GameText.status.shieldOutline.drawRect(sideSpace - 2 - barWidth * 3, renderer.height * 0.5 - 2, barWidth + 4, renderer.height * 0.45 + 4);
		GameText.status.shieldOutline.tint = 0x005500;

		GameText.status.container.addChild(GameText.status.shieldOutline);

		GameText.status.shieldText = new PIXI.Text('', {
			font: Math.round(10 * scalingFactor) + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
			align: 'center'
		});
		GameText.status.shieldText.tint = MainMenu.buttonTint;
		GameText.status.shieldText.anchor = {
			x: 0.5,
			y: 0
		};
		GameText.status.shieldText.position = {
			x: sideSpace - barWidth * 2.5,
			y: renderer.height * 0.6
		};

		GameText.status.container.addChild(GameText.status.shieldText);

		// charge bar stuff
		GameText.status.chargeBarBackground = new PIXI.Graphics();
		GameText.status.chargeBarBackground.beginFill(0x200000);
		GameText.status.chargeBarBackground.drawRect(2 * barWidth, renderer.height * 0.5, barWidth, renderer.height * 0.45);

		GameText.status.container.addChild(GameText.status.chargeBarBackground);

		GameText.status.chargeLabel = new PIXI.Text('C\nH\nA\nR\nG\nE', {
			font: Math.round(10 * scalingFactor) + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
			align: 'center'
		});
		GameText.status.chargeLabel.tint = MainMenu.buttonTint;
		GameText.status.chargeLabel.anchor = {
			x: 0.5,
			y: 0.5
		};
		GameText.status.chargeLabel.position = {
			x: barWidth * 1.8,
			y: (renderer.height * 0.5) + (renderer.height * 0.225)
		};

		GameText.status.container.addChild(GameText.status.chargeLabel);

		GameText.status.chargeBar = new PIXI.Graphics();
		GameText.status.chargeBar.beginFill(0xFFFFFF);
		GameText.status.chargeBar.drawRect(barWidth * 2, renderer.height * 0.5, barWidth, renderer.height * 0.45);
		GameText.status.chargeBar.tintNumber = 0;
		GameText.status.chargeBar.tintMod = 600;

		GameText.status.container.addChild(GameText.status.chargeBar);

		GameText.status.chargeOutline = new PIXI.Graphics();
		GameText.status.chargeOutline.lineStyle(1, 0xFFFFFF);
		GameText.status.chargeOutline.drawRect(2 * barWidth - 2, renderer.height * 0.5 - 2, barWidth + 4, renderer.height * 0.45 + 4);
		GameText.status.chargeOutline.tint = 0x005500;

		GameText.status.container.addChild(GameText.status.chargeOutline);

		GameText.status.superChargeText = new PIXI.Text('Press A', {
			font: Math.round(12 * scalingFactor) + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
			align: 'center'
		});
		GameText.status.superChargeText.tint = MainMenu.buttonTint;
		GameText.status.superChargeText.visible = false;
		GameText.status.superChargeText.anchor = {
			x: 0.5,
			y: 1
		};
		GameText.status.superChargeText.position = {
			x: barWidth * 2.5,
			y: renderer.height * 0.5 - 10
		};

		GameText.status.container.addChild(GameText.status.superChargeText);

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
		GameText.status.shieldText.percentage = 0;
	},
	hide: function() {
		GameText.status.container.visible = false;
	},
	update: function(timeDiff) {
		if (!GameText.status.container.visible)
			return;

		var sideSpace = (renderer.width - renderer.height) / 2;
		var barWidth = Math.round(sideSpace / 8);

		var percentage = Math.round(PlayerShip.playerShip.currShield / PlayerShip.playerShip.maxShield * 100);

		// update shield display
		if (GameText.status.shieldText.percentage != percentage) {
			GameText.status.shieldText.text = formatMoney(Math.max(PlayerShip.playerShip.currShield, 0));
			GameText.status.shieldText.position.y = renderer.height * 0.5 + ((100 - Math.max(percentage, 0)) / 100 * renderer.height * 0.45) + 5;
			if (percentage < 30)
				GameText.status.shieldText.position.y -= 20 * scalingFactor;
			GameText.status.shieldText.tint = 0xFFFFFF;
			GameText.status.shieldBar.clear();

			if (percentage > 0) {
				GameText.status.shieldBar.beginFill(0xFFFFFF);
				GameText.status.shieldBar.drawRect(sideSpace - barWidth * 3, renderer.height * 0.5 + ((100 - percentage) / 100 * renderer.height * 0.45), barWidth, renderer.height * 0.45 - ((100 - percentage) / 100 * renderer.height * 0.45));
				GameText.status.shieldBar.tint = percentage < 40 ? 0xAA0000 : rgbToHex(0, 0, 50 + percentage);
			}
			if (percentage > 1 && percentage < 99) {
				Stars.shipTrails.newPowerupPart(0 - (2 * barWidth) - Math.random() * barWidth, renderer.height * 0.5 + ((100 - percentage) / 100 * renderer.height * 0.45) - 1, 0x0000FF);
			}
			GameText.status.shieldText.percentage = percentage;
		}
		var distanceMarkerPosition = barWidth + (sideSpace - (barWidth * 2)) - ((Math.max(0, timeLeft) / levelTime) * (sideSpace - (barWidth * 2)));
		GameText.status.distanceMarker.clear();
		GameText.status.distanceMarker.lineStyle(Math.round(1 * scalingFactor), 0x808080);
		GameText.status.distanceMarker.moveTo(distanceMarkerPosition, 140 * scalingFactor);
		GameText.status.distanceMarker.lineTo(distanceMarkerPosition, 160 * scalingFactor);

		GameText.status.enemies.text = (distance * Math.max(0, timeLeft) / levelTime).toFixed(1) + " Light Years From Destination";
		GameText.status.fps.text = fps + " fps";

		GameText.status.credits.timer += timeDiff;
		if (GameText.status.credits.lastCredits != gameModel.p1.temporaryCredits) {
			GameText.status.credits.text = formatMoney(gameModel.p1.credits) + " credits\n+ " + formatMoney(gameModel.p1.temporaryCredits);
			GameText.status.credits.lastCredits = gameModel.p1.temporaryCredits;
			GameText.status.credits.timer = 0;
		}
		GameText.status.credits.tint = GameText.status.credits.timer < 0.1 ? MainMenu.selectedButtonTint : MainMenu.buttonTint;

		// update charge bar
		if (GameText.status.chargeBar.percentage != PlayerShip.playerShip.charge) {
			GameText.status.chargeBar.percentage = Math.min(100, PlayerShip.playerShip.charge);
			var sideSpace = (renderer.width - renderer.height) / 2;
			var barWidth = Math.round(sideSpace / 8);

			GameText.status.chargeBar.clear();

			if (PlayerShip.playerShip.charge > 0) {
				GameText.status.chargeBar.beginFill(0xFFFFFF);
				GameText.status.chargeBar.drawRect(2 * barWidth, renderer.height * 0.5 + ((100 - GameText.status.chargeBar.percentage) / 100 * renderer.height * 0.45), barWidth, renderer.height * 0.45 - ((100 - GameText.status.chargeBar.percentage) / 100 * renderer.height * 0.45));
			}
		}

		if (PlayerShip.playerShip.charge >= 100 && !PlayerShip.playerShip.superCharged) {
			GameText.status.superChargeText.visible = true;
			GameText.status.superChargeText.text = "Press " + ShootrUI.getInputButtonDescription(buttonTypes.select);
			GameText.status.chargeBar.tintNumber += GameText.status.chargeBar.tintMod * timeDiff;
			GameText.status.gameBorder.tint = GameText.status.chargeBar.tint = rgbToHex(200, Math.min(200, Math.max(GameText.status.chargeBar.tintNumber, 0)), 0);

			if (GameText.status.chargeBar.tintNumber >= 255 && GameText.status.chargeBar.tintMod > 0)
				GameText.status.chargeBar.tintMod *= -1;

			if (GameText.status.chargeBar.tintNumber <= 0 && GameText.status.chargeBar.tintMod < 0)
				GameText.status.chargeBar.tintMod *= -1;

		} else {
			GameText.status.superChargeText.visible = false;
			GameText.status.chargeBar.tint = rgbToHex(180, 200, 0);
			GameText.status.gameBorder.tint = 0x005500;
		}

		if (gameModel.lootCollected > GameText.status.lootContainer.children.length) {
			var xPos = sideSpace / 5;
			var index = GameText.status.lootContainer.children.length;
			var sprite = new PIXI.Sprite(Powerups.texture);
			sprite.anchor = {x:0.5,y:0.5};
			var row = Math.floor(index / 4);
			var col = index - row * 4;
			sprite.position = {x:xPos + xPos * col,y:195 * scalingFactor + (row * scalingFactor * 40)};
			GameText.status.lootContainer.addChild(sprite);
		}
		GameText.status.lootContainer.children.forEach(function(sprite) {
			sprite.tint = rgbToHex(255,Math.min(255,Math.max(Powerups.tint,0)),0);
		})

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
					strokeThickness: 1,
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
				fill: '#0D0',
				stroke: "#000",
				strokeThickness: 1,
				align: 'center'
			});
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
				fill: '#0D0',
				stroke: "#000",
				strokeThickness: 1,
				align: 'center'
			});
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
	lootTimer:0,
	lastParticle:0,
	lootLayouts:[],
	update:function(timeDiff){
		if (!this.container.visible)
			return;

		this.lastParticle += timeDiff;
		if (this.lastParticle > 0.5) {
			this.lastParticle = 0;
			var sideSpace = (renderer.width - renderer.height) / 2;
			Stars.shipTrails.newPowerupPart(renderer.width * Math.random() - sideSpace, renderer.height * Math.random());
		}

		if (this.lootOpening) {
			this.lootTimer += timeDiff;
			var currentIndex = Math.floor(this.lootTimer / this.secondsPerLoot);

			if (this.lootLayouts[currentIndex - 1]) {
				this.lootLayouts[currentIndex - 1].visible = false;
			}

			var currentLayout = this.lootLayouts[currentIndex];
			if (currentLayout) {
				currentLayout.visible = true;
				currentLayout.scale.x = currentLayout.scale.y = Math.min(this.lootTimer - currentIndex * this.secondsPerLoot, 1);
				currentLayout.position = {x:renderer.width / 2 - (currentLayout.width / 2), y:renderer.height / 2 - (currentLayout.height / 2)};
			}

			if (this.lootTimer > gameModel.lootCollected * this.secondsPerLoot) {
				this.lootLayouts.forEach(function(layout){layout.visible=false;})
				this.textMessage.text = "Level Complete\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to Continue";
				this.textMessage.visible = true;
			}
		}

		if (playerOneButtonsPressed[0] || spaceBar || this.clicked) {
			this.clicked = false;
			if (gameModel.lootCollected > 0 && this.lootTimer === 0) {
				this.lootOpening = true;
				this.textMessage.visible = false;
			}
			if (gameModel.lootCollected === 0 || this.lootTimer > gameModel.lootCollected * this.secondsPerLoot) {
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

		this.textMessage = new PIXI.Text("Level Complete\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to Continue", {
			font: 32 * scalingFactor + 'px Dosis',
			fill: '#FFF',
			stroke: "#000",
			strokeThickness: 1,
			align: 'center'
		});
		this.textMessage.tint = MainMenu.buttonTint;
		this.textMessage.anchor = {x:0.5,y:0.5};
		this.textMessage.position = {x:renderer.width / 2, y:renderer.height / 2};

		this.container.addChild(this.textMessage);

		if (gameModel.lootCollected > 0) {
			this.textMessage.text = "Level Complete\nYou have collected " + gameModel.lootCollected + " crate" + (gameModel.lootCollected>1?"s":"") + "\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to inspect the contents";
			this.lootLayouts = [];
			var baseSeed = Date.now();
			for (var i=0; i<gameModel.lootCollected;i++) {
				var level = Math.max(1,Math.round(gameModel.currentLevel + (Math.random() * 3) - 1));
				if (Math.random() > 0.75) {
					var shield = ArmsDealer.generateShield(level, baseSeed + i, Math.random() > 0.8);
					gameModel.p1.shields.push(shield);
					this.lootLayouts.push(ArmsDealer.createItemLayout(shield, false, true));
				} else {
					var weapon = Weapons.generateWeapon(level, baseSeed + i, Math.random() > 0.8);
					gameModel.p1.weapons.push(weapon);
					this.lootLayouts.push(ArmsDealer.createItemLayout(weapon, false, true));
				}
			}
			this.lootLayouts.forEach(function(layout) {
				layout.position = {x:renderer.width / 2 - (layout.width / 2), y:renderer.height / 2 - (layout.height / 2)};
				layout.visible = false;
				GameText.levelComplete.container.addChild(layout);
			});
		} else {
			this.textMessage.text = "Level Complete\nPress " + ShootrUI.getInputButtonDescription(buttonTypes.select) + " to Continue";
		}
	},
	hide:function() {
		this.container.visible=false;

		var arr = this.container.children;
		arr.forEach(function(ele){
			GameText.levelComplete.container.removeChild(ele);
			ele.destroy;
		});
	},
	checkForClick:function() {
		if (this.container.visible)
			this.clicked = true;
	}
}
