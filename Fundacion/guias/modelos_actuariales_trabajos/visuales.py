# Visuales genéricos: un gráfico/ejemplo dinámico por apartado. Cada uno es (tema, apartado, título, subtítulo, controles, código JS, lectura).
def sl(n, l, mn, mx, v, st):
    return f'<label>{l} <input type="range" name="{n}" min="{mn}" max="{mx}" value="{v}" step="{st}"><span class="v" data-for="{n}"></span></label>'

def sel(n, l, opts):
    return f'<label>{l} <select name="{n}">' + "".join(f'<option value="{v}">{t}</option>' for v, t in opts) + '</select></label>'

BTN = '<button type="button">Resimular</button>'

V = []
def add(tid, idx, title, sub, controls, code, read):
    V.append((tid, idx, title, sub, controls, code, read))

# ============================== TEMA 1 ==============================
add("t1", 1, "El mismo regalo, distinta alegría", "Cien euros añaden mucha utilidad a quien tiene poco y casi nada a quien tiene mucho: la utilidad es curva (aquí, ln x).",
    [sl("w", "tu riqueza w (€)", 20, 900, 100, 10)],
    r"""const u=x=>Math.log(x),w=P.w;
return {x:[10,1000],curves:[{pts:curve(u,10,1000),c:'acc'}],vl:[{x:w,label:'w',c:'mut'},{x:w+100,label:'w+100',c:'pres'}],xl:'riqueza',yl:'utilidad ln(x)',
out:`Con riqueza ${w}: +100 € añaden <b>${(u(w+100)-u(w)).toFixed(3)}</b> de utilidad · con riqueza ${w*5}: solo ${(u(w*5+100)-u(w*5)).toFixed(3)}`}""",
    "Mueve la riqueza: a mayor riqueza, el mismo regalo vale menos. De aquí sale la aversión al riesgo.")
add("t1", 2, "¿Apuesta o seguro? Decide la utilidad esperada", "Comparas 50 € seguros con una apuesta de 0 o 100 €. Se elige la de mayor utilidad esperada u(x)=x^γ (γ<1 = aversión).",
    [sl("gam", "curvatura γ", .2, 1, .5, .05), sl("p", "prob. de ganar 100", .1, .9, .5, .05)],
    r"""const u=x=>Math.pow(x,P.gam),a=u(50),b=P.p*u(100);
return {cat:['Seguro 50 €','Apuesta 0 / 100 €'],bars:[{h:a,c:'acc'},{h:b,c:'pres'}],yl:'utilidad esperada',
out:`Dinero esperado: 50 frente a ${(100*P.p).toFixed(0)} · utilidad esperada: ${a.toFixed(2)} frente a ${b.toFixed(2)} → eliges <b>${a>b?'lo seguro':'la apuesta'}</b>`}""",
    "Con γ = 1 (neutral) solo importa la media. Baja γ: eliges lo seguro aunque la apuesta tenga mayor media.")
add("t1", 4, "El termómetro de la aversión: A(x) = −u''/u'", "CARA: la aversión es constante. CRRA: la aversión baja con la riqueza (γ/x).",
    [sl("a", "CARA a", .005, .1, .03, .005), sl("g", "CRRA γ", .5, 4, 2, .5)],
    r"""return {x:[1,100],curves:[{pts:curve(x=>P.a,1,100),c:'acc'},{pts:curve(x=>P.g/x,1,100),c:'bad'}],legend:[['CARA: A(x)=a','acc'],['CRRA: A(x)=γ/x','bad']],xl:'riqueza x',yl:'aversión absoluta',y:[0,.2],
out:`A riqueza 10: CARA ${P.a.toFixed(3)} · CRRA ${(P.g/10).toFixed(3)} — a riqueza 100: CARA ${P.a.toFixed(3)} · CRRA ${(P.g/100).toFixed(3)}`}""",
    "Con CRRA el rico es menos miedoso en euros; con CARA lo es igual. Elegir el modelo cambia la prima de riesgo.")
add("t1", 5, "La prima de riesgo según seas rico o pobre", "Misma lotería (±10 € a cara o cruz). Prima de riesgo = media − equivalente cierto.",
    [sl("a", "CARA a", .01, .2, .05, .01), sl("g", "CRRA γ", .5, 4, 2, .5)],
    r"""const a=P.a,g=P.g;const pc=w=>{const ce=-Math.log(.5*(Math.exp(-a*(w+10))+Math.exp(-a*(w-10))))/a;return w-ce};
const pr=w=>{const ce=Math.abs(g-1)<1e-6?Math.exp(.5*(Math.log(w+10)+Math.log(w-10))):Math.pow(.5*(Math.pow(w+10,1-g)+Math.pow(w-10,1-g)),1/(1-g));return w-ce};
return {x:[15,200],curves:[{pts:curve(pc,15,200),c:'acc'},{pts:curve(pr,15,200),c:'bad'}],legend:[['CARA: prima casi constante','acc'],['CRRA: baja al hacerse rico','bad']],xl:'riqueza',yl:'prima de riesgo',
out:`Prima a riqueza 20: CARA ${pc(20).toFixed(2)} · CRRA ${pr(20).toFixed(2)} — a riqueza 150: CARA ${pc(150).toFixed(2)} · CRRA ${pr(150).toFixed(2)}`}""",
    "El pobre paga mucho por evitar el mismo riesgo; el rico, casi nada (CRRA). Por eso las aseguradoras pequeñas reaseguran más.")
add("t1", 6, "Cuando la gente real no es racional: teoría prospectiva", "Valor v(x): las pérdidas duelen λ veces más que las ganancias equivalentes alegran.",
    [sl("lam", "aversión a pérdidas λ", 1, 4, 2.25, .05), sl("al", "curvatura α", .3, 1, .88, .02)],
    r"""const v=x=>x>=0?Math.pow(x,P.al):-P.lam*Math.pow(-x,P.al);
return {x:[-100,100],curves:[{pts:curve(v,-100,100),c:'pres'}],hl:[{y:0,label:'',c:'mut'}],xl:'ganancia / pérdida',yl:'valor percibido',
out:`+50 € se perciben como <b>${v(50).toFixed(1)}</b> y −50 € como <b>${v(-50).toFixed(1)}</b>`}""",
    "La curva es más empinada a la izquierda: perder 50 duele más que lo que alegra ganar 50. La utilidad esperada clásica no recoge esto.")
add("t1", 7, "Dos formas de reasegurar: lo que se queda la cedente", "Stop-loss: retiene hasta d. Cuota parte: retiene (1−k) de cada siniestro.",
    [sl("d", "retención stop-loss d", 10, 100, 40, 5), sl("k", "cesión cuota parte k", 0, .9, .4, .05)],
    r"""return {x:[0,150],y:[0,150],curves:[{pts:curve(x=>Math.min(x,P.d),0,150),c:'acc'},{pts:curve(x=>(1-P.k)*x,0,150),c:'bad'},{pts:curve(x=>x,0,150),c:'mut',dash:[4,4],lw:1}],
legend:[['Stop-loss','acc'],['Cuota parte','bad'],['Sin reaseguro','mut']],xl:'siniestro total',yl:'pérdida retenida',
out:`Con un siniestro de 150: retienes <b>${Math.min(150,P.d)}</b> con stop-loss y <b>${((1-P.k)*150).toFixed(0)}</b> con cuota parte`}""",
    "El stop-loss corta la cola (protege del año malo); la cuota parte recorta todo por igual, también lo pequeño.")
add("t1", 8, "¿Cuánto colchón sobra o falta? Ratio de solvencia", "Ratio = fondos propios / SCR. Se exige ≥ 100 %. Aplica un shock para ver si aguanta.",
    [sl("fp", "fondos propios", 50, 300, 150, 5), sl("scr", "SCR", 50, 200, 100, 5), sl("sh", "shock a fondos propios (%)", 0, 60, 20, 5)],
    r"""const f2=P.fp*(1-P.sh/100);return {cat:['Fondos propios','Fondos tras shock','SCR'],bars:[{h:P.fp,c:'acc'},{h:f2,c:f2>=P.scr?'ok':'bad'},{h:P.scr,c:'pres'}],yl:'M€',
out:`Ratio inicial <b>${(P.fp/P.scr*100).toFixed(0)} %</b> · tras el shock <b>${(f2/P.scr*100).toFixed(0)} %</b> ${f2>=P.scr?'(cumple)':'(¡por debajo del 100 %!)'}`}""",
    "Solvencia II pide fondos propios ≥ SCR. El SCR es el capital que cubre el 99,5 % de los años.")

