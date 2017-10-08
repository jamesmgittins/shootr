Loadout = {
  menuTitle:"Weapons Loadout",
  positions:{
    frontWeapon:0,
    turretWeapon:1,
    rearWeapon:2,
    shield:3
  },
  weapons:[],
  shields:[],
  menuOptions:[
    {index:0,title:"Front Weapon Position", click:function(){
      Loadout.selectPosition(0);
    }},
    {index:1,title:"Turret Weapon Position", click:function(){
      Loadout.selectPosition(1);
    }},
    {index:2,title:"Rear Weapon Position", click:function(){
      Loadout.selectPosition(2);
    }},
    {index:3,title:"Shield Position", click:function(){
      Loadout.selectPosition(3);
    }}
  ],
  backButton:{index:4,title:"Back",buttonDesc:buttonTypes.back, click:function(){
    Loadout.hide();
    StationMenu.show();
  }},
  weaponSelection:0,
  currentSelection:0,
  bButton : function(){},
  invalidLevelTint : 0xFF3333,
  levelAllowed : 1
};

Loadout.selectPosition = function(index) {

  Loadout.positionSelector.clear();
  Loadout.positionSelector.lineStyle(2, 0x008000);
  var bounds = Loadout.menuOptions[index].text.getBounds();
  Loadout.positionSelector.drawRect(bounds.x - 5,bounds.y - 5,bounds.width + 10,bounds.height + 10);

  Loadout.positionSelector.visible=true;

  Loadout.currentPosition = index;

  Loadout.locationSelector.clear();
  // Loadout.locationSelector.filters = [new PIXI.filters.BlurFilter()];
  Loadout.locationSelector.lineStyle(2 * scalingFactor, 0x008000);
  Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 16);

  Loadout.weapons = [];
  Loadout.shields = [];

  switch (index) {
    case 0:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y - Loadout.shipSprite.height / 4;
      Loadout.showWeapons();
      break;
    case 1:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y;
      Loadout.showWeapons();
      break;
    case 2:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y + Loadout.shipSprite.height / 4;
      Loadout.locationSelector.clear();
      Loadout.locationSelector.lineStyle(2 * scalingFactor, 0x008000);
      Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 8);
      Loadout.showWeapons();
      break;
    case 3:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y;
      Loadout.locationSelector.clear();
      Loadout.locationSelector.lineStyle(2 * scalingFactor, 0x008000);
      Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 1.8);
      Loadout.showShields();
      break;
  }

  Loadout.locationSelector.visible = true;
}

