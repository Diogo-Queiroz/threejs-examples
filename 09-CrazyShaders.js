const renderer = new THREE.WebGLRenderer({ antialias: true });
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.0, 1000);
const scene = new THREE.Scene();
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

const clock = new THREE.Clock();
let Shaders = {
  VertexShader10DQ_Ground: undefined
};

Shaders.VertexShader09DQ_Cube =
{
    name: 'VertexShader-09DQ-Cube',
    uniforms: {
      'time': { type: 'f', value: 0.0 }
    },

    vertexShader:
      `uniform float time;
    varying vec2 vUv;
    void main() {
    vec3 scale = vec3(2.0, 1.0, 1.0);
    vec3 pos = position;
    pos.z *= 0.4 * sin(time * 2.0 + pos.x) + 0.2 * sin(time * 2.0 + pos.y);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos * scale, 1.0);
  }`,

    fragmentShader:
      `uniform float time;
     varying vec2 vUv;
      void main() {
        vec3 color = vec3(sin(time * 0.1) + 1.0, sin(time * 1.0) + 1.0, sin(time * 5.0) + 1.0);
        gl_FragColor = vec4(vec3(vUv, 1.0) * color, 1.0); // alpha at 0.75
      }`
};

Shaders.VertexShader09DQ_Torus =
  {
    name: 'VertexShader-09DQ-Torus',
    uniforms: {
      'time': { type: 'f', value: 0.0 }
    },

    vertexShader:
      `uniform float time;
    varying vec2 vUv;
    void main() {
    vec3 scale = vec3(2.0, 1.0, 1.0);
    vec3 pos = position;
    pos.x += 0.2 * cos(time * 0.5 + pos.z) + 0.1 * sin(time * 0.5 + pos.y);
    pos.y += 0.8 * cos(time * 4.0 + pos.x) + 0.4 * sin(time * 4.0 + pos.z);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos * scale, 1.0);
  }`,

    fragmentShader:
      `uniform float time;
     varying vec2 vUv;
      void main() {
        vec3 color = vec3(cos(time * 0.1) + 1.0, cos(time * 1.0) + 1.0, cos(time * 5.0) + 1.0);
        gl_FragColor = vec4(vec3(vUv, 1.0) / color, 1.0); // alpha at 0.75
      }`
  };

Shaders.VertexShader09DQ_Ground =
  {
    name: 'VertexShader-09DQ-Ground',
    uniforms: {
      'time': { type: 'f', value: 0.0 },
      'textureA': { value: new THREE.TextureLoader().load('09-Ground.jpg') }
    },

    vertexShader:
      `uniform float time;
      varying vec2 vUv;
      void main() {
        vec3 scale = vec3(2.0, 1.0, 1.0);
        vec3 pos = position;
        pos.z = step(0.0, sin(pos.y));
        pos.z += step(0.0, cos(pos.x));
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( pos * scale, 1.0);
  }`,

    fragmentShader:
      `uniform float time;
      uniform sampler2D textureA;
      varying vec2 vUv;
      void main() {
        vec3 color = vec3(cos(time * 0.1) + 1.0, cos(time * 1.0) + 1.0, cos(time * 5.0) + 1.0);
        // gl_FragColor = vec4(vec3(vUv, 1.0) / color, 1.0); // alpha at 0.75
        gl_FragColor = texture2D(textureA, vUv);
      }`
  };

Shaders.VertexShader09DQ_Cube2 =
  {
    name: 'VertexShader-09DQ-Cube2',
    uniforms: {
      'time': { type: 'f', value: 0.0 },
      'textureA': { value: new THREE.TextureLoader().load('09-Brick.png') }
    },

    vertexShader:
      `uniform float time;
    uniform sampler2D textureA;
    varying vec2 vUv;
    void main() {
      //vec3 scale = vec3(2.0, 1.0, 1.0);
      vec3 pos = position;
      
      vec4 color = texture2D(textureA, uv);
      pos += color.r;
      // pos.y += color.g;
      // pos.x += color.b;
      
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0);
  }`,

    fragmentShader:
      `uniform float time;
      uniform sampler2D textureA;
     varying vec2 vUv;
      void main() {
        // gl_FragColor = vec4(vec3(vUv, 1.0) / color, 1.0); // alpha at 0.75
        gl_FragColor = texture2D(textureA, vUv);
      }`
  };

