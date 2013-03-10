// SUMMARY: Draws rectangles on a canvas.




// A. WINDOW LOAD function.                      

window.onload = function() {
	BaseAsset.prototype.atlas_data = SpriteSheetClass.parseAtlasDefinition(sprite_data);
	spritesImage = loadImage("img/tanks.png");

	function loadImage(url) {
		image = new Image();
		image.addEventListener("load", imageLoaded, false);
		image.src = url;
		return image;
	}
	
	canvas  = document.getElementById("canvasArea"); 
	context = canvas.getContext("2d");
	canvas.addEventListener("mousedown", onMouseDown, false);  

//	function getCursorPosition(canvas, event) {
//		var x, y;
//
//		canoffset = canvas.offset();
//		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
//		y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
//
//		return [x,y];
//	}

	function onMouseDown(e) {
		var coords = {x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft, 
		  y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop}; 
		
		console.info(coords);
	}


	function imageLoaded() {
		BaseAsset.prototype.atlas_image = spritesImage;
		//context.drawImage(spritesImage, 0, 0);
		
		context.moveTo(300.5,0);
		context.lineTo(300.5,700);
		context.stroke();

		context.moveTo(0,200.5);
		context.lineTo(2000,200.5);
		context.stroke();

		var myTank = new Tank();
		myTank.x = 300;
		myTank.y = 200;
		myTank.rotation = 45;

		myTank.draw(context);
	}
};
