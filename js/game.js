var angleUnit = new (function() {
	this.compute = function (dx, dy) {
	    if (dx == 0) {
	        return dy >= 0 ? 90.0 : 270.0;
	    }
	    var tanx = parseFloat(dy) / dx;
	    var atanx = Math.atan(tanx); 
	    var anglex = atanx * 180.0 / Math.PI;
	    if (dx < 0.0) {
	        anglex = 180.0 + anglex;
	    } else if (dy < 0) {
	        anglex = 360.0 + anglex;
	    }
	    return anglex;
	};
})();

var Grid = function(width, height, pixelsPerTile) {
	this.width = width;
	this.height = height;
	this.pixelsPerTile = pixelsPerTile;
	this.graph = (function() {
//		var rows = new Array();
//		for (var y = 0; y < height; y++) {
//			var cells = new Array();
//			for (var x = 0; x < width; x++) {
//				cells.push(1); // 1 pruchozi
//			}
//			rows.push(cells);
//		}
		var cells = new Array();
		for (var x = 0; x < width; x++) {
			var row = new Array();
			for (var y = 0; y < height; y++) {
				row.push(1); // 1 pruchozi
			}
			cells.push(row);
		}
		return new Graph(cells);
	})();
	
	this.draw = function(context, canvas) {
		for (var x = 0; x <= this.width; x++) {
			var cx = 0.5 + x * this.pixelsPerTile;
			context.moveTo(cx, 0);
			context.lineTo(cx, canvas.height);
			context.stroke();
		}

		for (var y = 0; y <= this.height; y++) {
			var cy = 0.5 + y * this.pixelsPerTile;
			context.moveTo(0, cy);
			context.lineTo(canvas.width, cy);
			context.stroke();
		}
	};
	
	this.pixelCoords = function(gridX, gridY) {
		var x = (0.5 + gridX) * this.pixelsPerTile; 
		var y = (0.5 + gridY) * this.pixelsPerTile;
		return {x: x, y: y};
	};
	
	this.spawn = function(gridX, gridY, unit) {
		//var x = (0.5 + gridX) * this.pixelsPerTile; 
		//var y = (0.5 + gridY) * this.pixelsPerTile;
		var pixelCoords = this.pixelCoords(gridX, gridY);
		unit.x = pixelCoords.x;
		unit.y = pixelCoords.y;
		unit.gridX = gridX;
		unit.gridY = gridY;
		return unit;
	};
	
	this.locateCoords = function(x, y) {
		var gridX = parseInt(x / this.pixelsPerTile);
		var gridY = parseInt(y / this.pixelsPerTile);
		return {x: gridX, y: gridY};
	};
};

var Game = function() {
	var selected_assets = [];
	var allAssets = [];
	var canvas = null;
	var context = null;
	var grid = null;
	var pixelsPerTile = 20;
	var dctx = null;
	var intervalId = null;
	var fps = 2;

	this.init = function() {
		canvas  = document.getElementById("canvasArea"); 
		context = canvas.getContext("2d");
		canvas.addEventListener("mousedown", onMouseDown, false);  
		
		grid = new Grid(50, 36, pixelsPerTile); // todo dat jenom na jedno misto
		dctx = {ctx: context, canvas: canvas, grid: grid, angle: angleUnit};
		spawnUnits();
		intervalId = setInterval(this.run, 1000 / fps);
	};
	
	var spawnUnits = function() {
		var myTank = grid.spawn(20, 2, new Tank());
		myTank.rotation = 45;
		selected_assets.push(myTank); // todo vyhodit
		allAssets.push(myTank);
	};

	var drawUnits = function() {
		for (key in selected_assets) { // todo prekreslit vsechny
			var asset = selected_assets[key];
			asset.draw(dctx);
		} 
	};
	
	this.drawScene = function() {
		canvas.width = canvas.width; 
		grid.draw(context, canvas);
		drawUnits();
	};	
	
	var onMouseDown = function(e) {
		var coords = {x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft, 
		  y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop}; 

		var gridCoords = grid.locateCoords(coords.x, coords.y);
		for (key in selected_assets) { // todo prekreslit vsechny
			var unit = selected_assets[key];
			unit.moveTo(gridCoords.x, gridCoords.y, grid.graph);
			
//			var angle = angleUnit.compute_angle(coords.x - unit.x, unit.y - coords.y);
//			unit.rotation = angle;
		} 
	};
	
	var outer = this; // todo vycistit
	this.run = (function() {
		  //var loops = 0, skipTicks = 1000 / outer.fps,
	      //maxFrameSkip = 10,
	      //nextGameTick = (new Date).getTime();
		  outer.lastTick = (new Date).getTime();
	  
		  return function() {
		    //loops = 0;
		    
		    //while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
		      outer.tick();
		      //nextGameTick += skipTicks;
		      //loops++;
		    //}
		    
		    outer.drawScene();
		  };
		})();
	
	this.tick = function() {
		var now = (new Date).getTime();
		var timeDelta = now - this.lastTick;
		this.lastTick = now;
		console.info(timeDelta);
		
		for(var i = 0, count = allAssets.length; i < count; i++) {
			allAssets[i].tick(timeDelta, dctx);
		}
	};
};
var game = new Game();

function browserInit() {
	if (document.addEventListener) {
		document.addEventListener('contextmenu', function(e) {
			e.preventDefault();
		}, false);
	} else {
		document.attachEvent('oncontextmenu', function() {
			window.event.returnValue = false;
		});
	}

	BaseAsset.prototype.atlas_data = SpriteSheetClass.parseAtlasDefinition(sprite_data);
	spritesImage = loadImage("img/tanks.png");
	
	function loadImage(url) {
		image = new Image();
		image.addEventListener("load", imageLoaded, false);
		image.src = url;
		return image;
	}
	
	function imageLoaded() {
		BaseAsset.prototype.atlas_image = spritesImage;
		game.init();
	}
};

window.onload = function() {
	browserInit();
};
