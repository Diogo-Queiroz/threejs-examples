const renderer = new THREE.WebGLRenderer({ antialias: true });
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
const scene = new THREE.Scene();
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

const clock = new THREE.Clock();
const __shader = Shaders.BasicShader10C0;

let controls, light,
  shaderMaterial,
  speed = 0.01,
  toRotate = false;

function init() {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x004400);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  scene.position.set(0, -10, 0);
}

function setupCameraAndLight() {
  camera.position.set(-30, 10, 30);
  camera.lookAt(scene.position);
  scene.add(new THREE.AmbientLight(0x666666));

  light = new THREE.DirectionalLight(0xeeeeee);
  light.position.set(20, 60, 10);
  light.castShadow = true;
  light.target = scene;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 200;
  light.shadow.camera.left = -50;
  light.shadow.camera.right = 50;
  light.shadow.camera.top = 50;
  light.shadow.camera.bottom = -50;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  scene.add(light);

  let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);//skycolor, groundcolor, intensity
  hemiSphereLight.position.set(0, 100, 0);
  scene.add(hemiSphereLight);
}

function createGeometry() {
  scene.add(new THREE.AxesHelper(100));

  shaderMaterial = new THREE.ShaderMaterial(
    {
      uniforms: __shader.uniforms,
      vertexShader: __shader.vertexShader,
      fragmentShader: __shader.fragmentShader,
      transparent: true
    }
  );


  let side = 10;
  let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60, 50, 50),
    new THREE.MeshStandardMaterial({color: 0xeeeeee})
  );
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI * 0.5;
  scene.add(plane);

  let mesh = new THREE.Mesh(
    new THREE.BoxGeometry(side, side, side, 20, 20),
    shaderMaterial
  );
  mesh.position.set(10, 10, 10);
  mesh.rotation.set(Math.PI * 0.6, 0, Math.PI * 0.3);
  mesh.castShadow = true;
  scene.add(mesh);

  // __shader.uniforms.textureA.value = new THREE.TextureLoader().load('assets/textures/general/floor-Diogo.jpg');
  // __shader.uniforms.textureB.value = new THREE.TextureLoader().load('assets/textures/alpha/partial-transparency.png');


  var torusKnot = new THREE.Mesh( new THREE.TorusKnotGeometry( 10, 3, 100, 16 ), shaderMaterial );
  torusKnot.scale.set(.5,.5,.5)
  torusKnot.position.set(-10,10,-10);
  torusKnot.castShadow = true;
  scene.add( torusKnot );
  console.log(`Using ${__shader.name}`);

}

function setupDatGui() {
  controls = new function() {
    this.rotate = toRotate;
  }

  let gui = new dat.GUI();
  gui.add(controls, 'rotate').onChange((e) => toRotate = e);
}

function render() {
  orbitControls.update();
  if (toRotate)
      scene.rotation.y += speed;//rotates the scene
  __shader.uniforms.time.value = clock.getElapsedTime() * 0.5;
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

window.onload = () => {
  init();
  setupCameraAndLight();
  createGeometry();
  setupDatGui();
  render();
}
