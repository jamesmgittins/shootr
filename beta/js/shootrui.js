ShootrUI = {};

var player1Gamepad = -1;
var player2Gamepad = -1;

ShootrUI.pauseGame = function () {
    if (currentState == states.running)
        changeState(states.paused);
    else
        changeState(states.running);
};

var fps = 60;
var fpsCounter = 0;
var lastFps = 0;

ShootrUI.toggleFullscreen = function() {
	if (document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement) {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	} else {
		var i = document.body;
		//var i = canvas;
		if (i.requestFullscreen) {
			i.requestFullscreen();
		} else if (i.webkitRequestFullscreen) {
			i.webkitRequestFullscreen();
		} else if (i.mozRequestFullScreen) {
			i.mozRequestFullScreen();
		} else if (i.msRequestFullscreen) {
			i.msRequestFullscreen();
		}
		setTimeout(function(){
			updateAfterScreenSizeChange();
		}, 2000);
	}
};

ShootrUI.updateFps = function (updateTime) {
    fpsCounter++;
    if (updateTime >= lastFps + 1000) {
        fps = fpsCounter;
        lastFps = updateTime;
        fpsCounter = 0;
    }
};
var inputTypes ={mouseKeyboard:"MK",controller:"CT"};
var lastUsedInput = inputTypes.mouseKeyboard;
var controllerTypes = {xbox:"XBOX",playStation:"PS"};
var controllerType = controllerTypes.xbox;

ShootrUI.updateGamepadSelect = function () {
	if (typeof navigator.getGamepads !== 'undefined') {

		var foundAGamePad = false;

		if (typeof navigator.getGamepads()[player1Gamepad] ==="undefined")
			player1Gamepad = -1;

		for (var i = 0; i < navigator.getGamepads().length; i++) {
			if (navigator.getGamepads()[i]) {
				if (player1Gamepad == -1) {
					player1Gamepad = i;
					if(navigator.getGamepads()[i].id.indexOf("054c") != -1) {
						controllerType = controllerTypes.playStation;
            if (SettingsMenu.controllerText)
              SettingsMenu.controllerText.text = "Playstation controller detected";
					}
					if(navigator.getGamepads()[i].id.indexOf("Xbox") != -1) {
						controllerType = controllerTypes.xbox;
            if (SettingsMenu.controllerText)
              SettingsMenu.controllerText = "Xbox controller detected";
					}
				}

				foundAGamePad = true;
			}
		}
	}
};

var buttonTypes = {
	select:0,
	back:1,
	leftShoulder:2,
	rightShoulder:3
};

ShootrUI.getInputButtonDescription = function(button) {
	if (lastUsedInput == inputTypes.mouseKeyboard) {
		// keyboard button labels
		switch(button) {
			case buttonTypes.select:
				return "SPACE";
			case buttonTypes.back:
				return "BACKSPACE";
			case buttonTypes.leftShoulder:
				return "Q";
			case buttonTypes.rightShoulder:
				return "E";
		}
	} else {
		if (controllerType == controllerTypes.playStation) {
			// playstation button labels
			switch(button) {
			case buttonTypes.select:
				return "X";
			case buttonTypes.back:
				return "O"
			case buttonTypes.leftShoulder:
				return "L1";
			case buttonTypes.rightShoulder:
				return "R1";
		}
		} else {
			// xbox button labels
			switch(button) {
			case buttonTypes.select:
				return "A";
			case buttonTypes.back:
				return "B";
			case buttonTypes.leftShoulder:
				return "LB";
			case buttonTypes.rightShoulder:
				return "RB";
		}
		}
	}
}

window.addEventListener("gamepadconnected", function (e) {
  ShootrUI.updateGamepadSelect();
});
window.addEventListener("gamepaddisconnected", function (e) {
  ShootrUI.updateGamepadSelect();
});


function mouseWheelHandler(e) {
	var e = window.event || e; // old IE support
	var delta = (e.wheelDelta || -e.detail);
	StarChart.mousewheel(delta);
	e.stopPropagation();
	e.preventDefault();
	return false;
}

function clickCanvas(data) {
	if (currentState == states.running) {
		clickLocX = (data.data.getLocalPosition(stage).x - stageSprite.position.x) / scalingFactor;
		clickLocY = data.data.getLocalPosition(stage).y / scalingFactor;
		aimLocX = 0;
		aimLocY = 0;
	} else {
		CheckForMenuClick();
		GameText.levelComplete.checkForClick()
	}
}

window.onkeydown = function (e) {
	lastUsedInput = inputTypes.mouseKeyboard;
	switch (e.keyCode) {
		case 80:
			if (currentState == states.running)
				changeState(states.paused);
			break;
			case 81:
				q = true;
				break;
			case 87:
				w = true;
				break;
			case 69:
				ekey = true;
				break;
			case 65:
				a = true;
				break;
			case 83:
				s = true;
				break;
			case 68:
				d = true;
				break;
			case 38:
				w = true;
				break;
			case 37:
				a = true;
				break;
			case 40:
				s = true;
				break;
			case 39:
				d = true;
				break;
			case 32:
				spaceBar = true;
				break;
			case 27:
				esc = true;
				e.preventDefault();
				break;
			case 13:
				enter = true;
				break;
			case 8:
				esc = true;
				e.preventDefault();
				break;
			default:
				return true;
	}
	return false;
};
window.onkeyup = function (e) {
	switch (e.keyCode) {
		case 81:
			q = false;
			break;
		case 87:
			w = false;
			break;
		case 69:
			ekey = false;
			break;
		case 65:
			a = false;
			break;
		case 83:
			s = false;
			break;
		case 68:
			d = false;
			break;
		case 38:
			w = false;
			break;
		case 37:
			a = false;
			break;
		case 40:
			s = false;
			break;
		case 39:
			d = false;
			break;
		case 32:
			spaceBar = false;
			break;
		case 13:
			enter = false;
			break;
		case 27:
			esc = false;
			e.preventDefault();
			break;
		case 8:
			esc = false;
			e.preventDefault();
			break;
		default:
			return true;
	}
	return false;
};

function updateLastInput(type) {

}

function updateGamepads() {
    // Update gamepad state
    if (player1Gamepad > -1 && typeof navigator.getGamepads !== 'undefined' && navigator.getGamepads()[player1Gamepad]) {

        playerOneAxes = navigator.getGamepads()[player1Gamepad].axes;
        playerOneButtons = navigator.getGamepads()[player1Gamepad].buttons;

        for (var i = 0; i < playerOneButtons.length; i++) {

            if (playerOneButtons[i].pressed) {

							lastUsedInput = inputTypes.controller;

                if (!playerOneButtonsPressed[i]) {
                    switch (i) {
                        // start button
                        case 9:
                            if (currentState == states.running) {
                                changeState(states.paused);
                            } else {
                                //changeState(states.running);
                            }
                            break;
                    }
                }
            }
            playerOneButtonsPressed[i] = playerOneButtons[i].pressed;
        }
    }
	MainMenu.updateGamepad();
}
