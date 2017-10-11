PilotSchool = {
  menuTitle:"Talents & Perks",
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
    for (i = PilotSchool.menuContainer.children.length - 1; i >= 0; i--){
      var item = PilotSchool.menuContainer.children[i];
      item.destroy(true);
    }
  },
  show : function() {
    PilotSchool.initialize();
    PilotSchool.menuContainer.visible = true;
  }
};

PilotSchool.createTalentTree = function(talentTree) {
  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
  var container = new PIXI.Container();
  var background = new PIXI.Graphics();
  background.beginFill(talentTree.bgColor);
  background.drawRect(0, 0, renderer.width * 0.1, renderer.height * 0.62);
  background.alpha = 0.5;
  container.addChild(background);

  var pointsInTree = 0;
  var selectedTalent;
  var buyDescription;
  var clickFunction;
  switch(talentTree.name) {
    case "GREED":
      pointsInTree = Talents.getGameModelTalents().greedPoints;
      selectedTalent = Talents.getGameModelTalents().greedTalent;
      if (pointsInTree >= 5) {
        buyDescription = "Invest a point in Greed to increase all credits earned by 5%\nCurrent bonus: " + (pointsInTree * 5) + "%";
      }else {
        buyDescription = "Invest a point in Greed to unlock a talent and increase all credits earned by 5%\nCurrent bonus: " + (pointsInTree * 5) + "%";
      }
      clickFunction = function() {
        if (Talents.pointsAvailable() > 0)  {
          Talents.getGameModelTalents().greedPoints++;
          PilotSchool.show();
        }
      };
      break;
    case "PRIDE":
      pointsInTree = Talents.getGameModelTalents().pridePoints;
      selectedTalent = Talents.getGameModelTalents().prideTalent;
      if (pointsInTree >= 5) {
        buyDescription = "Invest a point in Pride to reduce damage from enemies by 5%\nCurrent bonus: " + (pointsInTree * 5) + "%";
      } else {
        buyDescription = "Invest a point in Pride to unlock a talent and reduce damage from enemies by 5%\nCurrent bonus: " + (pointsInTree * 5) + "%";
      }
      clickFunction = function() {
        if (Talents.pointsAvailable() > 0)  {
          Talents.getGameModelTalents().pridePoints++;
          PilotSchool.show();
        }
      };
      break;
    case "WRATH":
      pointsInTree = Talents.getGameModelTalents().wrathPoints;
      selectedTalent = Talents.getGameModelTalents().wrathTalent;
      if (pointsInTree >= 5) {
        buyDescription = "Invest a point in Wrath to increase critical hit damage by 10%\nCurrent bonus: " + (pointsInTree * 10) + "%";
      } else {
        buyDescription = "Invest a point in Wrath to unlock a talent and increase critical hit damage by 10%\nCurrent bonus: " + (pointsInTree * 10) + "%";
      }
      clickFunction = function() {
        if (Talents.pointsAvailable() > 0)  {
          Talents.getGameModelTalents().wrathPoints++;
          PilotSchool.show();
        }
      };
      break;
  }

  var titleText = getText(talentTree.name + " - " + pointsInTree, fontSize, { align: 'center' });
  titleText.anchor = {x:0.5, y:0};
  titleText.position = {x:renderer.width * 0.05,y: 10};
  titleText.tint = MainMenu.titleTint;
  container.addChild(titleText);

  for (var i = 0; i < talentTree.talents.length; i++) {

    var selected = talentTree.talents[i].name == selectedTalent;
    var talentIcon = new PIXI.Container();
    talentIcon.unlocked = i + 1 <= pointsInTree;
    talentIcon.name = talentTree.talents[i].name;
    talentIcon.description = talentTree.talents[i].description;

    var iconBg = new PIXI.Graphics();
    iconBg.beginFill(talentTree.bgColor);
    if (selected)
      iconBg.lineStyle(6 * gameModel.resolutionFactor, 0xFFFFFF);
    else
      iconBg.lineStyle(2 * gameModel.resolutionFactor, 0xAAAAAA);

    iconBg.drawRect(0, 0, renderer.width * 0.04, renderer.width * 0.04);
    talentIcon.addChild(iconBg);

    var pic = new PIXI.Sprite(PIXI.Texture.fromImage(talentTree.talents[i].icon, undefined, undefined, 0.2));
    pic.scale.x = pic.scale.y = 0.3 * scalingFactor;
  	pic.anchor = {x:0.5,y:0.5};
  	pic.position = {x:renderer.width * 0.02,y:renderer.width * 0.02};
    talentIcon.addChild(pic);
    talentIcon.text = iconBg;
    talentIcon.position = {x:(background.width / 2) - iconBg.width / 2, y : renderer.height * 0.06 + (renderer.height * 0.105 * i)};
    container.addChild(talentIcon);

    if (i + 1 > pointsInTree) {
      talentIcon.alpha = 0.5;
    }

    PilotSchool.talentButtons.push(talentIcon);

    switch(talentTree.name) {
      case "GREED":
        talentIcon.click = function() {
          if (this.unlocked)  {
            Talents.getGameModelTalents().greedTalent = this.name;
            PilotSchool.show();
          }
        };
        break;
      case "PRIDE":
      talentIcon.click = function() {
        if (this.unlocked)  {
          Talents.getGameModelTalents().prideTalent = this.name;
          PilotSchool.show();
        }
      };
        break;
      case "WRATH":
      talentIcon.click = function() {
        if (this.unlocked)  {
          Talents.getGameModelTalents().wrathTalent = this.name;
          PilotSchool.show();
        }
      };
        break;
    }
  }

  var buyButton = new PIXI.Container();
  buyButton.name = "BUY";
  buyButton.description = buyDescription;

  var buyBg = new PIXI.Graphics();
  buyBg.beginFill(talentTree.bgColor);

  if (Talents.pointsAvailable() <= 0) {
    buyBg.lineStyle(2 * gameModel.resolutionFactor, 0xAAAAAA);
  } else {
    buyBg.lineStyle(6 * gameModel.resolutionFactor, 0xFFFFFF);
  }


  buyBg.drawRect(0, 0, renderer.width * 0.06, renderer.width * 0.02);
  buyButton.addChild(buyBg);

  var buyPic = new PIXI.Sprite(PIXI.Texture.fromImage("img/hospital-cross.svg", undefined, undefined, 0.2));
  buyPic.scale.x = buyPic.scale.y = 0.15 * scalingFactor;
  buyPic.anchor = {x:0.5,y:0.5};
  buyPic.position = {x:buyBg.width / 2, y:buyBg.height / 2 - (1 * scalingFactor)};
  buyButton.addChild(buyPic);

  buyButton.position = {x:(background.width / 2) - buyBg.width / 2, y : background.height - buyBg.height / 2};
  container.addChild(buyButton);


  buyButton.text = buyBg;
  buyButton.click = clickFunction;

  PilotSchool.talentButtons.push(buyButton);

  return container;
};


