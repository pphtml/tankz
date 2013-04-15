var angleUnit = new (function() {
    this.compute = function (dx, dy) {
        var angle = null;
        if (dx == 0) {
            angle = dy >= 0 ? 90.0 : 270.0;
        } else {
            var tanx = parseFloat(dy) / dx;
            var atanx = Math.atan(tanx); 
            var angle = atanx * 180.0 / Math.PI;
            if (dx < 0.0) {
                angle = 180.0 + angle;
            } else if (dy < 0) {
                angle = 360.0 + angle;
            }
        }
        //angle += 45; // because of isometric projection
        return angle % 360;
    };
})();

var Grid = function(width, height, pixelsPerTileX, pixelsPerTileY, allAssets) {
    var spawnUnitId = 1;
    var dictCellToUnit = new BiDiMap();
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
                row.push(GraphNodeType.OPEN); // 1 pruchozi
            }
            cells.push(row);
        }
        
        for (var i = 16; i < 36; i++) {
            cells[7][i] = GraphNodeType.WALL;
            cells[49-7][35-i] = GraphNodeType.WALL;
        }
        for (var i = 4; i < 20; i++) {
            cells[i][7] = GraphNodeType.WALL;
            cells[49-i][35-7] = GraphNodeType.WALL;
        }

        return new Graph(cells);
    })();
    
    this.computeGridHeight = function() {
        return this.height * this.pixelsPerTileY;
    };
    
    this.moveUnit = function(unit, oldX, oldY, newX, newY) {
        // todo check if old grid was alredy free
        // todo check if new grid is free
        var moved = false;
        if (this.graph.nodes[newX][newY].free()) {
//            this.graph.nodes[oldX][oldY].type = CellEnum.FREE;
//            this.graph.nodes[newX][newY].type = CellEnum.UNIT;
            this.removeUnit(unit, oldX, oldY);
            this.putUnit(unit, newX, newY);
            moved = true;
        };
        return moved;
    };

    this.draw = function(ctx, sceneContext) {
//        ctx.translate(0, canvas.height / 2);
//        ctx.scale(1, 0.5);
//        ctx.rotate(-Math.PI / 4);
//        
        var height = sceneContext.height;
        var width = sceneContext.width;

        for ( var x = 0; x <= this.width; x++) {
            var cx = 0.5 + x * this.pixelsPerTileX;
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, height);
            ctx.stroke();
        }

        for ( var y = 0; y <= this.height; y++) {
            var cy = 0.5 + y * this.pixelsPerTileY;
            ctx.moveTo(0, cy);
            ctx.lineTo(width, cy);
            ctx.stroke();
        }
        
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var node = this.graph.nodes[x][y];
                if (node.type == 0) {
                    ctx.beginPath();
                    var xPos = x * pixelsPerTileX;
                    var yPos = y * pixelsPerTileY;
                    ctx.rect(xPos, yPos, pixelsPerTileX, pixelsPerTileY);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                    ctx.stroke();
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
        unit.id = spawnUnitId++;
        
        this.putUnit(unit, gridX, gridY);
        return unit;
    };
    
    this.cellKey = function(x, y) {
        return x + "," + y;
    };
    
    this.putUnit = function(unit, x, y) {
        dictCellToUnit.putKeyValue(this.cellKey(x, y), unit.id);
    };
    
    this.removeUnit = function(unit, x, y) {
        dictCellToUnit.removeValue(unit);
    };
    
    this.isCellFree = function(x, y) {
//        if (x == 30 && y == 2) {
//            console.info("jj");
//            console.info(dictCellToUnit);
//        }
        return !dictCellToUnit.containsKey(this.cellKey(x, y));
    };
    
//    this.findUnitIdFromCell = function(x, y) {
//        return dictCellToUnit.getValueForKey(this.cellKey(x, y));
//    };
    
    this.hasMovingUnit = function(x, y) {
        var movingUnitId = dictCellToUnit.getValueForKey(this.cellKey(x, y));
        var unit = allAssets[movingUnitId];
        var moving = (unit != null && unit.isMoving());
        return moving;
    };
};

//var applyIsofication = function(ctx, canvas) {
//    ctx.translate(0, canvas.height / 2);
//    ctx.scale(1, 0.5);
//    ctx.rotate(-Math.PI / 4);
//};

var dispCtx = {
    tx: 0,
    ty: 360
};

var isoUnit = new (function() {
    this.toIso = function(x, y) {
        var isoX = dispCtx.tx + x + y;
        var isoY = dispCtx.ty + (y - x) / 2;
        return {x: isoX, y: isoY};
    };
    
    this.fromIso = function (isoX, isoY) {
        var x = (isoX - dispCtx.tx) / 2 + dispCtx.ty - isoY;
        var y = isoX - dispCtx.tx - x;
        return {x: x, y: y};
    };
})();

