// global variables
let renderer, scene, camera, orbitControl;
let control;
let axesHelper;

let spotLight, hemisphereLight;
let directionalShadowHelper;

let medievalWheel =
{
  num_of_spokes: 15, // from 3 to 15
  wheel_size: 5, // from 4 to 20
  wheel_thickness: 4, // from 3 to 19
  wheel_width: 1, // from 1 to 13
  x_position: 0, // -220 to 220
  y_position: 5, // from 5
  z_position: 0 // -220 to 220
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

}

function setupDatGui()
{
  control = new function()
  {
    this.lightColorUI = "#eeff4e";
    this.lightIntensityUI = 1;
        this.btnShadowHelpers = () => toggleShadowHelpers();
    this.num_of_spokes = 8; // from 3 to 15
    this.wheel_size = 5; // from 4 to 20
    this.wheel_thickness = 1; // from 3 to 19
    this.wheel_width = 1; // from 1 to 13
    this.x_position = 0; // -30 to 30
    this.y_position = 5; // from 5
    this.z_position = 0;// -30 to 30
    this.createNewWheel = () => {
      let position = new THREE.Vector3(this.x_position, this.y_position, this.z_position);
      medievalWheel.createWheel(position, this.num_of_spokes, this.wheel_size, this.wheel_thickness, this.wheel_width);
    }
  }
  let gui = new dat.GUI();
  gui.width = (window.innerWidth / 3.5);
  gui.add(control, "lightIntensityUI").min(0.5).max(30).step(.5).name("Light Intensity Slider").listen().onChange((value) => spotLight.intensity = value);
  gui.addColor(control, 'lightColorUI').name("Light/SkyColor Color").listen().onChange((value) => spotLight.color = new THREE.Color(value));

  let medievalFolder = gui.addFolder('Medieval Wheel Creator');
  medievalFolder.add(control, 'num_of_spokes').min(3).max(15).step(1).name('Number of Spokes');
  medievalFolder.add(control, 'wheel_size').min(4).max(11).step(1).name('Size of the Wheel');
  medievalFolder.add(control, 'wheel_thickness').min(1).max(10).step(1).name('Thickness of the wheel');
  medievalFolder.add(control, 'wheel_width').min(1).max(13).step(1).name('Width of the Wheel');

  medievalFolder.add(control, 'x_position').min(-30).max(30).step(1).name('X Position');
  medievalFolder.add(control, 'y_position').min(5).max(20).step(1).name('Y Position');
  medievalFolder.add(control, 'z_position').min(-30).max(30).step(1).name('Z Position');
  medievalFolder.add(control, "createNewWheel");
}

function render()
{
  requestAnimationFrame(render);

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

medievalWheel.createWheel = (position = new THREE.Vector3(0,0,0),
                             numberOfSpokes = 3, wheelSize = 4,
                             wheelThickness = 3, wheelWidth = 1) =>
{
  /*
    Creates a THREE.Object3D object tat will act as the container.
    Call the helper function to obtain a spoke mesh.
    Scale so that it is flatten in the axle direction.
    Rotate the spoke mesh to an appropriate angle.
    Add to the container object.
    Repeat the above two steps as needed.
    Call the helper function to obtain the rim.
    Add the rim to the container.
    Create a cylinder, rotate it so that the long axis is oriented in a horizontal position to serve as the axle. (You should not have to translate this geometry, because it is already at the center)
    Add to the container.
    Return the container.
  */
  let object = new THREE.Object3D();
  let rim = medievalWheel.createRim(numberOfSpokes, wheelSize, wheelThickness, wheelWidth);
  let discGeo = new THREE.CylinderGeometry(1, 1, wheelWidth, 100);
  let discMaterial = new THREE.MeshStandardMaterial({color: 0xeeeeee, side: THREE.DoubleSide});
  let centerDisc = new THREE.Mesh(discGeo, discMaterial);
  centerDisc.rotation.x = Math.PI * 0.5;
  centerDisc.position.z = wheelWidth/ 2;
  centerDisc.castShadow = true;
  object.add(rim);
  object.add(centerDisc);
  object.position.set(position.x, position.y, position.z);
  camera.lookAt(object);
  scene.add(object);
}

medievalWheel.createRim = (numberOfSpokes = 3, wheelSize = 4,
                           wheelThickness = 3, wheelWidth = 1) =>
{
  /*
    Use a Shape object to configure a circle by the ellipse() method.
    Create another Shape object smaller and again configure to a circle to represent the hole.
    Use the holes.push() function and the above two objects to create a disc with the center remove.
    Use the ExtrudeGeometry to create the needed rim.
    Create a Mesh using the above geometry and a suitable Material.
    Return the above mesh.
  */
  let newWheelThickness = (wheelSize < wheelThickness) ? 0 : wheelSize - wheelThickness;
  let extrudeInfo =
  {
    steps: 2,
    depth: wheelWidth,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelOffset: 0,
    bevelSegments: 10
  };
  let outerTopRim = new THREE.Shape();
  let innerTopRim = new THREE.Shape();
  outerTopRim.arc(0,0, wheelSize,0,Math.PI * 2.1, true);
  innerTopRim.arc(0,0,newWheelThickness,0,Math.PI * 2.1, true);
  outerTopRim.holes.push(innerTopRim);
  let rimGeometry = new THREE.ExtrudeGeometry(outerTopRim, extrudeInfo);
  let material = new THREE.MeshStandardMaterial({color: 0x5d2906, side: THREE.DoubleSide});
  let mesh = new THREE.Mesh(rimGeometry, material);

  let spokes = medievalWheel.createSpoke(numberOfSpokes, wheelSize, wheelWidth);
  mesh.add(spokes);
  mesh.castShadow = true;
  return mesh;
}

medievalWheel.createSpoke = (numOfSpokes = 5, wheelSize = 4, wheelWidth = 1) =>
{
  /*
    A function that will create a geometry of a Cylinder.
    Translate the above geometry a distance half of the radius of the above rim in the positive y-direction.
    Create a mesh from the above geometry and a material.
    Return the above mesh.
  */
  let spoke = new THREE.Object3D();
  let angle = (Math.PI/numOfSpokes) * 2;
  let spokeMaterial = new THREE.MeshStandardMaterial({color: 0xb76f20, side: THREE.DoubleSide});
  for (let i = 0; i < numOfSpokes; i++)
  {
    let spokeGeo = new THREE.CylinderGeometry(1.8/numOfSpokes, 0.8/numOfSpokes, wheelSize, 100);
    spokeGeo.translate(0, spokeGeo.parameters.height / 1.8, wheelWidth / 4);
    let spokeMesh = new THREE.Mesh(spokeGeo, spokeMaterial);

    spokeMesh.scale.z = 2;
    spokeMesh.scale.x = 2;

    spokeMesh.rotation.z = Math.PI * 0.5 + angle * i;
    spokeMesh.castShadow = true;
    spoke.add(spokeMesh);
  }

  return spoke;
}
