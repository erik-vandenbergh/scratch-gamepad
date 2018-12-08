(function(ext) {

  var DEADZONE = 8000 / 32767;

  var buttons = [
    ["left top", 4],
    ["left bottom", 6],
    ["right top", 5],
    ["right bottom", 7],
    ["left stick", 10],
    ["right stick", 11],
    ["A", 0],
    ["B", 1],
    ["X", 2],
    ["Y", 3],
    ["select", 8],
    ["start", 9],
    ["up", 12],
    ["down", 13],
    ["left", 14],
    ["right", 15],
  ];

  var buttonMenu = [];
  var buttonNames = {};
  buttons.forEach(function(d) {
    var name = d[0],
        index = d[1];
    buttonMenu.push(name);
    buttonNames[name] = index;
  });

  ext.gamepadSupport = (!!navigator.getGamepads ||
                        !!navigator.gamepads);
  ext.gamepads = [];

  ext.stickDirection = [
		{left: 90, right: 90},
		{left: 90, right: 90},
		{left: 90, right: 90},
		{left: 90, right: 90}
	];

  ext.tick = function() {
    ext.gamepads = (navigator.getGamepads &&
                   navigator.getGamepads());
    window.requestAnimationFrame(ext.tick);
  };
  if (ext.gamepadSupport) window.requestAnimationFrame(ext.tick);

  ext._shutdown = function() {};

  ext._getStatus = function() {
    if (!ext.gamepadSupport) return {
      status: 1,
      msg: "Please use a recent version of Google Chrome",
    };

    if (ext.gamepads.length == 0) return {
      status: 1,
      msg: "Please plug in a gamepad and press any button",
    };

    return {
      status: 2,
      msg: "Ready : " + ext.gamepads.length + " gamepad(s) detected.",
    };
  };

  ext.installed = function() {
    return true;
  }

  ext.getButton = function(name, gamepad) {
		var gamepadIdx = +gamepad - 1;
		if (gamepadIdx >= ext.gamepads.length)
			return false;
		
    var index = buttonNames[name];
    var button = ext.gamepads[gamepadIdx].buttons[index];
    return button.pressed;
  };

  ext.getStick = function(what, stick, gamepad) {
		var gamepadIdx = +gamepad - 1;		
		if (gamepadIdx >= ext.gamepads.length)
			return 0;
		
    var x, y;
    switch (stick) {
      case "left":  x = ext.gamepads[gamepadIdx].axes[0]; y = -ext.gamepads[gamepadIdx].axes[1]; break;
      case "right": x = ext.gamepads[gamepadIdx].axes[2]; y = -ext.gamepads[gamepadIdx].axes[3]; break;
    }
    if (-DEADZONE < x && x < DEADZONE) x = 0;
    if (-DEADZONE < y && y < DEADZONE) y = 0;

    switch (what) {
      case "direction":
        if (x === 0 && y === 0) {
          // report the stick's previous direction
          return ext.stickDirection[gamepadIdx][stick];
        }
        var value = 180 * Math.atan2(x, y) / Math.PI;
        ext.stickDirection[gamepadIdx][stick] = value;
        return value;
      case "force":
        return Math.sqrt(x*x + y*y) * 100;
    }
  };

  var descriptor = {
    blocks: [
      ["b", "Gamepad Extension installed?", "installed"],
      ["b", "button %m.button pressed on gamepad %m.gamepad?", "getButton", "X", "1"],
      ["r", "%m.axisValue of %m.stick stick on gamepad %m.gamepad", "getStick", "direction", "left", "1"],
    ],
    menus: {
      button: buttonMenu,
      stick: ["left", "right"],
      axisValue: ["direction", "force"],
			gamepad: ["1", "2", "3", "4"]
    },
  };

  ScratchExtensions.register("Gamepad", descriptor, ext);

})({});