PilotSchool.initialize = function () {
  var i;
  if (!PilotSchool.menuContainer) {
    PilotSchool.menuContainer = new PIXI.Container();
    gameContainer.addChild(PilotSchool.menuContainer);
  } else {
    for (i = PilotSchool.menuContainer.children.length - 1; i >= 0; i--){
      var item = PilotSchool.menuContainer.children[i];
      item.destroy(true);
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

  PilotSchool.perkTitle = getText("Talents", fontSize, { align: 'center' });
  PilotSchool.perkTitle.anchor = {x:0.5, y:0};
  PilotSchool.perkTitle.position = {x:renderer.width * 0.3,y: renderer.height * 0.08};
  PilotSchool.perkTitle.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.perkTitle);
  PilotSchool.perkDesc = getText("Talent points are earned by killing bosses. Available Points: " + Talents.pointsAvailable() + "\nYou can equip one talent from each branch", (MainMenu.fontSize - 4) * scalingFactor, { align: 'center' });
  PilotSchool.perkDesc.anchor = {x:0.5, y:0};
  PilotSchool.perkDesc.position = {x:renderer.width * 0.3,y: renderer.height * 0.12};
  PilotSchool.perkDesc.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.perkDesc);

  PilotSchool.trainingTitle = getText("Perks", fontSize, { align: 'center' });
  PilotSchool.trainingTitle.anchor = {x:0.5, y:0};
  PilotSchool.trainingTitle.position = {x:renderer.width * 0.7,y: renderer.height * 0.08};
  PilotSchool.trainingTitle.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.trainingTitle);
  PilotSchool.trainingDesc = getText("Perks are small upgrades that can be bought with credits", (MainMenu.fontSize - 4) * scalingFactor, { align: 'center' });
  PilotSchool.trainingDesc.anchor = {x:0.5, y:0};
  PilotSchool.trainingDesc.position = {x:renderer.width * 0.7,y: renderer.height * 0.12};
  PilotSchool.trainingDesc.tint = MainMenu.titleTint;
  PilotSchool.menuContainer.addChild(PilotSchool.trainingDesc);

  // create Talents
  PilotSchool.talentButtons = [];

  for (i = 0; i < Talents.talentTrees.length; i++) {
    var talentContainer = PilotSchool.createTalentTree(Talents.talentTrees[i]);
    talentContainer.position = {x : renderer.width * 0.12 + (renderer.width * 0.13 * i), y : renderer.height * 0.2};
    PilotSchool.menuContainer.addChild(talentContainer);
  }

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
    upgrade.position.y = renderer.height * 0.2 + (i * renderer.height * 0.108);

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
          gameModel.p1.credits -= price * getBuyPriceModifier();
          gameModel.p1.upgrades[name] += 1;
          Sounds.powerup.play();
          save();
          PilotSchool.initialize();
          PilotSchool.show();
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

  for (var i = 0; i < PilotSchool.talentButtons.length; i++) {
    if (MainMenu.checkButton(PilotSchool.talentButtons[i])) {
      PilotSchool.showItemHover(PilotSchool.talentButtons[i]);
      return true;
    }
  }
  PilotSchool.hideItemHover();

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

  for (i = 0; i < PilotSchool.talentButtons.length; i++) {
    if (MainMenu.checkButton(PilotSchool.talentButtons[i])) {
      PilotSchool.talentButtons[i].click();
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
      if (child.defaultTint != MainMenu.unselectableTint)
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

PilotSchool.showItemHover = function(button) {
  if (lastUsedInput == inputTypes.controller)
    return;

  if (PilotSchool.itemHover && PilotSchool.itemHover.item.id != button.name) {
		PilotSchool.itemHover.destroy(true);
    PilotSchool.itemHover = false;
  }
  if (!PilotSchool.itemHover) {
    PilotSchool.itemHover = new PIXI.Container();
    var itemDetails = getText(button.name + "\n" + button.description, MainMenu.fontSize * scalingFactor, { align: 'left' });
    itemDetails.tint = MainMenu.titleTint;
    var bg = new PIXI.Graphics();
    bg.beginFill(MainMenu.modalBackgroundTint);
    bg.drawRect(
      -10 * scalingFactor,
      -10 * scalingFactor,
      itemDetails.getBounds().width + itemDetails.getBounds().x * 2 + 20 * scalingFactor,
      itemDetails.getBounds().height + itemDetails.getBounds().y * 2 + 20 * scalingFactor
    );
    bg.alpha = 0.95;
    PilotSchool.itemHover.addChild(bg);
    PilotSchool.itemHover.addChild(itemDetails);
    PilotSchool.itemHover.item = button.name;
    PilotSchool.menuContainer.addChild(PilotSchool.itemHover);
  }
  if (PilotSchool.itemHover) {
    var hoverPositionX = cursorPosition.x + 10 * scalingFactor;
    var hoverPositionY = cursorPosition.y + 10 * scalingFactor;

    if (lastUsedInput == inputTypes.controller) {
      var buttonBounds = button.text.getBounds();
      hoverPositionX = buttonBounds.x < renderer.width / 2 ? buttonBounds.x + buttonBounds.width : buttonBounds.x;
      hoverPositionY = buttonBounds.y;
    }
    var bounds = PilotSchool.itemHover.getBounds();
    if (renderer.width / 2 > hoverPositionX) {
      PilotSchool.itemHover.position = {x:hoverPositionX, y:Math.min(hoverPositionY, renderer.height - bounds.height - 50 * scalingFactor)};
    } else {
      PilotSchool.itemHover.position = {x:hoverPositionX - bounds.width,y:Math.min(hoverPositionY, renderer.height - bounds.height - 50 * scalingFactor)};
    }
  }
};

PilotSchool.hideItemHover = function() {
  if (PilotSchool.itemHover) {
		PilotSchool.itemHover.destroy(true);
    PilotSchool.itemHover = false;
  }
};
