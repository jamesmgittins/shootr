MainMenu = {
  menuTitle:"Main Menu",
  menuOptions:[
    {title:"Start",click:function(){
      StationMenu.show();
      MainMenu.hide();
    }},
    {title:"Settings", click:function(){
      SettingsMenu.show();
      SettingsMenu.onHide = MainMenu.show;
      MainMenu.hide();
    }},
    {title:"Exit", click:function(){}}],
  currentSelection:0,
  bButton : function(){},
  buttonTint : Constants.uiColors.darkText,
  titleTint : Constants.uiColors.darkText,
  selectedButtonTint : 0xFFFFFF,
  unselectableTint : 0xF44336,
  backgroundAlpha : 0.5,
  backgroundColor : 0x0288D1,
  modalBackgroundTint : 0x003030
};

StationMenu = {
  showCurrentCredits: true,
  menuTitle:"Station Menu",
  menuOptions:[
    {title:"Star Chart",click:function(){
      StationMenu.hide();
      StarChart.show();
    }, description:"Scout nearby systems, plot a course and launch your ship"},
    {title:"Pilot School",click:function(){
      StationMenu.hide();
      PilotSchool.show();
    }, description:"Purchase permanent performance upgrades for your pilot"},
    {title:"Shipyard", click:function(){
      Shipyard.show();
      StationMenu.hide();
    }, description:"Purchase a new ship"},
    {title:"Arms Dealer", click:function(){
      ArmsDealer.show();
      StationMenu.hide();
    }, description:"Buy and sell weapons and shields"},
    {title:"Weapons Loadout", click:function(){
      Loadout.show();
      StationMenu.hide();
    }, description:"Change your equipped weapons and shield"},
    {title:"Settings", click:function(){
      SettingsMenu.show();
      SettingsMenu.onHide = StationMenu.show;
      StationMenu.hide();
    }, description:"Configure the game"}
  ],
  backButton : {title:"Main Menu", buttonDesc:buttonTypes.back, click:function(){
    StationMenu.hide();
    MainMenu.show();
  }},
  currentSelection:0,
  onShow : function() {
    var amountEarned = calculateIncomeSinceLastCheck(30000);
    if (amountEarned > 0) {
      Modal.show({text:"You have earned " + formatMoney(amountEarned) + " Credits from your\ncleared trade routes while you were away"});
    }
  },
  bButton : function(){StationMenu.backButton.click();}
};

DeathMenu = {
  menuTitle:"You have died",
  menuOptions:[
    {title:"Retry Level",click:function(){
      resetGame();
      changeState(states.running);
      StationMenu.hide();
      DeathMenu.hide();
    }},
    {title:"Return to Station", buttonDesc:buttonTypes.back, click:function(){
      StationMenu.show();
      MainMenu.hide();
      DeathMenu.hide();
    }}],
  currentSelection:0,
  bButton : function(){DeathMenu.menuOptions[1].click();},
  onInit:function() {
    var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
    DeathMenu.moneyLostText = new PIXI.Text("You have lost", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'center' });
    DeathMenu.moneyLostText.tint = MainMenu.titleTint;
    DeathMenu.moneyLostText.anchor = {x:0.5,y:0.5};
    DeathMenu.moneyLostText.position = {x:0.5 * renderer.width, y:renderer.height / 5 - (MainMenu.fontSize * 3 * scalingFactor)};
    DeathMenu.menuContainer.addChild(DeathMenu.moneyLostText);
  },
  onShow:function(){
    DeathMenu.selectIndex(0);
    DeathMenu.moneyLostText.text = "You have lost " + formatMoney(gameModel.p1.temporaryCredits) + " credits\nand " + gameModel.lootCollected.length + " cargo crate" + (gameModel.lootCollected.length > 1 ? "s" : "");
  }
};

PauseMenu = {
  menuTitle:"Pause Menu",
  menuOptions:[
    {title:"Continue", buttonDesc:buttonTypes.back, click:function(){
      changeState(states.running);
      PauseMenu.hide();
    }, description:"Unpause and continue the flight"},
    {title:"Settings", click:function(){
      SettingsMenu.show();
      PauseMenu.hide();
      SettingsMenu.onHide = PauseMenu.show;
    }, description:"Adjust game configuration"},
    {title:"Return to Station", click:function(){
      changeState(states.station);
      StationMenu.show();
      SettingsMenu.hide();
      PauseMenu.hide();
    }, description:"Abandon this flight and go back to the station menu"}],
  currentSelection:0,
  bButton : function(){PauseMenu.menuOptions[0].click();},
  onInit : function() {
    // PauseMenu.menuBackground.alpha = 0.8;
  }
};