Loadout.showWeapons = function() {

  Loadout.weaponsContainer.visible = true;
  Loadout.weaponMenuOpen = true;
  Loadout.shieldMenuOpen = false;
  Loadout.weaponSelection = 0;

  for (var i=Loadout.weaponsContainer.children.length - 1; i >= 0; i--){
    var item = Loadout.weaponsContainer.children[i];
    Loadout.weaponsContainer.removeChild(item);
    item.destroy();
  }

  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
  var positionText = "";

  switch(Loadout.currentPosition) {
    case Loadout.positions.frontWeapon:
      var equippedWeapon = gameModel.p1.frontWeapon;
      Loadout.levelAllowed = gameModel.p1.ship.frontWeaponLevel;
      positionText = " Front";
      break;
    case Loadout.positions.turretWeapon:
      var equippedWeapon = gameModel.p1.turretWeapon;
      Loadout.levelAllowed = gameModel.p1.ship.turretWeaponLevel;
      positionText = " Turret";
      break;
    case Loadout.positions.rearWeapon:
      var equippedWeapon = gameModel.p1.rearWeapon;
      Loadout.levelAllowed = gameModel.p1.ship.rearWeaponLevel;
      positionText = " Rear";
      break;
  }

  var screenPosition = renderer.height / 5;
  var index = 0;

  if (equippedWeapon) {
    Loadout.weapons[0] = {
      index : 0,
      weapon : equippedWeapon,
      text : new PIXI.Text("Level " + equippedWeapon.level + " " + equippedWeapon.name + " [Equipped" + positionText + "]\n" + formatMoney(equippedWeapon.dps) + " DPS / " + equippedWeapon.shotsPerSecond.toFixed(2) + " shots per second", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' })
    }
    Loadout.weapons[0].defaultTint = MainMenu.buttonTint;
    Loadout.weapons[0].text.tint = Loadout.weapons[0].defaultTint
    Loadout.weapons[0].text.position = {x:renderer.width * 0.7, y:screenPosition};
    Loadout.weaponsContainer.addChild(Loadout.weapons[0].text);
    screenPosition += 110;
    index++;
  }

  gameModel.p1.weapons.sort(function(a,b){
    return b.dps - a.dps;
  })

  for (var i=0; i<gameModel.p1.weapons.length; i++) {
    if (!equippedWeapon || gameModel.p1.weapons[i].id != equippedWeapon.id) {
      var equippedText = "";
      if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.id == gameModel.p1.weapons[i].id)
        equippedText = " [Equipped Front]";
      if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.id == gameModel.p1.weapons[i].id)
        equippedText = " [Equipped Turret]";
      if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.id == gameModel.p1.weapons[i].id)
        equippedText = " [Equipped Rear]";

      Loadout.weapons[index] = {
        index : index,
        weapon : gameModel.p1.weapons[i],
        text : new PIXI.Text("Level " + gameModel.p1.weapons[i].level + " " + gameModel.p1.weapons[i].name + equippedText + "\n" + formatMoney(gameModel.p1.weapons[i].dps) + " DPS / " + gameModel.p1.weapons[i].shotsPerSecond.toFixed(2) + " shots per second", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' })
      }
      Loadout.weapons[index].defaultTint = gameModel.p1.weapons[i].level <= Loadout.levelAllowed ? MainMenu.buttonTint : Loadout.invalidLevelTint;
      Loadout.weapons[index].text.tint = Loadout.weapons[index].defaultTint;
      Loadout.weapons[index].text.position = {x:renderer.width * 0.7, y:screenPosition};
      Loadout.weaponsContainer.addChild(Loadout.weapons[index].text);
      screenPosition += 110;
      index++;
    }
  }
}

Loadout.selectShield = function(index) {

  if (Loadout.shields[index].weapon.level > Loadout.levelAllowed) {
    Sounds.damage.play();
    return;
  }

  gameModel.p1.shield = Loadout.shields[index].weapon;
  Loadout.menuOptions[3].equippedText.text = "Level " + gameModel.p1.shield.level + " " + gameModel.p1.shield.name + " equipped";
  Loadout.menuOptions[3].equippedText.tint = Loadout.menuOptions[3].equippedText.defaultTint = MainMenu.buttonTint;
  Loadout.showShields();
}

