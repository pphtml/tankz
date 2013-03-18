var BaseAsset = function() {
			
};
//BaseAsset.prototype.atlas_data = data;
//BaseAsset.prototype.atlas_image = spritesImage;

var TankAsset = function() {
	this.draw = function(dctx, tank) {
		var spriteIndex = tank.spriteIndex(); 
		var name = 'tank' + (spriteIndex < 10 ? '0' : '') + spriteIndex + '.png';
		var img = this.atlas_data[name];
		if (!img) {
			console.error('Missing sprite ' + name);
		} else {
			//console.info(img);
			dctx.ctx.drawImage(this.atlas_image, img.x, img.y, img.w, img.h, tank.x + img.cx, tank.y + img.cy, img.w, img.h);
		}
		
		if (typeof tank.path != 'undefined') {
			//console.info("xxxxxxxxxxxxxxxx " + dctx.grid);
			for(var i = 0, count = tank.path.length; i < count; i++) {
			    var node = tank.path[i];
			    //console.info(node.x, node.y);
			    var pixelCoords = dctx.grid.pixelCoords(node.x, node.y);
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
	
	this.tick = function(timeDelta, dctx) { // todo premistit do generic unit
		if (typeof this.path != 'undefined' && this.path.length > 0) {
			var node = this.path.splice(0, 1)[0];
			var pixelCoords = dctx.grid.pixelCoords(node.x, node.y);
			// todo pocitat jenom pri prechodu na novou bunku
			var angle = dctx.angle.compute(pixelCoords.x - this.x, this.y - pixelCoords.y);
			this.rotation = angle;

			
			// todo kontrolovat obsazenost bunky
			this.x = pixelCoords.x;
			this.y = pixelCoords.y;
			this.gridX = node.x;
			this.gridY = node.y;
		}
	};
};
Tank.prototype = new GenericUnit();


