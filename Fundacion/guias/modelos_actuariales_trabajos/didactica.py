# Material didáctico: cajas «En cristiano» (explicación para principiantes) y ejemplos dinámicos (JS) por tema.
CSS = """
.dummy { border-left: 3px solid var(--pres); background: var(--pres-soft); padding: 10px 14px; border-radius: 4px; margin: 10px 0; font-size: 15px; }
.dummy b.dh { color: var(--pres); font-family: var(--font-data); font-size: 11.5px; letter-spacing: .06em; text-transform: uppercase; display: block; margin-bottom: 4px; }
.viz { background: var(--surface); border: 1px solid var(--rule); border-radius: 6px; padding: 12px 14px; margin: 14px 0; }
.viz h4 { margin: 0 0 4px; color: var(--title); }
.viz .vsub { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
.viz .ctl { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; margin: 6px 0 8px; font-family: var(--font-data); font-size: 12.5px; }
.viz .ctl label { display: flex; align-items: center; gap: 6px; }
.viz .ctl input[type=range] { width: 150px; accent-color: var(--accent); }
.viz .ctl select, .viz .ctl button { background: var(--bg); color: var(--ink); border: 1px solid var(--rule); border-radius: 4px; padding: 3px 6px; font-family: var(--font-data); }
.viz canvas { width: 100%; max-width: 760px; height: 300px; display: block; background: var(--bg); border: 1px solid var(--rule); border-radius: 4px; }
.viz .out { font-family: var(--font-data); font-size: 12.5px; color: var(--ok); margin-top: 6px; line-height: 1.6; }
.viz .read { font-size: 14px; color: var(--muted); margin: 6px 0 0; }
"""

def viz(wid, title, sub, controls, read):
    ctl = "".join(controls)
    return (f'<div class="viz" data-w="{wid}"><h4>{title}</h4><p class="vsub">{sub}</p><div class="ctl">{ctl}</div>'
            f'<canvas></canvas><div class="out"></div><p class="read">{read}</p></div>')

def sl(name, label, mn, mx, val, step):
    return f'<label>{label} <input type="range" name="{name}" min="{mn}" max="{mx}" value="{val}" step="{step}"><span class="v" data-for="{name}"></span></label>'

