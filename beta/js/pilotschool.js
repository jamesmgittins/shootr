PilotSchool = {
  menuTitle:"Pilot School",
  backButton:{title:"Back",index:-1,click:function(){
    PilotSchool.hide();
    StationMenu.show();
  }},
  currentSelection:-1,
  bButton : function(){
    PilotSchool.backButton.click();
  },
  showCurrentCredits:true,
  hide : function() {
    PilotSchool.menuContainer.visible = false;
  },
  show : function() {
    PilotSchool.initialize();
    PilotSchool.menuContainer.visible = true;
  }
};


PilotSchool.initialize = function () {
  var i;
  if (!PilotSchool.menuContainer) {
    PilotSchool.menuContainer = new PIXI.Container();
    gameContainer.addChild(PilotSchool.menuContainer);
  } else {
    for (i = PilotSchool.menuContainer.children.length - 1; i >= 0; i--){
      var item = PilotSchool.menuContainer.children[i];
      PilotSchool.menuContainer.removeChild(item);
      item.destroy();
    }
  }
  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

  PilotSchool.menuContainer.visible = false;

  PilotSchool.menuBackground = new PIXI.Graphics();
  PilotSchool.menuBackground.beginFill(MainMenu.backgroundColor);
  PilotSchool.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);
  PilotSchool.menuBackground.alpha = MainMenu.backgroundAlpha;

  PilotSchool.menuContainer.addChild(PilotSchool.menuBackground);

  PilotSchool.titleText = getText(PilotSchool.menuTitle, fontSize, { align: 'center' });
  PilotSchool.titleText.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05 + 25};
  PilotSchool.titleText.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.titleText);

  PilotSchool.currentCredits = getText(formatMoney(gameModel.p1.credits) + " Credits", fontSize, { align: 'center' });
  PilotSchool.currentCredits.tint = MainMenu.titleTint;
  PilotSchool.currentCredits.anchor = {x:1,y:0};
  PilotSchool.currentCredits.position = {x:renderer.width * 0.95 - 25,y: renderer.height * 0.05 + 25};
  PilotSchool.menuContainer.addChild(PilotSchool.currentCredits);

  PilotSchool.backButton.text = getText(PilotSchool.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", fontSize, { align: 'center' });
  PilotSchool.backButton.text.tint = MainMenu.buttonTint;
  PilotSchool.backButton.text.anchor = {x:0,y:1};
  PilotSchool.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
  PilotSchool.menuContainer.addChild(PilotSchool.backButton.text);

  PilotSchool.perkTitle = getText("Perks", fontSize, { align: 'center' });
  PilotSchool.perkTitle.position = {x:renderer.width * 0.3,y: renderer.height * 0.05 + 25};
  PilotSchool.perkTitle.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.perkTitle);

  PilotSchool.trainingTitle = getText("Training", fontSize, { align: 'center' });
  PilotSchool.trainingTitle.position = {x:renderer.width * 0.7,y: renderer.height * 0.05 + 25};
  PilotSchool.trainingTitle.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.trainingTitle);

  PilotSchool.upgradeButtons = [];

  for (i = 0; i < pilotUpgrades.length; i++) {
    var upgrade = new PIXI.Container();

    var titleText = getText(pilotUpgrades[i].name, fontSize, { });
    upgrade.addChild(titleText);

    var descText = getText(pilotUpgrades[i].description, (MainMenu.fontSize - 4) * scalingFactor, { });
    descText.position.y = titleText.getBounds().height;
    upgrade.addChild(descText);

    var currentRank = gameModel.p1.upgrades[pilotUpgrades[i].id] || 0;

    var cost = pilotUpgrades[i].basePrice * Math.pow(pilotUpgrades[i].levelFactor, currentRank);
    var price = formatMoney(cost * getBuyPriceModifier());
    var priceText = getText(price + " Credits", fontSize, { align: 'right' });
    priceText.anchor = {x:1,y:0};
    priceText.position.x = renderer.width * 0.28;
    if (cost * getBuyPriceModifier() > gameModel.p1.credits) {
      priceText.defaultTint = priceText.tint = MainMenu.unselectableTint;
    } else {
      priceText.defaultTint = priceText.tint = MainMenu.buttonTint;
    }
    upgrade.addChild(priceText);

    var rankText = getText("Current Rank: " + currentRank, (MainMenu.fontSize - 4) * scalingFactor, { align: 'right' });
    rankText.anchor = {x:1,y:0};
    rankText.position.y = titleText.getBounds().height;
    rankText.position.x = renderer.width * 0.28;
    upgrade.addChild(rankText);

    var valueText = getText("+" + currentRank + "%", fontSize * 2, { align: 'right' });
    valueText.anchor = {x:0,y:0.5};
    valueText.position.y = upgrade.getBounds().height / 2;
    valueText.position.x = upgrade.getBounds().width + 15 * scalingFactor;
    valueText.tint = valueText.defaultTint = 0xFFFFFF;
    upgrade.addChild(valueText);

    upgrade.position.x = renderer.width * 0.55;
    upgrade.position.y = renderer.height * 0.2 + (i * renderer.height * 0.12);

    rankText.defaultTint = titleText.defaultTint = descText.defaultTint = rankText.tint = titleText.tint = descText.tint = MainMenu.buttonTint;

    PilotSchool.menuContainer.addChild(upgrade);
    PilotSchool.upgradeButtons.push({
      text:upgrade,
      name:pilotUpgrades[i].id,
      title:pilotUpgrades[i].name,
      price:cost,
      rank:currentRank + 1,
      click : function(){
        if (this.price * getBuyPriceModifier()< gameModel.p1.credits) {
          var price = this.price;
          var name = this.name;
          Modal.show({
            text:"Buy rank " + this.rank + " of " + this.title + "\nfor " + formatMoney(this.price * getBuyPriceModifier()) + " Credits?",
            ok : function() {
              gameModel.p1.credits -= price * getBuyPriceModifier();
              gameModel.p1.upgrades[name] += 1;
              Sounds.powerup.play();
              save();
              PilotSchool.initialize();
              PilotSchool.show();
            },
            cancel : function(){

            }
          });
        }
      }
    });
  }
};

