(function() {
  var Cloth, Node, Runner, Spring, UkrainianFlag, Vector3D, WingPart, constants,
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

    Vector3D.prototype.proectionYZ = function() {
      return new Vector3D(0, this.coords[1], this.coords[2]);
    };

    Vector3D.prototype.product = function(other) {
      return this.coords[0] * other.coords[0] + this.coords[1] * other.coords[1] + this.coords[2] * other.coords[2];
    };

    return Vector3D;

  })();

  constants = {
    m: 1.0,
    gravity_acceleration: new Vector3D(0, -0.01, 0),
    k: 7.0,
    sqrt_2: Math.sqrt(2),
    delta_t: 1.0,
    p: new Vector3D(0.00003, 0, 0),
    d: 0.0005
  };

  Node = (function() {
    function Node(x, y, z) {
      this.point = new Vector3D(x, y, z);
      this.previous = new Vector3D(x, y, z);
      this.springs = [];
      this.current_spring_force = new Vector3D(0, 0, 0);
      this.current_pressure = new Vector3D(0, 0, 0);
      this.pinned = false;
      this.speed = new Vector3D(0, 0, 0);
      this.saved_point = 0;
      this.saved_speed = 0;
    }

    Node.prototype.get_a = function() {
      if (!this.pinned) {
        return this.current_spring_force.addVector(this.current_pressure).addVector(this.speed.multByNumber(-constants.d)).multByNumber(1 / constants.m).addVector(constants.gravity_acceleration);
      } else {
        return new Vector3D(0, 0, 0);
      }
    };

    Node.prototype.currentToZero = function() {
      this.current_spring_force.toZero();
      return this.current_pressure.toZero();
    };

    Node.prototype.runge1 = function() {
      this.k1 = [this.speed, this.get_a()];
      this.saved_point = this.point;
      this.saved_speed = this.speed;
      this.point = this.saved_point.addVector(this.k1[0].multByNumber(constants.delta_t / 2.0));
      this.speed = this.saved_speed.addVector(this.k1[1].multByNumber(constants.delta_t / 2.0));
      return this.currentToZero();
    };

    Node.prototype.runge2 = function() {
      this.k2 = [this.speed, this.get_a()];
      this.point = this.saved_point.addVector(this.k2[0].multByNumber(constants.delta_t / 2.0));
      this.speed = this.saved_speed.addVector(this.k2[1].multByNumber(constants.delta_t / 2.0));
      return this.currentToZero();
    };

    Node.prototype.runge3 = function() {
      this.k3 = [this.speed, this.get_a()];
      this.point = this.saved_point.addVector(this.k3[0].multByNumber(constants.delta_t));
      this.speed = this.saved_speed.addVector(this.k3[1].multByNumber(constants.delta_t));
      return this.currentToZero();
    };

    Node.prototype.runge4 = function() {
      this.k4 = [this.speed, this.get_a()];
      this.point = this.k1[0].addVector(this.k2[0].multByNumber(2)).addVector(this.k3[0].multByNumber(2)).addVector(this.k4[0]).multByNumber(constants.delta_t / 6.0).addVector(this.saved_point);
      this.speed = this.k1[1].addVector(this.k2[1].multByNumber(2)).addVector(this.k3[1].multByNumber(2)).addVector(this.k4[1]).multByNumber(constants.delta_t / 6.0).addVector(this.saved_speed);
      return this.currentToZero();
    };

    Node.prototype.verlet = function() {
      var new_point;
      if (!this.pinned) {
        this.speed = this.point.substructVector(this.previous);
        new_point = this.point.multByNumber(2).substructVector(this.previous).addVector(this.get_a().multByNumber(constants.delta_t * constants.delta_t));
        this.previous = this.point;
        this.point = new_point;
      }
      return this.currentToZero();
    };

    return Node;

  })();

  Spring = (function() {
    function Spring(first_node, second_node, len) {
      this.first_node = first_node;
      this.second_node = second_node;
      this.len = len;
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

  WingPart = (function() {
    function WingPart(first, second, third) {
      this.first = first;
      this.second = second;
      this.third = third;
    }

    WingPart.prototype.force = function() {
      var area, f, s;
      f = this.first.point.vectorTo(this.second.point).proectionYZ();
      s = this.first.point.vectorTo(this.third.point).proectionYZ();
      area = 0.5 * Math.sqrt(f.product(f) * s.product(s) - f.product(s) * f.product(s));
      return constants.p.multByNumber(area);
    };

    WingPart.prototype.update_forces = function() {
      var force;
      force = this.force();
      this.first.current_pressure = this.first.current_pressure.addVector(force);
      this.second.current_pressure = this.second.current_pressure.addVector(force);
      return this.third.current_pressure = this.third.current_pressure.addVector(force);
    };

    return WingPart;

  })();

  Cloth = (function() {
    function Cloth(width, height, block_size) {
      var h, i, w, _i, _j, _k, _l, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      this.width = width;
      this.height = height;
      this.block_size = block_size;
      this.state = [];
      for (h = _i = 0, _ref = this.height; 0 <= _ref ? _i <= _ref : _i >= _ref; h = 0 <= _ref ? ++_i : --_i) {
        for (w = _j = 0, _ref1 = this.width; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; w = 0 <= _ref1 ? ++_j : --_j) {
          this.state.push(new Node(w * this.block_size, h * this.block_size, w * 100.0 / this.width));
        }
      }
      this.springs = [];
      for (h = _k = 0, _ref2 = this.height; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; h = 0 <= _ref2 ? ++_k : --_k) {
        for (w = _l = 0, _ref3 = this.width; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; w = 0 <= _ref3 ? ++_l : --_l) {
          if (w < this.width) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[h * (this.width + 1) + w + 1], this.block_size));
          }
          if (h < this.height) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[(h + 1) * (this.width + 1) + w], this.block_size));
          }
          if (w < this.width && h < this.height) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[(h + 1) * (this.width + 1) + w + 1], this.block_size * constants.sqrt_2));
            this.springs.push(new Spring(this.state[(h + 1) * (this.width + 1) + w], this.state[h * (this.width + 1) + w + 1], this.block_size * constants.sqrt_2));
          }
          if (w < this.width - 1) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[h * (this.width + 1) + w + 2], this.block_size * 2));
          }
          if (h < this.height - 1) {
            this.springs.push(new Spring(this.state[h * (this.width + 1) + w], this.state[(h + 2) * (this.width + 1) + w], this.block_size * 2));
          }
        }
      }
      this.wing_parts = [];
      for (h = _m = 0, _ref4 = this.height; 0 <= _ref4 ? _m <= _ref4 : _m >= _ref4; h = 0 <= _ref4 ? ++_m : --_m) {
        for (w = _n = 0, _ref5 = this.width; 0 <= _ref5 ? _n <= _ref5 : _n >= _ref5; w = 0 <= _ref5 ? ++_n : --_n) {
          if (w < this.width && h < this.height) {
            this.wing_parts.push(new WingPart(this.state[h * (this.width + 1) + w], this.state[h * (this.width + 1) + w + 1], this.state[(h + 1) * (this.width + 1) + w]));
          }
        }
      }
      for (i = _o = 0, _ref6 = this.height; 0 <= _ref6 ? _o <= _ref6 : _o >= _ref6; i = 0 <= _ref6 ? ++_o : --_o) {
        this.state[i * (this.width + 1)].pinned = true;
      }
    }

    Cloth.prototype.update_forces = function() {
      var spring, wing_part, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.springs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spring = _ref[_i];
        spring.update_forces();
      }
      _ref1 = this.wing_parts;
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        wing_part = _ref1[_j];
        _results.push(wing_part.update_forces());
      }
      return _results;
    };

    Cloth.prototype.verlet = function(time) {
      var node, _i, _len, _ref, _results;
      this.update_forces();
      _ref = this.state;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(node.verlet());
      }
      return _results;
    };

    Cloth.prototype.runge = function() {
      var node, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _results;
      this.update_forces();
      _ref = this.state;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        node.runge1();
      }
      this.update_forces();
      _ref1 = this.state;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        node.runge2();
      }
      this.update_forces();
      _ref2 = this.state;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        node = _ref2[_k];
        node.runge3();
      }
      this.update_forces();
      _ref3 = this.state;
      _results = [];
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        node = _ref3[_l];
        _results.push(node.runge4());
      }
      return _results;
    };

    Cloth.prototype.update = function() {
      this.verlet();
      this.verlet();
      this.verlet();
      this.verlet();
      this.verlet();
      return this.verlet();
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
        wireframe: false
      });
      material_yellow = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        wireframe: false
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
      this.camera.position.z = 500;
      this.camera.position.x = 400;
      this.camera.position.y = 200;
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
