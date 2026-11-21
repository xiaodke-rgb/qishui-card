(()=>{var p="openchamber.sdk",u=1;var ze=`
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
`;function jt(e){let r=e.documentElement;if(r.hasAttribute("data-oc-scrollbar-activity"))return;r.setAttribute("data-oc-scrollbar-activity","");let s=new WeakMap;e.addEventListener("scroll",(A)=>{let E=A.target===e?r:A.target;if(!(E instanceof Element))return;if(!E.hasAttribute("data-oc-scrolling"))E.setAttribute("data-oc-scrolling","");let h=s.get(E);if(h!==void 0)clearTimeout(h);s.set(E,setTimeout(()=>{s.delete(E),E.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var Ho=`(${jt.toString()})(document);`;var Ye=128,Je=65536;var me=128;var Ie=65536;var Qe=8000,Ze=192000,qe=120000;var zt=(e)=>{let r=[],s=0,A=0;return{push:(E)=>{r.push(E),A+=E.length;while(A-s>e&&r.length>1){let h=r.shift();A-=h?.length??0,s=0}},pull:(E)=>{let h=0;while(h<E.length&&r.length>0){let L=r[0],C=Math.min(E.length-h,L.length-s);if(E.set(L.subarray(s,s+C),h),h+=C,s+=C,s>=L.length)r.shift(),A-=L.length,s=0}E.fill(0,h)},clear:()=>{r.length=0,s=0,A=0},get size(){return A-s}}};var Zt=/^[a-z][a-z0-9-]{0,39}$/;var Yt=(e)=>Object(e)===e&&!Array.isArray(e),et=(e,r)=>Object.keys(e).every((s)=>r.includes(s)),Jt=(e)=>String(e)===e&&e.length>=1&&e.length<=60,Qt=(e)=>String(e)===e&&e.length>=1&&e.length<=80,qt=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let r=new Set;for(let s of e){if(!Yt(s)||!Zt.test(s.id)||!Jt(s.label))return!1;if(s.disabled!==void 0&&s.disabled!==!0&&s.disabled!==!1)return!1;if(r.has(s.id))return!1;if(r.add(s.id),s.kind==="button"){if(!et(s,["kind","id","label","disabled"]))return!1;continue}if(s.kind!=="select"||!et(s,["kind","id","label","value","options","disabled"]))return!1;if(!Qt(s.value)||!Array.isArray(s.options)||s.options.length<1||s.options.length>16)return!1;let A=new Set;for(let E of s.options){if(!Yt(E)||!et(E,["value","label"])||!Qt(E.value)||!Jt(E.label)||A.has(E.value))return!1;A.add(E.value)}if(!A.has(s.value))return!1}return!0};var eo=["{id}","{segment}","{segments+}"];var Ar=new Set(eo);var to=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Or=new Set(to);var xe=20000000,ge=256;var tt=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,oo=(e,r)=>{if(e.path!==r.path||e.readOnly!==r.readOnly)return!1;if(e.encoding==="text"||r.encoding==="text")return e.encoding==="text"&&r.encoding==="text"&&e.content===r.content;if(e.bytes.byteLength!==r.bytes.byteLength)return!1;for(let s=0;s<e.bytes.byteLength;s+=1)if(e.bytes[s]!==r.bytes[s])return!1;return!0};var ro=/^[A-Za-z0-9_-]{1,80}$/;var no=["left","right","top","bottom"];var so=(e,r=0,s={remaining:16000})=>{if(--s.remaining<0||r>=32)return!1;if(e===null)return!0;let A=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let E of A)if(!so(E,r+1,s))return!1;return!0},ot=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((r)=>/^(0|[1-9]\d*)$/.test(r)&&Number(r)<e.length)&&e.every(ot);if(Object(e)===e){let r=Object.getPrototypeOf(e);return(r===null||r===Object.prototype)&&Object.values(e).every(ot)}return String(e)===e||Number.isFinite(e)},rt=(e)=>{try{if(String(e.id)!==e.id||!ro.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!no.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!so(e.data)||!ot(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var io=/^[0-9a-f]{7,64}$/i,ao=(e)=>io.test(e),nt=255,co=(e,r,s)=>({openCommit:(A)=>ao(A)?e({channel:p,v:u,type:"open-commit",id:r(),payload:{sha:A}}):s("Commit id must be 7 to 64 hex characters."),openWalkthrough:({base:A})=>{let E=A.trim();if(!E||E.length>nt)return s(`Base must contain 1 to ${nt} characters.`);return e({channel:p,v:u,type:"open-walkthrough",id:r(),payload:{base:E}})}});var it=2000;var _o=["file","directory","other","missing"],at=(e)=>Boolean(e&&"sessionId"in e),ct=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var Ue=500,Ce=32000,Eo=16000,po=128,uo=200,To=2000,So=16000,Ao=80,fo=200,Oo=16000;var Ro=2000;var dt=20000,be=1024,ke=2000000;var Me=64000,Ne=8000,lt=4000;var _t=960000;var ho=999,mo=1e4,_e=500,Io=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],xo=["stopped","starting","ready","failed"],$o=new Set(Io),go=(e)=>$o.has(e),Uo=(e)=>e&&go(e)?e:"HOST_REJECTED",q=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(q);if(Object(e)===e)return Object.values(e).every(q);return!1},Co=(e)=>q(e)&&JSON.stringify(e).length<=Oo,lo=(e)=>e?.trim().slice(0,fo)??"",ee=(e)=>{let r=e.id.trim().slice(0,po),s=e.title.trim().slice(0,uo),A=e.url.trim().slice(0,To),E=e.text?.trim().slice(0,So),h=e.author?.trim().slice(0,Ao),L=e.kind==="pull"?"pull":"issue",C={providerId:e.providerId.trim(),id:r,title:s||r,url:A,kind:L};if(E)C.text=E;if(h)C.author=h;if(L==="pull"){let B=lo(e.branches?.head),K=lo(e.branches?.base);if(B&&K)C.branches={head:B,base:K}}if(Co(e.data))C.data=e.data;return C},Et=(e)=>{let r=ee(e);if(e.projectId)r.projectId=e.projectId;if(e.navigation)r.navigation=e.navigation;if(e.worktree)r.worktree=e.worktree;return r},pt=(e)=>{let r={text:e.text.trim().slice(0,Eo)};if(e.send)r.send=!0;return r},ut=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(ho,Math.max(0,Math.round(e)))},Tt=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(mo,Math.max(0,Math.ceil(e)))};var te=(e)=>e.length>0&&e.length<=be&&!e.includes("\x00")&&!e.includes("\\");var ye=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>Ro)return!1;return!e.split("/").some((s)=>s==="."||s==="..")},Fo=new Set(xo),St=(e)=>Boolean(e&&"status"in e&&Fo.has(String(e.status))&&!("body"in e)),Le=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),At=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),ft=(e)=>Boolean(e&&"written"in e&&e.written===!0),Ot=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),Bo=new Set(_o),Rt=(e)=>Boolean(e&&"kind"in e&&"size"in e&&Bo.has(String(e.kind))&&Number.isFinite(e.size)),ht=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Ko=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),Wo=(e)=>Object(e)===e?e:null,st=(e)=>String(e)===e&&e.length>0,jo=(e)=>{if(!st(e.id))return null;if(e.ok===!0){let r={channel:p,v:u,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)r.payload=e.payload;return r}if(e.ok===!1&&st(e.error))return{channel:p,v:u,type:"result",id:e.id,ok:!1,error:e.error,code:Uo(st(e.code)?e.code:void 0)};return null},mt=(e)=>{let r=Wo(e);if(!r||r.channel!==p||r.v!==u)return null;if(r.type==="result")return jo(r);if(!Ko.has(String(r.type))||Object(r.payload)!==r.payload)return null;return r};var bo=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),zo=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class c extends Error{code;constructor(e,r){super(r);this.name="HostRequestError",this.code=e}}var ko=()=>Promise.reject(new c("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ve=()=>Promise.reject(new c("BAD_PATH",`File path must be 1 to ${be} characters without NUL or backslash.`)),Pe=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new c("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},_=(e)=>(e.value+=1,`oc-${e.value}`),It=(e={})=>{let r=e.target??("window"in globalThis?window:null);if(!r)throw new c("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let s=e.acceptSource??((t)=>t===r.parent),A=e.requestTimeoutMs??dt,E=new Set,h=new Set,L=new Set,C=new Set,B=new Set,K=new Set,ne=new Set,pe=new Set,ue=new Set,Te=new Set,Se=new Set,z=new Set,$e=[],se=null,ie=null,Ae=new Set,fe=new Set,ae=null,ce=null,Fe=!1,Y=new Map,J=new Map,Q=new Map,G=!1,l={value:0},d=null,X=null,de=!1,le=!1,Pt=null,v=null,wt=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},k=(t)=>{r.parent.postMessage(t,"*")},Gt=()=>{if(G||r.parent===r||z.size===0||d?.features?.lateGenerateResults!==!0)return;k({channel:p,v:u,type:"generate-late-listen"})},f=(t,o)=>{for(let a of t)try{a(o)}catch(i){console.error(i)}},Dt=(t)=>{if(!(t instanceof MessageEvent))return;if(!s(t.source))return;let o=mt(t.data);if(!o)return;if(o.type==="workspace"){let i=J.get(o.payload.subscriptionId);if(i)f([i],o.payload.snapshot);return}if(o.type==="shells"){let i=Q.get(o.payload.subscriptionId);if(i)f([i],o.payload.snapshot);return}if(o.type==="microphone-audio"){v?.queue.push(o.payload.samples);return}if(o.type==="microphone-ended"){let i=v;if(!i)return;v=null,i.release(),f(i.endedListeners,o.payload.reason);return}if(o.type==="ready"){if(d=o.payload,X=wt(o.payload.session),f(E,o.payload),f(h,o.payload.directory),f(L,o.payload.session),X)f(C,X);if(f(B,o.payload.connection),f(K,o.payload.settings),f(ne,o.payload.item),o.payload.block)f(pe,o.payload.block);Gt();return}if(o.type==="service-event"){f(ue,o.payload);return}if(o.type==="generate-late"){if(z.size===0)$e.push(o.payload);else f(z,o.payload);return}if(o.type==="directory"){if(d)d={...d,directory:o.payload.directory};f(h,o.payload.directory);return}if(o.type==="session"){if(d)d={...d,session:o.payload.session};if(!o.payload.session)X=null;else if(X?.sessionId!==o.payload.session.id)X=wt(o.payload.session);f(L,o.payload.session);return}if(o.type==="session-lifecycle"){X=o.payload,f(C,o.payload);return}if(o.type==="connection"){if(d)d={...d,connection:o.payload.connection};f(B,o.payload.connection);return}if(o.type==="settings"){if(d)d={...d,settings:o.payload.settings};f(K,o.payload.settings);return}if(o.type==="item"){if(d)d={...d,item:o.payload.item};f(ne,o.payload.item);return}if(o.type==="status-control-event"){f(Te,o.payload);return}if(o.type==="popover-closed"){f(Se,o.payload);return}if(o.type==="action"){let i=(S)=>{if(!G)k({channel:p,v:u,type:"action-result",id:o.id,payload:S})},T=ie;if(!T){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>T(o.payload)).then(()=>i({ok:!0}),(S)=>{let O=(S instanceof Error?S.message:String(S)).trim();i({ok:!1,error:(O||"Action failed.").slice(0,_e)})});return}if(o.type==="file-open"){let i=o.payload;if(ce&&oo(ce,i))return;ce=i,f(Ae,o.payload);return}if(o.type==="file-saved"){f(fe,o.payload.version);return}if(o.type==="file-snapshot"){let i=(O)=>{if(!G)k({channel:p,v:u,type:"file-snapshot-result",id:o.id,payload:O})},T=(O)=>i({error:(O.trim()||"Could not read the edited file.").slice(0,_e)}),S=ae;if(!S){T("This extension does not edit files.");return}Promise.resolve().then(()=>S(o.payload.purpose)).then((O)=>{if(tt(O)>xe){T(`The file is over ${xe} ${"bytes"in O?"bytes":"characters"}.`);return}if(O.version.length>ge){T(`The snapshot version is over ${ge} characters.`);return}i({snapshot:"bytes"in O?{bytes:O.bytes,version:O.version}:{content:O.content,version:O.version}})},(O)=>T(O instanceof Error?O.message:String(O)));return}if(o.type==="resolve"){let i=(S)=>{k({channel:p,v:u,type:"resolve-result",id:o.id,payload:S})},T=se;if(!T){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>T(o.payload)).then((S)=>i({item:S?ee(S):null}),(S)=>{let O=(S instanceof Error?S.message:String(S)).trim();i({error:(O||"Command failed.").slice(0,_e)})});return}let a=Y.get(o.id);if(!a)return;if(clearTimeout(a.timer),Y.delete(o.id),o.ok){a.resolve(o.payload);return}a.reject(new c(o.code,o.error))};r.addEventListener("message",Dt),k({channel:p,v:u,type:"hello"});let U=(t,o=A)=>{if(G||r.parent===r)return Promise.reject(new c("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((a,i)=>{let T=setTimeout(()=>{Y.delete(t.id),i(new c("HOST_TIMEOUT","Host did not answer in time."))},o);Y.set(t.id,{resolve:a,reject:i,timer:T}),k(t)})},g=(t)=>U(t).then(()=>{return}),m={channel:p,v:u},Be=(t)=>{if(!G&&r.parent!==r)k(t)},Xt=()=>Be({...m,type:"file-save"}),Ke=()=>{if(!G&&r.parent!==r)k({...m,type:"microphone-close",id:_(l)})},Do=async()=>{if(v)throw new c("HOST_REJECTED","The microphone is already open in this frame.");if(d?.features?.microphone!==!0)throw new c("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let t=globalThis.AudioContext;if(typeof t!=="function")throw new c("UNSUPPORTED","This frame has no Web Audio.");let o=new t;if(o.sampleRate<Qe||o.sampleRate>Ze)throw o.close().catch(()=>{return}),new c("UNSUPPORTED",`Audio at ${o.sampleRate} Hz is not supported.`);let a=o.state==="suspended"?o.resume().catch(()=>{return}):void 0,i=zt(Math.round(o.sampleRate/4)),T=o.createScriptProcessor(1024,1,1);T.onaudioprocess=(w)=>i.pull(w.outputBuffer.getChannelData(0));let S=o.createMediaStreamDestination();T.connect(S);let O=new Set,Z={queue:i,endedListeners:O,release:()=>{T.onaudioprocess=null,T.disconnect(),i.clear();for(let w of S.stream.getTracks())w.stop();o.close().catch(()=>{return})}};v=Z;try{let w=await U({...m,type:"microphone-open",id:_(l),payload:{sampleRate:o.sampleRate}},qe);if(!w||!("opened"in w)||w.opened!==!0)throw new c("HOST_REJECTED","Host did not open the microphone.");if(await a,v!==Z)throw new c("DISCONNECTED","The microphone closed while it was opening.")}catch(w){if(v===Z)v=null;throw Z.release(),Ke(),w}return{stream:S.stream,close:()=>{if(v!==Z)return;v=null,Z.release(),Ke()},onEnded:(w)=>(O.add(w),()=>{O.delete(w)})}},Ht=(t)=>{if(!bo(t)||!zo(t))return;t.preventDefault(),Xt()},Vt=(t)=>{if(!bo(t)||t.key!=="Escape"||d?.surface!=="popover"||!d.popover)return;t.preventDefault(),Kt(d.popover.id,"escape").catch(()=>{return})},Oe=()=>{let t=d?.surface==="popover"?d.popover:void 0;if(!t)return;let o=de||le;if(Pt===o)return;Pt=o,Wt(t.id,o).catch(()=>{return})},Re=()=>{if(d?.surface!=="popover"||de)return;de=!0,Oe()},$t=(t)=>{if(d?.surface!=="popover"||t.relatedTarget!==null||!de)return;de=!1,Oe()},Ft=()=>{if(d?.surface!=="popover"||le)return;le=!0,Oe()},Bt=()=>{if(d?.surface!=="popover"||!le)return;le=!1,Oe()},D=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new c("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},We=async(t)=>{if(t.kind!=="projects")D(t.projectId);let o=await U({...m,type:"workspace-read",id:_(l),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new c("HOST_REJECTED","Host did not return workspace data.");return o},je=async(t,o)=>{if(t.kind!=="projects")D(t.projectId);let a=_(l);J.set(a,o);try{await g({...m,type:"workspace-subscribe",id:_(l),payload:{subscriptionId:a,query:t}})}catch(i){if(J.delete(a),!G)k({...m,type:"workspace-unsubscribe",id:_(l),payload:{subscriptionId:a}});throw i}return()=>{if(!J.delete(a)||G)return;k({...m,type:"workspace-unsubscribe",id:_(l),payload:{subscriptionId:a}})}},Xo=async(t,o)=>{if(t.kind==="session")D(t.sessionId);if(t.kind==="project")D(t.projectId);let a=_(l);Q.set(a,o);try{await g({...m,type:"shells-subscribe",id:_(l),payload:{subscriptionId:a,scope:t}})}catch(i){if(Q.delete(a),!G)k({...m,type:"shells-unsubscribe",id:_(l),payload:{subscriptionId:a}});throw i}return()=>{if(!Q.delete(a)||G)return;k({...m,type:"shells-unsubscribe",id:_(l),payload:{subscriptionId:a}})}},he=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>Ye))throw new c("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!q(t.value))throw new c("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>Je)throw new c("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&d?.features?.deviceStorage!==!0)throw new c("UNSUPPORTED","This host does not support device storage.");let o=await U({...m,type:"storage",id:_(l),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new c("HOST_REJECTED","Host did not return storage data.");return o},Kt=(t,o)=>d?.features?.popovers!==!0&&!(d?.surface==="popover"&&d.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):g({...m,type:"popover-close",id:_(l),payload:o?{id:t,reason:o}:{id:t}}),Wt=(t,o)=>d?.features?.popovers!==!0&&!(d?.surface==="popover"&&d.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):g({...m,type:"popover-anchor",id:_(l),payload:{id:t,active:o}});return r.addEventListener("keydown",Vt,!0),r.addEventListener("pointerover",Re),r.addEventListener("pointermove",Re),r.addEventListener("pointerout",$t),r.addEventListener("focus",Ft),r.addEventListener("blur",Bt),{onAction:(t)=>(ie=t,()=>{if(ie===t)ie=null}),listProjects:async()=>{let t=await We({kind:"projects"});if(t.kind!=="projects")throw new c("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await We({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new c("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await We({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new c("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>je({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>je({kind:"worktrees",projectId:t},(a)=>{if(a.kind==="worktrees")o(a)}),onSessions:(t,o)=>je({kind:"sessions",projectId:t},(a)=>{if(a.kind==="sessions")o(a)}),onRunningShells:(t,o)=>Xo(t,o),readShellOutput:async(t,o)=>{D(t,me);let a=o?.cursor;if(a!==void 0&&(!Number.isInteger(a)||a<0))throw new c("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>Ie))throw new c("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${Ie}.`);let S=await U({...m,type:"shell-output",id:_(l),payload:{shellId:t,cursor:a,tailBytes:i}});if(!S||typeof S.output!=="string"||!Number.isFinite(S.cursor))throw new c("HOST_REJECTED","Host did not return shell output.");return S},stopShell:async(t)=>{if(D(t,me),(await U({...m,type:"shell-stop",id:_(l),payload:{shellId:t}}))?.stopped!==!0)throw new c("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{D(t),await g({...m,type:"open-session",id:_(l),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let a=Pe(o),i={op:"get",key:t};if(a)i.scope=a;let T=await he(i);return T.op==="get"&&T.found?T.value:void 0},set:async(t,o,a)=>{let i=Pe(a),T={op:"set",key:t,value:o};if(i)T.scope=i;await he(T)},delete:async(t,o)=>{let a=Pe(o),i={op:"delete",key:t};if(a)i.scope=a;await he(i)},keys:async(t)=>{let o=Pe(t),a={op:"keys"};if(o)a.scope=o;let i=await he(a);if(i.op!=="keys")throw new c("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(E.add(t),d)t(d);return()=>{E.delete(t)}},onDirectory:(t)=>{if(h.add(t),d)t(d.directory);return()=>{h.delete(t)}},onSession:(t)=>{if(L.add(t),d)t(d.session);return()=>{L.delete(t)}},onSessionLifecycle:(t)=>{if(C.add(t),X)t(X);return()=>{C.delete(t)}},onConnection:(t)=>{if(B.add(t),d)t(d.connection);return()=>{B.delete(t)}},onSettings:(t)=>{if(K.add(t),d)t(d.settings);return()=>{K.delete(t)}},onItem:(t)=>{if(ne.add(t),d)t(d.item);return()=>{ne.delete(t)}},onBlock:(t)=>{if(pe.add(t),d?.block)t(d.block);return()=>{pe.delete(t)}},onServiceEvent:(t)=>(ue.add(t),()=>{ue.delete(t)}),onStatusControl:(t)=>(Te.add(t),()=>{Te.delete(t)}),onPopoverClosed:(t)=>(Se.add(t),()=>{Se.delete(t)}),setStatusControls:(t)=>{if(d?.features?.statusControls!==!0)return Promise.reject(new c("UNSUPPORTED","This host does not support status controls."));if(!qt(t))return Promise.reject(new c("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return g({...m,type:"status-controls",id:_(l),payload:{controls:t}})},openPopover:(t)=>{if(d?.features?.popovers!==!0)return Promise.reject(new c("UNSUPPORTED","This host does not support popovers."));if(!rt(t))return Promise.reject(new c("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return g({...m,type:"popover-open",id:_(l),payload:t})},closePopover:Kt,setPopoverAnchorActive:Wt,onResolve:(t)=>(se=t,()=>{if(se===t)se=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>Ue)return Promise.reject(new c("HOST_REJECTED",`Toast message must contain 1 to ${Ue} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Ce))return Promise.reject(new c("HOST_REJECTED",`Toast copy text must contain 1 to ${Ce} characters.`));return g({channel:p,v:u,type:"toast",id:_(l),payload:{...t,message:o}})},openUrl:(t)=>g({channel:p,v:u,type:"open-url",id:_(l),payload:{url:t}}),...co(g,()=>_(l),(t)=>Promise.reject(new c("HOST_REJECTED",t))),answerBlock:(t)=>g({channel:p,v:u,type:"block-answer",id:_(l),payload:{text:t.trim().slice(0,it)}}),openSurface:(t)=>g({channel:p,v:u,type:"open-surface",id:_(l),payload:{surfaceId:t}}),writeClipboard:(t)=>g({channel:p,v:u,type:"clipboard-write",id:_(l),payload:{text:t}}),compose:(t)=>g({channel:p,v:u,type:"compose",id:_(l),payload:t}),attach:(t)=>g({channel:p,v:u,type:"attach",id:_(l),payload:ee(t)}),startSession:async(t)=>{if(t.projectId!==void 0)D(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")D(o.directory);else{if(o.name!==void 0)D(o.name,200);if(o.baseBranch!==void 0)D(o.baseBranch,200)}let a=await U({channel:p,v:u,type:"start-session",id:_(l),payload:Et(t)},e.requestTimeoutMs??180000);if(!at(a))throw new c("HOST_REJECTED","Host did not return a session.");return a},prompt:(t)=>U({channel:p,v:u,type:"prompt",id:_(l),payload:pt(t)}).then((o)=>{if(!ct(o))throw new c("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>g({channel:p,v:u,type:"session-link",id:_(l),payload:ee(t)}),close:()=>g({channel:p,v:u,type:"close",id:_(l)}),oauthStart:()=>g({channel:p,v:u,type:"oauth-start",id:_(l)}),oauthDisconnect:()=>g({channel:p,v:u,type:"oauth-disconnect",id:_(l)}),request:(t)=>(ye(t.path)?U({channel:p,v:u,type:"request",id:_(l),payload:t}):ko()).then((o)=>{if(!Le(o))throw new c("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(ye(t.path)?U({channel:p,v:u,type:"service-request",id:_(l),payload:t}):ko()).then((o)=>{if(!Le(o))throw new c("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>U({channel:p,v:u,type:"service-status",id:_(l)}).then((t)=>{if(!St(t))throw new c("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(te(t)?U({channel:p,v:u,type:"file-read",id:_(l),payload:{path:t}}):ve()).then((o)=>{if(!At(o))throw new c("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!te(t))return ve();if(o.length>ke)return Promise.reject(new c("FILE_TOO_LARGE",`Content is over ${ke} characters.`));return U({channel:p,v:u,type:"file-write",id:_(l),payload:{path:t,content:o}}).then((a)=>{if(!ft(a))throw new c("HOST_REJECTED","Host did not confirm the write.");return a})},listDir:(t)=>(te(t)?U({channel:p,v:u,type:"file-list",id:_(l),payload:{path:t}}):ve()).then((o)=>{if(!Ot(o))throw new c("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(te(t)?U({channel:p,v:u,type:"file-stat",id:_(l),payload:{path:t}}):ve()).then((o)=>{if(!Rt(o))throw new c("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),a=t.system?.trim();if(o.length===0||o.length>Me)return Promise.reject(new c("HOST_REJECTED",`Prompt must be 1 to ${Me} characters.`));if(a!==void 0&&(a.length===0||a.length>Ne))return Promise.reject(new c("HOST_REJECTED",`System prompt must be 1 to ${Ne} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(lt,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new c("HOST_REJECTED","maxOutputTokens must be a number."));let T={prompt:o};if(a!==void 0)T.system=a;if(i!==void 0)T.maxOutputTokens=i;return U({channel:p,v:u,type:"generate",id:_(l),payload:T},e.requestTimeoutMs??_t).then((S)=>{if(!ht(S))throw new c("HOST_REJECTED","Host did not return generated text.");return S})},onLateGenerateResult:(t)=>{z.add(t);for(let o of $e.splice(0))f([t],o);return Gt(),()=>{z.delete(t)}},openMicrophone:Do,setBadge:(t)=>g({channel:p,v:u,type:"badge",id:_(l),payload:{count:ut(t)}}),setHeight:(t)=>g({channel:p,v:u,type:"resize",id:_(l),payload:{height:Tt(t)}}),onFileOpen:(t)=>{if(Ae.add(t),!Fe)Fe=!0,r.addEventListener("keydown",Ht,!0);if(ce)t(ce);return()=>{Ae.delete(t)}},onFileSnapshot:(t)=>(ae=t,()=>{if(ae===t)ae=null}),onFileSaved:(t)=>(fe.add(t),()=>{fe.delete(t)}),reportFileChange:(t)=>Be({...m,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Xt,reportFileUnsupported:()=>Be({...m,type:"file-unsupported"}),dispose:()=>{for(let t of J.keys())k({...m,type:"workspace-unsubscribe",id:_(l),payload:{subscriptionId:t}});J.clear();for(let t of Q.keys())k({...m,type:"shells-unsubscribe",id:_(l),payload:{subscriptionId:t}});if(Q.clear(),v)Ke(),v.release(),v=null;if(G=!0,se=null,ie=null,ae=null,Ae.clear(),fe.clear(),Fe)r.removeEventListener("keydown",Ht,!0);r.removeEventListener("message",Dt),r.removeEventListener("keydown",Vt,!0),r.removeEventListener("pointerover",Re),r.removeEventListener("pointermove",Re),r.removeEventListener("pointerout",$t),r.removeEventListener("focus",Ft),r.removeEventListener("blur",Bt);for(let t of Y.values())clearTimeout(t.timer),t.reject(new c("HOST_UNAVAILABLE","Host client was disposed."));Y.clear(),E.clear(),h.clear(),L.clear(),C.clear(),B.clear(),K.clear(),ne.clear(),pe.clear(),ue.clear(),Te.clear(),Se.clear(),z.clear(),$e.length=0}}};var Mo=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Xr=new Set(Mo);var No=["none","agent","user"];var Vr=new Set(No);var Yo=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Jo=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],yo=(e,r)=>{r.style.colorScheme=e.mode;for(let[s,A]of Yo)r.style.setProperty(s,e.tokens[A]);for(let[s,A,E]of Jo){let h=e.tokens[E]??"";r.style.setProperty(s,h),r.style.setProperty(A,h)}r.style.setProperty("font-family",e.tokens.font),r.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),r.style.setProperty("line-height","1.45"),r.style.setProperty("color",e.tokens.foreground)},xt=(e,r)=>{if(yo(e.theme,r),r.dataset)r.dataset.ocSurface=e.surface,r.dataset.ocTheme=e.theme.mode};var Qo={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},R=(e,r)=>`var(--${e}, var(--oc-${Qo[e]}, ${r}))`,V=R("surface-background","transparent"),Ge=R("surface-elevated","transparent"),oe=R("surface-elevated-foreground","inherit"),P=R("surface-foreground","inherit"),I=R("surface-muted-foreground","gray"),Zo=R("surface-muted","transparent"),W=R("interactive-border","currentColor"),M=R("interactive-hover","transparent"),j=R("interactive-active","transparent"),gt=R("interactive-selection","transparent"),Ut=R("interactive-selection-foreground","inherit"),H=R("primary","currentColor"),Ct=R("primary-text","inherit"),bt=R("error-text","inherit"),qo=R("font-sans","inherit"),kt=R("font-mono","monospace"),wo=R("radius","9px"),Mt=`calc(${wo} - 2px)`,Lo=`calc(${wo} - 4px)`,x=(e,r,s="transparent")=>`color-mix(in srgb, ${e} ${r}%, ${s})`,vo=`background-image: linear-gradient(${M}, ${M});`,Nt=(e,r="0.5px")=>`box-shadow: inset 0 0 0 ${r} ${e}, var(--oc-sdk-field-lift);`,yt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Po="box-shadow: var(--oc-sdk-lit);",Lt=`inset 0 0.5px 0 0 ${x(P,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,er=`
:root {
  --oc-sdk-edge: ${x(P,16)};
  --oc-sdk-field-bg: ${Ge};
  --oc-sdk-raised-bg: ${V};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${x(P,14)};
  --oc-sdk-field-bg: ${x(V,50,Ge)};
  --oc-sdk-raised-bg: ${Ge};
  --oc-sdk-field-lift: ${Lt};
  --oc-sdk-raised-lift: ${Lt};
  --oc-sdk-lit: ${Lt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,we=(e)=>{let r=R(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${r}; --oc-sdk-tone-text: ${R(`${e}-text`,"inherit")}; }`},n=(e)=>`calc(${e}rem / 14)`,tr=`
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
`,Go=`${er}
.oc-sdk { color: ${P}; font-family: ${qo}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${vo} }
.oc-sdk-mono { font-family: ${kt}; }
.oc-sdk-muted { color: ${I}; }
${we("success")}${we("warning")}${we("error")}${we("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${H}; --oc-sdk-tone-text: ${Ct}; }

.oc-sdk-btn { border-radius: ${Mt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Lo}; }
.oc-sdk-btn[data-variant="default"] { color: ${Ct}; background: ${x(H,10,V)}; border-color: ${x(H,12)}; ${Po} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${x(H,16,V)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${x(H,22,V)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Zo}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${M}, ${M}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${oe}; ${yt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${M}, ${M}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${j}, ${j}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${M}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${j}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${R("status-error","red")}; color: ${bt}; background: ${x("var(--oc-sdk-tone)",7,V)}; border-color: ${x("var(--oc-sdk-tone)",12)}; ${Po} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${x("var(--oc-sdk-tone)",9,V)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${x("var(--oc-sdk-tone)",11,V)}; box-shadow: none; }

.oc-sdk-field-note { color: ${I}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${bt}; }
.oc-sdk-input { border-radius: ${Mt}; background: var(--oc-sdk-field-bg); color: ${oe}; ${Nt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${I}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${M}, ${M}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Nt(x(P,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Nt(R("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${kt}; }

.oc-sdk-search-icon { color: ${I}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search-clear { border-radius: ${Lo}; color: ${I}; }
.oc-sdk-search-clear:hover { background: ${M}; color: ${P}; }

.oc-sdk-trigger { border-radius: ${Mt}; background: var(--oc-sdk-raised-bg); color: ${oe}; ${yt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${M}, ${M}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${I}; }
.oc-sdk-trigger-chevron { color: ${I}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${oe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Ge}; background-clip: padding-box; color: ${oe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${M}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${gt}; color: ${Ut}; }
.oc-sdk-option-check { color: ${P}; }
.oc-sdk-option[data-destructive="true"] { color: ${bt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${x(R("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${I}; }
.oc-sdk-popup-empty { color: ${I}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${W}; border-radius: 4px; color: ${P}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${x(P,60,W)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${W}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${V}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${H}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${vo} }
.oc-sdk-check-desc { color: ${I}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${x(P,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${I}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${P}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Ut}; background: ${gt}; border-color: ${W}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${oe}; background: var(--oc-sdk-raised-bg); ${yt} }
.oc-sdk-tab-count { color: ${I}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${x(P,6)}; color: ${I}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${x("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${M}; }
.oc-sdk-row[aria-selected="true"] { background: ${gt}; color: ${Ut}; }
.oc-sdk-row-lead { font-family: ${kt}; color: ${I}; }
.oc-sdk-row-sub { color: ${I}; }
.oc-sdk-row-meta { color: ${I}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${I}; }

.oc-sdk-empty-body { color: ${I}; }

.oc-sdk-spinner { color: ${I}; }
.oc-sdk-spinner-ring { border-color: ${W}; border-top-color: ${H}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${x("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${I}; }

.oc-sdk-separator { color: ${I}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${x(W,40)}; }

.oc-sdk-progress-label { color: ${I}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${x(P,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${H}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${R("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${R("success-text","inherit")}; }

.oc-sdk-text a { color: ${Ct}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${x(W,60)}; }
`,b=`
${ze}
${tr}
${Go}`;var ir=It();ir.onReady((e)=>xt(e,document.documentElement));})();
