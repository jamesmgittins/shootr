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

// convert HEX color to RGB
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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