PilotSchool.resize = function () {
  var visible = PilotSchool.menuContainer.visible;
  PilotSchool.initialize();
  PilotSchool.menuContainer.visible = visible;
};


PilotSchool.checkMouseOver = function () {
  if (!PilotSchool.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(PilotSchool.backButton)) {
    PilotSchool.select(PilotSchool.backButton);
    return true;
  }

  for (var i = 0; i < PilotSchool.upgradeButtons.length; i++) {
    if (MainMenu.checkButton(PilotSchool.upgradeButtons[i])) {
      PilotSchool.select(PilotSchool.upgradeButtons[i]);
      return true;
    }
  }

  return false;
};

PilotSchool.checkClicks = function() {

  if (!PilotSchool.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(PilotSchool.backButton)) {
    PilotSchool.backButton.click();
    return true;
  }

  for (var i = 0; i < PilotSchool.upgradeButtons.length; i++) {
    if (MainMenu.checkButton(PilotSchool.upgradeButtons[i])) {
      PilotSchool.upgradeButtons[i].click();
      return true;
    }
  }

  return false;
};

PilotSchool.select = function(button) {
  PilotSchool.backButton.text.tint = MainMenu.buttonTint;

  for (var i = 0; i < PilotSchool.upgradeButtons.length; i++) {
    PilotSchool.upgradeButtons[i].text.children.forEach(function(child){
      child.tint = child.defaultTint;
    });
  }

  button.text.tint = MainMenu.selectedButtonTint;
  if (button.text.children) {
    button.text.children.forEach(function(child){
      child.tint = MainMenu.selectedButtonTint;
    });
  }
};

PilotSchool.down = function() {
  if (!PilotSchool.menuContainer.visible)
    return false;

  return true;
};

PilotSchool.left = function() {
  if (!PilotSchool.menuContainer.visible)
    return false;

  return true;
};

PilotSchool.right = function() {
  if (!PilotSchool.menuContainer.visible)
    return false;

  return true;
};

PilotSchool.aButton = function() {
  if (!PilotSchool.menuContainer.visible)
    return false;

  if (PilotSchool.currentSelection == -1)
    PilotSchool.backButton.click();

  return true;
};

PilotSchool.bButtonPress = function() {
  if (!PilotSchool.menuContainer.visible)
    return false;

  PilotSchool.bButton();
  return true;
};
