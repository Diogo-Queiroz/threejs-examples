let Shaders = {};

Shaders.VertexShader09DQ =
{
  name: 'VertexShader-09DQ',
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
//color = vec3(cos(time) + 1.0, sin(time * 0.8) + 1.0, tan(time * 2.0));
