const fluidCursor = () => {
  const canvas = document.getElementById('fluid') as HTMLCanvasElement;
  if (!canvas) return;
  
  resizeCanvas();

  // Configuration object
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1440,
    CAPTURE_RESOLUTION: 1512,
    DENSITY_DISSIPATION: 0.5,
    VELOCITY_DISSIPATION: 3,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 3,
    SPLAT_RADIUS: 0.2,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0.5, g: 0, b: 0 },
    TRANSPARENT: true,
  };

  function pointerPrototype(this: unknown) {
    (this as Record<string, unknown>).id = -1;
    (this as Record<string, unknown>).texcoordX = 0;
    (this as Record<string, unknown>).texcoordY = 0;
    (this as Record<string, unknown>).prevTexcoordX = 0;
    (this as Record<string, unknown>).prevTexcoordY = 0;
    (this as Record<string, unknown>).deltaX = 0;
    (this as Record<string, unknown>).deltaY = 0;
    (this as Record<string, unknown>).down = false;
    (this as Record<string, unknown>).moved = false;
    (this as Record<string, unknown>).color = [0, 0, 0];
  }

  const pointers: unknown[] = [];
  pointers.push(new (pointerPrototype as unknown as new () => unknown)());

  const { gl, ext } = getWebGLContext(canvas);

  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 256;
    config.SHADING = false;
  }

  function getWebGLContext(canvas: HTMLCanvasElement) {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  // Fix: Properly cast the context types to avoid TypeScript error
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = 
    canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
  const isWebGL2 = !!gl;

  if (!isWebGL2) {
    gl = (canvas.getContext('webgl', params) ||
          canvas.getContext('experimental-webgl', params)) as WebGLRenderingContext | null;
  }

  if (!gl) throw new Error('WebGL not supported');

  // Handle extensions safely - avoid WebGLExtension type
  let halfFloat: unknown = null;
  let supportLinearFiltering: unknown = null;

  if (isWebGL2) {
    (gl as WebGL2RenderingContext).getExtension('EXT_color_buffer_float');
    supportLinearFiltering = (gl as WebGL2RenderingContext).getExtension('OES_texture_float_linear');
  } else {
    halfFloat = (gl as WebGLRenderingContext).getExtension('OES_texture_half_float');
    supportLinearFiltering = (gl as WebGLRenderingContext).getExtension('OES_texture_half_float_linear');
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const halfFloatTexType = isWebGL2
    ? (gl as WebGL2RenderingContext).HALF_FLOAT
    : (halfFloat as { HALF_FLOAT_OES: number } | null)?.HALF_FLOAT_OES ?? 5121;

  let formatRGBA: { internalFormat: number; format: number };
  let formatRG: { internalFormat: number; format: number };
  let formatR: { internalFormat: number; format: number };

  if (isWebGL2) {
    const gl2 = gl as WebGL2RenderingContext;
    formatRGBA = getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl2, gl2.RG16F, gl2.RG, halfFloatTexType);
    formatR = getSupportedFormat(gl2, gl2.R16F, gl2.RED, halfFloatTexType);
  } else {
    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering: !!supportLinearFiltering,
    },
  };
}


  function getSupportedFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case (gl as WebGL2RenderingContext).R16F:
          return getSupportedFormat(gl, (gl as WebGL2RenderingContext).RG16F, (gl as WebGL2RenderingContext).RG, type);
        case (gl as WebGL2RenderingContext).RG16F:
          return getSupportedFormat(gl, (gl as WebGL2RenderingContext).RGBA16F, gl.RGBA, type);
        default:
          return { internalFormat: gl.RGBA, format: gl.RGBA };
      }
    }

    return {
      internalFormat,
      format,
    };
  }

  function supportRenderTextureFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      4,
      4,
      0,
      format,
      type,
      null
    );

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status == gl.FRAMEBUFFER_COMPLETE;
  }

  class Material {
    vertexShader: WebGLShader;
    fragmentShaderSource: string;
    programs: WebGLProgram[];
    activeProgram: WebGLProgram | null;
    uniforms: Record<string, WebGLUniformLocation | null>;

    constructor(vertexShader: WebGLShader, fragmentShaderSource: string) {
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
      this.programs = [];
      this.activeProgram = null;
      this.uniforms = {};
    }

    setKeywords(keywords: string[]) {
      let hash = 0;
      for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);

      let program = this.programs[hash];
      if (program == null) {
        const fragmentShader = compileShader(
          gl.FRAGMENT_SHADER,
          this.fragmentShaderSource,
          keywords
        );
        program = createProgram(this.vertexShader, fragmentShader);
        this.programs[hash] = program;
      }

      if (program == this.activeProgram) return;

      this.uniforms = getUniforms(program);
      this.activeProgram = program;
    }

    bind() {
      gl.useProgram(this.activeProgram);
    }
  }

  class Program {
    uniforms: Record<string, WebGLUniformLocation | null>;
    program: WebGLProgram;

    constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      this.uniforms = {};
      this.program = createProgram(vertexShader, fragmentShader);
      this.uniforms = getUniforms(this.program);
    }

    bind() {
      gl.useProgram(this.program);
    }
  }

  function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      console.trace(gl.getProgramInfoLog(program));

    return program;
  }

  function getUniforms(program: WebGLProgram) {
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(program, i)!.name;
      uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
    }
    return uniforms;
  }

  function compileShader(type: number, source: string, keywords?: string[]) {
    source = addKeywords(source, keywords);

    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.trace(gl.getShaderInfoLog(shader));

    return shader;
  }

  function addKeywords(source: string, keywords?: string[]) {
    if (keywords == null) return source;
    let keywordsString = '';
    keywords.forEach((keyword) => {
      keywordsString += '#define ' + keyword + '\n';
    });

    return keywordsString + source;
  }

  const baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;
    
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
    `
  );

  const copyShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    
    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
    `
  );

  const clearShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    
    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
    `
  );

  const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;
    
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;
    
    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }
    
    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        
        #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
        #endif
        
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
  `;

  const splatShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    
    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
    `
  );

  const advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    
    void main () {
        #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
        #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,
    ext.supportLinearFiltering ? undefined : ['MANUAL_FILTERING']
  );

  const divergenceShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    
    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
    `
  );

  const curlShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    
    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
    `
  );

  const vorticityShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    
    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
    `
  );

  const pressureShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
    `
  );

  const gradientSubtractShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
    `
  );

  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target: Record<string, unknown> | null, clear = false) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width as number, target.height as number);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo as WebGLFramebuffer);
      }
      if (clear) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  let dye: Record<string, unknown>;
  let velocity: Record<string, unknown>;
  let divergence: Record<string, unknown>;
  let curl: Record<string, unknown>;
  let pressure: Record<string, unknown>;

  const copyProgram = new Program(baseVertexShader, copyShader);
  const clearProgram = new Program(baseVertexShader, clearShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradienSubtractProgram = new Program(
    baseVertexShader,
    gradientSubtractShader
  );

  const displayMaterial = new Material(baseVertexShader, displayShaderSource);

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    if (dye == null)
      dye = createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    else
      dye = resizeDoubleFBO(
        dye,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );

    if (velocity == null)
      velocity = createDoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    else
      velocity = resizeDoubleFBO(
        velocity,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );

    divergence = createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    curl = createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
    pressure = createDoubleFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST
    );
  }

  function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      w,
      h,
      0,
      format,
      type,
      null
    );

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  function resizeFBO(target: Record<string, unknown>, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
    const newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture as WebGLUniformLocation, (target.attach as (id: number) => number)(0));
    blit(newFBO);
    return newFBO;
  }

  function resizeDoubleFBO(target: Record<string, unknown>, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
    if (target.width == w && target.height == h) return target;
    target.read = resizeFBO(
      target.read as Record<string, unknown>,
      w,
      h,
      internalFormat,
      format,
      type,
      param
    );
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
  }

  function updateKeywords() {
    const displayKeywords: string[] = [];
    if (config.SHADING) displayKeywords.push('SHADING');
    displayMaterial.setKeywords(displayKeywords);
  }

  updateKeywords();
  initFramebuffers();

  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;

  function update() {
    const dt = calcDeltaTime();
    if (resizeCanvas()) initFramebuffers();
    updateColors(dt);
    applyInputs();
    step(dt);
    render(null);
    requestAnimationFrame(update);
  }

  function calcDeltaTime() {
    const now = Date.now();
    const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
    lastUpdateTime = now;
    return dt;
  }

  function resizeCanvas() {
    const width = scaleByPixelRatio(canvas.clientWidth);
    const height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width != width || canvas.height != height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function updateColors(dt: number) {
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach((p: unknown) => {
        (p as Record<string, unknown>).color = generateColor();
      });
    }
  }

  function applyInputs() {
    pointers.forEach((p: unknown) => {
      if ((p as Record<string, boolean>).moved) {
        (p as Record<string, boolean>).moved = false;
        splatPointer(p as Record<string, unknown>);
      }
    });
  }

  function step(dt: number) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(
      curlProgram.uniforms.texelSize as WebGLUniformLocation,
      velocity.texelSizeX as number,
      velocity.texelSizeY as number
    );
    gl.uniform1i(curlProgram.uniforms.uVelocity as WebGLUniformLocation, ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(
      vorticityProgram.uniforms.texelSize as WebGLUniformLocation,
      velocity.texelSizeX as number,
      velocity.texelSizeY as number
    );
    gl.uniform1i(vorticityProgram.uniforms.uVelocity as WebGLUniformLocation, ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl as WebGLUniformLocation, ((curl as Record<string, unknown>).attach as (id: number) => number)(1));
    gl.uniform1f(vorticityProgram.uniforms.curl as WebGLUniformLocation, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt as WebGLUniformLocation, dt);
    blit(velocity.write as Record<string, unknown>);
    (velocity as Record<string, () => void>).swap();

    divergenceProgram.bind();
    gl.uniform2f(
      divergenceProgram.uniforms.texelSize as WebGLUniformLocation,
      velocity.texelSizeX as number,
      velocity.texelSizeY as number
    );
    gl.uniform1i(divergenceProgram.uniforms.uVelocity as WebGLUniformLocation, ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture as WebGLUniformLocation, ((pressure.read as Record<string, unknown>).attach as (id: number) => number)(0));
    gl.uniform1f(clearProgram.uniforms.value as WebGLUniformLocation, config.PRESSURE);
    blit(pressure.write as Record<string, unknown>);
    (pressure as Record<string, () => void>).swap();

    pressureProgram.bind();
    gl.uniform2f(
      pressureProgram.uniforms.texelSize as WebGLUniformLocation,
      velocity.texelSizeX as number,
      velocity.texelSizeY as number
    );
    gl.uniform1i(pressureProgram.uniforms.uDivergence as WebGLUniformLocation, ((divergence as Record<string, unknown>).attach as (id: number) => number)(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure as WebGLUniformLocation, ((pressure.read as Record<string, unknown>).attach as (id: number) => number)(1));
      blit(pressure.write as Record<string, unknown>);
      (pressure as Record<string, () => void>).swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(
      gradienSubtractProgram.uniforms.texelSize as WebGLUniformLocation,
      velocity.texelSizeX as number,
      velocity.texelSizeY as number
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uPressure as WebGLUniformLocation,
      ((pressure.read as Record<string, unknown>).attach as (id: number) => number)(0)
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uVelocity as WebGLUniformLocation,
      ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(1)
    );
    blit(velocity.write as Record<string, unknown>);
    (velocity as Record<string, () => void>).swap();

    advectionProgram.bind();
    gl.uniform2f(
      advectionProgram.uniforms.texelSize as WebGLUniformLocation,
      velocity.texelSizeX as number,
      velocity.texelSizeY as number
    );
    if (!ext.supportLinearFiltering)
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize as WebGLUniformLocation,
        velocity.texelSizeX as number,
        velocity.texelSizeY as number
      );
    const velocityId = ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity as WebGLUniformLocation, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource as WebGLUniformLocation, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt as WebGLUniformLocation, dt);
    gl.uniform1f(
      advectionProgram.uniforms.dissipation as WebGLUniformLocation,
      config.VELOCITY_DISSIPATION
    );
    blit(velocity.write as Record<string, unknown>);
    (velocity as Record<string, () => void>).swap();

    if (!ext.supportLinearFiltering)
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize as WebGLUniformLocation,
        dye.texelSizeX as number,
        dye.texelSizeY as number
      );
    gl.uniform1i(advectionProgram.uniforms.uVelocity as WebGLUniformLocation, ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(0));
    gl.uniform1i(advectionProgram.uniforms.uSource as WebGLUniformLocation, ((dye.read as Record<string, unknown>).attach as (id: number) => number)(1));
    gl.uniform1f(
      advectionProgram.uniforms.dissipation as WebGLUniformLocation,
      config.DENSITY_DISSIPATION
    );
    blit(dye.write as Record<string, unknown>);
    (dye as Record<string, () => void>).swap();
  }

  function render(target: Record<string, unknown> | null) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    drawDisplay(target);
  }

  function drawDisplay(target: Record<string, unknown> | null) {
    const width = target == null ? gl.drawingBufferWidth : target.width as number;
    const height = target == null ? gl.drawingBufferHeight : target.height as number;

    displayMaterial.bind();
    if (config.SHADING)
      gl.uniform2f(
        displayMaterial.uniforms.texelSize as WebGLUniformLocation,
        1.0 / width,
        1.0 / height
      );
    gl.uniform1i(displayMaterial.uniforms.uTexture as WebGLUniformLocation, ((dye.read as Record<string, unknown>).attach as (id: number) => number)(0));
    blit(target);
  }

  function splatPointer(pointer: Record<string, unknown>) {
    const dx = (pointer.deltaX as number) * config.SPLAT_FORCE;
    const dy = (pointer.deltaY as number) * config.SPLAT_FORCE;
    splat(pointer.texcoordX as number, pointer.texcoordY as number, dx, dy, pointer.color as Record<string, number>);
  }

  function clickSplat(pointer: Record<string, unknown>) {
    const color = generateColor();
    color.r *= 10.0;
    color.g *= 10.0;
    color.b *= 10.0;
    const dx = 10 * (Math.random() - 0.5);
    const dy = 30 * (Math.random() - 0.5);
    splat(pointer.texcoordX as number, pointer.texcoordY as number, dx, dy, color);
  }

  function splat(x: number, y: number, dx: number, dy: number, color: Record<string, number>) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget as WebGLUniformLocation, ((velocity.read as Record<string, unknown>).attach as (id: number) => number)(0));
    gl.uniform1f(
      splatProgram.uniforms.aspectRatio as WebGLUniformLocation,
      canvas.width / canvas.height
    );
    gl.uniform2f(splatProgram.uniforms.point as WebGLUniformLocation, x, y);
    gl.uniform3f(splatProgram.uniforms.color as WebGLUniformLocation, dx, dy, 0.0);
    gl.uniform1f(
      splatProgram.uniforms.radius as WebGLUniformLocation,
      correctRadius(config.SPLAT_RADIUS / 100.0)
    );
    blit(velocity.write as Record<string, unknown>);
    (velocity as Record<string, () => void>).swap();

    gl.uniform1i(splatProgram.uniforms.uTarget as WebGLUniformLocation, ((dye.read as Record<string, unknown>).attach as (id: number) => number)(0));
    gl.uniform3f(splatProgram.uniforms.color as WebGLUniformLocation, color.r, color.g, color.b);
    blit(dye.write as Record<string, unknown>);
    (dye as Record<string, () => void>).swap();
  }

  function correctRadius(radius: number) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }

  window.addEventListener('mousedown', (e) => {
    const pointer = pointers[0] as Record<string, unknown>;
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    updatePointerDownData(pointer, -1, posX, posY);
    clickSplat(pointer);
  });

  document.body.addEventListener('mousemove', function handleFirstMouseMove(e) {
    const pointer = pointers[0] as Record<string, unknown>;
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    const color = generateColor();

    update();
    updatePointerMoveData(pointer, posX, posY, color);

    document.body.removeEventListener('mousemove', handleFirstMouseMove);
  });

  window.addEventListener('mousemove', (e) => {
    const pointer = pointers[0] as Record<string, unknown>;
    const posX = scaleByPixelRatio(e.clientX);
    const posY = scaleByPixelRatio(e.clientY);
    const color = pointer.color as Record<string, number>;

    updatePointerMoveData(pointer, posX, posY, color);
  });

  document.body.addEventListener(
    'touchstart',
    function handleFirstTouchStart(e) {
      const touches = e.targetTouches;
      const pointer = pointers[0] as Record<string, unknown>;

      for (let i = 0; i < touches.length; i++) {
        const posX = scaleByPixelRatio(touches[i].clientX);
        const posY = scaleByPixelRatio(touches[i].clientY);

        update();
        updatePointerDownData(pointer, touches[i].identifier, posX, posY);
      }

      document.body.removeEventListener('touchstart', handleFirstTouchStart);
    }
  );

  window.addEventListener('touchstart', (e) => {
    const touches = e.targetTouches;
    const pointer = pointers[0] as Record<string, unknown>;
    for (let i = 0; i < touches.length; i++) {
      const posX = scaleByPixelRatio(touches[i].clientX);
      const posY = scaleByPixelRatio(touches[i].clientY);
      updatePointerDownData(pointer, touches[i].identifier, posX, posY);
    }
  });

  window.addEventListener(
    'touchmove',
    (e) => {
      const touches = e.targetTouches;
      const pointer = pointers[0] as Record<string, unknown>;
      for (let i = 0; i < touches.length; i++) {
        const posX = scaleByPixelRatio(touches[i].clientX);
        const posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(pointer, posX, posY, pointer.color as Record<string, number>);
      }
    },
    false
  );

  window.addEventListener('touchend', (e) => {
    const touches = e.changedTouches;
    const pointer = pointers[0] as Record<string, unknown>;

    for (let i = 0; i < touches.length; i++) {
      updatePointerUpData(pointer);
    }
  });

  function updatePointerDownData(pointer: Record<string, unknown>, id: number, posX: number, posY: number) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor();
  }

  function updatePointerMoveData(pointer: Record<string, unknown>, posX: number, posY: number, color: Record<string, number>) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX((pointer.texcoordX as number) - (pointer.prevTexcoordX as number));
    pointer.deltaY = correctDeltaY((pointer.texcoordY as number) - (pointer.prevTexcoordY as number));
    pointer.moved =
      Math.abs(pointer.deltaX as number) > 0 || Math.abs(pointer.deltaY as number) > 0;
    pointer.color = color;
  }

  function updatePointerUpData(pointer: Record<string, unknown>) {
    pointer.down = false;
  }

  function correctDeltaX(delta: number) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  function correctDeltaY(delta: number) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  function generateColor() {
    const c = HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
  }

  function HSVtoRGB(h: number, s: number, v: number) {
    let r: number, g: number, b: number;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v; g = t; b = p;
        break;
      case 1:
        r = q; g = v; b = p;
        break;
      case 2:
        r = p; g = v; b = t;
        break;
      case 3:
        r = p; g = q; b = v;
        break;
      case 4:
        r = t; g = p; b = v;
        break;
      case 5:
        r = v; g = p; b = q;
        break;
      default:
        r = g = b = 0;
    }

    return { r, g, b };
  }

  function wrap(value: number, min: number, max: number) {
    const range = max - min;
    if (range == 0) return min;
    return ((value - min) % range) + min;
  }

  function getResolution(resolution: number) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);

    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
      return { width: max, height: min };
    else return { width: min, height: max };
  }

  function scaleByPixelRatio(input: number) {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  function hashCode(s: string) {
    if (s.length == 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // Start the animation loop
  update();

  // Return cleanup function
  return () => {
    // Clean up WebGL resources and event listeners if needed
  };
};

export default fluidCursor;