var IsofiedContext = function(context) {
    this.context = context;
    this.moveTo = function(x, y) {var pos = isoUnit.toIso(x, y); this.context.moveTo(pos.x, pos.y);};
    this.lineTo = function(x, y) {var pos = isoUnit.toIso(x, y); this.context.lineTo(pos.x, pos.y);};
    this.stroke = function() {this.context.stroke();};
    this.beginPath = function() {this.context.beginPath();};
    this.rect = function(x, y, w, h) {
        var vert0 = isoUnit.toIso(x, y);
        var vert1 = isoUnit.toIso(x + w, y);
        var vert2 = isoUnit.toIso(x + w, y + h);
        var vert3 = isoUnit.toIso(x, y + h);
        this.context.moveTo(vert0.x, vert0.y);
        this.context.lineTo(vert1.x, vert1.y);
        this.context.lineTo(vert2.x, vert2.y);
        this.context.lineTo(vert3.x, vert3.y);
        this.context.closePath();
    };
    this.__defineGetter__("fillStyle", function() { return this.context.fillStyle; });
    this.__defineSetter__("fillStyle", function(style) { this.context.fillStyle = style; });
    this.fill = function() {this.context.fill();};
    this.drawImageEx = function(img, imgX, imgY, imgW, imgH, x, y, w, h, yOffset) {
        yOffset = typeof yOffset !== 'undefined' ? yOffset : 0;
        var pos = isoUnit.toIso(x, y); 
        this.context.drawImage(img, imgX, imgY, imgW, imgH, pos.x - w/2, pos.y - h/2 + yOffset, w, h);
    };
    this.arc = function(x, y, r, sa, ea, ccw) {
        var pos = isoUnit.toIso(x, y); 
        this.context.arc(pos.x, pos.y, r, sa, ea, ccw);
    };
//    this.drawEllipse = function(x, y, radius) {
//        this.context.save();
//        var pos = isoUnit.toIso(x, y);
//        this.context.translate(pos.y, pos.y);
//        this.context.scale(1.0, 1.0);
//        this.context.beginPath();
//        //this.context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
//        this.context.arc(0, 0, radius, 0, 2 * Math.PI, false);
//        this.context.restore();        
//        this.context.fillStyle = "rgba(0, 255, 0, 0.1)";
//        this.context.fill();
//        this.context.lineWidth = 1;
//        this.context.strokeStyle = 'green';
//        this.context.stroke();
//    };
    this.drawEllipse = function(x, y, w, h) {
        var pos = isoUnit.toIso(x, y);
        x = pos.x - w / 2;
        y = pos.y - h / 2;
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle
    
        this.context.beginPath();
        this.context.moveTo(x, ym);
        this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        this.context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        this.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        this.context.fillStyle = "rgba(0, 255, 0, 0.1)";
        this.context.fill();
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'green';
        this.context.closePath();
        this.context.stroke();
    };

//   this.drawEllipse = function(centerX, centerY, width, height) {
//       var pos = isoUnit.toIso(centerX, centerY);
//       centerX = pos.x;
//       centerY = pos.y;
//       context.beginPath();
//       context.moveTo(centerX, centerY - height/2); // A1
//       context.bezierCurveTo(
//         centerX + width/2, centerY - height/2, // C1
//         centerX + width/2, centerY + height/2, // C2
//         centerX, centerY + height/2); // A2
//       context.bezierCurveTo(
//         centerX - width/2, centerY + height/2, // C3
//         centerX - width/2, centerY - height/2, // C4
//         centerX, centerY - height/2); // A1
//       this.context.fillStyle = "rgba(0, 255, 0, 0.1)";
//       //context.fillStyle = "red";
//       this.context.lineWidth = 1;
//       this.context.strokeStyle = 'green';
//       context.fill();
//       context.closePath();  
//   };
};

