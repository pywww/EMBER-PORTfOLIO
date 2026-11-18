/* Rift shader adaptation: https://github.com/Emmjeyyyy/rift-gen-emm */
(function(){
 const canvas=document.createElement('canvas');
 canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:19;pointer-events:none;mix-blend-mode:screen';
 document.body.append(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false});
 if(!gl)return;
 const vertex='attribute vec2 a; void main(){gl_Position=vec4(a,0.,1.);}';
 const fragment=`precision highp float;
 uniform vec2 resolution; uniform float time; uniform float progress; uniform float maskPass;
 // Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion for the rough paper edge
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // Loop of octaves
    for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(st * frequency);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}


 void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 st=uv*2.0-1.0; st.x*=resolution.x/resolution.y;
  float motionTime=time*0.28;
  float gentleWave=fbm(st*1.5+vec2(0.0,motionTime*0.05));
  float fineCrumble=fbm(st*12.0);
  float microDetail=fbm(st*30.0+1.3);
  float tinyGrit=snoise(st*80.0);
  float edgeNoise=gentleWave*0.33+fineCrumble*0.060+microDetail*0.020+tinyGrit*0.006;
  float boundary=1.0-2.32+2.64*progress;
  float edge=st.y-boundary+edgeNoise*0.4;
  if(maskPass>0.5){gl_FragColor=vec4(1.0,1.0,1.0,1.0-smoothstep(-0.003,0.003,edge));return;}
  float glow=smoothstep(0.08,0.0,edge)-smoothstep(0.0,-0.02,edge);
  float core=smoothstep(0.014,0.0,edge)-smoothstep(0.0,-0.014,edge);
  float pulse=0.8+0.2*sin(motionTime*3.0);
  float dustNoise=snoise(st*20.0-vec2(0.0,motionTime));
  float dust=smoothstep(0.92,1.0,dustNoise)*(smoothstep(0.15,0.0,edge)-smoothstep(0.0,-0.05,edge))*0.42;
  float fade=smoothstep(0.0,0.05,progress)*(1.0-smoothstep(0.95,1.0,progress));
  float alpha=clamp(max(max(glow*pulse,core),dust)*fade*0.78,0.0,1.0);
  float lightLevel=clamp(glow*pulse*0.58+core*0.42+dust*0.38,0.0,0.86);
  float glint=core*smoothstep(0.35,0.75,snoise(vec2(st.x*4.0,motionTime*0.2)))*0.12;
  gl_FragColor=vec4(vec3(0.69,0.82,0.93)*lightLevel+vec3(0.78,0.88,0.96)*glint,alpha);
 }`;
 function compile(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
 try{
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const res=gl.getUniformLocation(program,'resolution'),tm=gl.getUniformLocation(program,'time'),pr=gl.getUniformLocation(program,'progress'),mask=gl.getUniformLocation(program,'maskPass');
 const fb=gl.createFramebuffer(),tex=gl.createTexture(),maskCanvas=document.createElement('canvas'),maskCtx=maskCanvas.getContext('2d'),flipCanvas=document.createElement('canvas'),flipCtx=flipCanvas.getContext('2d');let mw=0,mh=0,pixels,data;
 window.renderJourneyRift=(p,t)=>{const d=Math.min(devicePixelRatio,1.5),w=Math.round(innerWidth*d),h=Math.round(innerHeight*d);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.uniform1f(tm,t);gl.uniform1f(pr,p);let maskUrl=null;
  if(p>0&&p<1){const width=640,height=Math.max(1,Math.round(width*h/w));if(mw!==width||mh!==height){mw=width;mh=height;pixels=new Uint8Array(mw*mh*4);maskCanvas.width=flipCanvas.width=mw;maskCanvas.height=flipCanvas.height=mh;data=maskCtx.createImageData(mw,mh);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,mw,mh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);}
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,mw,mh);gl.uniform2f(res,mw,mh);gl.uniform1f(mask,1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.readPixels(0,0,mw,mh,gl.RGBA,gl.UNSIGNED_BYTE,pixels);data.data.set(pixels);maskCtx.putImageData(data,0,0);flipCtx.setTransform(1,0,0,-1,0,mh);flipCtx.clearRect(0,0,mw,mh);flipCtx.drawImage(maskCanvas,0,0);maskUrl=flipCanvas.toDataURL();}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.uniform2f(res,w,h);gl.uniform1f(mask,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return maskUrl;};
 }catch(e){canvas.remove();console.error('Rift shader:',e);}
})();
