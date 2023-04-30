  #ifdef GL_ES
  precision mediump float;
  #endif

  varying vec2 vTexCoord;

  uniform sampler2D tex0;
  uniform vec2 u_resolution;

  const int directions = 12;  
  const int rings = 2;

  float rand(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898,78.233)))*43578.5453);   
  }

  void main() { 
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 col = texture2D(tex0, uv);

    gl_FragColor = vec4(col);
}