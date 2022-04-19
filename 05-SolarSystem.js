// global variables
let renderer, scene, camera, orbitControl;

let Sun;
let Mercury;
let Venus;
let Earth, EarthMoon;
let Mars;
let Jupiter, Amalthea, Io, Europa, Ganymede, Callisto;
let Saturn, Titan, SatMoon2, SatMoon3;
let Uranus;
let Neptune;
let Pluto;

let axesHelper;

let quaternion, axis;

let control, stats;

// initialize the threejs environment
function init()
{
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);
}

function setupCameraAndLight()
{
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000000);
  const ambientLight = new THREE.AmbientLight(0x404040);
  camera.position.z = 0;
  camera.position.x = 0;
  camera.position.y = 3500;
  scene.add(ambientLight);

  orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
}

function setupDatGui()
{
  stats = new Stats();
  document.body.appendChild(stats.dom);
  control = new function()
  {
    this.speed_mercury = 0.02;
    this.speed_venus = 0.016;
    this.speed_earth = 0.013;
    this.speed_mars = 0.01;
    this.speed_jupiter = 0.0079;
    this.speed_saturn = 0.0056;
    this.speed_uranus = 0.0025;
    this.speed_neptune = 0.0012;
    this.speed_pluto = 0.0006;
    this.speed_earth_moon = 0.1;
    this.speed_jupiter_moons = 0.02;
    this.speed_saturn_moons = 0.013;
    this.camera_target = new THREE.Object3D();
    this.camera_targets = [];
    this.ChangeTarget = () =>
    {
      console.log(`Selected Planet ${this.camera_targets}`);
      switch (this.camera_targets)
      {
        case "sun":
          this.camera_target = Sun;
          break;
        case "mercury":
          this.camera_target = Mercury;
          break
        case "venus":
          this.camera_target = Venus;
          break
        case "earth":
          this.camera_target = Earth;
          break
        case "mars":
          this.camera_target = Mars;
          break
        case "jupiter":
          this.camera_target = Jupiter;
          break
        case "saturn":
          this.camera_target = Saturn;
          break
        case "uranus":
          this.camera_target = Uranus;
          break
        case "neptune":
          this.camera_target = Neptune;
          break
        case "pluto":
          this.camera_target = Pluto;
          break
      }
      console.log(`Looking at ${this.camera_target.name}`);
    }
  }
  let gui = new dat.GUI();
  gui.width = (window.innerWidth / 3);
  let earthFolder = gui.addFolder("Earth Info");
  let jupiterFolder = gui.addFolder("Jupiter Info");
  let saturnFolder = gui.addFolder("Saturn Info");

  gui.add(control, 'speed_mercury').min(0.0006).max(0.02).step(0.0001).name("Mercury Orbit Speed");
  gui.add(control, 'speed_venus').min(0.0006).max(0.02).step(0.0001).name("Venus Orbit Speed");
  gui.add(control, 'speed_mars').min(0.0006).max(0.02).step(0.0001).name("Mars Orbit Speed");
  gui.add(control, 'speed_uranus').min(0.0006).max(0.02).step(0.0001).name("Uranus Orbit Speed");
  gui.add(control, 'speed_neptune').min(0.0006).max(0.02).step(0.0001).name("Neptune Orbit Speed");
  gui.add(control, 'speed_pluto').min(0.0006).max(0.02).step(0.0001).name("Pluto Orbit Speed");
  gui.add(control, 'camera_targets',
      [
          'sun', 'mercury', 'venus', 'earth', 'mars',
          'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
      ]).name("Planets to look at");
  gui.add(control, 'ChangeTarget');

  earthFolder.add(control, 'speed_earth').min(0.0006).max(0.02).step(0.0001).name("Earth Orbit Speed");
  earthFolder.add(control, 'speed_earth_moon').min(0.0013).max(0.02).step(0.0001).name("Earth Moon Orbit Speed");

  jupiterFolder.add(control, 'speed_jupiter').min(0.0006).max(0.02).step(0.0001).name("Jupiter Orbit Speed");
  jupiterFolder.add(control, 'speed_jupiter_moons').min(0.0013).max(0.02).step(0.0001).name("Jupiter Moons Orbit Speed");

  saturnFolder.add(control, 'speed_saturn').min(0.0006).max(0.02).step(0.0001).name("Saturn Orbit Speed");
  saturnFolder.add(control, 'speed_saturn_moons').min(0.0013).max(0.02).step(0.0001).name("Saturn Moons Orbit Speed");

}

/**
 * 		        Sun	    *Mercury  *Venus    *Earth    *Mars     °Jupiter  °Saturn   ‡Uranus   ‡Neptune
 Size	km	    696,342	2,439.64  6,051.59  6,378.10  3,397.00  71,492.68 60,267.14 25,557.25 24,766.36
 Size	pixels	696	    2	      6	        6	      3	        71	      60	    26	      25
 */
