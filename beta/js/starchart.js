StarChart = {
  backButton : {title:"Back",click:function(){
    StarChart.hide();
    StationMenu.show();
  }},
  launchButton :{title:"Launch Ship", click:function(){
    gameModel.targetSystem = {x:StarChart.selectedStar.x,y:StarChart.selectedStar.y};
    var level = Math.max(1,Math.abs(StarChart.selectedStar.x),Math.abs(StarChart.selectedStar.y));
    changeLevel(level);
    changeState(states.running);
    StarChart.hide();
    StationMenu.hide();
		cursorPosition = {x:-200,y:-200};
  }},
	fastTravelButton :{title:"Fast Travel", click:function(){
    if (StarChart.fastTravelButton.text.visible && StarChart.selectedStar) {
      StarChart.fastTravelButton.text.visible = false;
      gameModel.currentSystem = {x:StarChart.selectedStar.x,y:StarChart.selectedStar.y};
      var level = Math.max(1,Math.abs(StarChart.selectedStar.x),Math.abs(StarChart.selectedStar.y));
      changeLevel(level);
  		StarChart.currentPosition = {x:gameModel.currentSystem.x*-1,y:gameModel.currentSystem.y*-1};
      StarChart.currentStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
      StarChart.deselectStar();
      StarChart.selectStar(StarChart.currentStar);
    }
  }},
  tradeRouteText : {
    initialize : function() {
      if (StarChart.tradeRouteText.text) {
        StarChart.menuContainer.removeChild(StarChart.tradeRouteText.text);
      }
      StarChart.tradeRouteText.text = new PIXI.Text(gameModel.history.length + " trade routes cleared\nEarning " + formatMoney(calculateIncome()) + " credits per second" ,
        { font: (MainMenu.fontSize * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
    	StarChart.tradeRouteText.text.tint = MainMenu.buttonTint;
      StarChart.tradeRouteText.text.anchor = {x:0,y:0};
      StarChart.tradeRouteText.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05};

      StarChart.menuContainer.addChild(StarChart.tradeRouteText.text);

      if (StarChart.rangeText) {
        StarChart.menuContainer.removeChild(StarChart.rangeText);
      }
      StarChart.rangeText = new PIXI.Text("Maximum Range\n" + formatMoney(StarChart.maxDistance) + " light years",
        { font: (MainMenu.fontSize * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
      StarChart.rangeText.tint = MainMenu.buttonTint;
      StarChart.rangeText.anchor = {x:1,y:0};
      StarChart.rangeText.position = {x:renderer.width * 0.95 - 25,y: renderer.height * 0.05};

      StarChart.menuContainer.addChild(StarChart.rangeText);
    }
  },
  fadeTime : 2,
	distanceToPlot : 20,
  zoom : 1,
	minZoom:0.2,
	maxZoom:6,
  currentPosition: {x:0,y:0},
  Stars : {
    texture : {},
		starsArray:[],
		discardedStars : [],
    initialize : function() {
      StarChart.Stars.texture = (function () {
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
        })();

      if (!StarChart.Stars.sprites){
        StarChart.Stars.sprites = new PIXI.Container();
        StarChart.menuContainer.addChild(StarChart.Stars.sprites);
      }
    },
    nextStar : function () {
			if (StarChart.Stars.discardedStars.length > 0)
				return StarChart.Stars.discardedStars.pop();

      var sprite = new PIXI.Sprite(StarChart.Stars.texture);
      sprite.visible = false;
      sprite.anchor = { x: 0.5, y: 0.5 };
      StarChart.Stars.sprites.addChild(sprite);
			StarChart.Stars.starsArray.push(sprite);
      return sprite;
    },
    clearStars : function() {
			StarChart.Stars.starsArray = [];
			StarChart.Stars.discardedStars = [];
      for (var i =0; i < StarChart.Stars.sprites.children.length; i++) {
        //StarChart.Stars.sprites.children[i].destroy();
        StarChart.Stars.sprites.removeChildren();
      }
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
			var zoomChange = StarChart.zoom * (data / 2000);
      StarChart.zoom = Math.min(StarChart.maxZoom,Math.max(StarChart.minZoom,StarChart.zoom + zoomChange));
    }
  }
};

StarChart.generateStar = function(x, y) {
  var seed = (56788 - x) * (y === 0 ? 13370: y);
  Math.seedrandom(seed);
	var scale = 0.35 + Math.random() * 0.2 + (Math.random() > 0.9 ? Math.random() * 0.9 : 0);
  return {
    x:x,
    y:y,
    seed:seed,
    tint:Math.random() > 0.7 ? {r:255,g:Math.random() * 255,b:Math.random() * 16} : // reddish stars
					Math.random() > 0.8 ? {r:200 + Math.random() * 55,g:255,b:Math.random() * 16} : // yellowish stars
					Math.random() > 0.9 ? {r:200 + Math.random() * 10,g:200 + Math.random() * 10,b:255} : // blueish stars
					{r:200 + Math.random() * 55,g:200 + Math.random() * 55,b:200 + Math.random() * 55}, // white stars
    xWobble:-0.4 + Math.random() * 0.8,
    yWobble:-0.4 + Math.random() * 0.8,
// 		xWobble:0,
//    yWobble:0,
    name:StarNames.createName(),
		scale:scale,
		exists:true,
    asteroids:Math.random() > 0.9,
		level:Math.max(1,Math.abs(x),Math.abs(y))
  };
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
        StarChart.locator.sprite.tint = calculateTintFromString("#00bb00");
        StarChart.menuContainer.addChild(StarChart.locator.sprite);

        if (StarChart.locator.bossSprite) {
          StarChart.menuContainer.removeChild(StarChart.locator.bossSprite);
        }

        StarChart.locator.bossSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
        StarChart.locator.bossSprite.anchor = { x: -25, y: 0.5 };
        StarChart.locator.bossSprite.visible = false;
        StarChart.locator.bossSprite.tint = calculateTintFromString("#DD0000");
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
		} else {
			StarChart.starField.sprites = new PIXI.Container();
			StarChart.menuContainer.addChild(StarChart.starField.sprites);
		}


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
  StarChart.selectGraphic.lineStyle(1 * scalingFactor, 0xFFFFFF);
  StarChart.selectGraphic.drawRect(0,0,32 * scalingFactor,32 * scalingFactor);
  StarChart.selectGraphic.anchor={x:0.5,y:0.5};
  StarChart.selectGraphic.visible=false;

  StarChart.menuContainer.addChild(StarChart.selectGraphic);

	var fontSize = MainMenu.fontSize * scalingFactor;

  StarChart.backButton.text = new PIXI.Text(StarChart.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
	StarChart.backButton.text.tint = MainMenu.buttonTint;

  StarChart.backButton.text.anchor = {x:0,y:1};
  StarChart.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
  StarChart.menuContainer.addChild(StarChart.backButton.text);

  StarChart.launchButton.text = new PIXI.Text(StarChart.launchButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.select) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
  StarChart.launchButton.tint = MainMenu.buttonTint;
  StarChart.launchButton.text.anchor = {x:0.5,y:1};
  StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
  StarChart.menuContainer.addChild(StarChart.launchButton.text);

	StarChart.fastTravelButton.text = new PIXI.Text(StarChart.fastTravelButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
  StarChart.fastTravelButton.tint = MainMenu.buttonTint;
  StarChart.fastTravelButton.text.anchor = {x:0.5,y:1};
  StarChart.fastTravelButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
  StarChart.menuContainer.addChild(StarChart.fastTravelButton.text);

  StarChart.Stars.initialize();

  StarChart.starInfo = new PIXI.Text("", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'left' });
	StarChart.starInfo.tint = MainMenu.buttonTint;
  StarChart.starInfo.position = {x:0,y:0};
  StarChart.starInfo.visible = false;
  StarChart.menuContainer.addChild(StarChart.starInfo);

  StarChart.tradeRouteText.initialize();

	StarChart.locator.initialize();

	var blast = document.createElement('canvas');
	blast.width = 31;
	blast.height = 31;
	var blastCtx = blast.getContext('2d');

	blastCtx.lineWidth=2;

	drawline(blastCtx, "#0b0", 15, 1, 15, 29);
	drawline(blastCtx, "#0b0", 1, 15, 29, 15);

	StarChart.cursorSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(blast));
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

		StarChart.backButton.text = new PIXI.Text(StarChart.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
		StarChart.backButton.text.tint = MainMenu.buttonTint;

		StarChart.backButton.text.anchor = {x:0,y:1};
		StarChart.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
		StarChart.menuContainer.addChild(StarChart.backButton.text);

		StarChart.launchButton.text = new PIXI.Text(StarChart.launchButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.select) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
		StarChart.launchButton.tint = MainMenu.buttonTint;
		StarChart.launchButton.text.anchor = {x:0.5,y:1};
		StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
		StarChart.menuContainer.addChild(StarChart.launchButton.text);

    StarChart.fastTravelButton.text = new PIXI.Text(StarChart.fastTravelButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.leftShoulder) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
    StarChart.fastTravelButton.tint = MainMenu.buttonTint;
    StarChart.fastTravelButton.text.anchor = {x:0.5,y:1};
    StarChart.fastTravelButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
    StarChart.menuContainer.addChild(StarChart.fastTravelButton.text);

		StarChart.starInfo = new PIXI.Text("", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'left' });
		StarChart.starInfo.tint = MainMenu.buttonTint;
		StarChart.starInfo.position = {x:0,y:0};
		StarChart.starInfo.visible = false;
		StarChart.menuContainer.addChild(StarChart.starInfo);

    StarChart.selectGraphic.clear();
    StarChart.selectGraphic.lineStyle(1 * scalingFactor, 0xFFFFFF);
    StarChart.selectGraphic.drawRect(0,0,32 * scalingFactor,32 * scalingFactor);
    StarChart.selectGraphic.anchor={x:0.5,y:0.5};

		StarChart.cursorSprite.position.x = renderer.width * 0.5;
		StarChart.cursorSprite.position.y = renderer.height * 0.5;

    StarChart.Stars.initialize();
		StarChart.Stars.clearStars();
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
		StarChart.centerStar = StarChart.chart[Math.round(-1 * StarChart.currentPosition.x)][Math.round(-1 * StarChart.currentPosition.y)];

		StarChart.Stars.discardedStars = [];
    var i;
		for (i=0;i<StarChart.Stars.starsArray.length;i++) {
			StarChart.Stars.starsArray[i].visible=false;
			StarChart.Stars.discardedStars.push(StarChart.Stars.starsArray[i]);
		}

		var oldChart = StarChart.chart;

		StarChart.chart = [];

		for (i = StarChart.centerStar.x - StarChart.distanceToPlot; i <= StarChart.centerStar.x + StarChart.distanceToPlot; i++) {
      StarChart.chart[i] = [];
      for (var j = StarChart.centerStar.y - StarChart.distanceToPlot; j <= StarChart.centerStar.y + StarChart.distanceToPlot; j++) {

				if (oldChart[i] && oldChart[i][j]) {
					StarChart.chart[i][j] = oldChart[i][j];
					StarChart.chart[i][j].sprite = undefined;
				} else {
					StarChart.chart[i][j] = StarChart.generateStar(i, j);
// 					if (StarChart.chart[i][j].level > gameModel.p1.ship.level + 5)
// 						StarChart.chart[i][j].exists = false;
				}
      }
    }

		if (StarChart.selectedStar) {
			StarChart.selectedStar = StarChart.chart[StarChart.selectedStar.x][StarChart.selectedStar.y];
			StarChart.selectedStar.sprite = StarChart.Stars.nextStar();
		}

	};

  StarChart.initializeStars = function() {
		StarChart.createBackground();

    StarChart.Stars.clearStars();
    StarChart.initializeHistory();
		StarChart.locator.initialize();
    StarChart.plan.clear();
		StarChart.zoom=1;
    StarChart.selectedStar = undefined;
    StarChart.launchButton.text.visible=false;
		StarChart.fastTravelButton.text.visible=false;
    StarChart.selectGraphic.visible=false;
    StarChart.starInfo.visible = false;
    StarChart.chart = [];
    StarChart.currentPosition = {x:gameModel.currentSystem.x*-1,y:gameModel.currentSystem.y*-1};
    StarChart.currentStar = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
		StarChart.centerStar = StarChart.currentStar;

    for (var i = gameModel.currentSystem.x - StarChart.distanceToPlot; i <= gameModel.currentSystem.x + StarChart.distanceToPlot; i++) {
      StarChart.chart[i] = [];
      for (var j = gameModel.currentSystem.y - StarChart.distanceToPlot; j <= gameModel.currentSystem.y + StarChart.distanceToPlot; j++) {
        StarChart.chart[i][j] = StarChart.generateStar(i, j);
      }
    }

		StarChart.maxDistance = gameModel.p1.ship.range;

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

		StarChart.starField.resetPositions();

    StarChart.menuContainer.removeChild(StarChart.starInfo);
    StarChart.menuContainer.addChild(StarChart.starInfo);
  };

  StarChart.checkMouseOver = function () {
    if (!StarChart.menuContainer.visible)
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

    return false;
  };

  StarChart.selectStar = function(star) {
    if (StarChart.selectedStar && StarChart.selectedStar.seed == star.seed)
      return;

    StarChart.selectedStar = star;
    StarChart.selectGraphic.visible=true;

    StarChart.starInfo.text = "";
    StarChart.starInfo.visible = true;
    StarChart.starInfo.charCounter = 0;

    if (StarChart.selectedStarDistance() < StarChart.maxDistance && StarChart.selectedStarDistance() > 0) {
      StarChart.launchButton.text.visible=true;
      StarChart.selectGraphic.tint = MainMenu.buttonTint;

    } else {
      StarChart.launchButton.text.visible=false;
      StarChart.selectGraphic.tint = MainMenu.unselectableTint;
    }
		StarChart.launchButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};

		StarChart.fastTravelButton.text.visible = false;

		gameModel.history.forEach(function(hist){
			if ((hist.start.x == star.x && hist.start.y == star.y) || (hist.end.x == star.x && hist.end.y == star.y)) {
				StarChart.fastTravelButton.text.visible = true;
				if (StarChart.launchButton.text.visible) {
					StarChart.launchButton.text.position = {x:renderer.width * 0.4,y: renderer.height * 0.95 - 25};
					StarChart.fastTravelButton.text.position = {x:renderer.width * 0.6,y: renderer.height * 0.95 - 25};
				} else {
					StarChart.fastTravelButton.text.position = {x:renderer.width * 0.5,y: renderer.height * 0.95 - 25};
				}
			}
		});
  };

	StarChart.deselectStar = function() {
		StarChart.selectGraphic.visible=false;
		StarChart.starInfo.visible=false;
		StarChart.selectedStar=undefined;
		StarChart.launchButton.text.visible=false;
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

    for (var i = StarChart.centerStar.x - StarChart.distanceToPlot; i <= StarChart.centerStar.x + StarChart.distanceToPlot; i++) {
      for (var j = StarChart.centerStar.y - StarChart.distanceToPlot; j <= StarChart.centerStar.y + StarChart.distanceToPlot; j++) {
        var star = StarChart.chart[i][j];
        if (star.sprite) {
          var extraSpace = 32;
          if (cursorPosition.x >= star.sprite.getBounds().x - extraSpace && cursorPosition.x - star.sprite.getBounds().x <= star.sprite.getBounds().width + extraSpace &&
            cursorPosition.y >= star.sprite.getBounds().y - extraSpace && cursorPosition.y - star.sprite.getBounds().y <= star.sprite.getBounds().height + extraSpace) {
            StarChart.selectStar(star);
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
  };

  StarChart.hide = function() {
    StarChart.menuContainer.visible = false;
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
		return (8 * distanceBetweenPoints(star2.x + star2.xWobble, star2.y + star2.yWobble, star1.x + star1.xWobble, star1.y + star1.yWobble));
	};

	StarChart.selectedStarDistance = function() {
		return StarChart.distanceBetweenStars(StarChart.currentStar.x, StarChart.currentStar.y, StarChart.selectedStar.x, StarChart.selectedStar.y);
// 		return (8 * distanceBetweenPoints(StarChart.selectedStar.x + StarChart.selectedStar.xWobble,StarChart.selectedStar.y +
// 			StarChart.selectedStar.yWobble,StarChart.currentStar.x + StarChart.currentStar.xWobble,StarChart.currentStar.y + StarChart.currentStar.yWobble));
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
        renderer.height - (2 * yPos));
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

    var controllerUsed = false;

    if (playerOneAxes[0] > 0.25 || playerOneAxes[0] < -0.25 || playerOneAxes[1] > 0.25 || playerOneAxes[1] < -0.25) {
      StarChart.currentPosition.x -= playerOneAxes[0] * StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
      StarChart.currentPosition.y -= playerOneAxes[1] * StarChart.movementSpeed * timeDiff * (1 / StarChart.zoom);
      controllerUsed = true;
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

		if (distanceBetweenPoints(-1 * StarChart.currentPosition.x,-1 * StarChart.currentPosition.y,StarChart.centerStar.x, StarChart.centerStar.y) > 2) {
			StarChart.reposition();
		}

    if (playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {
      StarChart.zoom = Math.min(StarChart.maxZoom,Math.max(StarChart.minZoom,StarChart.zoom - (StarChart.zoom * 0.9 * timeDiff * playerOneAxes[3])));
    }

    if (playerOneButtonsPressed[1] || esc) {
      StarChart.backButton.click();
    }

    if ((playerOneButtonsPressed[0] || spaceBar) && StarChart.launchButton.text.visible) {
      StarChart.launchButton.click();
    }

		if ((playerOneButtonsPressed[4] || q) && StarChart.fastTravelButton.text.visible) {
      StarChart.fastTravelButton.click();
    }

    StarChart.starField.update();
		StarChart.locator.update();

    var closestStarToCentre = StarChart.currentStar;
    var closestStarToCentreDistance = 10000;

    for (var i = StarChart.centerStar.x - StarChart.distanceToPlot; i <= StarChart.centerStar.x + StarChart.distanceToPlot; i++) {
      for (var j = StarChart.centerStar.y - StarChart.distanceToPlot; j <= StarChart.centerStar.y + StarChart.distanceToPlot; j++) {
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

        if (pixelPositionX > bounds.x && pixelPositionX < bounds.x + bounds.width &&
           pixelPositionY > bounds.y && pixelPositionY < bounds.y + bounds.height) {

          if (!star.sprite || StarChart.Stars.starsArray.indexOf(star.sprite) === -1) {
            star.sprite = StarChart.Stars.nextStar();
          }

          star.sprite.tint = StarChart.calculateTint(star);
          star.sprite.position.x = pixelPositionX;
          star.sprite.position.y = pixelPositionY;
          star.sprite.visible = true;
					star.sprite.scale.x = star.sprite.scale.y = star.scale * StarChart.zoom * 0.5;
          star.sprite.alpha = StarChart.calcFade(pixelPositionX,pixelPositionY,bounds);
        } else {
          if (star.sprite) {
            star.sprite.visible = false;
						StarChart.Stars.discardedStars.push(star.sprite);
						star.sprite = undefined;
          }
        }
      }
    }

    if (closestStarToCentre && controllerUsed) {
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
		StarChart.shipSprite.anchor = {x:-0.5 * StarChart.zoom,y:0.3};
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
				}

				if (StarChart.selectedStarDistance() < StarChart.maxDistance) {

					StarChart.plan.lineStyle(Math.max(1,gameModel.resolutionFactor), 0xFFFFFF);

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
    StarChart.rangeCircle.lineStyle(Math.max(Math.max(1,gameModel.resolutionFactor),gameModel.resolutionFactor), 0xFFFFFF);
    StarChart.rangeCircle.tint = 0x005050;
    // StarChart.rangeCircle.alpha = 0.5;
    var circleX = centerPixels.x + ((StarChart.currentPosition.x + StarChart.currentStar.x + StarChart.currentStar.xWobble) * starSpacing);
    var circleY = centerPixels.y + ((StarChart.currentPosition.y + StarChart.currentStar.y + StarChart.currentStar.yWobble) * starSpacing);
    var radius = StarChart.maxDistance * starSpacing / 8;
    StarChart.rangeCircle.drawCircle(
      circleX,
      circleY,
      radius
    );


    for (var k = 0; k < StarChart.history.length; k++) {

			StarChart.history[k].line.clear();

			if (StarChart.chart[StarChart.history[k].firstStar.x] && StarChart.chart[StarChart.history[k].nextStar.x] &&
				 StarChart.chart[StarChart.history[k].firstStar.x][StarChart.history[k].firstStar.y] &&
				 StarChart.chart[StarChart.history[k].nextStar.x][StarChart.history[k].nextStar.y]) {

				var firstStar = StarChart.chart[StarChart.history[k].firstStar.x][StarChart.history[k].firstStar.y];
				var secondStar = StarChart.chart[StarChart.history[k].nextStar.x][StarChart.history[k].nextStar.y];

				StarChart.history[k].line.lineStyle(Math.max(1,gameModel.resolutionFactor), 0xFFFFFF);

				startX = centerPixels.x + ((StarChart.currentPosition.x + firstStar.x + firstStar.xWobble) * starSpacing);
				startY = centerPixels.y + ((StarChart.currentPosition.y + firstStar.y + firstStar.yWobble) * starSpacing);
				endX = centerPixels.x + ((StarChart.currentPosition.x + secondStar.x + secondStar.xWobble) * starSpacing);
				endY = centerPixels.y + ((StarChart.currentPosition.y + secondStar.y + secondStar.yWobble) * starSpacing);

				StarChart.history[k].line.moveTo(startX,startY);
				StarChart.history[k].line.lineTo(endX,endY);

				//StarChart.history[k].line.alpha = 0.1 * Math.min(StarChart.calcFade(startX,startY,bounds),StarChart.calcFade(endX,endY,bounds));
			}
    }

	};