# ============================== TEMA 2 ==============================
add("t2", 1, "Por qué el seguro funciona: la ley de los grandes números", "Coeficiente de variación de la pérdida total (desviación / media) frente al número de pólizas.",
    [sl("q", "prob. siniestro q", .01, .5, .1, .01)],
    r"""const cv=n=>Math.sqrt((1-P.q)/(n*P.q));return {x:[1,1000],curves:[{pts:curve(cv,1,1000,300),c:'acc'}],xl:'nº de pólizas',yl:'incertidumbre relativa',
out:`Con 10 pólizas la incertidumbre relativa es ${cv(10).toFixed(2)} · con 100: ${cv(100).toFixed(2)} · con 1.000: <b>${cv(1000).toFixed(2)}</b>`}""",
    "La incertidumbre relativa baja como 1/√n: 100 veces más pólizas, 10 veces menos incertidumbre.")
add("t2", 2, "La media crece como n, la dispersión como √n", "Pérdida total de n pólizas idénticas: media nq y desviación √(nq(1−q)).",
    [sl("q", "prob. siniestro q", .01, .5, .1, .01)],
    r"""return {x:[1,400],curves:[{pts:curve(n=>n*P.q,1,400),c:'acc'},{pts:curve(n=>Math.sqrt(n*P.q*(1-P.q)),1,400),c:'bad'}],legend:[['media nq','acc'],['desviación √(nq(1−q))','bad']],xl:'nº de pólizas',yl:'siniestros',
out:`Con 400 pólizas: media ${(400*P.q).toFixed(1)} y desviación ${Math.sqrt(400*P.q*(1-P.q)).toFixed(1)}`}""",
    "La desviación queda diminuta frente a la media: eso es la diversificación del seguro.")
add("t2", 3, "Cada póliza aporta su varianza; la suma es la suma", "Tres pólizas de 1, 2 y 3 € con distinta probabilidad de siniestro. Varianza de cada una = q(1−q)b².",
    [sl("q1", "q póliza 1", .01, .9, .1, .01), sl("q2", "q póliza 2", .01, .9, .2, .01), sl("q3", "q póliza 3", .01, .9, .05, .01)],
    r"""const v=[P.q1*(1-P.q1),P.q2*(1-P.q2)*4,P.q3*(1-P.q3)*9],t=v[0]+v[1]+v[2],m=P.q1+2*P.q2+3*P.q3;
return {cat:['Póliza 1 (1 €)','Póliza 2 (2 €)','Póliza 3 (3 €)','Total'],bars:[{h:v[0],c:'acc'},{h:v[1],c:'acc'},{h:v[2],c:'acc'},{h:t,c:'pres'}],yl:'varianza',
out:`Media total ${m.toFixed(2)} · varianza total ${t.toFixed(3)} · desviación ${Math.sqrt(t).toFixed(3)} (las varianzas se suman por ser independientes)`}""",
    "La póliza grande pesa mucho más en la varianza (crece con b²): una concentración de riesgo se nota.")
add("t2", 4, "Cálculo exacto: combinar las pólizas una a una (convolución)", "n₁ pólizas de 1 € y n₂ de 3 €, cada una con prob. q de siniestro. Se construye la distribución exacta de la pérdida total.",
    [sl("n1", "pólizas de 1 €", 1, 40, 10, 1), sl("n2", "pólizas de 3 €", 0, 20, 5, 1), sl("q", "prob. q", .02, .4, .1, .01)],
    r"""let d=[1];const conv=(d,b,q)=>{const r=new Array(d.length+b).fill(0);d.forEach((v,i)=>{r[i]+=v*(1-q);r[i+b]+=v*q});return r};
for(let i=0;i<P.n1;i++)d=conv(d,1,P.q);for(let i=0;i<P.n2;i++)d=conv(d,3,P.q);
const mu=d.reduce((s,v,i)=>s+v*i,0),hi=Math.min(d.length-1,Math.ceil(mu*2.5+6));
return {x:[0,hi],bars:d.slice(0,hi+1).map((v,i)=>({x:i,h:v,w:.8,c:'acc'})),vl:[{x:mu,label:'media',c:'pres'}],xl:'pérdida total',yl:'probabilidad',
out:`Distribución exacta de ${P.n1+P.n2} pólizas: media ${mu.toFixed(2)} · P(pérdida 0) = ${(d[0]*100).toFixed(2)} %`}""",
    "Es exacto pero crece rápido con el nº de pólizas; con millones se aproxima (Normal, Normal Power...).")
add("t2", 6, "Dónde falla la Normal y cómo la corrige Normal Power", "Probabilidad de superar x (escala log10) con distribución exacta, Normal y Normal Power.",
    [sl("n", "pólizas n", 5, 200, 30, 1), sl("q", "prob. q", .02, .5, .1, .01)],
    r"""const n=P.n,q=P.q,mu=n*q,sd=Math.sqrt(n*q*(1-q)),g=(1-2*q)/sd;const lf=[0];for(let i=1;i<=n;i++)lf[i]=lf[i-1]+Math.log(i);
const pm=k=>Math.exp(lf[n]-lf[k]-lf[n-k]+k*Math.log(q)+(n-k)*Math.log(1-q));const cum=[];let s=0;for(let k=0;k<=n;k++){s+=pm(k);cum[k]=s}
const hi=Math.min(n,Math.ceil(mu+5*sd)),lo=Math.floor(mu),L=v=>Math.log10(Math.max(v,1e-7));
const ex=[],no=[],np=[];for(let k=lo;k<=hi;k++){ex.push([k,L(1-cum[k])]);no.push([k,L(1-Phi((k-mu)/sd))]);np.push([k,L(1-Phi(-3/g+Math.sqrt(9/(g*g)+1+6*(k-mu)/(g*sd))))])}
return {x:[lo,hi],y:[-6,0],curves:[{pts:ex,c:'ink'},{pts:no,c:'bad'},{pts:np,c:'pres'}],legend:[['exacta','ink'],['Normal','bad'],['Normal Power','pres']],xl:'x',yl:'log10 P(S>x)',
out:`Asimetría ${g.toFixed(2)} · la Normal subestima la cola derecha; Normal Power la sigue mucho mejor`}""",
    "La Normal va por debajo de la exacta justo en la cola, que es donde se calcula el capital.")
add("t2", 7, "Tres pólizas: la campana no encaja", "Pólizas de 1, 2 y 3 € con prob. q₁, q₂, q₃. Barras: distribución exacta. Línea: Normal con la misma media y desviación.",
    [sl("q1", "q₁", .05, .9, .3, .05), sl("q2", "q₂", .05, .9, .2, .05), sl("q3", "q₃", .05, .9, .1, .05)],
    r"""let d=[1];[[1,P.q1],[2,P.q2],[3,P.q3]].forEach(([b,q])=>{const r=new Array(d.length+b).fill(0);d.forEach((v,i)=>{r[i]+=v*(1-q);r[i+b]+=v*q});d=r});
const mu=d.reduce((s,v,i)=>s+v*i,0),sd=Math.sqrt(d.reduce((s,v,i)=>s+v*(i-mu)**2,0));
return {x:[-1,7],bars:d.map((v,i)=>({x:i,h:v,w:.7,c:'acc'})),curves:[{pts:curve(x=>Math.exp(-.5*((x-mu)/sd)**2)/(sd*2.5066),-1,7),c:'pres'}],xl:'pérdida total',yl:'probabilidad',
out:`Media ${mu.toFixed(2)} · desviación ${sd.toFixed(2)} · la Normal da probabilidad a pérdidas negativas (imposibles)`}""",
    "Con pocas pólizas la campana asigna probabilidad a cosas imposibles: ejemplo de por qué no fiarse a ciegas de la Normal.")
