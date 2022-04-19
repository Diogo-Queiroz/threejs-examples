// global variables
let renderer, scene, camera, orbitControl;
let control;
let axesHelper;

let container = [];
let wheelObject;
let axis, quaternion;

let spokes;
let spokesArray = [];
let basketArray = [];
let rotateSpokes = false;
let rotateScene = false;

let spotLight, hemisphereLight;
let directionalShadowHelper;

let ferrisWheel =
{
  num_of_spokes: 15,
  wheel_size: 5,
  wheel_thickness: 4,
  wheel_width: 1,
  x_position: 0,
  y_position: 10,
  z_position: 0
};

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
  camera.position.set(0,5,20);

  spotLight = new THREE.SpotLight(0xeeeeeeee, 2.5);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 500;
  spotLight.shadow.mapSize.width = 1024 * 8;
  spotLight.shadow.mapSize.height = 1024 * 8;
  spotLight.position.set(0, 65, 60);

  hemisphereLight = new THREE.HemisphereLight(0xff00ff, 0x00ffff, 0.2);
  hemisphereLight.position.set(0,10, 0);

  scene.add(spotLight, hemisphereLight);

  createShadowHelpers();
  orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
}

function createShadowHelpers()
{
  // Creating shadow Helpers;
  directionalShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
  directionalShadowHelper.visible = true;
  directionalShadowHelper.scale.set(80, 80, 80);
  scene.add(directionalShadowHelper);
}

function createGeometry()
{
  plane = createMesh(
    'plane', 80,
    'lambert', 0x808080,
    false, true);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0,0,0);
  scene.add(plane);

  container.name = "containerWheels";
}

function setupDatGui()
{
  control = new function()
  {
    this.lightColorUI = "#eeff4e";
    this.lightIntensityUI = 1;
    this.btnShadowHelpers = () => toggleShadowHelpers();
    this.activateWheelRotation = () => {rotateSpokes = !rotateSpokes};
    this.activateSceneRotation = () => {rotateScene = !rotateScene};
    this.wheelAxleRadius = 1;
    this.spokeLength = 3;
    this.num_of_spokes = 6; // from 3 to 15
    this.wheel_size = 5; // from 4 to 20
    this.wheel_thickness = 1; // from 3 to 19
    this.wheel_width = 3; // from 1 to 13
    this.x_position = 0; // -30 to 30
    this.y_position = 6; // from 10
    this.z_position = 0;// -30 to 30
    this.createNewWheel = () =>
    {
      let position = new THREE.Vector3(this.x_position, this.y_position, this.z_position);
      ferrisWheel.createWheel(position, this.num_of_spokes, this.wheel_size,
        this.wheel_thickness, this.wheel_width, this.wheelAxleRadius);
    }
  }
  let gui = new dat.GUI();
  gui.width = (window.innerWidth / 2);
  gui.add(control, "lightIntensityUI").min(0.5).max(30).step(.5).name("Light Intensity Slider").listen().onChange((value) => spotLight.intensity = value);
  gui.addColor(control, 'lightColorUI').name("Light/SkyColor Color").listen().onChange((value) => spotLight.color = new THREE.Color(value));
  gui.add(control, "activateWheelRotation").name("On/Off Wheel Rotation");
  gui.add(control, "activateSceneRotation").name("On/Off Scene Rotation");
  let ferrisFolder = gui.addFolder('Ferris Wheel Creator');
  ferrisFolder.add(control, 'num_of_spokes').min(4).max(12).step(2).name('Number of Spokes');
  ferrisFolder.add(control, 'wheel_size').min(4).max(11).step(1).name('Size of the Wheel');
  ferrisFolder.add(control, 'wheel_thickness').min(1).max(10).step(1).name('Thickness of the wheel');
  ferrisFolder.add(control, 'wheel_width').min(3).max(8).step(1).name('Width of the Wheel');
  ferrisFolder.add(control, "wheelAxleRadius").min(1).max(3).step(0.5).name("Axle size");

  ferrisFolder.add(control, 'x_position').min(-30).max(30).step(1).name('X Position');
  ferrisFolder.add(control, 'y_position').min(6).max(20).step(1).name('Y Position');
  ferrisFolder.add(control, 'z_position').min(-30).max(30).step(1).name('Z Position');
  ferrisFolder.add(control, "createNewWheel");
}