function createGeometry()
{
  // Creation of the sun
  Sun = meshBuilder(285.4, 50, 0xEEF40B,"Sun", 0,0,0);

  Mercury = meshBuilder(9.5, 50, 0xe1dfe0,"Mercury", 350,0,0);

  Venus = meshBuilder(15, 50, 0xdcc661,"Venus", 350 * 1.289,0,0);

  // Planet earth and the moon
  Earth = meshBuilder(15.4, 50, 0x159ed7,"Earth", 350 * 1.5,0,0);
  EarthMoon = meshBuilder(2, 50, 0xDDDDDD,"Earth Moon", 30,0,0);
  Earth.add(EarthMoon);

  Mars = meshBuilder(10.6, 50, 0xe14444,"Mars", 350 * 1.7,0,0);

  // Planet Jupiter, 5 moons and 1 ring
  Jupiter = meshBuilder(80, 50, 0x83F10C,"Jupiter", 350 * 4.5,0,0);
  Amalthea = meshBuilder(5, 50, 0xFFFFFF, "Amalthea - Jupiter Moon", -100,15,20);
  Io = meshBuilder(5, 50, 0xFFFFFF, "Io - Jupiter Moon", 105,-15,20);
  Europa = meshBuilder(5, 50, 0xFFFFFF, "Europa - Jupiter Moon", -110,0,0);
  Ganymede = meshBuilder(5, 50, 0xFFFFFF, "Ganymede - Jupiter Moon", 115,15,-20);
  Callisto = meshBuilder(5, 50, 0xFFFFFF, "Callisto - Jupiter Moon", -125,-15,-20);
  Jupiter.add(Amalthea, Io, Europa, Ganymede, Callisto);
  let JupiterRing = ringBuilder(85, 105, 50, 0x84f20d, 0.75);
  Jupiter.add(JupiterRing);

  // Planet Saturn, 3 moons and 4 rings
  Saturn = meshBuilder(60, 50, 0xBF0CF1,"Saturn", 350 * 5.9,0,0);
  Titan = meshBuilder(7, 50, 0xffffff, "Saturn Moons", 90,0,15);
  SatMoon2 = meshBuilder(5, 50, 0xffffff, "Saturn Moons", 100,25,-5);
  SatMoon3 = meshBuilder(5, 50, 0xffffff, "Saturn Moons", 110,-25,5);
  Saturn.add(Titan, SatMoon2, SatMoon3);
  let SaturnRing1 = ringBuilder(60, 70, 50, 0xDF2CF2, 0.5);
  let SaturnRing2 = ringBuilder(75, 95, 50, 0xDF2CF2, 0.525);
  let SaturnRing3 = ringBuilder(100, 130, 50, 0xDF2CF2, 0.55);
  Saturn.add(SaturnRing1, SaturnRing2, SaturnRing3);

  Uranus = meshBuilder(34, 50, 0x1be6c2,"Uranus", 350 * 7.4,0,0);

  Neptune = meshBuilder(30.8, 50, 0x0000ff,"Neptune", 350 * 8.3,0,0);

  Pluto = meshBuilder(9.5, 50, 0xe39e50, "Pluto", 350 * 10,0,0);

  scene.add(Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto);
}

function render()
{
  requestAnimationFrame(render);

  rotatePlanetSelf();
  /**
   * Planet rotation around the sun, different speeds.
   */
  quaternion.setFromAxisAngle(axis, control.speed_mercury); // angle defines the speed of the quaternion lager faster
  Mercury.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_venus); // angle defines the speed of the quaternion lager faster
  Venus.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_earth); // angle defines the speed of the quaternion lager faster
  Earth.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_mars); // angle defines the speed of the quaternion lager faster
  Mars.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_jupiter); // angle defines the speed of the quaternion lager faster
  Jupiter.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_saturn); // angle defines the speed of the quaternion lager faster
  Saturn.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_uranus); // angle defines the speed of the quaternion lager faster
  Uranus.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_neptune); // angle defines the speed of the quaternion lager faster
  Neptune.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, control.speed_pluto); // angle defines the speed of the quaternion lager faster
  Pluto.position.applyQuaternion(quaternion);

  /**
   * Moon Rotation Section
   */
  quaternion.setFromAxisAngle(axis, -(control.speed_earth_moon));
  EarthMoon.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_jupiter_moons + 0.028));
  Amalthea.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_jupiter_moons + 0.090));
  Io.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_jupiter_moons + 0.076));
  Europa.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_jupiter_moons + 0.065));
  Ganymede.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_jupiter_moons + 0.038));
  Callisto.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_saturn_moons + 0.053));
  Titan.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_saturn_moons + 0.049));
  SatMoon2.position.applyQuaternion(quaternion);

  quaternion.setFromAxisAngle(axis, -(control.speed_saturn_moons + 0.013));
  SatMoon3.position.applyQuaternion(quaternion);


  orbitControl.update();
  stats.update();
  camera.lookAt(control.camera_target.position.x, control.camera_target.position.y, control.camera_target.position.z);
  renderer.render(scene, camera);
}

window.onload = () =>
{
  init();
  setupCameraAndLight();
  createGeometry();
  //createAxesHelper();
  createAxisAndQuaternion();
  setupDatGui();
  control.camera_target.position.set(0,0,0);
  render();
}

/** my methods */
// this method will create the sun, planets and moons
function meshBuilder(radius, segments, color, name, initialPositionX, initialPositionY, initialPositionZ)
{
  let mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius,segments,segments),
      new THREE.MeshBasicMaterial({ color: color })
  );
  mesh.name = name;
  mesh.position.set(
      initialPositionX, initialPositionY, initialPositionZ
  );
  return mesh;
}

function ringBuilder(innerRadius, outerRadius, segments, color, rotation)
{
  let ring = new THREE.Mesh(
      new THREE.RingGeometry(innerRadius, outerRadius, segments),
      new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide}));
  ring.rotateX(Math.PI * rotation);
  return ring;
}

function createAxisAndQuaternion()
{
  axis = new THREE.Vector3(0,1,0).normalize();
  quaternion = new THREE.Quaternion();
}

function rotatePlanetSelf()
{
  Sun.rotation.y += 0.001;
  Earth.rotation.y += 0.01;
  Venus.rotation.y += 0.002;
  Mercury.rotation.y += 0.008;
  Mars.rotation.y += 0.009;
  Jupiter.rotation.y += 0.01;
  Saturn.rotation.y += 0.02;
  Uranus.rotation.y += 0.001;
  Neptune.rotation.y += 0.007;
}

function createAxesHelper()
{
  axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);
}
