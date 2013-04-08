test("Isometric translations", function() {
    var isoCoords = isoUnit.toIso(0, 0);
    console.info(isoCoords);
    equal(isoCoords.x, 0, "X Passed!");
    equal(isoCoords.y, 360, "Y Passed!");

    isoCoords = isoUnit.toIso(500, 100);
    console.info(isoCoords);
    equal(isoCoords.x, 600, "X Passed!");
    equal(isoCoords.y, 160, "Y Passed!");

    var coords = isoUnit.fromIso(isoCoords.x, isoCoords.y);
    equal(coords.x, 500, "X Passed!");
    equal(coords.y, 100, "Y Passed!");
});

test("BiDiMap", function() {
    var map = new BiDiMap();
    map.putKeyValue(1, '2,3'); 
    equal(map.containsKey(0), false);
    equal(map.containsKey(1), true);
    equal(map.containsValue('2,3'), true);  
    
    equal(map.removeKey(0), false);  
    equal(map.removeKey(1), true);  
    equal(map.removeKey(1), false);  
    equal(map.containsValue('2,3'), false);  
    
    map.putKeyValue(2, '5,6'); 
    equal(map.removeValue('nonexisting'), false);
    equal(map.containsKey(2), true);
    equal(map.removeValue('5,6'), true);
    equal(map.containsKey(2), false);
    equal(map.removeValue('5,6'), false);
    
    map.putKeyValue(2, '7,8');
    var cntValues = Object.keys(map.values).length;
    console.info(cntValues);
    map.putKeyValue(2, '7,8');
    equal(Object.keys(map.values).length, cntValues);
    map.putKeyValue(2, '9,10');
    equal(Object.keys(map.values).length, cntValues);
    
    map.putKeyValue(5, '99,0');
    var cntKeys = Object.keys(map.keys).length;
    console.info(cntKeys);
    map.putKeyValue(5, '99,0');
    equal(Object.keys(map.keys).length, cntKeys);
    map.putKeyValue(6, '99,0');
    equal(Object.keys(map.keys).length, cntKeys);
});