add("t2", 8, "Tres métodos, tres capitales", "VaR 99,5 % de la pérdida total: exacto, Normal y Cornish-Fisher (con asimetría).",
    [sl("n", "pólizas n", 5, 300, 40, 1), sl("q", "prob. q", .02, .5, .1, .01)],
    r"""const n=P.n,q=P.q,mu=n*q,sd=Math.sqrt(n*q*(1-q)),g=(1-2*q)/sd,z=qn(.995);const lf=[0];for(let i=1;i<=n;i++)lf[i]=lf[i-1]+Math.log(i);
let s=0,ex=n;for(let k=0;k<=n;k++){s+=Math.exp(lf[n]-lf[k]-lf[n-k]+k*Math.log(q)+(n-k)*Math.log(1-q));if(s>=.995){ex=k;break}}
const no=mu+sd*z,cf=mu+sd*(z+g/6*(z*z-1));
return {cat:['Exacto','Normal','Normal Power (Cornish-Fisher)'],bars:[{h:ex,c:'ink'},{h:no,c:'bad'},{h:cf,c:'pres'}],yl:'VaR 99,5 %',
out:`Exacto ${ex} · Normal ${no.toFixed(1)} (${((no/ex-1)*100).toFixed(1)} %) · Normal Power ${cf.toFixed(1)} (${((cf/ex-1)*100).toFixed(1)} %)`}""",
    "La Normal subestima el capital cuando hay asimetría; la corrección con el tercer momento lo acerca.")
add("t2", 9, "El capital relativo baja con el tamaño de la cartera", "Capital (VaR 99,5 % Normal) como múltiplo de la pérdida esperada.",
    [sl("q", "prob. q", .01, .5, .1, .01)],
    r"""const f=n=>1+2.576*Math.sqrt((1-P.q)/(n*P.q));return {x:[10,2000],curves:[{pts:curve(f,10,2000,300),c:'acc'}],hl:[{y:1,label:'pérdida esperada',c:'mut'}],xl:'nº de pólizas',yl:'capital / pérdida esperada',
out:`Con 50 pólizas: ${f(50).toFixed(2)}× la pérdida esperada · con 2.000: ${f(2000).toFixed(2)}×`}""",
    "A Solvencia II le importa el tamaño: una cartera grande necesita mucho menos capital por euro de siniestralidad.")

# ============================== TEMA 3 ==============================
add("t3", 1, "Un año de la cartera, siniestro a siniestro", "Cada barra es un siniestro: cuándo ocurre y cuánto cuesta. Pulsa para ver otro año.",
    [sl("lam", "siniestros/año λ", 1, 30, 8, 1), sl("s", "dispersión de importes σ", .3, 1.8, 1, .1), BTN],
    r"""const N=pois(P.lam),mu=-P.s*P.s/2;let t=0;const bars=[];for(let i=0;i<N;i++){const z=Math.exp(mu+P.s*rn());t+=z;bars.push({x:Math.random(),h:z,w:.008,c:z>3?'bad':'acc'})}
return {x:[0,1],bars,xl:'tiempo en el año',yl:'importe del siniestro',out:`Este año: <b>${N}</b> siniestros, pérdida total <b>${t.toFixed(2)}</b> (esperada ${P.lam}). Rojo = siniestro grande.`}""",
    "Frecuencia (cuántos) y severidad (cuánto) son dos fuentes de azar; la pérdida del año es su combinación.")
add("t3", 2, "¿De dónde viene la incertidumbre? Frecuencia y severidad", "Incertidumbre relativa de la pérdida anual: √((1+cv²)/λ), con cv = variabilidad de los importes.",
    [sl("cv", "variabilidad de importes cv", 0, 3, 1, .1)],
    r"""return {x:[1,100],curves:[{pts:curve(l=>Math.sqrt((1+P.cv*P.cv)/l),1,100),c:'acc'},{pts:curve(l=>Math.sqrt(1/l),1,100),c:'mut',dash:[4,4]}],legend:[['con importes variables','acc'],['importes constantes','mut']],xl:'siniestros esperados λ',yl:'incertidumbre relativa',
out:`Con λ = 10: ${Math.sqrt((1+P.cv*P.cv)/10).toFixed(2)} (con importes constantes: ${Math.sqrt(.1).toFixed(2)})`}""",
    "Importes muy variables añaden incertidumbre que más siniestros no eliminan tan rápido.")
add("t3", 3, "Poisson o Binomial Negativa: ¿el ritmo es fijo o cambia?", "Misma media λ. En la Binomial Negativa la varianza es φ·λ (sobredispersión).",
    [sl("lam", "media λ", 1, 30, 8, 1), sl("phi", "sobredispersión φ", 1.1, 5, 2, .1)],
    r"""const l=P.lam,phi=P.phi,pp=1/phi,r=l/(phi-1),hi=Math.ceil(l+4*Math.sqrt(l*phi)+4);const bars=[];
for(let k=0;k<=hi;k++){const po=Math.exp(-l+k*Math.log(l)-lg(k+1)),nb=Math.exp(lg(k+r)-lg(r)-lg(k+1)+r*Math.log(pp)+k*Math.log(1-pp));bars.push({x:k-.2,h:po,w:.38,c:'acc'},{x:k+.2,h:nb,w:.38,c:'bad'})}
return {x:[0,hi],bars,legend:[['Poisson','acc'],['Binomial Negativa','bad']],xl:'nº de siniestros',yl:'prob.',out:`Varianza: Poisson ${l} · Binomial Negativa ${(l*phi).toFixed(1)} → la BN tiene más probabilidad de años con muchos siniestros`}""",
    "Si el ritmo de siniestros cambia de un año a otro (inflación, clima), la Binomial Negativa es más realista.")
add("t3", 4, "Qué importes pueden tener los siniestros", "Probabilidad de superar x (log10) con media 1: Exponencial, Log-normal y Pareto.",
    [sl("s", "Log-normal σ", .3, 2, 1, .1), sl("al", "Pareto α", 1.2, 5, 2.5, .1)],
    r"""const mu=-P.s*P.s/2,xm=(P.al-1)/P.al,L=v=>Math.log10(Math.max(v,1e-7));
return {x:[.05,30],y:[-6,0],curves:[{pts:curve(x=>L(Math.exp(-x)),.05,30),c:'mut'},{pts:curve(x=>L(1-Phi((Math.log(x)-mu)/P.s)),.05,30),c:'acc'},{pts:curve(x=>x<xm?0:L(Math.pow(xm/x,P.al)),.05,30),c:'bad'}],legend:[['Exponencial','mut'],['Log-normal','acc'],['Pareto','bad']],xl:'importe x (media = 1)',yl:'log10 P(X>x)',
out:`P(siniestro > 10 veces la media): exponencial ${Math.exp(-10).toExponential(1)} · log-normal ${(1-Phi((Math.log(10)-mu)/P.s)).toExponential(1)} · Pareto ${Math.pow(xm/10,P.al).toExponential(1)}`}""",
    "La Pareto se queda arriba: los siniestros enormes son bastante más probables. Esa cola manda en el capital.")
add("t3", 5, "La recursión de Panjer, paso a paso", "Importes enteros geométricos (r) y frecuencia Poisson(λ). Panjer calcula la distribución exacta de la pérdida anual.",
    [sl("lam", "λ", 1, 30, 6, 1), sl("r", "peso de importes grandes r", .3, .9, .7, .05)],
    r"""const mean=P.lam/(1-P.r),S=Math.ceil(mean*3+20),g=panjer(P.lam,P.r,S),hi=Math.ceil(mean*2.5+10);
const bars=[];for(let s=0;s<=Math.min(hi,S);s++)bars.push({x:s,h:g[s],w:.8,c:'acc'});
return {x:[0,hi],bars,vl:[{x:mean,label:'media',c:'pres'}],xl:'pérdida anual',yl:'probabilidad',out:`Media ${mean.toFixed(1)} · P(sin pérdida) = ${(g[0]*100).toFixed(2)} % · suma de probabilidades ${Array.from(g).reduce((a,b)=>a+b,0).toFixed(4)}`}""",
    "Es una recurrencia: cada probabilidad se calcula con las anteriores. Exacta y rápida.")
