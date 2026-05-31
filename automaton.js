class Automaton {
  constructor(w, h, r=0) {

    this.w = w;
    this.h = h;
    this.s = w*h;
    this.r = r;
    this.c = new Uint8Array(this.s);
    this.n = new Uint8Array(this.s);

    this.nb = new Array(this.s);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const nb = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = (y + dy + h) % h;
            const nx = (x + dx + w) % w;
            nb.push(ny * w + nx);
          }
        }
        this.nb[i] = nb;
      }
    }

  }

  step() {
    for (let i=0;i<this.s;i++) {
      const nb = this.nb[i];
      const t = this.c[nb[0]]+this.c[nb[1]]+this.c[nb[2]]+this.c[nb[3]]+
                this.c[nb[4]]+this.c[nb[5]]+this.c[nb[6]]+this.c[nb[7]];
      const v = this.c[i];
      this.n[i] = (this.r>>(v*9+t))&1;
    }
    [this.c,this.n] = [this.n,this.c];
  }

  stepn(k,l=0) {
    for (let j=0;j<k;j++) {
      let ch = false;
      for (let i=0;i<this.s;i++) {
        const nb = this.nb[i];
        const t = this.c[nb[0]]+this.c[nb[1]]+this.c[nb[2]]+this.c[nb[3]]+
                  this.c[nb[4]]+this.c[nb[5]]+this.c[nb[6]]+this.c[nb[7]];
        const v = this.c[i];
        const nv = (this.r>>(v*9+t))&1;
        this.n[i] = nv;
        l += nv-v;
        if (nv !== v) ch = true;
      }
      [this.c,this.n] = [this.n,this.c];
      if (l===0 || !ch) break;
    }
  }

  setImageData(d,lut) {
    for (let i=0;i<this.s;i++) {
      const nb = this.nb[i];
      const t = this.c[nb[0]]+this.c[nb[1]]+this.c[nb[2]]+this.c[nb[3]]+
                this.c[nb[4]]+this.c[nb[5]]+this.c[nb[6]]+this.c[nb[7]];
      const p = i*4
      const v = this.c[i];
      const l = lut[t+v*9];
      d[p  ] = l[0];
      d[p+1] = l[1];
      d[p+2] = l[2];
    }
  }

}

export { Automaton };
