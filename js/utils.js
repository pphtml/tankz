var BiDiMap = function() {
    this.keys = {};
    this.values = {};
    
    this.putKeyValue = function(key, value) {
        if (this.containsKey(key)) {
            this.removeKey(key);
        }
        if (this.containsValue(value)) {
            this.removeValue(value);
        }
        this.keys[key] = value;
        this.values[value] = key;
    };
    
    this.containsKey = function(key) {
        return key in this.keys;
    };
    
    this.containsValue = function(value) {
        return value in this.values;
    };
    
    this.removeKey = function(key) {
        if (key == "30, 2") {
            console.info("abc");
        }
        var present = key in this.keys;
        if (present) {
            var value = this.keys[key];
            delete this.keys[key];
            delete this.values[value];
        }
        return present;
    };
    
    this.removeValue = function(value) {
        var present = value in this.values;
        if (present) {
            var key = this.values[value];
            if (key == "30, 2") {
                console.info("abcd");
            }

            delete this.values[value];
            delete this.keys[key];
        }
        return present;
    };
    
    this.toString = function() {
        "keys=" + this.keys + ", values=" + this.values;
    };
};