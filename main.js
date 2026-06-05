import { Automaton } from "./automaton.js";

const max = 64;
const maxp = 512*512/max;

const s = 128;
const ss = s*s;
const s2 = s/2;

const z = 256;
const zz = z*z;
const z2 = z/2;

grid.style.gridTemplateColumns = `repeat(auto-fill,${s}px)`;

for (let i=0;i<max;i++) {
  const e = document.createElement("div");
  e.style.width = s+"px";
  e.style.height = s+32+"px";
  const m = document.createElement("img");
  e.appendChild(m);
  const n = document.createElement("div");
  n.innerText = i;
  e.appendChild(n);
  grid.appendChild(e);
}

const setCols = () => {
  grid.style.maxWidth = "";
  const w = grid.clientWidth;
  const cols = [16,12,8,4,2,1].find(i=>i*(s+4)-4<=w)||1;
  grid.style.maxWidth = cols*(s+4)-4+"px";
}
//window.addEventListener("resize",setCols);
//setCols();

const getRule = (n) => {
  const b = [];
  for (let i = 0; i < 9; i++) {
    if (n & (1 << i)) b.push(i);
  }
  return b;
}

const updateURL = () => {
  history.replaceState({}, "", `?p=${p+1}&r=${r}&t=${type.value}`);
}

