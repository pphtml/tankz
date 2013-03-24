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
    delete this.movegrid;
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
	this.gridSpeed = 10.0; // grid/s
	
	this.draw = function(dctx) { 
		this.asset.draw(dctx, this);
	};
	
	this.spriteIndex = function() {
		var result = Math.floor((this.rotation + 5.625) / 11.25);
		result = result % 32;
		return result;
	};
	
	this.computeMovementDeltas = function(timeDelta, dctx) {
		var speedFactor = this.gridSpeed * timeDelta;
		var dpx = parseFloat(dctx.grid.pixelsPerTileX) * speedFactor;
		var dpy = parseFloat(dctx.grid.pixelsPerTileY) * speedFactor;
		var dirFactors = this.directions[this.rotation];
		if (dirFactors == null) {
			console.error("Unknown direction " + this.rotation);
		}
		return {x: dpx * dirFactors[0], y: dpy * dirFactors[1]};
	};

	this.innerGridTick = function(timeDelta, dctx) {
//		if (!(this.x % 1 === 0)) {
//			console.error("X coordinate is a float");
//		}
		var moved = false;
		var finished = false;
		var remainingDelta = 0.0;
		if (typeof this.movegrid != 'undefined') {
			moved = true;
			var deltas = this.computeMovementDeltas(timeDelta, dctx);
//			this.x = parseFloat(this.x) + deltas.x; 
//			this.y = parseFloat(this.y) + deltas.y;
			this.x += deltas.x; 
			this.y += deltas.y;
			var residuum = this.movegrid.deltaResiduum(this.x, this.y, deltas.x, deltas.y);
			if (residuum > 0.0) {
				console.info("residuum found " + residuum + " from " + timeDelta);
				this.x = this.movegrid.targetX;
				this.y = this.movegrid.targetY;
				finished = true;
				remainingDelta = residuum;
			}
			var gridCoords = dctx.grid.locateGridCoords(this.x, this.y);
			this.gridX = gridCoords.x; 
			this.gridY = gridCoords.y;
		}
		return { moved: moved, finished: finished, delta: remainingDelta };
	};
	
	this.tick = function(timeDelta, dctx) { // todo premistit do generic unit
		var moved = false;
		
		if (typeof this.movegrid == 'undefined' && typeof this.path != 'undefined' && this.path.length > 0) {
			var node = this.path.splice(0, 1)[0];
			var pixelCoords = dctx.grid.locatePixelCoords(node.x, node.y);
			// todo pocitat jenom pri prechodu na novou bunku
			var angle = dctx.angle.compute(node.x - this.gridX, this.gridY - node.y);
			//var angle = dctx.angle.compute(pixelCoords.x - this.x, this.y - pixelCoords.y);
			//console.info("changing rotation to " + angle);
			this.rotation = angle;

			// todo kontrolovat obsazenost bunky
//			this.x = pixelCoords.x;
//			this.y = pixelCoords.y;
//			this.gridX = node.x;
//			this.gridY = node.y;
//			var addingX = pixelCoords.x > this.x ? 1 : pixelCoords.x < this.x ? -1 : 0;
//			var addingY = pixelCoords.y > this.y ? 1 : pixelCoords.y < this.y ? -1 : 0;
			this.movegrid = {
				addingX: pixelCoords.x > this.x ? 1 : pixelCoords.x < this.x ? -1 : 0,
				addingY: pixelCoords.y > this.y ? 1 : pixelCoords.y < this.y ? -1 : 0,
//				dx: deltas.x,
//				dy: deltas.y,
//				reached: function(x, y) { return (this.addingX > 0 && x >= this.targetX) ||
//					(this.addingX < 0 && x <= this.targetX) ||
//					(this.addingY > 0 && y >= this.targetY) ||
//					(this.addingY < 0 && y <= this.targetY); },
				deltaResiduum: function(x, y, dx, dy) {
					var result = 0.0;
					if ((this.addingX > 0 && x >= this.targetX) || (this.addingX < 0 && x <= this.targetX)) {
						result = dx * (x - this.targetX);
					} else if ((this.addingY > 0 && y >= this.targetY) || (this.addingY < 0 && y <= this.targetY)) {
						result = dy * (y - this.targetY);
					}
					return result;
				},
				targetX: pixelCoords.x,
				targetY: pixelCoords.y
			};
		}

		var innerTickResult = this.innerGridTick(timeDelta, dctx);
		if (innerTickResult.finished) {
			delete this.movegrid;
		}

		moved = moved || innerTickResult.moved;
		
		if (innerTickResult.remainingDelta > 0.0) {
			console.info("blbe animovany :(");
		}
		
		return moved;
	};
};
Tank.prototype = new GenericUnit();


