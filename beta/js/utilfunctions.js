function magnitude(x,y) {
	return Math.sqrt(x * x + y * y);
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function distanceBetweenPixiPoints(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

function rgbToHex(r,g,b) {
	return b | (g << 8) | (r << 16);
}

function calculateTintOld(damageFactor) {
	return (255 * damageFactor) | ((255 * damageFactor) << 8) | (255 << 16);
}

function calculateTint(damageFactor) {
	return (255 - (255 * (1 - damageFactor) * tintPercent)) | ((255 - (255 * (1 - damageFactor) * tintPercent)) << 8) | (255 << 16);
}

function calculateTintFromString(value) {
	return parseInt(value.replace('#','0x'));
}

function RotateVector2d(x, y, radians) {
    return {
        x: x * Math.cos(radians) - y * Math.sin(radians),
        y: x * Math.sin(radians) + y * Math.cos(radians)
    };
}

function dotProduct2d(x1, y1, x2, y2) {
	var mag1 = magnitude(x1, y1);
	var mag2 = magnitude(x2, y2);
	return x1 / mag1 * x2 / mag2 + y1 / mag1 * y2 / mag2;
}

function AngleVector2d(x1, y1, x2, y2) {
	return Math.acos(dotProduct2d(x1, y1, x2, y2));
}

// convert HEX color to RGB
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorTransition(startColor, endColor, percentage) {
	var startRgb = hexToRgb(startColor);
	var endRgb = hexToRgb(endColor);
	percentage = Math.max(0,Math.min(1,percentage));
	return rgbToHex(
		startRgb.r + (endRgb.r - startRgb.r) * percentage,
		startRgb.g + (endRgb.g - startRgb.g) * percentage,
		startRgb.b + (endRgb.b - startRgb.b) * percentage
	);
}

var lastX, lastY;

function drawline(shipctx, strokeStyle, startX, startY, endX, endY) {
    shipctx.beginPath();
    shipctx.strokeStyle = strokeStyle;
    shipctx.moveTo(startX, startY);
    shipctx.lineTo(endX, endY);
    shipctx.stroke();
    lastX = endX;
    lastY = endY;
}

(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

function formatMoney(input) {
	if (!input) input = 0;
	if (input >= 1000000000000)
		return (Math.round(input / 10000000000) / 100).toString() + 'T';
	if (input >= 1000000000)
		return (Math.round(input / 10000000)/100).toString() + 'B';
	if (input >= 1000000)
		return (Math.round(input / 10000)/100).toString() + 'M';
	if (input >= 1000)
		return (Math.round(input / 10)/100).toString() + 'K';

	return (input).toFixed(2);
}


SpritePool = {
  create : function(texture, container) {
    var spriteContainer = new PIXI.Container();
    container.addChild(spriteContainer);
    return {
      sprites : [],
      discardedSprites : [],
      container : spriteContainer,
      texture: texture,
      nextSprite : function() {
        if (this.discardedSprites.length > 0) {
          return this.discardedSprites.pop();
        } else {
          var sprite = new PIXI.Sprite(this.texture);
          sprite.anchor = {x:0.5,y:0.5};
          this.sprites.push(sprite);
          this.container.addChild(sprite);
          return sprite;
        }
      },
      discardSprite : function(sprite) {
				sprite.visible = false;
        this.discardedSprites.push(sprite);
      },
			discardAll : function() {
				this.discardedSprites = this.sprites.slice();
				for (var i = 0; i < this.sprites.length; i++) {
					this.sprites[i].visible = false;
				}
			},
			changeTexture : function(texture) {
				this.texture = texture;
				for (var i = 0; i < this.sprites.length; i++) {
					this.sprites[i].texture = texture;
					sprite.anchor = {x:0.5,y:0.5};
				}
			}
    };
  }
};

var blurFilters;

function glowTexture(texture, options) {

	if (!blurFilters) {
		blurFilters = [new PIXI.filters.BlurFilter()];
		blurFilters[0].blur = Math.round(scalingFactor *  2);
	}

	// defaultSize = true;
	var resize = options && options.resize ? options.resize : 1;
	var width = texture.width * resize;
	var height = texture.height * resize;

	var glowTexture = PIXI.RenderTexture.create(width * 2, height * 2);

	var blurredSprite = new PIXI.Sprite(texture);
	var normalSprite = new PIXI.Sprite(texture);
	normalSprite.scale = blurredSprite.scale = {x:resize, y:resize};
	normalSprite.anchor = blurredSprite.anchor = {x:0.5, y:0.5};
	normalSprite.position = blurredSprite.position = {x:width, y:height};

	var container = new PIXI.Container();

	// only add blur effect for higher resolutions
	if (renderer.height > 900) {
		blurredSprite.filters = blurFilters;
		blurredSprite.alpha = options && options.blurAmount ? options.blurAmount : 1;
		container.addChild(blurredSprite);
	}


	container.addChild(normalSprite);
	renderer.render(container, glowTexture);

	return glowTexture;
}

function recursiveApplyToChildren(container, apply) {
	apply(container);
	if (container.children.length > 0) {
		for (var i = 0; i < container.children.length; i++) {
			recursiveApplyToChildren(container.children[i], apply);
		}
	}
}

function removeAllFromContainer(container) {
	for (var i = container.children.length - 1; i >= 0; i--) {
		container.removeChild(container.children[i]);
		//item.destroy();
	}
}
