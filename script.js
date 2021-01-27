$("#soundToggleCheckbox")[0].checked = true;
var gameDuration = 60;
var sunWaitDuration = 20;
var moonWaitDuration = 40;
var defaultBrightness = 50;
var obstacleTimeoutDuration = 3.5;
var obstacleMovementPixels = 1;
var minObstacleTimeoutDuration = 1.3;
var maxObstacleMovementPixels = 3.2;
var wheelieTimeout;
var startupInterval;
var dayInterval;
var nightInterval;
var time = gameDuration;
var gameStarted = false;
var gamePaused = false;
var collided = false;
var jumpClicks = 0;
var backgroundTimeout;
var jumpTimeout;
var fallTimeout;
var obstacleStartPos = 400;
var obstacleEndPos = -50;
var obstacleTimeout;
var bonusStartPos = 400;
var bonusEndPos = -50;
var bonusTimeIncrease = randomInteger(10, 30);
var bonusTimeout;
var bonusTimeoutDuration = randomInteger(10, 30);
var bonusTime = false;
var moveObstaclesTimeout;
var sunSVG = $("#sunSVG")[0];
var moonSVG = $("#moonSVG")[0];
var sunTimeout;
var moonTimeout;
var brightness = defaultBrightness;
var lightsOn = false;
var rainOrSnowTimeout;
var rainOrSnowTimeoutDuration = randomInteger(15, 45);
var rainOrSnowDuration = randomInteger(10, 20);
var rainOrSnow = ["rain", "rain", "snow"];
var disablingSnow = false;
var countSecondsInterval;
var checkCollisionInterval;
var d;
var s;
var fadeRevAudioTimer;
var fadingRevStarted = false;
var music = new Audio("Sounds/Music.mp3");
music.volume = 0.7;
music.loop = true;
var engine = new Audio("Sounds/Engine.mp3");
engine.currentTime = 1;
engine.volume = 0.1;
engine.loop = true;
var burnout = new Audio("Sounds/Burnout.mp3");
burnout.currentTime = 0.1;
burnout.playbackRate = 0.95;
burnout.volume = 0.2;
var revup = new Audio("Sounds/Rev Up.mp3");
revup.currentTime = 18.4;
revup.volume = 0.5;
var jump = new Audio("Sounds/Jump.mp3");
jump.volume = 0.5;
var crash = new Audio("Sounds/Crash.mp3");
crash.volume = 0.5;
var bonus = new Audio("Sounds/Bonus.mp3");
bonus.volume = 0.4;
var rain = new Audio("Sounds/Rain.mp3");
rain.volume = 0.1;
var seconds = new Audio("Sounds/Seconds.mp3");
seconds.volume = 0.3;
var timesup = new Audio("Sounds/Time's Up.mp3");
timesup.volume = 0.3;

$("#startupClickDiv").on("click", function(e) {
  $("#startupClickDiv")[0].style.display = "none";
  d = anime({
    targets: ".rear",
    rotate: "1turn",
    duration: 300,
    easing: "linear",
    autoplay: true,
    loop: false,
  });
  s = anime({
    targets: "#player",
    translateX: 164,
    rotateZ: "-20deg",
    duration: 1500,
    easing: "linear",
    autoplay: true,
    loop: false,
    delay: 300,
  });
  wheelieTimeout = setTimeout(function() {
    $("#player")[0].setAttribute("class", "wheelie");
  }, 1800);
  loopSunAndMoon();
  loopDayAndNight();
  setTimeout(function() {
    $(".wheels")[0].setAttribute("class", "wheels rear rotate");
    $(".wheels")[1].setAttribute("class", "wheels front rotate");
  }, 300);
  backgroundTimeout = setTimeout(function() {
    $("#background")[0].setAttribute("class", "sliding-background");
  }, 1800);
  rainOrSnowTimeout = setTimeout(function() {
    loopRainOrSnow();
  }, rainOrSnowTimeoutDuration * 1000);
  setTimeout(function() {
    if ($("#soundToggleCheckbox")[0].checked == false) {
      music.volume = 0;
      music.play();
      engine.volume = 0;
      burnout.volume = 0;
      burnout.play();
      revup.volume = 0;
      revup.play();
    } else if ($("#soundToggleCheckbox")[0].checked == true) {
      music.play();
      burnout.play();
      revup.play();
    }
  }, 4);
  setTimeout(function() {
    fadeRevAudio();
    engine.play();
  }, 3000);
});

