class Vector3D
    constructor: (x, y, z) ->
        @coords = [x, y, z]

    x: -> @coords[0]
    y: -> @coords[1]
    z: -> @coords[2]


class Cloth
  constructor: (@width, @height, @block_size) ->
    @state = ((new Vector3D(w * @block_size, h * @block_size, 0) for w in [0..@width]) for h in [0..@height])
    

class UkrainianFlag extends Cloth
  constructor: () ->
    super 30, 20, 30
    @initGeometry()

  initGeometry: () ->
    @geometry = new THREE.Geometry()
    blue = new THREE.Color(0x00ffff)
    for row in @state
      for point in row
        @geometry.vertices.push(new THREE.Vector3 point.coords...)
    for i in [0...@height]
      for j in [0...@width]
        face = new THREE.Face3(i * (@width + 1) + j, i * (@width + 1) + j + 1, (i + 1) * (@width + 1) + j + 1,  null, null, if i >= @height / 2 then 0 else 1)
        @geometry.faces.push(face)
        face = new THREE.Face3(i * (@width + 1) + j, (i + 1) * (@width + 1) + j + 1, (i + 1) * (@width + 1) + j, null, null, if i >= @height / 2 then 0 else 1)
        @geometry.faces.push(face)

    return

  mesh: ->
    material_blue = new THREE.MeshBasicMaterial(color: 0x0057b8, wireframe: true)
    material_yellow = new THREE.MeshBasicMaterial(color: 0xffd700, wireframe: true)
    material = new THREE.MeshFaceMaterial([material_blue, material_yellow])
    return new THREE.Mesh(@geometry, material)



class Runner
  constructor: (mesh) ->
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    @camera.position.z = 1000
    @scene = new THREE.Scene()
    @scene.add mesh
    @renderer = new THREE.CanvasRenderer()
    @renderer.setSize window.innerWidth, window.innerHeight
    document.body.appendChild @renderer.domElement
    return

  animate: () =>
    requestAnimationFrame @animate
    @renderer.render @scene, @camera
    return

  run: () ->
    @animate()


$ ->
  flag = new UkrainianFlag()
  new Runner(flag.mesh()).run()
