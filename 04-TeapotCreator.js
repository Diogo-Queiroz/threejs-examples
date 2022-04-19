// global variables
let renderer, scene, camera, trackballControl;
let control;
let axesHelper;

let teapotSize = 40;
let tess = -1;

let plane;
let bBottom;
let bLid;
let bBody;
let bFitLid;
let bNonBlinn;
let teapot;

let ambientLight, spotLight;

let spotLightHelper;

let spotShadowHelper;

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
  camera.position.set(-90,90,90);
  camera.lookAt(scene.position);

  // Step 4.1 - Add ambient light
  ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

  spotLight = new THREE.SpotLight(0xeeff4e, 0.8);
  spotLight.position.set(-30,100,-55);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize = new THREE.Vector2(512, 512);
  spotLight.shadow.camera.far = 700;
  spotLight.shadow.camera.near = 40;

  // Adding Lights to scene
  scene.add(ambientLight, spotLight);

  createLightHelpers();
  createShadowHelpers();

  trackballControl = new THREE.TrackballControls(camera, renderer.domElement);
}

function createLightHelpers()
{
  // Creating light helpers;
  spotLightHelper = new THREE.SpotLightHelper(spotLight);
  spotLightHelper.visible = false;
  scene.add(spotLightHelper);
}

function createShadowHelpers()
{
  // Creating shadow Helpers;
  spotShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
  spotShadowHelper.visible = false;
  scene.add(spotShadowHelper);
}

function createGeometry()
{
  // Step 1, create the plane with Lambert Material
  plane = createMesh(
      'plane', 480,
      'lambert', 0x808080,
      false, true);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(15,0,0);
  scene.add(plane);

  // Step 2, create the teapot from the github code
  teapot = createMesh('teapot', 40, 'physical');
  teapot.position.set(0, 40, 0);
  teapot.castShadow = true;
  teapot.material.clearcoat = 1;
  scene.add(teapot);
  spotLight.target = teapot;
}

