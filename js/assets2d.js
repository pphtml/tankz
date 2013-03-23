var BaseAsset = function() {
			
};
//BaseAsset.prototype.atlas_data = data;
//BaseAsset.prototype.atlas_image = spritesImage;

var TankAsset = function() {
	this.yOffset = -6;
	this.draw = function(dctx, tank) {
		var spriteIndex = tank.spriteIndex(); 
		var name = 'tank' + (spriteIndex < 10 ? '0' : '') + spriteIndex + '.png';
		var img = this.atlas_data[name];
		if (!img) {
			console.error('Missing sprite ' + name);
		} else {
			//console.info(img);
			dctx.ctx.drawImage(this.atlas_image, img.x, img.y, img.w, img.h, tank.x + img.cx, tank.y + img.cy + this.yOffset, img.w, img.h);
		}
		
		if (typeof tank.path != 'undefined') {
			//console.info("xxxxxxxxxxxxxxxx " + dctx.grid);
			for(var i = 0, count = tank.path.length; i < count; i++) {
			    var node = tank.path[i];
			    //console.info(node.x, node.y);
			    var pixelCoords = dctx.grid.locatePixelCoords(node.x, node.y);
			    var context = dctx.ctx;
			    context.beginPath();
			    context.arc(pixelCoords.x, pixelCoords.y, 4, 0 , 2 * Math.PI, false);
			    context.fillStyle = 'green';
			    context.fill();
			    context.lineWidth = 1;
			    context.strokeStyle = '#003300';
			    context.stroke();
			}
		}
	};
};
TankAsset.prototype = new BaseAsset();
var tank_asset = new TankAsset();

var GenericUnit = function() {
	
};

GenericUnit.prototype.moveTo = function(gridX, gridY, graph) {
    var start = graph.nodes[this.gridX][this.gridY];
    var end = graph.nodes[gridX][gridY];
    var path = astar.search(graph.nodes, start, end, true);
    this.path = path;
};

GenericUnit.prototype.directions = {
	0: [1.0, 0.0],
	45: [0.7, -0.7],
	90: [0.0, -1.0],
	135: [-0.7, -0.7],
	180: [-1.0, 0.0],
	225: [-0.7, 0.7],
	270: [0.0, 1.0],
	315: [0.7, 0.7]
};

var Tank = function() {
	this.asset = tank_asset;
	
	this.draw = function(dctx) { 
		this.asset.draw(dctx, this);
	};
	
	this.spriteIndex = function() {
		var result = Math.floor((this.rotation + 5.625) / 11.25);
		result = result % 32;
		return result;
	};
	
	this.computeMovementDeltas = function(dctx) {
		var dpx = parseFloat(dctx.grid.pixelsPerTileX) / 20;
		var dpy = parseFloat(dctx.grid.pixelsPerTileY) / 20;
		var dirFactors = this.directions[this.rotation];
		if (dirFactors == null) {
			console.error("Unknown direction " + this.rotation);
		}
		return {x: dpx * dirFactors[0], y: dpy * dirFactors[1]};
	};
	
	this.tick = function(timeDelta, dctx) { // todo premistit do generic unit
		if (typeof this.movegrid != 'undefined') {
			this.x += this.movegrid.dx;
			this.y += this.movegrid.dy;
			if (this.movegrid.reached(this.x, this.y)) {
				this.x = this.movegrid.targetX;
				this.y = this.movegrid.targetY;
				delete this.movegrid;
				delete this.path;
			}
			var gridCoords = dctx.grid.locateGridCoords(this.x, this.y);
			this.gridX = gridCoords.x; 
			this.gridY = gridCoords.y;
		} else if (typeof this.path != 'undefined' && this.path.length > 0) {
			var node = this.path.splice(0, 1)[0];
			var pixelCoords = dctx.grid.locatePixelCoords(node.x, node.y);
			// todo pocitat jenom pri prechodu na novou bunku
			var angle = dctx.angle.compute(node.x - this.gridX, this.gridY - node.y);
			//var angle = dctx.angle.compute(pixelCoords.x - this.x, this.y - pixelCoords.y);
			this.rotation = angle;

			// todo kontrolovat obsazenost bunky
//			this.x = pixelCoords.x;
//			this.y = pixelCoords.y;
//			this.gridX = node.x;
//			this.gridY = node.y;
//			var addingX = pixelCoords.x > this.x ? 1 : pixelCoords.x < this.x ? -1 : 0;
//			var addingY = pixelCoords.y > this.y ? 1 : pixelCoords.y < this.y ? -1 : 0;
			var deltas = this.computeMovementDeltas(dctx);
			this.movegrid = {
				//addingX: addingX,
				//addingY: addingY,
				dx: deltas.x,
				dy: deltas.y,
				reached: function(x, y) { return (this.dx > 0 && x >= this.targetX) ||
					(this.dx < 0 && x <= this.targetX) ||
					(this.dy > 0 && y >= this.targetY) ||
					(this.dy < 0 && y <= this.targetY); },
				targetX: pixelCoords.x,
				targetY: pixelCoords.y
			};
		}
	};
};
Tank.prototype = new GenericUnit();


