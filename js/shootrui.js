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
var lastUpgradesHtml = "";

ShootrUI.updateUpgrades = function () {

    var upgradesHtml = "";
    var price;

    var counter = 0;

    for (var i = 0; i < upgrades.length; i++) {

        if (upgrades[i].levelUnlocked <= gameModel.levelsUnlocked) {

            if (upgrades[i].qty >= upgrades[i].maxQty && upgrades[i].maxQty != -1) {
                upgradesHtml = upgradesHtml + "<button class='disabled" + (counter == playerOneSelectedUpgrade ? "selected" : "") + "'><span>(" +
                    upgrades[i].qty + "/" + upgrades[i].maxQty + ")</span> " +
                    upgrades[i].desc + "<span class='price'></span></button>";
            } else {
                price = upgradePrice(upgrades[i]);
                var buttonClass = (counter == playerOneSelectedUpgrade ? "selected" : "") + (price >= gameModel.p1.credits ? " disabled" : "")
                var spanWidth = price < gameModel.p1.credits ? '100%' : (gameModel.p1.credits / price * 100).toFixed(1) + '%';
                
                upgradesHtml = upgradesHtml + "<button class='" + buttonClass + "' onclick=\"buyUpgrade('" + upgrades[i].id + "');\" data-price='" +
                    price + "'><span>(" +
                    (upgrades[i].maxQty != -1 ? upgrades[i].qty + "/" + upgrades[i].maxQty + ")</span>" : upgrades[i].qty + "/&infin;)</span> ") +
                    upgrades[i].desc + "<span class='price'>" + formatMoney(price) + "</span><span class='prog' style='width:" + spanWidth + "'></span></button>";
            }
            counter++;
        }
    }
    if (upgradesHtml != lastUpgradesHtml) {
        document.getElementById('p1-upgrades').innerHTML = upgradesHtml;
        lastUpgradesHtml = upgradesHtml;
    };
};

ShootrUI.renderLevelSelect = function () {
    var firstLevel = Math.max(1, -2 + gameModel.currentLevel);
    var lastLevel = Math.min(gameModel.levelsUnlocked, 2 + gameModel.currentLevel);

    if (playerOneSelectedLevel > -1) {
        firstLevel = Math.max(1, -2 + playerOneSelectedLevel);
        lastLevel = Math.min(gameModel.levelsUnlocked, 2 + playerOneSelectedLevel);
    }

    var levelsHtml = "";
    for (var i = firstLevel; i <= lastLevel; i++) {
        var classAttr = "";

        if (i == gameModel.currentLevel)
            classAttr = "current";

        if (i == playerOneSelectedLevel)
            classAttr = classAttr + " selected";
        

        levelsHtml = levelsHtml + "<div class='" + classAttr + "'>" + i + "</div>";
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

var lastCredits = 0;
ShootrUI.updateUI = function () {
    // run every 200 ms
    setTimeout(ShootrUI.updateUI, 200);

    stats.innerHTML = fps + " fps<br>Credits: " + formatMoney(gameModel.p1.credits) +
		"<br>Total Credits Earned: " + formatMoney(gameModel.p1.totalCredits) +
		"<br>Enemies killed: " + enemiesKilled + "/" + enemiesToKill;

    if (gameModel.p1.credits != lastCredits) {
        lastCredits = gameModel.p1.credits;
        ShootrUI.updateUpgrades();
    }
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