add("t3", 6, "La cola exacta frente a la Normal", "Con Panjer se calcula P(pérdida > x) exacta y se compara con la Normal.",
    [sl("lam", "λ", 1, 30, 6, 1), sl("r", "peso de importes grandes r", .3, .9, .7, .05)],
    r"""const mean=P.lam/(1-P.r),S=Math.ceil(mean*4+30),g=panjer(P.lam,P.r,S);let m2=0;for(let s=0;s<=S;s++)m2+=g[s]*s*s;const sd=Math.sqrt(m2-mean*mean);const L=v=>Math.log10(Math.max(v,1e-7));
let c=0;const ex=[],no=[];for(let s=0;s<=S;s++){c+=g[s];if(s>=mean)ex.push([s,L(1-c)]);if(s>=mean)no.push([s,L(1-Phi((s-mean)/sd))])}
return {x:[mean,mean+5*sd],y:[-6,0],curves:[{pts:ex,c:'ink'},{pts:no,c:'bad'}],legend:[['exacta (Panjer)','ink'],['Normal','bad']],xl:'x',yl:'log10 P(S>x)',out:`La Normal subestima las pérdidas extremas con colas pesadas`}""",
    "La Normal falla en la cola derecha: justo donde se calcula el capital.")
add("t3", 7, "Cuánto capital por euro de pérdida media", "VaR 99,5 % / pérdida media según el tamaño de la cartera λ (Panjer exacto).",
    [sl("r", "peso de importes grandes r", .3, .85, .7, .05)],
    r"""const pts=[];for(let l=1;l<=40;l+=1){const mean=l/(1-P.r),S=Math.ceil(mean*3+40),g=panjer(l,P.r,S);let c=0,v=S;for(let s=0;s<=S;s++){c+=g[s];if(c>=.995){v=s;break}}pts.push([l,v/mean])}
return {x:[1,40],curves:[{pts,c:'acc'}],hl:[{y:1,label:'media',c:'mut'}],xl:'siniestros esperados λ',yl:'VaR / media',out:`Para λ=5: ${pts[4][1].toFixed(2)}× · λ=40: ${pts[39][1].toFixed(2)}×`}""",
    "Cuanto mayor la cartera, menos capital relativo: la diversificación en acción.")
add("t3", 8, "El múltiplo de desviación que cubre un nivel de confianza", "z = Φ⁻¹(p): cuántas desviaciones típicas por encima de la media cubren el p % de los casos.",
    [sl("p", "nivel p", .9, .999, .995, .001)],
    r"""return {x:[.9,.9995],curves:[{pts:curve(p=>qn(p),.9,.9995,150),c:'acc'}],vl:[{x:P.p,label:'p',c:'pres'}],xl:'nivel de confianza p',yl:'z',out:`Al ${(P.p*100).toFixed(1)} %: z = <b>${qn(P.p).toFixed(2)}</b> desviaciones (al 99,5 % de Solvencia II: ${qn(.995).toFixed(2)})`}""",
    "Subir de 99,5 % a 99,9 % añade más de media desviación típica de capital.")

# ============================== TEMA 4 ==============================
add("t4", 1, "De la distribución al capital: pérdida esperada y pérdida inesperada", "Pérdida esperada = media. Capital = VaR − media (lo que cubre lo inesperado).",
    [sl("s", "dispersión σ", .3, 1.6, .8, .05)],
    r"""const f=x=>x<=0?0:Math.exp(-(Math.log(x)**2)/(2*P.s*P.s))/(x*P.s*2.5066),mean=Math.exp(P.s*P.s/2),v=Math.exp(P.s*qn(.995)),hi=Math.exp(P.s*3.2);
return {x:[0,hi],y:[0,Math.min(1.5,Math.max(...curve(f,.02,hi).map(p=>p[1]))*1.1)],curves:[{pts:curve(f,.02,hi,300),c:'acc'}],vl:[{x:mean,label:'pérdida esperada',c:'pres'},{x:v,label:'VaR 99,5 %',c:'bad'}],xl:'pérdida',yl:'densidad',
out:`Pérdida esperada ${mean.toFixed(2)} · VaR 99,5 % ${v.toFixed(2)} · <b>capital (inesperada) = ${(v-mean).toFixed(2)}</b>`}""",
    "La pérdida esperada se financia con primas; el capital cubre lo que se desvía de ella en el año malo.")
add("t4", 2, "Axioma de homogeneidad: duplicar la cartera duplica el riesgo", "ρ(kX)=kρ(X). La varianza NO lo cumple (crece como k²).",
    [sl("sd", "desviación de X", .5, 2, 1, .1)],
    r"""return {x:[0,3],curves:[{pts:curve(k=>k*P.sd,0,3),c:'acc'},{pts:curve(k=>k*k*P.sd*P.sd,0,3),c:'bad'},{pts:curve(k=>k*2.665*P.sd,0,3),c:'pres'}],legend:[['desviación típica','acc'],['varianza (viola el axioma)','bad'],['TVaR 99 % normal','pres']],xl:'escala k de la cartera',yl:'medida de riesgo',
out:`Al triplicar la cartera: desviación ×3, TVaR ×3, pero la varianza ×9`}""",
    "Una medida coherente escala linealmente. Por eso no se mide capital con la varianza.")
add("t4", 3, "El VaR leído sobre la función de distribución", "Se entra por el nivel α y se baja a la pérdida: VaR_α = F⁻¹(α).",
    [sl("a", "nivel α", .9, .999, .99, .001), sl("s", "dispersión σ", .3, 1.6, .8, .05)],
    r"""const F=x=>x<=0?0:Phi(Math.log(x)/P.s),v=Math.exp(P.s*qn(P.a)),hi=Math.exp(P.s*3.2);
return {x:[0,hi],y:[0,1],curves:[{pts:curve(F,.01,hi,300),c:'acc'}],hl:[{y:P.a,label:'α',c:'pres'}],vl:[{x:v,label:'VaR',c:'bad'}],xl:'pérdida',yl:'F(x)',out:`Con α = ${(P.a*100).toFixed(1)} %, VaR = <b>${v.toFixed(2)}</b>: solo el ${((1-P.a)*100).toFixed(2)} % de los años lo supera`}""",
    "El VaR es solo un punto de la distribución: no cuenta lo que pasa más allá.")
add("t4", 5, "El caso de los dos bonos: el VaR puede decir que diversificar es peor", "Dos bonos independientes, cada uno pierde 100 con prob. p. Se compara el riesgo por separado y juntos.",
    [sl("p", "prob. de impago p", .01, .1, .04, .005), sl("a", "nivel α", .9, .99, .95, .005)],
    r"""const p=P.p,a=P.a;const dist=(vals,pr)=>({vals,pr});const X=dist([0,100],[1-p,p]),Z=dist([0,100,200],[(1-p)**2,2*p*(1-p),p*p]);
const VaR=d=>{let c=0;for(let i=0;i<d.vals.length;i++){c+=d.pr[i];if(c>=a-1e-12)return d.vals[i]}return d.vals[d.vals.length-1]};
const TV=d=>{const v=VaR(d);let c=0,e=0;d.vals.forEach((x,i)=>{if(x>v)e+=x*d.pr[i];if(x<=v)c+=d.pr[i]});return(e+v*(c-a))/(1-a)};
const a1=2*VaR(X),a2=VaR(Z),b1=2*TV(X),b2=TV(Z);
return {cat:['VaR(X)+VaR(Y)','VaR(X+Y)','TVaR(X)+TVaR(Y)','TVaR(X+Y)'],bars:[{h:a1,c:'acc'},{h:a2,c:a2>a1?'bad':'acc'},{h:b1,c:'pres'},{h:b2,c:'pres'}],yl:'capital',
out:`${a2>a1?'<b>¡El VaR conjunto es MAYOR que la suma!</b> Diversificar «sube» el riesgo: viola la subaditividad. ':'Aquí VaR cumple la subaditividad. '}El TVaR conjunto (${b2.toFixed(1)}) nunca supera la suma (${b1.toFixed(1)}).`}""",
    "Con p=4 % y α=95 % cada bono solo, VaR=0; juntos, VaR=100. El TVaR no cae en esa trampa.")
