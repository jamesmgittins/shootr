ShootrUI = {};

var player1Gamepad = -1;

ShootrUI.selectGamepad = function (select, playerNumb) {
    player1Gamepad = select.value;
};

ShootrUI.paused = false;
ShootrUI.pauseGame = function () { ShootrUI.paused = !ShootrUI.paused; };

var fps = 60;
var fpsCounter = 0;
var lastFps = 0;

ShootrUI.updateFps = function (updateTime) {
    fpsCounter++;
    if (updateTime >= lastFps + 1000) {
        fps = fpsCounter;
        lastFps = updateTime;
        fpsCounter = 0;
    }
};

var stats = document.getElementById("stats");

ShootrUI.updateUI = function () {
    // run every 100 ms
    setTimeout(ShootrUI.updateUI, 200);

    stats.innerHTML = fps.toFixed() + " fps<br>Credits: " + credits.toFixed(0);
    if (playerOneAxes.length > 2) {
        stats.innerHTML += "<br>JoyAxis1 = " + playerOneAxes[0].toFixed(2) + ", JoyAxis2 = " + playerOneAxes[1].toFixed(2) + "<br>JoyAxis3 = " + playerOneAxes[2].toFixed(2) + ", JoyAxis4 = " + playerOneAxes[3].toFixed(2);
    }

};

ShootrUI.updateGamepadSelect = function () {
    if (typeof navigator.getGamepads !== 'undefined') {

        var gamePadOptions = "<option value='-1'>Select Gamepad</option>"

        for (var i = 0; i < navigator.getGamepads().length; i++) {
            if (typeof navigator.getGamepads()[i] !== 'undefined') {
                gamePadOptions += "<option value=" + i + (i == player1Gamepad ? " selected " : "") + ">" + navigator.getGamepads()[i].id + "</option>"
            }
        }

        document.getElementById("gamepad-sel").innerHTML = gamePadOptions;
    } else {
        document.getElementById("gamepad-sel").style.display = "none";
    }
};

window.addEventListener("gamepadconnected", function (e) {
    ShootrUI.updateGamepadSelect();
});
window.addEventListener("gamepaddisconnected", function (e) {
    ShootrUI.updateGamepadSelect();
});
