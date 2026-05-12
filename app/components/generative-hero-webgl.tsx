"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const VERT_SRC = `#version 300 es
const vec2 kPos[3] = vec2[](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
const vec2 kUv[3] = vec2[](vec2(0.0, 0.0), vec2(2.0, 0.0), vec2(0.0, 2.0));
out vec2 v_uv;
void main() {
  v_uv = kUv[gl_VertexID];
  gl_Position = vec4(kPos[gl_VertexID], 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_mouse;
// Aerial-camera offset in UV space. The terrain "pans" by sampling a
// shifted region of the texture; the canvas itself stays viewport-sized
// so the apparent zoom level is unchanged.
uniform vec2 u_camera;

in vec2 v_uv;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.3;

  vec2 warpIn = uv * 2.8 + vec2(t * 0.15, -t * 0.12);
  vec2 q = vec2(
    fbm(warpIn + vec2(0.0, 0.0)),
    fbm(warpIn + vec2(13.7, 2.4))
  );
  vec2 warp = (q - 0.5) * 0.065;
  vec2 uvw = uv + warp + u_camera;

  vec2 m = u_mouse;
  vec2 delta = uvw - m;
  float dist = length(delta);
  const float radius = 0.3;
  const float intensity = 0.025;
  float falloff = (1.0 - smoothstep(0.0, radius, dist));
  vec2 dir = dist > 1e-5 ? delta / dist : vec2(0.0);
  uvw += dir * falloff * intensity;

  // No clamp here — let MIRRORED_REPEAT (set in texParameteri) handle
  // sampling outside [0,1] when the aerial-camera offset pushes us past
  // the edge. clamp() would defeat the wrap mode and produce streaks.
  vec3 col = texture(u_tex, uvw).rgb;

  vec2 vc = uv - 0.5;
  float vig = 1.0 - dot(vc, vc) * 0.42;
  col *= clamp(vig, 0.35, 1.0);

  fragColor = vec4(col, 1.0);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram | null {
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

export type GenerativeHeroWebGLProps = Readonly<{
  /** Full-resolution texture (large). Loaded after the preview when both are set. */
  textureSrc?: string;
  /** Low-res texture shown first; WebGL swaps to `textureSrc` when it finishes loading. */
  texturePreviewSrc?: string;
  className?: string;
}>;

/**
 * Imperative handle for the WebGL hero. Used by the aerial-camera
 * controller to pan the terrain's UV sampling region without resizing
 * or scaling the canvas (which would visibly zoom the shader).
 */
export type GenerativeHeroWebGLHandle = Readonly<{
  /**
   * Set the texture-sampling camera offset, in UV space.
   * x=0,y=0 is the production look. Typical range is ±0.15.
   */
  setCameraOffset(x: number, y: number): void;
}>;

export const GenerativeHeroWebGL = forwardRef<
  GenerativeHeroWebGLHandle,
  GenerativeHeroWebGLProps
>(function GenerativeHeroWebGL(
  {
    textureSrc = "/textures/volcanic-terrain-hero.png",
    texturePreviewSrc = "/textures/volcanic-terrain-hero-low.png",
    className = "",
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const [surfaceReady, setSurfaceReady] = useState(false);
  // Camera UV offset is held in a ref so the imperative handle can mutate
  // it from outside while the RAF draw loop reads it each frame.
  const cameraOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useImperativeHandle(
    ref,
    () => ({
      setCameraOffset(x: number, y: number) {
        cameraOffsetRef.current.x = x;
        cameraOffsetRef.current.y = y;
      },
    }),
    [],
  );

  const loadTexture = useCallback(
    (gl: WebGL2RenderingContext, url: string): Promise<WebGLTexture | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const tex = gl.createTexture();
          if (!tex) {
            resolve(null);
            return;
          }
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          // MIRRORED_REPEAT so the aerial-camera UV offset never produces
          // edge-pixel smearing when sampling outside [0,1]; the texture
          // is noise-like terrain, so a mirrored extension reads as a
          // continuation of the same material.
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img,
          );
          gl.bindTexture(gl.TEXTURE_2D, null);
          resolve(tex);
        };
        img.onerror = () => {
          console.error("GenerativeHeroWebGL: failed to load texture", url);
          resolve(null);
        };
        img.src = url;
      });
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    setSurfaceReady(false);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      console.error("GenerativeHeroWebGL: WebGL2 not available");
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const program = createProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!program) return;

    const vao = gl.createVertexArray();
    if (!vao) {
      gl.deleteProgram(program);
      return;
    }
    gl.bindVertexArray(vao);

    const locTex = gl.getUniformLocation(program, "u_tex");
    const locTime = gl.getUniformLocation(program, "u_time");
    const locMouse = gl.getUniformLocation(program, "u_mouse");
    const locCamera = gl.getUniformLocation(program, "u_camera");

    let tex: WebGLTexture | null = null;
    let raf = 0;
    let totalT = 0;
    let lastFrame = performance.now();
    let mouseTargetX = 0.5;
    let mouseTargetY = 0.5;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let wasHidden = document.hidden;

    /** Canvas size tracks this container. Immersive hero mounts the component inside a
     * viewport-fixed shell so accordion/document height does not trigger resizes here. */
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.max(1, Math.floor(w * dpr));
      const bh = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, bw, bh);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / Math.max(r.width, 1);
      const y = (e.clientY - r.top) / Math.max(r.height, 1);
      mouseTargetX = Math.min(1, Math.max(0, x));
      mouseTargetY = Math.min(1, Math.max(0, y));
    };

    const onLeave = () => {
      mouseTargetX = 0.5;
      mouseTargetY = 0.5;
    };

    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerleave", onLeave);

    const markSurfaceReady = () => {
      if (!mountedRef.current) return;
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setSurfaceReady(true);
        }
      });
    };

    const usePreviewFirst =
      Boolean(texturePreviewSrc) && texturePreviewSrc !== textureSrc;

    if (!usePreviewFirst) {
      void loadTexture(gl, textureSrc).then((t) => {
        if (!mountedRef.current) {
          if (t) gl.deleteTexture(t);
          return;
        }
        tex = t;
        markSurfaceReady();
      });
    } else {
      void loadTexture(gl, texturePreviewSrc).then((preview) => {
        if (!mountedRef.current) {
          if (preview) gl.deleteTexture(preview);
          return;
        }
        if (preview) {
          tex = preview;
          markSurfaceReady();
        }
        void loadTexture(gl, textureSrc).then((full) => {
          if (!mountedRef.current) {
            if (full) gl.deleteTexture(full);
            return;
          }
          if (full) {
            if (tex) gl.deleteTexture(tex);
            tex = full;
          } else if (!preview) {
            // Neither texture loaded; overlay stays.
          }
          if (!preview && full) {
            markSurfaceReady();
          }
        });
      });
    }

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const frameNow = performance.now();
      const hidden = document.hidden;
      if (!hidden) {
        if (wasHidden) {
          lastFrame = frameNow;
        } else {
          totalT += (frameNow - lastFrame) / 1000;
        }
      }
      wasHidden = hidden;
      lastFrame = frameNow;

      if (hidden) {
        return;
      }

      const t = totalT;

      mouseX += (mouseTargetX - mouseX) * 0.06;
      mouseY += (mouseTargetY - mouseY) * 0.06;

      gl.useProgram(program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (tex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(locTex, 0);
      }
      gl.uniform1f(locTime, t);
      gl.uniform2f(locMouse, mouseX, 1 - mouseY);
      gl.uniform2f(
        locCamera,
        cameraOffsetRef.current.x,
        cameraOffsetRef.current.y,
      );

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      if (tex) gl.deleteTexture(tex);
    };
  }, [loadTexture, texturePreviewSrc, textureSrc]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 block h-full w-full touch-pan-y"
      />
      <div
        className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ease-out motion-reduce:duration-0 ${
          surfaceReady ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#1c0c10] via-[#0c0c0f] to-[#14100e] opacity-[0.92] motion-reduce:animate-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,rgba(160,52,44,0.14),transparent_58%)]" />
      </div>
    </div>
  );
});
