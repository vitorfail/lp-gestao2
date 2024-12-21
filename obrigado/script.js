
const windForce = new THREE.Vector3(0, 0, 0);
const GRAVITY = 1000;
let intersectionPoint = new THREE.Vector3(1000,1000,1000);
let start = Date.now();

let container;
let camera,camera2,camera3, scene,scene2,scene3, renderer,renderer2,renderer3;

let flag1, flag2, flag3;

let plane;
let ray, mouse, mousereleaseInterval, mousemoved = false;

const dimensions = { x: 600, y: 380 };

class Vertex {
  constructor(x, y, z, mass, drag, geoSolver) {
    this.position = new THREE.Vector3();
    this.previous = new THREE.Vector3();
    this.original = new THREE.Vector3();
    this.a = new THREE.Vector3(0, 0, 0); // acceleration
    this.mass = mass;
    this.drag = drag;
    this.invMass = 1 / mass;
    this.tmp = new THREE.Vector3();
    this.tmp2 = new THREE.Vector3();
    
    // init
    geoSolver(x, y, this.position); // position
    geoSolver(x, y, this.previous); // previous
    geoSolver(x, y, this.original);
  }
  
  addForce(force) {
    this.a.add(
      this.tmp2.copy(force).multiplyScalar(this.invMass)
    );
  }
  
  integrate(timesq) {
    let newPos = this.tmp.subVectors(this.position, this.previous);
    newPos.multiplyScalar(this.drag).add(this.position);
    newPos.add(this.a.multiplyScalar(timesq));

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.a.set(0, 0, 0);
  }
  
  reset(x, y, z, geoSolver) {
    this.position.x = this.original.x;
    this.position.y = this.original.y;
    this.position.z = this.original.z;
    
    this.previous.x = this.original.x;
    this.previous.y = this.original.y;
    this.previous.z = this.original.z;
  }
}
var diff = new THREE.Vector3();
class Flag {
  constructor(w, h, x, y, textureURL) {
    
    // Set up the basic requirements
    // ---------------------------------------------------------------------------
    this._particles = [];
    this._constraints = [];
    this._pins = Array.from({length:11},(v,k)=>k);
    // this._pins = [0, 1, 2, 3, 5, 10];
    let timestep = 18 / 1000;
    this.timestepSq = timestep * timestep;
    // If we ever have a setter for mass or gravity, this should also be set there
    this._gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(this.mass);
    this.tempV3 = new THREE.Vector3();
    
    this.width = w;
    this.height = h;    
    
    // Initialise the particles
    // ---------------------------------------------------------------------------
    this.initialiseParticles();
    
    // Set up the three JS stuff
    // ---------------------------------------------------------------------------
    var loader = new THREE.TextureLoader();
    var clothTexture = loader.load( textureURL );
    clothTexture.flipY = false;
    this.clothMaterial = new THREE.MeshStandardMaterial( {
      map: clothTexture,
      side: THREE.DoubleSide,
      metalness: .4,
      roughness: .6,
      bumpMap: clothTexture,
      transparent: true
    } );
    
    this.geometry = new THREE.ParametricBufferGeometry( this.geoSolver, this.segs[0], this.segs[1] );
    
    this.mesh = new THREE.Mesh( this.geometry, this.clothMaterial );
    this.mesh.position.set(x,y,0);
  }
  
  reset() {
    this.particles.forEach((particle, i) => {
      particle.reset();
    });
  }
  