SettingsMenu = {
  menuTitle:"Settings Menu",
  menuOptions:[
    {title:"Volume",click:function(){
      VolumeMenu.show();
      var settingsOnHide = SettingsMenu.onHide;
      SettingsMenu.onHide = undefined;
      VolumeMenu.onHide = function(){
        SettingsMenu.show();
        SettingsMenu.onHide = settingsOnHide;
      };
      SettingsMenu.hide();
    }, description:"Change the audio volume level"},
    {title:"Full Screen", click:function(){
      ShootrUI.toggleFullscreen();
    }, description:"Switch to full screen. Due to browser security this option must be clicked"},
    {title:"Music: OFF", click:function(){
      if (!gameModel.music) {
        gameModel.music = true;
        SettingsMenu.menuOptions[2].text.text = "Music: ON";
      } else {
        gameModel.music = false;
        SettingsMenu.menuOptions[2].text.text = "Music: OFF";
      }
    }, description:"Toggle music"},
    {title:"V-Sync: ON", click:function(){
      if (vSyncOff) {
        vSyncOff = false;
        SettingsMenu.menuOptions[3].text.text = "V-Sync: ON";
      } else {
        vSyncOff = true;
        SettingsMenu.menuOptions[3].text.text = "V-Sync: OFF";
      }
    }, description:"Toggle limit frame rate to display refresh"},
    {title:"Damage Numbers: ON", click:function(){
      if (!gameModel.dmgNumbers) {
        gameModel.dmgNumbers = true;
        SettingsMenu.menuOptions[4].text.text = "Show Damage Numbers: ON";
      } else {
        gameModel.dmgNumbers = false;
        SettingsMenu.menuOptions[4].text.text = "Show Damage Numbers: OFF";
      }
    }, description:"Toggle display of damage values"},
    {title:"Screen Shake: ON", click:function(){
      if (!gameModel.maxScreenShake) {
        gameModel.maxScreenShake = Constants.maxScreenShake;
        SettingsMenu.menuOptions[5].text.text = "Screen Shake: ON";
      } else {
        gameModel.maxScreenShake = 0;
        SettingsMenu.menuOptions[5].text.text = "Screen Shake: OFF";
      }
    }, description:"Toggle screen shake effect"},
    {title:"Antialiasing: ON", click:function(){
      if (!gameModel.antialiasing) {
        gameModel.antialiasing = true;
        SettingsMenu.menuOptions[6].text.text = "Antialiasing: ON";
      } else {
        gameModel.antialiasing = false;
        SettingsMenu.menuOptions[6].text.text = "Antialiasing: OFF";
      }
      save();
      location.reload(true);
    }, description:"Toggle antialiasing. This will restart the game"},
    {title:"Detail: HIGH", click:function(){
      if (gameModel.detailLevel < 1) {
        gameModel.detailLevel = 1;
        SettingsMenu.menuOptions[7].text.text = "Detail: HIGH";
      } else {
        gameModel.detailLevel = 0.5;
        SettingsMenu.menuOptions[7].text.text = "Detail: LOW";
      }
    }, description:"Toggle particle effect detail"},
    {title:"Delete Save Data", click:function(){
      resetSaveGame();
    }, description:"Delete all save data. This will restart the game"},
    {title:"Resolution Options", click:function(){
      ResolutionMenu.show();
      var settingsOnHide = SettingsMenu.onHide;
      SettingsMenu.onHide = undefined;
      ResolutionMenu.onHide = function(){
        SettingsMenu.show();
        SettingsMenu.onHide = settingsOnHide;
      };
      SettingsMenu.hide();
    }, description:"Change internal rendering resolution"}
  ],
  backButton : {title:"Back", buttonDesc:buttonTypes.back, click:function(){
    SettingsMenu.hide();
  }},
  currentSelection:0,
  bButton : function(){SettingsMenu.backButton.click();},
  onInit : function() {
    var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
    SettingsMenu.controllerText = new PIXI.Text("No controller detected", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
    SettingsMenu.controllerText.tint = MainMenu.titleTint;
    SettingsMenu.controllerText.anchor = {x:1,y:0};
    SettingsMenu.controllerText.position = {x:renderer.width * 0.95 - 25,y: renderer.height * 0.05 + 25};
    SettingsMenu.menuContainer.addChild(SettingsMenu.controllerText);
    if (!gameModel.music) {
      SettingsMenu.menuOptions[2].text.text = "Music: OFF";
    } else {
      SettingsMenu.menuOptions[2].text.text = "Music: ON";
    }
    if (vSyncOff) {
      SettingsMenu.menuOptions[3].text.text = "V-Sync: OFF";
    } else {
      SettingsMenu.menuOptions[3].text.text = "V-Sync: ON";
    }
    if (gameModel.dmgNumbers) {
      SettingsMenu.menuOptions[4].text.text = "Show Damage Numbers: ON";
    } else {
      SettingsMenu.menuOptions[4].text.text = "Show Damage Numbers: OFF";
    }
    if (gameModel.maxScreenShake) {
      SettingsMenu.menuOptions[5].text.text = "Screen Shake: ON";
    } else {
      SettingsMenu.menuOptions[5].text.text = "Screen Shake: OFF";
    }
    if (gameModel.antialiasing) {
      SettingsMenu.menuOptions[6].text.text = "Antialiasing: ON";
    } else {
      SettingsMenu.menuOptions[6].text.text = "Antialiasing: OFF";
    }
    if (gameModel.detailLevel < 1) {
      SettingsMenu.menuOptions[7].text.text = "Detail: LOW";
    } else {
      SettingsMenu.menuOptions[7].text.text = "Detail: HIGH";
    }
  },
  onShow : function() {
    if (player1Gamepad > -1 && typeof navigator.getGamepads !== 'undefined' && navigator.getGamepads()[player1Gamepad]) {
      if (controllerType == controllerTypes.xbox)
        SettingsMenu.controllerText.text = "Xbox controller detected";
      else if (controllerType == controllerTypes.playStation)
        SettingsMenu.controllerText.text = "Playstation controller detected";
      else
        SettingsMenu.controllerText.text = "Controller detected";
    }

  }
};

VolumeMenu = {
  menuTitle:"Volume",
  menuOptions:[
    {title:"Up",click:function(){
      gameModel.masterVolume += 0.05;
      VolumeMenu.volumeText.text = (gameModel.masterVolume * 100).toFixed() + "%";
    }},
    {title:"Down",click:function(){
      if (gameModel.masterVolume - 0.05 > 0) {
        gameModel.masterVolume -= 0.05;
        VolumeMenu.volumeText.text = (gameModel.masterVolume * 100).toFixed() + "%";
      } else {
        gameModel.masterVolume = 0;
        VolumeMenu.volumeText.text = "Muted";
      }
    }},
    {title:"Mute",click:function(){
      gameModel.masterVolume = 0;
      VolumeMenu.volumeText.text = "Muted";
    }}
  ],
  backButton : {title:"Back", buttonDesc:buttonTypes.back, click:function(){
    VolumeMenu.hide();
  }},
  currentSelection:0,
  bButton : function(){VolumeMenu.backButton.click();},
  onInit : function() {
    var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
    VolumeMenu.volumeText = new PIXI.Text((gameModel.masterVolume * 100).toFixed() + "%", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'center' });
    VolumeMenu.volumeText.tint = MainMenu.titleTint;
    VolumeMenu.volumeText.anchor = {x:0.5,y:0.5};
    VolumeMenu.volumeText.position = {x:0.5 * renderer.width, y:renderer.height / 5 - (MainMenu.fontSize * 2.5 * scalingFactor)};
    VolumeMenu.menuContainer.addChild(VolumeMenu.volumeText);
  }
};

