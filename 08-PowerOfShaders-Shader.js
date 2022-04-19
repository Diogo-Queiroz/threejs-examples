let Shaders = {};

Shaders.BasicShader10A1 =
{

  name: 'BasicShader10A1',

  vertexShader:

    `void main() {

		// position is a building shader variable holds the current vertex position			
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); 

	}`,

  fragmentShader:

    `void main() {

		gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ); //change the value of alpha

	}`
};

Shaders.BasicShader10A0 =
{
  name: 'BasicShader10A0',
  vertexShader:
    `void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
    }`,

  fragmentShader:
    `vec3 color = vec3(1.0, 0.0, 0.0); // red color
    void main() {
      gl_FragColor = vec4(color, 0.75); // alpha at 0.75
    }`
};

Shaders.BasicShader10B0 =
{
  name: 'BasicShader10B0',
  vertexShader:
  `varying vec2 vUv; // facilitate sending data to fragment shader
  void main() {
    vUv = uv; // sends the uv value to fragment program
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  }`,

  fragmentShader:
  `varying vec2 vUv;
  const float PI = 3.14159265358979; // PI Constant
  vec3 color = vec3(1.0, 0.0, 0.0); // red color
  void main() {
    float alpha = vUv.x; // x goes from 0 to 1;
    gl_FragColor = vec4(color, alpha); // alpha at 0.75
  }`
};

Shaders.BasicShader10C0 =
{
  name: 'BasicShader10C0',
  uniforms: {
    'time': { type: 'f', value: 0.0 }
  },

  vertexShader:
  `void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
  }`,

  fragmentShader:
  `uniform float time;
  vec3 color = vec3(0.0, 1.0, 0.0); // green color
  void main() {
    float alpha = abs(sin(time * 5.2));
    color = vec3(cos(time) + 1.0, sin(time * 0.8) + 1.0, tan(time * 2.0));
    gl_FragColor = vec4(color, alpha); // alpha at 0.75
  }`
};

Shaders.BasicShader10D0 =
{
  name: 'BasicShader10D0',
  uniforms: {
    'textureA': { value: null },
    'textureB': { value: null },
  },

  vertexShader:
    `varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
    }`,

  fragmentShader:
    `uniform float time;
    uniform sampler2D textureA;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(textureA, vUv);
      gl_FragColor = color;
    }`,
};