Loadout.selectWeapon = function(index) {

  if (Loadout.weapons[index].weapon.level > Loadout.levelAllowed) {
    Sounds.damage.play();
    return;
  }

  if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.frontWeapon = undefined;
    Loadout.menuOptions[0].equippedText.text = "Empty Slot";
    Loadout.menuOptions[0].equippedText.tint = Loadout.menuOptions[0].equippedText.defaultTint = Loadout.invalidLevelTint;
  }
  if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.turretWeapon = undefined;
    Loadout.menuOptions[1].equippedText.text = "Empty Slot";
    Loadout.menuOptions[1].equippedText.tint = Loadout.menuOptions[1].equippedText.defaultTint = Loadout.invalidLevelTint;
  }
  if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.rearWeapon = undefined;
    Loadout.menuOptions[2].equippedText.text = "Empty Slot";
    Loadout.menuOptions[2].equippedText.tint = Loadout.menuOptions[2].equippedText.defaultTint = Loadout.invalidLevelTint;
  }

  switch(Loadout.currentPosition) {
    case Loadout.positions.frontWeapon:
      gameModel.p1.frontWeapon = Loadout.weapons[index].weapon;
      gameModel.p1.frontWeapon.rear = false;
      Loadout.menuOptions[0].equippedText.text = "Level " + Loadout.weapons[index].weapon.level + " " + Loadout.weapons[index].weapon.name + " equipped";
      Loadout.menuOptions[0].equippedText.tint = Loadout.menuOptions[0].equippedText.defaultTint = MainMenu.buttonTint;
      Loadout.showWeapons();
      break;
    case Loadout.positions.turretWeapon:
      gameModel.p1.turretWeapon = Loadout.weapons[index].weapon;
      gameModel.p1.turretWeapon.rear = false;
      Loadout.menuOptions[1].equippedText.text = "Level " + Loadout.weapons[index].weapon.level + " " + Loadout.weapons[index].weapon.name + " equipped";
      Loadout.menuOptions[1].equippedText.tint = Loadout.menuOptions[1].equippedText.defaultTint = MainMenu.buttonTint;
      Loadout.showWeapons();
      break;
    case Loadout.positions.rearWeapon:
      gameModel.p1.rearWeapon = Loadout.weapons[index].weapon;
      gameModel.p1.rearWeapon.rear = true;
      Loadout.menuOptions[2].equippedText.text = "Level " + Loadout.weapons[index].weapon.level + " " + Loadout.weapons[index].weapon.name + " equipped";
      Loadout.menuOptions[2].equippedText.tint = Loadout.menuOptions[2].equippedText.defaultTint = MainMenu.buttonTint;
      Loadout.showWeapons();
      break;
  }
  Loadout.updateTotalDPS();
}

