// That's how you define the value of a pixel //
function drawPixel2(x, y, r, g, b, a) {
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight)
        return;

    var index = (x + y * canvasWidth) * 4;

    canvasDataArr[index + 0] = r;
    canvasDataArr[index + 1] = g;
    canvasDataArr[index + 2] = b;
    canvasDataArr[index + 3] = a;
}

function drawPixel(x, y, r, g, b, a, w, h) {
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight)
        return;

    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a / 255) + ')';
    ctx.fillRect(x, y, (w ? w : 1), (h ? h : 1));
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
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

function relMouseCoords(event) {
    if (event.offsetX !== undefined && event.offsetY !== undefined) {
        return {
            x: Math.round(event.offsetX * (this.width / this.offsetWidth)),
            y: Math.round(event.offsetY * (this.height / this.offsetHeight))
        };
    }
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement = currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    // Fix for variable canvas width
    canvasX = Math.round(canvasX * (this.width / this.offsetWidth));
    canvasY = Math.round(canvasY * (this.height / this.offsetHeight));

    return {
        x: canvasX,
        y: canvasY
    };
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

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
		return (input / 1000000000000).toFixed(2) + 'T';
	if (input >= 1000000000)
		return (input / 1000000000).toFixed(2) + 'B';
	if (input >= 1000000)
		return (input / 1000000).toFixed(2) + 'M';
	if (input >= 1000)
		return (input / 1000).toFixed(2) + 'K';

	return input.toFixed(0);
}