  initialiseParticles() {
    let u, v;
    
    // Create particles
    for (v = 0; v <= this.segs[1]; v++) {
      for (u = 0; u <= this.segs[0]; u++) {
        this.particles.push(
          new Vertex(u / this.segs[0] * (1. - (v / this.segs[1])), v / this.segs[1], 0, this.mass - (v / this.segs[1]) * .1, this.drag, this.geoSolver)
        );
      }
    }

    // Structural
    for (v = 0; v < this.segs[1]; v++) {
      for (u = 0; u < this.segs[0]; u++) {
        this.constraints.push([
          this.particles[this.index(u, v)],
          this.particles[this.index(u, v + 1)],
          this.restDistance
        ]);
        this.constraints.push([
          this.particles[this.index(u, v)],
          this.particles[this.index(u + 1, v)],
          this.restDistance
        ]);
      }
    }

    u = this.segs[0];
    for (v = 0; v < this.segs[1]; v++) {
      this.constraints.push([
        this.particles[this.index(u, v)],
        this.particles[this.index(u, v + 1)],
        this.restDistance
      ]);
    }

    v = this.segs[1];
    for (u = 0; u < this.segs[0]; u++) {
      this.constraints.push([
        this.particles[this.index(u, v)],
        this.particles[this.index(u + 1, v)],
        this.restDistance
      ]);
    }
  }
  
  index(u, v) {
    return u + v * (this.segs[0] + 1);
  }
  
  satisfyConstraints(p1, p2, distance) {
    
    diff.subVectors(p2.position, p1.position);
    var currentDist = diff.length();
    if (currentDist === 0) return; // prevents division by 0
    var correction = diff.multiplyScalar(1 - distance / currentDist);
    var correctionHalf = correction.multiplyScalar(0.5);
    p1.position.add(correctionHalf);
    p2.position.sub(correctionHalf);
  }
  
  solve(time) {

    if (!this.lastTime) {
      this.lastTime = time;
      return;
    }

    let i, j, il, particles, particle, pt, constraints, constraint;
    // wind
    {
      let indx;
      let normal = new THREE.Vector3();
      let indices = this.geometry.index;
      let normals = this.geometry.attributes.normal;
      let tmpForce = new THREE.Vector3();
      let wind = windForce.clone();

      particles = this.particles;

      for (i = 0, il = indices.count; i < il; i += 3) {
        for (j = 0; j < 3; j++) {
          indx = indices.getX(i + j);
          normal.fromBufferAttribute(normals, indx)
          tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(wind));
          particles[indx].addForce(tmpForce);
        }
      }
    }
    
    const mw = this.mesh.matrixWorld;

    for (i = 0; i < this.particles.length; i++) {
      particle = this.particles[i];
      var vector = particle.position.clone();
      vector.applyMatrix4( mw );
      diff = diff.subVectors(vector, intersectionPoint);
      if(diff.length() < 100) {
        let force = new THREE.Vector3(0,0,-30000);
        force = force.multiplyScalar((1. / diff.length()));
        particle.addForce(force);
      }
      // particle.addForce(THREE.Vector3(0,0,10) * 1. / diff.length);
      particle.addForce(this.gravity);
      particle.integrate(this.timestepSq);
    }

    // Start Constraints
    constraints = this.constraints;
    il = constraints.length;
    
    for (i = 0; i < il; i++) {
      constraint = constraints[i];
      this.satisfyConstraints(constraint[0], constraint[1], constraint[2]);
    }

