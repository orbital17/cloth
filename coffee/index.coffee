camera = undefined
scene = undefined
renderer = undefined
geometry = undefined
material = undefined
mesh = undefined

init = ->
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.z = 1000
  scene = new THREE.Scene()
  geometry = new THREE.BoxGeometry 200, 200, 200
  material = new THREE.MeshBasicMaterial(color: 0xff0000)
  mesh = new THREE.Mesh(geometry, material)
  scene.add mesh
  renderer = new THREE.CanvasRenderer()
  renderer.setSize window.innerWidth, window.innerHeight
  document.body.appendChild renderer.domElement
  return
animate = ->
  
  # note: three.js includes requestAnimationFrame shim
  requestAnimationFrame animate
  renderer.render scene, camera
  return

$ ->
  init()
  animate()
  return
