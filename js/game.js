function testPath() {
	btn_test_path  = document.getElementById("btn_test_path");
	btn_test_path.onclick = function() {
		var graph = new Graph([
		                       [1,1,1,1],
		                       [0,1,1,0],
		                       [0,0,1,1]
		                   ]);
       var start = graph.nodes[0][0];
       var end = graph.nodes[1][2];
       var result = astar.search(graph.nodes, start, end);
       // result is an array containing the shortest path

       var resultWithDiagonals = astar.search(graph.nodes, start, end, true);
       console.info(result);
       console.info(resultWithDiagonals);
	};
}; 

var angleUnit = new (function() {
	this.compute_angle = function (dx, dy) {
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

var Game = function() {
	var selected_assets = [];
	var canvas = null;
	var context = null;

	this.init = function() {
		canvas  = document.getElementById("canvasArea"); 
		context = canvas.getContext("2d");
		canvas.addEventListener("mousedown", onMouseDown, false);  
		
		spawnUnits();
		drawScene();
	};
	
	var spawnUnits = function() {
		var myTank = new Tank();
		myTank.x = 300;
		myTank.y = 200;
		myTank.rotation = 45;
		selected_assets.push(myTank);
	};

	var drawUnits = function() {
		for (key in selected_assets) { // todo prekreslit vsechny
			var asset = selected_assets[key];
			asset.draw(context);
		} 
	};
	
	var drawScene = function() {
		canvas.width = canvas.width; 
		drawGrid();
		drawUnits();
	};
	
	var drawGrid = function() {
		for (var x = 0; x <= 50; x++) {
			var cx = 0.5 + x * 20;
			context.moveTo(cx, 0);
			context.lineTo(cx, canvas.height);
			context.stroke();
		}

		for (var y = 0; y <= 36; y++) {
			var cy = 0.5 + y * 20;
			context.moveTo(0, cy);
			context.lineTo(canvas.width, cy);
			context.stroke();
		}
	};
	
	var onMouseDown = function(e) {
		var coords = {x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft, 
		  y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop}; 
		
		var angle = angleUnit.compute_angle(coords.x - 300, 200 - coords.y);
		
		for (key in selected_assets) { // todo prekreslit vsechny
			var asset = selected_assets[key];
			asset.rotation = angle;
		} 
		
		drawScene(); // TODO vyhodit, bude reseno tickerem
	};
};
var game = new Game();

function browserInit() {
	testPath(); // todo vyhodit

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