function render()
{
  requestAnimationFrame(render);
  if (spokesArray !== undefined && rotateSpokes)
  {
    if (spokesArray.length > 0)
    {
      container.map((o) => o.rotation.z += 0.01);
      basketArray.map((o) => o.rotation.z -= 0.01);
      //wheelObject.rotation.z += 0.01;
    }
  }
  if (rotateScene)
  {
    scene.rotation.y += 0.01;
  }

  orbitControl.update();
  renderer.render(scene, camera);
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

ferrisWheel.createWheel = (wheelPosition = new THREE.Vector3(0,0,0),
                          numberOfSpokes = 3, wheelSize = 4,
                          wheelThickness = 3, wheelWidth = 1,
                          axleSize = 1) =>
{
  wheelObject = new THREE.Object3D();
  let rim = ferrisWheel.createRim(numberOfSpokes, wheelSize, wheelThickness, wheelWidth, wheelPosition);

  let discGeo = new THREE.CylinderGeometry(axleSize, axleSize, wheelWidth * 1.5, 100);
  let discMaterial = new THREE.MeshStandardMaterial({color: 0xeeeeee, side: THREE.DoubleSide});
  let centerDisc = new THREE.Mesh(discGeo, discMaterial);
  centerDisc.rotation.x = Math.PI * 0.5;
  centerDisc.position.z = wheelWidth * 0.5;
  centerDisc.castShadow = true;
  centerDisc.name = "center disk";

  wheelObject.add(rim);
  wheelObject.add(centerDisc);
  wheelObject.name = "fullWheel";
  camera.lookAt(wheelObject);
  container.push(wheelObject);
  scene.add(wheelObject);
  wheelObject.position.set(wheelPosition.x, wheelPosition.y, wheelPosition.z);
}

ferrisWheel.createRim = (numberOfSpokes = 3, wheelSize = 4,
                         wheelThickness = 3, wheelWidth = 1,
                         wheelPosition = new THREE.Vector3(0,0,0)) =>
{
  let newWheelThickness = (wheelSize < wheelThickness) ? 0 : wheelSize - wheelThickness;
  let extrudeInfo =
    {
      steps: 2,
      depth: wheelWidth / 5,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 100
    };
  let outerTopRim = new THREE.Shape();
  let innerTopRim = new THREE.Shape();
  outerTopRim.arc(0,0, wheelSize,0,Math.PI * 2.1, true);
  innerTopRim.arc(0,0,newWheelThickness,0,Math.PI * 2.1, true);
  outerTopRim.holes.push(innerTopRim);
  let rimGeometry = new THREE.ExtrudeGeometry(outerTopRim, extrudeInfo);
  let material = new THREE.MeshStandardMaterial({color: 0x5d2906, side: THREE.DoubleSide});
  let mesh = new THREE.Mesh(rimGeometry, material);

  spokes = ferrisWheel.createSpoke(numberOfSpokes, wheelSize, wheelWidth, wheelPosition);
  spokesArray.push(spokes.children);
  mesh.add(spokes);
  mesh.name = "Rim";
  mesh.castShadow = true;
  let meshClone = mesh.clone();
  meshClone.position.z = wheelWidth;
  mesh.add(meshClone);
  return mesh;
}

ferrisWheel.createSpoke = (numOfSpokes = 5, wheelSize = 4,
                           wheelWidth = 1,
                           wheelPosition = new THREE.Vector3(0,0,0)) =>
{
  let spoke = new THREE.Object3D();
  let angle = (Math.PI * 2/numOfSpokes) ;
  let spokeMaterial = new THREE.MeshStandardMaterial({color: 0xb76f20, side: THREE.DoubleSide});
  for (let i = 0; i < numOfSpokes; i++)
  {
    let quadSpokeGeo = new THREE.BoxBufferGeometry(0.5, wheelSize * 1.2,0.5);
    quadSpokeGeo.translate(0, quadSpokeGeo.parameters.height / 1.8, wheelWidth * 0.1);
    let spokeMesh = new THREE.Mesh(quadSpokeGeo, spokeMaterial);

    spokeMesh.rotation.z = Math.PI * 0.5 + angle * i;
    spokeMesh.castShadow = true;
    spokeMesh.name = `Spoke${i}`;

    let spokeBasket = ferrisWheel.createBasket(wheelWidth);
    spokeBasket.position.set(
      Math.cos(angle * i) * quadSpokeGeo.parameters.height,
      Math.sin(angle * i) * quadSpokeGeo.parameters.height,
      wheelObject.position.z + wheelWidth * 0.6);
    wheelObject.add(spokeBasket);
    basketArray.push(spokeBasket);

    spoke.add(spokeMesh);
  }
  spoke.name = "Spokes";
  return spoke;
}

ferrisWheel.createBasket = (wheelWidth) =>
{
  let basket = new THREE.Object3D();
  let horizontalBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.2,0.2,wheelWidth),
    new THREE.MeshBasicMaterial({color: 0xeeeeee, side: THREE.DoubleSide})
  );
  horizontalBar.position.y = 0.1;
  horizontalBar.castShadow = true;
  let verticalBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.2,1,0.2),
    new THREE.MeshBasicMaterial({color: 0x00ffff, side: THREE.DoubleSide})
  );
  verticalBar.position.y = -0.5;
  verticalBar.castShadow = true;
  let halfSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1,50,50,
      0, Math.PI, 0, Math.PI),
    new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide, wireframe: true})
  );
  halfSphere.rotation.x = Math.PI * 0.5;
  halfSphere.position.y = -0.5;
  halfSphere.castShadow = true;
  basket.add(verticalBar, horizontalBar, halfSphere);
  return basket;
}

