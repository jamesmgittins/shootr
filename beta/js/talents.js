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
          name : "Made of Money",
          description : "5% chance to spawn credits when damaging an ememy",
          icon : "img/gold-bar.svg"
        },
        {
          name : "Spoils Of War",
          description : "Increases your chance to get super or above quality loot from crates by 20%",
          icon : "img/skull-trophy.svg"
        },
        {
          name : "Master Negotiator",
          description : "Any loot lost when you die will now be available\nfor purchase in the next Arms Dealer you visit",
          icon : "img/emerald.svg"
        }
      ]
    },
    {
      name : "PRIDE",
      bgColor : Constants.itemColors.super,
      talents : [
        {
          name: "Claw It Back",
          description : "Destroying an enemy restores 2% of your shield",
          icon : "img/battery-positive.svg"
        },
        {
          name : "Turn The Tables",
          description : "Collecting a crate restores 50% of your shield",
          icon : "img/energise.svg"
        },
        {
          name : "Last Chance",
          description : "Damage that would normally kill you\ninstead has a 25% chance to restore 50% of your shield",
          icon : "img/defibrilate.svg"
        },
        {
          name : "First Cut Is The Deepest",
          description : "After taking damage gain 30% additional damage reduction for 5 seconds",
          icon : "img/dripping-knife.svg"
        },
        {
          name : "I Am Rubber You Are Glue",
          description : "Any damage taken is also inflicted upon the next enemy you hit",
          icon : "img/splash.svg"
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
          description : "Increase rate of fire by 100% for 5 seconds after collecting a crate",
          icon : "img/implosion.svg"
        },
        {
          name : "Bullheaded",
          description : "Increase the damage done to enemies when you ram them by 700%",
          icon : "img/muscle-fat.svg"
        },
        {
          name : "Kill Streak",
          description : "Killing 5 enemies without being hit increases your damage\nby 75% for 5 seconds. The effect is lost if you take damage",
          icon : "img/daggers.svg"
        },
        {
          name : "Buds For Life",
          description : "Summons a small attack drone that fires a copy of your front weapon at 50% damage",
          icon : "img/gear-heart.svg"
        }
      ]
    }
  ],

  talentEquipped : function(talentName) {
    if (Talents.getGameModelTalents().greedTalent == talentName || Talents.getGameModelTalents().prideTalent == talentName || Talents.getGameModelTalents().wrathTalent == talentName || (gameModel.p1.ship && gameModel.p1.ship.talent == talentName))
      return true;

    return false;
  },


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
    Talents.dmgTaken = 0;
    if (Talents.talentEquipped("Magnetic")) {
      Buffs.newBuff("Magnetic", 10, "img/magnet.svg", Constants.itemColors.normal, true, true);
    }
    if (Talents.talentEquipped("Untouchable")) {
      Buffs.newBuff("Untouchable", 10, "img/aura.svg", Constants.itemColors.normal, true, true);
    }
    if (Talents.talentEquipped("Made of Money")) {
      Buffs.newBuff("Made of Money", 10, "img/gold-bar.svg", Constants.itemColors.normal, true, true);
    }
    if (Talents.talentEquipped("Master Negotiator")) {
      Buffs.newBuff("Master Negotiator", 10, "img/emerald.svg", Constants.itemColors.hyper, true, true);
    }
    if (Talents.talentEquipped("Spoils Of War")) {
      Buffs.newBuff("Spoils Of War", 10, "img/skull-trophy.svg", Constants.itemColors.hyper, true, true);
    }
    if (Talents.talentEquipped("Bullheaded")) {
      Buffs.newBuff("Bullheaded", 10, "img/muscle-fat.svg", Constants.itemColors.hyper, true, true);
    }
    if (Talents.talentEquipped("Buds For Life")) {
      Buffs.newBuff("Buds For Life", 10, "img/gear-heart.svg", Constants.itemColors.hyper, true, true);
    }
  },

  attackDrone : function() {
    return Talents.talentEquipped("Buds For Life");
  },

  combatCredits : function(credits) {
    if (Buffs.isBuffActive("Untouchable")) {
      return Talents.passiveCredits(credits * 1.2);
    }
    return Talents.passiveCredits(credits);
  },


  rarityModifier : function() {
    if (Talents.talentEquipped("Spoils Of War")) {
      return 0.8;
    }
    return 1;
  },


  passiveCredits : function(credits) {
    return credits * (1 + Talents.getGameModelTalents().greedPoints * 0.05);
  },


  ramDamage : function() {
    if (Buffs.isBuffActive("Bullheaded")) {
      return 7;
    }
    return 1;
  },


  passiveDmgReduction : function() {
    var additional = 0;
    if (Buffs.isBuffActive("First Cut Is The Deepest")) {
      additional = 30;
    }
    return Talents.getGameModelTalents().pridePoints * 5 + additional;
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
    if (Talents.talentEquipped("Claw It Back")  && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
      Buffs.newBuff("Claw It Back", 1, "img/battery-positive.svg", Constants.itemColors.super, false, true);
      PlayerShip.restoreShieldPercent(0.02);
    }
    if (Talents.talentEquipped("Kill Streak")) {
      Talents.killCounter++;
      if (Talents.killCounter === 5) {
        Buffs.newBuff("Kill Streak", 5, "img/daggers.svg", Constants.itemColors.hyper, false, false);
      }
      if (Talents.killCounter > 5) {
        Buffs.newBuff("Kill Streak", 5, "img/daggers.svg", Constants.itemColors.hyper, false, true);
      }
    }
  },

  madeOfMoneyLastSpawn : 0,

  enemyDamaged : function(amount, xLoc, yLoc) {
    if (Buffs.isBuffActive("I Am Rubber You Are Glue")) {
      Buffs.removeBuff("I Am Rubber You Are Glue");
      amount += Talents.dmgTaken;
      Talents.dmgTaken = 0;
    }
    if (Buffs.isBuffActive("Made of Money") && Talents.madeOfMoneyLastSpawn < updateTime - 500 && Math.random() < 0.05) {
      MoneyPickup.newMoneyPickup(xLoc, yLoc, amount * 5);
      Talents.madeOfMoneyLastSpawn = updateTime;
    }
    return amount;
  },


  crateCollected : function() {
    if (Talents.talentEquipped("Turn The Tables") && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
      Buffs.newBuff("Turn The Tables", 1, "img/energise.svg", Constants.itemColors.super, false, false);
      PlayerShip.restoreShieldPercent(0.5);
    }
    if (Talents.talentEquipped("Frenzy")) {
      Buffs.newBuff("Frenzy", 5, "img/implosion.svg", Constants.itemColors.hyper, false);
    }
  },


  playerDamaged : function(amount) {
    if (Talents.talentEquipped("Untouchable") && PlayerShip.playerShip.currShield < PlayerShip.playerShip.maxShield) {
      Buffs.removeBuff("Untouchable");
    }
    if (Talents.talentEquipped("Retaliation")) {
      Buffs.newBuff("Retaliation", 3, "img/spinning-sword.svg", Constants.itemColors.hyper, false);
    }
    if (Talents.talentEquipped("Kill Streak")) {
      Talents.killCounter = 0;
      Buffs.removeBuff("Kill Streak");
    }
    if (Talents.talentEquipped("Last Chance") && PlayerShip.playerShip.currShield <= 0) {
      if (Math.random() < 0.25) {
        PlayerShip.restoreShieldPercent(0.5);
        Buffs.newBuff("Last Chance", 2, "img/defibrilate.svg", Constants.itemColors.super, false);
      }
    }
    if (Talents.talentEquipped("First Cut is the Deepest")) {
      Buffs.newBuff("First Cut Is The Deepest", 5, "img/dripping-knife.svg", Constants.itemColors.super, false, false);
    }
    if (Talents.talentEquipped("I am rubber you are glue")) {
      Talents.dmgTaken += amount;
      Buffs.newBuff("I Am Rubber You Are Glue", 2, "img/splash.svg", Constants.itemColors.super, true, true);
    }
  },


  shieldRestored : function() {
    if (Talents.talentEquipped("Untouchable") && PlayerShip.playerShip.currShield >= PlayerShip.playerShip.maxShield) {
      Buffs.newBuff("Untouchable", 10, "img/aura.svg", Constants.itemColors.normal, true);
    }
  }
};