ResolutionMenu = {
  menuTitle:"Rendering Resolution",
  currentSelection:0,
  menuOptions:[],
  backButton:{title:"Back", buttonDesc:buttonTypes.back, click:function(){
    ResolutionMenu.hide();
  }},
  bButton : function(){
    ResolutionMenu.backButton.click();
  },
  preInit : function() {
    var maxFactor = window.devicePixelRatio + 1;

    ResolutionMenu.menuOptions = [];
    for (var i = 0.5; i <= maxFactor; i += 0.25) {
      var currentWidth = Math.round(window.innerWidth * i);
      var currentHeight = Math.round(window.innerHeight * i);
      var factor = i;

      ResolutionMenu.menuOptions.push({
        title: Math.round(i * 100) + "% - " + currentWidth + " x " + currentHeight + " px" + (gameModel.resolutionFactor == factor ? " (Current)" : ""),
        click:(function(){
          var factor = i;
          return function() {
            gameModel.resolutionFactor = factor;
            updateAfterScreenSizeChange();
            // save();
            // location.reload(true);
          };
        })()
      });
    }
  }
};

MainMenu.fontSize = 18;

Menus = [DeathMenu,VolumeMenu,ResolutionMenu,SettingsMenu,PauseMenu,StationMenu,MainMenu];

