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

var Grid = function(width, height, pixelsPerTileX, pixelsPerTileY) {
    this.width = width;
    this.height = height;
    this.pixelsPerTileX = pixelsPerTileX;
    this.pixelsPerTileY = pixelsPerTileY;
    this.graph = (function() {
//        var rows = new Array();
//        for (var y = 0; y < height; y++) {
//            var cells = new Array();
//            for (var x = 0; x < width; x++) {
//                cells.push(1); // 1 pruchozi
//            }
//            rows.push(cells);
//        }
        var cells = new Array();
        for (var x = 0; x < width; x++) {
            var row = new Array();
            for (var y = 0; y < height; y++) {
                row.push(1); // 1 pruchozi
            }
            cells.push(row);
        }
        
        for (var i = 10; i < 36; i++) {
            cells[12][i] = 0;
            cells[50-12][35-i] = 0;
        }
        return new Graph(cells);
    })();
    
    this.computeGridHeight = function() {
        return this.height * this.pixelsPerTileY;
    };

    this.draw = function(context, canvas) {
        var height = canvas.height;
        var width = canvas.width;

        for ( var x = 0; x <= this.width; x++) {
            var cx = 0.5 + x * this.pixelsPerTileX;
            context.moveTo(cx, 0);
            context.lineTo(cx, height);
            context.stroke();
        }

        for ( var y = 0; y <= this.height; y++) {
            var cy = 0.5 + y * this.pixelsPerTileY;
            context.moveTo(0, cy);
            context.lineTo(width, cy);
            context.stroke();
        }
        
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var node = this.graph.nodes[x][y];
                if (node.type == 0) {
                    context.beginPath();
                    var xPos = x * pixelsPerTileX;
                    var yPos = y * pixelsPerTileY;
                    context.rect(xPos, yPos, pixelsPerTileX, pixelsPerTileY);
                    context.fillStyle = 'black';
                    context.fill();
                    context.stroke();
                }
            }
        }
    };
    
    this.locatePixelCoords = function(gridX, gridY) {
        var x = (0.5 + gridX) * this.pixelsPerTileX; 
        var y = (0.5 + gridY) * this.pixelsPerTileY;
        return {x: parseFloat(x), y: parseFloat(y)}; // todo vyhodit parsovani
    };
    
    this.locateGridCoords = function(x, y) {
        var gridX = parseInt(x / this.pixelsPerTileX);
        var gridY = parseInt(y / this.pixelsPerTileY);
        return {x: gridX, y: gridY};
    };

    this.spawn = function(gridX, gridY, unit) {
        //var x = (0.5 + gridX) * this.pixelsPerTile; 
        //var y = (0.5 + gridY) * this.pixelsPerTile;
        var pixelCoords = this.locatePixelCoords(gridX, gridY);
        unit.x = pixelCoords.x;
        unit.y = pixelCoords.y;
        unit.gridX = gridX;
        unit.gridY = gridY;
        return unit;
    };
};

var Game = function() {
    var selected_assets = [];
    var allAssets = [];
    var canvas = null;
    var context = null;
    var grid = null;
    var pixelsPerTileX = 20;
    var pixelsPerTileY = 18;
    var dctx = null;
    
    var initializeStaticCanvas = function() {
        staticCanvas = document.getElementById("canvasStatic");
        var context = staticCanvas.getContext("2d");
        grid.draw(context, staticCanvas);
    };

    var outer = this;

    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          console.info("setting callback");
          window.setTimeout(callback, 1000 / 60);
        };
      })();

    this.animate = function() {
        if (this.tick()) {
            // redraw only when at least something moved
            this.drawScene();
        }
        requestAnimFrame(function() {
            outer.animate();
        });
    };
    
    var getMousePos = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    };
    
    var onMouseDown = function(e) {
//        var coords = {x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - canvas.offsetLeft, 
//          y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop - canvas.offsetTop}; 
        var coords = getMousePos(e);
        
        var gridCoords = grid.locateGridCoords(coords.x, coords.y);
        for (key in selected_assets) { // todo prekreslit vsechny
            var unit = selected_assets[key];
            unit.moveTo(gridCoords.x, gridCoords.y, grid.graph);
            
//            var angle = angleUnit.compute_angle(coords.x - unit.x, unit.y - coords.y);
//            unit.rotation = angle;
        } 
    };
    
    var spawnUnits = function() {
        var myTank = grid.spawn(20, 2, new Tank());
        myTank.rotation = 45;
//        if (myTank.x % 1 === 0) {
//            console.error("X coordinate is not a float");
//        }
        
        selected_assets.push(myTank); // todo vyhodit
        allAssets.push(myTank);
    };
    
    this.init = function() {
        canvas = document.getElementById("canvasArea");
        context = canvas.getContext("2d");
        canvas.addEventListener("mousedown", onMouseDown, false);  
        
        grid = new Grid(50, 36, pixelsPerTileX, pixelsPerTileY); // todo dat jenom na jedno misto
        var height = grid.computeGridHeight() + 1;
        canvas.height = height;
        document.getElementById("canvasStatic").height = height;
        document.getElementById("container").style.height = height + "px";        
        dctx = {ctx: context, canvas: canvas, grid: grid, angle: angleUnit};
        spawnUnits();
        initializeStaticCanvas();
        this.drawScene();
        
        requestAnimFrame(function() {
            outer.animate();
        });
    };
    
    var drawUnits = function() {
        for (key in selected_assets) { // todo prekreslit vsechny
            var asset = selected_assets[key];
            asset.draw(dctx);
        } 
    };
    
    this.drawScene = function() {
        //var start = (new Date()).getTime();
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawUnits();
        //var end = (new Date()).getTime();
        //console.info('drawScene took ' + (end - start));
    };    
    
    this.tick = function() {
        var now = (new Date).getTime();
        var timeDelta = parseFloat(now - this.lastTick) / 1000;
        this.lastTick = now;
        //console.info(timeDelta);
        var moved = false;
        
        for(var i = 0, count = allAssets.length; i < count; i++) {
            moved = moved || allAssets[i].tick(timeDelta, dctx);
        }
        
        return moved;
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
