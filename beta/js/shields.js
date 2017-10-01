Shields = {
  types : {
    energy : 1,
    barrier : 2
  }
};

Shields.getIconSvg =  function(item) {
  if (item.shieldType == Shields.types.energy)
    return "img/shield.svg";
  if (item.shieldType == Shields.types.barrier)
    return "img/eye-shield.svg";

  return "img/shield.svg";
};

Shields.generateShield = function(level, seed, ultra, rarity) {

  var weaponRarity = Weapons.rarity[0];

  for (var i=0; i<Weapons.rarity.length; i++) {
    if (ultra && Math.random() < Weapons.rarity[i].chance) {
      weaponRarity = Weapons.rarity[i];
    }
  }

  weaponRarity = rarity || weaponRarity;

  var shieldGenFunctions = [
    Shields.generateEnergyShieldItem,
    Shields.generateBarrierShieldItem,
    Shields.generateEnergyShieldItem
  ];

  return shieldGenFunctions[Math.floor(Math.random() * shieldGenFunctions.length)](level, seed, weaponRarity);

	return Shields.generateShieldItem(level, seed, weaponRarity);

};


Shields.generateEnergyShieldItem = function(level, seed, rarity) {


	var levelMod = Math.pow(Constants.shieldLevelScaling, level - 1);
	Math.seedrandom(seed);
	var capacity = (level * 11 + (Math.random() * level * 3)) * levelMod * rarity.factor;
	var chargePerSecond = (level * 3 + Math.random() * 2) * levelMod * rarity.factor;
	var chargeDelay = 3 + Math.random() * 2;
	return {
		type: "shield",
		super:rarity.super,
		ultra:rarity.ultra,
		hyper:rarity.hyper,
		ultraName:"Immovable Object",
		ultraText:"10% Chance for enemy bullets to reflect",
		name: rarity.prefix + "Energy Shield",
		seed: seed,
		level: level,
		capacity: capacity,
		chargePerSecond: chargePerSecond,
		chargeDelay: chargeDelay,
		price: Math.round((capacity + chargePerSecond) * 17 * (5 / chargeDelay)),
		id: gameModel.weaponIdCounter++,
    shieldType : Shields.types.energy
	};
};

Shields.generateBarrierShieldItem = function(level, seed, rarity) {


	var levelMod = Math.pow(Constants.shieldLevelScaling, level - 1);
	Math.seedrandom(seed);
	var capacity = (level * 18 + (Math.random() * level * 3)) * levelMod * rarity.factor;
	var chargePerSecond = (level * 0.6 + Math.random() * 0.3) * levelMod * rarity.factor;
	var chargeDelay = 0.5;
	return {
		type: "shield",
		super:rarity.super,
		ultra:rarity.ultra,
		hyper:rarity.hyper,
		ultraName:"The Tortoise",
		ultraText:"Shield will recharge at double rate when below 50%",
		name: rarity.prefix + "Nanotech Barrier",
		seed: seed,
		level: level,
		capacity: capacity,
		chargePerSecond: chargePerSecond,
		chargeDelay: chargeDelay,
		price: Math.round((capacity + chargePerSecond) * 17),
		id: gameModel.weaponIdCounter++,
    shieldType : Shields.types.barrier
	};
};
