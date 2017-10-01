StarChart = {
  backButton : {title:"Back",click:function(){
    StarChart.hide();
    StationMenu.show();
  }},
  bButtonPress : function() {
    if (!StarChart.menuContainer.visible)
      return false;
    StarChart.backButton.click();
    return true;
  },
  launchButton :{title:"Launch Ship", click:function(){
    clearTextureCache();
    gameModel.targetSystem = {x:StarChart.selectedStar.x,y:StarChart.selectedStar.y};
    changeLevel(StarChart.generateStar(StarChart.selectedStar.x, StarChart.selectedStar.y).level);
    changeState(states.running);
    StarChart.hide();
    StationMenu.hide();
		cursorPosition = {x:-200,y:-200};
  }},
	fastTravelButton :{title:"Fast Travel", click:function(){
    if (StarChart.fastTravelButton.text.visible && StarChart.selectedStar && gameModel.p1.credits > StarChart.fastTravelCost) {

      if (StarChart.fastTravelCost > 0) {
        Modal.show({text:"Purchase spacewarp to " + StarChart.selectedStar.name + " for " + formatMoney(StarChart.fastTravelCost) + " Credits?",
        ok:function(){
          StarChart.fastTravelButton.text.visible = false;
          gameModel.currentSystem = {x:StarChart.selectedStar.x,y:StarChart.selectedStar.y};
          // var level = Math.max(1,Math.abs(StarChart.selectedStar.x),Math.abs(StarChart.selectedStar.y));
          gameModel.p1.credits -= StarChart.fastTravelCost;
          changeLevel(StarChart.selectedStar.level);
      		StarChart.currentPosition = {x:gameModel.currentSystem.x*-1,y:gameModel.currentSystem.y*-1};
          StarChart.currentStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
          StarChart.deselectStar();
          StarChart.selectStar(StarChart.currentStar);
        },
        cancel:function(){}});
      } else {
        StarChart.fastTravelButton.text.visible = false;
        gameModel.currentSystem = {x:StarChart.selectedStar.x,y:StarChart.selectedStar.y};
        // var level = Math.max(1,Math.abs(StarChart.selectedStar.x),Math.abs(StarChart.selectedStar.y));
        changeLevel(StarChart.selectedStar.level);
    		StarChart.currentPosition = {x:gameModel.currentSystem.x*-1,y:gameModel.currentSystem.y*-1};
        StarChart.currentStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
        StarChart.deselectStar();
        StarChart.selectStar(StarChart.currentStar);
      }
    }
  }},
  tradeRouteText : {
    initialize : function() {
      if (StarChart.tradeRouteText.text) {
        StarChart.menuContainer.removeChild(StarChart.tradeRouteText.text);
      }
      StarChart.tradeRouteText.text = getText(gameModel.history.length + " trade routes cleared\nEarning " + formatMoney(calculateIncome()) + " credits per second", MainMenu.fontSize * scalingFactor, { align: 'center' });
    	StarChart.tradeRouteText.text.tint = MainMenu.buttonTint;
      StarChart.tradeRouteText.text.anchor = {x:0,y:0};
      StarChart.tradeRouteText.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05};

      StarChart.menuContainer.addChild(StarChart.tradeRouteText.text);

      if (StarChart.currentCredits) {
        StarChart.menuContainer.removeChild(StarChart.currentCredits);
      }
      StarChart.currentCredits = getText(formatMoney(gameModel.p1.credits) + " Credits", MainMenu.fontSize * scalingFactor, { align: 'center'});
      StarChart.currentCredits.tint = MainMenu.titleTint;
      StarChart.currentCredits.anchor = {x: 1, y: 0};
      StarChart.currentCredits.position = {x: renderer.width * 0.95 - 25, y: renderer.height * 0.05};
      StarChart.menuContainer.addChild(StarChart.currentCredits);

      if (StarChart.rangeText) {
        StarChart.menuContainer.removeChild(StarChart.rangeText);
      }
      StarChart.rangeText = getText("Maximum Range\n" + formatMoney(StarChart.maxDistance) + " light years", MainMenu.fontSize * scalingFactor, { align: 'center' });
      StarChart.rangeText.tint = MainMenu.buttonTint;
      StarChart.rangeText.anchor = {x:0.5,y:0};
      StarChart.rangeText.position = {x:renderer.width * 0.5,y: renderer.height * 0.05};

      StarChart.menuContainer.addChild(StarChart.rangeText);
    }
  },
  fadeTime : 2,
	distanceToPlotX : 36,
  distanceToPlotY : 22,
  zoom : 1,
	minZoom:0.1,
	maxZoom:6,
  currentPosition: {x:0,y:0},
  Stars : {
    getTexture : function() {
      var size = 32 * scalingFactor;
      var blast = document.createElement('canvas');
      blast.width = size;
      blast.height = size;
      var blastCtx = blast.getContext('2d');

      var radgrad = blastCtx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      radgrad.addColorStop(0, 'rgba(255,255,255,1)');
      radgrad.addColorStop(0.8, 'rgba(255,255,255,0.9)');
      radgrad.addColorStop(1, 'rgba(255,255,255,0)');

      // draw shape
      blastCtx.fillStyle = radgrad;
      blastCtx.fillRect(0, 0, size, size);

      return PIXI.Texture.fromCanvas(blast);
    },
    getSpritePool: function() {
      if (!StarChart.Stars.spritePool) {
        StarChart.Stars.spritePool = SpritePool.create(this.getTexture(), StarChart.Stars.sprites);
      }
      return StarChart.Stars.spritePool;
    },
    initialize : function() {
      StarChart.Stars.texture = this.getTexture();
      if (!StarChart.Stars.sprites){
        StarChart.Stars.sprites = new PIXI.Container();
        StarChart.menuContainer.addChild(StarChart.Stars.sprites);
      }
      StarChart.Stars.getSpritePool().discardAll();
      StarChart.Stars.getSpritePool().changeTexture(this.getTexture());
    }
  },
  trackMouse: false,
  lastMouseCoords : {},
  mousedown : function(data) {
    if (StarChart.menuContainer.visible) {
      StarChart.trackMouse = true;
      StarChart.lastMouseCoords = data.data.getLocalPosition(StarChart.menuContainer);
    }
  },
  mousemove : function(data) {
    if (StarChart.trackMouse && StarChart.menuContainer.visible) {
      var starSpacing = StarChart.menuBackground.getBounds().width / 7;
      var xMovement = (data.data.getLocalPosition(StarChart.menuContainer).x - StarChart.lastMouseCoords.x) / starSpacing;
      var yMovement = (data.data.getLocalPosition(StarChart.menuContainer).y - StarChart.lastMouseCoords.y) / starSpacing;
      StarChart.currentPosition.x += xMovement * (1 / StarChart.zoom);
      StarChart.currentPosition.y += yMovement * (1 / StarChart.zoom);
      StarChart.lastMouseCoords = data.data.getLocalPosition(StarChart.menuContainer);
    }
  },
  mouseup : function(data) {
    if (StarChart.menuContainer.visible) {
      StarChart.trackMouse = false;
    }
  },
  mousewheel : function(data) {
    if (StarChart.menuContainer.visible) {
      StarChart.stopZoom = true;
			var zoomChange = StarChart.zoom * (data / 2000);
      StarChart.zoom = Math.min(StarChart.maxZoom,Math.max(StarChart.minZoom,StarChart.zoom + zoomChange));
    }
  }
};

