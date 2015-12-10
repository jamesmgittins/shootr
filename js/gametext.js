var GameText = {};

GameText.credits = {
	maxTexts : 10,
	currText : 0,
	texts : [],
	speed:-50,
	initialize:function(){
		GameText.credits.container = new PIXI.Container();
		
		for (var i =0; i<GameText.credits.maxTexts; i++) {
			GameText.credits.texts[i] = new PIXI.Text('+10', { font: '20px Dosis', fill: '#0D0', stroke: "#000", strokeThickness:1,align: 'center' });
			GameText.credits.texts[i].anchor.set(0.5);
			GameText.credits.texts[i].visible=false;
			GameText.credits.container.addChild(GameText.credits.texts[i]);
		}
		
		uiContainer.addChild(GameText.credits.container);
	},
	update:function(timeDiff){ 
		for (var i =0; i<GameText.credits.maxTexts; i++) {
			if (GameText.credits.texts[i].visible) {
				GameText.credits.texts[i].alpha -= 0.5* timeDiff;
				if(GameText.credits.texts[i].alpha <= 0) {
					GameText.credits.texts[i].visible = false;
				} else {
					GameText.credits.texts[i].position.y += GameText.credits.speed * timeDiff;
				}
			}
		}
	},
	newCreditText:function(x,y,text) {
		GameText.credits.currText++;
		if (GameText.credits.currText >= GameText.credits.maxTexts) {
			GameText.credits.currText=0;
		}
		GameText.credits.texts[GameText.credits.currText].visible=true;
		GameText.credits.texts[GameText.credits.currText].text=text;
		GameText.credits.texts[GameText.credits.currText].position.x=x;
		GameText.credits.texts[GameText.credits.currText].position.y=y;
		GameText.credits.texts[GameText.credits.currText].alpha = 1;
	}
};

GameText.bigText = {
    maxTexts: 3,
    currText: 0,
    texts: [],
    speed: -50,
    initialize: function () {
        GameText.bigText.container = new PIXI.Container();

        for (var i = 0; i < GameText.bigText.maxTexts; i++) {
            GameText.bigText.texts[i] = new PIXI.Text('+10', { font: '32px Dosis', fill: '#0D0', stroke: "#000", strokeThickness: 1, align: 'center' });
            GameText.bigText.texts[i].anchor.set(0.5);
            GameText.bigText.texts[i].visible = false;
            GameText.bigText.container.addChild(GameText.bigText.texts[i]);
        }

        uiContainer.addChild(GameText.bigText.container);
    },
    update: function (timeDiff) {
        for (var i = 0; i < GameText.bigText.maxTexts; i++) {
            if (GameText.bigText.texts[i].visible) {
                GameText.bigText.texts[i].alpha -= 0.3 * timeDiff;
                if (GameText.bigText.texts[i].alpha <= 0) {
                    GameText.bigText.texts[i].visible = false;
                } else {
                    GameText.bigText.texts[i].position.y += GameText.bigText.speed * timeDiff;
                }
            }
        }
    },
    newBigText: function (text) {
        GameText.bigText.currText++;
        if (GameText.bigText.currText >= GameText.bigText.maxTexts) {
            GameText.bigText.currText = 0;
        }
        GameText.bigText.texts[GameText.bigText.currText].visible = true;
        GameText.bigText.texts[GameText.bigText.currText].text = text;
        GameText.bigText.texts[GameText.bigText.currText].position.x = canvasWidth / 2;
        GameText.bigText.texts[GameText.bigText.currText].position.y = canvasHeight / 2;
        GameText.bigText.texts[GameText.bigText.currText].alpha = 1;
    }
};