add("t4", 5, "Con dos riesgos que van juntos no hay diversificación", "Capital agregado según la correlación ρ: de la raíz (independientes) a la suma simple (comonótonos).",
    [sl("s1", "SCR 1", 10, 80, 40, 5), sl("s2", "SCR 2", 10, 80, 30, 5)],
    r"""const f=r=>Math.sqrt(P.s1**2+P.s2**2+2*r*P.s1*P.s2);return {x:[0,1],curves:[{pts:curve(f,0,1),c:'acc'},{pts:curve(r=>P.s1+P.s2,0,1),c:'bad',dash:[5,4]}],legend:[['capital agregado','acc'],['suma simple (ρ=1)','bad']],xl:'correlación ρ',yl:'capital',
out:`Con ρ=0: ${f(0).toFixed(1)} · con ρ=0,5: ${f(.5).toFixed(1)} · con ρ=1: ${f(1).toFixed(1)} (sin diversificación)`}""",
    "La diversificación es la distancia entre la línea de suma y la curva. Desaparece con ρ=1.")
add("t4", 6, "Reparto de Euler: quién «pone» cuánto capital", "Contribución de cada línea = S_i(S_i+ρS_j)/SCR. La suma de contribuciones es el SCR total.",
    [sl("s1", "SCR línea 1", 10, 80, 40, 5), sl("s2", "SCR línea 2", 10, 80, 30, 5), sl("rho", "correlación ρ", 0, 1, .25, .05)],
    r"""const t=Math.sqrt(P.s1**2+P.s2**2+2*P.rho*P.s1*P.s2),c1=P.s1*(P.s1+P.rho*P.s2)/t,c2=P.s2*(P.s2+P.rho*P.s1)/t;
return {cat:['Línea 1 sola','Línea 1 asignada','Línea 2 sola','Línea 2 asignada'],bars:[{h:P.s1,c:'mut'},{h:c1,c:'acc'},{h:P.s2,c:'mut'},{h:c2,c:'pres'}],yl:'M€',
out:`SCR total ${t.toFixed(2)} = ${c1.toFixed(2)} + ${c2.toFixed(2)} · cada línea paga menos que sola (diversificación repartida)`}""",
    "El reparto de Euler es justo: cada línea paga según cuánto empuja el riesgo total.")
add("t4", 7, "Solvencia II (VaR 99,5 %) frente a Basilea (TVaR 97,5 %)", "Dos formas de medir la cola para una pérdida log-normal según su dispersión σ.",
    [],
    r"""const z=qn(.995),z2=qn(.975);return {x:[.1,1.6],curves:[{pts:curve(s=>Math.exp(s*z),.1,1.6),c:'acc'},{pts:curve(s=>Math.exp(s*s/2)*Phi(s-z2)/.025,.1,1.6),c:'bad'}],legend:[['VaR 99,5 % (Solvencia II)','acc'],['TVaR 97,5 % (Basilea)','bad']],xl:'dispersión σ',yl:'medida',
out:`Con σ pequeño ambas son parecidas; con σ grande (cola pesada) cuál es mayor cambia: no son intercambiables`}""",
    "Según la forma de la cola, una u otra exige más capital: el regulador elige cuál mide mejor el riesgo.")
add("t4", 8, "Cuánto sube el TVaR respecto al VaR al endurecer el nivel", "Cociente TVaR/VaR: Normal frente a log-normal.",
    [sl("s", "σ log-normal", .3, 1.6, .8, .05)],
    r"""const nv=a=>{const z=qn(a),phi=Math.exp(-z*z/2)/2.5066;return phi/(1-a)/z},lv=a=>{const z=qn(a);return Math.exp(P.s*P.s/2)*Phi(P.s-z)/(1-a)/Math.exp(P.s*z)};
return {x:[.9,.999],curves:[{pts:curve(nv,.9,.999,100),c:'acc'},{pts:curve(lv,.9,.999,100),c:'bad'}],legend:[['Normal','acc'],['Log-normal','bad']],xl:'nivel α',yl:'TVaR / VaR',out:`Al 99 %: Normal ${nv(.99).toFixed(2)} · log-normal ${lv(.99).toFixed(2)}`}""",
    "Con cola pesada el TVaR se aleja del VaR: el VaR por sí solo oculta gravedad.")

# ============================== TEMA 5 ==============================
add("t5", 1, "Con la misma media, la cola decide: Normal frente a Pareto", "Pérdida correspondiente a un periodo de retorno dado (media 10). Normal con desv. 5 frente a Pareto de índice α.",
    [sl("al", "Pareto α", 1.5, 6, 3, .1)],
    r"""const m=10*(P.al-1);const nq=p=>10+5*qn(p),pq=p=>m*(Math.pow(1-p,-1/P.al)-1);return {x:[1,4],curves:[{pts:curve(t=>nq(1-Math.pow(10,-t)),1,4,100),c:'acc'},{pts:curve(t=>pq(1-Math.pow(10,-t)),1,4,100),c:'bad'}],legend:[['Normal','acc'],['Pareto','bad']],xl:'log10 del periodo de retorno (años)',yl:'pérdida',
out:`Pérdida 1-en-200: Normal ${nq(.995).toFixed(1)} · Pareto ${pq(.995).toFixed(1)} · 1-en-10.000: ${nq(.9999).toFixed(1)} frente a ${pq(.9999).toFixed(1)}`}""",
    "Hasta 1-en-10 coinciden; más allá la Pareto se dispara. Por eso las colas catastróficas no se modelan con campanas.")
add("t5", 2, "El máximo de muchos datos tiene forma propia", "Histograma del máximo de bloques de n datos según el tipo de cola (2.500 bloques).",
    [sl("n", "tamaño del bloque n", 5, 300, 50, 5), sel("d", "cola", [("exp", "exponencial → Gumbel"), ("par", "Pareto α=3 → Fréchet"), ("uni", "acotada (uniforme) → Weibull")]), BTN],
    r"""const M=[];for(let i=0;i<2500;i++){let m=-1e9;for(let j=0;j<P.n;j++){const u=Math.random();const x=P.d==='exp'?-Math.log(u):P.d==='par'?Math.pow(u,-1/3):u;if(x>m)m=x}M.push(m)}
const s=M.slice().sort((a,b)=>a-b),lo=s[25],hi=s[2480],b=hist(M,lo,hi,40);const bars=b.map((v,i)=>({x:lo+(hi-lo)*(i+.5)/40,h:v,w:(hi-lo)/42,c:'acc'}));
return {x:[lo,hi],bars,xl:'máximo del bloque',yl:'densidad',out:P.d==='par'?'Cola derecha larga: Fréchet (el caso de los seguros catastróficos)':P.d==='exp'?'Forma de Gumbel: cola que decae exponencialmente':'Pegado al tope: Weibull (cola acotada)'}""",
    "Igual que la suma tiende a una campana, el máximo tiende a una de solo tres formas.")