StarChart.closestHistoryStar = function(x, y, xWobble, yWobble) {
  var closestStarSoFar = {x:0, y:0, distance:magnitude(x, y)};
  var distance = 0;
  for (var i = 0; i < gameModel.historyWhenBossDefeated.length; i++) {
    distance = distanceBetweenPoints(x + xWobble, y + yWobble, gameModel.historyWhenBossDefeated[i].start.x, gameModel.historyWhenBossDefeated[i].start.y);
    if (distance < closestStarSoFar.distance) {
      closestStarSoFar.distance = distance;
      closestStarSoFar.x = gameModel.history[i].start.x;
      closestStarSoFar.y = gameModel.history[i].start.y;
    }
    distance = distanceBetweenPoints(x + xWobble, y + yWobble, gameModel.historyWhenBossDefeated[i].end.x, gameModel.historyWhenBossDefeated[i].end.y);
    if (distance < closestStarSoFar.distance) {
      closestStarSoFar.distance = distance;
      closestStarSoFar.x = gameModel.history[i].end.x;
      closestStarSoFar.y = gameModel.history[i].end.y;
    }
  }
  return closestStarSoFar;
};

StarChart.generateStar = function(x, y) {

  var seed = (56788 - x) * (y === 0 ? 13370: y);
  Math.seedrandom(seed);
  var origin = x === 0 && y === 0;
  var starExists = origin || Math.random() > 0.6;

  if (starExists) {
    var scale = 0.6 + Math.random() * 0.5 + (Math.random() > 0.9 ? Math.random() * 1.5 : 0);
    var tint = Math.random() > 0.7 ? {r:255,g:Math.random() * 255,b:Math.random() * 16} : // reddish stars
          Math.random() > 0.8 ? {r:200 + Math.random() * 55,g:255,b:Math.random() * 16} : // yellowish stars
          Math.random() > 0.9 ? {r:200 + Math.random() * 10,g:200 + Math.random() * 10,b:255} : // blueish stars
          {r:200 + Math.random() * 55,g:200 + Math.random() * 55,b:200 + Math.random() * 55}; // white stars

    var xWobble = origin ? 0 : -0.4 + Math.random() * 0.8;
    var yWobble = origin ? 0 : -0.4 + Math.random() * 0.8;
    var closestHistoryStar = StarChart.closestHistoryStar(x, y, xWobble, yWobble);

    return {
      x:x,
      y:y,
      seed:seed,
      yWobble:yWobble,
      xWobble:xWobble,
      tint:tint,
      name:StarNames.createName(),
  		scale:scale,
  		exists:true,
      asteroids:Math.random() > 0.9,
  		level:Math.max(
              1,
              Math.ceil(closestHistoryStar.distance / Constants.starDistancePerLevel)
            )
    };
  } else {
    return { // return a star that doesn't exist
      x:x, y:y, tint:{r:255,g:255,b:255}, xWobble:0, yWobble:0, name:"Nothing", scale:1, seed:seed,	exists:false, asteroids:false, level:1
    };
  }

};

StarChart.locator = {
	    initialize: function () {
        var blast = document.createElement('canvas');
        blast.width = 10;
        blast.height = 16;
        var blastCtx = blast.getContext('2d');

        blastCtx.lineWidth = 2;

        drawline(blastCtx, "#FFF", 1, 1, 9, 8);
        drawline(blastCtx, "#FFF", 1, 15, 9, 8);


        if (StarChart.locator.sprite) {
          StarChart.menuContainer.removeChild(StarChart.locator.sprite);
        }

        StarChart.locator.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
        StarChart.locator.sprite.anchor = { x: -25, y: 0.5 };
        StarChart.locator.sprite.visible = false;
        StarChart.locator.sprite.tint = MainMenu.buttonTint;
        StarChart.menuContainer.addChild(StarChart.locator.sprite);

        if (StarChart.locator.bossSprite) {
          StarChart.menuContainer.removeChild(StarChart.locator.bossSprite);
        }

        StarChart.locator.bossSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
        StarChart.locator.bossSprite.anchor = { x: -25, y: 0.5 };
        StarChart.locator.bossSprite.visible = false;
        StarChart.locator.bossSprite.tint = MainMenu.unselectableTint;
        StarChart.menuContainer.addChild(StarChart.locator.bossSprite);
    },
    update: function () {
      var bounds = StarChart.menuBackground.getBounds();
      var centerPixels = {
        x:bounds.width / 2 + bounds.x,
        y:bounds.height / 2 + bounds.y
      };
      var xDiff;
      var yDiff;

      if (distanceBetweenPoints(StarChart.currentStar.x,StarChart.currentStar.y,StarChart.currentPosition.x * -1,StarChart.currentPosition.y * -1) > 2.5 / StarChart.zoom) {

					xDiff = StarChart.currentStar.x + StarChart.currentStar.xWobble + StarChart.currentPosition.x;
	        yDiff = -1 * StarChart.currentPosition.y - (StarChart.currentStar.y + StarChart.currentStar.yWobble);

					StarChart.locator.sprite.scale = { x: scalingFactor, y: scalingFactor };
          StarChart.locator.sprite.position.x = centerPixels.x;
          StarChart.locator.sprite.position.y = centerPixels.y;
          StarChart.locator.sprite.rotation = Math.atan2(-yDiff,xDiff);
          StarChart.locator.sprite.visible = true;
      } else {
          StarChart.locator.sprite.visible = false;
      }
      if (gameModel.bossPosition && distanceBetweenPoints(StarChart.bossStar.x,StarChart.bossStar.y,StarChart.currentPosition.x * -1,StarChart.currentPosition.y * -1) > 2.5 / StarChart.zoom) {

          xDiff = StarChart.bossStar.x + StarChart.bossStar.xWobble + StarChart.currentPosition.x;
          yDiff = -1 * StarChart.currentPosition.y - (StarChart.bossStar.y + StarChart.bossStar.yWobble);

          StarChart.locator.bossSprite.scale = { x: scalingFactor, y: scalingFactor };
          StarChart.locator.bossSprite.position.x = centerPixels.x;
          StarChart.locator.bossSprite.position.y = centerPixels.y;
          StarChart.locator.bossSprite.rotation = Math.atan2(-yDiff,xDiff);
          StarChart.locator.bossSprite.visible = true;
      } else {
          StarChart.locator.bossSprite.visible = false;
      }
    }
};

