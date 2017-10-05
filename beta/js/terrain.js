function TerrainGenerator(detail) {
  this.size = Math.pow(2, detail) + 1;
  this.max = this.size - 1;
  this.map = new Float32Array(this.size * this.size);
}

TerrainGenerator.prototype.get = function(x, y) {
  if (x < 0 || x > this.max || y < 0 || y > this.max) return -1;
  return this.map[x + this.size * y];
};

TerrainGenerator.prototype.set = function(x, y, val) {
  this.map[x + this.size * y] = val;
};

TerrainGenerator.prototype.generate = function(roughness) {
  var self = this;

  this.set(0, 0, self.max);
  this.set(this.max, 0, self.max / 2);
  this.set(this.max, this.max, 0);
  this.set(0, this.max, self.max / 2);

  divide(this.max);

  function divide(size) {
    var x, y, half = size / 2;
    var scale = roughness * size;
    if (half < 1) return;

    for (y = half; y < self.max; y += size) {
      for (x = half; x < self.max; x += size) {
        square(x, y, half, Math.random() * scale * 2 - scale);
      }
    }
    for (y = 0; y <= self.max; y += half) {
      for (x = (y + half) % size; x <= self.max; x += size) {
        diamond(x, y, half, Math.random() * scale * 2 - scale);
      }
    }
    divide(size / 2);
  }

  function average(values) {
    var valid = values.filter(function(val) { return val !== -1; });
    var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
    return total / valid.length;
  }

  function square(x, y, size, offset) {
    var ave = average([
      self.get(x - size, y - size),   // upper left
      self.get(x + size, y - size),   // upper right
      self.get(x + size, y + size),   // lower right
      self.get(x - size, y + size)    // lower left
    ]);
    self.set(x, y, ave + offset);
  }

  function diamond(x, y, size, offset) {
    var ave = average([
      self.get(x, y - size),      // top
      self.get(x + size, y),      // right
      self.get(x, y + size),      // bottom
      self.get(x - size, y)       // left
    ]);
    self.set(x, y, ave + offset);
  }
};

var Terrain = {
  speed:50,
  ySpacing:32,
  points:32,
  discardedShapes:[],
  shapes:[],
  currentIndex :0,
  offset:0,
  newShape:function(yLoc) {
    var shape;
    if (Terrain.discardedShapes.length > 0) {
      shape = Terrain.discardedShapes.pop();
    } else {
      shape = new PIXI.Graphics();
      Terrain.container.addChild(shape);
      Terrain.shapes.push(shape);
    }
    shape.visible = true;
    shape.yLoc = yLoc;
    shape.spawnedNextGuy = false;
    shape.heightMap = Terrain.terrainGenerator.map.slice((Terrain.currentIndex * Terrain.terrainGenerator.size) + Terrain.offset,(Terrain.currentIndex * Terrain.terrainGenerator.size ) + Terrain.offset + Terrain.points + 1);
    Terrain.currentIndex = Terrain.currentIndex + 1 < Terrain.terrainGenerator.size ? Terrain.currentIndex + 1 : 0;
  },
  drawShape:function(shape) {
    shape.clear();

    var midPoint = canvasHeight / 2;
    var heightMultiplier = (((shape.yLoc - midPoint) / midPoint) / Terrain.terrainGenerator.max) * scalingFactor * Terrain.ySpacing * 5;
    var xLoc = 0;

    for (var i=0; i< shape.heightMap.length - 1;i++) {
      var hexVal = 100 * shape.heightMap[i] / Terrain.terrainGenerator.max;
      shape.lineStyle(Math.round(1 * scalingFactor), rgbToHex(hexVal,hexVal,hexVal));

      var yPos = shape.yLoc * scalingFactor + (shape.heightMap[i] * heightMultiplier);
      shape.moveTo(xLoc * scalingFactor, yPos);

      xLoc += Terrain.xSpacing;
      yPos = shape.yLoc * scalingFactor + (shape.heightMap[i+1] * heightMultiplier);
      shape.lineTo(xLoc * scalingFactor, yPos);
    }
  },
  initialize:function() {

    Terrain.container = new PIXI.Container();
    backgroundContainer.addChild(Terrain.container);
    Terrain.terrainGenerator = new TerrainGenerator(9);
    Terrain.terrainGenerator.generate(1);
    Terrain.currentIndex = 0;
    Terrain.offset = Math.round(Math.random() * (Terrain.terrainGenerator.size / 2));
    Terrain.xSpacing = canvasHeight / Terrain.points;

    for (var i = canvasHeight; i > 0; i -= Terrain.ySpacing) {
      Terrain.newShape(i);
    }

  },
  show:function() {
    if (Terrain.container)
      Terrain.container.visible = true;
  },
  hide:function() {
    if (Terrain.container)
      Terrain.container.visible = false;
  },
  update:function(timeDiff) {
    if (Terrain.container.visible) {
      var needNewShape = false;
      var cutoffPoint = canvasHeight * 1.5;
      Terrain.shapes.forEach(function(shape){
        if (shape.visible) {
          if (shape.yLoc > canvasHeight && !shape.spawnedNextGuy) {
            shape.spawnedNextGuy = true;
            needNewShape = true;
          }
          if (shape.yLoc < cutoffPoint) {
            shape.yLoc += Terrain.speed * timeDiff;
            Terrain.drawShape(shape);
          } else {
            shape.visible=false;
            Terrain.discardedShapes.push(shape);
          }
        }
      });
      if (needNewShape)
        Terrain.newShape(0);
    }
  },
};
