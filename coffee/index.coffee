class Vector3D
    constructor: (x, y, z) ->
        @coords = [x, y, z]

    x: -> @coords[0]
    y: -> @coords[1]
    z: -> @coords[2]

    vectorTo: (other_point) ->
      return new Vector3D((other_point.coords[i] - @coords[i] for i in [0...3])...)

    multByNumber: (number) ->
      return new Vector3D((i * number for i in @coords)...)

    subtructNumber: (number) ->
      return @normalize().multByNumber(number).vectorTo(@)

    normalize: ->
      norm = Math.sqrt(@coords[0] * @coords[0] + @coords[1] * @coords[1] + @coords[2] * @coords[2])
      return @multByNumber(1.0 / norm)


class Cloth
  constructor: (@width, @height, @block_size) ->
    @state = ((new Vector3D(w * @block_size, h * @block_size, 0) for w in [0..@width]) for h in [0..@height])
    @m = 1.0 / (@height * @width)
    @gravity = new Vector3D(0, -10 * @m, 0)
    @k = [1.0, 1.0, 1.0]

  update: (time) ->
    for row in @state
      for point in row
        point.coords[0] -= 1

  hookeForce: (i, j) ->
    return

  hookeForce_spring: (i, j, _i, _j) ->
    if not (0 <= i <= @width and 0 <= j <= @height)
      return 0
    sum = (i - _i) * (i - _i) + (j - _j) * (j - _j)
    k = l = 0
    switch sum
      when 1
        k = @k[0]
        l = @block_size
      when 2
        k = @k[1]
        l = @block_size * Math.sqrt(2)
      when 4
        k = @k[2]
        l = @block_size * 2
      else
        console.log "error"
        return 0
    return @state[j][i].vectorTo(@state[_j][_i]).subtructNumber(l).multByNumber(k / l)




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
        face = new THREE.Face3(i * (@width + 1) + j, (i + 1) * (@width + 1) + j + 1,  i * (@width + 1) + j + 1, null, null, if i >= @height / 2 then 0 else 1)
        @geometry.faces.push(face)
        face = new THREE.Face3(i * (@width + 1) + j, (i + 1) * (@width + 1) + j, (i + 1) * (@width + 1) + j + 1, null, null, if i >= @height / 2 then 0 else 1)
        @geometry.faces.push(face)

    return

  mesh: ->
    material_blue = new THREE.MeshBasicMaterial(color: 0x0057b8, wireframe: true)
    material_yellow = new THREE.MeshBasicMaterial(color: 0xffd700, wireframe: true)
    material = new THREE.MeshFaceMaterial([material_blue, material_yellow])
    return new THREE.Mesh(@geometry, material)

  update: (time) ->
    super time
    for i in [0..@height]
      for j in [0..@width]
        @geometry.vertices[i * (@width + 1) + j] = new THREE.Vector3(@state[i][j].coords...)
    return



class Runner
  constructor: (@updatable_meshable) ->
    @camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
    @camera.position.z = 1000
    @scene = new THREE.Scene()
    @scene.add @updatable_meshable.mesh()
    @renderer = new THREE.CanvasRenderer()
    @renderer.setSize window.innerWidth, window.innerHeight
    document.body.appendChild @renderer.domElement
    return

  animate: (time) =>
    requestAnimationFrame @animate
    @updatable_meshable.update(time)
    @renderer.render @scene, @camera
    return

  run: () ->
    requestAnimationFrame @animate


$ ->
  new Runner(new UkrainianFlag()).run()