JS = r"""
(function(){
const css=()=>getComputedStyle(document.documentElement);
const C=()=>({ink:css().getPropertyValue('--ink').trim()||'#eee',acc:css().getPropertyValue('--accent').trim()||'#9cc4f2',pres:css().getPropertyValue('--pres').trim()||'#f2dc8a',bad:css().getPropertyValue('--unknown').trim()||'#f4968a',mut:css().getPropertyValue('--muted').trim()||'#aaa',rule:css().getPropertyValue('--rule').trim()||'#333',ok:css().getPropertyValue('--ok').trim()||'#a9dcf0'});
const rn=()=>{let u=0,v=0;while(!u)u=Math.random();v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const rg=(a)=>{if(a<1)return rg(a+1)*Math.pow(Math.random(),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{x=rn();v=1+c*x}while(v<=0);v=v*v*v;const u=Math.random();if(Math.log(u)<.5*x*x+d-d*v+d*Math.log(v))return d*v}};
const re=()=>-Math.log(1-Math.random());
const rch=(k)=>2*rg(k/2);
function Phi(x){const t=1/(1+.2316419*Math.abs(x)),d=.3989423*Math.exp(-x*x/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p}
function qn(p){let lo=-8,hi=8;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(Phi(m)<p)lo=m;else hi=m}return(lo+hi)/2}
function setup(cv){const r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;cv.width=r.width*d;cv.height=300*d;const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,r.width,300);return {g,w:r.width,h:300}}
function axes(g,w,h,x0,x1,y0,y1,c,xl,yl){g.strokeStyle=c.rule;g.fillStyle=c.mut;g.font='11px monospace';g.lineWidth=1;g.beginPath();g.moveTo(40,h-28);g.lineTo(w-10,h-28);g.moveTo(40,10);g.lineTo(40,h-28);g.stroke();
 for(let i=0;i<=5;i++){const x=40+(w-50)*i/5;g.fillText((x0+(x1-x0)*i/5).toFixed(Math.abs(x1-x0)<5?2:0),x-8,h-14);const y=h-28-(h-38)*i/5;g.fillText((y0+(y1-y0)*i/5).toFixed(Math.abs(y1)<5?2:0),2,y+3)}
 if(xl)g.fillText(xl,w-90,h-2);if(yl)g.fillText(yl,44,18)}
const X=(v,x0,x1,w)=>40+(w-50)*(v-x0)/(x1-x0), Y=(v,y0,y1,h)=>h-28-(h-38)*(v-y0)/(y1-y0);
function line(g,pts,col,lw){g.strokeStyle=col;g.lineWidth=lw||2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()}
function vl(g,x,h,col,lab){g.strokeStyle=col;g.setLineDash([5,4]);g.beginPath();g.moveTo(x,10);g.lineTo(x,h-28);g.stroke();g.setLineDash([]);g.fillStyle=col;g.font='11px monospace';g.fillText(lab,x+3,22)}
function hist(vals,lo,hi,nb){const b=new Array(nb).fill(0);vals.forEach(v=>{const i=Math.floor((v-lo)/(hi-lo)*nb);if(i>=0&&i<nb)b[i]++});const s=vals.length*(hi-lo)/nb;return b.map(x=>x/s)}
function bars(g,b,lo,hi,w,h,y1,col){const nb=b.length;b.forEach((v,i)=>{const x=X(lo+(hi-lo)*i/nb,lo,hi,w),x2=X(lo+(hi-lo)*(i+1)/nb,lo,hi,w),y=Y(Math.min(v,y1),0,y1,h);g.fillStyle=col;g.globalAlpha=.55;g.fillRect(x,y,Math.max(1,x2-x-1),h-28-y);g.globalAlpha=1})}
const q99=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*s.length))]};

const W={};
/* ---------- T1: utilidad, equivalente cierto, prima de riesgo ---------- */
W.t1_util=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const k=+P.k,p=+P.p,x1=+P.x1,x2=100;
 const u=x=>k<.01?x/100:(1-Math.exp(-k*x/100))/(1-Math.exp(-k)),ui=y=>k<.01?y*100:-100/k*Math.log(1-y*(1-Math.exp(-k)));
 axes(g,w,h,0,100,0,1,c,'riqueza','utilidad');line(g,Array.from({length:101},(_,i)=>[X(i,0,100,w),Y(u(i),0,1,h)]),c.acc,2.5);
 const EX=p*x2+(1-p)*x1,EU=p*u(x2)+(1-p)*u(x1),CE=ui(EU);
 line(g,[[X(x1,0,100,w),Y(u(x1),0,1,h)],[X(x2,0,100,w),Y(u(x2),0,1,h)]],c.pres,1.5);
 g.fillStyle=c.pres;[[x1,u(x1)],[x2,u(x2)],[EX,EU]].forEach(a=>{g.beginPath();g.arc(X(a[0],0,100,w),Y(a[1],0,1,h),4,0,7);g.fill()});
 vl(g,X(EX,0,100,w),h,c.pres,'E[X]');vl(g,X(CE,0,100,w),h,c.bad,'equiv. cierto');
 el.querySelector('.out').innerHTML=`Lotería: ${x1} con prob. ${(1-p).toFixed(2)} y 100 con prob. ${p.toFixed(2)} → E[X] = ${EX.toFixed(1)}<br>Equivalente cierto = ${CE.toFixed(1)} · prima de riesgo = E[X] − CE = <b>${(EX-CE).toFixed(1)}</b>`};
/* ---------- T2: suma de pólizas: exacta frente a Normal ---------- */
W.t2_clt=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const n=Math.round(+P.n),q=+P.q;
 const lf=[0];for(let i=1;i<=n;i++)lf[i]=lf[i-1]+Math.log(i);const pm=[];for(let k=0;k<=n;k++)pm.push(Math.exp(lf[n]-lf[k]-lf[n-k]+k*Math.log(q)+(n-k)*Math.log(1-q)));
 const mu=n*q,sd=Math.sqrt(n*q*(1-q)),lo=0,hi=Math.min(n,Math.ceil(mu+5*sd+3)),ym=Math.max(...pm)*1.15;
 axes(g,w,h,lo,hi,0,ym,c,'siniestros','prob.');pm.forEach((v,k)=>{if(k>hi)return;const x=X(k-.4,lo,hi,w),x2=X(k+.4,lo,hi,w);g.fillStyle=c.acc;g.globalAlpha=.6;g.fillRect(x,Y(v,0,ym,h),Math.max(1,x2-x),h-28-Y(v,0,ym,h));g.globalAlpha=1});
 line(g,Array.from({length:200},(_,i)=>{const x=lo+(hi-lo)*i/199;return[X(x,lo,hi,w),Y(Math.exp(-.5*((x-mu)/sd)**2)/(sd*2.5066),0,ym,h)]}),c.pres,2);
 const z=2.5758,thr=mu+z*sd;let ex=0;pm.forEach((v,k)=>{if(k>thr)ex+=v});
 el.querySelector('.out').innerHTML=`Media ${mu.toFixed(2)} · desv. típica ${sd.toFixed(2)} · asimetría ${((1-2*q)/sd).toFixed(2)}<br>P(S &gt; media + 2,58·σ): exacta <b>${(ex*100).toFixed(2)} %</b> frente a 0,50 % que daría la Normal`};
/* ---------- T3: modelo colectivo (Monte Carlo) ---------- */
W.t3_col=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const lam=+P.lam,s=+P.s,N=12000,mu=-s*s/2,S=[];
 for(let i=0;i<N;i++){let L=Math.exp(-lam),pp=1,k=0;if(lam>30){k=Math.max(0,Math.round(lam+Math.sqrt(lam)*rn()))}else{do{k++;pp*=Math.random()}while(pp>L);k--}let t=0;for(let j=0;j<k;j++)t+=Math.exp(mu+s*rn());S.push(t)}
 const m=S.reduce((a,b)=>a+b,0)/N,sd=Math.sqrt(S.reduce((a,b)=>a+(b-m)**2,0)/N),v=q99(S,.995),hi=Math.max(v*1.1,m*1.5),b=hist(S,0,hi,50),y1=Math.max(...b)*1.1;
 axes(g,w,h,0,hi,0,y1,c,'pérdida anual','densidad');bars(g,b,0,hi,w,h,y1,c.acc);vl(g,X(m,0,hi,w),h,c.pres,'media');vl(g,X(v,0,hi,w),h,c.bad,'VaR 99,5 %');
 el.querySelector('.out').innerHTML=`Siniestros esperados por año ${lam} · severidad media 1 (log-normal, σ=${s})<br>Pérdida media ${m.toFixed(2)} · VaR 99,5 % = <b>${v.toFixed(2)}</b> (${(v/m).toFixed(2)}× la media) · coef. de variación ${(sd/m).toFixed(2)}`};
/* ---------- T4: VaR frente a TVaR ---------- */
W.t4_var=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const a=+P.a,s=+P.s,mu=0,hi=Math.exp(mu+s*3.4);
 const f=x=>x<=0?0:Math.exp(-((Math.log(x)-mu)**2)/(2*s*s))/(x*s*2.5066),z=qn(a),var_=Math.exp(mu+s*z),tv=Math.exp(mu+s*s/2)*Phi(s-z)/(1-a);
 let ym=0;const pts=Array.from({length:240},(_,i)=>{const x=hi*(i+.5)/240;const y=f(x);ym=Math.max(ym,y);return[x,y]});ym=Math.min(ym*1.1,3);
 axes(g,w,h,0,hi,0,ym,c,'pérdida','densidad');g.fillStyle=c.bad;g.globalAlpha=.3;g.beginPath();g.moveTo(X(var_,0,hi,w),h-28);pts.filter(p=>p[0]>=var_).forEach(p=>g.lineTo(X(p[0],0,hi,w),Y(Math.min(p[1],ym),0,ym,h)));g.lineTo(X(hi,0,hi,w),h-28);g.fill();g.globalAlpha=1;
 line(g,pts.map(p=>[X(p[0],0,hi,w),Y(Math.min(p[1],ym),0,ym,h)]),c.acc,2.5);vl(g,X(var_,0,hi,w),h,c.pres,'VaR');if(tv<hi)vl(g,X(tv,0,hi,w),h,c.bad,'TVaR');
 el.querySelector('.out').innerHTML=`Nivel de confianza ${(a*100).toFixed(1)} % · cola con prob. ${((1-a)*100).toFixed(2)} %<br>VaR = ${var_.toFixed(2)} · TVaR = <b>${tv.toFixed(2)}</b> · el VaR dice «a partir de aquí»; el TVaR «cuánto, de media, una vez pasado» (${(tv/var_).toFixed(2)}× el VaR)`};
/* ---------- T5: GPD, VaR y TVaR por extrapolación ---------- */
W.t5_gpd=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const xi=+P.xi,p=+P.p,u=10,sg=6,ratio=25,r=ratio*(1-p);
 const S=y=>Math.abs(xi)<1e-6?Math.exp(-y/sg):Math.pow(Math.max(0,1+xi*y/sg),-1/xi),hi=150;
 const vr=Math.abs(xi)<1e-6?u-sg*Math.log(r):u+sg/xi*(Math.pow(r,-xi)-1),tv=xi<1?(vr+sg-xi*u)/(1-xi):NaN;
 axes(g,w,h,0,hi,-6,0,c,'pérdida x (M€)','log10 P(X>x|X>u)');
 const pts=[];for(let i=0;i<=200;i++){const y=hi*i/200;const sv=S(y);if(sv>1e-6)pts.push([X(y+u,0,hi,w),Y(Math.log10(sv),-6,0,h)])}
 line(g,pts,c.acc,2.5);line(g,Array.from({length:101},(_,i)=>{const y=hi*i/100;return[X(y+u,0,hi,w),Y(Math.max(-6,Math.log10(Math.exp(-y/sg))),-6,0,h)]}),c.mut,1.2);
 if(vr<hi)vl(g,X(vr,0,hi,w),h,c.pres,'VaR');if(tv<hi)vl(g,X(tv,0,hi,w),h,c.bad,'TVaR');
 el.querySelector('.out').innerHTML=`u = 10, σ = 6 · la línea gris es la cola exponencial (ξ = 0)<br>ξ = ${xi.toFixed(2)} → ${xi>0.5?'¡varianza infinita!':xi>0?'cola pesada (Pareto)':xi<0?'cola acotada':'cola exponencial'}<br>VaR ${(p*100).toFixed(1)} % = <b>${vr.toFixed(1)}</b> · TVaR = <b>${isFinite(tv)?tv.toFixed(1):'∞'}</b>`};
/* ---------- T6: cópulas ---------- */
function debye(t){let s=0,n=400;for(let i=1;i<=n;i++){const x=t*(i-.5)/n;s+=x/Math.expm1(x)}return s/n}
function thFrank(tau){let lo=.01,hi=40;for(let i=0;i<50;i++){const m=(lo+hi)/2;const t=1-4*(1-debye(m))/m;if(t<tau)lo=m;else hi=m}return (lo+hi)/2}
function sample(fam,tau,n){const U=[],rho=Math.sin(Math.PI*tau/2);
 for(let i=0;i<n;i++){let a,b;
  if(fam==='gauss'||fam==='t4'){const z1=rn(),z2=rho*z1+Math.sqrt(1-rho*rho)*rn();if(fam==='t4'){const W=Math.sqrt(rch(4)/4);a=z1/W;b=z2/W;U.push([tcdf4(a),tcdf4(b)]);continue}a=Phi(z1);b=Phi(z2)}
  else if(fam==='clay'||fam==='clayr'){const th=2*tau/(1-tau),V=rg(1/th);a=Math.pow(1+re()/V,-1/th);b=Math.pow(1+re()/V,-1/th);if(fam==='clayr'){a=1-a;b=1-b}}
  else if(fam==='gum'){const th=1/(1-tau),al=1/th,T=Math.random()*Math.PI,Wx=re(),V=Math.sin(al*T)/Math.pow(Math.sin(T),1/al)*Math.pow(Math.sin((1-al)*T)/Wx,(1-al)/al);a=Math.exp(-Math.pow(re()/V,1/th));b=Math.exp(-Math.pow(re()/V,1/th))}
  else{const th=P_f(tau),u=Math.random(),w=Math.random();a=u;b=-Math.log1p(w*Math.expm1(-th)/(w+(1-w)*Math.exp(-th*u)))/th}
  U.push([a,b])}
 return U}
let _fc={};function P_f(t){const k=t.toFixed(3);return _fc[k]||(_fc[k]=thFrank(t))}
function tcdf4(x){const t=x/Math.sqrt(4+x*x);return .5+.75*t-.25*t*t*t}
W.t6_cop=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const fam=P.fam,tau=+P.tau,n=1200,z=2.5758;
 const U=sample(fam,tau,n);const sz=Math.min(h-40,w-60);
 g.strokeStyle=c.rule;g.strokeRect(40,10,sz,sz);g.fillStyle=c.ink;g.globalAlpha=.55;U.forEach(p=>{g.fillRect(40+p[0]*sz-1,10+(1-p[1])*sz-1,2,2)});g.globalAlpha=1;
 g.fillStyle=c.mut;g.font='11px monospace';g.fillText('riesgo 1 (percentil) →',40,h-8);g.fillText('riesgo 2 ↑',44+sz,24);
 const V=sample(fam,tau,15000),Ls=V.map(p=>qn(Math.min(.99999,Math.max(1e-5,p[0])))*40/z+qn(Math.min(.99999,Math.max(1e-5,p[1])))*30/z),v=q99(Ls,.995),std=Math.sqrt(1600+900+2*Math.sin(Math.PI*tau/2)*1200);
 const lam={gauss:0,t4:2*(1-tcdf5(Math.sqrt(5*(1-Math.sin(Math.PI*tau/2))/(1+Math.sin(Math.PI*tau/2))))),clay:Math.pow(2,-(1-tau)/(2*tau)),clayr:Math.pow(2,-(1-tau)/(2*tau)),gum:2-Math.pow(2,1-tau),frank:0}[fam];
 let tail=0,cnt=0;V.forEach(p=>{if(p[0]>.97){cnt++;if(p[1]>.97)tail++}});
 el.querySelector('.out').innerHTML=`τ de Kendall = ${tau.toFixed(2)} · dependencia de cola asintótica λ ≈ <b>${lam.toFixed(2)}</b> · P(riesgo 2 &gt; p97 | riesgo 1 &gt; p97) = ${(tail/Math.max(1,cnt)).toFixed(2)}<br>Capital de la suma (SCR 40 y 30, marginales normales): VaR 99,5 % = <b>${v.toFixed(1)}</b> M€ frente a ${std.toFixed(1)} de la fórmula estándar (${((v/std-1)*100).toFixed(1)} %)`};
function tcdf5(x){const t=x/Math.sqrt(5+x*x);const th=Math.atan(x/Math.sqrt(5));return .5+(th+Math.sin(th)*Math.cos(th)*(1+2/3*Math.cos(th)**2))/Math.PI}
W.t6_agg=(el,P,out)=>{const c=C(),{g,w,h}=setup(el.querySelector('canvas'));const rho=+P.rho,rec=+P.rec/100,M=40,U=30,s=Math.sqrt(M*M+U*U+2*rho*M*U),a=s*(1+rec);
 const bars=[['Suma simple',M+U,c.mut],['Fórmula estándar',s,c.acc],['Con recargo de cola',a,c.bad]],mx=100;axes(g,w,h,0,3,0,mx,c,'','M€');
 bars.forEach((b,i)=>{const x=60+i*((w-90)/3),bw=(w-90)/3-30,y=Y(b[1],0,mx,h);g.fillStyle=b[2];g.globalAlpha=.7;g.fillRect(x,y,bw,h-28-y);g.globalAlpha=1;g.fillStyle=c.ink;g.font='12px monospace';g.fillText(b[1].toFixed(2),x+4,y-4);g.fillStyle=c.mut;g.fillText(b[0],x,h-12)});
 el.querySelector('.out').innerHTML=`Diversificación de la fórmula: ${(M+U-s).toFixed(2)} M€ (${((M+U-s)/(M+U)*100).toFixed(1)} %) · capital adicional por cola: <b>${(a-s).toFixed(2)} M€</b> · beneficio de diversificación que queda: ${(M+U-a).toFixed(2)} M€`};

function init(el){const name=el.dataset.w,ctl=el.querySelectorAll('input,select');
 const run=()=>{const P={};ctl.forEach(i=>{P[i.name]=i.value;const sp=el.querySelector('.v[data-for="'+i.name+'"]');if(sp)sp.textContent=i.value});try{W[name](el,P)}catch(e){el.querySelector('.out').textContent='Error: '+e.message}};
 ctl.forEach(i=>i.addEventListener('input',run));const b=el.querySelector('button');if(b)b.addEventListener('click',run);
 setTimeout(run,400);new IntersectionObserver((e,o)=>{if(e[0].isIntersecting){run();o.disconnect()}}).observe(el);
 window.addEventListener('resize',()=>{if(el.offsetParent)run()})}
document.querySelectorAll('.viz').forEach(init);
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{}));
})();
"""

