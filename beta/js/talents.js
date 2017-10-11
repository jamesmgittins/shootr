Talents = {
  killCounter : 0,
  talentTrees : [
    {
      name : "GREED",
      bgColor : Constants.itemColors.normal,
      talents : [
        {
          name : "Magnetic",
          description : "Increase the attract range of items by 200%",
          icon : "img/magnet.svg"
        },
        {
          name : "Untouchable",
          description : "20% extra credits earned during combat while your shield is full",
          icon : "img/aura.svg"
        },
        {
          name : "Dummy",
          description : "This talent has not been written yet",
          icon : "img/barbed-arrow.svg"
        },
        {
          name : "Dummy",
          description : "This talent has not been written yet",
          icon : "img/barbed-arrow.svg"
        },
        {
          name : "Dummy",
          description : "This talent has not been written yet",
          icon : "img/barbed-arrow.svg"
        }
      ]
    },
    {
      name : "PRIDE",
      bgColor : Constants.itemColors.super,
      talents : [
        {
          name: "Claw it Back",
          description : "Destroying an enemy restores 2% of your shield",
          icon : "img/battery-positive.svg"
        },
        {
          name : "Tables Turned",
          description : "Collecting a crate restores 50% of your shield",
          icon : "img/energise.svg"
        },
        {
          name : "Last Chance",
          description : "Damage that would normally kill you has a 25% chance to restore 50% of your shield",
          icon : "img/defibrilate.svg"
        },
        {
          name : "Dummy",
          description : "This talent has not been written yet",
          icon : "img/barbed-arrow.svg"
        },
        {
          name : "Dummy",
          description : "This talent has not been written yet",
          icon : "img/barbed-arrow.svg"
        }
      ]
    },
    {
      name : "WRATH",
      bgColor : Constants.itemColors.hyper,
      talents : [
        {
          name : "Retaliation",
          description : "Increased damage by 50% for 3 seconds after being hit",
          icon : "img/spinning-sword.svg"
        },
        {
          name : "Frenzy",
          description : "Increase rate of fire by 100% whenever your shield is below 30%",
          icon : "img/implosion.svg"
        },
        {
          name : "Bullheaded",
          description : "Increase the damage done to enemies when you ram them by 500%",
          icon : "img/muscle-fat.svg"
        },
        {
          name : "Kill Streak",
          description : "Killing 5 enemies without being hit increases your damage\nby 75% for 5 seconds. The effect is lost if you take damage",
          icon : "img/daggers.svg"
        },
        {
          name : "Buds for Life",
          description : "Summons a small attack drone that fires a copy of your front weapon at 50% damage",
          icon : "img/gear-heart.svg"
        }
      ]
    }
  ],


  pointsAvailable : function() {
    var pointsSpent = Talents.getGameModelTalents().greedPoints + Talents.getGameModelTalents().pridePoints + Talents.getGameModelTalents().wrathPoints;
    return gameModel.bossesDefeated - pointsSpent;
  },


  getGameModelTalents : function() {
    if (!gameModel.talents) {
      gameModel.talents = {
        greedTalent : undefined,
        greedPoints : 0,
        prideTalent : undefined,
        pridePoints : 0,
        wrathTalent : undefined,
        wrathPoints : 0
      };
    }
    return gameModel.talents;
  },


  startGame : function () {
    Talents.killCounter = 0;
    if (Talents.getGameModelTalents().greedTalent == "Magnetic") {
      Buffs.newBuff("Magnetic", 10, "img/magnet.svg", Constants.itemColors.normal, true, true);
    }
    if (Talents.getGameModelTalents().greedTalent == "Untouchable") {
      Buffs.newBuff("Untouchable", 10, "img/aura.svg", Constants.itemColors.normal, true, true);
    }
    if (Talents.getGameModelTalents().wrathTalent == "Bullheaded") {
      Buffs.newBuff("Bullheaded", 10, "img/muscle-fat.svg", Constants.itemColors.hyper, true, true);
    }
    if (Talents.getGameModelTalents().wrathTalent == "Buds for Life") {
      Buffs.newBuff("Buds for Life", 10, "img/gear-heart.svg", Constants.itemColors.hyper, true, true);
    }
  },

  attackDrone : function() {
    return Talents.getGameModelTalents().wrathTalent == "Buds for Life";
  },

  combatCredits : function(credits) {
    if (Buffs.isBuffActive("Untouchable")) {
      return Talents.passiveCredits(credits * 1.2);
    }
    return Talents.passiveCredits(credits);
  },


  passiveCredits : function(credits) {
    return credits * (1 + Talents.getGameModelTalents().greedPoints * 0.05);
  },


  ramDamage : function() {
    if (Buffs.isBuffActive("Bullheaded")) {
      return 5;
    }
    return 1;
  },


  passiveDmgReduction : function() {
    return Talents.getGameModelTalents().pridePoints * 0.05;
  },


  passiveCritDamage : function() {
    return Talents.getGameModelTalents().wrathPoints * 0.1;
  },


  damageIncrease : function() {
    if (Buffs.isBuffActive("Retaliation")) {
      return 50;
    }
    if (Buffs.isBuffActive("Kill Streak")) {
      return 75;
    }
    return 0;
  },


  fireRateModifier : function() {
    if (Buffs.isBuffActive("Frenzy")) {
      return 2;
    }
    return 1;
  },


  enemyDestroyed : function() {
    if (Talents.getGameModelTalents().prideTalent == "Claw it Back"  && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
      Buffs.newBuff("Claw it Back", 1, "img/battery-positive.svg", Constants.itemColors.super, false, true);
      PlayerShip.restoreShieldPercent(0.02);
    }
    if (Talents.getGameModelTalents().wrathTalent == "Kill Streak") {
      Talents.killCounter++;
      if (Talents.killCounter === 5) {
        Buffs.newBuff("Kill Streak", 5, "img/daggers.svg", Constants.itemColors.hyper, false, false);
      }
      if (Talents.killCounter > 5) {
        Buffs.newBuff("Kill Streak", 5, "img/daggers.svg", Constants.itemColors.hyper, false, true);
      }
    }
  },


  crateCollected : function() {
    if (Talents.getGameModelTalents().prideTalent == "Tables Turned" && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
      Buffs.newBuff("Tables Turned", 1, "img/energise.svg", Constants.itemColors.super, false, false);
      PlayerShip.restoreShieldPercent(0.5);
    }
  },


  playerDamaged : function() {
    if (Talents.getGameModelTalents().greedTalent == "Untouchable" && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
      Buffs.removeBuff("Untouchable");
    }
    if (Talents.getGameModelTalents().wrathTalent == "Retaliation") {
      Buffs.newBuff("Retaliation", 3, "img/spinning-sword.svg", Constants.itemColors.hyper, false);
    }
    if (Talents.getGameModelTalents().wrathTalent == "Frenzy" && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield * 0.3) {
      Buffs.newBuff("Frenzy", 3, "img/implosion.svg", Constants.itemColors.hyper, true);
    }
    if (Talents.getGameModelTalents().wrathTalent == "Kill Streak") {
      Talents.killCounter = 0;
      Buffs.removeBuff("Kill Streak");
    }
    if (Talents.getGameModelTalents().prideTalent == "Last Chance" && PlayerShip.playerShip.currShield <= 0) {
      if (Math.random() < 0.25) {
        PlayerShip.restoreShieldPercent(0.5);
        Buffs.newBuff("Last Chance", 2, "img/defibrilate.svg", Constants.itemColors.super, false);
      }
    }
  },


  shieldRestored : function() {
    if (Talents.getGameModelTalents().greedTalent == "Untouchable" && PlayerShip.playerShip.currShield >= PlayerShip.playerShip.maxShield) {
      Buffs.newBuff("Untouchable", 10, "img/aura.svg", Constants.itemColors.normal, true);
    }
    if (Talents.getGameModelTalents().wrathTalent == "Frenzy" && PlayerShip.playerShip.currShield > PlayerShip.playerShip.maxShield * 0.3) {
      Buffs.removeBuff("Frenzy");
    }
  }
};