var p = anime({
  targets: "#player",
  translateX: 350,
  duration: 3488,
  direction: "alternate",
  autoplay: false,
  loop: true,
});

var w = anime({
  targets: ".wheels",
  rotate: "1turn",
  duration: 1000,
  easing: "linear",
  autoplay: false,
  loop: true,
});

var b = anime({
  targets: "#body",
  translateY: 7,
  duration: 700,
  easing: "linear",
  direction: "alternate",
  loop: true,
});

$("#startGameButton")[0].onclick = function(e) {
  s.pause();
  burnout.pause();
  revup.pause();
  engine.play();
  clearTimeout(wheelieTimeout);
  $("#player")[0].removeAttribute("class");
  $("#player")[0].style.transform = "translateX(164px) rotate(0deg)";
  $("#gameOver")[0].innerHTML = "";
  $("#gameOverReason")[0].innerHTML = "";
  $("#startGameButton")[0].style.display = "none";
  $("#soundToggleContainer")[0].style.display = "none";
  clearTimeout(backgroundTimeout);
  $("#background")[0].setAttribute("class", "sliding-background");
  $("#player")[0].style.top = "350px";
  p.seek(e.layerX);
  w.seek(e.layerX);
  collided = false;
  obstacleTimeout = setTimeout(createObstaclesAndBonuses, obstacleTimeoutDuration * 1000);
  moveObstaclesTimeout = setTimeout(moveObstaclesAndBonuses, 20);
  $("#timeLeft")[0].innerHTML = time;
  countSecondsInterval = setInterval(countSeconds, 1000);
  checkCollisionInterval = setInterval(checkCollision, 10);
  gameStarted = true;
  bonusTimeout = setTimeout(setBonusTimeout, bonusTimeoutDuration * 1000);
}

$("#soundToggleCheckbox").on("click", function() {
  if ($("#soundToggleCheckbox")[0].checked == true) {
    restoreStartupSounds();
  } else if ($("#soundToggleCheckbox")[0].checked == false) {
    muteStartupSounds();
  }
});

$("#soundToggleButton").on("click", function() {
  if ($("#soundToggleCheckbox")[0].checked == false) {
    $("#soundToggleCheckbox")[0].checked = true;
    restoreStartupSounds();
  } else if ($("#soundToggleCheckbox")[0].checked == true) {
    $("#soundToggleCheckbox")[0].checked = false;
    muteStartupSounds();
  }
});

$("#field")[0].onmousemove = function(e) {
  if ((time <= 0) || (collided == true) || (gameStarted != true)) {
    return;
  }
  p.seek(e.layerX);
  w.seek(e.layerX);
}

$("#field").mousedown(function() {
  if ((time <= 0) || (collided == true) || (gameStarted != true)) {
    return;
  }
  jumpClicks++;
  var playerElement = $("#player")[0].getBoundingClientRect();
  if (jumpClicks == 1) {
    $("#player")[0].setAttribute("class", "singleJump");
  } else if (jumpClicks == 2) {
    $("#player")[0].setAttribute("class", "doubleJump");
    setTimeout(function() {
      $("#player")[0].setAttribute("class", "fall");
    }, 290);
    setTimeout(function() {
      if ((time <= 0) || (collided == true) || (gameStarted != true)) {
        return;
      }
      $("#player")[0].removeAttribute("class");
      jumpClicks = 0;
    }, 750);
  }
  if ($("#soundToggleCheckbox")[0].checked == true) {
    jump.pause();
    jump.currentTime = 0;
    jump.play();
  }
  clearTimeout(jumpTimeout);
  jumpTimeout = setTimeout(function() {
    if ((time <= 0) || (collided == true) || (gameStarted != true)) {
      return;
    }
    $("#player")[0].removeAttribute("class");
    jumpClicks = 0;
  }, 750);
});