function setupDatGui()
{
  control = new function()
  {
    this.lightColorUI = "#eeff4e";
    this.lightIntensityUI = 1;
    this.btnLightHelpers = () => toggleLightHelpers();
    this.btnShadowHelpers = () => toggleShadowHelpers();
    this.ambientLightUI = true;
    this.updateAmbientLight = () => {
      ambientLight.color.set(this.lightColorUI);
      ambientLight.intensity = this.lightIntensityUI;
    };
    this.spotLightUI = true;
    this.spotLightPositionX = -30;
    this.spotLightPositionY = 100;
    this.spotLightPositionZ = -55;
    this.updateSpotLight = () => {
      spotLight.color.set(this.lightColorUI);
      spotLight.intensity = this.lightIntensityUI;
      spotLight.position.set(
        this.spotLightPositionX,
        this.spotLightPositionY,
        this.spotLightPositionZ);
      spotLight.lookAt(teapot);
    };

    this.teapotVisibility = true;
    this.transparent = false;
    this.opacity = 0.4;
    this.transmission = 0.0;
    this.ior = 1.5;
    this.reflectivity = 0.5;
    this.clearCoat = 1.0;
    this.clearCoatRoughness = 0.0;
    this.polygonOffset = false;
    this.polygonOffsetFactor = 0;
    this.polygonOffsetUnits = 0;
    this.metalness = 0;
    this.teapotColor = "#0F8E7D";
  }
  let gui = new dat.GUI();
  gui.width = (window.innerWidth / 3.5);
  gui.add(control, "lightIntensityUI").min(0.5).max(30).step(.5).name("Light Intensity Slider");
  gui.addColor(control, 'lightColorUI').name("Light/SkyColor Color").onFinishChange();

  gui.add(control, 'btnLightHelpers').name('Toggle Light Helpers');
  gui.add(control, 'btnShadowHelpers').name('Toggle Shadow Helpers');

  let ambientFolder = gui.addFolder("Ambient Light Folder");
  ambientFolder.add(control, "ambientLightUI").name("Ambient Light").onFinishChange(() => ambientLight.visible = !ambientLight.visible);
  ambientFolder.add(control, "updateAmbientLight").name("Update Ambient Light");

  let spotFolder = gui.addFolder("Spot Light Folder");
  spotFolder.add(control, "spotLightUI").name("Spot Light").onChange(() => spotLight.visible = !spotLight.visible);
  spotFolder.add(control, 'spotLightPositionX', -240, 240, 1).name('X position Spot Light');
  spotFolder.add(control, 'spotLightPositionY', 25, 150, 1).name('Y position Spot Light');
  spotFolder.add(control, 'spotLightPositionZ', -240, 240, 1).name('Z position Spot Light');
  spotFolder.add(control, "updateSpotLight").name("Update Spot Light");

  let h;
  h = gui.addFolder( "Material Properties" );
  h.add( control, "teapotVisibility").name('#1 - Teapot Visibility').onChange(() => teapot.visible = !teapot.visible);
  h.add( control, "transparent" ).name('#2 - Transparent').onChange((value) => teapot.material.transparent = value);
  h.add( control, "opacity" ).name("#3 - Change Opacity").min(0).max(1).step(0.1).listen().onChange((value) => teapot.material.opacity = value);
  h.add( control, "transmission" ).name('#4 - Transmission').min(0).max(1).step(0.1).listen().onChange((value) => teapot.material.transmission = value);
  h.add( control, "ior" ).name('#5 - IOR').min(1.0).max(2.3).step(0.1).listen().onChange((value) => teapot.material.ior = value);
  h.add( control, "reflectivity" ).name('#6 - Reflectivity').min(0).max(1).step(0.1).listen().onChange((value) => teapot.material.reflectivity = value);
  h.add( control, "clearCoat" ).name('#7 - Clear Coat').min(0).max(1).step(0.1).listen().onChange((value) => teapot.material.clearcoat = value);
  h.add( control, "clearCoatRoughness" ).name('#8 - Roughness').min(0).max(1).step(0.1).listen().onChange((value) => teapot.material.clearcoatRoughness = value);
  h.add( control, "polygonOffset" ).name('#9 - polygonOffset').listen().onChange((value) => teapot.material.polygonOffset = value);
  h.add( control, "polygonOffsetFactor" ).name('#10 - polygonOffset Factor').min(-200).max(200).step(1).listen().onChange((value) => teapot.material.polygonOffsetFactor = value);
  h.add( control, "polygonOffsetUnits" ).name('#11 - polygonOffset Units').min(-10000).max(10000).step(1).listen().onChange((value) => teapot.material.polygonOffsetUnits = value);
  h.add( control, "metalness" ).name('#12 - Metalness').min(0).max(1).step(0.1).listen().onChange((value) => teapot.material.metalness = value);
  h.addColor(control, 'teapotColor').name("#13 - Teapot Color").listen().onFinishChange((value) => teapot.material.color = new THREE.Color(value));



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
    case 'teapot':
      shape = new THREE.TeapotBufferGeometry(
        teapotSize,
        tess,
        control.bottom,
        control.lid,
        control.body,
        control.fitLid,
        !control.nonBlinn);
      break;
    default:
      console.log('Object type not defined correctly');
      break;
  }

  let material;
  switch (materialType)
  {
    case 'lambert':
      material = new THREE.MeshLambertMaterial({color: color, side: THREE.DoubleSide});
      break;
    case 'phong':
      material = new THREE.MeshPhongMaterial({color: color});
      break;
    case 'standard':
      material = new THREE.MeshStandardMaterial({color: color});
      break;
    case 'physical':
      material = new THREE.MeshPhysicalMaterial({ color: color, side: THREE.DoubleSide});
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
  spotLightHelper.visible = !spotLightHelper.visible;
}

function toggleShadowHelpers()
{
  spotShadowHelper.visible = !spotShadowHelper.visible;
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
