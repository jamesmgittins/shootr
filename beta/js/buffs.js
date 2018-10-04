Buffs = {
  buffNames : {
    crossShot : "Cross Shot",
    spreadShot : "Spread Shot"
  },
  currentBuffs : [],

  reset : function () {
    Buffs.currentBuffs = [];
  },

  update : function(timeDiff) {

    if (debug && Buffs.currentBuffs.length < 8) {
      Buffs.randomBuff();
    }

    var buffsToKeep = [];
    for (var i = 0; i < Buffs.currentBuffs.length; i++) {
      if (!Buffs.currentBuffs[i].permanent)
        Buffs.currentBuffs[i].time -= timeDiff;

      if (!Buffs.currentBuffs[i].container || (Buffs.currentBuffs[i].time > 0 || Buffs.currentBuffs[i].container.alpha > 0)) {
        buffsToKeep.push(Buffs.currentBuffs[i]);
      } else {
        Buffs.currentBuffs[i].container.visible = false;
      }
    }
    Buffs.currentBuffs = buffsToKeep;

    var sideSpace = ((renderer.width - renderer.height) / 2);
    var buffsPerRow = Math.floor(sideSpace / (Buffs.iconSize * scalingFactor)) - 1;

    for (i = 0; i < Buffs.currentBuffs.length; i++) {
      if (!Buffs.currentBuffs[i].container || Buffs.currentBuffs[i].container._destroyed) {
        Buffs.createContainer(Buffs.currentBuffs[i]);
        GameText.status.container.addChild(Buffs.currentBuffs[i].container);
      }

      var xPos = sideSpace / (buffsPerRow + 1);
			var row = Math.floor(i / buffsPerRow);
			var col = i - row * buffsPerRow;
      Buffs.currentBuffs[i].container.anchor = {x:0.5,y:0.5};
			Buffs.currentBuffs[i].container.position = {x:(xPos + xPos * col) - Buffs.currentBuffs[i].container.width / 2,y:380 * scalingFactor - (row * scalingFactor * 54)};
      Buffs.currentBuffs[i].timeText.text = Buffs.currentBuffs[i].time < 0 || Buffs.currentBuffs[i].permanent ? "" : Math.round(Buffs.currentBuffs[i].time);
      if (Buffs.currentBuffs[i].time < 0) {
        Buffs.currentBuffs[i].container.alpha -= 2 * timeDiff;
      }
    }

  },

  newBuff : function(name, time, icon, bgColor, permanent, noText) {
    var refreshed = false;
    for (var i = 0; i < Buffs.currentBuffs.length; i++) {
      if (Buffs.currentBuffs[i].name == name) {
        Buffs.currentBuffs[i].time = time;
        if (Buffs.currentBuffs[i].container) {
          Buffs.currentBuffs[i].container.alpha = 1;
          Buffs.currentBuffs[i].container.visible = true;
        }
        refreshed = true;
      }
    }
    if (!refreshed) {
      if (!noText)
        GameText.bigText.newBigText(name + "!");

      Buffs.currentBuffs.push({
        name: name,
        time: time,
        icon: icon,
        bgColor: bgColor,
        permanent : permanent
      });
    }
  },

  removeBuff : function(name) {
    for (var i = 0; i < Buffs.currentBuffs.length; i++) {
      if (Buffs.currentBuffs[i].name == name) {
        Buffs.currentBuffs[i].time = 0;
        Buffs.currentBuffs[i].permanent = false;
      }
    }
  },

  randomBuff : function() {
    var text = "Debug Buff ";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    Buffs.newBuff(text, 10 + Math.random() * 20, "img/barbed-arrow.svg", Constants.itemColors.hyper);
  },

  iconSize : 40,

  createContainer : function(buff) {
    buff.container = new PIXI.Container();

    var iconBg = new PIXI.Graphics();
    iconBg.beginFill(buff.bgColor);
    iconBg.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
    iconBg.drawRect(0, 0, Buffs.iconSize * scalingFactor, Buffs.iconSize * scalingFactor);

    buff.container.addChild(iconBg);

    var pic = new PIXI.Sprite(PIXI.Texture.fromImage(buff.icon, undefined, undefined, 0.2));
    pic.scale.x = pic.scale.y = 0.25 * scalingFactor;
    pic.anchor = {x:0.5,y:0.5};
    pic.position = {x:Buffs.iconSize/2 * scalingFactor,y:Buffs.iconSize/2 * scalingFactor};
    pic.alpha = 0.7;
    buff.container.addChild(pic);

    buff.timeText = getText(buff.permanent ? "" : Math.round(buff.time), 14 * scalingFactor, { align: 'center', fill : '#FFF', stroke : "#FFF", strokeThickness : 2});
    buff.timeText.anchor = {x:1, y: 0};
    buff.timeText.position = {x:iconBg.width - 3 * scalingFactor, y: 0};
    buff.container.addChild(buff.timeText);
  },

  addCrossShotBuff : function() {
    Buffs.newBuff(Buffs.buffNames.crossShot, 10, "img/xmark.svg", Constants.itemColors.hyper);
  },

  addSpreadShotBuff : function() {
    Buffs.newBuff(Buffs.buffNames.spreadShot, 10, "img/method-draw-image.svg", Constants.itemColors.hyper);
  },

  isBuffActive : function(name) {
    for (var i = 0; i < Buffs.currentBuffs.length; i++) {
      if (Buffs.currentBuffs[i].name == name)
        return true;
    }
    return false;
  }
};