Loadout.showShields = function() {

  Loadout.weaponsContainer.visible = true;
  Loadout.shieldMenuOpen = true;
  Loadout.weaponMenuOpen = false;
  Loadout.weaponSelection = 0;
  Loadout.levelAllowed = gameModel.p1.ship.shieldLevel;

  for (var i=Loadout.weaponsContainer.children.length - 1; i >= 0; i--){
    var item = Loadout.weaponsContainer.children[i];
    Loadout.weaponsContainer.removeChild(item);
    item.destroy();
  }

  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

  var equippedShield = gameModel.p1.shield;

  var screenPosition = renderer.height / 5;
  var index = 0;

  if (equippedShield) {
    Loadout.shields[0] = {
      index : 0,
      weapon : equippedShield,
      text : new PIXI.Text("Level " + equippedShield.level + " " + equippedShield.name + " [Equipped]\n" + formatMoney(equippedShield.capacity) + " Capacity / " + formatMoney(equippedShield.chargePerSecond) + " charge per sec", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' })
    }
    Loadout.shields[0].defaultTint = MainMenu.buttonTint;
    Loadout.shields[0].text.tint = Loadout.shields[0].defaultTint
    Loadout.shields[0].text.position = {x:renderer.width * 0.7, y:screenPosition};
    Loadout.weaponsContainer.addChild(Loadout.shields[0].text);
    screenPosition += 110;
    index++;
  }

  for (var i=0; i<gameModel.p1.shields.length; i++) {
    if (!equippedShield || gameModel.p1.shields[i].id != equippedShield.id) {
      Loadout.shields[index] = {
        index : index,
        weapon : gameModel.p1.shields[i],
        text : new PIXI.Text("Level " + gameModel.p1.shields[i].level + " " + gameModel.p1.shields[i].name + "\n" + formatMoney(gameModel.p1.shields[i].capacity) + " Capacity / " + formatMoney(gameModel.p1.shields[i].chargePerSecond) + " charge per sec", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' })
      }
      Loadout.shields[index].defaultTint = gameModel.p1.shields[i].level <= Loadout.levelAllowed ? MainMenu.buttonTint : Loadout.invalidLevelTint;
      Loadout.shields[index].text.tint = Loadout.shields[index].defaultTint;
      Loadout.shields[index].text.position = {x:renderer.width * 0.7, y:screenPosition};
      Loadout.weaponsContainer.addChild(Loadout.shields[index].text);
      screenPosition += 110;
      index++;
    }
  }
}

Loadout.updateTotalDPS = function() {
  var total = 0;
  if (gameModel.p1.frontWeapon)
    total += gameModel.p1.frontWeapon.dps;
  if (gameModel.p1.turretWeapon)
    total += gameModel.p1.turretWeapon.dps;
  if (gameModel.p1.rearWeapon)
    total += gameModel.p1.rearWeapon.dps;
  Loadout.totalDPS.text = "Total Damage Per Second: " + formatMoney(total);
}


Loadout.hide = function() {
  Loadout.menuContainer.visible = false;
};

Loadout.show = function() {
  Loadout.initialize();
  Loadout.menuContainer.visible = true;
};

Loadout.initialize = function () {
  if (!Loadout.menuContainer) {
    Loadout.menuContainer = new PIXI.Container();
    gameContainer.addChild(Loadout.menuContainer);
  } else {
    for (var i=Loadout.menuContainer.children.length - 1; i >= 0; i--){
      var item = Loadout.menuContainer.children[i];
      Loadout.menuContainer.removeChild(item);
      item.destroy();
    }
  }

  Loadout.menuContainer.visible = false;

  Loadout.weaponMenuOpen = false;
  Loadout.shieldMenuOpen = false;

  Loadout.menuBackground = new PIXI.Graphics();
  Loadout.menuBackground.beginFill(0x090909);
  Loadout.menuBackground.drawRect(renderer.width * 0.05, renderer.height * 0.05, renderer.width * 0.9, renderer.height * 0.9);

  Loadout.menuContainer.addChild(Loadout.menuBackground);

  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

  Loadout.titleText = new PIXI.Text(Loadout.menuTitle, { font: fontSize + 'px Dosis', fill: '#060', stroke: "#000", strokeThickness: 1, align: 'center' });
  Loadout.titleText.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05 + 25};
  Loadout.menuContainer.addChild(Loadout.titleText);

  Loadout.backButton.text = new PIXI.Text(Loadout.backButton.title + " (" + ShootrUI.getInputButtonDescription(Loadout.backButton.buttonDesc) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'center' });
  Loadout.backButton.text.tint = MainMenu.buttonTint;

  Loadout.backButton.text.anchor = {x:0,y:1};
  Loadout.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
  Loadout.menuContainer.addChild(Loadout.backButton.text);

  Loadout.totalDPS = new PIXI.Text("Total Damage Per Second: ", { font: Math.round(26 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'center' });
  Loadout.totalDPS.tint = MainMenu.buttonTint;

  Loadout.totalDPS.anchor = {x:0.5,y:1};
  Loadout.totalDPS.position = {x:renderer.width / 2,y: renderer.height * 0.95 - 25};
  Loadout.menuContainer.addChild(Loadout.totalDPS);

  Loadout.shipName = new PIXI.Text("Level " + gameModel.p1.ship.level + " " + gameModel.p1.ship.name, { font: Math.round(26 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'center' });
  Loadout.shipName.tint = MainMenu.buttonTint;

  Loadout.shipName.anchor = {x:0.5,y:0};
  Loadout.shipName.position = {x:renderer.width / 2,y: renderer.height * 0.05 + 25 };
  Loadout.menuContainer.addChild(Loadout.shipName);

  Loadout.updateTotalDPS();
  Loadout.shipSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE * 6, gameModel.p1.ship.seed, false, Ships.enemyColors[gameModel.p1.ship.colorIndex])));
  Loadout.shipSprite.anchor = {x:0.5,y:0.5};
  Loadout.shipSprite.position = {x:renderer.width / 2, y:renderer.height / 2};
  Loadout.menuContainer.addChild(Loadout.shipSprite);

  for (var i=0; i< Loadout.menuOptions.length;i++) {
    var level = 1;
    var weapon = undefined;
    switch (i) {
      case 0:
        level = gameModel.p1.ship.frontWeaponLevel;
        weapon = gameModel.p1.frontWeapon;
        break;
      case 1:
        level = gameModel.p1.ship.turretWeaponLevel;
        weapon = gameModel.p1.turretWeapon;
        break;
      case 2:
        level = gameModel.p1.ship.rearWeaponLevel;
        weapon = gameModel.p1.rearWeapon;
        break;
      case 3:
        level = gameModel.p1.ship.shieldLevel;
        weapon = gameModel.p1.shield;
        break;
    }
    Loadout.menuOptions[i].text = new PIXI.Container();
    Loadout.menuOptions[i].positionText = new PIXI.Text("Level " + level + " " + Loadout.menuOptions[i].title,
                                                { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' });
    Loadout.menuOptions[i].equippedText = new PIXI.Text((typeof weapon !== "undefined" ? "Level " + weapon.level + " " + weapon.name + " equipped" : "Empty Slot"),
                                                { font: Math.round(12 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' });

    Loadout.menuOptions[i].positionText.tint = Loadout.menuOptions[i].positionText.defaultTint = MainMenu.buttonTint;
    Loadout.menuOptions[i].equippedText.tint = Loadout.menuOptions[i].equippedText.defaultTint = typeof weapon !== "undefined" ? MainMenu.buttonTint : Loadout.invalidLevelTint;

    if (Loadout.currentSelection == i) {
      Loadout.menuOptions[i].text.tint = MainMenu.selectedButtonTint;
    }

    Loadout.menuOptions[i].positionText.position = {x:renderer.width * 0.05 + 25, y:renderer.height / 5 + (i * 60 * scalingFactor)};
    Loadout.menuOptions[i].equippedText.position = {x:renderer.width * 0.05 + 25, y:Loadout.menuOptions[i].positionText.position.y + Loadout.menuOptions[i].positionText.getBounds().height};
    Loadout.menuOptions[i].text.addChild(Loadout.menuOptions[i].positionText);
    Loadout.menuOptions[i].text.addChild(Loadout.menuOptions[i].equippedText);
    Loadout.menuContainer.addChild(Loadout.menuOptions[i].text);
  }

  Loadout.positionSelector = new PIXI.Graphics();
  Loadout.positionSelector.lineStyle(2, 0x008000);
  Loadout.positionSelector.drawRect(0,0,110 * scalingFactor,26 * scalingFactor);
  Loadout.positionSelector.visible=false;
  Loadout.menuContainer.addChild(Loadout.positionSelector);

  Loadout.locationSelector = new PIXI.Graphics();
  Loadout.locationSelector.visible=false;
  Loadout.menuContainer.addChild(Loadout.locationSelector);

  Loadout.weaponsContainer = new PIXI.Container();
  Loadout.menuContainer.addChild(Loadout.weaponsContainer);

  Loadout.select(Loadout.menuOptions[0]);

};

Loadout.resize = function () {
  var visible = Loadout.menuContainer.visible;
  Loadout.initialize();
  Loadout.menuContainer.visible = visible;
};

Loadout.checkMouseOver = function () {
  if (!Loadout.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Loadout.backButton)) {
    Loadout.select(Loadout.backButton);
    return true;
  }

  for (var i=0; i< Loadout.menuOptions.length;i++) {
    if (MainMenu.checkButton(Loadout.menuOptions[i])) {
      Loadout.select(Loadout.menuOptions[i]);
    }
  }

  Loadout.weapons.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      Loadout.select(currentValue);
    }
  });

  Loadout.shields.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      Loadout.select(currentValue);
    }
  });

  return false;
};

