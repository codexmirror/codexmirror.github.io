const canvas = document.getElementById("shader-bg");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    float x = st.x * 10.0;
    float y = st.y * 10.0;
    
    float pattern = sin(x + u_time * 0.7) + cos(y + u_time * 1.3);
    float intensity = smoothstep(0.8, 1.2, pattern);

    gl_FragColor = vec4(vec3(0.0, intensity * 0.2, intensity * 0.4), 0.08);
  }
`;

// Shader setup
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Vertices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ]),
  gl.STATIC_DRAW
);

const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Uniforms
const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

let start = performance.now();

function render() {
  const now = performance.now();
  const time = (now - start) * 0.001;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform1f(timeLocation, time);
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
}

render();