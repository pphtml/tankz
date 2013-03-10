// SUMMARY: Draws rectangles on a canvas.




// A. WINDOW LOAD function.                      

window.onload = function()
{
	var data = SpriteSheetClass.parseAtlasDefinition(sprite_data);
	console.info(data);
	BaseAsset.prototype.atlas_data = data;
	//var parsed = JSON.parse(sprite_data);
	spritesImage = loadImage("img/tanks.png");

	function loadImage(url) {
		image = new Image();
		image.addEventListener("load", imageLoaded, false);
		image.src = url;
		return image;
	}
	
	canvas  = document.getElementById("canvasArea"); 
	context = canvas.getContext("2d");

	function imageLoaded() {
		BaseAsset.prototype.atlas_image = spritesImage;
		console.info(data);
		//context.drawImage(spritesImage, 0, 0);
		var myTank = new Tank();
		//myTank.x = 300;
		//myTank.y = 200;
		myTank.draw(context);
//		console.info('data ' + myTank.atlas_data);
//		console.info('image ' + myTank.atlas_image);
//		console.info(myTank.atlas_data["tank_00.png"]);
	}
	
	
	
   // A1. CANVAS definition standard variables.            







      // A2. LAYOUT of first rectangle.
      var xPos  = 20;     var yPos   = 20;

      var width = 100;    var height = 50;

      // A3. DISPLAY rectangles.
      context.fillStyle   = "hotpink";
      context.fillRect      (xPos,     yPos,    width,    height); 
      context.lineWidth   = 4;
      context.strokeStyle = "royalblue";
      context.strokeRect    (xPos+130, yPos,    width,    height);
      context.fillStyle   = "darkorange";
      context.fillRect      (xPos+260, yPos,    width,    height);
      context.clearRect     (xPos+285, yPos+10, width-50, height-20);               

};
