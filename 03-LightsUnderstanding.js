// global variables
let renderer, scene, camera, trackballControl;
let control;
let axesHelper;

let plane, cube, sphere;
let ambientLight, spotLight, pointLight, directionalLight, rectLight, hemisphereLight;

let lightHelpersContainer;
let spotLightHelper, pointLightHelper, directionalLightHelper, hemisphereLightHelper;

let shadowHelpersContainer;
let spotShadowHelper, pointShadowHelper, directionalShadowHelper;

// initialize the threejs environment
function init()
{
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x337733);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
}

function setupCameraAndLight()
{
  camera = new THREE.PerspectiveCamera(75,
      window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(-30,40,30);
  camera.lookAt(scene.position);

  // Step 4.1 - Add ambient light
  ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

  spotLight = new THREE.SpotLight(0xff0000, 0.2);
  spotLight.position.set(-20,20,-15);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  spotLight.shadow.camera.far = 130;
  spotLight.shadow.camera.near = 40;

  pointLight = new THREE.PointLight(0x00ff00, 0.2, 50); //red light?
  pointLight.position.set(5,80,-5);
  pointLight.castShadow = true;

  directionalLight = new THREE.DirectionalLight(0x0000ff, 0.2);
  directionalLight.position.set(-5, 25, -15);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 512;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;

  rectLight = new THREE.RectAreaLight(0x00ffff, 2, 50, 50);
  rectLight.position.set(-20,0,15);
  rectLight.castShadow = true;

  hemisphereLight = new THREE.HemisphereLight(0xff00ff, 0x00ffff, 0.2);
  hemisphereLight.position.set(0,10, 0);
  hemisphereLight.castShadow = true;

  // Adding Lights to scene
  scene.add(ambientLight, spotLight, pointLight, directionalLight, rectLight, hemisphereLight);

  createLightHelpers();
  createShadowHelpers();

  trackballControl = new THREE.TrackballControls(camera, renderer.domElement);
}

function createLightHelpers()
{
  // Creating light helpers;
  spotLightHelper = new THREE.SpotLightHelper(spotLight);
  pointLightHelper = new THREE.PointLightHelper(pointLight, 50);
  directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 15);
  hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 10);

  lightHelpersContainer = new THREE.Object3D();

  // Adding light helpers
  lightHelpersContainer.add(spotLightHelper, pointLightHelper, directionalLightHelper, hemisphereLightHelper);
  lightHelpersContainer.children.map((i) => i.visible = false);
  scene.add(lightHelpersContainer);
}

function createShadowHelpers()
{
  // Creating shadow Helpers;
  pointShadowHelper = new THREE.CameraHelper(pointLight.shadow.camera);
  spotShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
  directionalShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

  shadowHelpersContainer = new THREE.Object3D();

  // Adding shadow helpers
  shadowHelpersContainer.add(spotShadowHelper, pointShadowHelper, directionalShadowHelper);
  shadowHelpersContainer.children.map((i) => i.visible = false);
  scene.add(shadowHelpersContainer);
}

function createGeometry()
{
  // Step 1, create the plane with Lambert Material
  plane = createMesh(
      'plane', 180,
      'lambert', 0x808080,
      false, true);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(15,0,0);
  scene.add(plane);

  // Step 2, create the cube with Phong Material
  cube = createMesh(
      'box', 8,
      'phong', 0xaaaaaa,
      true, true);
  cube.position.set(-4,15,0);
  scene.add(cube);

  // Step 3, create a sphere with Standar Material
  sphere = createMesh(
      'sphere', 6,
      'standard', 0xaaffaa,
      true, true);
  sphere.position.set(15,9,2);
  scene.add(sphere);

  directionalLight.target = cube;
}