add("t5", 3, "Bloques frente a umbral: qué datos se aprovechan", "20 años de eventos. Círculos: máximo de cada año (bloques). Puntos rojos: todo lo que supera el umbral u (POT).",
    [sl("u", "umbral u", 2, 15, 5, .5), BTN],
    r"""const ev=[];for(let y=0;y<20;y++){const n=pois(6);for(let j=0;j<n;j++)ev.push([y+Math.random(),2*Math.pow(Math.random(),-1/2.5)])}
const mx=[];for(let y=0;y<20;y++){const e=ev.filter(p=>Math.floor(p[0])===y);if(e.length)mx.push(e.reduce((a,b)=>b[1]>a[1]?b:a))}
const ex=ev.filter(p=>p[1]>P.u);return {x:[0,20],y:[0,20],groups:[{pts:ev.filter(p=>p[1]<=P.u&&p[1]<20),c:'mut',r:1.5},{pts:ex.filter(p=>p[1]<20),c:'bad',r:2.5,a:.9},{pts:mx.filter(p=>p[1]<20),c:'pres',r:5,a:.5}],hl:[{y:P.u,label:'umbral u',c:'pres'}],xl:'años',yl:'tamaño del evento',
out:`Bloques: <b>${mx.length}</b> datos (uno por año) · POT: <b>${ex.length}</b> excesos sobre u. POT aprovecha más información.`}""",
    "El método de bloques tira casi todos los datos; POT usa todos los extremos (si no vienen agrupados).")
add("t5", 4, "La GPD: dos mandos, escala σ y forma ξ", "Densidad de los excesos sobre el umbral. ξ>0 cola pesada, ξ=0 exponencial, ξ<0 con tope.",
    [sl("xi", "forma ξ", -.3, 1, .3, .05), sl("sg", "escala σ", 1, 10, 5, .5)],
    r"""const f=y=>{if(Math.abs(P.xi)<1e-6)return Math.exp(-y/P.sg)/P.sg;const z=1+P.xi*y/P.sg;return z<=0?0:Math.pow(z,-1/P.xi-1)/P.sg};
return {x:[0,60],curves:[{pts:curve(f,0,60,300),c:'acc'},{pts:curve(y=>Math.exp(-y/P.sg)/P.sg,0,60),c:'mut',dash:[4,4],lw:1.5}],legend:[['GPD(ξ,σ)','acc'],['exponencial','mut']],xl:'exceso sobre el umbral',yl:'densidad',
out:P.xi>=.5?'ξ ≥ 0,5: ¡la varianza no existe!':P.xi>0?`Cola pesada: existen momentos hasta orden ${(1/P.xi).toFixed(1)}`:P.xi<0?`Soporte acotado: máximo ${(-P.sg/P.xi).toFixed(1)}`:'Exponencial'}""",
    "ξ manda: dicta si existen la media (ξ<1) y la varianza (ξ<0,5).")
add("t5", 5, "Elegir el umbral con el gráfico del exceso medio", "Exceso medio e(u) de una muestra Pareto: debe ser aproximadamente lineal con pendiente ξ/(1−ξ).",
    [sl("al", "Pareto α", 1.5, 5, 3, .1), BTN],
    r"""const x=Array.from({length:1500},()=>Math.pow(Math.random(),-1/P.al)),s=x.slice().sort((a,b)=>a-b),hi=s[Math.floor(.97*s.length)];const pts=[];
for(let i=0;i<=30;i++){const u=1+(hi-1)*i/30,e=x.filter(v=>v>u);if(e.length>10)pts.push([u,e.reduce((a,b)=>a+b-u,0)/e.length])}
return {x:[1,hi],curves:[{pts,c:'acc'},{pts:curve(u=>u/(P.al-1),1,hi),c:'pres',dash:[5,4]}],legend:[['muestra','acc'],['teoría u/(α−1)','pres']],xl:'umbral u',yl:'exceso medio e(u)',
out:`Con α=${P.al.toFixed(1)}, ξ = ${(1/P.al).toFixed(2)}; a la derecha hay pocos datos y el ruido crece: ese es el equilibrio sesgo/varianza`}""",
    "Se elige u donde la curva empieza a ser una recta. Si se pasa, quedan pocos datos y la curva se vuelve ruidosa.")
add("t5", 7, "Un siniestro extremo no es el capital del año", "VaR 99,5 % por evento frente al capital anual simulado (Poisson λ eventos/año, GPD σ=6, u=10).",
    [sl("lam", "eventos/año λ", 1, 10, 3, 1), sl("xi", "forma ξ", .1, .6, .3, .05), BTN],
    r"""const u=10,sg=6,xi=P.xi,ev=()=>u+sg/xi*(Math.pow(Math.random(),-xi)-1),S=[];for(let i=0;i<6000;i++){const n=pois(P.lam);let t=0;for(let j=0;j<n;j++)t+=ev();S.push(t)}
const ve=u+sg/xi*(Math.pow(.005,-xi)-1),va=q99(S,.995),m=S.reduce((a,b)=>a+b,0)/S.length;
return {cat:['VaR 99,5 % por evento','Pérdida media anual','VaR 99,5 % anual (SCR)'],bars:[{h:ve,c:'acc'},{h:m,c:'mut'},{h:va,c:'bad'}],yl:'M€',out:`El capital anual (${va.toFixed(0)}) es ${(va/ve).toFixed(1)}× el VaR por evento: frecuencia y agregación cuentan`}""",
    "Cuantos más eventos al año, mayor el capital; el VaR de un siniestro por sí solo se queda corto.")
add("t5", 8, "Poner precio a una capa de reaseguro", "Pérdida esperada anual de la capa «L xs D» según ξ (u=10, σ=6): ∫ de la probabilidad de excedencia.",
    [sl("D", "prioridad D", 10, 60, 20, 5), sl("L", "límite L", 10, 60, 40, 5), sl("lam", "excesos/año λ", 1, 5, 2, .5), sl("xi", "tu ξ", .05, .6, .35, .05)],
    r"""const u=10,sg=6,el=xi=>{let s=0,n=200,h=P.L/n;for(let i=0;i<n;i++){const x=P.D+(i+.5)*h,y=x-u;s+=P.lam*Math.pow(1+xi*y/sg,-1/xi)*h}return s};
return {x:[.05,.6],curves:[{pts:curve(el,.05,.6,80),c:'acc'}],vl:[{x:P.xi,label:'ξ',c:'pres'}],xl:'forma ξ',yl:'pérdida esperada anual de la capa (M€)',out:`Capa ${P.L} xs ${P.D}: pérdida esperada <b>${el(P.xi).toFixed(2)}</b> M€/año con ξ=${P.xi}; con ξ=0,25: ${el(.25).toFixed(2)} y ξ=0,45: ${el(.45).toFixed(2)}`}""",
    "Las capas altas dependen casi solo de ξ: un pequeño error en la forma de la cola cambia mucho el precio.")
add("t5", 9, "Un cuantil por evento no es un cuantil por año", "Periodo de retorno del cuantil p por evento = 1/(λ(1−p)) años, según cuántos eventos hay al año.",
    [sl("lam", "eventos/año λ", 1, 10, 2, .5)],
    r"""const T=p=>Math.log10(1/(P.lam*(1-p)));return {x:[.9,.9995],curves:[{pts:curve(T,.9,.9995,150),c:'acc'}],hl:[{y:Math.log10(200),label:'200 años (SCR)',c:'bad'}],vl:[{x:.995,label:'p=99,5 %',c:'pres'}],xl:'cuantil p por evento',yl:'log10 del periodo de retorno',
out:`El cuantil 99,5 % por evento se supera <b>cada ${(1/(P.lam*.005)).toFixed(0)} años</b>, no cada 200. Para 1-en-200 años hace falta p = ${(1-1/(200*P.lam)).toFixed(4)}`}""",
    "Idea de la clase del 5 de noviembre: el cuantil 99,5 % es 1 de cada 200 eventos, no 1 de cada 200 años.")
