var Sounds = {
  randomNumbers : [],
  randomCount : 0,
  getNextRandom :  function() {
    this.randomCount++;
    if (this.randomCount >= this.randomNumbers.length) {
      this.randomCount=0;
    }
    return this.randomNumbers[this.randomCount];
  }
};

for (var i =0; i < 256; i++) {
  Sounds.randomNumbers.push(Math.random());
}



var createMusicBank = function(audiofiles, volume) {
  var soundBank = {
    sounds : [],
    soundCount:0,
    volume: volume,
    play:function(){
      if (gameModel.music) {
        this.sounds[this.soundCount].play();
        this.sounds[this.soundCount].volume(this.volume);
      }
    },
    pause:function() {
      if (gameModel.music) {
        this.sounds[this.soundCount].pause();
      }
    },
    reset: function() {
      if (gameModel.music) {
        this.sounds[this.soundCount].stop();
        this.soundCount++;
        if (this.soundCount >= this.sounds.length)
          this.soundCount=0;
      }
    },
    fadeOut : function(time) {
      this.sounds[this.soundCount].fade(this.volume, 0, time || 1000);
    }
  };

  for (var i=0; i<audiofiles.length;i++) {
    soundBank.sounds[i] = new Howl({src:audiofiles[i], loop:true});
  }

  return soundBank;
};


var createHowlBank = function(audiofile, volume, maxFreq, randomness) {
  var soundBank = {
    sound : new Howl({src: [audiofile], volume:volume}),
    lastPlayed :0,
    randomisation : randomness || 0,
    maxFreq : maxFreq || 100,

    play:function(x,y){

      var updateTime = new Date().getTime();

      if (this.lastPlayed + this.maxFreq < updateTime) {

        this.lastPlayed = updateTime;
        var soundId = this.sound.play();

        if (this.randomisation > 0)
          this.sound.rate(1 - this.randomisation + Sounds.getNextRandom() * 2 * this.randomisation, soundId);

        if (typeof y === 'number') {
          this.sound.pos(x, y, 0, soundId);
        } else {
          if (x)
            this.sound.stereo((x - canvasWidth / 2) / canvasWidth / 2, soundId);
        }

        return soundId;
      }
      return false;
    },
    pause : function() {
      this.sound.pause();
    },
    stop : function(id) {
      this.sound.stop(id);
    },
    updatePosition : function(x,y,id) {
      if (id) {
        this.sound.pos(x, y, 0, id);
      }
    }
  };

  return soundBank;
};

Sounds.powerup = createHowlBank("sounds/18_ITEM.wav", 1, 50, 0);
Sounds.blip1 = createHowlBank("sounds/Blip_Select9.wav", 0.3, 85, 0.01);
Sounds.blip2 = createHowlBank("sounds/Blip_Select8.wav", 0.5, 50, 0.01);
Sounds.shipExplosion = createHowlBank('sounds/11_EXPRETAP.wav', 0.5, 70, 0.3);
Sounds.enemyShot = createHowlBank("sounds/03_TEMP10.wav", 0.7, 50, 0.2);
Sounds.damage = createHowlBank("sounds/08_EXP1RT.wav", 0.6, 75, 0.2);
Sounds.enemyDamage = createHowlBank("sounds/08_EXP1RT.wav", 0.5, 90, 0.05);
Sounds.playerBullets = createHowlBank("sounds/25_SCALEDN1.wav",0.3, 85, 0.02);
Sounds.playerLaser = createHowlBank("sounds/15_LAZGUN2.wav",0.3, 100, 0);
Sounds.playerMissile = createHowlBank("sounds/07_BYPASS1.wav", 0.3, 500, 0);
Sounds.dodge = createHowlBank("sounds/05_PASS3.wav", 0.7, 50, 0.2);
Sounds.winChimes = createHowlBank("sounds/winchimes.wav", 0.3, 100, 0);
Sounds.music = createMusicBank(["music/music4.mp3","music/music3.mp3","music/music2.mp3"],0.7);
Sounds.mapMusic = createMusicBank(["music/mapmusic.mp3"],0.3);
