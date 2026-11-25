import { useEffect, useRef, type RefObject } from 'react'

/* Живое пламя вокруг головы. Сила пламени = доля заряда, burst = вспышка при сборе. */

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float t, power, burst;

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0., a=.5;
  for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+vec2(7.1,3.7); a*=.5; }
  return v;
}

void main(){
  /* начало координат в центре головы, единица = ширина экрана пополам */
  vec2 p=(gl_FragCoord.xy-vec2(.5,.44)*res)/(.5*res.x);
  float up=max(p.y,0.);

  /* узкие языки: по горизонтали частые, по вертикали вытянутые, бегут вверх */
  vec2 q=vec2(p.x*4.6, p.y*1.5-t*1.5);
  float warp=fbm(q*.7+vec2(0.,t*.4))-.5;
  float n=fbm(vec2(q.x+warp*2.2, q.y+warp*.8));
  float lick=fbm(vec2(p.x*9.+warp*3., p.y*2.6-t*2.6));
  n=n*.72+lick*.28;

  /* тело огня: овал по голове, вверх вытягивается с ростом силы */
  float h=mix(.56,.98,power);
  float d=length(vec2(p.x/mix(.52,.64,power), p.y>0. ? p.y/h : p.y/.5));
  float v=(1.-d)*.9+(n-.5)*(.75+up*1.1)*mix(.5,1.,power);
  v-=(1.-power)*.14+smoothstep(.15,.0,power)*.3;
  v+=burst*.45;

  /* жёсткие ступени цвета: рисованный огонь, а не размытое свечение */
  vec3 c=vec3(.01,.2,.2);
  c=mix(c,vec3(.03,.42,.41),smoothstep(.03,.06,v));
  c=mix(c,vec3(.14,.76,.73),smoothstep(.11,.15,v));
  c=mix(c,vec3(.439,1.,.965),smoothstep(.27,.32,v));
  c=mix(c,vec3(1.),smoothstep(.52,.6,v));
  float a=smoothstep(0.,.03,v);

  /* искры */
  for(int k=0;k<2;k++){
    float s=float(k);
    vec2 g=vec2(p.x*7.+sin(t*.8+p.y*3.+s)*.5+s*3.3, p.y*5.-t*(1.6+s*.7));
    vec2 id=floor(g), f=fract(g)-.5;
    float r=hash(id+s*17.);
    vec2 o=(vec2(hash(id+3.1),hash(id+9.7))-.5)*.6;
    float spark=smoothstep(.085,.03,length((f-o)*vec2(1.,.6)))*step(1.-.3*power,r);
    spark*=smoothstep(1.2,.35,length(p*vec2(.95,.75)));
    c=mix(c,vec3(.5,1.,.96),spark); a=max(a,spark);
  }

  /* ударная волна при сборе */
  float ring=burst*smoothstep(.09,.0,abs(length(p)-(1.-burst)*1.7));
  c=mix(c,vec3(.7,1.,.98),ring); a=max(a,ring);

  /* мягко гасим у краёв холста, чтобы не было среза */
  vec2 e=gl_FragCoord.xy/res;
  a*=smoothstep(0.,.1,e.y)*smoothstep(1.,.82,e.y)*smoothstep(0.,.05,e.x)*smoothstep(1.,.95,e.x);
  gl_FragColor=vec4(c*a,a);
}`

export type FireState = { power: number; burst: number }

export function Fire({ state, className }: { state: RefObject<FireState>; className: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext('webgl', { premultipliedAlpha: true, antialias: false })
    /* нет WebGL: остаётся пламя, нарисованное на самом рендере */
    if (!canvas || !gl) return

    const program = gl.createProgram()
    for (const [type, src] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh))
      gl.attachShader(program, sh)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.bindAttribLocation(program, 0, 'a')
    gl.vertexAttribPointer(gl.getAttribLocation(program, 'a'), 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(program, n)
    const [uRes, uT, uPower, uBurst] = [u('res'), u('t'), u('power'), u('burst')]

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let visible = true
    const draw = (now: number) => {
      const dpr = Math.min(devicePixelRatio, 1.5)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
      gl.uniform1f(uT, still ? 4 : now / 1000)
      gl.uniform1f(uPower, state.current.power)
      gl.uniform1f(uBurst, still ? 0 : state.current.burst)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      frame = visible ? requestAnimationFrame(draw) : 0
    }
    /* не тратим батарею, когда героя не видно */
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(draw)
    })
    io.observe(canvas)
    return () => {
      visible = false
      cancelAnimationFrame(frame)
      io.disconnect()
    }
  }, [state])

  return <canvas ref={ref} className={className} aria-hidden />
}