# ---------------------------------------------------------------- ejemplos dinámicos: (tema, tras el apartado nº, html)
VISUALS = {
"t1": [(3, viz("t1_util", "Prueba tú: ¿cuánto pagarías por evitar un riesgo?",
   "Una lotería da 100 con probabilidad p y x₁ en caso contrario. Cuanto más curva (más aversión), menos «vale» para ti, aunque la media sea la misma.",
   [sl("k", "aversión k", 0, 4, 1.5, .1), sl("p", "prob. de ganar 100", .05, .95, .5, .05), sl("x1", "premio malo x₁", 0, 80, 0, 5)],
   "Mueve k a 0 (neutral al riesgo): el equivalente cierto coincide con la media y la prima de riesgo es 0. Súbelo: la curva se dobla y la prima crece. Esa prima es lo que una aseguradora cobra por quedarse con el riesgo."))],
"t2": [(5, viz("t2_clt", "Suma de pólizas: la campana aparece con el número de contratos",
   "n pólizas idénticas, cada una con probabilidad q de siniestro (importe 1). Barras: distribución exacta. Línea: aproximación Normal.",
   [sl("n", "pólizas n", 1, 400, 20, 1), sl("q", "prob. siniestro q", .01, .5, .1, .01)],
   "Con pocas pólizas la Normal se equivoca justo en la cola derecha (la que fija el capital). Con muchas, la campana encaja: esa es la ley de los grandes números que sostiene al seguro."))],
"t3": [(6, viz("t3_col", "Una aseguradora en miniatura: frecuencia × severidad",
   "Cada año ocurren N ~ Poisson(λ) siniestros con importe log-normal de media 1. Se simulan 12.000 años y se ve la pérdida anual.",
   [sl("lam", "siniestros/año λ", 1, 60, 10, 1), sl("s", "dispersión de importes σ", .3, 2, 1, .1), '<button type="button">Resimular</button>'],
   "Más siniestros por año → la pérdida se vuelve estable y simétrica (el VaR se acerca a la media). Más dispersión de importes → cola derecha larga y capital muy superior a la media."))],
"t4": [(4, viz("t4_var", "VaR y TVaR en un dibujo",
   "Distribución de pérdidas log-normal. La zona roja es el peor (1−α) % de los casos.",
   [sl("a", "nivel de confianza α", .9, .999, .99, .001), sl("s", "peso de la cola σ", .3, 1.6, .8, .05)],
   "El VaR es la puerta de entrada a la cola; el TVaR es la media de lo que hay dentro. Con colas pesadas (σ alto) el TVaR se aleja mucho del VaR: dos entidades con el mismo VaR pueden tener riesgos muy distintos."))],
"t5": [(6, viz("t5_gpd", "La cola según ξ: de exponencial a Pareto",
   "Probabilidad de superar x (escala log) para excesos sobre u = 10 con GPD(ξ, σ=6), y VaR/TVaR por extrapolación.",
   [sl("xi", "forma ξ", -.3, .8, .35, .05), sl("p", "nivel p", .95, .999, .995, .001)],
   "ξ = 0 es la línea gris (cola exponencial). Con ξ > 0 la curva se queda arriba: los grandes siniestros son más probables y el TVaR se dispara. Con ξ ≥ 1 el TVaR no existe y con ξ ≥ 0,5 no hay varianza."))],
"t6": [(6, viz("t6_cop", "Mismo grado de dependencia, colas distintas",
   "1.200 pares simulados de cada familia con la misma τ de Kendall. Observa las esquinas: ahí vive el contagio.",
   [sl("tau", "τ de Kendall", .1, .8, .5, .05), '<label>cópula <select name="fam"><option value="gauss">Gaussiana</option><option value="t4">t (ν=4)</option><option value="clayr">Clayton rotada</option><option value="gum">Gumbel</option><option value="frank">Frank</option><option value="clay">Clayton (sin rotar)</option></select></label>', '<button type="button">Resimular</button>'],
   "Gaussiana y Frank rellenan las esquinas poco: no hay contagio. Gumbel y Clayton rotada pegan los puntos a la esquina superior derecha (pérdidas extremas a la vez) y elevan el capital; la Clayton sin rotar apunta a la esquina equivocada para pérdidas.")),
  (7, viz("t6_agg", "Cuánto capital cuesta ignorar el contagio",
   "Caso 1: SCR mercado 40 M€ y suscripción 30 M€. Cambia la correlación y el recargo por cola.",
   [sl("rho", "correlación ρ", 0, 1, .25, .05), sl("rec", "recargo por cola (%)", 0, 30, 13, 1)],
   "Incluso con ρ = 0 hay recargo: la dependencia de cola no es la correlación media. A mayor ρ, la fórmula ya «ve» parte de la dependencia y la diversificación que queda es menor."))],
}