function createObstaclesAndBonuses() {
  if (gamePaused == true) {
    return;
  }
  var newObstacle = document.createElement("div");
  newObstacle.setAttribute("class", "obstacles");
  newObstacle.setAttribute("startPos", obstacleStartPos);
  newObstacle.setAttribute("endPos", obstacleEndPos);
  var topBonusValues = ["348px", "276px", "224px"];
  var topValues = ["348px", "296px"];
  var heightValues = ["52px", "104px"];
  var chosenHeight = heightValues[randomInteger(0, 1)];
  var chosenTopValue = topValues[randomInteger(0, 1)];
  if (chosenHeight == heightValues[1]) {
    newObstacle.style.top = topValues[1];
  } else {
    newObstacle.style.top = chosenTopValue;
  }
  newObstacle.style.height = chosenHeight;
  newObstacle.style.left = obstacleStartPos + "px";
  $("#field")[0].append(newObstacle);
  clearTimeout(obstacleTimeout);
  obstacleTimeout = setTimeout(createObstaclesAndBonuses, obstacleTimeoutDuration * 1000);
  if (bonusTime == true) {
    var newBonus = document.createElement("div");
    newBonus.setAttribute("class", "bonuses");
    newBonus.setAttribute("startPos", bonusStartPos);
    newBonus.setAttribute("endPos", bonusEndPos);
    if (chosenHeight == heightValues[0]) {
      if (chosenTopValue == topValues[0]) {
        newBonus.style.top = topBonusValues[randomInteger(1, 2)];
      } else if (chosenTopValue == topValues[1]) {
        newBonus.style.top = topBonusValues[randomInteger(0, 2)];
      }
    } else if (chosenHeight == heightValues[1]) {
      newBonus.style.top = topBonusValues[2];
    }
    newBonus.style.left = bonusStartPos + "px";
    $("#field")[0].append(newBonus);
    bonusTime = false;
  }
}

function countSeconds() {
  if ((collided != true) && (gameStarted == true)) {
    if (time > 0) {
      time = time - 1;
    }
    if ($("#soundToggleCheckbox")[0].checked == true) {
      if ((time > 0) && (time <= 5)) {
        seconds.play();
      }
    }
    $("#timeLeft")[0].innerHTML = time;
    obstacleTimeoutDuration -= 0.03;
    if (obstacleTimeoutDuration <= minObstacleTimeoutDuration) {
      obstacleTimeoutDuration = minObstacleTimeoutDuration;
    }
    obstacleMovementPixels += 0.03;
    if (obstacleMovementPixels >= maxObstacleMovementPixels) {
      obstacleMovementPixels = maxObstacleMovementPixels;
    }
    if (time <= 0) {
      clearInterval(countSecondsInterval);
      removeBonusText();
      $("#gameOver")[0].innerHTML = "Game Over";
      $("#gameOverReason")[0].innerHTML = "Time's up! Score: " + $("#score")[0].innerHTML;
      $("#newGameButton")[0].style.display = "inline";
      $("#soundToggleContainer")[0].style.left = "162px";
      $("#soundToggleContainer")[0].style.width = "81px";
      $("#soundToggleContainer")[0].style.display = "inline";
      $("#background")[0].style.animationPlayState = "paused";
      bonusTime = false;
      pauseGame();
      if ($("#soundToggleCheckbox")[0].checked == true) {
        music.pause();
        engine.pause();
        jump.pause();
        crash.pause();
        bonus.pause();
        rain.pause();
        timesup.play();
      }
    }
  }
}

