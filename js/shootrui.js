ShootrUI = {};

var player1Gamepad = -1;
var player2Gamepad = -1;

ShootrUI.selectGamepad = function (select, playerNumb) {
    player1Gamepad = select.value;
};

ShootrUI.pauseGame = function () {
    if (currentState == states.running)
        changeState(states.paused);
    else
        changeState(states.running);
};

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

ShootrUI.updateUpgrades = function () {

    var upgradesHtml = "";
    var price;

    for (var i = 0; i < upgrades.length; i++) {

        if (upgrades[i].levelUnlocked <= gameModel.levelsUnlocked) {
            if (upgrades[i].qty >= upgrades[i].maxQty && upgrades[i].maxQty != -1) {
                upgradesHtml = upgradesHtml + "<button class='disabled'><span>(" +
                    upgrades[i].qty + "/" + upgrades[i].maxQty + ")</span> " +
                    upgrades[i].desc + "<span class='price'></span></button>";
            } else {
                price = upgradePrice(upgrades[i]);
                upgradesHtml = upgradesHtml + "<button onclick=\"buyUpgrade('" + upgrades[i].id + "');\" data-price='" +
                    price + "'><span>(" +
                    (upgrades[i].maxQty != -1 ? upgrades[i].qty + "/" + upgrades[i].maxQty + ")</span>" : upgrades[i].qty + "/&infin;)</span> ") +
                    upgrades[i].desc + "<span class='price'>" + formatMoney(price) + "</span></button>";
            }
        }

    }

    $("#p1-upgrades").html(upgradesHtml);
	$("#p1-upgrades button").each(function(){
		if ($(this).data('price') > gameModel.p1.credits) {
			$(this).addClass("disabled");
		}
	});
};

ShootrUI.renderLevelSelect = function () {
    var firstLevel = Math.max(1, -2 + gameModel.currentLevel);
    var lastLevel = Math.min(gameModel.levelsUnlocked, 2 + gameModel.currentLevel);

    var levelsHtml = "";
    for (var i = firstLevel; i <= lastLevel; i++) {
        if (i == gameModel.currentLevel)
            levelsHtml = levelsHtml + "<div class='current'>" + i + "</div>";
        else
            levelsHtml = levelsHtml + "<div>" + i + "</div>";
    }
    $("#level-select").html(levelsHtml);

    $("#level-select > div").on("click", function (event) {
        changeLevel(event.currentTarget.innerHTML);
        event.stopPropagation();
        event.preventDefault();
    });
};

var stats = document.getElementById("p1-stats");
var stats2 = document.getElementById("p2-stats");

ShootrUI.updateUI = function () {
    // run every 200 ms
    setTimeout(ShootrUI.updateUI, 200);

    stats.innerHTML = fps + " fps<br>Credits: " + formatMoney(gameModel.p1.credits) +
		"<br>Total Credits Earned: " + formatMoney(gameModel.p1.totalCredits) +
		"<br>Enemies killed: " + enemiesKilled + "/" + enemiesToKill;

	$("#p1-upgrades button").each(function(){
	    if ($(this).data('price') > gameModel.p1.credits || !$(this).data('price')) {
			$(this).addClass("disabled");
		} else {
			$(this).removeClass("disabled");			
		}
	});
};

ShootrUI.updateGamepadSelect = function () {
    if (typeof navigator.getGamepads !== 'undefined') {

        var gamePadOptions = "<option value='-1'>Select Gamepad</option>";
        var foundAGamePad = false;

        for (var i = 0; i < navigator.getGamepads().length; i++) {
            if (typeof navigator.getGamepads()[i] !== 'undefined') {
                gamePadOptions += "<option value=" + i + (i == player1Gamepad ? " selected " : "") + ">" + navigator.getGamepads()[i].id + "</option>";
                foundAGamePad = true;
            }
        }

        if (!foundAGamePad)
            gamePadOptions = "<option value='-1'>No Gamepads Connected</option>";

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