add("t5", 10, "Límites de póliza: ignorarlos esconde la cola", "Si los siniestros están cortados en el límite c y se ignora, la cola parece más corta (ξ estimado menor).",
    [sl("c", "límite de póliza c", 10, 120, 40, 5), BTN],
    r"""const x=Array.from({length:800},()=>3*Math.pow(Math.random(),-1/2.2)),y=x.map(v=>Math.min(v,P.c)),L=v=>Math.log10(Math.max(v,1e-7));
const sv=a=>{const s=a.slice().sort((p,q)=>p-q),n=s.length,pts=[];for(let i=0;i<n;i+=8)pts.push([s[i],L(1-i/n)]);return pts};
const hill=a=>{const s=a.slice().sort((p,q)=>q-p),k=80;let t=0;for(let i=0;i<k;i++)t+=Math.log(s[i]/s[k]);return t/k};
return {x:[3,150],y:[-3,0],curves:[{pts:sv(x),c:'acc'},{pts:sv(y),c:'bad'}],legend:[['siniestros reales','acc'],['observados con límite','bad']],xl:'importe',yl:'log10 P(X>x)',out:`ξ de Hill (top 10 %): reales ${hill(x).toFixed(2)} · con límite ${hill(y).toFixed(2)} → ignorar la censura subestima la cola`}""",
    "Los límites censuran los datos: hay que usar verosimilitud censurada, no tratarlos como si fueran el importe total.")
add("t5", 11, "Terremoto frente a inundación: VaR y TVaR por nivel", "Caso 1 (u=10, σ=6) y Caso 2 (u=5, σ=4), con n/Nu=25. Cambia la forma ξ de cada uno.",
    [sl("x1", "ξ terremoto", .1, .6, .35, .05), sl("x2", "ξ inundación", .1, .6, .25, .05)],
    r"""const v=(u,x,s,p)=>u+s/x*(Math.pow(25*(1-p),-x)-1),t=(u,x,s,p)=>(v(u,x,s,p)+s-x*u)/(1-x);
return {x:[.97,.999],curves:[{pts:curve(p=>v(10,P.x1,6,p),.97,.999,80),c:'acc'},{pts:curve(p=>t(10,P.x1,6,p),.97,.999,80),c:'acc',dash:[5,4]},{pts:curve(p=>v(5,P.x2,4,p),.97,.999,80),c:'bad'},{pts:curve(p=>t(5,P.x2,4,p),.97,.999,80),c:'bad',dash:[5,4]}],
legend:[['VaR terremoto','acc'],['TVaR terremoto (discont.)','acc'],['VaR inundación','bad'],['TVaR inundación (discont.)','bad']],xl:'nivel p',yl:'M€',out:`Al 99,5 %: terremoto VaR ${v(10,P.x1,6,.995).toFixed(1)} · TVaR ${t(10,P.x1,6,.995).toFixed(1)} — inundación VaR ${v(5,P.x2,4,.995).toFixed(1)} · TVaR ${t(5,P.x2,4,.995).toFixed(1)}`}""",
    "Con ξ=0,35 y 0,25 (los del enunciado) salen los 28,35/47,46 y 15,91/24,88 de clase.")

# ============================== TEMA 6 ==============================
add("t6", 1, "Normalmente nada, en la crisis todo a la vez", "Dos riesgos: en tiempos normales son independientes; en crisis (prob. π) se mueven juntos y con más amplitud.",
    [sl("pi", "prob. de crisis π", 0, .3, .1, .01), sl("rc", "correlación en crisis", 0, .99, .8, .01), BTN],
    r"""const A=[],B=[];for(let i=0;i<1500;i++){const cr=Math.random()<P.pi,z1=rn(),z2=P.rc*z1+Math.sqrt(1-P.rc**2)*rn();if(cr)B.push([2.2*z1,2.2*z2]);else A.push([z1,rn()])}
const all=A.concat(B);const m=a=>a.reduce((s,p)=>s+p[0],0)/a.length,mm=a=>a.reduce((s,p)=>s+p[1],0)/a.length;const mx=m(all),my=mm(all);let sxy=0,sx=0,sy=0;all.forEach(p=>{sxy+=(p[0]-mx)*(p[1]-my);sx+=(p[0]-mx)**2;sy+=(p[1]-my)**2});
return {x:[-8,8],y:[-8,8],groups:[{pts:A,c:'acc'},{pts:B,c:'bad',a:.8}],xl:'riesgo 1',yl:'riesgo 2',out:`Correlación global = <b>${(sxy/Math.sqrt(sx*sy)).toFixed(2)}</b> (parece baja) pero los puntos rojos acumulan los extremos conjuntos`}""",
    "La correlación media subestima el contagio: casi todo el tiempo no hay relación, y la cola es de crisis.")
add("t6", 2, "Cuando ρ = 0 no significa independencia", "Dependencias distintas con su correlación de Pearson y de Spearman.",
    [sel("rel", "relación", [("par", "Y = X² (parábola)"), ("lin", "Y = 0,7X (lineal)"), ("cir", "círculo"), ("exp", "Y = eˣ")]), BTN],
    r"""const pts=[];for(let i=0;i<600;i++){const x=rn();let y;if(P.rel==='par')y=x*x+.1*rn();else if(P.rel==='lin')y=.7*x+.5*rn();else if(P.rel==='exp')y=Math.exp(x);else{const a=Math.random()*6.283;pts.push([Math.cos(a)*2+.1*rn(),Math.sin(a)*2+.1*rn()]);continue}pts.push([x,y])}
const n=pts.length,mx=pts.reduce((s,p)=>s+p[0],0)/n,my=pts.reduce((s,p)=>s+p[1],0)/n;let a=0,b=0,c=0;pts.forEach(p=>{a+=(p[0]-mx)*(p[1]-my);b+=(p[0]-mx)**2;c+=(p[1]-my)**2});
const rk=v=>{const s=v.map((x,i)=>[x,i]).sort((p,q)=>p[0]-q[0]),r=[];s.forEach((p,i)=>r[p[1]]=i);return r},r1=rk(pts.map(p=>p[0])),r2=rk(pts.map(p=>p[1]));let sp=0,sa=0,sb=0;const m=(n-1)/2;for(let i=0;i<n;i++){sp+=(r1[i]-m)*(r2[i]-m);sa+=(r1[i]-m)**2;sb+=(r2[i]-m)**2}
const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {x:[Math.min(...xs),Math.max(...xs)],y:[Math.min(...ys),Math.max(...ys)],groups:[{pts,c:'acc'}],out:`Pearson = <b>${(a/Math.sqrt(b*c)).toFixed(2)}</b> · Spearman = <b>${(sp/Math.sqrt(sa*sb)).toFixed(2)}</b> ${Math.abs(a/Math.sqrt(b*c))<.15?'→ ¡casi 0 y sin embargo hay relación exacta!':''}`}""",
    "Parábola y círculo: dependencia total y correlación casi nula. Pearson solo ve rectas.")
add("t6", 3, "Sklar en acción: mismas relaciones, distintas formas", "Cópula Gaussiana ρ; se transforman las marginales a log-normales (σ). Spearman no cambia; Pearson sí.",
    [sl("rho", "ρ de la cópula", -.9, .9, .7, .05), sl("s", "σ de las marginales", .1, 1.5, .8, .05), BTN],
    r"""const pts=[],z=[];for(let i=0;i<1000;i++){const a=rn(),b=P.rho*a+Math.sqrt(1-P.rho**2)*rn();z.push([a,b]);pts.push([Math.exp(P.s*a),Math.exp(P.s*b)])}
const cor=a=>{const n=a.length,mx=a.reduce((s,p)=>s+p[0],0)/n,my=a.reduce((s,p)=>s+p[1],0)/n;let x=0,y=0,c=0;a.forEach(p=>{x+=(p[0]-mx)*(p[1]-my);y+=(p[0]-mx)**2;c+=(p[1]-my)**2});return x/Math.sqrt(y*c)};
return {x:[0,Math.min(12,Math.max(...pts.map(p=>p[0])))],y:[0,Math.min(12,Math.max(...pts.map(p=>p[1])))],groups:[{pts:pts.filter(p=>p[0]<12&&p[1]<12),c:'acc'}],xl:'riesgo 1 (log-normal)',yl:'riesgo 2',out:`Pearson de las normales: ${cor(z).toFixed(2)} · Pearson tras la transformación: <b>${cor(pts).toFixed(2)}</b> — la dependencia (cópula) es la misma`}""",
    "Marginales y dependencia son dos mandos independientes: eso es lo que dice el teorema de Sklar.")