# ---------------------------------------------------------------- «En cristiano»: (tema, apartado) -> texto
DUMMY = {
("t1", 1): "Cien euros no valen lo mismo para quien tiene 1.000 que para quien tiene 1 millón. Por eso una persona prudente no acepta «tirar una moneda» por su sueldo, aunque en media saliera a cuenta.",
("t1", 2): "Cada uno puntúa el dinero con una «escala de felicidad» (la utilidad). Entre dos apuestas, se elige la que da más felicidad esperada, no la que da más dinero esperado.",
("t1", 3): "Si la escala es curva (cada euro extra alegra menos), el dinero seguro que te vale lo mismo que la apuesta (equivalente cierto) es menor que la media de la apuesta. Esa diferencia es lo que pagarías por evitar el susto: la prima de riesgo.",
("t1", 4): "Arrow–Pratt mide cuánto se dobla la curva en el punto donde estás: más curva, más miedo al riesgo. Es el «termómetro» de la aversión.",
("t1", 5): "CARA: el miedo es el mismo seas rico o pobre (importa el tamaño de la apuesta). CRRA: el miedo depende de la proporción de tu riqueza que arriesgas. Son los dos modelos sencillos que se usan en la práctica.",
("t1", 6): "La gente real no es tan lógica: pierde más con una pérdida que lo que disfruta con una ganancia igual y se asusta con probabilidades pequeñas. El modelo es una guía, no una ley.",
("t1", 7): "Si yo soy más miedoso que la aseguradora, hay un precio que nos conviene a los dos: yo pago algo más que la pérdida media y ella gana por tener muchos clientes. El reaseguro es lo mismo, entre aseguradora y reaseguradora.",
("t1", 8): "Solvencia II pide a las aseguradoras comportarse con prudencia ante el riesgo y tener capital suficiente; la teoría de la utilidad explica por qué se contrata cobertura.",
("t2", 1): "El seguro funciona porque, aunque cada póliza sea impredecible, la suma de muchas es bastante previsible. Hay que saber cuánta pérdida total esperar y cuánto puede desviarse.",
("t2", 2): "Se trata cada póliza como una «lotería» independiente: puede dar 0 (no hay siniestro) o un importe. La pérdida total es la suma de todas esas loterías.",
("t2", 3): "Basta conocer la media y la varianza de cada póliza para obtener las de la suma: las medias se suman y, al ser independientes, las varianzas también. Las funciones generatrices son un atajo matemático para esa suma.",
("t2", 4): "Para saber la probabilidad exacta de cada pérdida total, se «combinan» las pólizas de una en una (convolución). Es exacto pero lento si hay millones de pólizas.",
("t2", 5): "Con muchas pólizas, la suma se parece a una campana (Normal). Pero la campana es simétrica y las pérdidas de seguros no lo son: con pocas pólizas subestima la cola grande.",
("t2", 6): "Para corregir la asimetría se usan aproximaciones que, además de media y varianza, reproducen la asimetría (el tercer momento): Gamma trasladada y Normal Power.",
("t2", 7): "Con solo tres pólizas se ve a simple vista cuándo la Normal falla: es un ejemplo pequeño y a mano para no fiarse a ciegas de la campana.",
("t2", 8): "Los casos de clase aplican lo anterior a carteras concretas: se calcula el capital con cada método y se compara con el cálculo exacto.",
("t2", 9): "El capital de suscripción de Solvencia II sale de la distribución de pérdidas de un año: estos modelos son la base de cómo se calcula.",
("t3", 1): "En vez de mirar póliza a póliza, se piensa en la cartera como un todo: cuántos siniestros habrá este año (frecuencia) y de qué tamaño será cada uno (severidad).",
("t3", 2): "Pérdida total = suma de N siniestros. Su media es «número medio de siniestros × tamaño medio», y su variabilidad viene de las dos fuentes: cuántos y de qué tamaño.",
("t3", 3): "Poisson: los siniestros llegan «al azar» con un ritmo medio. Binomial Negativa: igual, pero el ritmo mismo cambia de un año a otro (más variable). Esto último es lo realista.",
("t3", 4): "La severidad dice cuánto cuesta cada siniestro: Gamma y Log-normal para tamaños normales, Pareto para los catastróficos (con colas muy largas).",
("t3", 5): "Calcular la distribución exacta de la pérdida anual es difícil: la recursión de Panjer lo hace paso a paso y la FFT usa un truco rápido de transformadas. Son «calculadoras» de la distribución.",
("t3", 6): "Cuando no hay tiempo de calcular exacto se aproxima; pero lo que importa es la cola (el año malo), y ahí es donde las aproximaciones fallan más.",
("t3", 7): "Los casos de clase muestran el cálculo completo con números concretos y comparan la solución exacta con las aproximaciones.",
("t3", 8): "Solvencia II exige un capital que cubra el 99,5 % de los años: este modelo es el que produce esa cifra para el riesgo de suscripción.",
("t4", 1): "Una cifra de riesgo debe ser «razonable»: que más riesgo no dé menos capital y que juntar carteras no lo aumente. Los axiomas son esas reglas de sentido común escritas con rigor.",
("t4", 2): "Cuatro reglas: más pérdida ⇒ más riesgo; sumar dinero seguro baja el riesgo en ese dinero; escalar la cartera escala el riesgo; y juntar no aumenta (diversificar ayuda).",
("t4", 3): "El VaR responde: «¿cuál es la pérdida que solo se superará 1 de cada 200 años?». Es fácil de entender, pero no dice nada de lo que pasa más allá de ese punto.",
("t4", 4): "El TVaR (o Expected Shortfall) responde: «si ese mal año llega, ¿cuánto pierdo de media?». Mira dentro de la cola y cumple todas las reglas.",
("t4", 5): "A veces el VaR dice que juntar dos carteras es peor que tenerlas separadas, algo absurdo. El TVaR no cae en eso. Cuando dos riesgos suben y bajan juntos (comonótonos) no hay diversificación posible.",
("t4", 6): "Si el capital total es una tarta, ¿qué parte corresponde a cada línea de negocio? Euler la reparte según cuánto empuja cada línea a la pérdida total en el peor escenario.",
("t4", 7): "Solvencia II usa el VaR al 99,5 % a un año; la banca (Basilea) ha pasado al TVaR al 97,5 %. Son decisiones distintas del mismo problema.",
("t4", 8): "Los casos de clase calculan VaR, TVaR y reparto de capital con números reales para ver las diferencias.",
("t5", 1): "Los terremotos y grandes inundaciones son tan raros que hay pocos datos justo donde importa. La teoría de valores extremos se centra en esos pocos datos de la cola en vez de en toda la distribución.",
("t5", 2): "Igual que la campana aparece al sumar, para los máximos solo hay tres «formas» posibles de cola (Gumbel, Fréchet, Weibull). En seguros casi siempre es Fréchet: la cola pesada.",
("t5", 3): "Hay dos maneras de mirar los extremos: quedarse con el mayor de cada año (bloques) o con todo lo que supera un umbral alto (POT). Lo segundo aprovecha más datos.",
("t5", 4): "Todo lo que supera un umbral alto se comporta como una «Pareto generalizada» (GPD) con dos parámetros: escala y forma ξ. ξ manda: cuanto mayor, más pesada la cola.",
("t5", 5): "El umbral es un equilibrio: muy bajo mete datos «normales» que ensucian el ajuste; muy alto deja pocos datos. Se elige mirando gráficos de estabilidad.",
("t5", 6): "Con la GPD ajustada se calcula el VaR y el TVaR de un siniestro extremo, y el «nivel de retorno»: la pérdida que se espera superar una vez cada 100 o 200 años.",
("t5", 7): "Ojo: el VaR de un siniestro no es el capital del año. Para el capital hay que combinar cuántos siniestros caen en un año con su tamaño.",
("t5", 8): "Las capas de reaseguro (p. ej. «40 sobre 20») cubren tramos de la cola; la GPD permite ponerles precio. Si el clima cambia, la frecuencia sube y todo hay que recalcular.",
("t5", 9): "De la clase: el cuantil es por siniestro, no por año; hay que homogeneizar datos (coches y motos); y las franquicias y límites cambian cómo se estima.",
("t5", 10): "Antes de ajustar: actualizar importes por inflación, tratar franquicias y límites de póliza; y recordar que el SCR es un cuantil anual.",
("t5", 11): "Los casos de clase calculan VaR y TVaR de un terremoto y una inundación con la GPD y comparan la magnitud con la forma de la cola.",
("t6", 1): "Dos riesgos pueden ir bien por separado y mal a la vez: una crisis hunde la bolsa y, a la vez, sube la siniestralidad. Lo que importa es que se junten en lo peor.",
("t6", 2): "La correlación es una nota media de «cuánto se parecen». Puede dar cero con dos cosas totalmente ligadas, y nada dice del peor escenario, que es donde se fija el capital.",
("t6", 3): "Sklar dice: toda relación entre dos riesgos se puede separar en «cómo es cada uno» y «cómo se pegan entre sí». Esa parte de «cómo se pegan» es la cópula.",
("t6", 4): "Clayton pega los riesgos cuando caen juntos, Gumbel cuando suben juntos y Frank los pega por el centro sin contagio extremo. Son «pegamentos» con distinto comportamiento en las esquinas.",
("t6", 5): "La Gaussiana pega «de forma tranquila» y no ve el contagio extremo; la t sí. Cuanto menor sea su parámetro ν, más se pegan en las esquinas.",
("t6", 6): "La dependencia de cola es la probabilidad de que el segundo riesgo también esté en su peor nivel, sabiendo que el primero ya lo está. Si es 0, los extremos no se contagian.",
("t6", 7): "La fórmula estándar de Solvencia II agrega con una matriz de correlaciones: equivale a suponer una Gaussiana. Si hay contagio real, el capital requerido se queda corto.",
("t6", 8): "En el Caso 1 el capital sube de 55,68 a 62,92 M€ si hay contagio: 7,24 M€ que la fórmula no pide. El Caso 2 estima el contagio entre bolsa y catástrofes (63 %).",
("t6", 9): "Para probar ideas se generan pares de números que se «comportan» como la cópula elegida: es el laboratorio de simulación para cuantificar el efecto en el capital.",
("t6", 10): "Ajustar es hacer lo contrario: ante datos reales, preguntarse qué cópula los pudo generar y compararlas con una nota (AIC) que premia el buen ajuste y castiga la complicación.",
("t6", 11): "Con más de dos riesgos hay que escoger una estructura manejable: una matriz de correlaciones, un solo parámetro o «árboles» de pares (vines). Más flexible = más parámetros que estimar.",
}
