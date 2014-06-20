(function() {
  var Cloth, Node, Runner, Spring, UkrainianFlag, Vector3D,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Vector3D = (function() {
    function Vector3D(x, y, z) {
      this.coords = [x, y, z];
    }

    Vector3D.prototype.x = function() {
      return this.coords[0];
    };

    Vector3D.prototype.y = function() {
      return this.coords[1];
    };

    Vector3D.prototype.z = function() {
      return this.coords[2];
    };

    Vector3D.prototype.vectorTo = function(other_point) {
      var i;
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Vector3D, (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i < 3; i = ++_i) {
          _results.push(other_point.coords[i] - this.coords[i]);
        }
        return _results;
      }).call(this), function(){});
    };

    Vector3D.prototype.multByNumber = function(number) {
      var i;
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Vector3D, (function() {
        var _i, _len, _ref, _results;
        _ref = this.coords;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(i * number);
        }
        return _results;
      }).call(this), function(){});
    };

    Vector3D.prototype.subtructNumber = function(number) {
      return this.normalize().multByNumber(number).vectorTo(this);
    };

    Vector3D.prototype.norm = function() {
      return Math.sqrt(this.coords[0] * this.coords[0] + this.coords[1] * this.coords[1] + this.coords[2] * this.coords[2]);
    };

    Vector3D.prototype.normalize = function() {
      return this.multByNumber(1.0 / this.norm());
    };

    return Vector3D;

  })();

  Node = (function() {
    function Node(x, y, z) {
      this.point = new Vector3D(x, y, z);
      this.springs = [];
      this.m = 1;
    }

    return Node;

  })();

  Spring = (function() {
    function Spring(first_node, second_node, k) {
      this.first_node = first_node;
      this.second_node = second_node;
      this.k = k;
      this.len = this.first_node.point.vectorTo(this.second_node.point).norm();
      this.first_node.springs.push(this);
      this.second_node.springs.push(this);
    }

    Spring.prototype.force = function() {
      return this.first_node.point.vectorTo(this.second_node.point).subtructNumber(this.len).multByNumber(this.k / this.len);
    };

    return Spring;

  })();

  Cloth = (function() {
    function Cloth(width, height, block_size) {
      var h, w, _i, _j, _ref, _ref1;
      this.width = width;
      this.height = height;
      this.block_size = block_size;
      this.state = [];
      for (h = _i = 0, _ref = this.height; 0 <= _ref ? _i <= _ref : _i >= _ref; h = 0 <= _ref ? ++_i : --_i) {
        for (w = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; w = 0 <= _ref1 ? ++_j : --_j) {
          this.state.push(new Node(w * this.block_size, h * this.block_size, 0));
        }
      }
      this.gravity = new Vector3D(0, -10 * this.m, 0);
    }

    Cloth.prototype.update = function(time) {
      var node, _i, _len, _ref, _results;
      _ref = this.state;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(node.point.coords[0] -= 2);
      }
      return _results;
    };

    return Cloth;

  })();

  UkrainianFlag = (function(_super) {
    __extends(UkrainianFlag, _super);

    function UkrainianFlag() {
      UkrainianFlag.__super__.constructor.call(this, 30, 20, 30);
      this.initGeometry();
    }

    UkrainianFlag.prototype.initGeometry = function() {
      var blue, face, i, j, node, _i, _j, _k, _len, _ref, _ref1, _ref2;
      this.geometry = new THREE.Geometry();
      blue = new THREE.Color(0x00ffff);
      _ref = this.state;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        this.geometry.vertices.push((function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(THREE.Vector3, node.point.coords, function(){}));
      }
      for (i = _j = 0, _ref1 = this.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        for (j = _k = 0, _ref2 = this.width; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; j = 0 <= _ref2 ? ++_k : --_k) {
          face = new THREE.Face3(i * (this.width + 1) + j, i * (this.width + 1) + j + 1, (i + 1) * (this.width + 1) + j + 1, null, null, i >= this.height / 2 ? 0 : 1);
          this.geometry.faces.push(face);
          face = new THREE.Face3(i * (this.width + 1) + j, (i + 1) * (this.width + 1) + j + 1, (i + 1) * (this.width + 1) + j, null, null, i >= this.height / 2 ? 0 : 1);
          this.geometry.faces.push(face);
          face = new THREE.Face3(i * (this.width + 1) + j, (i + 1) * (this.width + 1) + j + 1, i * (this.width + 1) + j + 1, null, null, i >= this.height / 2 ? 0 : 1);
          this.geometry.faces.push(face);
          face = new THREE.Face3(i * (this.width + 1) + j, (i + 1) * (this.width + 1) + j, (i + 1) * (this.width + 1) + j + 1, null, null, i >= this.height / 2 ? 0 : 1);
          this.geometry.faces.push(face);
        }
      }
    };

    UkrainianFlag.prototype.mesh = function() {
      var material, material_blue, material_yellow;
      material_blue = new THREE.MeshBasicMaterial({
        color: 0x0057b8,
        wireframe: true
      });
      material_yellow = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        wireframe: true
      });
      material = new THREE.MeshFaceMaterial([material_blue, material_yellow]);
      return new THREE.Mesh(this.geometry, material);
    };

    UkrainianFlag.prototype.update = function(time) {
      var i, _i, _ref;
      UkrainianFlag.__super__.update.call(this, time);
      for (i = _i = 0, _ref = (this.height + 1) * (this.width + 1); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.geometry.vertices[i] = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(THREE.Vector3, this.state[i].point.coords, function(){});
      }
    };

    return UkrainianFlag;

  })(Cloth);

  Runner = (function() {
    function Runner(updatable_meshable) {
      this.updatable_meshable = updatable_meshable;
      this.animate = __bind(this.animate, this);
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      this.camera.position.z = 1000;
      this.scene = new THREE.Scene();
      this.scene.add(this.updatable_meshable.mesh());
      this.renderer = new THREE.CanvasRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      return;
    }

    Runner.prototype.animate = function(time) {
      requestAnimationFrame(this.animate);
      this.updatable_meshable.update(time);
      this.renderer.render(this.scene, this.camera);
    };

    Runner.prototype.run = function() {
      return requestAnimationFrame(this.animate);
    };

    return Runner;

  })();

  $(function() {
    return new Runner(new UkrainianFlag()).run();
  });

}).call(this);