InitializeMenu = function (menu) {

  menu.initialize = function() {

    var i;

    if (menu.preInit) {
      menu.preInit();
    }

    if (!menu.menuContainer) {
      menu.menuContainer = new PIXI.Container();
      gameContainer.addChild(menu.menuContainer);
    } else {
      for (i=menu.menuContainer.children.length - 1; i >= 0; i--){
        var item = menu.menuContainer.children[i];
        menu.menuContainer.removeChild(item);
        item.destroy();
      }
    }

    menu.menuContainer.visible = false;

    menu.menuBackground = new PIXI.Graphics();
    menu.menuBackground.beginFill(MainMenu.backgroundColor);
    menu.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);
    menu.menuBackground.alpha = MainMenu.backgroundAlpha;

    menu.menuContainer.addChild(menu.menuBackground);

    var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

    menu.titleText = new PIXI.Text(menu.menuTitle, { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
    menu.titleText.tint = MainMenu.titleTint;
    menu.titleText.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05 + 25};
    menu.menuContainer.addChild(menu.titleText);


    if (menu.backButton) {
      menu.backButton.text = new PIXI.Text(menu.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
      menu.backButton.text.tint = MainMenu.buttonTint;
      menu.backButton.text.anchor = {x:0,y:1};
      menu.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
      menu.menuContainer.addChild(menu.backButton.text);
    }
    if (menu.showCurrentCredits) {
      menu.currentCredits = new PIXI.Text(formatMoney(gameModel.p1.credits) + " Credits", {font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center'});
      menu.currentCredits.tint = MainMenu.titleTint;
      menu.currentCredits.anchor = {x: 1, y: 0};
      menu.currentCredits.position = {x: renderer.width * 0.95 - 25, y: renderer.height * 0.05 + 25};
      menu.menuContainer.addChild(menu.currentCredits);
    }


    menu.menuOptionsContainer = new PIXI.Container();

    for (i=0; i< menu.menuOptions.length;i++) {
      menu.menuOptions[i].text = new PIXI.Text(menu.menuOptions[i].title, { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
      if (menu.menuOptions[i].buttonDesc)
        menu.menuOptions[i].text.text = menu.menuOptions[i].title + " (" + ShootrUI.getInputButtonDescription(menu.menuOptions[i].buttonDesc) + ")";
      menu.menuOptions[i].text.tint = MainMenu.buttonTint;
      if (menu.currentSelection == i) {
        menu.menuOptions[i].text.tint = MainMenu.selectedButtonTint;
      }

      menu.menuOptions[i].text.anchor = {x:0.5,y:0.5};
      menu.menuOptions[i].text.position = {x:0.5 * renderer.width, y:(i * MainMenu.fontSize * 2.5 * scalingFactor)};
      menu.menuOptionsContainer.addChild(menu.menuOptions[i].text);
    }

    menu.menuOptionsContainer.position.y = Math.min(renderer.height / 2 - menu.menuOptionsContainer.getBounds().height / 2, renderer.height * 0.25);
    menu.menuContainer.addChild(menu.menuOptionsContainer);

    if (menu.onInit) {
      menu.onInit();
    }

  };

  menu.initialize();

  menu.resize = function () {
    if (menu.menuContainer) {
      var visible = menu.menuContainer.visible;
      menu.initialize();
      menu.menuContainer.visible = visible;
    }
  };

  menu.selectIndex = function(index) {
    menu.currentSelection = index;
    for (var i=0; i< menu.menuOptions.length;i++) {
      if (index == i) {
        menu.menuOptions[i].text.tint = MainMenu.selectedButtonTint;
        menu.drawButtonDescription(menu.menuOptions[i]);
      } else {
        menu.menuOptions[i].text.tint = MainMenu.buttonTint;
      }
    }
  };

  menu.select = function(button) {

    for (var i=0; i< menu.menuOptions.length;i++) {
      menu.menuOptions[i].text.tint = MainMenu.buttonTint;
    }
    menu.currentSelection = menu.menuOptions.indexOf(button);
    button.text.tint = MainMenu.selectedButtonTint;
    menu.drawButtonDescription(button);
  };

  menu.drawButtonDescription = function(button) {
    if (button.description) {
      if (menu.descriptionContainer) {
        menu.menuContainer.removeChild(menu.descriptionContainer);
      }
      menu.descriptionContainer = new PIXI.Container();
      menu.menuContainer.addChild(menu.descriptionContainer);

      var text = new PIXI.Text(button.description, { font: Math.round(MainMenu.fontSize * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
      text.tint = MainMenu.buttonTint;
      text.anchor = {x:0.5, y:1};
      var descBG = new PIXI.Graphics();
      descBG.beginFill(MainMenu.modalBackgroundTint);
      descBG.drawRect(
        text.getBounds().x - 50 * scalingFactor,
        text.getBounds().y - 2 * scalingFactor,
        text.getBounds().width + 100 * scalingFactor,
        text.getBounds().height + 4 * scalingFactor
      );
      descBG.alpha = 0.95;
      menu.descriptionContainer.addChild(descBG);
      menu.descriptionContainer.addChild(text);
      menu.descriptionContainer.anchor = {x:0.5, y:1};
      menu.descriptionContainer.position = {x:renderer.width / 2, y: renderer.height * 0.95 - 25};
    } else {
      if (menu.descriptionContainer) {
        menu.menuContainer.removeChild(menu.descriptionContainer);
      }
    }
  };

  menu.checkMouseOver = function () {
    if (!menu.menuContainer || !menu.menuContainer.visible)
      return false;

    for (var i=0; i< menu.menuOptions.length;i++) {
      if (MainMenu.checkButton(menu.menuOptions[i])) {
        menu.select(menu.menuOptions[i]);
        return true;
      }
    }
    if (menu.backButton && MainMenu.checkButton(menu.backButton)) {
      menu.select(menu.backButton);
      return true;
    }
    return false;
  };

  menu.checkClicks = function() {
    if (!menu.menuContainer || !menu.menuContainer.visible)
      return false;

    for (var i=0; i< menu.menuOptions.length;i++) {
      if (MainMenu.checkButton(menu.menuOptions[i])) {
        menu.menuOptions[i].click();
        return true;
      }
      if (menu.backButton && MainMenu.checkButton(menu.backButton)) {
        menu.backButton.click();
        return true;
      }
    }

    return false;
  };

  menu.up = function() {
    if (!menu.menuContainer.visible)
      return false;

    var selection = menu.currentSelection - 1;
    if (selection < 0)
      selection = menu.menuOptions.length - 1;

    menu.selectIndex(selection);
    return true;
  };

  menu.down = function() {
    if (!menu.menuContainer.visible)
      return false;

    var selection = menu.currentSelection + 1;
    if (selection >= menu.menuOptions.length)
      selection = 0;

    menu.selectIndex(selection);
    return true;
  };

  menu.aButton = function() {
    if (!menu.menuContainer.visible)
      return false;

    menu.menuOptions[menu.currentSelection].click();
    return true;
  };

  menu.bButtonPress = function() {
    if (!menu.menuContainer.visible)
      return false;

    menu.bButton();
    return true;
  };

  menu.show = function() {
    menu.initialize();
    menu.menuContainer.visible = true;
    if (menu.onShow)
      menu.onShow();
  };

  menu.hide = function() {
    menu.menuContainer.visible = false;
    if (menu.onHide)
      menu.onHide();
  };

};

MainMenu.buttonDetectionPadding = 8;

MainMenu.checkButton = function(button) {
  if (button.text.visible && cursorPosition.x >= button.text.getBounds().x - MainMenu.buttonDetectionPadding && cursorPosition.x - button.text.getBounds().x <= button.text.getBounds().width + MainMenu.buttonDetectionPadding &&
    cursorPosition.y >= button.text.getBounds().y - MainMenu.buttonDetectionPadding && cursorPosition.y - button.text.getBounds().y <= button.text.getBounds().height + MainMenu.buttonDetectionPadding) {
    return true;
  }
  return false;
};

MainMenu.controllerStatus = {up:false,down:false,left:false,right:false,a:false,b:false};

MainMenu.updateGamepad = function() {
  var i;
  var clickedAlready = false;
  if (playerOneAxes[0] < -0.5 || playerOneButtonsPressed[14] || a) {
    if (!MainMenu.controllerStatus.left) {
      clickedAlready = Modal.leftOrRight();
      if (!clickedAlready)
        clickedAlready = Shipyard.left();
      if (!clickedAlready)
        clickedAlready = Loadout.left();
      if (!clickedAlready)
        clickedAlready = ArmsDealer.left();
    }
    MainMenu.controllerStatus.left = true;
  } else {
    MainMenu.controllerStatus.left = false;
  }

  if (playerOneAxes[0] > 0.5 || playerOneButtonsPressed[15] || d) {
    if (!MainMenu.controllerStatus.right) {
      clickedAlready = Modal.leftOrRight();
      if (!clickedAlready)
        clickedAlready = Shipyard.right();
      if (!clickedAlready)
          clickedAlready = Loadout.right();
      if (!clickedAlready)
          clickedAlready = ArmsDealer.right();
    }
    MainMenu.controllerStatus.right = true;
  } else {
    MainMenu.controllerStatus.right = false;
  }

  if (playerOneAxes[1] < -0.5 || playerOneButtonsPressed[12] || w) {
    if (!MainMenu.controllerStatus.up) {
      clickedAlready = false;
      clickedAlready = Loadout.up();
      if (!clickedAlready)
          clickedAlready = ArmsDealer.up();
      for (i=0; i<Menus.length;i++) {
        if (!clickedAlready)
          clickedAlready = Menus[i].up();
      }
    }
    MainMenu.controllerStatus.up = true;
  } else {
    MainMenu.controllerStatus.up = false;
  }

  if (playerOneAxes[1] > 0.5 || playerOneButtonsPressed[13] || s) {
    if (!MainMenu.controllerStatus.down) {
      clickedAlready = false;
      clickedAlready = Shipyard.down();
      if (!clickedAlready)
        clickedAlready = Loadout.down();
      if (!clickedAlready)
        clickedAlready = ArmsDealer.down();
      for (i=0; i< Menus.length;i++) {
        if (!clickedAlready)
          clickedAlready = Menus[i].down();
      }
    }
    MainMenu.controllerStatus.down = true;
  } else {
    MainMenu.controllerStatus.down = false;
  }

  if (playerOneButtonsPressed[0] || spaceBar || enter) {
    if (!MainMenu.controllerStatus.a) {
      clickedAlready = Modal.aButtonPress();

      if (!clickedAlready)
        clickedAlready = Shipyard.aButton();

      if (!clickedAlready)
        Loadout.aButton();

      if (!clickedAlready)
        ArmsDealer.aButtonPress();

      for (i=0; i<Menus.length;i++) {
        if (!clickedAlready)
          clickedAlready = Menus[i].aButton();
      }
    }
    MainMenu.controllerStatus.a = true;
  } else {
    MainMenu.controllerStatus.a = false;
  }

  if (playerOneButtonsPressed[1] || esc) {
    if (!MainMenu.controllerStatus.b) {
      clickedAlready = Modal.bButtonPress();

      if (!clickedAlready)
        clickedAlready = StarChart.bButtonPress();

      if (!clickedAlready)
        clickedAlready = Shipyard.bButtonPress();

      if (!clickedAlready)
        clickedAlready = Loadout.bButtonPress();

      if (!clickedAlready)
        clickedAlready = ArmsDealer.bButtonPress();

      if (!clickedAlready)
        clickedAlready = PilotSchool.bButtonPress();

      for (i=0; i<Menus.length;i++) {
        if (!clickedAlready)
          clickedAlready = Menus[i].bButtonPress();
      }
    }
    MainMenu.controllerStatus.b = true;
  } else {
    MainMenu.controllerStatus.b = false;
  }

  if (playerOneButtonsPressed[4] || q) {
    if (!MainMenu.controllerStatus.l1) {
      clickedAlready = false;
      clickedAlready = ArmsDealer.l1ButtonPress();
    }
    MainMenu.controllerStatus.l1 = true;
  } else {
    MainMenu.controllerStatus.l1 = false;
  }
  if (playerOneButtonsPressed[5] || ekey) {
    if (!MainMenu.controllerStatus.r1) {
      clickedAlready = false;
      clickedAlready = ArmsDealer.r1ButtonPress();
    }
    MainMenu.controllerStatus.r1 = true;
  } else {
    MainMenu.controllerStatus.r1 = false;
  }
};

var OtherMenus = [StarChart, Shipyard, Loadout, ArmsDealer, PilotSchool];

MainMenu.updateAll = function(timeDiff) {

  var creditChange = 0;

  if (!MainMenu.menuContainer.visible)
    creditChange = calculateIncomeSinceLastCheck(500);

  for (var i = 0; i < Menus.length; i ++) {
    if (Menus[i].menuContainer.visible) {
      if (Menus[i].update) {
        Menus[i].update(timeDiff);
      }
      MainMenu.updateCredits(Menus[i], creditChange);
    }
  }

  for (var k = 0; k < OtherMenus.length; k++) {
    if (OtherMenus[k].menuContainer.visible) {
      if (OtherMenus[k].update) {
        OtherMenus[k].update(timeDiff);
      }
      MainMenu.updateCredits(OtherMenus[k], creditChange);
    }
  }
};

MainMenu.updateCredits = function(menu, creditChange) {
  if (menu.showCurrentCredits && menu.currentCredits && creditChange > 0) {
    menu.currentCredits.text = formatMoney(gameModel.p1.credits) + " Credits";
  }
};

ResizeMenus = function() {
  StarChart.resize();
  Shipyard.resize();
  Loadout.resize();
  ArmsDealer.resize();
  PilotSchool.resize();
  for (var i=Menus.length-1; i>=0;i--) {
    Menus[i].resize();
  }
};

InitializeMenus = function() {
  for (var i=Menus.length-1; i>=0;i--) {
    InitializeMenu(Menus[i]);
  }
  StarChart.initialize();
  Shipyard.initialize();
  Loadout.initialize();
  ArmsDealer.initialize();
  PilotSchool.initialize();
  Modal.initialize();
};

CheckForMenuMouseOver = function() {

  var mouseOver = Modal.checkMouseOver();

  if (Modal.isHidden()) {
    if (!mouseOver)
      mouseOver = StarChart.checkMouseOver();

    if (!mouseOver)
      mouseOver = Shipyard.checkMouseOver();

    if (!mouseOver)
      mouseOver = Loadout.checkMouseOver();

    if (!mouseOver)
      mouseOver = ArmsDealer.checkMouseOver();

    if (!mouseOver)
      mouseOver = PilotSchool.checkMouseOver();


    for (var i=0; i<Menus.length;i++) {
      if (!mouseOver)
        mouseOver = Menus[i].checkMouseOver();
    }
  }

  if (mouseOver) {
    document.getElementById("the-body").classList.add("mouse-over");
  } else {
    document.getElementById("the-body").classList.remove("mouse-over");
  }
};

CheckForMenuClick = function() {
  var clickedAlready = Modal.checkClicks();


  if (Modal.isHidden()) {
    if (!clickedAlready && StarChart.checkClicks())
        clickedAlready = true;

    if (!clickedAlready && Shipyard.checkClicks())
        clickedAlready = true;

    if (!clickedAlready && Loadout.checkClicks())
        clickedAlready = true;

    if (!clickedAlready && ArmsDealer.checkClicks())
        clickedAlready = true;

    if (!clickedAlready && PilotSchool.checkClicks())
        clickedAlready = true;

    for (var i=0; i<Menus.length;i++) {
      if (!clickedAlready)
        clickedAlready = Menus[i].checkClicks();
    }
  }

};

Modal = {


  initialize : function() {
    this.dialogContainer = new PIXI.Container();

  	var background = new PIXI.Graphics();
  	background.beginFill(0x003030);
  	background.drawRect(renderer.width * 0.25, renderer.height * 0.2, renderer.width * 0.5, renderer.height * 0.6);
  	background.alpha = 0.99;
  	this.dialogContainer.addChild(background);

    this.dialogContents = new PIXI.Container();
    this.dialogContainer.addChild(this.dialogContents);

    this.dialogContainer.visible = false;

    this.okButton = {text:new PIXI.Text("Okay", {font: (22 * scalingFactor) + 'px Dosis',	fill: '#FFF',	stroke: "#000",	strokeThickness: 0,	align: 'left'}),value:"ok"};
    this.okButton.text.position = {x:renderer.width * 0.4 - this.okButton.text.width / 2, y:renderer.height * 0.7 - this.okButton.text.height / 2};
    this.okButton.text.tint = MainMenu.buttonTint;

    this.okButton.click = function() {
      if (Modal.okButton.onOk) {
        Modal.okButton.onOk();
      }
  		Modal.hide();
  	};


    this.buttonSelection = "ok";

    this.dialogContainer.addChild(this.okButton.text);

    this.cancelButton = {text:new PIXI.Text("Cancel", {font: (22 * scalingFactor) + 'px Dosis',	fill: '#FFF',	stroke: "#000",	strokeThickness: 0,	align: 'left'}),value:"cancel"};
    this.cancelButton.text.position = {x:renderer.width * 0.6 - this.okButton.text.width / 2, y:renderer.height * 0.7 - this.okButton.text.height / 2};
    this.cancelButton.text.tint = MainMenu.buttonTint;

    this.cancelButton.click = function() {
      if (Modal.cancelButton.onCancel) {
        Modal.cancelButton.onCancel();
      }
  		Modal.hide();
  	};

    this.dialogContainer.addChild(this.cancelButton.text);

    gameContainer.addChild(this.dialogContainer);
  },


  show : function(options) {
    if (options) {
      if (options.text) {
        var textMessage = new PIXI.Text(options.text, {font: (22 * scalingFactor) + 'px Dosis',	fill: '#FFF',	stroke: "#000",	strokeThickness: 0,	align: 'left'});
        textMessage.position = {x:renderer.width * 0.5 - textMessage.width / 2, y:renderer.height * 0.4 - textMessage.height / 2};
        textMessage.tint = MainMenu.buttonTint;
        this.dialogContents.addChild(textMessage);
      }
      if (options.container) {

        this.dialogContents.addChild(options.container);
      }
      if (options.ok) {
        this.okButton.onOk = options.ok;
      }
      if (options.cancel) {
        this.okButton.text.position = {x:renderer.width * 0.4 - this.okButton.text.width / 2, y:renderer.height * 0.7 - this.okButton.text.height / 2};
        this.cancelButton.text.position = {x:renderer.width * 0.6 - this.okButton.text.width / 2, y:renderer.height * 0.7 - this.okButton.text.height / 2};
        this.cancelButton.text.visible = true;
        this.cancelButton.onCancel = options.cancel;
        this.select(this.cancelButton);
      } else {
        this.okButton.text.position = {x:renderer.width * 0.5 - this.okButton.text.width / 2, y:renderer.height * 0.7 - this.okButton.text.height / 2};
        this.cancelButton.text.visible = false;
        this.select(this.okButton);
      }
    }
    this.dialogContainer.visible = true;
  },


  hide : function() {
    Modal.okButton.onOk = false;
    Modal.cancelButton.onCancel = false;
    Modal.dialogContainer.visible = false;
    Modal.dialogContents.children.forEach(function(child){
      Modal.dialogContents.removeChild(child);
    });
  },



  isHidden : function() {
    return !Modal.dialogContainer.visible;
  },


  isShown : function() {
    return !Modal.dialogContainer.visible;
  },


  select : function(button) {
    Modal.cancelButton.text.tint = Modal.okButton.text.tint = MainMenu.buttonTint;
    Modal.selectedButton = button;
    button.text.tint = MainMenu.selectedButtonTint;
  },


  checkMouseOver : function() {
    if (!this.dialogContainer || !this.dialogContainer.visible)
      return false;

    if (MainMenu.checkButton(Modal.okButton)) {
      Modal.select(Modal.okButton);
      return true;
    }

    if (MainMenu.checkButton(Modal.cancelButton)) {
      Modal.select(Modal.cancelButton);
      return true;
    }
    return false;
  },


  checkClicks : function() {
    if (!this.dialogContainer || !this.dialogContainer.visible)
      return false;

    if (MainMenu.checkButton(Modal.okButton)) {
      Modal.okButton.click();
      return true;
    }

    if (MainMenu.checkButton(Modal.cancelButton)) {
      Modal.cancelButton.click();
      return true;
    }

    return false;
  },


  bButtonPress : function() {
    if (!this.dialogContainer.visible)
      return false;

    if (Modal.cancelButton.text.visible) {
      Modal.cancelButton.click();
    } else {
      Modal.okButton.click();
    }
    return true;
  },


  aButtonPress : function() {
    if (!this.dialogContainer.visible)
      return false;

    Modal.selectedButton.click();
    return true;
  },


  leftOrRight : function() {
    if (!this.dialogContainer.visible)
      return false;

    if (Modal.selectedButton.value == "cancel") {
      Modal.select(Modal.okButton);
    } else {
      Modal.select(Modal.cancelButton);
    }
    return false;
  }

};