Loadout.checkClicks = function() {

  if (!Loadout.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Loadout.backButton)) {
    Loadout.backButton.click();
    return true;
  }

  for (var i=0; i< Loadout.menuOptions.length;i++) {
    if (MainMenu.checkButton(Loadout.menuOptions[i])) {
      Loadout.menuOptions[i].click();
      return true;
    }
  }

  Loadout.weapons.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      Loadout.selectWeapon(currentValue.index);
      return true;
    }
  });

  Loadout.shields.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      Loadout.selectShield(currentValue.index);
      return true;
    }
  });

  return false;
};

Loadout.select = function(button) {
  if (typeof button === "undefined")
    return;

  Loadout.backButton.text.tint = MainMenu.buttonTint;
  if (Loadout.weaponMenuOpen || Loadout.shieldMenuOpen) {
    Loadout.weaponSelection = button.index;
  }
  else {
    Loadout.currentSelection = button.index;
  }


  for (var i=0; i< Loadout.menuOptions.length;i++) {
    Loadout.menuOptions[i].positionText.tint = Loadout.menuOptions[i].positionText.defaultTint;
    Loadout.menuOptions[i].equippedText.tint = Loadout.menuOptions[i].equippedText.defaultTint;
  }

  Loadout.weapons.forEach(function(currentValue) {
    currentValue.text.tint = currentValue.defaultTint;
  });

  Loadout.shields.forEach(function(currentValue) {
    currentValue.text.tint = currentValue.defaultTint;
  });

  if (button.text.children && button.text.children.length > 0) {
    button.text.children.forEach(function(child){child.tint = MainMenu.selectedButtonTint});
  }  else {
    button.text.tint = MainMenu.selectedButtonTint;
  }
};

