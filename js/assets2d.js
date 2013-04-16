var BaseAsset = function() {
            
};
//BaseAsset.prototype.atlas_data = data;
//BaseAsset.prototype.atlas_image = spritesImage;

BaseAsset.prototype.drawSelectionRect = true;

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
          pos.x, pos.y, pos.w, pos.h, this.yOffset);
//    dctx.ctx.drawImage(this.atlas_image, img.x, img.y, img.w, img.h,
//        pos.x, pos.y, pos.w, pos.h);
    
    if (unit.selected && this.drawSelectionRect) {
        //this.drawSelection(dctx, this.computePosRectDraw(unit, img));
        this.drawSelection(dctx, {x: unit.x, y: unit.y});
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
    
    context.drawEllipse(rect.x, rect.y, 60.0, 30.0);
//    context.save();
//    context.scale(0.5, 1.0);
//    context.beginPath();
////    var x = parseInt(rect.x);
////    var y = parseInt(rect.y);
////    var w = parseInt(rect.w);
////    var h = parseInt(rect.h);
////    context.rect(x, y, w, h);
//    
//    context.beginPath();
//    context.arc(rect.x, rect.y, 25.0, 0, 2 * Math.PI, false);
//    
//    context.fillStyle = "rgba(0, 255, 0, 0.1)";
//    context.fill();
//    context.lineWidth = 2;
//    context.strokeStyle = 'green';
//    context.stroke();
//    context.restore();
};

var TankAsset = function() {
    this.yOffset = -2;
    var sc = 0.7;
    this.scaleW = sc * 0.6;
    this.scaleH = sc * 0.4;
    this.defaultSpeed = 3.0;
    
    this.getSpriteImage = function(unit) {
        return this.getIndexedImage('tank', unit.spriteIndex());
    };
};
TankAsset.prototype = new BaseAsset();
var tankAsset = new TankAsset();

var TurretAsset = function() {
    this.yOffset = -5;
    this.scaleW = tankAsset.scaleW;
    this.scaleH = tankAsset.scaleH;
    this.drawSelectionRect = false;
    
    this.getSpriteImage = function(unit) {
        return this.getIndexedImage('turret', unit.spriteIndexTurret());
    };
};
TurretAsset.prototype = new BaseAsset();
var turretAsset = new TurretAsset();

var GenericUnit = function() {
};

GenericUnit.prototype.moveTo = function(gridX, gridY, graph) {
    var start = graph.nodes[this.gridX][this.gridY];
    var end = graph.nodes[gridX][gridY];
    var path = astar.search(graph.nodes, start, end, true);
    if (path != null) {
        delete this.movegrid;
        this.path = path;
    } else {
        delete this.path;
    }
};

GenericUnit.prototype.aimAt = function(dctx) {
};

GenericUnit.prototype.onMouseDown = function(e, pixelCoords, dctx) {
    //console.info(pixelCoords);
    return this.asset.onMouseDown(e, pixelCoords, this, dctx);
};

GenericUnit.prototype.isMoving = function() {
    return typeof this.path != 'undefined' && this.path.length > 0;
};

GenericUnit.prototype.getMoveDestination = function() {
    var result = null;
    if (this.isMoving()) {
        var lastCellOfPath = this.path[this.path.length - 1];
        //console.info(lastCellOfPath);
        result = {x: lastCellOfPath.x, y: lastCellOfPath.y};
    }
    return result;
};

GenericUnit.prototype.tick = function(dctx, timeDelta) {
    var moved = false;
    
    while (timeDelta > 0.0) {
        // if there is a path remaining and move between grid is finished or has not started yet
        if (typeof this.movegrid == 'undefined' && this.isMoving()) {
            var node = this.path[0];
            var pixelCoords = dctx.grid.locatePixelCoords(node.x, node.y);
            // todo pocitat jenom pri prechodu na novou bunku
            var angle = dctx.angle.compute(node.x - this.gridX, this.gridY - node.y);
            //var angle = dctx.angle.compute(pixelCoords.x - this.x, this.y - pixelCoords.y);
            //console.info("changing rotation to " + angle);
            this.rotation = angle;

            // kontrola obsazenosti bunky
            if (!(node.free() && dctx.grid.isCellFree(node.x, node.y))) {
                if (dctx.grid.hasMovingUnit(node.x, node.y)) {
//                    var now = new Date().getTime();
//                    if (!this.hasOwnProperty('waitingInMove')) {
//                        console.info("Conflict with another moving unit. Waiting started.");
//                        //this.waitingInMove = now;
//                    } else {
//                        if (this.waitingInMove + 5000 < now) {
//                            console.info("Timeout expired!");
//                        }
//                    }
                } else {
                    //console.info("Cell occupied by nonmoving unit.");
                    var destination = this.getMoveDestination();
                    if (destination != null) {
                        this.moveTo(destination.x, destination.y, dctx.grid.graph);
                    }
                    //console.info(destination);
                }
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
                    targetY: pixelCoords.y,
                    targetGridX: node.x,
                    targetGridY: node.y
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
    this.asset = tankAsset;
    this.turretAsset = turretAsset;
    this.turretRotation = null; // same as tanks rotation
    this.gridSpeed = this.asset.defaultSpeed; // grid/s
    this.aimingMaxDist= Math.pow(300, 2); // comparing power of 2 later
    
    this.spriteIndex = function() {
        var result = Math.floor((45.0 + this.rotation + 5.625) / 11.25);
        result = result % 32;
        return result;
    };
    
    this.spriteIndexTurret = function() {
        var result = Math.floor((45.0 + this.turretRotation + 5.625) / 11.25);
        result = result % 32;
        return result;
    };
    
    this.draw = function(dctx) { 
        this.asset.draw(dctx, this);
        this.turretAsset.draw(dctx, this);
    };
    
    this.aimAt = function(dctx) {
        return this.adjustTurret(dctx);
    };
    
    this.adjustTurret = function(dctx) {
        var changed = false;
        var dx = dctx.mouse.x - this.x;
        var dy = dctx.mouse.y - this.y;
        var d = dx * dx + dy * dy;
        if (d <= this.aimingMaxDist) {
            var angle = dctx.angle.compute(dctx.mouse.x - this.x, this.y - dctx.mouse.y);
            if (this.turretRotation != angle) {
                changed = true;
            }
            this.turretRotation = angle;
            //console.info('dist2=' + d + ', angle=' + angle);
        }
        return changed;
    };
    
    this.tick =  function(dctx, timeDelta) {
        var dirty = GenericUnit.prototype.tick.call(this, dctx, timeDelta);
        dirty = this.aimAt(dctx) || dirty;
        return dirty;
        //return GenericUnit.prototype.tick(dctx, timeDelta);
        //this.parent.tick(timeDelta, dctx);
    };
};
Tank.prototype = new GenericUnit();


