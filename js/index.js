// Generated by CoffeeScript 1.7.1
(function() {
  var animate, camera, geometry, init, material, mesh, renderer, scene;

  camera = void 0;

  scene = void 0;

  renderer = void 0;

  geometry = void 0;

  material = void 0;

  mesh = void 0;

  init = function() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene = new THREE.Scene();
    geometry = new THREE.BoxGeometry(200, 200, 200);
    material = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  };

  animate = function() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  $(function() {
    init();
    animate();
  });

}).call(this);
