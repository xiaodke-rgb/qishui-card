(()=>{var p="openchamber.sdk",u=1;var tt=`
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
`;function eo(e){let r=e.documentElement;if(r.hasAttribute("data-oc-scrollbar-activity"))return;r.setAttribute("data-oc-scrollbar-activity","");let s=new WeakMap;e.addEventListener("scroll",(T)=>{let l=T.target===e?r:T.target;if(!(l instanceof Element))return;if(!l.hasAttribute("data-oc-scrolling"))l.setAttribute("data-oc-scrolling","");let S=s.get(l);if(S!==void 0)clearTimeout(S);s.set(l,setTimeout(()=>{s.delete(l),l.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var Jo=`(${eo.toString()})(document);`;var ot=128,rt=65536;var be=128;var ke=65536;var nt=8000,st=192000,it=120000;var to=(e)=>{let r=[],s=0,T=0;return{push:(l)=>{r.push(l),T+=l.length;while(T-s>e&&r.length>1){let S=r.shift();T-=S?.length??0,s=0}},pull:(l)=>{let S=0;while(S<l.length&&r.length>0){let C=r[0],f=Math.min(l.length-S,C.length-s);if(l.set(C.subarray(s,s+f),S),S+=f,s+=f,s>=C.length)r.shift(),T-=C.length,s=0}l.fill(0,S)},clear:()=>{r.length=0,s=0,T=0},get size(){return T-s}}};var so=/^[a-z][a-z0-9-]{0,39}$/;var oo=(e)=>Object(e)===e&&!Array.isArray(e),at=(e,r)=>Object.keys(e).every((s)=>r.includes(s)),ro=(e)=>String(e)===e&&e.length>=1&&e.length<=60,no=(e)=>String(e)===e&&e.length>=1&&e.length<=80,io=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let r=new Set;for(let s of e){if(!oo(s)||!so.test(s.id)||!ro(s.label))return!1;if(s.disabled!==void 0&&s.disabled!==!0&&s.disabled!==!1)return!1;if(r.has(s.id))return!1;if(r.add(s.id),s.kind==="button"){if(!at(s,["kind","id","label","disabled"]))return!1;continue}if(s.kind!=="select"||!at(s,["kind","id","label","value","options","disabled"]))return!1;if(!no(s.value)||!Array.isArray(s.options)||s.options.length<1||s.options.length>16)return!1;let T=new Set;for(let l of s.options){if(!oo(l)||!at(l,["value","label"])||!no(l.value)||!ro(l.label)||T.has(l.value))return!1;T.add(l.value)}if(!T.has(s.value))return!1}return!0};var ao=["{id}","{segment}","{segments+}"];var Ur=new Set(ao);var co=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var kr=new Set(co);var Me=20000000,Ne=256;var ct=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,lo=(e,r)=>{if(e.path!==r.path||e.readOnly!==r.readOnly)return!1;if(e.encoding==="text"||r.encoding==="text")return e.encoding==="text"&&r.encoding==="text"&&e.content===r.content;if(e.bytes.byteLength!==r.bytes.byteLength)return!1;for(let s=0;s<e.bytes.byteLength;s+=1)if(e.bytes[s]!==r.bytes[s])return!1;return!0};var _o=/^[A-Za-z0-9_-]{1,80}$/;var Eo=["left","right","top","bottom"];var po=(e,r=0,s={remaining:16000})=>{if(--s.remaining<0||r>=32)return!1;if(e===null)return!0;let T=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let l of T)if(!po(l,r+1,s))return!1;return!0},dt=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((r)=>/^(0|[1-9]\d*)$/.test(r)&&Number(r)<e.length)&&e.every(dt);if(Object(e)===e){let r=Object.getPrototypeOf(e);return(r===null||r===Object.prototype)&&Object.values(e).every(dt)}return String(e)===e||Number.isFinite(e)},lt=(e)=>{try{if(String(e.id)!==e.id||!_o.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Eo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!po(e.data)||!dt(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var uo=/^[0-9a-f]{7,64}$/i,To=(e)=>uo.test(e),_t=255,So=(e,r,s)=>({openCommit:(T)=>To(T)?e({channel:p,v:u,type:"open-commit",id:r(),payload:{sha:T}}):s("Commit id must be 7 to 64 hex characters."),openWalkthrough:({base:T})=>{let l=T.trim();if(!l||l.length>_t)return s(`Base must contain 1 to ${_t} characters.`);return e({channel:p,v:u,type:"open-walkthrough",id:r(),payload:{base:l}})}});var pt=2000;var Ao=["file","directory","other","missing"],ut=(e)=>Boolean(e&&"sessionId"in e),Tt=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var ye=500,Le=32000,Oo=16000,Ro=128,ho=200,mo=2000,Io=16000,xo=80,go=200,Co=16000;var Uo=2000;var St=20000,ve=1024,Pe=2000000;var we=64000,Ge=8000,ft=4000;var At=960000;var bo=999,ko=1e4,Te=500,Mo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],No=["stopped","starting","ready","failed"],Qo=new Set(Mo),yo=(e)=>Qo.has(e),Lo=(e)=>e&&yo(e)?e:"HOST_REJECTED",ne=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(ne);if(Object(e)===e)return Object.values(e).every(ne);return!1},vo=(e)=>ne(e)&&JSON.stringify(e).length<=Co,fo=(e)=>e?.trim().slice(0,go)??"",se=(e)=>{let r=e.id.trim().slice(0,Ro),s=e.title.trim().slice(0,ho),T=e.url.trim().slice(0,mo),l=e.text?.trim().slice(0,Io),S=e.author?.trim().slice(0,xo),C=e.kind==="pull"?"pull":"issue",f={providerId:e.providerId.trim(),id:r,title:s||r,url:T,kind:C};if(l)f.text=l;if(S)f.author=S;if(C==="pull"){let b=fo(e.branches?.head),k=fo(e.branches?.base);if(b&&k)f.branches={head:b,base:k}}if(vo(e.data))f.data=e.data;return f},Ot=(e)=>{let r=se(e);if(e.projectId)r.projectId=e.projectId;if(e.navigation)r.navigation=e.navigation;if(e.worktree)r.worktree=e.worktree;return r},Rt=(e)=>{let r={text:e.text.trim().slice(0,Oo)};if(e.send)r.send=!0;return r},ht=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(bo,Math.max(0,Math.round(e)))},mt=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(ko,Math.max(0,Math.ceil(e)))};var ie=(e)=>e.length>0&&e.length<=ve&&!e.includes("\x00")&&!e.includes("\\");var De=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>Uo)return!1;return!e.split("/").some((s)=>s==="."||s==="..")},qo=new Set(No),It=(e)=>Boolean(e&&"status"in e&&qo.has(String(e.status))&&!("body"in e)),Xe=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),xt=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),gt=(e)=>Boolean(e&&"written"in e&&e.written===!0),Ct=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),Zo=new Set(Ao),Ut=(e)=>Boolean(e&&"kind"in e&&"size"in e&&Zo.has(String(e.kind))&&Number.isFinite(e.size)),bt=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),er=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),tr=(e)=>Object(e)===e?e:null,Et=(e)=>String(e)===e&&e.length>0,or=(e)=>{if(!Et(e.id))return null;if(e.ok===!0){let r={channel:p,v:u,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)r.payload=e.payload;return r}if(e.ok===!1&&Et(e.error))return{channel:p,v:u,type:"result",id:e.id,ok:!1,error:e.error,code:Lo(Et(e.code)?e.code:void 0)};return null},kt=(e)=>{let r=tr(e);if(!r||r.channel!==p||r.v!==u)return null;if(r.type==="result")return or(r);if(!er.has(String(r.type))||Object(r.payload)!==r.payload)return null;return r};var Po=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),rr=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class c extends Error{code;constructor(e,r){super(r);this.name="HostRequestError",this.code=e}}var wo=()=>Promise.reject(new c("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),He=()=>Promise.reject(new c("BAD_PATH",`File path must be 1 to ${ve} characters without NUL or backslash.`)),Ve=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new c("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},E=(e)=>(e.value+=1,`oc-${e.value}`),Mt=(e={})=>{let r=e.target??("window"in globalThis?window:null);if(!r)throw new c("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let s=e.acceptSource??((t)=>t===r.parent),T=e.requestTimeoutMs??St,l=new Set,S=new Set,C=new Set,f=new Set,b=new Set,k=new Set,J=new Set,Y=new Set,Re=new Set,he=new Set,me=new Set,Z=new Set,Je=[],de=null,le=null,Ie=new Set,xe=new Set,_e=null,Ee=null,Ye=!1,ee=new Map,te=new Map,oe=new Map,X=!1,_={value:0},d=null,B=null,pe=!1,ue=!1,$t=null,w=null,Ft=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},y=(t)=>{r.parent.postMessage(t,"*")},Bt=()=>{if(X||r.parent===r||Z.size===0||d?.features?.lateGenerateResults!==!0)return;y({channel:p,v:u,type:"generate-late-listen"})},R=(t,o)=>{for(let a of t)try{a(o)}catch(i){console.error(i)}},Kt=(t)=>{if(!(t instanceof MessageEvent))return;if(!s(t.source))return;let o=kt(t.data);if(!o)return;if(o.type==="workspace"){let i=te.get(o.payload.subscriptionId);if(i)R([i],o.payload.snapshot);return}if(o.type==="shells"){let i=oe.get(o.payload.subscriptionId);if(i)R([i],o.payload.snapshot);return}if(o.type==="microphone-audio"){w?.queue.push(o.payload.samples);return}if(o.type==="microphone-ended"){let i=w;if(!i)return;w=null,i.release(),R(i.endedListeners,o.payload.reason);return}if(o.type==="ready"){if(d=o.payload,B=Ft(o.payload.session),R(l,o.payload),R(S,o.payload.directory),R(C,o.payload.session),B)R(f,B);if(R(b,o.payload.connection),R(k,o.payload.settings),R(J,o.payload.item),o.payload.block)R(Y,o.payload.block);Bt();return}if(o.type==="service-event"){R(Re,o.payload);return}if(o.type==="generate-late"){if(Z.size===0)Je.push(o.payload);else R(Z,o.payload);return}if(o.type==="directory"){if(d)d={...d,directory:o.payload.directory};R(S,o.payload.directory);return}if(o.type==="session"){if(d)d={...d,session:o.payload.session};if(!o.payload.session)B=null;else if(B?.sessionId!==o.payload.session.id)B=Ft(o.payload.session);R(C,o.payload.session);return}if(o.type==="session-lifecycle"){B=o.payload,R(f,o.payload);return}if(o.type==="connection"){if(d)d={...d,connection:o.payload.connection};R(b,o.payload.connection);return}if(o.type==="settings"){if(d)d={...d,settings:o.payload.settings};R(k,o.payload.settings);return}if(o.type==="item"){if(d)d={...d,item:o.payload.item};R(J,o.payload.item);return}if(o.type==="status-control-event"){R(he,o.payload);return}if(o.type==="popover-closed"){R(me,o.payload);return}if(o.type==="action"){let i=(O)=>{if(!X)y({channel:p,v:u,type:"action-result",id:o.id,payload:O})},A=le;if(!A){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>A(o.payload)).then(()=>i({ok:!0}),(O)=>{let h=(O instanceof Error?O.message:String(O)).trim();i({ok:!1,error:(h||"Action failed.").slice(0,Te)})});return}if(o.type==="file-open"){let i=o.payload;if(Ee&&lo(Ee,i))return;Ee=i,R(Ie,o.payload);return}if(o.type==="file-saved"){R(xe,o.payload.version);return}if(o.type==="file-snapshot"){let i=(h)=>{if(!X)y({channel:p,v:u,type:"file-snapshot-result",id:o.id,payload:h})},A=(h)=>i({error:(h.trim()||"Could not read the edited file.").slice(0,Te)}),O=_e;if(!O){A("This extension does not edit files.");return}Promise.resolve().then(()=>O(o.payload.purpose)).then((h)=>{if(ct(h)>Me){A(`The file is over ${Me} ${"bytes"in h?"bytes":"characters"}.`);return}if(h.version.length>Ne){A(`The snapshot version is over ${Ne} characters.`);return}i({snapshot:"bytes"in h?{bytes:h.bytes,version:h.version}:{content:h.content,version:h.version}})},(h)=>A(h instanceof Error?h.message:String(h)));return}if(o.type==="resolve"){let i=(O)=>{y({channel:p,v:u,type:"resolve-result",id:o.id,payload:O})},A=de;if(!A){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>A(o.payload)).then((O)=>i({item:O?se(O):null}),(O)=>{let h=(O instanceof Error?O.message:String(O)).trim();i({error:(h||"Command failed.").slice(0,Te)})});return}let a=ee.get(o.id);if(!a)return;if(clearTimeout(a.timer),ee.delete(o.id),o.ok){a.resolve(o.payload);return}a.reject(new c(o.code,o.error))};r.addEventListener("message",Kt),y({channel:p,v:u,type:"hello"});let M=(t,o=T)=>{if(X||r.parent===r)return Promise.reject(new c("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((a,i)=>{let A=setTimeout(()=>{ee.delete(t.id),i(new c("HOST_TIMEOUT","Host did not answer in time."))},o);ee.set(t.id,{resolve:a,reject:i,timer:A}),y(t)})},U=(t)=>M(t).then(()=>{return}),I={channel:p,v:u},Qe=(t)=>{if(!X&&r.parent!==r)y(t)},Wt=()=>Qe({...I,type:"file-save"}),qe=()=>{if(!X&&r.parent!==r)y({...I,type:"microphone-close",id:E(_)})},jo=async()=>{if(w)throw new c("HOST_REJECTED","The microphone is already open in this frame.");if(d?.features?.microphone!==!0)throw new c("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let t=globalThis.AudioContext;if(typeof t!=="function")throw new c("UNSUPPORTED","This frame has no Web Audio.");let o=new t;if(o.sampleRate<nt||o.sampleRate>st)throw o.close().catch(()=>{return}),new c("UNSUPPORTED",`Audio at ${o.sampleRate} Hz is not supported.`);let a=o.state==="suspended"?o.resume().catch(()=>{return}):void 0,i=to(Math.round(o.sampleRate/4)),A=o.createScriptProcessor(1024,1,1);A.onaudioprocess=(D)=>i.pull(D.outputBuffer.getChannelData(0));let O=o.createMediaStreamDestination();A.connect(O);let h=new Set,re={queue:i,endedListeners:h,release:()=>{A.onaudioprocess=null,A.disconnect(),i.clear();for(let D of O.stream.getTracks())D.stop();o.close().catch(()=>{return})}};w=re;try{let D=await M({...I,type:"microphone-open",id:E(_),payload:{sampleRate:o.sampleRate}},it);if(!D||!("opened"in D)||D.opened!==!0)throw new c("HOST_REJECTED","Host did not open the microphone.");if(await a,w!==re)throw new c("DISCONNECTED","The microphone closed while it was opening.")}catch(D){if(w===re)w=null;throw re.release(),qe(),D}return{stream:O.stream,close:()=>{if(w!==re)return;w=null,re.release(),qe()},onEnded:(D)=>(h.add(D),()=>{h.delete(D)})}},jt=(t)=>{if(!Po(t)||!rr(t))return;t.preventDefault(),Wt()},zt=(t)=>{if(!Po(t)||t.key!=="Escape"||d?.surface!=="popover"||!d.popover)return;t.preventDefault(),qt(d.popover.id,"escape").catch(()=>{return})},ge=()=>{let t=d?.surface==="popover"?d.popover:void 0;if(!t)return;let o=pe||ue;if($t===o)return;$t=o,Zt(t.id,o).catch(()=>{return})},Ce=()=>{if(d?.surface!=="popover"||pe)return;pe=!0,ge()},Jt=(t)=>{if(d?.surface!=="popover"||t.relatedTarget!==null||!pe)return;pe=!1,ge()},Yt=()=>{if(d?.surface!=="popover"||ue)return;ue=!0,ge()},Qt=()=>{if(d?.surface!=="popover"||!ue)return;ue=!1,ge()},H=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new c("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},Ze=async(t)=>{if(t.kind!=="projects")H(t.projectId);let o=await M({...I,type:"workspace-read",id:E(_),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new c("HOST_REJECTED","Host did not return workspace data.");return o},et=async(t,o)=>{if(t.kind!=="projects")H(t.projectId);let a=E(_);te.set(a,o);try{await U({...I,type:"workspace-subscribe",id:E(_),payload:{subscriptionId:a,query:t}})}catch(i){if(te.delete(a),!X)y({...I,type:"workspace-unsubscribe",id:E(_),payload:{subscriptionId:a}});throw i}return()=>{if(!te.delete(a)||X)return;y({...I,type:"workspace-unsubscribe",id:E(_),payload:{subscriptionId:a}})}},zo=async(t,o)=>{if(t.kind==="session")H(t.sessionId);if(t.kind==="project")H(t.projectId);let a=E(_);oe.set(a,o);try{await U({...I,type:"shells-subscribe",id:E(_),payload:{subscriptionId:a,scope:t}})}catch(i){if(oe.delete(a),!X)y({...I,type:"shells-unsubscribe",id:E(_),payload:{subscriptionId:a}});throw i}return()=>{if(!oe.delete(a)||X)return;y({...I,type:"shells-unsubscribe",id:E(_),payload:{subscriptionId:a}})}},Ue=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>ot))throw new c("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!ne(t.value))throw new c("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>rt)throw new c("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&d?.features?.deviceStorage!==!0)throw new c("UNSUPPORTED","This host does not support device storage.");let o=await M({...I,type:"storage",id:E(_),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new c("HOST_REJECTED","Host did not return storage data.");return o},qt=(t,o)=>d?.features?.popovers!==!0&&!(d?.surface==="popover"&&d.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):U({...I,type:"popover-close",id:E(_),payload:o?{id:t,reason:o}:{id:t}}),Zt=(t,o)=>d?.features?.popovers!==!0&&!(d?.surface==="popover"&&d.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):U({...I,type:"popover-anchor",id:E(_),payload:{id:t,active:o}});return r.addEventListener("keydown",zt,!0),r.addEventListener("pointerover",Ce),r.addEventListener("pointermove",Ce),r.addEventListener("pointerout",Jt),r.addEventListener("focus",Yt),r.addEventListener("blur",Qt),{onAction:(t)=>(le=t,()=>{if(le===t)le=null}),listProjects:async()=>{let t=await Ze({kind:"projects"});if(t.kind!=="projects")throw new c("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await Ze({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new c("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await Ze({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new c("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>et({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>et({kind:"worktrees",projectId:t},(a)=>{if(a.kind==="worktrees")o(a)}),onSessions:(t,o)=>et({kind:"sessions",projectId:t},(a)=>{if(a.kind==="sessions")o(a)}),onRunningShells:(t,o)=>zo(t,o),readShellOutput:async(t,o)=>{H(t,be);let a=o?.cursor;if(a!==void 0&&(!Number.isInteger(a)||a<0))throw new c("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>ke))throw new c("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${ke}.`);let O=await M({...I,type:"shell-output",id:E(_),payload:{shellId:t,cursor:a,tailBytes:i}});if(!O||typeof O.output!=="string"||!Number.isFinite(O.cursor))throw new c("HOST_REJECTED","Host did not return shell output.");return O},stopShell:async(t)=>{if(H(t,be),(await M({...I,type:"shell-stop",id:E(_),payload:{shellId:t}}))?.stopped!==!0)throw new c("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{H(t),await U({...I,type:"open-session",id:E(_),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let a=Ve(o),i={op:"get",key:t};if(a)i.scope=a;let A=await Ue(i);return A.op==="get"&&A.found?A.value:void 0},set:async(t,o,a)=>{let i=Ve(a),A={op:"set",key:t,value:o};if(i)A.scope=i;await Ue(A)},delete:async(t,o)=>{let a=Ve(o),i={op:"delete",key:t};if(a)i.scope=a;await Ue(i)},keys:async(t)=>{let o=Ve(t),a={op:"keys"};if(o)a.scope=o;let i=await Ue(a);if(i.op!=="keys")throw new c("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(l.add(t),d)t(d);return()=>{l.delete(t)}},onDirectory:(t)=>{if(S.add(t),d)t(d.directory);return()=>{S.delete(t)}},onSession:(t)=>{if(C.add(t),d)t(d.session);return()=>{C.delete(t)}},onSessionLifecycle:(t)=>{if(f.add(t),B)t(B);return()=>{f.delete(t)}},onConnection:(t)=>{if(b.add(t),d)t(d.connection);return()=>{b.delete(t)}},onSettings:(t)=>{if(k.add(t),d)t(d.settings);return()=>{k.delete(t)}},onItem:(t)=>{if(J.add(t),d)t(d.item);return()=>{J.delete(t)}},onBlock:(t)=>{if(Y.add(t),d?.block)t(d.block);return()=>{Y.delete(t)}},onServiceEvent:(t)=>(Re.add(t),()=>{Re.delete(t)}),onStatusControl:(t)=>(he.add(t),()=>{he.delete(t)}),onPopoverClosed:(t)=>(me.add(t),()=>{me.delete(t)}),setStatusControls:(t)=>{if(d?.features?.statusControls!==!0)return Promise.reject(new c("UNSUPPORTED","This host does not support status controls."));if(!io(t))return Promise.reject(new c("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return U({...I,type:"status-controls",id:E(_),payload:{controls:t}})},openPopover:(t)=>{if(d?.features?.popovers!==!0)return Promise.reject(new c("UNSUPPORTED","This host does not support popovers."));if(!lt(t))return Promise.reject(new c("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return U({...I,type:"popover-open",id:E(_),payload:t})},closePopover:qt,setPopoverAnchorActive:Zt,onResolve:(t)=>(de=t,()=>{if(de===t)de=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>ye)return Promise.reject(new c("HOST_REJECTED",`Toast message must contain 1 to ${ye} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Le))return Promise.reject(new c("HOST_REJECTED",`Toast copy text must contain 1 to ${Le} characters.`));return U({channel:p,v:u,type:"toast",id:E(_),payload:{...t,message:o}})},openUrl:(t)=>U({channel:p,v:u,type:"open-url",id:E(_),payload:{url:t}}),...So(U,()=>E(_),(t)=>Promise.reject(new c("HOST_REJECTED",t))),answerBlock:(t)=>U({channel:p,v:u,type:"block-answer",id:E(_),payload:{text:t.trim().slice(0,pt)}}),openSurface:(t)=>U({channel:p,v:u,type:"open-surface",id:E(_),payload:{surfaceId:t}}),writeClipboard:(t)=>U({channel:p,v:u,type:"clipboard-write",id:E(_),payload:{text:t}}),compose:(t)=>U({channel:p,v:u,type:"compose",id:E(_),payload:t}),attach:(t)=>U({channel:p,v:u,type:"attach",id:E(_),payload:se(t)}),startSession:async(t)=>{if(t.projectId!==void 0)H(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")H(o.directory);else{if(o.name!==void 0)H(o.name,200);if(o.baseBranch!==void 0)H(o.baseBranch,200)}let a=await M({channel:p,v:u,type:"start-session",id:E(_),payload:Ot(t)},e.requestTimeoutMs??180000);if(!ut(a))throw new c("HOST_REJECTED","Host did not return a session.");return a},prompt:(t)=>M({channel:p,v:u,type:"prompt",id:E(_),payload:Rt(t)}).then((o)=>{if(!Tt(o))throw new c("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>U({channel:p,v:u,type:"session-link",id:E(_),payload:se(t)}),close:()=>U({channel:p,v:u,type:"close",id:E(_)}),oauthStart:()=>U({channel:p,v:u,type:"oauth-start",id:E(_)}),oauthDisconnect:()=>U({channel:p,v:u,type:"oauth-disconnect",id:E(_)}),request:(t)=>(De(t.path)?M({channel:p,v:u,type:"request",id:E(_),payload:t}):wo()).then((o)=>{if(!Xe(o))throw new c("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(De(t.path)?M({channel:p,v:u,type:"service-request",id:E(_),payload:t}):wo()).then((o)=>{if(!Xe(o))throw new c("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>M({channel:p,v:u,type:"service-status",id:E(_)}).then((t)=>{if(!It(t))throw new c("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(ie(t)?M({channel:p,v:u,type:"file-read",id:E(_),payload:{path:t}}):He()).then((o)=>{if(!xt(o))throw new c("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!ie(t))return He();if(o.length>Pe)return Promise.reject(new c("FILE_TOO_LARGE",`Content is over ${Pe} characters.`));return M({channel:p,v:u,type:"file-write",id:E(_),payload:{path:t,content:o}}).then((a)=>{if(!gt(a))throw new c("HOST_REJECTED","Host did not confirm the write.");return a})},listDir:(t)=>(ie(t)?M({channel:p,v:u,type:"file-list",id:E(_),payload:{path:t}}):He()).then((o)=>{if(!Ct(o))throw new c("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(ie(t)?M({channel:p,v:u,type:"file-stat",id:E(_),payload:{path:t}}):He()).then((o)=>{if(!Ut(o))throw new c("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),a=t.system?.trim();if(o.length===0||o.length>we)return Promise.reject(new c("HOST_REJECTED",`Prompt must be 1 to ${we} characters.`));if(a!==void 0&&(a.length===0||a.length>Ge))return Promise.reject(new c("HOST_REJECTED",`System prompt must be 1 to ${Ge} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(ft,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new c("HOST_REJECTED","maxOutputTokens must be a number."));let A={prompt:o};if(a!==void 0)A.system=a;if(i!==void 0)A.maxOutputTokens=i;return M({channel:p,v:u,type:"generate",id:E(_),payload:A},e.requestTimeoutMs??At).then((O)=>{if(!bt(O))throw new c("HOST_REJECTED","Host did not return generated text.");return O})},onLateGenerateResult:(t)=>{Z.add(t);for(let o of Je.splice(0))R([t],o);return Bt(),()=>{Z.delete(t)}},openMicrophone:jo,setBadge:(t)=>U({channel:p,v:u,type:"badge",id:E(_),payload:{count:ht(t)}}),setHeight:(t)=>U({channel:p,v:u,type:"resize",id:E(_),payload:{height:mt(t)}}),onFileOpen:(t)=>{if(Ie.add(t),!Ye)Ye=!0,r.addEventListener("keydown",jt,!0);if(Ee)t(Ee);return()=>{Ie.delete(t)}},onFileSnapshot:(t)=>(_e=t,()=>{if(_e===t)_e=null}),onFileSaved:(t)=>(xe.add(t),()=>{xe.delete(t)}),reportFileChange:(t)=>Qe({...I,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Wt,reportFileUnsupported:()=>Qe({...I,type:"file-unsupported"}),dispose:()=>{for(let t of te.keys())y({...I,type:"workspace-unsubscribe",id:E(_),payload:{subscriptionId:t}});te.clear();for(let t of oe.keys())y({...I,type:"shells-unsubscribe",id:E(_),payload:{subscriptionId:t}});if(oe.clear(),w)qe(),w.release(),w=null;if(X=!0,de=null,le=null,_e=null,Ie.clear(),xe.clear(),Ye)r.removeEventListener("keydown",jt,!0);r.removeEventListener("message",Kt),r.removeEventListener("keydown",zt,!0),r.removeEventListener("pointerover",Ce),r.removeEventListener("pointermove",Ce),r.removeEventListener("pointerout",Jt),r.removeEventListener("focus",Yt),r.removeEventListener("blur",Qt);for(let t of ee.values())clearTimeout(t.timer),t.reject(new c("HOST_UNAVAILABLE","Host client was disposed."));ee.clear(),l.clear(),S.clear(),C.clear(),f.clear(),b.clear(),k.clear(),J.clear(),Y.clear(),Re.clear(),he.clear(),me.clear(),Z.clear(),Je.length=0}}};var Go=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Jr=new Set(Go);var Do=["none","agent","user"];var Qr=new Set(Do);var nr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],sr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Xo=(e,r)=>{r.style.colorScheme=e.mode;for(let[s,T]of nr)r.style.setProperty(s,e.tokens[T]);for(let[s,T,l]of sr){let S=e.tokens[l]??"";r.style.setProperty(s,S),r.style.setProperty(T,S)}r.style.setProperty("font-family",e.tokens.font),r.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),r.style.setProperty("line-height","1.45"),r.style.setProperty("color",e.tokens.foreground)},Nt=(e,r)=>{if(Xo(e.theme,r),r.dataset)r.dataset.ocSurface=e.surface,r.dataset.ocTheme=e.theme.mode};var ir={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},m=(e,r)=>`var(--${e}, var(--oc-${ir[e]}, ${r}))`,W=m("surface-background","transparent"),Fe=m("surface-elevated","transparent"),ae=m("surface-elevated-foreground","inherit"),G=m("surface-foreground","inherit"),x=m("surface-muted-foreground","gray"),ar=m("surface-muted","transparent"),Q=m("interactive-border","currentColor"),L=m("interactive-hover","transparent"),q=m("interactive-active","transparent"),yt=m("interactive-selection","transparent"),Lt=m("interactive-selection-foreground","inherit"),K=m("primary","currentColor"),vt=m("primary-text","inherit"),Pt=m("error-text","inherit"),cr=m("font-sans","inherit"),wt=m("font-mono","monospace"),Fo=m("radius","9px"),Gt=`calc(${Fo} - 2px)`,Ho=`calc(${Fo} - 4px)`,g=(e,r,s="transparent")=>`color-mix(in srgb, ${e} ${r}%, ${s})`,Vo=`background-image: linear-gradient(${L}, ${L});`,Dt=(e,r="0.5px")=>`box-shadow: inset 0 0 0 ${r} ${e}, var(--oc-sdk-field-lift);`,Xt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",$o="box-shadow: var(--oc-sdk-lit);",Ht=`inset 0 0.5px 0 0 ${g(G,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,dr=`
:root {
  --oc-sdk-edge: ${g(G,16)};
  --oc-sdk-field-bg: ${Fe};
  --oc-sdk-raised-bg: ${W};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${g(G,14)};
  --oc-sdk-field-bg: ${g(W,50,Fe)};
  --oc-sdk-raised-bg: ${Fe};
  --oc-sdk-field-lift: ${Ht};
  --oc-sdk-raised-lift: ${Ht};
  --oc-sdk-lit: ${Ht};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,$e=(e)=>{let r=m(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${r}; --oc-sdk-tone-text: ${m(`${e}-text`,"inherit")}; }`},n=(e)=>`calc(${e}rem / 14)`,lr=`
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
`,Bo=`${dr}
.oc-sdk { color: ${G}; font-family: ${cr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Vo} }
.oc-sdk-mono { font-family: ${wt}; }
.oc-sdk-muted { color: ${x}; }
${$e("success")}${$e("warning")}${$e("error")}${$e("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${K}; --oc-sdk-tone-text: ${vt}; }

.oc-sdk-btn { border-radius: ${Gt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Ho}; }
.oc-sdk-btn[data-variant="default"] { color: ${vt}; background: ${g(K,10,W)}; border-color: ${g(K,12)}; ${$o} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${g(K,16,W)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${g(K,22,W)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${ar}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${q}, ${q}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ae}; ${Xt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${q}, ${q}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${L}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${q}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${m("status-error","red")}; color: ${Pt}; background: ${g("var(--oc-sdk-tone)",7,W)}; border-color: ${g("var(--oc-sdk-tone)",12)}; ${$o} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${g("var(--oc-sdk-tone)",9,W)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${g("var(--oc-sdk-tone)",11,W)}; box-shadow: none; }

.oc-sdk-field-note { color: ${x}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Pt}; }
.oc-sdk-input { border-radius: ${Gt}; background: var(--oc-sdk-field-bg); color: ${ae}; ${Dt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${x}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Dt(g(G,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Dt(m("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${wt}; }

.oc-sdk-search-icon { color: ${x}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${K}; }
.oc-sdk-search-clear { border-radius: ${Ho}; color: ${x}; }
.oc-sdk-search-clear:hover { background: ${L}; color: ${G}; }

.oc-sdk-trigger { border-radius: ${Gt}; background: var(--oc-sdk-raised-bg); color: ${ae}; ${Xt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${q}, ${q}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${x}; }
.oc-sdk-trigger-chevron { color: ${x}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ae}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Fe}; background-clip: padding-box; color: ${ae}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${L}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${yt}; color: ${Lt}; }
.oc-sdk-option-check { color: ${G}; }
.oc-sdk-option[data-destructive="true"] { color: ${Pt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${g(m("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${x}; }
.oc-sdk-popup-empty { color: ${x}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Q}; border-radius: 4px; color: ${G}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${g(G,60,Q)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Q}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${W}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${K}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Vo} }
.oc-sdk-check-desc { color: ${x}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${g(G,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${x}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${G}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Lt}; background: ${yt}; border-color: ${Q}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ae}; background: var(--oc-sdk-raised-bg); ${Xt} }
.oc-sdk-tab-count { color: ${x}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${g(G,6)}; color: ${x}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${g("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${L}; }
.oc-sdk-row[aria-selected="true"] { background: ${yt}; color: ${Lt}; }
.oc-sdk-row-lead { font-family: ${wt}; color: ${x}; }
.oc-sdk-row-sub { color: ${x}; }
.oc-sdk-row-meta { color: ${x}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${x}; }

.oc-sdk-empty-body { color: ${x}; }

.oc-sdk-spinner { color: ${x}; }
.oc-sdk-spinner-ring { border-color: ${Q}; border-top-color: ${K}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${g("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${x}; }

.oc-sdk-separator { color: ${x}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${g(Q,40)}; }

.oc-sdk-progress-label { color: ${x}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${g(G,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${K}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${m("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${m("success-text","inherit")}; }

.oc-sdk-text a { color: ${vt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${g(Q,60)}; }
`,N=`
${tt}
${lr}
${Bo}`;var Oe=Mt(),F=document.querySelector("#root"),Ko=async(e,r={})=>{let s=await Oe.serviceRequest({method:"GET",path:e,query:r});try{return JSON.parse(String(s.body??"{}"))}catch{return{}}},ze=null,fe=0,Ae=()=>{if(ze!==null)clearInterval(ze),ze=null},V=(e,r)=>{let s=document.createElement(e);if(r)s.className=r;return s},Tr=()=>{let e=V("div","card"),r=V("div","body"),s=V("img","qr");s.alt="登录二维码",s.hidden=!0;let T=V("div","status");T.textContent="正在生成二维码…";let l=V("div","actions"),S=V("button");S.type="button",S.textContent="重新生成",S.hidden=!0,l.append(S);let C=V("details"),f=V("summary");f.textContent="二维码链接";let b=V("code");C.append(f,b),C.hidden=!0,r.append(s,T,l,C),e.append(r),F.replaceChildren(e)},z=(e,r)=>{let s=F.querySelector(".status");if(!s)return;s.textContent=e,s.className=`status${r?` ${r}`:""}`},Sr=(e)=>{let r=F.querySelector(".qr");if(!r)return;r.src=e,r.hidden=!1},Wo=async()=>{let e=++fe;Ae(),Tr();let r=F.querySelector(".actions button");r.addEventListener("click",()=>void Wo());let s;try{s=await Ko("/login/qr")}catch(f){z(`出码失败：${f.message}`,"bad"),r.hidden=!1;return}if(e!==fe)return;if(!s?.qr||!s?.key){z(`出码失败：${s?.error??"没有二维码"}`,"bad"),r.hidden=!1;return}Sr(s.qr),z("等待扫码"),r.hidden=!1;let T=s.key,l=F.querySelector("details"),S=F.querySelector("details code");if(l&&S&&s.indexUrl){S.textContent=s.indexUrl;let f=V("div","hint");f.textContent="复制到手机浏览器可直达",l.append(f),l.hidden=!1}let C=!1;ze=window.setInterval(()=>{if(C||e!==fe)return;C=!0,(async()=>{let f;try{f=await Ko("/login/check",{key:T})}catch(k){z(`查询失败：${k.message}`,"bad");return}finally{C=!1}if(e!==fe)return;let b=String(f?.state??"");if(b==="new"){z("等待扫码");return}if(b==="scanned"){z("已扫码，请在手机上确认");return}if(b==="confirmed"){Ae();let k=String(f.user?.nickname??""),J=f.user?.isVip===!0;z(`已登录：${k}${J?"（会员）":""}`,"ok"),r.hidden=!0;let Y=F.querySelector(".qr");if(Y)Y.hidden=!0;try{await Oe.answerBlock(`已登录：${k}`)}catch{}return}if(b==="expired"||b==="refused"||b==="stale"){Ae(),z(b==="expired"?"已过期，点「重新生成」":b==="refused"?"已拒绝登录，请重新生成":"二维码已失效，请重新生成","bad");let k=F.querySelector(".qr");if(k)k.hidden=!0;r.hidden=!1;return}Ae(),z(`失败（${f?.stage??b}）：${f?.error??"未知错误"}`,"bad"),r.hidden=!1})()},2000)};Oe.onReady((e)=>Nt(e,document.documentElement));Oe.onBlock(()=>{Wo()});new ResizeObserver(()=>{Oe.setHeight(Math.ceil(F.getBoundingClientRect().height))}).observe(F);window.addEventListener("unload",()=>{fe+=1,Ae()});})();
