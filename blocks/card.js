(()=>{var T="openchamber.sdk",S=1;var et=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [data-oc-scrolling] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [data-oc-scrolling] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [data-oc-scrolling]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [data-oc-scrolling] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Qt(e){let r=e.documentElement;if(r.hasAttribute("data-oc-scrollbar-activity"))return;r.setAttribute("data-oc-scrollbar-activity","");let s=new WeakMap;e.addEventListener("scroll",(p)=>{let l=p.target===e?r:p.target;if(!(l instanceof Element))return;if(!l.hasAttribute("data-oc-scrolling"))l.setAttribute("data-oc-scrolling","");let R=s.get(l);if(R!==void 0)clearTimeout(R);s.set(l,setTimeout(()=>{s.delete(l),l.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var Wo=`(${Qt.toString()})(document);`;var tt=128,ot=65536;var ke=128;var Me=65536;var rt=8000,nt=192000,st=120000;var Zt=(e)=>{let r=[],s=0,p=0;return{push:(l)=>{r.push(l),p+=l.length;while(p-s>e&&r.length>1){let R=r.shift();p-=R?.length??0,s=0}},pull:(l)=>{let R=0;while(R<l.length&&r.length>0){let x=r[0],k=Math.min(l.length-R,x.length-s);if(l.set(x.subarray(s,s+k),R),R+=k,s+=k,s>=x.length)r.shift(),p-=x.length,s=0}l.fill(0,R)},clear:()=>{r.length=0,s=0,p=0},get size(){return p-s}}};var oo=/^[a-z][a-z0-9-]{0,39}$/;var qt=(e)=>Object(e)===e&&!Array.isArray(e),it=(e,r)=>Object.keys(e).every((s)=>r.includes(s)),eo=(e)=>String(e)===e&&e.length>=1&&e.length<=60,to=(e)=>String(e)===e&&e.length>=1&&e.length<=80,ro=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let r=new Set;for(let s of e){if(!qt(s)||!oo.test(s.id)||!eo(s.label))return!1;if(s.disabled!==void 0&&s.disabled!==!0&&s.disabled!==!1)return!1;if(r.has(s.id))return!1;if(r.add(s.id),s.kind==="button"){if(!it(s,["kind","id","label","disabled"]))return!1;continue}if(s.kind!=="select"||!it(s,["kind","id","label","value","options","disabled"]))return!1;if(!to(s.value)||!Array.isArray(s.options)||s.options.length<1||s.options.length>16)return!1;let p=new Set;for(let l of s.options){if(!qt(l)||!it(l,["value","label"])||!to(l.value)||!eo(l.label)||p.has(l.value))return!1;p.add(l.value)}if(!p.has(s.value))return!1}return!0};var no=["{id}","{segment}","{segments+}"];var br=new Set(no);var so=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var kr=new Set(so);var Ne=20000000,ye=256;var at=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,io=(e,r)=>{if(e.path!==r.path||e.readOnly!==r.readOnly)return!1;if(e.encoding==="text"||r.encoding==="text")return e.encoding==="text"&&r.encoding==="text"&&e.content===r.content;if(e.bytes.byteLength!==r.bytes.byteLength)return!1;for(let s=0;s<e.bytes.byteLength;s+=1)if(e.bytes[s]!==r.bytes[s])return!1;return!0};var ao=/^[A-Za-z0-9_-]{1,80}$/;var co=["left","right","top","bottom"];var lo=(e,r=0,s={remaining:16000})=>{if(--s.remaining<0||r>=32)return!1;if(e===null)return!0;let p=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let l of p)if(!lo(l,r+1,s))return!1;return!0},ct=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((r)=>/^(0|[1-9]\d*)$/.test(r)&&Number(r)<e.length)&&e.every(ct);if(Object(e)===e){let r=Object.getPrototypeOf(e);return(r===null||r===Object.prototype)&&Object.values(e).every(ct)}return String(e)===e||Number.isFinite(e)},dt=(e)=>{try{if(String(e.id)!==e.id||!ao.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!co.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!lo(e.data)||!ct(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var _o=/^[0-9a-f]{7,64}$/i,po=(e)=>_o.test(e),lt=255,Eo=(e,r,s)=>({openCommit:(p)=>po(p)?e({channel:T,v:S,type:"open-commit",id:r(),payload:{sha:p}}):s("Commit id must be 7 to 64 hex characters."),openWalkthrough:({base:p})=>{let l=p.trim();if(!l||l.length>lt)return s(`Base must contain 1 to ${lt} characters.`);return e({channel:T,v:S,type:"open-walkthrough",id:r(),payload:{base:l}})}});var pt=2000;var To=["file","directory","other","missing"],Et=(e)=>Boolean(e&&"sessionId"in e),ut=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var ve=500,Le=32000,So=16000,fo=128,Ao=200,Oo=2000,Ro=16000,ho=80,mo=200,Io=16000;var xo=2000;var Tt=20000,Pe=1024,we=2000000;var Ge=64000,De=8000,St=4000;var ft=960000;var go=999,Co=1e4,Ie=500,bo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Uo=["stopped","starting","ready","failed"],zo=new Set(bo),ko=(e)=>zo.has(e),Mo=(e)=>e&&ko(e)?e:"HOST_REJECTED",fe=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(fe);if(Object(e)===e)return Object.values(e).every(fe);return!1},No=(e)=>fe(e)&&JSON.stringify(e).length<=Io,uo=(e)=>e?.trim().slice(0,mo)??"",Ae=(e)=>{let r=e.id.trim().slice(0,fo),s=e.title.trim().slice(0,Ao),p=e.url.trim().slice(0,Oo),l=e.text?.trim().slice(0,Ro),R=e.author?.trim().slice(0,ho),x=e.kind==="pull"?"pull":"issue",k={providerId:e.providerId.trim(),id:r,title:s||r,url:p,kind:x};if(l)k.text=l;if(R)k.author=R;if(x==="pull"){let F=uo(e.branches?.head),H=uo(e.branches?.base);if(F&&H)k.branches={head:F,base:H}}if(No(e.data))k.data=e.data;return k},At=(e)=>{let r=Ae(e);if(e.projectId)r.projectId=e.projectId;if(e.navigation)r.navigation=e.navigation;if(e.worktree)r.worktree=e.worktree;return r},Ot=(e)=>{let r={text:e.text.trim().slice(0,So)};if(e.send)r.send=!0;return r},Rt=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(go,Math.max(0,Math.round(e)))},ht=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(Co,Math.max(0,Math.ceil(e)))};var Oe=(e)=>e.length>0&&e.length<=Pe&&!e.includes("\x00")&&!e.includes("\\");var Xe=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>xo)return!1;return!e.split("/").some((s)=>s==="."||s==="..")},Yo=new Set(Uo),mt=(e)=>Boolean(e&&"status"in e&&Yo.has(String(e.status))&&!("body"in e)),He=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),It=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),xt=(e)=>Boolean(e&&"written"in e&&e.written===!0),gt=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),Jo=new Set(To),Ct=(e)=>Boolean(e&&"kind"in e&&"size"in e&&Jo.has(String(e.kind))&&Number.isFinite(e.size)),bt=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Qo=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),Zo=(e)=>Object(e)===e?e:null,_t=(e)=>String(e)===e&&e.length>0,qo=(e)=>{if(!_t(e.id))return null;if(e.ok===!0){let r={channel:T,v:S,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)r.payload=e.payload;return r}if(e.ok===!1&&_t(e.error))return{channel:T,v:S,type:"result",id:e.id,ok:!1,error:e.error,code:Mo(_t(e.code)?e.code:void 0)};return null},Ut=(e)=>{let r=Zo(e);if(!r||r.channel!==T||r.v!==S)return null;if(r.type==="result")return qo(r);if(!Qo.has(String(r.type))||Object(r.payload)!==r.payload)return null;return r};var yo=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),er=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class c extends Error{code;constructor(e,r){super(r);this.name="HostRequestError",this.code=e}}var vo=()=>Promise.reject(new c("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Ve=()=>Promise.reject(new c("BAD_PATH",`File path must be 1 to ${Pe} characters without NUL or backslash.`)),$e=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new c("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},E=(e)=>(e.value+=1,`oc-${e.value}`),kt=(e={})=>{let r=e.target??("window"in globalThis?window:null);if(!r)throw new c("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let s=e.acceptSource??((t)=>t===r.parent),p=e.requestTimeoutMs??Tt,l=new Set,R=new Set,x=new Set,k=new Set,F=new Set,H=new Set,q=new Set,Q=new Set,v=new Set,ee=new Set,Z=new Set,w=new Set,K=[],V=null,te=null,L=new Set,oe=new Set,z=null,re=null,Te=!1,ae=new Map,ce=new Map,de=new Map,M=!1,_={value:0},d=null,Y=null,_e=!1,pe=!1,me=null,N=null,f=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},u=(t)=>{r.parent.postMessage(t,"*")},W=()=>{if(M||r.parent===r||w.size===0||d?.features?.lateGenerateResults!==!0)return;u({channel:T,v:S,type:"generate-late-listen"})},h=(t,o)=>{for(let a of t)try{a(o)}catch(i){console.error(i)}},$t=(t)=>{if(!(t instanceof MessageEvent))return;if(!s(t.source))return;let o=Ut(t.data);if(!o)return;if(o.type==="workspace"){let i=ce.get(o.payload.subscriptionId);if(i)h([i],o.payload.snapshot);return}if(o.type==="shells"){let i=de.get(o.payload.subscriptionId);if(i)h([i],o.payload.snapshot);return}if(o.type==="microphone-audio"){N?.queue.push(o.payload.samples);return}if(o.type==="microphone-ended"){let i=N;if(!i)return;N=null,i.release(),h(i.endedListeners,o.payload.reason);return}if(o.type==="ready"){if(d=o.payload,Y=f(o.payload.session),h(l,o.payload),h(R,o.payload.directory),h(x,o.payload.session),Y)h(k,Y);if(h(F,o.payload.connection),h(H,o.payload.settings),h(q,o.payload.item),o.payload.block)h(Q,o.payload.block);W();return}if(o.type==="service-event"){h(v,o.payload);return}if(o.type==="generate-late"){if(w.size===0)K.push(o.payload);else h(w,o.payload);return}if(o.type==="directory"){if(d)d={...d,directory:o.payload.directory};h(R,o.payload.directory);return}if(o.type==="session"){if(d)d={...d,session:o.payload.session};if(!o.payload.session)Y=null;else if(Y?.sessionId!==o.payload.session.id)Y=f(o.payload.session);h(x,o.payload.session);return}if(o.type==="session-lifecycle"){Y=o.payload,h(k,o.payload);return}if(o.type==="connection"){if(d)d={...d,connection:o.payload.connection};h(F,o.payload.connection);return}if(o.type==="settings"){if(d)d={...d,settings:o.payload.settings};h(H,o.payload.settings);return}if(o.type==="item"){if(d)d={...d,item:o.payload.item};h(q,o.payload.item);return}if(o.type==="status-control-event"){h(ee,o.payload);return}if(o.type==="popover-closed"){h(Z,o.payload);return}if(o.type==="action"){let i=(O)=>{if(!M)u({channel:T,v:S,type:"action-result",id:o.id,payload:O})},A=te;if(!A){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>A(o.payload)).then(()=>i({ok:!0}),(O)=>{let m=(O instanceof Error?O.message:String(O)).trim();i({ok:!1,error:(m||"Action failed.").slice(0,Ie)})});return}if(o.type==="file-open"){let i=o.payload;if(re&&io(re,i))return;re=i,h(L,o.payload);return}if(o.type==="file-saved"){h(oe,o.payload.version);return}if(o.type==="file-snapshot"){let i=(m)=>{if(!M)u({channel:T,v:S,type:"file-snapshot-result",id:o.id,payload:m})},A=(m)=>i({error:(m.trim()||"Could not read the edited file.").slice(0,Ie)}),O=z;if(!O){A("This extension does not edit files.");return}Promise.resolve().then(()=>O(o.payload.purpose)).then((m)=>{if(at(m)>Ne){A(`The file is over ${Ne} ${"bytes"in m?"bytes":"characters"}.`);return}if(m.version.length>ye){A(`The snapshot version is over ${ye} characters.`);return}i({snapshot:"bytes"in m?{bytes:m.bytes,version:m.version}:{content:m.content,version:m.version}})},(m)=>A(m instanceof Error?m.message:String(m)));return}if(o.type==="resolve"){let i=(O)=>{u({channel:T,v:S,type:"resolve-result",id:o.id,payload:O})},A=V;if(!A){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>A(o.payload)).then((O)=>i({item:O?Ae(O):null}),(O)=>{let m=(O instanceof Error?O.message:String(O)).trim();i({error:(m||"Command failed.").slice(0,Ie)})});return}let a=ae.get(o.id);if(!a)return;if(clearTimeout(a.timer),ae.delete(o.id),o.ok){a.resolve(o.payload);return}a.reject(new c(o.code,o.error))};r.addEventListener("message",$t),u({channel:T,v:S,type:"hello"});let y=(t,o=p)=>{if(M||r.parent===r)return Promise.reject(new c("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((a,i)=>{let A=setTimeout(()=>{ae.delete(t.id),i(new c("HOST_TIMEOUT","Host did not answer in time."))},o);ae.set(t.id,{resolve:a,reject:i,timer:A}),u(t)})},U=(t)=>y(t).then(()=>{return}),g={channel:T,v:S},Je=(t)=>{if(!M&&r.parent!==r)u(t)},Bt=()=>Je({...g,type:"file-save"}),Qe=()=>{if(!M&&r.parent!==r)u({...g,type:"microphone-close",id:E(_)})},Fo=async()=>{if(N)throw new c("HOST_REJECTED","The microphone is already open in this frame.");if(d?.features?.microphone!==!0)throw new c("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let t=globalThis.AudioContext;if(typeof t!=="function")throw new c("UNSUPPORTED","This frame has no Web Audio.");let o=new t;if(o.sampleRate<rt||o.sampleRate>nt)throw o.close().catch(()=>{return}),new c("UNSUPPORTED",`Audio at ${o.sampleRate} Hz is not supported.`);let a=o.state==="suspended"?o.resume().catch(()=>{return}):void 0,i=Zt(Math.round(o.sampleRate/4)),A=o.createScriptProcessor(1024,1,1);A.onaudioprocess=(j)=>i.pull(j.outputBuffer.getChannelData(0));let O=o.createMediaStreamDestination();A.connect(O);let m=new Set,Se={queue:i,endedListeners:m,release:()=>{A.onaudioprocess=null,A.disconnect(),i.clear();for(let j of O.stream.getTracks())j.stop();o.close().catch(()=>{return})}};N=Se;try{let j=await y({...g,type:"microphone-open",id:E(_),payload:{sampleRate:o.sampleRate}},st);if(!j||!("opened"in j)||j.opened!==!0)throw new c("HOST_REJECTED","Host did not open the microphone.");if(await a,N!==Se)throw new c("DISCONNECTED","The microphone closed while it was opening.")}catch(j){if(N===Se)N=null;throw Se.release(),Qe(),j}return{stream:O.stream,close:()=>{if(N!==Se)return;N=null,Se.release(),Qe()},onEnded:(j)=>(m.add(j),()=>{m.delete(j)})}},Ft=(t)=>{if(!yo(t)||!er(t))return;t.preventDefault(),Bt()},Kt=(t)=>{if(!yo(t)||t.key!=="Escape"||d?.surface!=="popover"||!d.popover)return;t.preventDefault(),Yt(d.popover.id,"escape").catch(()=>{return})},Ce=()=>{let t=d?.surface==="popover"?d.popover:void 0;if(!t)return;let o=_e||pe;if(me===o)return;me=o,Jt(t.id,o).catch(()=>{return})},be=()=>{if(d?.surface!=="popover"||_e)return;_e=!0,Ce()},Wt=(t)=>{if(d?.surface!=="popover"||t.relatedTarget!==null||!_e)return;_e=!1,Ce()},jt=()=>{if(d?.surface!=="popover"||pe)return;pe=!0,Ce()},zt=()=>{if(d?.surface!=="popover"||!pe)return;pe=!1,Ce()},J=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new c("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},Ze=async(t)=>{if(t.kind!=="projects")J(t.projectId);let o=await y({...g,type:"workspace-read",id:E(_),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new c("HOST_REJECTED","Host did not return workspace data.");return o},qe=async(t,o)=>{if(t.kind!=="projects")J(t.projectId);let a=E(_);ce.set(a,o);try{await U({...g,type:"workspace-subscribe",id:E(_),payload:{subscriptionId:a,query:t}})}catch(i){if(ce.delete(a),!M)u({...g,type:"workspace-unsubscribe",id:E(_),payload:{subscriptionId:a}});throw i}return()=>{if(!ce.delete(a)||M)return;u({...g,type:"workspace-unsubscribe",id:E(_),payload:{subscriptionId:a}})}},Ko=async(t,o)=>{if(t.kind==="session")J(t.sessionId);if(t.kind==="project")J(t.projectId);let a=E(_);de.set(a,o);try{await U({...g,type:"shells-subscribe",id:E(_),payload:{subscriptionId:a,scope:t}})}catch(i){if(de.delete(a),!M)u({...g,type:"shells-unsubscribe",id:E(_),payload:{subscriptionId:a}});throw i}return()=>{if(!de.delete(a)||M)return;u({...g,type:"shells-unsubscribe",id:E(_),payload:{subscriptionId:a}})}},Ue=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>tt))throw new c("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!fe(t.value))throw new c("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>ot)throw new c("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&d?.features?.deviceStorage!==!0)throw new c("UNSUPPORTED","This host does not support device storage.");let o=await y({...g,type:"storage",id:E(_),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new c("HOST_REJECTED","Host did not return storage data.");return o},Yt=(t,o)=>d?.features?.popovers!==!0&&!(d?.surface==="popover"&&d.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):U({...g,type:"popover-close",id:E(_),payload:o?{id:t,reason:o}:{id:t}}),Jt=(t,o)=>d?.features?.popovers!==!0&&!(d?.surface==="popover"&&d.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):U({...g,type:"popover-anchor",id:E(_),payload:{id:t,active:o}});return r.addEventListener("keydown",Kt,!0),r.addEventListener("pointerover",be),r.addEventListener("pointermove",be),r.addEventListener("pointerout",Wt),r.addEventListener("focus",jt),r.addEventListener("blur",zt),{onAction:(t)=>(te=t,()=>{if(te===t)te=null}),listProjects:async()=>{let t=await Ze({kind:"projects"});if(t.kind!=="projects")throw new c("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await Ze({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new c("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await Ze({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new c("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>qe({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>qe({kind:"worktrees",projectId:t},(a)=>{if(a.kind==="worktrees")o(a)}),onSessions:(t,o)=>qe({kind:"sessions",projectId:t},(a)=>{if(a.kind==="sessions")o(a)}),onRunningShells:(t,o)=>Ko(t,o),readShellOutput:async(t,o)=>{J(t,ke);let a=o?.cursor;if(a!==void 0&&(!Number.isInteger(a)||a<0))throw new c("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>Me))throw new c("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${Me}.`);let O=await y({...g,type:"shell-output",id:E(_),payload:{shellId:t,cursor:a,tailBytes:i}});if(!O||typeof O.output!=="string"||!Number.isFinite(O.cursor))throw new c("HOST_REJECTED","Host did not return shell output.");return O},stopShell:async(t)=>{if(J(t,ke),(await y({...g,type:"shell-stop",id:E(_),payload:{shellId:t}}))?.stopped!==!0)throw new c("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{J(t),await U({...g,type:"open-session",id:E(_),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let a=$e(o),i={op:"get",key:t};if(a)i.scope=a;let A=await Ue(i);return A.op==="get"&&A.found?A.value:void 0},set:async(t,o,a)=>{let i=$e(a),A={op:"set",key:t,value:o};if(i)A.scope=i;await Ue(A)},delete:async(t,o)=>{let a=$e(o),i={op:"delete",key:t};if(a)i.scope=a;await Ue(i)},keys:async(t)=>{let o=$e(t),a={op:"keys"};if(o)a.scope=o;let i=await Ue(a);if(i.op!=="keys")throw new c("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(l.add(t),d)t(d);return()=>{l.delete(t)}},onDirectory:(t)=>{if(R.add(t),d)t(d.directory);return()=>{R.delete(t)}},onSession:(t)=>{if(x.add(t),d)t(d.session);return()=>{x.delete(t)}},onSessionLifecycle:(t)=>{if(k.add(t),Y)t(Y);return()=>{k.delete(t)}},onConnection:(t)=>{if(F.add(t),d)t(d.connection);return()=>{F.delete(t)}},onSettings:(t)=>{if(H.add(t),d)t(d.settings);return()=>{H.delete(t)}},onItem:(t)=>{if(q.add(t),d)t(d.item);return()=>{q.delete(t)}},onBlock:(t)=>{if(Q.add(t),d?.block)t(d.block);return()=>{Q.delete(t)}},onServiceEvent:(t)=>(v.add(t),()=>{v.delete(t)}),onStatusControl:(t)=>(ee.add(t),()=>{ee.delete(t)}),onPopoverClosed:(t)=>(Z.add(t),()=>{Z.delete(t)}),setStatusControls:(t)=>{if(d?.features?.statusControls!==!0)return Promise.reject(new c("UNSUPPORTED","This host does not support status controls."));if(!ro(t))return Promise.reject(new c("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return U({...g,type:"status-controls",id:E(_),payload:{controls:t}})},openPopover:(t)=>{if(d?.features?.popovers!==!0)return Promise.reject(new c("UNSUPPORTED","This host does not support popovers."));if(!dt(t))return Promise.reject(new c("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return U({...g,type:"popover-open",id:E(_),payload:t})},closePopover:Yt,setPopoverAnchorActive:Jt,onResolve:(t)=>(V=t,()=>{if(V===t)V=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>ve)return Promise.reject(new c("HOST_REJECTED",`Toast message must contain 1 to ${ve} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Le))return Promise.reject(new c("HOST_REJECTED",`Toast copy text must contain 1 to ${Le} characters.`));return U({channel:T,v:S,type:"toast",id:E(_),payload:{...t,message:o}})},openUrl:(t)=>U({channel:T,v:S,type:"open-url",id:E(_),payload:{url:t}}),...Eo(U,()=>E(_),(t)=>Promise.reject(new c("HOST_REJECTED",t))),answerBlock:(t)=>U({channel:T,v:S,type:"block-answer",id:E(_),payload:{text:t.trim().slice(0,pt)}}),openSurface:(t)=>U({channel:T,v:S,type:"open-surface",id:E(_),payload:{surfaceId:t}}),writeClipboard:(t)=>U({channel:T,v:S,type:"clipboard-write",id:E(_),payload:{text:t}}),compose:(t)=>U({channel:T,v:S,type:"compose",id:E(_),payload:t}),attach:(t)=>U({channel:T,v:S,type:"attach",id:E(_),payload:Ae(t)}),startSession:async(t)=>{if(t.projectId!==void 0)J(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")J(o.directory);else{if(o.name!==void 0)J(o.name,200);if(o.baseBranch!==void 0)J(o.baseBranch,200)}let a=await y({channel:T,v:S,type:"start-session",id:E(_),payload:At(t)},e.requestTimeoutMs??180000);if(!Et(a))throw new c("HOST_REJECTED","Host did not return a session.");return a},prompt:(t)=>y({channel:T,v:S,type:"prompt",id:E(_),payload:Ot(t)}).then((o)=>{if(!ut(o))throw new c("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>U({channel:T,v:S,type:"session-link",id:E(_),payload:Ae(t)}),close:()=>U({channel:T,v:S,type:"close",id:E(_)}),oauthStart:()=>U({channel:T,v:S,type:"oauth-start",id:E(_)}),oauthDisconnect:()=>U({channel:T,v:S,type:"oauth-disconnect",id:E(_)}),request:(t)=>(Xe(t.path)?y({channel:T,v:S,type:"request",id:E(_),payload:t}):vo()).then((o)=>{if(!He(o))throw new c("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(Xe(t.path)?y({channel:T,v:S,type:"service-request",id:E(_),payload:t}):vo()).then((o)=>{if(!He(o))throw new c("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>y({channel:T,v:S,type:"service-status",id:E(_)}).then((t)=>{if(!mt(t))throw new c("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(Oe(t)?y({channel:T,v:S,type:"file-read",id:E(_),payload:{path:t}}):Ve()).then((o)=>{if(!It(o))throw new c("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!Oe(t))return Ve();if(o.length>we)return Promise.reject(new c("FILE_TOO_LARGE",`Content is over ${we} characters.`));return y({channel:T,v:S,type:"file-write",id:E(_),payload:{path:t,content:o}}).then((a)=>{if(!xt(a))throw new c("HOST_REJECTED","Host did not confirm the write.");return a})},listDir:(t)=>(Oe(t)?y({channel:T,v:S,type:"file-list",id:E(_),payload:{path:t}}):Ve()).then((o)=>{if(!gt(o))throw new c("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(Oe(t)?y({channel:T,v:S,type:"file-stat",id:E(_),payload:{path:t}}):Ve()).then((o)=>{if(!Ct(o))throw new c("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),a=t.system?.trim();if(o.length===0||o.length>Ge)return Promise.reject(new c("HOST_REJECTED",`Prompt must be 1 to ${Ge} characters.`));if(a!==void 0&&(a.length===0||a.length>De))return Promise.reject(new c("HOST_REJECTED",`System prompt must be 1 to ${De} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(St,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new c("HOST_REJECTED","maxOutputTokens must be a number."));let A={prompt:o};if(a!==void 0)A.system=a;if(i!==void 0)A.maxOutputTokens=i;return y({channel:T,v:S,type:"generate",id:E(_),payload:A},e.requestTimeoutMs??ft).then((O)=>{if(!bt(O))throw new c("HOST_REJECTED","Host did not return generated text.");return O})},onLateGenerateResult:(t)=>{w.add(t);for(let o of K.splice(0))h([t],o);return W(),()=>{w.delete(t)}},openMicrophone:Fo,setBadge:(t)=>U({channel:T,v:S,type:"badge",id:E(_),payload:{count:Rt(t)}}),setHeight:(t)=>U({channel:T,v:S,type:"resize",id:E(_),payload:{height:ht(t)}}),onFileOpen:(t)=>{if(L.add(t),!Te)Te=!0,r.addEventListener("keydown",Ft,!0);if(re)t(re);return()=>{L.delete(t)}},onFileSnapshot:(t)=>(z=t,()=>{if(z===t)z=null}),onFileSaved:(t)=>(oe.add(t),()=>{oe.delete(t)}),reportFileChange:(t)=>Je({...g,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Bt,reportFileUnsupported:()=>Je({...g,type:"file-unsupported"}),dispose:()=>{for(let t of ce.keys())u({...g,type:"workspace-unsubscribe",id:E(_),payload:{subscriptionId:t}});ce.clear();for(let t of de.keys())u({...g,type:"shells-unsubscribe",id:E(_),payload:{subscriptionId:t}});if(de.clear(),N)Qe(),N.release(),N=null;if(M=!0,V=null,te=null,z=null,L.clear(),oe.clear(),Te)r.removeEventListener("keydown",Ft,!0);r.removeEventListener("message",$t),r.removeEventListener("keydown",Kt,!0),r.removeEventListener("pointerover",be),r.removeEventListener("pointermove",be),r.removeEventListener("pointerout",Wt),r.removeEventListener("focus",jt),r.removeEventListener("blur",zt);for(let t of ae.values())clearTimeout(t.timer),t.reject(new c("HOST_UNAVAILABLE","Host client was disposed."));ae.clear(),l.clear(),R.clear(),x.clear(),k.clear(),F.clear(),H.clear(),q.clear(),Q.clear(),v.clear(),ee.clear(),Z.clear(),w.clear(),K.length=0}}};var Lo=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Yr=new Set(Lo);var Po=["none","agent","user"];var Qr=new Set(Po);var tr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],or=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],wo=(e,r)=>{r.style.colorScheme=e.mode;for(let[s,p]of tr)r.style.setProperty(s,e.tokens[p]);for(let[s,p,l]of or){let R=e.tokens[l]??"";r.style.setProperty(s,R),r.style.setProperty(p,R)}r.style.setProperty("font-family",e.tokens.font),r.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),r.style.setProperty("line-height","1.45"),r.style.setProperty("color",e.tokens.foreground)},Mt=(e,r)=>{if(wo(e.theme,r),r.dataset)r.dataset.ocSurface=e.surface,r.dataset.ocTheme=e.theme.mode};var rr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},I=(e,r)=>`var(--${e}, var(--oc-${rr[e]}, ${r}))`,se=I("surface-background","transparent"),Fe=I("surface-elevated","transparent"),Re=I("surface-elevated-foreground","inherit"),B=I("surface-foreground","inherit"),C=I("surface-muted-foreground","gray"),nr=I("surface-muted","transparent"),Ee=I("interactive-border","currentColor"),G=I("interactive-hover","transparent"),ue=I("interactive-active","transparent"),Nt=I("interactive-selection","transparent"),yt=I("interactive-selection-foreground","inherit"),ne=I("primary","currentColor"),vt=I("primary-text","inherit"),Lt=I("error-text","inherit"),sr=I("font-sans","inherit"),Pt=I("font-mono","monospace"),Ho=I("radius","9px"),wt=`calc(${Ho} - 2px)`,Go=`calc(${Ho} - 4px)`,b=(e,r,s="transparent")=>`color-mix(in srgb, ${e} ${r}%, ${s})`,Do=`background-image: linear-gradient(${G}, ${G});`,Gt=(e,r="0.5px")=>`box-shadow: inset 0 0 0 ${r} ${e}, var(--oc-sdk-field-lift);`,Dt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Xo="box-shadow: var(--oc-sdk-lit);",Xt=`inset 0 0.5px 0 0 ${b(B,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,ir=`
:root {
  --oc-sdk-edge: ${b(B,16)};
  --oc-sdk-field-bg: ${Fe};
  --oc-sdk-raised-bg: ${se};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${b(B,14)};
  --oc-sdk-field-bg: ${b(se,50,Fe)};
  --oc-sdk-raised-bg: ${Fe};
  --oc-sdk-field-lift: ${Xt};
  --oc-sdk-raised-lift: ${Xt};
  --oc-sdk-lit: ${Xt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Be=(e)=>{let r=I(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${r}; --oc-sdk-tone-text: ${I(`${e}-text`,"inherit")}; }`},n=(e)=>`calc(${e}rem / 14)`,ar=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: ${n(8)}; height: ${n(32)}; padding: 0 ${n(12)}; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: ${n(6)}; height: ${n(28)}; padding: 0 ${n(10)}; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: ${n(4)}; height: ${n(24)}; padding: 0 ${n(8)}; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: ${n(14)}; height: ${n(14)}; }

.oc-sdk-field { display: flex; flex-direction: column; gap: ${n(4)}; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: ${n(32)}; padding: 0 ${n(10)}; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: ${n(8)} ${n(10)}; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: ${n(34)}; padding-right: ${n(34)}; }
.oc-sdk-search-icon { position: absolute; left: ${n(11)}; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: ${n(6)}; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: ${n(24)}; height: ${n(24)}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: ${n(4)}; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: ${n(6)}; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: ${n(28)}; padding: 0 ${n(10)}; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: ${n(2)}; min-width: ${n(160)}; max-width: calc(100vw - ${n(16)}); max-height: min(${n(320)}, calc(100vh - ${n(16)})); overflow: auto; padding: ${n(4)}; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: ${n(2)} ${n(2)} ${n(4)}; }
.oc-sdk-popup-search .oc-sdk-input { height: ${n(28)}; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: ${n(8)}; width: 100%; padding: ${n(6)} ${n(8)}; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: ${n(14)}; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: ${n(8)}; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: ${n(8)}; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: ${n(14)}; height: ${n(14)}; margin-top: ${n(3)}; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: ${n(36)}; height: ${n(20)}; --oc-sdk-thumb-travel: ${n(16)}; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: ${n(2)}; left: ${n(2)}; width: ${n(16)}; height: ${n(16)}; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: ${n(2)}; padding: ${n(2)}; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: ${n(6)}; height: ${n(28)}; padding: 0 ${n(10)}; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: ${n(1)} ${n(6)}; font-size: ${n(11)}; font-weight: 500; line-height: ${n(16)}; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: ${n(8)}; width: 100%; padding: ${n(6)} ${n(8)}; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: ${n(64)}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: ${n(16)} ${n(8)}; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${n(4)}; padding: ${n(40)} ${n(16)}; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: ${n(12)}; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: ${n(8)}; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: ${n(16)}; height: ${n(16)}; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: ${n(12)}; height: ${n(12)}; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: ${n(12)}; padding: ${n(8)} ${n(12)}; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: ${n(2)}; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: ${n(8)}; width: 100%; margin: ${n(8)} 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: ${n(4)} 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: ${n(4)}; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: ${n(6)}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: ${n(2)}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: ${n(8)} 0; }

/* Under a finger the controls reach the app's touch sizes: rows and options 44px like its sheets, every other
   control at least 36px. Inputs keep 16px text, below which iOS zooms the page on focus. */
@media (pointer: coarse) {
  .oc-sdk-btn, .oc-sdk-input { height: ${n(40)}; }
  .oc-sdk-btn[data-size="sm"], .oc-sdk-btn[data-size="xs"], .oc-sdk-trigger, .oc-sdk-tab, .oc-sdk-popup-search .oc-sdk-input { height: ${n(36)}; }
  .oc-sdk-input, .oc-sdk-popup-search .oc-sdk-input { font-size: max(16px, 0.875rem); }
  .oc-sdk-search-clear { width: ${n(36)}; height: ${n(36)}; right: 0; }
  .oc-sdk-row, .oc-sdk-option { min-height: ${n(44)}; }
  .oc-sdk-check { min-height: ${n(36)}; padding: ${n(8)} 0; }
}
`,Vo=`${ir}
.oc-sdk { color: ${B}; font-family: ${sr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Do} }
.oc-sdk-mono { font-family: ${Pt}; }
.oc-sdk-muted { color: ${C}; }
${Be("success")}${Be("warning")}${Be("error")}${Be("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ne}; --oc-sdk-tone-text: ${vt}; }

.oc-sdk-btn { border-radius: ${wt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Go}; }
.oc-sdk-btn[data-variant="default"] { color: ${vt}; background: ${b(ne,10,se)}; border-color: ${b(ne,12)}; ${Xo} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${b(ne,16,se)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${b(ne,22,se)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${nr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${ue}, ${ue}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Re}; ${Dt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${ue}, ${ue}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${G}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${ue}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${I("status-error","red")}; color: ${Lt}; background: ${b("var(--oc-sdk-tone)",7,se)}; border-color: ${b("var(--oc-sdk-tone)",12)}; ${Xo} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${b("var(--oc-sdk-tone)",9,se)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${b("var(--oc-sdk-tone)",11,se)}; box-shadow: none; }

.oc-sdk-field-note { color: ${C}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Lt}; }
.oc-sdk-input { border-radius: ${wt}; background: var(--oc-sdk-field-bg); color: ${Re}; ${Gt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${C}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Gt(b(B,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Gt(I("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Pt}; }

.oc-sdk-search-icon { color: ${C}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ne}; }
.oc-sdk-search-clear { border-radius: ${Go}; color: ${C}; }
.oc-sdk-search-clear:hover { background: ${G}; color: ${B}; }

.oc-sdk-trigger { border-radius: ${wt}; background: var(--oc-sdk-raised-bg); color: ${Re}; ${Dt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${ue}, ${ue}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${C}; }
.oc-sdk-trigger-chevron { color: ${C}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Re}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Fe}; background-clip: padding-box; color: ${Re}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${G}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Nt}; color: ${yt}; }
.oc-sdk-option-check { color: ${B}; }
.oc-sdk-option[data-destructive="true"] { color: ${Lt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${b(I("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${C}; }
.oc-sdk-popup-empty { color: ${C}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Ee}; border-radius: 4px; color: ${B}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${b(B,60,Ee)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Ee}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${se}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ne}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Do} }
.oc-sdk-check-desc { color: ${C}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${b(B,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${C}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${B}; }
.oc-sdk-tab[aria-selected="true"] { color: ${yt}; background: ${Nt}; border-color: ${Ee}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Re}; background: var(--oc-sdk-raised-bg); ${Dt} }
.oc-sdk-tab-count { color: ${C}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${b(B,6)}; color: ${C}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${b("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${G}; }
.oc-sdk-row[aria-selected="true"] { background: ${Nt}; color: ${yt}; }
.oc-sdk-row-lead { font-family: ${Pt}; color: ${C}; }
.oc-sdk-row-sub { color: ${C}; }
.oc-sdk-row-meta { color: ${C}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${C}; }

.oc-sdk-empty-body { color: ${C}; }

.oc-sdk-spinner { color: ${C}; }
.oc-sdk-spinner-ring { border-color: ${Ee}; border-top-color: ${ne}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${b("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${C}; }

.oc-sdk-separator { color: ${C}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${b(Ee,40)}; }

.oc-sdk-progress-label { color: ${C}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${b(B,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ne}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${I("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${I("success-text","inherit")}; }

.oc-sdk-text a { color: ${vt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${b(Ee,60)}; }
`,P=`
${et}
${ar}
${Vo}`;var Ye=kt(),le=document.querySelector("#root"),$o='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',pr='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',Er=(e)=>{if(!e)return"";let r=Math.round(e/1000);return`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`},ge=(e)=>{let r=document.createElement("div");return r.className="note",r.textContent=e,r},Bo="",Vt=async(e,r)=>{let s=await Ye.serviceRequest({method:"GET",path:e,query:r});try{return JSON.parse(String(s.body??"{}"))}catch{return{}}},ur=async(e)=>{let r=await Vt("/search",{q:e});return{results:r?.results??[],error:r?.error}},Tr=async(e)=>{let r=await Vt("/audio",{id:e,quality:"medium"});if(!r?.dataUrl)throw Error(r?.error??"拿不到音频");let s=atob(r.dataUrl.slice(r.dataUrl.indexOf(",")+1)),p=new Uint8Array(s.length);for(let l=0;l<s.length;l+=1)p[l]=s.charCodeAt(l);return p},Sr=async(e)=>{le.replaceChildren(ge("正在搜索…"));let r=[];try{r=(await ur(e)).results}catch(f){le.replaceChildren(ge(`搜索失败：${f.message}`));return}if(r.some((f)=>!f.playable))try{let f=await Vt("/me");if(f?.loggedIn&&f?.user?.isVip)r=r.map((u)=>({...u,playable:!0}))}catch{}let s=r.filter((f)=>f.playable);if(!r.length){le.replaceChildren(ge(`汽水上没搜到「${e}」`));return}if(!s.length){le.replaceChildren(ge(`「${e}」的版本都要会员才能播`));return}let p=s[0],l=document.createElement("div");l.className="card";let R=document.createElement("div");R.className="veil";let x=document.createElement("img");if(x.className="cover",x.alt="",x.hidden=!p.cover,p.cover)x.src=p.cover;let k=document.createElement("div");k.className="meta";let F=document.createElement("div");F.className="title";let H=document.createElement("div");H.className="artist";let q=document.createElement("div");q.className="bar";let Q=document.createElement("i");q.append(Q),k.append(F,H,q);let v=document.createElement("button");v.className="play",v.type="button",v.innerHTML=$o,v.title="播放";let ee=document.createElement("div");ee.className="row";let Z=document.createElement("div");Z.className="chips",ee.append(x,k,v),l.append(R,ee,Z),le.replaceChildren(l);let w=null,K=null,V=null,te=0,L=0,oe=!1,z=null,re=!1,Te=()=>{if(!w){let f=window.AudioContext??window.webkitAudioContext;if(!f)throw Error("这个环境不支持音频");w=new f}return w},ae=()=>{let f=Te();if(f.state!=="running")f.resume();return f},ce=()=>{if(!w||!oe)return L;return L+(w.currentTime-te)},de=()=>{let f=(K?.duration??0)||p.duration/1000;if(f>0)Q.style.width=`${Math.min(100,ce()/f*100)}%`},M=(f)=>{if(oe=f,v.innerHTML=f?pr:$o,v.title=f?"暂停":"播放",f){if(z===null)z=window.setInterval(de,250)}else if(z!==null)clearInterval(z),z=null},_=()=>{if(!V)return;V.onended=null;try{V.stop()}catch{}V=null},d=()=>{_(),L=0,M(!1),Q.style.width="0%"},Y=()=>{if(!K)return;let f=Te(),u=f.createBufferSource();u.buffer=K,u.connect(f.destination),u.onended=()=>{if(V!==u)return;V=null,L=0,M(!1),Q.style.width="0%"},u.start(0,L),V=u,te=f.currentTime,M(!0)},_e=()=>{if(!oe)return;if(w)L=Math.max(0,L+(w.currentTime-te));_(),M(!1)},pe=async()=>{if(oe){_e();return}if(re)return;re=!0,v.classList.add("busy");let f=ae();try{if(L>0&&K&&L>=K.duration-0.2)L=0;if(!K){let u=await Tr(p.id);K=await f.decodeAudioData(u.buffer.slice(u.byteOffset,u.byteOffset+u.byteLength))}Y()}catch(u){let W=u.message;H.textContent=/会员|没有可播|过大|解码|不支持/.test(W)?W:`播放失败：${W||"音源解码失败"}`}finally{re=!1,v.classList.remove("busy")}};v.addEventListener("click",()=>void pe());let me=()=>{if(F.textContent=p.title,H.textContent=[p.artist,Er(p.duration)].filter(Boolean).join(" · "),p.cover)x.src=p.cover,R.style.backgroundImage=`url("${p.cover}")`,x.hidden=!1,l.classList.remove("plain");else x.removeAttribute("src"),x.hidden=!0,R.style.backgroundImage="",l.classList.add("plain");Q.style.width="0%"},N=()=>{Z.replaceChildren();let f=s.length>1;if(Z.hidden=!f,ee.classList.toggle("tight",!f),!f)return;for(let u of s.slice(0,4)){let W=document.createElement("button");W.type="button",W.textContent=u.artist?`${u.title} · ${u.artist}`:u.title,W.setAttribute("aria-pressed",String(u.id===p.id)),W.addEventListener("click",()=>{if(u.id===p.id)return;d(),K=null,p=u,me(),N()}),Z.append(W)}};me(),N()};Ye.onReady((e)=>Mt(e,document.documentElement));Ye.onBlock(({args:e})=>{let r=e??{},s=String(r.query??Object.values(r)[0]??"").trim();if(!s){le.replaceChildren(ge("没有给歌名"));return}if(s===Bo)return;Bo=s,Sr(s)});new ResizeObserver(()=>{Ye.setHeight(Math.ceil(le.getBoundingClientRect().height))}).observe(le);})();