StarChart.starField = {
	texture: (function() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 1;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 1, 1);

		return PIXI.Texture.fromCanvas(blast);
	})(),
	numStars:600,
	speed: [],
	sprite: [],
	xLoc: [],
	yLoc: [],
  lastPosition:{x:0,y:0},
	initialize: function() {

		if (StarChart.starField.sprites) {
			StarChart.starField.sprites.children.forEach(function(child){
				StarChart.starField.sprites.removeChild(child);
			});
      StarChart.menuContainer.removeChild(StarChart.starField.sprites);
		}
    StarChart.starField.sprites = new PIXI.Container();
    StarChart.menuContainer.addChild(StarChart.starField.sprites);


		StarChart.starField.lastPosition = {x:StarChart.currentPosition.x,y:StarChart.currentPosition.y};

    // var bounds = StarChart.menuBackground.getBounds();
    // var bounds = renderer;

		for (var i = 0; i < StarChart.starField.numStars; i++) {
			StarChart.starField.speed[i] = 1 + Math.random() * 50;
			StarChart.starField.sprite[i] = new PIXI.Sprite(StarChart.starField.texture);
			StarChart.starField.xLoc[i] = 0 + Math.random() * renderer.width;
			StarChart.starField.yLoc[i] = 0 + Math.random() * renderer.height;
			StarChart.starField.sprite[i].position.x = StarChart.starField.xLoc[i];
			StarChart.starField.sprite[i].position.y = StarChart.starField.yLoc[i];
			StarChart.starField.sprite[i].anchor = {
				x: 0.5,
				y: 0.5
			};
// 			StarChart.starField.sprite[i].alpha = 0.5;
			if (Math.random() > 0.8)
				StarChart.starField.sprite[i].tint = 0x808080 + Math.random() * 0x808080;

			StarChart.starField.sprite[i].scale.x = StarChart.starField.sprite[i].scale.y = Math.max(1,(StarChart.starField.speed[i] / 25)) * gameModel.resolutionFactor;
			StarChart.starField.sprite[i].baseAlpha = StarChart.starField.sprite[i].alpha = Math.min(1,(StarChart.starField.speed[i] / 25));

			StarChart.starField.sprites.addChild(StarChart.starField.sprite[i]);
		}


	},
	update: function() {

    // var bounds = StarChart.menuBackground.getBounds();
    var bounds = {
      x:-10,
      y:-10,
      width:renderer.width + 20,
      height:renderer.height + 20
    };

    var xMovement = StarChart.currentPosition.x - StarChart.starField.lastPosition.x;
    var yMovement = StarChart.currentPosition.y - StarChart.starField.lastPosition.y;

    StarChart.starField.lastPosition = {x:StarChart.currentPosition.x,y:StarChart.currentPosition.y};

		for (var i = 0; i < StarChart.starField.numStars; i++) {

      StarChart.starField.xLoc[i] += StarChart.starField.speed[i] * xMovement * StarChart.zoom;
			StarChart.starField.yLoc[i] += StarChart.starField.speed[i] * yMovement * StarChart.zoom;

			if (StarChart.starField.yLoc[i] > bounds.y + bounds.height)
				StarChart.starField.yLoc[i] = bounds.y;

      if (StarChart.starField.yLoc[i] < bounds.y)
				StarChart.starField.yLoc[i] = bounds.y + bounds.height;

      if (StarChart.starField.xLoc[i] > bounds.x + bounds.width)
				StarChart.starField.xLoc[i] = bounds.x;

      if (StarChart.starField.xLoc[i] < bounds.x)
				StarChart.starField.xLoc[i] = bounds.x + bounds.width;

      StarChart.starField.sprite[i].position.x = StarChart.starField.xLoc[i];
			StarChart.starField.sprite[i].position.y = StarChart.starField.yLoc[i];

      if (StarChart.zoom < 1) {
        StarChart.starField.sprite[i].alpha = StarChart.starField.sprite[i].baseAlpha * StarChart.zoom;
      } else {
        StarChart.starField.sprite[i].alpha = StarChart.starField.sprite[i].baseAlpha;
      }
		}
	},
	resetPositions : function() {
    var bounds = {
      x:-10,
      y:-10,
      width:renderer.width + 20,
      height:renderer.height + 20
    };
		StarChart.starField.lastPosition = {x:StarChart.currentPosition.x,y:StarChart.currentPosition.y};
		for (var i = 0; i < StarChart.starField.numStars; i++) {
			StarChart.starField.xLoc[i] = bounds.x + Math.random() * bounds.width;
			StarChart.starField.yLoc[i] = bounds.y + Math.random() * bounds.height;
			StarChart.starField.sprite[i].position.x = StarChart.starField.xLoc[i];
			StarChart.starField.sprite[i].position.y = StarChart.starField.yLoc[i];
      StarChart.starField.sprite[i].scale.x = StarChart.starField.sprite[i].scale.y = Math.max(1,(StarChart.starField.speed[i] / 25)) * gameModel.resolutionFactor;
		}
	}
};

StarChart.initializeHistory = function() {
  if (StarChart.history) {
    for (var i=0; i < StarChart.history.length; i++) {
      StarChart.menuContainer.removeChild(StarChart.history[i].line);
      StarChart.history[i].line.destroy();
    }
  }
  StarChart.history = [];
	gameModel.history.forEach(function(history){
		var line = new PIXI.Graphics();
    line.alpha = 0.25;
    StarChart.history.push({line:line,firstStar:history.start,nextStar:history.end});
    StarChart.menuContainer.addChild(line);
	});

};

StarChart.createBackground = function() {
  if (!StarChart.menuBackground) {
    StarChart.menuBackground = new PIXI.Graphics();
    StarChart.menuContainer.addChild(StarChart.menuBackground);
  }

  StarChart.menuBackground.clear();
  StarChart.menuBackground.beginFill(MainMenu.backgroundColor);
  // StarChart.menuBackground.drawRect(0, 0, renderer.width, renderer.height);
  StarChart.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);
  StarChart.menuBackground.alpha = MainMenu.backgroundAlpha;

  if (!StarChart.backgroundOverlay) {
    StarChart.backgroundOverlay = new PIXI.Graphics();
    StarChart.menuContainer.addChild(StarChart.backgroundOverlay);
  }

  StarChart.backgroundOverlay.clear();
  StarChart.backgroundOverlay.beginFill(0x000000);
  StarChart.backgroundOverlay.drawRect(0, 0, renderer.width, renderer.height);
  StarChart.backgroundOverlay.alpha = 0;

};

