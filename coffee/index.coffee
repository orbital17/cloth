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

  proectionYZ: ->
    return new Vector3D(0, @coords[1], @coords[2])

  product: (other) ->
    return @coords[0] * other.coords[0] + @coords[1] * other.coords[1] + @coords[2] * other.coords[2]


constants =
  m: 1.0
  gravity_acceleration: new Vector3D(0, -0.01, 0)
  k: 7.0
  sqrt_2: Math.sqrt(2)
  delta_t: 1.0
  p: new Vector3D(0.00003, 0, 0)
  d: 0.0005

class Node
  constructor: (x, y, z) ->
    @point = new Vector3D(x, y, z)
    @previous = new Vector3D(x, y, z)
    @springs = []
    @current_spring_force = new Vector3D(0, 0, 0)
    @current_pressure = new Vector3D(0, 0, 0)
    @pinned = false

    @speed = new Vector3D(0, 0, 0)
    @saved_point = 0
    @saved_speed = 0

  get_a: ->
    if !@pinned
      return (@current_spring_force.addVector(@current_pressure).
      addVector(@speed.multByNumber(-constants.d)).multByNumber(1/constants.m)
      .addVector(constants.gravity_acceleration))
    else
      return new Vector3D(0, 0, 0)

  currentToZero: ->
    @current_spring_force.toZero()
    @current_pressure.toZero()

  runge1: ->
    @k1 = [@speed, @get_a()]
    @saved_point = @point
    @saved_speed = @speed
    @point = @saved_point.addVector(@k1[0].multByNumber(constants.delta_t / 2.0))
    @speed = @saved_speed.addVector(@k1[1].multByNumber(constants.delta_t / 2.0))
    @currentToZero()

  runge2: ->
    @k2 = [@speed, @get_a()]
    @point = @saved_point.addVector(@k2[0].multByNumber(constants.delta_t / 2.0))
    @speed = @saved_speed.addVector(@k2[1].multByNumber(constants.delta_t / 2.0))
    @currentToZero()

  runge3: ->
    @k3 = [@speed, @get_a()]
    @point = @saved_point.addVector(@k3[0].multByNumber(constants.delta_t))
    @speed = @saved_speed.addVector(@k3[1].multByNumber(constants.delta_t))
    @currentToZero()

  runge4: ->
    @k4 = [@speed, @get_a()]
    @point = @k1[0].addVector(@k2[0].multByNumber(2)).addVector(@k3[0].multByNumber(2))
    .addVector(@k4[0]).multByNumber(constants.delta_t / 6.0).addVector(@saved_point)
    @speed = @k1[1].addVector(@k2[1].multByNumber(2)).addVector(@k3[1].multByNumber(2))
    .addVector(@k4[1]).multByNumber(constants.delta_t / 6.0).addVector(@saved_speed)
    @currentToZero()

  verlet: ->
    if !@pinned
      @speed = @point.substructVector(@previous)
      new_point = @point.multByNumber(2).substructVector(@previous).addVector(
        @get_a().multByNumber(constants.delta_t * constants.delta_t)
      )
      @previous = @point
      @point = new_point

    @currentToZero()



class Spring
  constructor: (@first_node, @second_node, @len) ->
    @len = @first_node.point.vectorTo(@second_node.point).norm()
    @first_node.springs.push(@)
    @second_node.springs.push(@)

  force: ->
    @first_node.point.vectorTo(@second_node.point).subtructNumber(@len).multByNumber(constants.k/@len)

  update_forces: ->
    force = @force()
    @first_node.current_spring_force = @first_node.current_spring_force.addVector(force)
    @second_node.current_spring_force = @second_node.current_spring_force.addVector(force.multByNumber(-1))


class WingPart
  constructor: (@first, @second, @third) ->

  force: ->
    f = @first.point.vectorTo(@second.point).proectionYZ()
    s = @first.point.vectorTo(@third.point).proectionYZ()
    area = 0.5 * Math.sqrt(f.product(f) * s.product(s) - f.product(s) * f.product(s))
    return constants.p.multByNumber(area)

  update_forces: ->
    force = @force()
    @first.current_pressure = @first.current_pressure.addVector(force)
    @second.current_pressure = @second.current_pressure.addVector(force)
    @third.current_pressure = @third.current_pressure.addVector(force)



class Cloth
  constructor: (@width, @height, @block_size) ->
    @state = []
    for h in [0..@height]
      for w in [0..@width]
        @state.push(new Node(w * @block_size, h * @block_size, w * 100.0/ @width))

    @springs = []
    for h in [0..@height]
      for w in [0..@width]
        if w < @width
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[h * (@width + 1) + w + 1], @block_size))
        if h < @height
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[(h + 1) * (@width + 1) + w], @block_size))
        if w < @width && h < @height
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[(h + 1) * (@width + 1) + w + 1], @block_size * constants.sqrt_2))
          @springs.push(new Spring(@state[(h + 1) * (@width + 1) + w], @state[h * (@width + 1) + w + 1], @block_size * constants.sqrt_2))
        if w < @width - 1
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[h * (@width + 1) + w + 2], @block_size * 2))
        if h < @height - 1
          @springs.push(new Spring(@state[h * (@width + 1) + w], @state[(h + 2) * (@width + 1) + w], @block_size * 2))

    @wing_parts = []
    for h in [0..@height]
      for w in [0..@width]
        if w < @width && h < @height
          @wing_parts.push(new WingPart(@state[h * (@width + 1) + w], @state[h * (@width + 1) + w + 1], @state[(h + 1) * (@width + 1) + w]))

    for i in [0..@height]
      @state[i * (@width + 1)].pinned = true
#    @state[(@height + 1) * (@width + 1) - 1].pinned = true

  update_forces: ->
    for spring in @springs
      spring.update_forces()

    for wing_part in @wing_parts
      wing_part.update_forces()


  verlet: (time) ->
    @update_forces()
    for node in @state
      node.verlet()

  runge: ->
    @update_forces()
    for node in @state
      node.runge1()
    @update_forces()
    for node in @state
      node.runge2()
    @update_forces()
    for node in @state
      node.runge3()
    @update_forces()
    for node in @state
      node.runge4()


  update: ->
    @verlet()
    @verlet()
    @verlet()
    @verlet()
    @verlet()
    @verlet()


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
    material_blue = new THREE.MeshBasicMaterial(color: 0x0057b8, wireframe: false)
    material_yellow = new THREE.MeshBasicMaterial(color: 0xffd700, wireframe: false)
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
    @camera.position.z = 500
    @camera.position.x = 400
    @camera.position.y = 200
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
