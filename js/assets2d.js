var BaseAsset = function() {
            
};
//BaseAsset.prototype.atlas_data = data;
//BaseAsset.prototype.atlas_image = spritesImage;

BaseAsset.prototype.onMouseDown = function(e, pixelCoords, unit, dctx) {
    //console.info(pixelCoords);
    var img = this.getSpriteImage(unit);
    //console.info(img);
    var pos = this.computePosRectDraw(unit, img);
    //console.info(pos);
    var inside = pixelCoords.x >= pos.x && pixelCoords.x <= pos.x + pos.w &&
        pixelCoords.y >= pos.y && pixelCoords.y <= pos.y + pos.h;
//    console.info(inside);
//    if (inside) {
//        var posRect = this.computePosRect(unit, img);
//        inside = dctx.imageAlphaTester.test(img, pixelCoords, posRect);
//    }
    return inside;
};

//BaseAsset.prototype.computePosRect = function(unit, img) {
//    return { x: parseInt(unit.x + this.scale * img.cx),
//        y: parseInt(unit.y + this.scale * (img.cy + this.yOffset)),
//        w: this.scale * img.w,
//        h: this.scale * img.h
//    };
//};

BaseAsset.prototype.computePosRect = function(unit, img) {
    return { x: unit.x,
        y: unit.y,
        w: this.scaleW * img.w,
        h: this.scaleH * img.h
    };
};

BaseAsset.prototype.computePosRectDraw = function(unit, img) {
    var pos = this.computePosRect(unit, img);
    return { x: pos.x - pos.w/2,
        y: pos.y - pos.h/2,
        w: pos.w,
        h: pos.h
    };
};

BaseAsset.prototype.draw = function(dctx, unit) {
    var img = this.getSpriteImage(unit);
    //console.info(img);
    var pos = this.computePosRect(unit, img);
    dctx.ctx.drawImageEx(this.atlas_image, img.x, img.y, img.w, img.h,
          pos.x, pos.y, pos.w, pos.h);
//    dctx.ctx.drawImage(this.atlas_image, img.x, img.y, img.w, img.h,
//        pos.x, pos.y, pos.w, pos.h);
    
    if (unit.selected) {
        this.drawSelection(dctx, this.computePosRectDraw(unit, img));
    }
    
    if (typeof unit.path != 'undefined') {
        //console.info("xxxxxxxxxxxxxxxx " + dctx.grid);
        for(var i = 0, count = unit.path.length; i < count; i++) {
            var node = unit.path[i];
            //console.info(node.x, node.y);
            var pixelCoords = dctx.grid.locatePixelCoords(node.x, node.y);
            var context = dctx.ctx;
            context.beginPath();
            context.arc(pixelCoords.x, pixelCoords.y, 2, 0 , 2 * Math.PI, false);
            context.fillStyle = 'green';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = '#003300';
            context.stroke();
        }
    }
};

BaseAsset.prototype.getIndexedImage = function(spriteName, spriteIndex) {
    var name = spriteName + (spriteIndex < 10 ? '0' : '') + spriteIndex + '.png';
    var img = this.atlas_data[name];
    if (!img) {
        throw ('Missing sprite ' + name);
    }
    return img;
};
//BaseAsset.prototype.drawLifeBar = function() {
//    var x = this.drawingX;
//    var y = this.drawingY - 2*game.lifeBarHeight;
//    game.foregroundContext.fillStyle = (this.lifeCode == "healthy")?game.healthBarHealthyFillColor:game.healthBarDamagedFillColor;          
//    game.foregroundContext.fillRect(x,y,this.pixelWidth*this.life/this.hitPoints,game.lifeBarHeight)
//    game.foregroundContext.strokeStyle = game.healthBarBorderColor;
//    game.foregroundContext.lineWidth = 1;
//    game.foregroundContext.strokeRect(x,y,this.pixelWidth,game.lifeBarHeight)
//};

BaseAsset.prototype.drawSelection = function(dctx, rect){
    var context = dctx.ctx;
    context.beginPath();
//    var x = 0.5 + parseInt(rect.x);
//    var y = 0.5 + parseInt(rect.y);
    var x = parseInt(rect.x);
    var y = parseInt(rect.y);
    var w = parseInt(rect.w);
    var h = parseInt(rect.h);
    context.rect(x, y, w, h);
    context.fillStyle = "rgba(0, 255, 0, 0.1)";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = 'green';
    context.stroke();
};