function checkCollision() {
  if (gamePaused == true) {
    return;
  }
  var obstacles = $(".obstacles");
  for (var i = 0; i < obstacles.length; i++) {
    var playerRect = $("#player")[0].getBoundingClientRect();
    var obstacleRect = obstacles[i].getBoundingClientRect();
    var overlap = !(playerRect.right < obstacleRect.left || playerRect.left > obstacleRect.right || playerRect.bottom < obstacleRect.top || playerRect.top > obstacleRect.bottom);
    if (overlap) {
      clearInterval(checkCollisionInterval);
      removeBonusText();
      $("#gameOver")[0].innerHTML = "Game Over";
      $("#gameOverReason")[0].innerHTML = "Avoid hitting obstacles! Score: " + $("#score")[0].innerHTML;
      $("#newGameButton")[0].style.display = "inline";
      $("#soundToggleContainer")[0].style.left = "162px";
      $("#soundToggleContainer")[0].style.width = "81px";
      $("#soundToggleContainer")[0].style.display = "inline";
      collided = true;
      bonusTime = false;
      pauseGame();
      if ($("#soundToggleCheckbox")[0].checked == true) {
        music.pause();
        engine.pause();
        jump.pause();
        crash.play();
        bonus.pause();
        rain.pause();
      }
    }
    if (obstacles[i].getAttribute("passed") != "true") {
      if (playerRect.left - obstacleRect.right > 0) {
        $("#score")[0].innerHTML = parseInt($("#score")[0].innerHTML) + parseInt(1);
        obstacles[i].setAttribute("passed", true);
      }
    }
  }
  var bonuses = $(".bonuses");
  for (var j = 0; j < bonuses.length; j++) {
    var playerRect = $("#player")[0].getBoundingClientRect();
    var bonusRect = bonuses[j].getBoundingClientRect();
    var overlap = !(playerRect.right < bonusRect.left || playerRect.left > bonusRect.right || playerRect.bottom < bonusRect.top || playerRect.top > bonusRect.bottom);
    if (overlap) {
      $("#gameOverReason")[0].style.top = "50px";
      $("#gameOverReason")[0].style.fontSize = "30px";
      $("#gameOverReason")[0].innerHTML = "+" + bonusTimeIncrease + "s";
      time += bonusTimeIncrease;
      $("#timeLeft")[0].innerHTML = time;
      bonuses[j].remove();
      setTimeout(removeBonusText, 1500);
      bonusTimeIncrease = randomInteger(10, 30);
      bonusTimeoutDuration = randomInteger(10, 30);
      clearTimeout(bonusTimeout);
      bonusTimeout = setTimeout(setBonusTimeout, bonusTimeoutDuration * 1000);
      if ($("#soundToggleCheckbox")[0].checked == true) {
        bonus.play();
      }
    }
  }
}

function moveObstaclesAndBonuses() {
  if ((collided != true) && (time > 0)) {
    var obstacles = $(".obstacles");
    for (var i = 0; i < obstacles.length; i++) {
      obstacles[i].style.left = obstacles[i].getAttribute("startPos") + "px";
      var startValue = obstacles[i].getAttribute("startPos");
      obstacles[i].setAttribute("startPos", startValue - obstacleMovementPixels);
    }
    var bonuses = $(".bonuses");
    for (var j = 0; j < bonuses.length; j++) {
      bonuses[j].style.left = bonuses[j].getAttribute("startPos") + "px";
      var startValue = bonuses[j].getAttribute("startPos");
      bonuses[j].setAttribute("startPos", startValue - obstacleMovementPixels);
    }
    clearTimeout(moveObstaclesTimeout);
    moveObstaclesTimeout = setTimeout(moveObstaclesAndBonuses, 20);
  }
}

