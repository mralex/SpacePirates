var Vector2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Vector2.prototype = {
	equals: function(v) {
		return (this.x === v.x) && (this.y === v.y);
	},

    distance: function(vector) {
        return this.subtract(vector).magnitude();
    },

    add: function(v) {
    	var n = parseFloat(v);
    	if (!_.isNaN(n) && typeof n === "number") {
    		return new Vector2(this.x + n, this.y + n);
    	}
    	return new Vector2(this.x + v.x, this.y + v.y);
    },

    subtract: function(v) {
    	var n = parseFloat(v);
    	if (!_.isNaN(n) && typeof n === "number") {
    		return new Vector2(this.x - n, this.y - n);
    	}
    	return new Vector2(this.x - v.x, this.y - v.y);	
    },

    multiply: function(v) {
    	var n = parseFloat(v);
    	if (!_.isNaN(n) && typeof n === "number") {
    		return new Vector2(this.x * n, this.y * n);
    	}
    	return new Vector2(this.x * v.x, this.y * v.y);
    },

    divide: function(d) {
    	var n = parseFloat(v);
    	if (!_.isNaN(n) && typeof n === "number") {
    		return new Vector2(this.x / n, this.y / n);
    	}
    	return new Vector2(this.x / d, this.y / d);
    },

    sqrMagnitude: function() {
    	return (this.x * this.x) + (this.y * this.y);
    },

    magnitude: function() {
    	return Math.sqrt(this.sqrMagnitude());
    },

    normalize: function() {
    	var magnitude = this.magnitude();
    	return new Vector2(this.x / magnitude, this.y / magnitude);
    },

    dot: function(v) {
    	return (this.x * v.x) + (this.y * v.y);
    },

    normalizedDot: function(v) {
    	return this.normalize().dot(v.normalize());
    }
};

Vector2.zero = function() {
    return new Vector2(0, 0);
};

Vector2.one = function() {
    return new Vector2(1, 1);
};

Vector2.up = function() {
	return new Vector2(0, -1);
};

Vector2.down = function() {
	return new Vector2(0, 1);
};

Vector2.left = function() {
	return new Vector2(-1, 0);
};

Vector2.right = function() {
	return new Vector2(1, 0);
};


/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };
}());
