var BaseAsset = function() {
			
};
//BaseAsset.prototype.atlas_data = data;
//BaseAsset.prototype.atlas_image = spritesImage;

var TankAsset = function() {
	this.draw = function(ctx, tank) {
		var spriteIndex = tank.spriteIndex(); 
		var name = 'tank_' + (spriteIndex < 10 ? '0' : '') + spriteIndex + '.png';
		var img = this.atlas_data[name];
		if (!img) {
			console.error('Missing sprite ' + name);
		} else {
			console.info(img);
			ctx.drawImage(this.atlas_image, img.x, img.y, img.w, img.h, tank.x + img.cx, tank.y + img.cy, img.w, img.h);
		}
	};
};
TankAsset.prototype = new BaseAsset();
var tank_asset = new TankAsset();

var Tank = function() {
	this.asset = tank_asset;
	
	this.draw = function(ctx) { 
		this.asset.draw(ctx, this);
	};
	
	this.spriteIndex = function() {
		var result = Math.floor((this.rotation + 5.625) / 11.25);
		result = result % 32;
		return result;
	};
};


