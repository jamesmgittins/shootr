
// Util functions not game specific
function magnitude(x,y) {
	return Math.sqrt(x * x + y * y);
}

function isPointInsideRectangle(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
	return pointX > rectX - rectWidth / 2 && pointX < rectX + rectWidth / 2 && pointY > rectY - rectHeight / 2 && pointY < rectY + rectHeight / 2;
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

function drawline(shipctx, strokeStyle, startX, startY, endX, endY) {
    shipctx.beginPath();
    shipctx.strokeStyle = strokeStyle;
    shipctx.moveTo(startX, startY);
    shipctx.lineTo(endX, endY);
    shipctx.stroke();
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
            var currTime = Date.now();
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
	if (input >= 1000000000000000000000000000000000)
		return (Math.round(input / 10000000000000000000000000000000) / 100).toFixed(2) + 'De';
	if (input >= 1000000000000000000000000000000)
		return (Math.round(input / 10000000000000000000000000000) / 100).toFixed(2) + 'No';
	if (input >= 1000000000000000000000000000)
		return (Math.round(input / 10000000000000000000000000) / 100).toFixed(2) + ' Oc';
	if (input >= 1000000000000000000000000)
		return (Math.round(input / 10000000000000000000000) / 100).toFixed(2) + 'Sp';
	if (input >= 1000000000000000000000)
		return (Math.round(input / 10000000000000000000) / 100).toFixed(2) + 'Sx';
	if (input >= 1000000000000000000)
		return (Math.round(input / 10000000000000000) / 100).toFixed(2) + 'Qi';
	if (input >= 1000000000000000)
		return (Math.round(input / 10000000000000) / 100).toFixed(2) + 'Q';
	if (input >= 1000000000000)
		return (Math.round(input / 10000000000) / 100).toFixed(2) + 'T';
	if (input >= 1000000000)
		return (Math.round(input / 10000000)/100).toFixed(2) + 'B';
	if (input >= 1000000)
		return (Math.round(input / 10000)/100).toFixed(2) + 'M';
	if (input >= 1000)
		return (Math.round(input / 10)/100).toFixed(2) + 'K';

	return (input).toFixed(2);
}

var blurFilters = false;

var normalSprite;
var blurredSprite;
var bigBlurSprite;
var blurContainer;

function glowTexture(texture, options) {

	var resize = options && options.resize ? options.resize : 1;
	var width = texture.width * resize;
	var height = texture.height * resize;

	var glowTexture = PIXI.RenderTexture.create(width * 2, height * 2);

	if (!normalSprite)
		normalSprite = new PIXI.Sprite(texture);
	else
		normalSprite.texture = texture;

	normalSprite.scale = {x:resize, y:resize};
	normalSprite.anchor = {x:0.5, y:0.5};
	normalSprite.position = {x:width, y:height};

	var blurTexture = PIXI.RenderTexture.create(width * 2, height * 2);
	if (!blurredSprite)
		blurredSprite = new PIXI.Sprite(texture);
	else
		blurredSprite.texture = texture;

	blurredSprite.scale = {x:resize, y:resize};
	blurredSprite.anchor = {x:0.5, y:0.5};
	blurredSprite.position = {x:width, y:height};

	renderer.render(blurredSprite, blurTexture);

	if (!bigBlurSprite)
		bigBlurSprite = new PIXI.Sprite(blurTexture);
	else
		bigBlurSprite.texture = blurTexture;

	if (!blurFilters)
		blurFilters = [new PIXI.filters.BlurFilter()];

	blurFilters[0].blur = Math.round(gameModel.resolutionFactor * 5);
	bigBlurSprite.filters = blurFilters;
	bigBlurSprite.alpha = options && options.blurAmount ? options.blurAmount : 1;

	if (!blurContainer) {
		blurContainer = new PIXI.Container();
		blurContainer.addChild(bigBlurSprite);
		blurContainer.addChild(normalSprite);
	}

	renderer.render(blurContainer, glowTexture);

	texture.destroy(!options || !options.dontDestroyOriginal);
	if (blurTexture)
		blurTexture.destroy(true);

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


function skewImage(image) {
	var canvas = document.createElement('canvas');
	var width = image.width,
  height = image.height;

	canvas.width = width * 1;
	canvas.height = height * 1.5;
  var context = canvas.getContext("2d");
  for (var i = 0; i <= height / 2; ++i) {
    context.setTransform(1, -0.4 * i / height, 0, 1, 0, 60);
    context.drawImage(image, 0, height / 2 - i, width, 2, 0, height / 2 - i, width, 2);
    context.setTransform(1, 0.4 * i / height, 0, 1, 0, 60);
		context.drawImage(image, 0, height / 2 + i, width, 2, 0, height / 2 + i, width, 2);
  }
	return canvas;
}

function getText(text, size, options) {

	var aText = new PIXI.Text(text, {
		fontFamily: 'Dosis',
		fontSize : Math.round(size),
		fill: options.fill || "#FFF",
		stroke: options.stroke || "#000",
		strokeThickness: options.strokeThickness || 0,
		align: options.align || 'left'
	});

	return aText;

}

function clearTextureCache() {
	var message = "Clearing Cache, Before: " + Object.keys(PIXI.utils.BaseTextureCache).length + ", After: ";

	renderer.textureGC.maxIdle = 120;
	renderer.textureGC.run();

	message += Object.keys(PIXI.utils.BaseTextureCache).length;
	debug && console.log(message);
}

function SpritePool(texture, container, dontUseDiscardedSprites) {
	var spriteContainer = new PIXI.Container();
	container.addChild(spriteContainer);
	this.sprites = [];
	this.discardedSprites = [];
	this.container = spriteContainer;
	this.texture = texture;
	this.textureCount = 0;
	this.dontUseDiscardedSprites = dontUseDiscardedSprites;
}

SpritePool.prototype.nextSprite = function() {
	if (this.discardedSprites.length > 0) {
		return this.discardedSprites.pop();
	} else {
		var sprite;
		if (Array.isArray(this.texture)) {
			sprite = new PIXI.Sprite(this.texture[this.textureCount], this.dontUseDiscardedSprites);
			this.textureCount++;
			if (this.textureCount > this.texture.length)
				this.textureCount = 0;
		} else {
			sprite = new PIXI.Sprite(this.texture, this.dontUseDiscardedSprites);
		}
		sprite.anchor = {x:0.5,y:0.5};
		this.sprites.push(sprite);
		this.container.addChild(sprite);
		return sprite;
	}
};

SpritePool.prototype.discardSprite = function(sprite) {
	sprite.visible = false;
	this.discardedSprites.push(sprite);
};

SpritePool.prototype.discardAll = function() {
	this.discardedSprites = this.sprites.slice();
	for (var i = 0; i < this.sprites.length; i++) {
		this.sprites[i].visible = false;
	}
};

SpritePool.prototype.changeTexture = function(texture) {
	this.texture = texture;
	for (var i = 0; i < this.sprites.length; i++) {
		this.sprites[i].texture = texture;
		this.sprites[i].anchor = {x:0.5,y:0.5};
	}
};

SpritePool.prototype.forEach = function(apply) {
	for (var i = 0; i < this.sprites.length; i++) {
		apply(this.sprites[i]);
	}
};

SpritePool.prototype.destroy = function(leaveTextures) {
	if (!this.destroyed) {
		this.container.destroy({children:true, texture:!leaveTextures, baseTexture:!leaveTextures});
	}
	this.sprites = [];
	this.discardedSprites = [];
	this.destroyed = true;
};