    // Pin Constraints
    for (i = 0, il = this.pins.length; i < il; i++) {
      var xy = this.pins[i];
      var p = this.particles[xy];
      // console.log(p);
      p.position.copy(p.original);
      p.previous.copy(p.original);
    }
  }
  
  render() {
    for ( var i = 0, il = this.particles.length; i < il; i ++ ) {
      var v = this.particles[ i ].position;
      this.geometry.attributes.position.setXYZ( i, v.x, v.y, v.z );
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
  
  get geoSolver() {
    const w = this.width;
    const h = this.height;
    return (u, v, target) => {
      var x = (u - 0.5) * w;
      var y = (v + 0.5) * h;
      var z = (v) * -h;

      target.set(x, y, z);
    }
  }
  
  set width(value) {
    if(isNaN(value)) return;
    this._width = value;
  }
  get width() {
    return this._width || 100;
  }
  
  set height(value) {
    if(isNaN(value)) return;
    this._height = value;
  }
  get height() {
    return this._height || 100;
  }
  
  set pins(value) {
    if(!value || isNaN(value.length)) return;
    this._pins = value;
  }
  get pins() {
    return this._pins || [];
  }
  
  set seed(value) {
    if(isNaN(value)) return;
    this._seed = value;
  }
  get seed() {
    return this._seed || 0;
  }
  
  get drag() {
    return .97;
  }
  get mass() {
    return .2;
  }
  get restDistance() {
    return 25;
  }
  get segs() {
    return [10,14];
  }
  get gravity() {
    return this._gravity;
  }
  get particles() {
    return this._particles || [];
  }
  get constraints() {
    return this._constraints || [];
  }
}


function init1() {

  container = document.getElementById( 'espaco-bandeira1' );
  container2 = document.getElementById( 'bandeira1' )


  // scene

  scene = new THREE.Scene();
  

  // camera

  camera = new THREE.PerspectiveCamera( 30, container.offsetWidth / container.offsetHeight, 1, 10000 );
  camera.position.set( 0, -50, 1000 );

  // lights

  scene.add( new THREE.AmbientLight( 0x333333 ) );

  var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
  light.position.set( 50, 200, 150 );
  light.position.multiplyScalar( 1.3 );

  scene.add( light );

  // flag geometry
  flag1 = new Flag(25 * 10, 25 * 14, 0, 0, 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/thank-you.png');
  scene.add(flag1.mesh);
  
  flag1.clothMaterial.opacity = 0;
  
  // plane geometry
  let material = new THREE.MeshBasicMaterial( { color: 0xffff00, opacity: 0, transparent: true, depthWrite: false, depthTest: false } );
  plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 32 ), material );
  plane.position.z = -10;
  scene.add( plane );
  
  // Raycaster
  ray = new THREE.Raycaster();
  mouse = new THREE.Vector2(10000, 10000);
  function onMouseMove( event ) {
    clearTimeout(mousereleaseInterval);
    mousemoved = true;
    mousereleaseInterval = setTimeout(() => {
      mousemoved = false;
      intersectionPoint = new THREE.Vector3(1000,1000,1000);
    }, 1000);
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  window.addEventListener( 'mousemove', onMouseMove, false );

  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( 2 );
  renderer.setSize( container.offsetWidth, container.offsetHeight );

  container2.appendChild( renderer.domElement );

  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  renderer.shadowMap.enabled = true;

  window.addEventListener( 'resize', onWindowResize, false );

}
function init2() {

    container = document.getElementById( 'espaco-bandeira2' );
    container2 = document.getElementById( 'bandeira2' )
  
  
    // scene
  
    scene2 = new THREE.Scene();
    
  
    // camera
  
    camera2 = new THREE.PerspectiveCamera( 30, container.offsetWidth / container.offsetHeight, 1, 10000 );
    camera2.position.set( 0, -50, 1000 );
  
    // lights
  
    scene2.add( new THREE.AmbientLight( 0x333333 ) );
  
    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 50, 200, 150 );
    light.position.multiplyScalar( 1.3 );
  
    scene2.add( light );
  
    // flag geometry
    flag2 = new Flag(25 * 10, 25 * 14, 0, 0, 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/thank-you.png');
    scene2.add(flag2.mesh);
    
    flag2.clothMaterial.opacity = 0;
    
    // plane geometry
    let material = new THREE.MeshBasicMaterial( { color: 0xffff00, opacity: 0, transparent: true, depthWrite: false, depthTest: false } );
    plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 32 ), material );
    plane.position.z = -10;
    scene2.add( plane );
    
    // Raycaster
    ray = new THREE.Raycaster();
    mouse = new THREE.Vector2(10000, 10000);
    function onMouseMove( event ) {
      clearTimeout(mousereleaseInterval);
      mousemoved = true;
      mousereleaseInterval = setTimeout(() => {
        mousemoved = false;
        intersectionPoint = new THREE.Vector3(1000,1000,1000);
      }, 1000);
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    window.addEventListener( 'mousemove', onMouseMove, false );
  
    // renderer
  
    renderer2 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer2.setPixelRatio( 2 );
    renderer2.setSize( container.offsetWidth, container.offsetHeight );
  
    container2.appendChild( renderer2.domElement );
  
    renderer2.gammaInput = true;
    renderer2.gammaOutput = true;
  
    renderer2.shadowMap.enabled = true;
  
    window.addEventListener( 'resize', onWindowResize, false );
  
  }
  function init3() {

    container = document.getElementById( 'espaco-bandeira3' );
    container2 = document.getElementById( 'bandeira3' )
  
  
    // scene
  
    scene3 = new THREE.Scene();
    
  
    // camera
  
    camera3 = new THREE.PerspectiveCamera( 30, container.offsetWidth / container.offsetHeight, 1, 10000 );
    camera3.position.set( 0, -50, 1000 );
  
    // lights
  
    scene3.add( new THREE.AmbientLight( 0x333333 ) );
  
    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 50, 200, 150 );
    light.position.multiplyScalar( 1.3 );
  
    scene3.add( light );
  
    // flag geometry
    flag3 = new Flag(25 * 10, 25 * 14, 0, 0, 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/thank-you.png');
    scene3.add(flag3.mesh);
    
    flag3.clothMaterial.opacity = 0;
    
    // plane geometry
    let material = new THREE.MeshBasicMaterial( { color: 0xffff00, opacity: 0, transparent: true, depthWrite: false, depthTest: false } );
    plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 32 ), material );
    plane.position.z = -10;
    scene3.add( plane );
    
    // Raycaster
    ray = new THREE.Raycaster();
    mouse = new THREE.Vector2(10000, 10000);
    function onMouseMove( event ) {
      clearTimeout(mousereleaseInterval);
      mousemoved = true;
      mousereleaseInterval = setTimeout(() => {
        mousemoved = false;
        intersectionPoint = new THREE.Vector3(1000,1000,1000);
      }, 1000);
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
    window.addEventListener( 'mousemove', onMouseMove, false );
  
    // renderer
  
    renderer3 = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer3.setPixelRatio( 2 );
    renderer3.setSize( container.offsetWidth, container.offsetHeight );
  
    container2.appendChild( renderer3.domElement );
  
    renderer3.gammaInput = true;
    renderer3.gammaOutput = true;
  
    renderer3.shadowMap.enabled = true;
  
    window.addEventListener( 'resize', onWindowResize, false );
  
  }