add("t6", 4, "El generador: una sola función construye la cópula", "Generadores φ(t) de Clayton, Gumbel y Frank con el mismo parámetro θ.",
    [sl("th", "θ", 1.1, 6, 2, .1)],
    r"""const th=P.th;return {x:[.02,1],y:[0,8],curves:[{pts:curve(t=>(Math.pow(t,-th)-1)/th,.02,1,200),c:'acc'},{pts:curve(t=>Math.pow(-Math.log(t),th),.02,1,200),c:'bad'},{pts:curve(t=>-Math.log((Math.exp(-th*t)-1)/(Math.exp(-th)-1)),.02,1,200),c:'pres'}],legend:[['Clayton','acc'],['Gumbel','bad'],['Frank','pres']],xl:'t',yl:'φ(t)',
out:`C(u,v) = φ⁻¹(φ(u)+φ(v)): cambiando φ cambia la familia; θ=${th.toFixed(1)}`}""",
    "Todas comparten la misma construcción y solo cambian en el generador y, con él, en el comportamiento de las colas.")
add("t6", 5, "La t pega más cuanto menor es ν", "Dependencia de cola λ de la cópula t según los grados de libertad ν, para una ρ dada.",
    [sl("rho", "correlación ρ", -.5, .95, .5, .05)],
    r"""const lam=nu=>2*tcdf(-Math.sqrt((nu+1)*(1-P.rho)/(1+P.rho)),nu+1);return {x:[1,30],y:[0,1],curves:[{pts:curve(lam,1,30,29),c:'acc'}],hl:[{y:0,label:'Gaussiana (ν→∞)',c:'mut'}],xl:'grados de libertad ν',yl:'λ de cola',
out:`Con ρ=${P.rho}: ν=4 → λ=${lam(4).toFixed(2)} · ν=15 → λ=${lam(15).toFixed(2)} · ν=30 → λ=${lam(30).toFixed(3)}`}""",
    "A medida que ν crece, la t se convierte en la Gaussiana y la cola de dependencia desaparece.")
add("t6", 8, "Caso 2: del parámetro de Clayton al contagio", "λ_L = 2^(−1/θ). Con θ=1,5 (Caso 2) sale ≈ 63 %.",
    [sl("th", "θ de Clayton", .2, 5, 1.5, .1)],
    r"""return {x:[.2,5],y:[0,1],curves:[{pts:curve(t=>Math.pow(2,-1/t),.2,5),c:'acc'}],vl:[{x:P.th,label:'θ',c:'pres'}],xl:'θ',yl:'λ_L',out:`θ = ${P.th} → λ_L = <b>${Math.pow(2,-1/P.th).toFixed(2)}</b> (probabilidad asintótica de contagio) · τ de Kendall = ${(P.th/(P.th+2)).toFixed(2)}`}""",
    "Con θ=1,5 hay ≈63 % de probabilidad de que, si el mercado cae a su peor nivel, también lo haga la cartera catastrófica.")
add("t6", 9, "Fabricar pares con una cópula: el método condicional", "Se sortean u y w uniformes y se despeja v con la fórmula de Clayton. Con más θ, los pares se pegan más.",
    [sl("th", "θ de Clayton", .3, 6, 2, .1), sl("n", "nº de puntos", 50, 2000, 600, 50), BTN],
    r"""const pts=[];for(let i=0;i<P.n;i++){const u=Math.random(),w=Math.random();pts.push([u,Math.pow(1+Math.pow(u,-P.th)*(Math.pow(w,-P.th/(1+P.th))-1),-1/P.th)])}
return {x:[0,1],y:[0,1],groups:[{pts,c:'acc'}],xl:'u',yl:'v = C_u⁻¹(w)',out:`${P.n} pares con τ = ${(P.th/(P.th+2)).toFixed(2)}: aprecia la concentración en la esquina inferior izquierda`}""",
    "Es el «laboratorio» de la simulación: con estos pares y las marginales (Sklar) se obtienen pérdidas conjuntas.")
add("t6", 10, "Cuánto fiarse del parámetro estimado", "Se estima θ de Clayton por τ de Kendall en 250 muestras de tamaño n: la dispersión de θ̂.",
    [sl("n", "tamaño de muestra n", 30, 300, 100, 10), sl("th", "θ verdadero", .5, 4, 2, .1), BTN],
    r"""const est=[];for(let r=0;r<250;r++){const V=[];for(let i=0;i<P.n;i++){const Vg=rg(1/P.th);V.push([Math.pow(1+re()/Vg,-1/P.th),Math.pow(1+re()/Vg,-1/P.th)])}
let c=0;for(let i=0;i<P.n;i++)for(let j=i+1;j<P.n;j++)c+=Math.sign((V[i][0]-V[j][0])*(V[i][1]-V[j][1]));const tau=c/(P.n*(P.n-1)/2);est.push(2*tau/(1-tau))}
const lo=Math.max(0,P.th-2.5*P.th),hi=P.th*2.5,b=hist(est,lo,hi,40);const m=est.reduce((a,v)=>a+v,0)/est.length,sd=Math.sqrt(est.reduce((a,v)=>a+(v-m)**2,0)/est.length);
return {x:[lo,hi],bars:b.map((v,i)=>({x:lo+(hi-lo)*(i+.5)/40,h:v,w:(hi-lo)/42,c:'acc'})),vl:[{x:P.th,label:'θ real',c:'pres'}],xl:'θ estimado',yl:'densidad',out:`θ̂ medio ${m.toFixed(2)} · desviación ${sd.toFixed(2)} (IC 95 % ≈ ±${(1.96*sd).toFixed(2)})`}""",
    "Con muestras pequeñas (típico en seguros) el parámetro de la cópula queda muy incierto: hay que acompañar el capital de su intervalo.")
add("t6", 11, "¿Es válida tu matriz de correlaciones? Autovalores", "Una matriz de correlación debe ser semidefinida positiva (todos los autovalores ≥ 0).",
    [sl("a", "ρ₁₂", -1, 1, .9, .05), sl("b", "ρ₁₃", -1, 1, .9, .05), sl("c", "ρ₂₃", -1, 1, -.9, .05)],
    r"""const a=P.a,b=P.b,c=P.c;const p1=a*a+b*b+c*c;let ev;if(p1<1e-12)ev=[1,1,1];else{const q=0,p2=2*p1,p=Math.sqrt(p2/6);const B=[[0,a,b],[a,0,c],[b,c,0]].map(r=>r.map(v=>v/p));
const det=B[0][0]*(B[1][1]*B[2][2]-B[1][2]*B[2][1])-B[0][1]*(B[1][0]*B[2][2]-B[1][2]*B[2][0])+B[0][2]*(B[1][0]*B[2][1]-B[1][1]*B[2][0]);const r=Math.max(-1,Math.min(1,det/2)),ph=Math.acos(r)/3;
const e1=2*p*Math.cos(ph),e3=2*p*Math.cos(ph+2*Math.PI/3),e2=-e1-e3;ev=[e1,e2,e3].map(v=>v+1).sort((x,y)=>y-x)}
const ok=ev[2]>=-1e-9;return {cat:['λ₁','λ₂','λ₃'],bars:ev.map(v=>({h:v,c:v<-1e-9?'bad':'acc'})),yl:'autovalor',out:ok?'Matriz válida (semidefinida positiva).':`<b>¡No es una matriz de correlación válida!</b> Autovalor negativo ${ev[2].toFixed(2)}: hay que corregirla (matriz más cercana de Higham).`}""",
    "Con (0,9; 0,9; −0,9) sale un autovalor −0,8: no se puede simular ni agregar así.")

def html(v):
    tid, idx, title, sub, controls, code, read = v
    return (f'<div class="viz" data-w="gen"><h4>{title}</h4><p class="vsub">{sub}</p><div class="ctl">{"".join(controls)}</div><canvas></canvas><div class="out"></div>'
            f'<p class="read">{read}</p><script type="text/plain" class="calc">{code}</script></div>')

GEN = {}
for v in V:
    GEN.setdefault(v[0], []).append((v[1], html(v)))
