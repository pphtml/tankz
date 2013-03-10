var BaseAsset = function() {
			
};
//BaseAsset.prototype.atlas_data = data;
//BaseAsset.prototype.atlas_image = spritesImage;

var TankAsset = function() {
	this.draw = function(ctx, tank) {
		var name = 'tank_0' + tank.rotation + '.png';
		var img = this.atlas_data[name];
		console.info(img);
		//ctx.drawImage(this.atlas_image, tank.x, tank.y);
		ctx.drawImage(this.atlas_image, img.x, img.y, img.w, img.h, tank.x, tank.y, img.w, img.h);
	};
};
TankAsset.prototype = new BaseAsset();
var tank_asset = new TankAsset();

var Tank = function() {
	this.asset = tank_asset;
	this.x = 300;
	this.y = 200;
	this.rotation = 8;
	
	this.draw = function(ctx) { 
		this.asset.draw(ctx, this);
	};
};