function onWindowResize() {

  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  camera2.aspect = container.offsetWidth / container.offsetHeight;
  camera2.updateProjectionMatrix();
  camera3.aspect = container.offsetWidth / container.offsetHeight;
  camera3.updateProjectionMatrix();

  renderer.setSize( container.offsetWidth, container.offsetHeight );
  renderer2.setSize( container.offsetWidth, container.offsetHeight );
  renderer3.setSize( container.offsetWidth, container.offsetHeight );


}

function animate(t) {

  requestAnimationFrame( animate );

  let time = Date.now() - start;

  windStrength = Math.cos( time * .001 ) * 10 + 5;
  
  if(flag1.clothMaterial.opacity < 1) flag1.clothMaterial.opacity += 0.009;
  if(flag2.clothMaterial.opacity < 1) flag2.clothMaterial.opacity += 0.009;
  if(flag3.clothMaterial.opacity < 1) flag3.clothMaterial.opacity += 0.009;


  windForce.set( Math.sin( time / 2000 ), Math.cos( time / 3000 ), Math.sin( time / 1000 ) )
  windForce.normalize()
  windForce.multiplyScalar( windStrength );

  flag1.solve( time );
  flag1.render();

  flag2.solve( time );
  flag2.render();

  flag3.solve( time );
  flag3.render();
  // Raycasting
  

  
  
  renderer.render( scene, camera );
  renderer2.render( scene2, camera2 );
  renderer3.render( scene3, camera3 );

}
init3();
init2();
init1();


animate();