var TankAsset = function() {
    //this.yOffset = -6;
    var sc = 0.7;
    this.scaleW = sc * 0.6;
    this.scaleH = sc * 0.45;
    
    this.getSpriteImage = function(unit) {
        return this.getIndexedImage('tank', unit.spriteIndex());
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

GenericUnit.prototype.onMouseDown = function(e, pixelCoords, dctx) {
    //console.info(pixelCoords);
    return this.asset.onMouseDown(e, pixelCoords, this, dctx);
};

GenericUnit.prototype.tick = function(timeDelta, dctx) { // todo premistit do generic unit
    var moved = false;
    
    while (timeDelta > 0.0) {
        if (typeof this.movegrid == 'undefined' && typeof this.path != 'undefined' && this.path.length > 0) {
            var node = this.path[0];
            var pixelCoords = dctx.grid.locatePixelCoords(node.x, node.y);
            // todo pocitat jenom pri prechodu na novou bunku
            var angle = dctx.angle.compute(node.x - this.gridX, this.gridY - node.y);
            //var angle = dctx.angle.compute(pixelCoords.x - this.x, this.y - pixelCoords.y);
            //console.info("changing rotation to " + angle);
            this.rotation = angle;

            // kontrola obsazenosti bunky
            if (!(node.free() && dctx.grid.isCellFree(node.x, node.y))) {
                //console.info(node);
                //console.info("not free");
            } else {
                node = this.path.splice(0, 1)[0];
                dctx.grid.moveUnit(this, this.gridX, this.gridY, node.x, node.y);
                this.movegrid = {
                    addingX: pixelCoords.x > this.x ? 1 : pixelCoords.x < this.x ? -1 : 0,
                    addingY: pixelCoords.y > this.y ? 1 : pixelCoords.y < this.y ? -1 : 0,
                    deltaResiduum: function(x, y, dx, dy, delta) {
                        var result = 0.0;
                        if ((this.addingX > 0 && x >= this.targetX) || (this.addingX < 0 && x <= this.targetX)) {
                            result = (x - this.targetX) / dx * delta;
                        } else if ((this.addingY > 0 && y >= this.targetY) || (this.addingY < 0 && y <= this.targetY)) {
                            result = (y - this.targetY) / dy * delta;
                        }
                        return result;
                    },
                    targetX: pixelCoords.x,
                    targetY: pixelCoords.y
                };
            }
        }

        var innerTickResult = this.innerGridTick(timeDelta, dctx);
        if (innerTickResult.finished) {
            delete this.movegrid;
        }

        moved = moved || innerTickResult.moved;
        
        timeDelta = innerTickResult.remainingDelta;
    }
    
    return moved;
};

GenericUnit.prototype.innerGridTick = function(timeDelta, dctx) {
    // if (!(this.x % 1 === 0)) {
    // console.error("X coordinate is a float");
    // }
    var moved = false;
    var finished = false;
    var remainingDelta = 0.0;
    if (typeof this.movegrid != 'undefined') {
        moved = true;
        var deltas = this.computeMovementDeltas(timeDelta, dctx);
        // this.x = parseFloat(this.x) + deltas.x;
        // this.y = parseFloat(this.y) + deltas.y;
        this.x += deltas.x;
        this.y += deltas.y;
        var residuum = this.movegrid.deltaResiduum(this.x, this.y, deltas.x,
                deltas.y, timeDelta);
        if (residuum > 0.0) {
            // console.info("residuum found " + residuum + " from " +
            // timeDelta);
            this.x = this.movegrid.targetX;
            this.y = this.movegrid.targetY;
            finished = true;
            remainingDelta = residuum;
        }
        var gridCoords = dctx.grid.locateGridCoords(this.x, this.y);
        this.gridX = gridCoords.x;
        this.gridY = gridCoords.y;
    }
    return {
        moved : moved,
        finished : finished,
        remainingDelta : remainingDelta
    };
};

GenericUnit.prototype.computeMovementDeltas = function(timeDelta, dctx) {
    var speedFactor = this.gridSpeed * timeDelta;
    var dpx = parseFloat(dctx.grid.pixelsPerTileX) * speedFactor;
    var dpy = parseFloat(dctx.grid.pixelsPerTileY) * speedFactor;
    var dirFactors = this.directions[this.rotation];
    if (dirFactors == null) {
        console.error("Unknown direction " + this.rotation);
    }
    return {x: dpx * dirFactors[0], y: dpy * dirFactors[1]};
};

GenericUnit.prototype.draw = function(dctx) { 
    this.asset.draw(dctx, this);
};

var ZERO = 0.0;
var DIAG = 1.0 / Math.sqrt(2);
var FULL = 1.0;

GenericUnit.prototype.directions = {
    0: [FULL, ZERO],
    45: [DIAG, -DIAG],
    90: [ZERO, -FULL],
    135: [-DIAG, -DIAG],
    180: [-FULL, ZERO],
    225: [-DIAG, DIAG],
    270: [ZERO, FULL],
    315: [DIAG, DIAG]
};

var Tank = function() {
    this.asset = tank_asset;
    this.gridSpeed = 5.0; // grid/s
    
    this.spriteIndex = function() {
        var result = Math.floor((45.0 + this.rotation + 5.625) / 11.25);
        result = result % 32;
        return result;
    };    
};
Tank.prototype = new GenericUnit();


