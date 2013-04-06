test( "hello test", function() {
  var isoCoords = isoUnit.toIso(0, 0);  
  console.info(isoCoords);
  equal(isoCoords.x, 0, "X Passed!" );
  equal(isoCoords.y, 360, "Y Passed!" );
    
  isoCoords = isoUnit.toIso(500, 100);  
  console.info(isoCoords);
  equal(isoCoords.x, 600, "X Passed!" );
  equal(isoCoords.y, 160, "Y Passed!" );
  
  var coords = isoUnit.fromIso(isoCoords.x, isoCoords.y);
  equal(coords.x, 500, "X Passed!" );
  equal(coords.y, 100, "Y Passed!" );
});