const page = (d) => {
  const po = p;
  p = Math.max(0,Math.min(maxp-1,p+d));
  input0.value = p+1;
  input1.value = p+1;
  if (p!==po) {
    updateURL();
    if (id !== null) {
      cancelAnimationFrame(id);
      id = null;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    t0 = 0;
    for (let i=0;i<max;i++) {
      grid.children[i].children[0].src = "";
      const q = i+max*p;
      const br = getRule(q%512);
      const sr = getRule(Math.floor(q/512));
      grid.children[i].children[1].innerText = q+"\nB"+br.join("")+"/S"+sr.join("");
      grid.children[i].onclick = () => { rule(q) };
    }
    id = requestAnimationFrame(u);
  }
}

const ipage = (e) => {
  const v = parseInt(e.target.value);
  if (!isNaN(v)) {
    if (e.type === "keydown") {
      if (e.key === "Enter") page(v-p-1);
    } else if (e.type === "blur") {
      page(v-p-1);
    }
  }
}

prev0.onclick = prev1.onclick = () => { page(-1) };
next0.onclick = next1.onclick = () => { page(+1) };

input0.addEventListener("keydown",ipage);
input1.addEventListener("keydown",ipage);
input0.addEventListener("blur",ipage);
input1.addEventListener("blur",ipage);

const dot4 = ([x0,y0,z0,w0],[x1,y1,z1,w1]) => x0*x1+y0*y1+z0*z1+w0*w1;
const dot2 = ([x0,y0],[x1,y1]) => x0*x1+y0*y1;

const turbo = (x) => {
  const kr4 = [0.13572138,  4.61539260, -42.66032258, 132.13108234];
  const kg4 = [0.09140261,  2.19418839,   4.84296658, -14.18503333];
  const kb4 = [0.10667330, 12.64194608, -60.58204836, 110.36276771];
  const kr2 = [-152.94239396, 59.28637943];
  const kg2 = [   4.27729857,  2.82956604];
  const kb2 = [ -89.90310912, 27.34824973];
  const v4 = [1,x,x*x,x*x*x];
  const v2 = [v4[2]*v4[2],v4[3]*v4[2]];
  return [
    dot4(v4,kr4)+dot2(v2,kr2),
    dot4(v4,kg4)+dot2(v2,kg2),
    dot4(v4,kb4)+dot2(v2,kb2)
  ];
}

const turboLUT = [];
for (let i=0;i<18;i++) {
  turboLUT[i] = turbo(i/18).map(j=>j*255);
}

const c0 = document.createElement("canvas");
c0.width = c0.height = s;
const ctx0 = c0.getContext("2d");
const img0 = ctx0.createImageData(s,s);
const d0 = img0.data;
for (let i=3;i<ss*4;i+=4) d0[i] = 255;

const a0 = new Automaton(s,s);

let t0 = 0;
let t1 = 0;
let p = -1;
let r = 0;
let id = null;

const u = () => {
  const q = t0+max*p;
  if (q<512*512) {
    a0.r = q;
    a0.c.fill(0);
    a0.c[s2+s2*s-s] = a0.c[s2+s2*s-s-1] = a0.c[s2+s2*s-1] = a0.c[s2+s2*s] = 1;
    a0.stepn(s2-2,4);
    a0.setImageData(d0,turboLUT);
    ctx0.putImageData(img0,0,0);
    grid.children[t0].children[0].src = c0.toDataURL();
  }
  t0++;
  if (t0<max) id = requestAnimationFrame(u);
  else id = null;
}

c1.width = c1.height = z;
//c1.style.width = c1.style.height = z*2+"px";
const ctx1 = c1.getContext("2d");
const img1 = ctx1.createImageData(z,z);
const d1 = img1.data;
for (let i=3;i<zz*4;i+=4) d1[i] = 255;

const a1 = new Automaton(256,256);

const rule = (q) => {
  r = a1.r = ruleInput.value = q;
  const br = getRule(q%512);
  const sr = getRule(Math.floor(q/512));
  ruleInput2.value = "B"+br.join("")+"/S"+sr.join("");
  reset.onclick();
  updateURL();
}

ruleInput.addEventListener("input",() => {
  r = a1.r = parseInt(ruleInput.value);
  const br = getRule(r%512);
  const sr = getRule(Math.floor(r/512));
  ruleInput2.value = "B"+br.join("")+"/S"+sr.join("");
  page((r/max|0)-p);
  reset.onclick();
  updateURL();
});

const s2q = (s) => {
  const m = s.match(/^B\s*([0-8]*)\s*\/?\s*S\s*([0-8]*)$/i);
  if (!m) return null;
  let [_,br,sr] = m;
  let r = 0;
  for (let c of br) r |= 1 << c;
  for (let c of sr) r |= 1 << (+c + 9);
  return r;
};

ruleInput2.addEventListener("input",() => {
  const q = s2q(ruleInput2.value);
  if (q===null) return;
  r = a1.r = q;
  page((r/max|0)-p);
  reset.onclick();
  updateURL();
});

random.onclick = () => {
  const q = Math.random()*0x3ffff|0;
  page((q/max|0)-p);
  rule(q);
}

type.addEventListener("change",()=>{
  reset.onclick();
  updateURL();
});

let playing = true;
reset.onclick = () => {
  t1 = 0;
  a1.c.fill(0);
  if (type.value == 0 || type.value == 1) {
    a1.c[z2+z2*z-z] = a1.c[z2+z2*z-z-1] = a1.c[z2+z2*z-1] = a1.c[z2+z2*z] = 1;
  } else {
    //for (let i=0;i<a1.s;i++) a1.c[i] = Math.random()<0.5?1:0;
    for (let y=0;y<a1.h;y++) {
      for (let x=0;x<a1.w;x++) {
        a1.c[x+y*a1.w] = Math.max(Math.abs(x-a1.w/2),Math.abs(y-a1.h/2))<Math.min(a1.w,a1.h)/8?(Math.random()<0.5?1:0):0;
      }
    }
  }
  a1.setImageData(d1,turboLUT);
  ctx1.putImageData(img1,0,0);
}
step.onclick = () => {
  a1.step();
  a1.setImageData(d1,turboLUT);
  ctx1.putImageData(img1,0,0);
}
play.onclick = () => {
  play.innerText = playing?"Play":"Pause";
  playing = !playing;
}

const anim = () => {
  if (playing&&(type.value!=0||t1<z2-2)) {
    a1.step();
    a1.setImageData(d1,turboLUT);
    ctx1.putImageData(img1,0,0);
    t1++;
  }
  requestAnimationFrame(anim);
}
anim();

const params = new URLSearchParams(window.location.search);
page(parseInt(params.get("p"))||1);
type.value = params.get("t")||"0";
rule(parseInt(params.get("r"))||0);
