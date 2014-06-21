class Vector3D
  constructor: (x, y, z) ->
      @coords = [x, y, z]

  x: -> @coords[0]
  y: -> @coords[1]
  z: -> @coords[2]

  vectorTo: (other) ->
    return new Vector3D(other.coords[0] - @coords[0], other.coords[1] - @coords[1], other.coords[2] - @coords[2])

  substructVector: (other) ->
    return new Vector3D(@coords[0] - other.coords[0], @coords[1] - other.coords[1], @coords[2] - other.coords[2])

  addVector: (other) ->
    return new Vector3D(@coords[0] + other.coords[0], @coords[1] + other.coords[1], @coords[2] + other.coords[2])

  multByNumber: (number) ->
    return new Vector3D(@coords[0] * number, @coords[1] * number, @coords[2] * number)

  subtructNumber: (number) ->
    return @normalize().multByNumber(number).vectorTo(@)

  norm: ->
    Math.sqrt(@coords[0] * @coords[0] + @coords[1] * @coords[1] + @coords[2] * @coords[2])

  normalize: ->
    return @multByNumber(1.0 / @norm())

  toZero: ->
    @coords = [0, 0, 0]


constants =
  m: 0.001
  gravity_acceleration: new Vector3D(0, -10, 0)
  k: 7

class Node
  constructor: (x, y, z) ->
    @point = new Vector3D(x, y, z)
    @previous = new Vector3D(x, y, z)
    @springs = []
    @current_spring_force = new Vector3D(0, 0, 0)
    @pinned = false

  update: ->
    if !@pinned
      new_point = @point.multByNumber(2).substructVector(@previous).addVector(
        @current_spring_force.multByNumber(1/constants.m).addVector(constants.gravity_acceleration).multByNumber(0.001)
      )
      @previous = @point
      @point = new_point
    @current_spring_force.toZero()



class Spring
  constructor: (@first_node, @second_node) ->
    @len = @first_node.point.vectorTo(@second_node.point).norm()
    @first_node.springs.push(@)
    @second_node.springs.push(@)

  force: ->
    @first_node.point.vectorTo(@second_node.point).subtructNumber(@len).multByNumber(constants.k/@len)

  update_forces: ->
    force = @force()
    @first_node.current_spring_force = @first_node.current_spring_force.addVector(force)
    @second_node.current_spring_force = @second_node.current_spring_force.addVector(force.multByNumber(-1))


class Cloth
  constructor: (@width, @height, @block_size) ->
    @state = []
    for h in [0..@height]
      for w in [0..@width]
        @state.push(new Node(w * @block_size, h * @block_size, 0))

    @springs = []
    for h in [0..@height]
      for w in [0..@width]
        if w < @width
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[h * (@width + 1) + w + 1]))
        if h < @height
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[(h + 1) * (@width + 1) + w]))
#        if w < @width && h < @height
#          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[(h + 1) * (@width + 1) + w + 1]))
#          @springs.push(new Spring(@state[(h + 1) * (@width + 1) + w], @state[h * (@width + 1) + w + 1]))
#        if w < @width - 1
#          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[h * (@width + 1) + w + 2]))
#        if h < @height - 1
#          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[(h + 2) * (@width + 1) + w]))

    @state[@height * (@width + 1)].pinned = true
#    @state[(@height + 1) * (@width + 1) - 1].pinned = true


  update: (time) ->
    for spring in @springs
      spring.update_forces()

    for node in @state
      node.update()


class UkrainianFlag extends Cloth
  constructor: () ->
    super 24, 16, 30
    @initGeometry()

  initGeometry: () ->
    @geometry = new THREE.Geometry()
    blue = new THREE.Color(0x00ffff)
    for node in @state
        @geometry.vertices.push(new THREE.Vector3 node.point.coords...)
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
    for i in [0...(@height + 1) * (@width + 1)]
      @geometry.vertices[i] = new THREE.Vector3(@state[i].point.coords...)
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
