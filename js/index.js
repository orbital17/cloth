(function() {
  var Cloth, Node, Runner, Spring, UkrainianFlag, Vector3D, constants,
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

    Vector3D.prototype.vectorTo = function(other) {
      return new Vector3D(other.coords[0] - this.coords[0], other.coords[1] - this.coords[1], other.coords[2] - this.coords[2]);
    };

    Vector3D.prototype.substructVector = function(other) {
      return new Vector3D(this.coords[0] - other.coords[0], this.coords[1] - other.coords[1], this.coords[2] - other.coords[2]);
    };

    Vector3D.prototype.addVector = function(other) {
      return new Vector3D(this.coords[0] + other.coords[0], this.coords[1] + other.coords[1], this.coords[2] + other.coords[2]);
    };

    Vector3D.prototype.multByNumber = function(number) {
      return new Vector3D(this.coords[0] * number, this.coords[1] * number, this.coords[2] * number);
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

    Vector3D.prototype.toZero = function() {
      return this.coords = [0, 0, 0];
    };

    return Vector3D;

  })();

  constants = {
    m: 0.001,
    gravity_acceleration: new Vector3D(0, -10, 0),
    k: 7
  };

  Node = (function() {
    function Node(x, y, z) {
      this.point = new Vector3D(x, y, z);
      this.previous = new Vector3D(x, y, z);
      this.springs = [];
      this.current_spring_force = new Vector3D(0, 0, 0);
      this.pinned = false;
    }

    Node.prototype.update = function() {
      var new_point;
      if (!this.pinned) {
        new_point = this.point.multByNumber(2).substructVector(this.previous).addVector(this.current_spring_force.multByNumber(1 / constants.m).addVector(constants.gravity_acceleration).multByNumber(0.001));
        this.previous = this.point;
        this.point = new_point;
      }
      return this.current_spring_force.toZero();
    };

    return Node;

  })();

  Spring = (function() {
    function Spring(first_node, second_node) {
      this.first_node = first_node;
      this.second_node = second_node;
      this.len = this.first_node.point.vectorTo(this.second_node.point).norm();
      this.first_node.springs.push(this);
      this.second_node.springs.push(this);
    }

    Spring.prototype.force = function() {
      return this.first_node.point.vectorTo(this.second_node.point).subtructNumber(this.len).multByNumber(constants.k / this.len);
    };

    Spring.prototype.update_forces = function() {
      var force;
      force = this.force();
      this.first_node.current_spring_force = this.first_node.current_spring_force.addVector(force);
      return this.second_node.current_spring_force = this.second_node.current_spring_force.addVector(force.multByNumber(-1));
    };

    return Spring;

  })();

  Cloth = (function() {
    function Cloth(width, height, block_size) {
      var h, w, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
      this.width = width;
      this.height = height;
      this.block_size = block_size;
      this.state = [];
      for (h = _i = 0, _ref = this.height; 0 <= _ref ? _i <= _ref : _i >= _ref; h = 0 <= _ref ? ++_i : --_i) {
        for (w = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; w = 0 <= _ref1 ? ++_j : --_j) {
          this.state.push(new Node(w * this.block_size, h * this.block_size, 0));
        }
      }
      this.springs = [];
      for (h = _k = 0, _ref2 = this.height; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; h = 0 <= _ref2 ? ++_k : --_k) {
        for (w = _l = 0, _ref3 = this.width; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; w = 0 <= _ref3 ? ++_l : --_l) {
          if (w < this.width) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[h * (this.width + 1) + w + 1]));
          }
          if (h < this.height) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[(h + 1) * (this.width + 1) + w]));
          }
        }
      }
      this.state[this.height * (this.width + 1)].pinned = true;
    }

    Cloth.prototype.update = function(time) {
      var node, spring, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.springs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spring = _ref[_i];
        spring.update_forces();
      }
      _ref1 = this.state;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        _results.push(node.update());
      }
      return _results;
    };

    return Cloth;

  })();

  UkrainianFlag = (function(_super) {
    __extends(UkrainianFlag, _super);

    function UkrainianFlag() {
      UkrainianFlag.__super__.constructor.call(this, 24, 16, 30);
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
