import*as S from"./store.js";import{home,subject,calendar,dataPage,printPage}from"./views.js";import{h,mark,closeSheet,pattern,onlineIcon,guessIcon}from"./ui.js";import{timerPage}from"./timer.js";import{flushOutbox,msgsPage,onMsgs}from"./contact.js";
const chat=()=>{const e=h("span",{class:"chat"});e.innerHTML='<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path d="M9 3.5h6a6 6 0 0 1 6 6V11a6 6 0 0 1-6 6h-3.5L7 21v-4.3A6 6 0 0 1 3 11V9.5a6 6 0 0 1 6-6z" fill="currentColor"/><path d="M6.6 10.7l2 2 3.3-3.9" fill="none" stroke="var(--on-fg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.2 10h3M14.2 12.6h2" fill="none" stroke="var(--on-fg)" stroke-width="1.8" stroke-linecap="round"/><circle cx="19.6" cy="4.6" r="2.7" fill="#F59E0B" stroke="var(--paper)" stroke-width="1.2"/></svg>';return e};
const app=document.getElementById("app");let last="";
function render(){pattern(S.get().subjects);
  const[,r,a]=(location.hash.slice(1)||"/").split("/"),same=last===location.hash,y=scrollY;
  app.replaceChildren(r==="s"?subject(a):r==="cal"?calendar(a):r==="timer"?timerPage():r==="data"?dataPage():r==="print"?printPage(a):r==="msgs"?msgsPage():home());
  scrollTo(0,same?y:0);last=location.hash;
  const cur=r==="cal"?"cal":r==="timer"?"timer":r==="data"||r==="print"?"data":r==="msgs"?"":"home";document.body.classList.toggle("on-msgs",r==="msgs");document.body.classList.toggle("on-print",r==="print");document.querySelectorAll(".tabs a").forEach(t=>t.classList.toggle("on",t.dataset.t===cur));movePill();
}
/* مؤشّر القايمة السفلية: موجة بتعدّي من فوق الأزرار للزرار الجديد، والكبسولة بتظهر عليه وقت وصولها مع تموّج */
const tabs=document.querySelector(".tabs"),pill=h("i",{class:"pill","aria-hidden":"true"}),wave=h("i",{class:"wave","aria-hidden":"true"}),rip=h("i",{class:"rip","aria-hidden":"true"});
if(tabs)tabs.prepend(pill,wave,rip);
let pl=null,pw=0;const calm=matchMedia("(prefers-reduced-motion: reduce)");
function movePill(){const on=tabs&&tabs.querySelector("a.on");if(!on){pill.style.opacity=0;pl=null;return}
  const L=on.offsetLeft-tabs.clientLeft,W=on.offsetWidth;pill.style.opacity=1;
  if(pl!==null&&!calm.matches&&(L!==pl||W!==pw)){
    const c0=pl+pw/2,c1=L+W/2,dist=Math.abs(c1-c0),T=Math.round(Math.min(480,Math.max(300,230+dist*.9))),arrive=T*.78,ww=120;
    const g=pill.cloneNode();g.style.cssText=`width:${pw}px;transform:translateX(${pl}px);opacity:1`;tabs.prepend(g);
    g.animate([{opacity:1,transform:`translateX(${pl}px) scale(1)`},{opacity:0,transform:`translateX(${pl}px) scale(.7)`}],{duration:170,easing:"ease-in",fill:"forwards"}).onfinish=()=>g.remove();
    wave.animate([{transform:`translateX(${c0-ww/2}px) scaleX(.6)`,opacity:0},{transform:`translateX(${(c0+c1)/2-ww/2}px) scaleX(1.7)`,opacity:1,offset:.5},{transform:`translateX(${c1-ww/2}px) scaleX(.7)`,opacity:0}],{duration:T,easing:"cubic-bezier(.55,0,.2,1)"});
    rip.style.left=(c1-24)+"px";
    rip.animate([{transform:"scale(.3)",opacity:0,offset:0},{transform:"scale(.4)",opacity:.55,offset:.12},{transform:"scale(2.3)",opacity:0}],{duration:560,delay:arrive,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"});
    pill.animate([{opacity:0,transform:`translateX(${L}px) scale(.55,.7)`},{opacity:1,transform:`translateX(${L}px) scale(1.08,1.06)`,offset:.6},{opacity:1,transform:`translateX(${L}px) scale(1)`}],{duration:420,delay:arrive,easing:"cubic-bezier(.3,1.3,.5,1)",fill:"backwards"})}
  pill.style.width=W+"px";pill.style.transform=`translateX(${L}px)`;pl=L;pw=W}
addEventListener("resize",movePill);addEventListener("load",movePill);document.fonts&&document.fonts.ready.then(movePill);
S.subscribe(render);onMsgs(()=>S.update(()=>{}));document.body.append(h("a",{class:"fab",href:"#/msgs","aria-label":"تواصل معي",title:"تواصل معي"},chat()));
/* انتقال الصفحة متزامن مع القايمة: القديمة بتخرج وقت ما الكبسولة بتتحوّل لنقطة، والجديدة بتدخل وهي بتتفتح */
const order=["home","cal","timer","data"],tabOf=()=>{const r=(location.hash.slice(1)||"/").split("/")[1];return r==="cal"?"cal":r==="timer"?"timer":r==="data"||r==="print"?"data":r==="msgs"?"":"home"};
let curTab=tabOf(),swap=0;
addEventListener("hashchange",()=>{closeSheet();clearTimeout(swap);const nt=tabOf(),old=app.firstElementChild;
  if(!calm.matches&&nt&&curTab&&nt!==curTab&&old){
    const s=order.indexOf(nt)>order.indexOf(curTab)?-1:1;curTab=nt;
    document.querySelectorAll(".tabs a").forEach(t=>t.classList.toggle("on",t.dataset.t===nt));movePill();
    old.animate([{opacity:1,transform:"none"},{opacity:0,transform:`translateX(${-s*26}px)`}],{duration:150,easing:"ease-in",fill:"forwards"});
    swap=setTimeout(()=>{render();const nv=app.firstElementChild;if(nv){nv.style.animation="none";nv.animate([{opacity:0,transform:`translateX(${s*30}px)`},{opacity:1,transform:"none"}],{duration:400,easing:"cubic-bezier(.2,.8,.2,1)"})}},150);
  }else{curTab=nt;render()}});
render();
const tried=new Set(),sweep=()=>{if(!navigator.onLine||/[?&]demo/.test(location.search))return;S.get().subjects.filter(s=>s.auto&&s.icon[0]!=="@"&&!tried.has(s.id)&&!guessIcon(s.ar,s.en)).forEach(async s=>{tried.add(s.id);const i=await onlineIcon(s.ar,s.en);if(i)S.update(x=>{const t=x.subjects.find(y=>y.id===s.id);if(t&&t.auto)t.icon=i})})};
sweep();flushOutbox();addEventListener("online",()=>{tried.clear();sweep();flushOutbox()});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
let busy=0;document.getElementById("theme").onclick=e=>{if(busy)return;const nx=document.documentElement.dataset.theme==="dark"?"light":"dark";
if(!document.startViewTransition||matchMedia("(prefers-reduced-motion:reduce)").matches){setTheme(nx,1);return}
const r=e.currentTarget.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
busy=1;const vt=document.startViewTransition(()=>setTheme(nx,1));vt.finished.finally(()=>{busy=0});vt.ready.then(()=>document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${R}px at ${x}px ${y}px)`]},{duration:650,easing:"cubic-bezier(.4,0,.2,1)",pseudoElement:"::view-transition-new(root)"})).catch(()=>{})};
