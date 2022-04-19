// global variables
let renderer, scene, camera, orbitControl;
let controlUI;
let axesHelper;

let directionalLight, hemisphereLight;
let directionalShadowHelper;

let rotateScene = false;
// initialize the threejs environment
function init()
{
  scene = new THREE.Scene();
  scene.background = skyboxCubeTexture();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x999999);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
}

function skyboxCubeTexture()
{
  let cubeLoader = new THREE.CubeTextureLoader().setPath('assets/textures/');
  let urls =
    [
      '08-Diogo-01.png',
      '08-Diogo-02.png',
      '08-Diogo-03.png',
      '08-Diogo-04.png',
      '08-Diogo-05.png',
      '08-Diogo-06.png',
    ];
  return cubeLoader.load(urls);
}

function setupCameraAndLight()
{
  camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0,5,20);

  directionalLight = new THREE.DirectionalLight(new THREE.Color("white"), 0.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.mapSize.width = 1024 * 8;
  directionalLight.shadow.mapSize.height = 1024 * 8;
  directionalLight.position.set(0, 65, 60);

  let skyColor = new THREE.Color("skyblue");
  let groundColor = new THREE.Color("saddlebrown");

  hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor,  1);
  hemisphereLight.position.set(0,10, 0);

  let hemisphereHelper = new THREE.HemisphereLightHelper(hemisphereLight, 5);

  scene.add(directionalLight, hemisphereLight, hemisphereHelper);

  createShadowHelpers();
  orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
}

function createShadowHelpers()
{
  // Creating shadow Helpers;
  directionalShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  directionalShadowHelper.visible = false;
  directionalShadowHelper.scale.set(200, 200, 200);
  scene.add(directionalShadowHelper);
}

function createGeometry()
{
  // Create a plane step
  let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({color: new THREE.Color("gray"), side: THREE.DoubleSide})
  );
  plane.rotation.x = Math.PI * 0.5;
  plane.receiveShadow = true;
  scene.add(plane);

  // Create the alphamap text, material, and sphere
  let alpha = new THREE.TextureLoader().load('assets/textures/08-Diogo-07.png');
  let transparentMaterial = new THREE.MeshStandardMaterial({alphaMap: alpha, alphaTest: 0.2});
  let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(10, 80, 80),
    transparentMaterial
  );
  sphere.position.set(20, 15, 0);
  sphere.castShadow = true;
  scene.add(sphere);

  // Create the normal map
  let albedo = new THREE.TextureLoader().load('assets/textures/08-Diogo-08.jpg');
  let height = new THREE.TextureLoader().load('assets/textures/08-Diogo-09.png');
  let normal = new THREE.TextureLoader().load('assets/textures/08-Diogo-10.jpg');
  let rough = new THREE.TextureLoader().load('assets/textures/08-Diogo-11.jpg');
  let ambientOcclusion = new THREE.TextureLoader().load('assets/textures/08-Diogo-12.jpg');
  let opacity = new THREE.TextureLoader().load('assets/textures/08-Diogo-13.jpg');
  let metallic = new THREE.TextureLoader().load('assets/textures/08-Diogo-14.jpg');
  let normalAndShinnyMaterial = new THREE.MeshStandardMaterial(
    {
      normalMap: normal, roughnessMap: rough, // THREEjs said the Shininess is not a property of this material, changing to roughnessMap
      displacementMap: height, aoMap: ambientOcclusion, map: albedo, alphaMap: opacity, metalnessMap: metallic
    });
  let normalSphere = new THREE.Mesh(
    new THREE.SphereGeometry(10, 80, 80),
    normalAndShinnyMaterial
  );
  normalSphere.position.set(-20, 15, 0);
  normalSphere.castShadow = true;
  scene.add(normalSphere);

  // Create the reflective/refractive cube
  let reflectiveMaterial = new THREE.MeshStandardMaterial({envMap: skyboxCubeTexture(), metalness: 1, roughness: 0});
  reflectiveMaterial.mapping = THREE.CubeRefractionMapping;
  let reflectiveCube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    reflectiveMaterial
  );
  reflectiveCube.position.set(0, 25, 0);
  reflectiveCube.castShadow = true;
  scene.add(reflectiveCube);
}

function setupDatGui()
{
  controlUI = new function()
  {
    this.directionalLightColorUI = "#ffffff";
    this.skyColorUI = "#eeffcc";
    this.groundColorUI = "#22dd44"
    this.lightIntensityUI = 1;
    this.toggleShadowHelpers = false;
    this.rotateScene = false;
  }
  let gui = new dat.GUI();
  gui.width = (window.innerWidth / 2);
  gui.add(controlUI, "lightIntensityUI").min(0.5).max(30).step(.5).name("Light Intensity Slider").listen().onChange((value) => directionalLight.intensity = value);
  gui.addColor(controlUI, 'directionalLightColorUI').name("Directional Light Color").listen().onChange((value) => directionalLight.color = new THREE.Color(value));
  gui.addColor(controlUI, 'skyColorUI').name("Sky Light Color").listen().onChange((value) => hemisphereLight.skyColor = new THREE.Color(value));
  gui.addColor(controlUI, 'groundColorUI').name("Ground Light Color").listen().onChange((value) => hemisphereLight.groundColor = new THREE.Color(value));
  gui.add(controlUI, "toggleShadowHelpers").name("toggle Shadow Helpers").listen().onChange((value) => directionalShadowHelper.visible = value);
  gui.add(controlUI, "rotateScene").name('Rotate Scene').listen().onChange((value) => rotateScene = value);
}

function render()
{
  requestAnimationFrame(render);

  if (rotateScene)
  {
    scene.rotation.y += 0.01;
  }

  orbitControl.update();
  renderer.render(scene, camera);
}

function createAxesHelper()
{
  axesHelper = new THREE.AxesHelper(40);
  axesHelper.position.y = 0.01;
  scene.add(axesHelper);
}

window.onload = () =>
{
  init();
  setupDatGui();
  setupCameraAndLight();
  createGeometry();
  createAxesHelper();
  render();
}