StarChart.initialize = function () {

	if (StarChart.menuContainer) {
		StarChart.menuContainer.children.forEach(function(child){
			StarChart.menuContainer.removeChild(child);
		});
	} else {
		StarChart.menuContainer = new PIXI.Container();
  	gameContainer.addChild(StarChart.menuContainer);
	}
	StarChart.menuContainer.visible = false;


  StarChart.createBackground();

  StarChart.starField.initialize();

  StarChart.initializeHistory();

  StarChart.plan = new PIXI.Graphics();
  StarChart.menuContainer.addChild(StarChart.plan);

  StarChart.selectGraphic = new PIXI.Graphics();
  StarChart.selectGraphic.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
  StarChart.selectGraphic.drawRect(0,0,32 * scalingFactor,32 * scalingFactor);
  StarChart.selectGraphic.anchor={x:0.5,y:0.5};
  StarChart.selectGraphic.visible=false;

  StarChart.menuContainer.addChild(StarChart.selectGraphic);

  StarChart.mouseOverGraphic = new PIXI.Graphics();
  StarChart.mouseOverGraphic.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
  StarChart.mouseOverGraphic.drawRect(0,0,32 * scalingFactor,32 * scalingFactor);
  StarChart.mouseOverGraphic.anchor={x:0.5,y:0.5};
  StarChart.mouseOverGraphic.alpha = 0.3;
  StarChart.mouseOverGraphic.tint = MainMenu.buttonTint;
  StarChart.mouseOverGraphic.visible=false;

  StarChart.menuContainer.addChild(StarChart.mouseOverGraphic);

	var fontSize = MainMenu.fontSize * scalingFactor;

  StarChart.backButton.text = getText(StarChart.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", fontSize, { align: 'center' });
	StarChart.backButton.text.tint = MainMenu.buttonTint;

  StarChart.backButton.text.anchor = {x:0,y:1};
  StarChart.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};

  StarChart.levelRestriction = getText("You cannot travel to this system until the current boss is defeated", fontSize, { align: 'center' });
  StarChart.levelRestriction.tint = MainMenu.unselectableTint;
  StarChart.levelRestriction.anchor = {x:0.5,y:1};
  StarChart.levelRestriction.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
  StarChart.levelRestriction.visible=false;

  StarChart.launchButton.text = getText(StarChart.launchButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.select) + ")", fontSize, { align: 'center' });
  StarChart.launchButton.tint = MainMenu.buttonTint;
  StarChart.launchButton.text.anchor = {x:0.5,y:1};
  StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};

	StarChart.fastTravelButton.text = getText(StarChart.fastTravelButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")", fontSize, { align: 'center' });
  StarChart.fastTravelButton.tint = MainMenu.buttonTint;
  StarChart.fastTravelButton.text.anchor = {x:0.5,y:1};
  StarChart.fastTravelButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};

  StarChart.Stars.initialize();

  StarChart.starInfo = getText("", fontSize, { });
	StarChart.starInfo.tint = MainMenu.buttonTint;
  StarChart.starInfo.position = {x:0,y:0};
  StarChart.starInfo.visible = false;
  StarChart.menuContainer.addChild(StarChart.starInfo);

  StarChart.tradeRouteText.initialize();
	StarChart.locator.initialize();
  StarChart.menuContainer.addChild(StarChart.backButton.text);
  StarChart.menuContainer.addChild(StarChart.fastTravelButton.text);
  StarChart.menuContainer.addChild(StarChart.launchButton.text);
  StarChart.menuContainer.addChild(StarChart.levelRestriction);

	var blast = document.createElement('canvas');
	blast.width = 31;
	blast.height = 31;
	var blastCtx = blast.getContext('2d');

	blastCtx.lineWidth=2;

	drawline(blastCtx, "#FFF", 15, 1, 15, 29);
	drawline(blastCtx, "#FFF", 1, 15, 29, 15);

	StarChart.cursorSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
  StarChart.cursorSprite.tint = MainMenu.buttonTint;
	StarChart.cursorSprite.anchor = {x:0.5,y:0.5};
	StarChart.cursorSprite.visible = false;
	StarChart.cursorSprite.position.x = renderer.width * 0.5;
	StarChart.cursorSprite.position.y = renderer.height * 0.5;
  StarChart.cursorSprite.scale.x = StarChart.cursorSprite.scale.y = gameModel.resolutionFactor;
	StarChart.menuContainer.addChild(StarChart.cursorSprite);

};

  StarChart.resize = function () {
		var visible = StarChart.menuContainer.visible;
// 		StarChart.initialize();
		StarChart.menuContainer.visible = visible;

    StarChart.createBackground();

		StarChart.menuContainer.removeChild(StarChart.backButton.text);
		StarChart.menuContainer.removeChild(StarChart.launchButton.text);
    StarChart.menuContainer.removeChild(StarChart.fastTravelButton.text);
		StarChart.menuContainer.removeChild(StarChart.starInfo);

		var fontSize = MainMenu.fontSize * scalingFactor;

		StarChart.backButton.text = getText(StarChart.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", fontSize, { align: 'center' });
		StarChart.backButton.text.tint = MainMenu.buttonTint;

		StarChart.backButton.text.anchor = {x:0,y:1};
		StarChart.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
		StarChart.menuContainer.addChild(StarChart.backButton.text);

    StarChart.levelRestriction = getText("You cannot travel to this system until the current boss is defeated", fontSize, { align: 'center' });
    StarChart.levelRestriction.tint = MainMenu.unselectableTint;
    StarChart.levelRestriction.anchor = {x:0.5,y:1};
    StarChart.levelRestriction.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
    StarChart.levelRestriction.visible=false;
    StarChart.menuContainer.addChild(StarChart.levelRestriction);

		StarChart.launchButton.text = getText(StarChart.launchButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.select) + ")", fontSize, { align: 'center' });
		StarChart.launchButton.tint = MainMenu.buttonTint;
		StarChart.launchButton.text.anchor = {x:0.5,y:1};
		StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
		StarChart.menuContainer.addChild(StarChart.launchButton.text);

    StarChart.fastTravelButton.text = getText(StarChart.fastTravelButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")", fontSize, { align: 'center' });
    StarChart.fastTravelButton.tint = MainMenu.buttonTint;
    StarChart.fastTravelButton.text.anchor = {x:0.5,y:1};
    StarChart.fastTravelButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
    StarChart.menuContainer.addChild(StarChart.fastTravelButton.text);

		StarChart.starInfo = getText("", fontSize, { });
		StarChart.starInfo.tint = MainMenu.buttonTint;
		StarChart.starInfo.position = {x:0,y:0};
		StarChart.starInfo.visible = false;
		StarChart.menuContainer.addChild(StarChart.starInfo);

    StarChart.selectGraphic.clear();
    StarChart.selectGraphic.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
    StarChart.selectGraphic.drawRect(0,0,32 * scalingFactor,32 * scalingFactor);
    StarChart.selectGraphic.anchor={x:0.5,y:0.5};

    StarChart.mouseOverGraphic.clear();
    StarChart.mouseOverGraphic.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
    StarChart.mouseOverGraphic.drawRect(0,0,32 * scalingFactor,32 * scalingFactor);
    StarChart.mouseOverGraphic.anchor={x:0.5,y:0.5};

		StarChart.cursorSprite.position.x = renderer.width * 0.5;
		StarChart.cursorSprite.position.y = renderer.height * 0.5;

    StarChart.Stars.initialize();
		StarChart.starField.resetPositions();

		if (StarChart.shipSprite)
	    StarChart.shipSprite.texture = PIXI.Texture.fromCanvas(Ships.shipArt(32, gameModel.p1.ship.seed, Ships.enemyColors[gameModel.p1.ship.colorIndex]));
  };


  StarChart.select = function(button) {
    StarChart.backButton.text.tint = MainMenu.buttonTint;
    StarChart.launchButton.text.tint = MainMenu.buttonTint;
		StarChart.fastTravelButton.text.tint = MainMenu.buttonTint;

    button.text.tint = MainMenu.selectedButtonTint;
  };



	StarChart.reposition = function () {

    // for (var j = 0; j < StarChart.Stars.getSpritePool().sprites.length; j++) {
    //   StarChart.Stars.getSpritePool().discardSprite(StarChart.Stars.getSpritePool().sprites[j]);
    //   StarChart.Stars.getSpritePool().sprites[j].star.sprite = false;
    // }


    var x = Math.round(-1 * StarChart.currentPosition.x);
    var y = Math.round(-1 * StarChart.currentPosition.y);


		for (i = x - StarChart.distanceToPlotX; i <= x + StarChart.distanceToPlotX; i++) {

      if (!StarChart.chart[i])
        StarChart.chart[i] = [];

      for (var j = y - StarChart.distanceToPlotY; j <= y + StarChart.distanceToPlotY; j++) {

        if (!StarChart.chart[i][j])
					StarChart.chart[i][j] = StarChart.generateStar(i, j);
      }
    }

    StarChart.centerStar = StarChart.chart[x][y];

	};

  StarChart.initializeStars = function() {
		StarChart.createBackground();

    StarChart.initializeHistory();
		StarChart.locator.initialize();
    StarChart.plan.clear();
		StarChart.zoom=1;
    StarChart.selectedStar = undefined;
    StarChart.launchButton.text.visible=false;
		StarChart.fastTravelButton.text.visible=false;
    StarChart.selectGraphic.visible=false;
    StarChart.mouseOverGraphic.visible=false;
    StarChart.starInfo.visible = false;
    StarChart.chart = [];
    StarChart.currentPosition = {x:gameModel.currentSystem.x*-1,y:gameModel.currentSystem.y*-1};
    StarChart.currentStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
		StarChart.centerStar = StarChart.currentStar;
    StarChart.origin = StarChart.generateStar(0, 0);

    for (var i = gameModel.currentSystem.x - StarChart.distanceToPlotX; i <= gameModel.currentSystem.x + StarChart.distanceToPlotX; i++) {
      StarChart.chart[i] = [];
      for (var j = gameModel.currentSystem.y - StarChart.distanceToPlotY; j <= gameModel.currentSystem.y + StarChart.distanceToPlotY; j++) {
        StarChart.chart[i][j] = StarChart.generateStar(i, j);
      }
    }

    if (StarChart.asteroids) {
      StarChart.asteroids.destroy();
    }
    var seed = Date.now();
    StarChart.asteroids = SpritePool.create([
        Asteroids.createTexture(seed, false, 64),
        Asteroids.createTexture(seed + 1, false, 64),
        Asteroids.createTexture(seed + 2, false, 64),
        Asteroids.createTexture(seed + 3, false, 64)
    ], StarChart.menuContainer);

		StarChart.maxDistance = gameModel.p1.ship.range * getUpgradedRange();

    if (gameModel.bossPosition) {
      StarChart.bossStar = StarChart.generateStar(gameModel.bossPosition.x, gameModel.bossPosition.y);
    }

    if (StarChart.skullSprite)
      StarChart.menuContainer.removeChild(StarChart.skullSprite);

    StarChart.skullSprite = new PIXI.Sprite(PIXI.Texture.fromImage("img/death-skull.svg", undefined, undefined, 0.15));
    StarChart.skullSprite.anchor = {x:-0.5,y:-0.5};
    StarChart.skullSprite.visible = false;
    StarChart.skullSprite.scaleMod = 0;
    StarChart.menuContainer.addChild(StarChart.skullSprite);

		if (StarChart.shipSprite)
			StarChart.menuContainer.removeChild(StarChart.shipSprite);

    var shipTexture = Ships.shipArt(32, gameModel.p1.ship.seed, Ships.enemyColors[gameModel.p1.ship.colorIndex]);
    StarChart.shipSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(shipTexture));
    StarChart.shipSprite.anchor = {x:-0.5,y:0.3};

    StarChart.menuContainer.addChild(StarChart.shipSprite);

    if (StarChart.rangeCircle)
      StarChart.menuContainer.removeChild(StarChart.rangeCircle);

    StarChart.rangeCircle = new PIXI.Graphics();
    StarChart.menuContainer.addChild(StarChart.rangeCircle);

    if (StarChart.levelCircle)
      StarChart.menuContainer.removeChild(StarChart.levelCircle);

    StarChart.levelCircle = new PIXI.Graphics();
    StarChart.menuContainer.addChild(StarChart.levelCircle);

		StarChart.starField.resetPositions();

    StarChart.menuContainer.removeChild(StarChart.starInfo);
    StarChart.menuContainer.addChild(StarChart.starInfo);
  };

  StarChart.checkMouseOver = function () {
    if (!StarChart.menuContainer.visible || lastUsedInput == inputTypes.controller)
      return false;

		StarChart.cursorSprite.visible = false;

    if (MainMenu.checkButton(StarChart.backButton)) {
      StarChart.select(StarChart.backButton);
      return true;
    }

    if (MainMenu.checkButton(StarChart.launchButton)) {
      StarChart.select(StarChart.launchButton);
      return true;
    }

		if (MainMenu.checkButton(StarChart.fastTravelButton)) {
      StarChart.select(StarChart.fastTravelButton);
      return true;
    }
    StarChart.mouseOverGraphic.visible=false;
    for (var i = StarChart.centerStar.x - StarChart.distanceToPlotX; i <= StarChart.centerStar.x + StarChart.distanceToPlotX; i++) {
      for (var j = StarChart.centerStar.y - StarChart.distanceToPlotY; j <= StarChart.centerStar.y + StarChart.distanceToPlotY; j++) {
        var star = StarChart.chart[i][j];
        if (star.sprite) {
          var extraSpace = 32;
          if (star.sprite.visible &&
            cursorPosition.x >= star.sprite.getBounds().x - extraSpace && cursorPosition.x - star.sprite.getBounds().x <= star.sprite.getBounds().width + extraSpace &&
            cursorPosition.y >= star.sprite.getBounds().y - extraSpace && cursorPosition.y - star.sprite.getBounds().y <= star.sprite.getBounds().height + extraSpace) {
            StarChart.mouseOverGraphic.visible=true;
            StarChart.mouseOverGraphic.position.x = star.sprite.position.x + 2 - StarChart.mouseOverGraphic.getBounds().width / 2;
    				StarChart.mouseOverGraphic.position.y = star.sprite.position.y + 2 - StarChart.mouseOverGraphic.getBounds().height / 2;
            return true;
          }
        }
      }
    }

    return false;
  };

  StarChart.selectStar = function(star) {
    if ((star.sprite && !star.sprite.visible) || (StarChart.selectedStar && StarChart.selectedStar.seed == star.seed))
      return;

    StarChart.selectedStar = star;
    StarChart.selectGraphic.visible=true;
    StarChart.mouseOverGraphic.visible=false;

    StarChart.starInfo.text = "";
    StarChart.starInfo.visible = true;
    StarChart.starInfo.charCounter = 0;

    if (calculateAdjustedStarLevel(star.level) > maxLevelAllowed()) {
      StarChart.levelRestriction.visible=true;
      StarChart.fastTravelButton.text.visible = false;
      StarChart.launchButton.text.visible=false;
    } else {
      StarChart.levelRestriction.visible=false;
      if (StarChart.selectedStarDistance() < StarChart.maxDistance && StarChart.selectedStarDistance() > 0) {
        StarChart.launchButton.text.visible=true;
        StarChart.selectGraphic.tint = MainMenu.buttonTint;

      } else {
        StarChart.launchButton.text.visible=false;
        StarChart.selectGraphic.tint = MainMenu.unselectableTint;
      }
      StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};

      StarChart.fastTravelButton.text.visible = false;
      StarChart.fastTravelCost = 0;

      if (StarChart.selectedStarDistance() > 0) {
        gameModel.history.forEach(function(hist){
          if ((hist.start.x == star.x && hist.start.y == star.y) || (hist.end.x == star.x && hist.end.y == star.y)) {
            StarChart.fastTravelButton.text.visible = true;
          }
        });

        StarChart.fastTravelButton.text.text = StarChart.fastTravelButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")";

        if (StarChart.selectedStarDistance() > StarChart.maxDistance && !StarChart.fastTravelButton.text.visible) {
          StarChart.fastTravelCost =  StarChart.selectedStarDistance() * 234 * Math.pow(Constants.starJumpScaling, calculateAdjustedStarLevel(star.level)) * getBuyPriceModifier();
          StarChart.fastTravelButton.text.text = "Buy spacewarp to this system for " + formatMoney(StarChart.fastTravelCost) + " Credits (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")";
          StarChart.fastTravelButton.text.visible = true;
        }
      }

      if (gameModel.bossPosition && gameModel.bossPosition.x == StarChart.selectedStar.x && gameModel.bossPosition.y == StarChart.selectedStar.y) {
        StarChart.fastTravelButton.text.visible = false;
      }


      if (StarChart.launchButton.text.visible && StarChart.fastTravelButton.text.visible) {
        StarChart.launchButton.text.position = {x:renderer.width * 0.4,y: renderer.height * 0.95 - 25};
        StarChart.fastTravelButton.text.position = {x:renderer.width * 0.6,y: renderer.height * 0.95 - 25};
      } else {
        StarChart.fastTravelButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
        StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
      }

    }



  };

	StarChart.deselectStar = function() {
		StarChart.selectGraphic.visible=false;
		StarChart.starInfo.visible=false;
		StarChart.selectedStar=undefined;
		StarChart.launchButton.text.visible=false;
    StarChart.fastTravelButton.text.visible=false;
	};

  StarChart.checkClicks = function() {

    if (!StarChart.menuContainer.visible)
      return false;

    if (MainMenu.checkButton(StarChart.backButton)) {
      StarChart.backButton.click();
      return true;
    }
    if (MainMenu.checkButton(StarChart.launchButton)) {
      StarChart.launchButton.click();
      return true;
    }

		if (MainMenu.checkButton(StarChart.fastTravelButton)) {
      StarChart.fastTravelButton.click();
      return true;
    }

    for (var i = StarChart.centerStar.x - StarChart.distanceToPlotX; i <= StarChart.centerStar.x + StarChart.distanceToPlotX; i++) {
      for (var j = StarChart.centerStar.y - StarChart.distanceToPlotY; j <= StarChart.centerStar.y + StarChart.distanceToPlotY; j++) {
        var star = StarChart.chart[i][j];
        if (star.sprite) {
          var extraSpace = 32;
          if (cursorPosition.x >= star.sprite.getBounds().x - extraSpace && cursorPosition.x - star.sprite.getBounds().x <= star.sprite.getBounds().width + extraSpace &&
            cursorPosition.y >= star.sprite.getBounds().y - extraSpace && cursorPosition.y - star.sprite.getBounds().y <= star.sprite.getBounds().height + extraSpace) {
            StarChart.selectStar(star);
            return true;
          }
        }
      }
    }

    return false;
  };

  StarChart.show = function() {
// 		StarChart.initialize();
    StarChart.initializeStars();
    StarChart.menuContainer.visible = true;

    StarChart.menuBackground.clear();
    StarChart.menuBackground.beginFill(MainMenu.backgroundColor);
    // StarChart.menuBackground.drawRect(0, 0, renderer.width, renderer.height);
    StarChart.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);

    StarChart.backgroundOverlay.alpha = 0;
		StarChart.backButton.text.text = StarChart.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")";
		StarChart.launchButton.text.text = StarChart.launchButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.select) + ")";
		StarChart.fastTravelButton.text.text = StarChart.fastTravelButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")";

    StarChart.tradeRouteText.initialize();
    StarChart.Stars.initialize();
    StarChart.zoom = 0.5;
    StarChart.stopZoom = false;
    Sounds.mapMusic.reset();
    Sounds.mapMusic.play();
  };

  StarChart.hide = function() {
    StarChart.menuContainer.visible = false;
    Sounds.mapMusic.fadeOut();
  };

  StarChart.calcFade = function (x,y,bounds) {

    var limit = 25;
    var leftAlpha = 1, rightAlpha = 1, topAlpha = 1, bottomAlpha = 1;

    if (x < bounds.x + limit)
      leftAlpha = (x - bounds.x) / limit;

    if (y < bounds.y + limit)
      topAlpha = (y - bounds.y) / limit;

    if (x > bounds.x + bounds.width - limit)
      rightAlpha = (limit - (x - bounds.x - (bounds.width - limit))) / limit;

    if (y > bounds.y + bounds.height - limit)
      bottomAlpha = (limit - (y - bounds.y - (bounds.height - limit))) / limit;

    return Math.min(leftAlpha,rightAlpha,bottomAlpha,topAlpha);
  };

	StarChart.distanceBetweenStars = function(x1,y1,x2,y2) {
		var star1 = StarChart.generateStar(x1,y1);
		var star2 = StarChart.generateStar(x2,y2);
		return (Constants.starDistance * distanceBetweenPoints(star2.x + star2.xWobble, star2.y + star2.yWobble, star1.x + star1.xWobble, star1.y + star1.yWobble));
	};

	StarChart.selectedStarDistance = function() {
		return StarChart.distanceBetweenStars(StarChart.currentStar.x, StarChart.currentStar.y, StarChart.selectedStar.x, StarChart.selectedStar.y);
	};

  StarChart.getStarInfoText = function() {

    var level = calculateShipLevel();
		var displayLevel = calculateAdjustedStarLevel(StarChart.selectedStar.level);

    var history = findInHistory(gameModel.currentSystem, StarChart.selectedStar);

    return (gameModel.bossPosition && gameModel.bossPosition.x == StarChart.selectedStar.x && gameModel.bossPosition.y == StarChart.selectedStar.y ? "WARNING dangerous enemy detected\n ": "") +
      StarChart.selectedStar.name +
      "\n Level: " + displayLevel + (displayLevel > level + 3 ? " (Very Hard)" : (displayLevel > level + 1 ? " (Hard)" : " (Normal)")) +
			(StarChart.selectedStarDistance() > 0 ? "\n Distance: " + StarChart.selectedStarDistance().toFixed(2)+ " light years" : "") +
      (StarChart.selectedStarDistance() > StarChart.maxDistance ? "\n Out of range" : "") +
      (Math.max(Math.abs(StarChart.selectedStar.x - gameModel.currentSystem.x),Math.abs(StarChart.selectedStar.y - gameModel.currentSystem.y)) === 0 ? "\n You are currently in this system" : "") +
      // "\n Coordinates: ( " + StarChart.selectedStar.x + " , " + StarChart.selectedStar.y + " )" +
      (StarChart.selectedStar.asteroids ? "\n Asteroid belt present" : "") +
      (!history && StarChart.selectedStarDistance() <= StarChart.maxDistance && StarChart.selectedStarDistance() > 0 ? "\n Route value: " + formatMoney(valueForRoute(displayLevel)) + " Credits per second" : "") +
      (history ? "\n Route earning : " + formatMoney(valueForRoute(history.completedLevel)) + " Credits per second" : "")
      ;
  };

	StarChart.calculateTint = function(star) {
		var factor = Math.min(StarChart.zoom * 2,1);

		return rgbToHex(
			255 - (255 - star.tint.r) * factor,
			255 - (255 - star.tint.g) * factor,
			255 - (255 - star.tint.b) * factor
		);
	};

	StarChart.movementSpeed = 3;

  StarChart.update = function(timeDiff) {
    if (!StarChart.menuContainer.visible)
      return;


    calculateIncomeSinceLastCheck(500);
    StarChart.currentCredits.text = formatMoney(gameModel.p1.credits) + " Credits";

    if (StarChart.menuBackground.height < renderer.height) {
      var amountToMove = (1 / StarChart.fadeTime * timeDiff) * 0.05 * renderer.height;
      yPos = StarChart.menuBackground.getBounds().y - amountToMove;
      if (yPos < 0)
        yPos = 0;

      StarChart.menuBackground.clear();
      StarChart.menuBackground.beginFill(MainMenu.backgroundColor);
      StarChart.menuBackground.drawRect(
        0,
        yPos,
        renderer.width,
        renderer.height - (2 * yPos)
      );
      if (!StarChart.stopZoom)
        StarChart.zoom += (1 / StarChart.fadeTime * timeDiff) * (1 - StarChart.zoom);
    }

    if (StarChart.backgroundOverlay.alpha < 1) {
      StarChart.backgroundOverlay.alpha += 1 / StarChart.fadeTime * timeDiff;
    } else {
      StarChart.backgroundOverlay.alpha = 1;
    }


    var starSpacing = (StarChart.menuBackground.getBounds().width / 7) * StarChart.zoom;
    var bounds = StarChart.menuBackground.getBounds();
    var centerPixels = {
      x:bounds.width / 2 + bounds.x,
      y:bounds.height / 2 + bounds.y
    };


    if (Modal.isHidden()) {
      if (playerOneAxes[0] > 0.25 || playerOneAxes[0] < -0.25 || playerOneAxes[1] > 0.25 || playerOneAxes[1] < -0.25) {
        StarChart.currentPosition.x -= playerOneAxes[0] * StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
        StarChart.currentPosition.y -= playerOneAxes[1] * StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
        setLastUsedInput(inputTypes.controller);
        aimLocX = aimLocY = 0;
  			StarChart.cursorSprite.visible = true;
      }

  		if (w)
  			StarChart.currentPosition.y += StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
  		if (a)
  			StarChart.currentPosition.x += StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
  		if (s)
  			StarChart.currentPosition.y -= StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
  		if (d)
  			StarChart.currentPosition.x -= StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);


      if (playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {
        StarChart.zoom = Math.min(StarChart.maxZoom,Math.max(StarChart.minZoom,StarChart.zoom - (StarChart.zoom * 0.9 * timeDiff * playerOneAxes[3])));
        StarChart.stopZoom = true;
      }

      // if (playerOneButtonsPressed[1] || esc) {
      //   StarChart.backButton.click();
      // }

      if ((playerOneButtonsPressed[0] || spaceBar) && StarChart.launchButton.text.visible) {
        StarChart.launchButton.click();
      }

  		if ((playerOneButtonsPressed[4] || q) && StarChart.fastTravelButton.text.visible) {
        StarChart.fastTravelButton.click();
      }
    }


    // if (distanceBetweenPoints(-1 * StarChart.currentPosition.x,-1 * StarChart.currentPosition.y,StarChart.centerStar.x, StarChart.centerStar.y) > 2) {
    //   StarChart.reposition();
		// }

    StarChart.starField.update();
		StarChart.locator.update();

    // var x = Math.round(-1 * StarChart.currentPosition.x);
    // var y = Math.round(-1 * StarChart.currentPosition.y);
    // StarChart.centerStar = StarChart.chart[x][y];

    var closestStarToCentre = StarChart.currentStar;
    var closestStarToCentreDistance = 10000;
    var borderBuffer = 30 * scalingFactor;

    StarChart.Stars.getSpritePool().discardAll();
    // StarChart.Stars.getSpritePool().sprites.forEach(function(sprite){sprite.star.sprite = false;});

    for (var i = StarChart.centerStar.x - StarChart.distanceToPlotX; i <= StarChart.centerStar.x + StarChart.distanceToPlotX; i++) {

      if (!StarChart.chart[i])
        StarChart.chart[i] = [];

      for (var j = StarChart.centerStar.y - StarChart.distanceToPlotY; j <= StarChart.centerStar.y + StarChart.distanceToPlotY; j++) {

        if (!StarChart.chart[i][j])
          StarChart.chart[i][j] = StarChart.generateStar(i, j);

        var star = StarChart.chart[i][j];

				if (!star || !star.exists)
					continue;

        var pixelPositionX = centerPixels.x + ((StarChart.currentPosition.x + star.x + star.xWobble) * starSpacing);
        var pixelPositionY = centerPixels.y + ((StarChart.currentPosition.y + star.y + star.yWobble) * starSpacing);

        var distanceToCentre = distanceBetweenPoints(pixelPositionX,pixelPositionY,centerPixels.x, centerPixels.y);
        if (distanceToCentre < closestStarToCentreDistance) {
          closestStarToCentre = star;
          closestStarToCentreDistance = distanceToCentre;
        }

        if (pixelPositionX > bounds.x - borderBuffer && pixelPositionX < bounds.x + bounds.width + borderBuffer &&
            pixelPositionY > bounds.y - borderBuffer && pixelPositionY < bounds.y + bounds.height + borderBuffer) {

          // if (!star.sprite || !star.sprite.visible) {
            star.sprite = StarChart.Stars.getSpritePool().nextSprite();
            // star.sprite.star = star;
          // }

          star.sprite.tint = StarChart.calculateTint(star);
          star.sprite.position.x = pixelPositionX;
          star.sprite.position.y = pixelPositionY;
          star.sprite.visible = true;
					star.sprite.scale.x = star.sprite.scale.y = star.scale * StarChart.zoom * 0.5;
          var alphaMultiplier = calculateAdjustedStarLevel(star.level) <= maxLevelAllowed() ? 1 : Math.max(0,Math.pow(0.5, calculateAdjustedStarLevel(star.level) - maxLevelAllowed()));
          if (alphaMultiplier < 0.1)
            star.sprite.visible = false;
          star.sprite.alpha = StarChart.calcFade(pixelPositionX,pixelPositionY,bounds) * alphaMultiplier;

          if (star.asteroids && star.level <= maxLevelAllowed() && star.sprite.visible) {
            if (!star.asteroidSprites) {
              star.asteroidSprites = [];
              Math.seedrandom(star.seed);
              var howMany = 12 + Math.random() * 4;
              var whichWay = Math.random() > 0.5 ? -1 : 1;
              for (var b = 0; b < howMany; b++) {
                star.asteroidSprites[b] = StarChart.asteroids.nextSprite();
                star.asteroidSprites[b].rotation = Math.random() * Math.PI * 2;
                star.asteroidSprites[b].rotationSpeed = (0.3 + Math.random() * 0.3) * whichWay;
                star.asteroidSprites[b].achorMod = -0.1 + Math.random() * 0.2;
              }
            }
            for (var c = 0; c < star.asteroidSprites.length; c++) {
              star.asteroidSprites[c].anchor = {x: star.asteroidSprites[c].achorMod - (StarChart.zoom / 6), y: 0.5};
              star.asteroidSprites[c].scale.x = star.asteroidSprites[c].scale.y = 0.2 + 0.1 * StarChart.zoom;
              star.asteroidSprites[c].visible = StarChart.zoom > 0.2;
              star.asteroidSprites[c].alpha = Math.min(1, (StarChart.zoom - 0.2) * 2) * alphaMultiplier;
              star.asteroidSprites[c].rotation += star.asteroidSprites[c].rotationSpeed * timeDiff;
              star.asteroidSprites[c].position.x = pixelPositionX;
              star.asteroidSprites[c].position.y = pixelPositionY;
            }
          }

        } else {
          if (star.sprite) {
						StarChart.Stars.getSpritePool().discardSprite(star.sprite);
						star.sprite = undefined;
          }
          if (star.asteroidSprites) {
            for (var l = 0; l < star.asteroidSprites.length; l++) {
              StarChart.asteroids.discardSprite(star.asteroidSprites[l]);
            }
            star.asteroidSprites = false;
          }
        }
      }
    }

    if (closestStarToCentre && lastUsedInput == inputTypes.controller) {
			if (closestStarToCentreDistance < bounds.width / 20) {
				StarChart.selectStar(closestStarToCentre);
			} else {
				StarChart.deselectStar();
			}

    }

    if (gameModel.bossPosition) {
      var skullX = centerPixels.x + ((StarChart.currentPosition.x + gameModel.bossPosition.x + StarChart.bossStar.xWobble) * starSpacing);
      var skullY = centerPixels.y + ((StarChart.currentPosition.y + gameModel.bossPosition.y + StarChart.bossStar.yWobble) * starSpacing);
      StarChart.skullSprite.position.x = skullX + (10 + 20 * StarChart.zoom) * scalingFactor;
      StarChart.skullSprite.position.y = skullY;
      StarChart.skullSprite.rotation = 0;
      StarChart.skullSprite.anchor = {x:0.5,y:0.5};
      StarChart.skullSprite.visible = true;
      StarChart.skullSprite.scaleMod += 2 * timeDiff;
      StarChart.skullSprite.alpha = Math.min(StarChart.calcFade(skullX,skullY,bounds), 0.7);
      StarChart.skullSprite.scale.x = StarChart.skullSprite.scale.y = (0.6 + 0.1 * Math.sin(StarChart.skullSprite.scaleMod)) * scalingFactor;
    }


    var shipX = centerPixels.x + ((StarChart.currentPosition.x + gameModel.currentSystem.x + StarChart.currentStar.xWobble) * starSpacing);
    var shipY = centerPixels.y + ((StarChart.currentPosition.y + gameModel.currentSystem.y + StarChart.currentStar.yWobble) * starSpacing);
    StarChart.shipSprite.position.x = shipX;
    StarChart.shipSprite.position.y = shipY;
    StarChart.shipSprite.rotation -= timeDiff * 0.4;
		StarChart.shipSprite.anchor = {x:0 - (StarChart.zoom / 6),y:0.3};
    StarChart.shipSprite.alpha = StarChart.calcFade(shipX,shipY,bounds);

    StarChart.plan.clear();

    var startX;
    var startY;
    var endX;
    var endY;

    if (StarChart.selectedStar) {
			if (!StarChart.selectedStar.sprite || !StarChart.selectedStar.sprite.visible) {
        StarChart.deselectStar();
      } else {
				StarChart.selectGraphic.position.x = StarChart.selectedStar.sprite.position.x + 2 - StarChart.selectGraphic.getBounds().width / 2;
				StarChart.selectGraphic.position.y = StarChart.selectedStar.sprite.position.y + 2 - StarChart.selectGraphic.getBounds().height / 2;
				StarChart.starInfo.position.x = StarChart.selectedStar.sprite.position.x + StarChart.selectGraphic.getBounds().width / 2;
				StarChart.starInfo.position.y = StarChart.selectedStar.sprite.position.y + StarChart.selectGraphic.getBounds().height / 2;

				if (StarChart.starInfo.charCounter < StarChart.getStarInfoText().length) {
					StarChart.starInfo.text = StarChart.starInfo.text + StarChart.getStarInfoText().charAt(StarChart.starInfo.charCounter);
					StarChart.starInfo.charCounter++;
          if (lastUsedInput === inputTypes.mouseKeyboard)
            Sounds.blip1.play();
				}

				if (StarChart.selectedStarDistance() < StarChart.maxDistance) {

					StarChart.plan.lineStyle(Math.max(1,2 * gameModel.resolutionFactor), 0xFFFFFF);

					startX = centerPixels.x + ((StarChart.currentPosition.x + StarChart.currentStar.x + StarChart.currentStar.xWobble) * starSpacing);
					startY = centerPixels.y + ((StarChart.currentPosition.y + StarChart.currentStar.y + StarChart.currentStar.yWobble) * starSpacing);
					endX = centerPixels.x + ((StarChart.currentPosition.x + StarChart.selectedStar.x + StarChart.selectedStar.xWobble) * starSpacing);
					endY = centerPixels.y + ((StarChart.currentPosition.y + StarChart.selectedStar.y + StarChart.selectedStar.yWobble) * starSpacing);

					StarChart.plan.moveTo(startX,startY);
					StarChart.plan.lineTo(endX,endY);
					StarChart.plan.alpha = 0.3;
				}
			}
    }

    StarChart.rangeCircle.clear();
    StarChart.rangeCircle.lineStyle(Math.max(Math.max(1,gameModel.resolutionFactor),2 * gameModel.resolutionFactor), 0xFFFFFF);
    StarChart.rangeCircle.tint = 0x005050;
    // StarChart.rangeCircle.alpha = 0.5;
    var circleX = centerPixels.x + ((StarChart.currentPosition.x + StarChart.currentStar.x + StarChart.currentStar.xWobble) * starSpacing);
    var circleY = centerPixels.y + ((StarChart.currentPosition.y + StarChart.currentStar.y + StarChart.currentStar.yWobble) * starSpacing);
    var radius = StarChart.maxDistance * starSpacing / Constants.starDistance;
    StarChart.rangeCircle.drawCircle(
      circleX,
      circleY,
      radius
    );

    // StarChart.levelCircle.clear();
    // StarChart.levelCircle.lineStyle(Math.max(Math.max(1,gameModel.resolutionFactor),2 * gameModel.resolutionFactor), 0xFFFFFF);
    // StarChart.levelCircle.tint = MainMenu.unselectableTint;
    // StarChart.levelCircle.alpha = 0.2;
    // var circleX = centerPixels.x + ((StarChart.currentPosition.x + StarChart.origin.x + StarChart.origin.xWobble) * starSpacing);
    // var circleY = centerPixels.y + ((StarChart.currentPosition.y + StarChart.origin.y + StarChart.origin.yWobble) * starSpacing);
    // var radius = maxLevelAllowed() * starSpacing * Constants.starDistancePerLevel;
    // StarChart.levelCircle.drawCircle(
    //   circleX,
    //   circleY,
    //   radius
    // );

    var firstStar, secondStar;

    for (var k = 0; k < StarChart.history.length; k++) {

			StarChart.history[k].line.clear();

			if (StarChart.chart[StarChart.history[k].firstStar.x] && StarChart.chart[StarChart.history[k].nextStar.x] &&
				 StarChart.chart[StarChart.history[k].firstStar.x][StarChart.history[k].firstStar.y] &&
				 StarChart.chart[StarChart.history[k].nextStar.x][StarChart.history[k].nextStar.y]) {

				firstStar = StarChart.chart[StarChart.history[k].firstStar.x][StarChart.history[k].firstStar.y];
				secondStar = StarChart.chart[StarChart.history[k].nextStar.x][StarChart.history[k].nextStar.y];

				startX = centerPixels.x + ((StarChart.currentPosition.x + firstStar.x + firstStar.xWobble) * starSpacing);
				startY = centerPixels.y + ((StarChart.currentPosition.y + firstStar.y + firstStar.yWobble) * starSpacing);
				endX = centerPixels.x + ((StarChart.currentPosition.x + secondStar.x + secondStar.xWobble) * starSpacing);
				endY = centerPixels.y + ((StarChart.currentPosition.y + secondStar.y + secondStar.yWobble) * starSpacing);

        StarChart.history[k].line.lineStyle(Math.max(1, 2 * gameModel.resolutionFactor), 0xFFFFFF);
				StarChart.history[k].line.moveTo(startX,startY);
				StarChart.history[k].line.lineTo(endX,endY);

				//StarChart.history[k].line.alpha = 0.1 * Math.min(StarChart.calcFade(startX,startY,bounds),StarChart.calcFade(endX,endY,bounds));

			}
    }

    if (distanceBetweenPoints(-1 * StarChart.currentPosition.x,-1 * StarChart.currentPosition.y,StarChart.centerStar.x, StarChart.centerStar.y) > 2) {
      setTimeout(StarChart.reposition);
		}
    StarChart.checkMouseOver();
	};