$("#newGameButton")[0].onclick = function(e) {
  setTimeout(function() {
    time = gameDuration;
    jumpClicks = 0;
    $("#timeLeft")[0].innerHTML = time;
  }, 10)
  restartGame();
  clearInterval(countSecondsInterval);
  countSecondsInterval = setInterval(countSeconds, 1000);
  clearInterval(checkCollisionInterval);
  checkCollisionInterval = setInterval(checkCollision, 10);
  if ($("#soundToggleCheckbox")[0].checked == true) {
    music.currentTime = 0;
    music.play();
    engine.currentTime = 1;
    engine.play();
    jump.pause();
    jump.currentTime = 0;
    crash.pause();
    crash.currentTime = 0;
    bonus.pause();
    bonus.currentTime = 0;
    rain.pause();
    rain.currentTime = 0;
    seconds.pause();
    seconds.currentTime = 0;
    timesup.pause();
    timesup.currentTime = 0;
	restoreStartupSounds();
  }
  p.seek(e.layerX);
  w.seek(e.layerX);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeBonusText() {
  if (gamePaused == true) {
    return;
  }
  $("#gameOverReason")[0].style.top = "initial";
  $("#gameOverReason")[0].style.fontSize = "20px";
  $("#gameOverReason")[0].innerHTML = "";
}

function setBonusTimeout() {
  if (gamePaused == true) {
    return;
  }
  bonusTime = true;
}

function pauseGame() {
  b.pause();
  sunSVG.pauseAnimations();
  moonSVG.pauseAnimations();
  clearTimeout(sunTimeout);
  clearTimeout(moonTimeout);
  clearInterval(startupInterval);
  clearInterval(dayInterval);
  clearInterval(nightInterval);
  $("#background")[0].style.animationPlayState = "paused";
  $("#player")[0].style.animationPlayState = "paused";
  $(".wheels")[0].style.animationPlayState = "paused";
  $(".wheels")[1].style.animationPlayState = "paused";
  $("#headlights")[0].style.animationPlayState = "paused";
  $("#taillights")[0].style.animationPlayState = "paused";
  var drops = $(".drop");
  for (var k = 0; k < drops.length; k++) {
    drops[k].style.animationPlayState = "paused";
  }
  var stems = $(".stem");
  for (var k = 0; k < stems.length; k++) {
    stems[k].style.animationPlayState = "paused";
  }
  var splats = $(".splat");
  for (var k = 0; k < splats.length; k++) {
    splats[k].style.animationPlayState = "paused";
  }
  clearTimeout(rainOrSnowTimeout);
  gamePaused = true;
}

function restartGame() {
  clearField();
  b.play();
  $("#timeLeft")[0].innerHTML = "60";
  brightness = defaultBrightness;
  $("#background")[0].style.filter = "brightness(" + brightness + "%)";
  $("#score")[0].innerHTML = "0";
  $("#gameOver")[0].innerHTML = "";
  $("#gameOverReason")[0].innerHTML = "";
  $("#newGameButton")[0].style.display = "none";
  $("#soundToggleContainer")[0].style.display = "none";
  $("#player")[0].style.top = "350px";
  $("#background")[0].style.animationPlayState = "running";
  $("#player")[0].style.animationPlayState = "running";
  $(".wheels")[0].setAttribute("class", "wheels rear rotate");
  $(".wheels")[1].setAttribute("class", "wheels front rotate");
  $(".wheels")[0].style.animationPlayState = "running";
  $(".wheels")[1].style.animationPlayState = "running";
  $("#headlights")[0].removeAttribute("class");
  $("#taillights")[0].removeAttribute("class");
  $("#headlights")[0].style.animationPlayState = "running";
  $("#taillights")[0].style.animationPlayState = "running";
  lightsOn = false;
  collided = false;
  gamePaused = false;
  clearTimeout(obstacleTimeout);
  obstacleTimeout = setTimeout(createObstaclesAndBonuses, obstacleTimeoutDuration * 1000);
  clearTimeout(moveObstaclesTimeout);
  moveObstaclesTimeout = setTimeout(moveObstaclesAndBonuses, 20);
  $("#player")[0].removeAttribute("class");
  sunSVG.unpauseAnimations();
  moonSVG.unpauseAnimations();
  loopSunAndMoon();
  loopDayAndNight();
  obstacleTimeoutDuration = 3.5;
  obstacleMovementPixels = 1;
  bonusTime = false;
  bonusTimeIncrease = randomInteger(10, 30);
  bonusTimeoutDuration = randomInteger(10, 30);
  clearTimeout(bonusTimeout);
  bonusTimeout = setTimeout(setBonusTimeout, bonusTimeoutDuration * 1000);
  rainOrSnowTimeoutDuration = randomInteger(15, 45);
  rainOrSnowDuration = randomInteger(10, 20);
  clearTimeout(rainOrSnowTimeout);
  $(".rain").empty();
  $("#snow").empty();
  rainOrSnowTimeout = setTimeout(function() {
    loopRainOrSnow();
  }, rainOrSnowTimeoutDuration * 1000);
}

function clearField() {
  var obstacles = $(".obstacles");
  for (var i = 0; i < obstacles.length; i++) {
    obstacles[i].remove();
  }
  var bonuses = $(".bonuses");
  for (var j = 0; j < bonuses.length; j++) {
    bonuses[j].remove();
  }
}

function loopSunAndMoon() {
  if (gamePaused == true) {
    return;
  }
  $("#animateMoon")[0].endElement();
  $("#animateSun")[0].beginElement();
  clearTimeout(moonTimeout);
  moonTimeout = setTimeout(function() {
    if (gamePaused == true) {
      return;
    }
    $("#animateMoon")[0].beginElement();
    clearTimeout(sunTimeout);
    sunTimeout = setTimeout(function() {
      if (gamePaused == true) {
        return;
      }
      $("#animateSun")[0].beginElement();
      loopSunAndMoon();
    }, sunWaitDuration * 1000);
  }, moonWaitDuration * 1000);
}

function loopDayAndNight() {
  startupInterval = setInterval(function() {
    if (gamePaused == true) {
      return;
    }
    brightness++;
    $("#background")[0].style.filter = "brightness(" + brightness + "%)";
    if (brightness >= 100) {
      clearInterval(startupInterval);
      dayInterval = setInterval(decreaseBrightness, 390);
    }
  }, 390);
}

function decreaseBrightness() {
  if (gamePaused == true) {
    return;
  }
  if (brightness <= 10) {
    brightness = 10;
    clearInterval(dayInterval);
    nightInterval = setInterval(increaseBrightness, 250);
  } else {
    if (brightness <= 50) {
      brightness -= 1.5;
      if (lightsOn == false) {
        $("#headlights")[0].setAttribute("class", "turnLightsOn");
        $("#taillights")[0].setAttribute("class", "turnLightsOn");
        lightsOn = true;
      }
    } else {
      brightness--;
    }
    $("#background")[0].style.filter = "brightness(" + brightness + "%)";
  }
}

function increaseBrightness() {
  if (gamePaused == true) {
    return;
  }
  if (brightness >= 100) {
    brightness = 100;
    clearInterval(nightInterval);
    dayInterval = setInterval(decreaseBrightness, 390);
  } else {
    if (brightness >= 50) {
      brightness += 0.66;
      if (lightsOn == true) {
        $("#headlights")[0].setAttribute("class", "turnLightsOff");
        $("#taillights")[0].setAttribute("class", "turnLightsOff");
        lightsOn = false;
      }
    } else {
      brightness++;
    }
    $("#background")[0].style.filter = "brightness(" + brightness + "%)";
  }
}

function loopRainOrSnow() {
  if (gamePaused == true) {
    return;
  }
  var choice = randomInteger(0, 2);
  if (rainOrSnow[choice] == "rain") {
    enableRain();
    if ($("#soundToggleCheckbox")[0].checked == true) {
      rain.volume = 0.1;
    } else if ($("#soundToggleCheckbox")[0].checked == false) {
      rain.volume = 0;
    }
    rain.play();
  } else if (rainOrSnow[choice] == "snow") {
    enableSnow();
  }
  rainOrSnowDuration = randomInteger(10, 20);
  setTimeout(function() {
    if (gamePaused == true) {
      return;
    }
    $(".rain").empty();
    rain.pause();
    rain.currentTime = 0;
    disablingSnow = true;
    clearTimeout(rainOrSnowTimeout);
    rainOrSnowTimeout = setTimeout(loopRainOrSnow, rainOrSnowTimeoutDuration * 1000);
  }, rainOrSnowDuration * 1000);
}

function enableRain() {
  $(".rain").empty();
  var increment = 0;
  var drops = "";
  var backDrops = "";
  while (increment < 100) {
    var randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
    var randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
    increment += randoFiver;
    drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
    backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
  }
  $(".rain.front-row").append(drops);
  $(".rain.back-row").append(backDrops);
}

var snowMax = 35; // Amount Of Snowflakes
var snowColor = ["#DDD", "#EEE"]; // Snowflake Colours
var snowEntity = "&#x2022;"; // Snow Entity
var snowSpeed = 0.75; // Falling Velocity
var snowMinSize = 8; // Minimum Flake Size
var snowMaxSize = 24; // Maximum Flake Size
var snowRefresh = 30; // Refresh Rate (In Milliseconds)
var snowStyles = "cursor: default; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none;"; // Additional Styles

var snow = [];
var pos = [];
var coords = [];
var lefr = [];
var marginBottom;
var marginRight;
var moveSnowTimeout;

function enableSnow() {
  $("#snow").empty();
  for (i = 0; i <= snowMax; i++) {
    var span = document.createElement("span");
    span.setAttribute("id", "flake" + i);
    span.setAttribute("style", snowStyles + "position: absolute; top:-" + snowMaxSize);
    span.innerHTML = snowEntity;
    $("#snow")[0].append(span);
  }
  var snowSize = snowMaxSize - snowMinSize;
  marginBottom = $("#snow")[0].scrollHeight - randomInteger(5, 95);
  marginRight = $("#snow")[0].clientWidth;
  for (i = 0; i <= snowMax; i++) {
    coords[i] = 0;
    lefr[i] = Math.random() * 15;
    pos[i] = 0.03 + Math.random() / 10;
    snow[i] = $("#flake" + i)[0];
    snow[i].style.fontFamily = "inherit";
    snow[i].size = randomise(snowSize) + snowMinSize;
    snow[i].style.fontSize = snow[i].size + "px";
    snow[i].style.color = snowColor[randomise(snowColor.length)];
    snow[i].sink = snowSpeed * snow[i].size / 5;
    snow[i].posX = randomise(marginRight - snow[i].size);
    snow[i].posY = -30;
    snow[i].style.left = snow[i].posX + "px";
    snow[i].style.top = snow[i].posY + "px";
  }
  disablingSnow = false;
  moveSnow();
}

function moveSnow() {
  if (gamePaused == true) {
    clearTimeout(moveSnowTimeout);
    return;
  }
  for (i = 0; i <= snowMax; i++) {
    marginBottom = $("#snow")[0].scrollHeight - randomInteger(5, 65);
    coords[i] += pos[i];
    snow[i].posY += snow[i].sink;
    snow[i].style.left = snow[i].posX + 15 + lefr[i] * Math.sin(coords[i]) + "px";
    snow[i].style.top = snow[i].posY + "px";
    if (snow[i].posY >= marginBottom - 2 * snow[i].size || parseInt(snow[i].style.left) > (marginRight - 3 * lefr[i])) {
      snow[i].posX = randomise(marginRight - snow[i].size);
      if (disablingSnow == true) {
        snow[i].posY = -3000;
        setTimeout(stopSnowing, 10000);
      } else if (disablingSnow == false) {
        snow[i].posY = 0;
      }
    }
  }
  clearTimeout(moveSnowTimeout);
  moveSnowTimeout = setTimeout(moveSnow, snowRefresh);
}

function stopSnowing() {
  snow = [];
  clearTimeout(moveSnowTimeout);
  $("#snow").empty();
  disablingSnow = false;
}

function randomise(range) {
  return Math.floor(range * Math.random());
}

function fadeRevAudio() {
  fadingRevStarted = true;
  if (revup.volume - 0.06 > 0) {
    revup.volume -= 0.06;
    clearTimeout(fadeRevAudioTimer);
    fadeRevAudioTimer = setTimeout(fadeRevAudio, 100);
  } else if (revup.volume - 0.06 <= 0) {
    revup.volume = 0;
    clearTimeout(fadeRevAudioTimer);
  } else {
    clearTimeout(fadeRevAudioTimer);
    revup.pause();
  }
}

function muteStartupSounds() {
  music.volume = 0;
  engine.volume = 0;
  burnout.volume = 0;
  revup.volume = 0;
  rain.volume = 0;
}

function restoreStartupSounds() {
  if (collided == false) {
    music.volume = 0.7;
    engine.volume = 0.1;
    burnout.volume = 0.2;
    if (fadingRevStarted == false) {
      revup.volume = 0.5;
    } else {
      revup.volume = 0;
    }
    rain.volume = 0.1;
  }
}