Shaders.VertexShader09DQ_Sphere =
  {
    name: 'VertexShader-09DQ-Sphere',
    uniforms: {
      'time': { type: 'f', value: 0.0 },
      'textureA': { value: new THREE.TextureLoader().load('09-Lava.png') }
    },

    vertexShader:
      `uniform float time;
    uniform sampler2D textureA;
    varying vec2 vUv;
    void main() {
      //vec3 scale = vec3(2.0, 1.0, 1.0);
      vec3 pos = position;
      
      vec4 color = texture2D(textureA, uv);
      pos += color.r;
      // pos.y += color.g;
      // pos.x += color.b;
      
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0);
  }`,

    fragmentShader:
      `uniform float time;
      uniform sampler2D textureA;
     varying vec2 vUv;
      void main() {
        // gl_FragColor = vec4(vec3(vUv, 1.0) / color, 1.0); // alpha at 0.75
        gl_FragColor = texture2D(textureA, vUv);
      }`
  };

let controls, light,
  speed = 0.01,
  toRotate = false;

let shaderCubeMaterial, shaderTorusMaterial, shaderGroundMaterial, shaderCube2Material, shaderSphereMaterial;

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

  shaderCubeMaterial = new THREE.ShaderMaterial(
    {
      uniforms: Shaders.VertexShader09DQ_Cube.uniforms,
      vertexShader: Shaders.VertexShader09DQ_Cube.vertexShader,
      fragmentShader: Shaders.VertexShader09DQ_Cube.fragmentShader,
      transparent: false
    }
  );
  shaderTorusMaterial = new THREE.ShaderMaterial({
    uniforms: Shaders.VertexShader09DQ_Torus.uniforms,
    vertexShader: Shaders.VertexShader09DQ_Torus.vertexShader,
    fragmentShader: Shaders.VertexShader09DQ_Torus.fragmentShader,
    transparent: false
  });
  shaderGroundMaterial = new THREE.ShaderMaterial({
    uniforms: Shaders.VertexShader09DQ_Ground.uniforms,
    vertexShader: Shaders.VertexShader09DQ_Ground.vertexShader,
    fragmentShader: Shaders.VertexShader09DQ_Ground.fragmentShader,
    transparent: false
  });
  shaderCube2Material = new THREE.ShaderMaterial({
    uniforms: Shaders.VertexShader09DQ_Cube2.uniforms,
    vertexShader: Shaders.VertexShader09DQ_Cube2.vertexShader,
    fragmentShader: Shaders.VertexShader09DQ_Cube2.fragmentShader,
    transparent: false
  });
  shaderSphereMaterial = new THREE.ShaderMaterial({
    uniforms: Shaders.VertexShader09DQ_Sphere.uniforms,
    vertexShader: Shaders.VertexShader09DQ_Sphere.vertexShader,
    fragmentShader: Shaders.VertexShader09DQ_Sphere.fragmentShader,
    transparent: false
  });


  let side = 10;
  let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60, 50, 50),
    shaderGroundMaterial
  );
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI * 0.5;
  scene.add(plane);
  console.log(`plane is using ${Shaders.VertexShader09DQ_Ground.name}`);

  let cubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(side, side, side, 20, 20),
    shaderCubeMaterial
  );
  cubeMesh.position.set(10, 10, 10);
  cubeMesh.rotation.set(Math.PI * 0.6, 0, Math.PI * 0.3);
  cubeMesh.castShadow = true;
  scene.add(cubeMesh);
  console.log(`cubeMesh is using ${Shaders.VertexShader09DQ_Cube.name}`);

  // __shader.uniforms.textureA.value = new THREE.TextureLoader().load('assets/textures/general/floor-Diogo.jpg');
  // __shader.uniforms.textureB.value = new THREE.TextureLoader().load('assets/textures/alpha/partial-transparency.png');

  let torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry( 10, 3, 100, 16 ),
    shaderTorusMaterial
  );
  torusKnot.scale.set(.5,.5,.5)
  torusKnot.position.set(-10,10,-10);
  torusKnot.castShadow = true;
  scene.add( torusKnot );
  console.log(`torusKnot is using ${Shaders.VertexShader09DQ_Torus.name}`);

  let sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50),
    shaderSphereMaterial
  );
  sphereMesh.position.set(-10, 20, 10);
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);

  let cubeMesh2 = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 15),
    shaderCube2Material
  );
  cubeMesh2.position.set(-35, 20, 10);
  cubeMesh2.castShadow = true;
  scene.add(cubeMesh2);

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
  Shaders.VertexShader09DQ_Cube.uniforms.time.value = clock.getElapsedTime() * 0.5;
  Shaders.VertexShader09DQ_Torus.uniforms.time.value = clock.getElapsedTime() * 2.0;
  Shaders.VertexShader09DQ_Ground.uniforms.time.value = clock.getElapsedTime() * 0.2;
  Shaders.VertexShader09DQ_Cube2.uniforms.time.value = clock.getElapsedTime() * 8.0;
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