Loadout.up = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    var selection = Loadout.weaponSelection - 1;
    if (selection < 0)
      selection = Loadout.weapons.length - 1;

    Loadout.select(Loadout.weapons[selection]);
  } else if (Loadout.shieldMenuOpen) {
    var selection = Loadout.weaponSelection - 1;
    if (selection < 0)
      selection = Loadout.shields.length - 1;

    Loadout.select(Loadout.shields[selection]);
  }
  else {
    var selection = Loadout.currentSelection - 1;
    if (selection < 0)
      selection = Loadout.menuOptions.length - 1;

    Loadout.select(Loadout.menuOptions[selection]);
  }

  return true;
}

Loadout.down = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    var selection = Loadout.weaponSelection + 1;
    if (selection >= Loadout.weapons.length)
      selection = 0;

    Loadout.select(Loadout.weapons[selection]);
  } else if (Loadout.shieldMenuOpen) {
    var selection = Loadout.weaponSelection + 1;
    if (selection >= Loadout.shields.length)
      selection = 0;

    Loadout.select(Loadout.shields[selection]);
  } else {
    var selection = Loadout.currentSelection + 1;
    if (selection >= Loadout.menuOptions.length)
      selection = 0;

    Loadout.select(Loadout.menuOptions[selection]);
  }

  return true;
}

Loadout.aButton = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    Loadout.selectWeapon(Loadout.weaponSelection);
  } else if (Loadout.shieldMenuOpen) {
    Loadout.selectShield(Loadout.weaponSelection);
  } else {
    Loadout.menuOptions[Loadout.currentSelection].click();
    Loadout.weaponMenuOpen ? Loadout.select(Loadout.weapons[Loadout.weaponSelection]) : Loadout.select(Loadout.shields[Loadout.weaponSelection]);
  }

  return true;
}

Loadout.bButtonPress = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen || Loadout.shieldMenuOpen) {
    Loadout.weaponsContainer.visible = false;
    Loadout.weaponMenuOpen = false;
    Loadout.shieldMenuOpen = false;
    Loadout.locationSelector.visible = false;
    Loadout.positionSelector.visible=false;
    Loadout.select(Loadout.menuOptions[Loadout.currentSelection]);
  } else {
    Loadout.backButton.click();
  }
  return true;
};
