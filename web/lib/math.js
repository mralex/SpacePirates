var Vector3 = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

Vector3.prototype = {
    distance: function(vector) {
        return 0;
    }
};

Vector3.zero = function() {
    return new Vector3(0, 0, 0);
}

Vector3.one = function() {
    return new Vector3(1, 1, 1);
}