function setupDatGui()
{
  control = new function()
  {
    this.lightColorUI = '#00de00';
    this.groundColorUI = '#dd0021';
    this.lightIntensityUI = 1;
    this.btnLightHelpers = () => toggleLightHelpers();
    this.btnShadowHelpers = () => toggleShadowHelpers();
    this.ambientLightUI = true;
    this.updateAmbientLight = () => {
      ambientLight.color.set(this.lightColorUI);
      ambientLight.intensity = this.lightIntensityUI;
    };
    this.spotLightUI = true;
    this.updateSpotLight = () => {
      spotLight.color.set(this.lightColorUI);
      spotLight.intensity = this.lightIntensityUI;
    };
    this.pointLightUI = true;
    this.updatePointLight = () => {
      pointLight.color.set(this.lightColorUI);
      pointLight.intensity = this.lightIntensityUI;
    };
    this.directionalLightUI = true;
    this.updateDirectionalLight = () => {
      directionalLight.color.set(this.lightColorUI);
      directionalLight.intensity = this.lightIntensityUI;
    };
    this.rectLightUI = true;
    this.updateRectLight = () => {
      rectLight.color.set(this.lightColorUI);
      rectLight.intensity = this.lightIntensityUI;
    };
    this.hemisphereLightUI = true;
    this.updateHemisphereLight = () => {
      hemisphereLight.color.set(this.lightColorUI);
      hemisphereLight.groundColor.set(this.groundColorUI);
      hemisphereLight.intensity = this.lightIntensityUI;
    };

  }
  let gui = new dat.GUI();
  gui.width = (window.innerWidth / 3.5);
  gui.add(control, "lightIntensityUI").min(0.5).max(30).step(.5).name("Light Intensity Slider");
  gui.addColor(control, 'lightColorUI').name("Light/SkyColor Color").onFinishChange();
  gui.addColor(control, 'groundColorUI').name('Ground Color, only for Hemisphere').onFinishChange();
  gui.add(control, 'btnLightHelpers').name('Toggle Light Helpers');
  gui.add(control, 'btnShadowHelpers').name('Toggle Shadow Helpers');
  let ambientFolder = gui.addFolder("Ambient Light Folder");
  ambientFolder.add(control, "ambientLightUI").name("Ambient Light").onChange(() => ambientLight.visible = !ambientLight.visible);
  ambientFolder.add(control, "updateAmbientLight").name("Update Ambient Light");
  let spotFolder = gui.addFolder("Spot Light Folder");
  spotFolder.add(control, "spotLightUI").name("Spot Light").onChange(() => spotLight.visible = !spotLight.visible);
  spotFolder.add(control, "updateSpotLight").name("Update Spot Light");
  let pointFolder = gui.addFolder("Point Light Folder");
  pointFolder.add(control, "pointLightUI").name("Point Light").onChange(() => pointLight.visible = !pointLight.visible);
  pointFolder.add(control, "updatePointLight").name("Update Point Light");
  let directionalFolder = gui.addFolder("Directional Light Folder");
  directionalFolder.add(control, "directionalLightUI").name("Directional Light").onChange(() => directionalLight.visible = !directionalLight.visible);
  directionalFolder.add(control, "updateDirectionalLight").name("Update Directional Light");
  let rectFolder = gui.addFolder("Rect Area Light Folder");
  rectFolder.add(control, "rectLightUI").name("Rect Light").onChange(() => rectLight.visible = !rectLight.visible);
  rectFolder.add(control, "updateRectLight").name("Update Rect Area Light");
  let hemisphereFolder = gui.addFolder("Hemisphere Light Folder");
  hemisphereFolder.add(control, "hemisphereLightUI").name("Hemisphere Light").onChange(() => hemisphereLight.visible = !hemisphereLight.visible);
  hemisphereFolder.add(control, "updateHemisphereLight").name("Update Hemisphere Light");

}

function render()
{
  requestAnimationFrame(render);

  trackballControl.update();

  renderer.render(scene, camera);
}

function createAxesHelper()
{
  axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

let createMesh = (geometryType, size = 5, materialType,color, willCastShadow, willReceiveShadow) =>
{
  let shape;
  switch (geometryType)
  {
    case 'sphere':
      shape = new THREE.SphereGeometry(size,20,20);
      break;
    case 'box':
      shape = new THREE.BoxBufferGeometry(size, size, size);
      break;
    case 'plane':
      shape = new THREE.PlaneGeometry(size, size);
      break;
    default:
      console.log('Object type not defined correctly');
      break;
  }

  let material;
  switch (materialType)
  {
    case 'lambert':
      material = new THREE.MeshLambertMaterial({color: color});
      break;
    case 'phong':
      material = new THREE.MeshPhongMaterial({color: color});
      break;
    case 'standard':
      material = new THREE.MeshStandardMaterial({color: color});
      break;
    default:
      console.log('Object material not defined correctly');
      break;
  }

  let mesh = new THREE.Mesh(shape, material);
  mesh.castShadow = willCastShadow;
  mesh.receiveShadow = willReceiveShadow;
  return mesh;
}

function toggleLightHelpers()
{
  lightHelpersContainer.children.map((i) => i.visible = !i.visible);
}

function toggleShadowHelpers()
{
  shadowHelpersContainer.children.map((i) => i.visible = !i.visible);
}

window.onload = () =>
{
  init();
  setupCameraAndLight();
  createGeometry();
  createAxesHelper();
  setupDatGui();
  render();
}