var Game = function() {
    var allAssets = {};
    var selectedAssets = {};
    var canvas = null;
    var context = null;
    var grid = null;
    var pixelsPerTileX = 30;
    var pixelsPerTileY = 30;
    var dctx = null;
    var dirty = false;
    
    this.addUnit = function(unit) {
        allAssets[unit.id] = unit;
    };
    
    var initializeStaticCanvas = function() {
        staticCanvas = document.getElementById("canvasStatic");
        var context = staticCanvas.getContext("2d");
        //applyIsofication(context, staticCanvas);
        var sceneContext = {width: staticCanvas.width, height: staticCanvas.height};
        var isoContext = new IsofiedContext(context);
        grid.draw(isoContext, sceneContext);
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
        if (this.tick() || dirty) {
            // redraw only when at least something moved
            this.drawScene();
        }
        dirty = false;
        requestAnimFrame(function() {
            outer.animate();
        });
    };
    
    var getMousePos = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    };
    
    var ButtonEnum = {
        LEFT: 0,
        MIDDLE: 1,
        RIGHT: 2
    };
    
    var onMouseDown = function(e) {
        var coords = getMousePos(e);
        coords = isoUnit.fromIso(coords.x, coords.y);

        if (e.button === ButtonEnum.LEFT && !e.ctrlKey) {
            selectedAssets = {};
            dirty = true;
        }
        
        // handle clicks on units
        var clickedUnit = null;
        for (var id in allAssets) {
            var unit = allAssets[id];
            var clicked = unit.onMouseDown(e, coords, dctx);
            if (clicked) {
                clickedUnit = unit;
            }
        }
        
        if (clickedUnit != null) {
            // unit clicked
            switch (e.button) {
            case ButtonEnum.LEFT:
                if (true) { // TODO kontrola na vlastni jednotku
                    //unit.selected = true;
                    selectedAssets[clickedUnit.id] = clickedUnit;
                    dirty = true;
                }
                break;
            case ButtonEnum.RIGHT:
                // TODO utok
                break;
            }

        } else {
            // free space clicked
            switch (e.button) {
            case ButtonEnum.LEFT:
                break;
            case ButtonEnum.RIGHT:
                var gridCoords = grid.locateGridCoords(coords.x, coords.y);
                for (var id in selectedAssets) {
                    var unit = selectedAssets[id];
//                    astar.occupiedByUnit = function(x, y) {
//                        var unitIdFromPos = grid.findUnitIdFromCell(x, y);
//                        return unitIdFromPos != null && unit.id != unitIdFromPos;
//                    };
                    unit.moveTo(gridCoords.x, gridCoords.y, grid.graph);
                } 
                break;
            }
        }
    };
    
    this.spawnUnits = function() {
        var myTank = grid.spawn(20, 2, new Tank());
        myTank.rotation = 45;
        this.addUnit(myTank);
        
        myTank = grid.spawn(10, 2, new Tank());
        myTank.rotation = 0;
        this.addUnit(myTank);

        myTank = grid.spawn(10, 8, new Tank());
        myTank.rotation = 0;
        this.addUnit(myTank);

        myTank = grid.spawn(10, 15, new Tank());
        myTank.rotation = 225;
        this.addUnit(myTank);
    };
    
    this.init = function() {
        canvas = document.getElementById("canvasArea");
        context = canvas.getContext("2d");
        canvas.addEventListener("mousedown", onMouseDown, false);  
        
        grid = new Grid(50, 36, pixelsPerTileX, pixelsPerTileY, allAssets); // todo dat jenom na jedno misto
        var height = grid.computeGridHeight() + 1;
        canvas.height = height;
        document.getElementById("canvasStatic").height = height;
        document.getElementById("container").style.height = height + "px";
//        var imageAlphaTester = new (function() {
//            var staticCanvas = document.getElementById("canvasTest");
//            var context = staticCanvas.getContext("2d");
//            
//            this.test = function(img, pixelCoords, posRect) {
//                var imgSrc = BaseAsset.prototype.atlas_image;
//                if ((imgSrc.src.length > 4 && imgSrc.src.substring(0, 4) === "file") ||
//                        imgSrc.src.indexOf("/raw.github.com/") > -1) {
//                    return true; // TODO prepsat funkcionalne
//                } else {
//                    staticCanvas.width = staticCanvas.width;
//                    context.drawImage(BaseAsset.prototype.atlas_image, img.x, img.y, img.w, img.h,
//                            0, 0, posRect.w, posRect.h);
//                    var x = pixelCoords.x - posRect.x;
//                    var y = pixelCoords.y - posRect.y;
//                    //var x = 58;
//                    //var y = 30;
//                    //console.info(x, y);
//                    //var data = staticCanvas.toDataURL();
//                    var canvasColor = context.getImageData(x, y, 1,1); // rgba e [0,255]
//                    var pixels = canvasColor.data;
//                    var inside = pixels[3] > 128;
//                    //console.info(inside);
//                    return inside;
//                }
//            };
//        })();

        dctx = {ctx: new IsofiedContext(context), grid: grid, angle: angleUnit,
                /*imageAlphaTester: imageAlphaTester,*/ iso: isoUnit};
        
        astar.occupiedByUnit = function(x, y) {
            return !grid.isCellFree(x, y);
        };
        this.spawnUnits();
        initializeStaticCanvas();
        this.drawScene();
        
        requestAnimFrame(function() {
            outer.animate();
        });
    };
    
    var drawUnits = function() {
        for(var id in allAssets) {
            var asset = allAssets[id];
            var selected = asset.id in selectedAssets;
            asset.selected = selected;
            asset.draw(dctx);
        } 
    };
    
    this.drawScene = function() {
//        applyIsofication(context, canvas);
        context.save();
//        applyIsofication(context, canvas);

        //var start = (new Date()).getTime();
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawUnits();
        context.restore();
        //var end = (new Date()).getTime();
        //console.info('drawScene took ' + (end - start));
    };    
    
    this.tick = function() {
        var now = (new Date).getTime();
        var timeDelta = parseFloat(now - this.lastTick) / 1000;
        this.lastTick = now;
        //console.info(timeDelta);
        var moved = false;
        
        for(var id in allAssets) {
            moved = moved | allAssets[id].tick(timeDelta, dctx);
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
    spritesImage = loadImage("img/tanks.v2.png");
    
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
