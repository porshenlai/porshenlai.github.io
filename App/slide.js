(function(CS){

const currentScript = document.currentScript;
const jsPrefix=(/(.*\/)([^\/]+)(\?.*)?/.exec(currentScript.src)||['',''])[1];

async function loadScript (src,attrs={})
{	// {{{
	const se=document.createElement("script"),
	      rv=new Promise((or,oe)=>se.addEventListener("load",()=>or(se.value)));
	for(let key in attrs) se.setAttribute(key,attrs[key]);
	se.src=src;
	document.head.appendChild(se);
	return (await rv)||se;
}	// }}}

function* ancestors (se, ef=(e)=>!!e)
{	// generate all parent elements until ef() {{{
	while (ef(se)) {
		yield se;
		se=se.parentNode;
	}
}	// }}}

class sw {
	// TODO {{{
	constructor (csn='!hide') {
		this.S={};
		this.L=[];
		if (csn.startsWith('!')) {
			this.CSN=csn.substr(1);
			this.OP=(n,name)=>n!==name;
		} else {
			this.CSN=csn;
			this.OP=(n,name)=>n===name;
		}
	}
	add (name,elem) {
		this.S[name]=elem;
	}
	addlink (elem) {
		this.L.push(elem);
	}
	choose (name) {
		for (const n in this.S)
			this.S[n].classList[this.OP(n,name)?'add':'remove'](this.CSN);
		this.L.forEach((e)=>{ if(e.sw) e.sw.choose(name); });
	}
}	// }}}

const Plugins={
	"TeX":async function (slide) {
		return await loadScript(jsPrefix+'TeX.js');
	},
	"tab":async function (slide) { // {{{
		const es=Array.from(document.body.querySelectorAll('#content .tab'));
		if (es.length<=0)
			return console.log(`
Usaeg:
	<div class='tab'>
		<div><button TID="1">ONE</button><button TID="2">TWO</button></div>
		<div TAB="1">ONE ONE ONE</div>
		<div TAB="2">TWO TWO TWO</div>
	</div>
`);	
		es.forEach(function (C) {
			C.addEventListener('click',function (evt) {
				const tis=Array.from(C.querySelectorAll('[TID]')),
				      ti=tis.find((e)=>e.contains(evt.target));
				if(!ti) return;
				const tid=ti.getAttribute('TID');
				tis.forEach((e)=>e.classList[ti===e?'add':'remove']('active'));
				Array.from(C.querySelectorAll('[TAB]')).forEach((tab) => {
					setTimeout(()=>{
					tab.classList[tid===tab.getAttribute('TAB')?'remove':'add']('hide');
					},100);
					evt.stopPropagation();
					evt.preventDefault();
				});
			});
			C.querySelector('[TID]').click();
		});
	}	// }}}
};	// Built-in Plugins

class Aside
{	// Aside tutorial bar
	constructor (RE=document.body, CB={})
	{	// {{{
		this.RE=RE;

		((E)=>{ // create panel-overlay (mask) {{{
			E.addEventListener('click', (evt) => this.close());
			((S)=>{
				// [CSS] position:fixed; top:0; left:0; right:0; bottom:0;
				S.position="fixed";
				S.top=S.left=S.right=S.bottom=0;
				// [CSS] background:rgba(0,0,0,0.4); z-index:10001;
				S.background="rgba(0,0,0,0.4)";
				S.zIndex=10001;
				// [CSS] transition:opacity 0.3s ease, visibility 0.3s;
				S.transition="opacity 0.3s ease, visibility 0.3s";
			})(E.style);
			RE.appendChild(E);
		})(this.Overlay=document.createElement('div')); // }}}

		((E) => { // Aside bar {{{
			E.setAttribute("current","toc");
			E.innerHTML=`
<style>
aside {position:fixed;top:0;right:0;bottom:0;width:640px;max-width:80vw;font-size:24px;background:#fff;border-left:1px solid #eee;box-shadow:-2px 0 10px rgba(0,0,0,0.1);z-index:10002;transform:translateX(100%);transition:transform 0.3s ease;display:flex;flex-flow:column nowrap;justify-content:space-between;align-items:center;}
aside button {font-size:24px;border-radius:12px;padding:4px 12px;}
aside ol {list-style:none;padding:0;margin:0;}
aside li {margin: 4px 0;}
aside a {color:#0d5ea8;text-decoration:none;display:block;padding:6px 10px;border-radius:6px;font-size:20px;}
aside a:hover {background-color:#f0f5fa;}
aside a.active {font-weight:700;background-color:#e3f2fd;}
[current="settings"] [tab="toc"], [current="toc"] [tab="settings"] {display:none;};
[tab="toc"], [tab="settings"] {flex:1;overflow-y:auto;padding:1rem;}
</style>
<div style="padding:0.5rem 1rem;border-bottom:1px solid #eee;width:100%;">
	<h3 style="margin:0;color:#0d5ea8;white-space:nowrap;">
		[<input type='checkbox' action="fsToggle" style='width:24px;height:24px;'></input>]
		<button tab="settings" action="showTOC">導覽</button>
		<span tab="settings">設定</span>
		<span tab="toc">導覽</span>
		<button tab="toc" action="showSettings">設定</button>
	</h3>
</div>
<div style="flex:1 1 auto;overflow-y:auto;width:100%;padding:32px;">
	<nav tab='toc'><ol></ol></nav>
	<div tab='settings'>
		<div UID='fontsize' style='display:flex;justify-content:space-between;align-items:flex-start;'>
			<label style="color:#222;font-size:20px;">字型大小</label>
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<button action="fontDecreaseBtn" title="縮小字型">-</button>
				<span action="fontDisplay">100%</span>
				<button action="fontIncreaseBtn" title="放大字型">+</button>
			</div>
		</div>
		<div UID='queryKws'><div>
			<span action='openFilter'></span> <select handle='addValue'></select>
		</div></div>
	</div>
</div>
<div style="padding:0.5rem 1rem;border-top:1px solid #eee;background:#fcfcfc;width:100%;display:flex;flex-flow:row nowrap;justify-content:space-between;">
	<span style='width:0px;overflow:display;white-space:nowrap;'>© 2025 Porshen Lai</span>
	<span style='background:#fff;gap:10px;'>
		<button action="prevBtn" title="上一節 Prev (←)">←</button>
		<span uid="counter" style='{font-size:20px;color:#666;width:100%;text-align:center;}'></span>
		<button action="nextBtn" title="下一節 Next (→)">→</button>
	</span>
</div>`;
			E.addEventListener('change', (evt) => {
				let e = evt.target;
				switch(e.getAttribute("handle")){
				case 'addValue':
					((se,val)=>{
						const vs=se.textContent.split('.').filter((v)=>v);
						vs.push(val);
						se.textContent=vs.join('.');
					})(e.parentNode.querySelector('span'),e.value);
					e.value='-';
					break;
				}
			});
			E.addEventListener('click', (evt) => {
				let e = evt.target;
				switch(e.getAttribute("action")){
				case "fsToggle": if(CB.fullscreen) CB.fullscreen(e.checked); break;
				case "prevBtn":
					if (CB.activate) CB.activate(-1); break;
				case "nextBtn":
					if (CB.activate) CB.activate(1); break;
					break;
				case "fontDecreaseBtn":
					if (CB.applyFontScale) CB.applyFontScale(-0.05);
					break;
				case "fontIncreaseBtn":
					if (CB.applyFontScale) CB.applyFontScale(0.05);
					break;
				case 'openFilter':
					window.open(
						location.href.replace(location.hash,'')+
						'?s='+e.textContent+
						location.hash
					);
					break;
				case "showTOC":
					this.E.setAttribute("current","toc");
					break;
				case "showSettings":
					this.E.setAttribute("current","settings");
					break;
				default:
					if (e.dataset.sid) {
						evt.preventDefault();
						if (CB.activate) CB.activate(e.dataset.sid);
						this.close();
					}
					break;
				}
				evt.stopPropagation();
			});
			this.Overlay.appendChild(E);
			return E;
		})(this.E=document.createElement("aside")); // }}}

		((E) => { // Dialog Element {{{
			E.setAttribute('style','display:none;flex-flow:column nowrap;position:absolute;left:5%;top:5%;right:5%;bottom:5%;overflow:hidden;');
			E.innerHTML=`
<div UID='Caption' style='border-bottom:2px solid gold;margin-bottom:4px;padding:0 4px;border-radius:4px;background:white;'></div>
<section style='flex:1 1 auto;height:100%;background:white;padding:0 4px;margin:4px 0;border-radius:6px;overflow:hidden;'></section>
`;
			this.Overlay.appendChild(E);
			E.appendChild(E.Caption=E.querySelector('[UID="Caption"]'));
			E.appendChild(E.View=E.querySelector('section'));
			E.View.addEventListener('click',(evt)=>{
				evt.stopPropagation();
				evt.preventDefault();
			});
		})(this.DE=document.createElement("div")); // }}}

		this.close();
	}	// }}}
	update (index, total)
	{	// update status information {{{
		if (index&&total) {
			this.E.querySelector('[uid="counter"]').textContent=index+' / '+total;
			this.E.querySelector('[action="prevBtn"]').disabled=(index===1);
			this.E.querySelector('[action="nextBtn"]').disabled=(index===total);
			Array.from(this.E.querySelectorAll('[tab="toc"]>ol a'))
				.forEach((link, i) => link.classList.toggle('active', i === index-1));
		}
		this.E.querySelector('[action="fsToggle"]').checked = !!document.fullscreenElement;
	}	// }}}
	install (content)
	{	// install TOC table {{{
		const tl=this.E.querySelector('[tab="toc"]>ol');
		Array.from(content.querySelectorAll('section'))
		.forEach((sec, idx) => {
			let t=sec.getAttribute("title") || sec.querySelector('h1') || sec.querySelector('h2');
			if (t) {
				if (t.nodeType===1)
					t=t.textContent.trim();
				const li = document.createElement('li');
				while (li.firstChild) li.removeChild(li.firstChild);
				const a = document.createElement('a');
				//a.href = '#' + sec.getAttribute('SID');
				a.textContent = t;
				a.dataset.sid = sec.getAttribute('SID');
				li.appendChild(a);
				tl.appendChild(li);
			}
		});
		// install keywords selector
		((E)=>{
			E.querySelector('select[handle="addValue"]').innerHTML=content.Keywords.reduce(
				(r,v)=>r+'<option>'+v+'</option>',
				'<option value="-">+</option>'
			);
		})(this.E.querySelector('[UID="queryKws"]'));
	}	// }}}
	installSetting (elem)
	{	// {{{
		const pe=this.E.querySelector('div[tab="settings"]'),
		      oe=pe.querySelector(`[UID=${elem.getAttribute("UID")}]`);
		pe.insertBefore(elem,oe);
		if(oe) pe.removeChild(oe);
	}	// }}}
	open (dialog)
	{	// launch aside bar {{{
		// if (document.fullscreenElement) document.exitFullscreen();
		((S)=>{ // [CSS] opacity:1; visiblity:visible;
			S.opacity=1;
			S.visibility='visible';
		})(this.Overlay.style);
		if (dialog) {
			this.E.style.transform='translateX(100%)';
			if (dialog.hasAttribute('caption'))
				this.DE.Caption.textContent=dialog.getAttribute('caption');
			while(dialog.firstChild) this.DE.View.appendChild(dialog.firstChild);
			this.DE.style.display='flex';
		} else {
			this.DE.style.display='none';
			this.E.style.transform='translateX(0)';
		}
	}	// }}}
	close ()
	{	// hide aside bar {{{
		((S)=>{
			// CSS: { opacity:0; visiblity:hidden; }
			S.opacity=0;
			S.visibility="hidden";
		})(this.Overlay.style);
		while (this.DE.Caption.firstChild) this.DE.Caption.removeChild(this.DE.Caption.firstChild);
		while (this.DE.View.firstChild) this.DE.View.removeChild(this.DE.View.firstChild);
		// [CSS] transform: translateX(100%);
		this.E.style.transform="translateX(100%)";
	}	// }}}
	toggle ()
	{	// toggle aside bar {{{
		this["hidden" === this.Overlay.style.visibility ? "open" : "close"]();
	}	// }}}
}

class Slides
{
	constructor (RE)
	{	// {{{
		this.current=undefined;
		this.fontScale=1.0;
		this.NextSID=0;
		this.Plugins={};
		this.EventHook={};
		this.Content=RE.querySelector('#content');

		(()=>{ // install built-in style {{{
			const S=document.createElement("style")
			const PAGE=`
:root {--base-font-size:24px;}
* {box-sizing:border-box;}
html {font-size:var(--base-font-size);scroll-behavior:smooth;}
html, body {height:100%;}
body {margin:0;font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,-apple-system,Segoe UI,Arial;color:#222;background:#fff;line-height:1.6;display:flex;flex-direction:column;opacity:0;}
`;
			const SECTION=`
#content {flex:1;padding:0;overflow:hidden auto;background:#f0f0f0;}
#content section {margin:1.5rem 1rem 1.5rem 1rem;scroll-snap-align:none;background:white;}
#content[playmode="page"] {margin:0;border:0;padding:0;overflow:hidden;scroll-snap-type:y mandatory;}
#content[playmode="page"] section {margin:0.5rem;height:calc(100% - 1rem);min-height:calc(100% - 1rem);padding:1.25rem;croll-snap-align:start;overflow-y:auto;scroll-margin-top:0.5rem;}
section {margin:1.75rem 0 2.25rem 0;padding:1.25rem;border:2px solid #e6e6e6;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.03);transition:border-color 0.4s ease,box-shadow 0.4s ease,background-color 0.4s ease;cursor:pointer;scroll-margin-top:1.5rem;}
section:hover {border-color:#ccc;}
section.current-section {border-color:#26A69A;background-color:#f6fffd;box-shadow:0 4px 16px rgba(38, 166, 154, 0.2);cursor:default;}
`;
			const BASIC=`
.title {font-size:clamp(1.75rem, 4vw, 2.5rem);font-weight:800;margin:0 0 0.375rem 0;color:#1E88E5;}
.subtitle {font-size:clamp(1rem, 2.4vw, 1.25rem);color:#666;margin:0;}
.hide {display:none;}
.frame {margin:16px 4px;padding:8px;border:2px dashed silver;border-radius:8px;background:#F0FFF0;}
h2 {margin:0 0 0.625rem 0;font-size:1.375rem;color:#1E88E5;}
h3 {margin:0.625rem 0;font-size:1.125rem;color:#0d5ea8;}
ul, ol {margin:8px 0 8px 22px;}
button {appearance:none;border:1px solid #cfd8dc;background:#fff;padding:8px 12px;border-radius:10px;cursor:pointer;font-size:95%;}
button:hover {border-color:#90a4ae;}
#content[playmode="page"] section.cm { display:flex;flex-flow:column nowrap;align-items:center;justify-content:center;}
#content[playmode="page"] section.full { margin:0;padding:0;border:0;height:100%;scroll-margin-top:0; }

[action] { cursor:pointer; }
[action]:hover { text-decoration:underline; }
[action="display"] { text-decoration:underline;color:blue; }
[action="display"] [caption] { display:none; }

.black { color:black; }
.grey { color:grey; }
.red { color:red; }
.green { color:green; }
.blue { color:blue; }
.brown { color:brown; }
.orange { color:orange; }
.purple { color:purple; }
`;
			S.innerHTML=PAGE+SECTION+BASIC;
			document.head.appendChild(S);
		})(); // }}}

		this.Aside=new Aside(document.body, {
			"activate": (s) => this.activate(s, true),
			"fullscreen": (mode) => {
				if (mode) {
					if(!document.fullscreenElement) document.body.requestFullscreen();
				} else if(document.fullscreenElement) document.exitFullscreen();
			},
			"applyFontScale": (scale) => this.applyFontSize(this.fontScale + scale)
		});

		((E)=>{ // Launch PAD {{{
			E.id="control-panel";
			E.innerHTML=`
<style>
#control-panel {position:fixed;bottom:0;left:0;display:flex;flex-flow:row wrap;width:150px;padding:10px;z-index:10000;pointer-events:none;}
#control-panel [action] {width:50px;height:50px;margin:5px;display:flex;justify-content:center;align-items:center;background-color:#3498db;color:white;font-weight:bold;font-size:20px;border-radius:5px;user-select:none;cursor:pointer;pointer-events:auto;}
#control-panel>[action="none"] {background:rgba(0,0,0,0);border:1px solid silver;}
#control-panel:not(.active) :not([action="none"]) {display:none;}
</style>
<div action="prev">◀</div>
<div action="menu">☰</div>
<div action="none"> </div>
<div action="next">▶</div>
`;
			E.addEventListener('mouseover',(evt)=>E.classList.add('active'));
			E.addEventListener('click',(evt)=>{
				const func=evt.target.getAttribute('action');
				switch(func){
				case 'none':
					E.classList.toggle('active');
					break;
				case 'menu':
					E.classList.remove('active'); this.Aside.open(); break;
				case 'prev':
					E.classList.remove('active');
					this.activate(-1, true);
					break;
				case 'next':
					E.classList.remove('active');
					this.activate(1, true);
					break;
				default:
					return;
				}
				evt.preventDefault();
			});
			this.Content.appendChild(E);
		})(document.createElement("div")); // }}}

		setInterval(()=>{ let eh=this.EventHook.tick; if(eh) for(let n in eh) eh[n](); },1000)
	}	// }}}
		
	async init (Args={})
	{	// async init {{{
		// Process <section>s in #content, and create this.Content

		const content=this.Content;

		// A. fix sections
		((selector) => {
			// filter sections, generate SIDs, and calc total number of pages
			content.Keywords={}; // content.Keywords : 所有定義的 Keywords
			content.PageCounts=Array.from(content.querySelectorAll('section')).reduce((r,s)=>{
				const ks=(s.getAttribute('ks')||'').split(/[,\s]/).filter((v)=>v);
				ks.forEach((k)=>content.Keywords[k]=true);
				if (selector&&(!selector.find((ss)=>ss.reduce((r,k)=>(r && (ks.indexOf(k)>=0)),true)))) {
					if (s.parentNode) s.parentNode.removeChild(s); // filter out pages
				} else {
					r++;
					if (!s.hasAttribute('SID')) s.setAttribute('SID',r);
				}
				return r;
			}, 0);

			content.Keywords=Object.keys(content.Keywords);
			// fill title values
			((te)=>{
				if (te) return;
				document.head.appendChild(te=document.createElement('title'));
				te.textContent=Args.title||(
					content.querySelector('.title')||content.querySelector('h1')||content.querySelector('h2')||{textContent:"Presentation"}
				).textContent;
			})(document.head.querySelector('title'));
		})(Args.s);

		// B. install styles for sections
		content.insertBefore(((s)=>{
			s.innerHTML=`
.cb { white-space: nowrap; padding-left:48px; font-weight:bolder; overflow-x:auto; }
`;
			return s;
		})(document.createElement("style")),content.firstChild);

		content.addEventListener('click', (evt) => {
			for (let e=evt.target; e!==content; e=e.parentNode){
				if (e.hasAttribute('action')) {
					this.handleAction(e,evt);
					evt.stopPropagation();
					evt.preventDefault();
					break;
				}
				if (e.tagName==='SECTION') { this.activate(e); break; }
			}
		});

		content.addEventListener('change', (evt) => {
			for (let e=evt.target; e!==content; e=e.parentNode){
				if (e.hasAttribute('action')) {
					this.handleAction(e,evt);
					evt.stopPropagation();
					break;
				}
			}
		});

		content.addEventListener('scrollend', (evt) => { // auto activate page when current slide out of viewport
			let s,x=this.Content.getBoundingClientRect().height/3;
			for (s=this.Content.firstChild; s; s=s.nextSibling) if(s.nodeType===1) {
				const eb=s.getBoundingClientRect();
				if ((eb.y+eb.height)>x) break;
			}
			if (s&&document.fullscreenElement) this.activate(s);
		});
	}	// }}}

	activate (section, scroll)
	{	// activate specified section {{{
		section = (()=>{
			switch (section) {
			case 1 :
				for (let s=this.current.nextSibling; s; s=s.nextSibling) if (s.tagName==='SECTION') return s;
				return;
			case -1 :
				for (let s=this.Content.firstChild,h=[]; s; s=s.nextSibling) if (s.tagName==='SECTION') {
					if (s===this.current) return h.pop(); else h.push(s);
				}
				return;
			default:
				if ('string'===typeof(section)) section=this.Content.querySelector(`[SID="${section}"]`); 
				return section;
			}
		})();
		if (!section) return;

		if (section!==this.current) {
			this.current=section;
			// Update current section class tag
			Array.from(section.parentNode.querySelectorAll('.current-section')).forEach((s)=>s.classList.remove('current-section'));
			section.classList.add('current-section');
			this.Plugins.TeX.resolve(section).then(console.log,console.log);
			if (this.Aside) this.Aside.update(parseInt(section.getAttribute('SID')), section.parentNode.PageCounts);
			// Update URL hash and scroll into view
			if (history.replaceState)
				history.replaceState(null, null, '#' + section.getAttribute('SID'));
			else location.hash = '#' + section.getAttribute('SID');
		}

		if (scroll!==undefined){
			setTimeout(()=>{
				this.current.scrollIntoView({ behavior: scroll ? 'smooth' : 'auto', block: 'start' });
				this.current.scrollTop=0;
				//setTimeout(()=>(this.Content.getAttribute('playmode')==='page'?this.current:this.Content).focus(),1000);
			},1);
		}
		//const eb=section.getBoundingClientRect();
		//if ((eb.top+50>this.Content.clientHeight)||(eb.top+eb.height<50))
	}	// }}}

	set (name, value)
	{	// set/unset parameters {{{
		switch (name) {
		case 'pagemode':
			this.Content.setAttribute("playmode",value ? "page" : "continuous");
		}
	}	// }}}

	regEventHook (cat, name, handler)
	{	// (un)schedule a tick callback {{{
		let eh=this.EventHook[cat]||(this.EventHook[cat]={});
		if(handler) eh[name]=handler;
		else delete eh[name];
	}	// }}}

	async install (name, handler)
	{	// install page plugin {{{
		this.Plugins[name]=await Promise.resolve(handler(this));
	}	// }}}

	applyFontSize (scale)
	{	// apply font size {{{
		const DEFAULT_FONT_SIZE=((w,h)=>w>h ? Math.floor(h/26) : Math.floor(w/30))(window.innerWidth,window.innerHeight);
		if(scale) this.fontScale = Math.max(0.8, Math.min(1.5, scale));
		document.documentElement.style.setProperty(
			'--base-font-size',
			`${DEFAULT_FONT_SIZE * this.fontScale}px`
		);
		this.Aside.E.querySelector('[action="fontDisplay"]').textContent = `${Math.round(this.fontScale * 100)}%`;
	}	// }}}

	handleAction (e)
	{ // {{{
		console.log("handleAction-",e);
		(e.getAttribute('action')||"").split(";").forEach((a)=>{
			a=(a||"").split(',');
			const cmd=a[0]; a[0]=e;
			if(cmd) this[cmd].apply(this,a);	
		});
	}	// }}}

	tab (e, name='tab', cls='hide')
	{ // <select action='tab,tab,hide'> {{{
		const key=e.value;
		let se=this.Content;
		for (se=e;se&&se.tagName!=='SECTION';se=se.parentNode);
		for (let te of Array.from(se.querySelectorAll(`[${name}]`)))
			te.classList[te.getAttribute(name)===key ? 'remove' : 'add'](cls);
	} // }}}

	speak (te, lang='en')
	{	// <span action='speak,fr'>bonjour</span> {{{
		let e,text;
		for(e=event.target;e!==te&&(!e.hasAttribute('x'));e=e.parentNode);
		text=e.getAttribute('text') || e.textContent;
		text=text.replaceAll(/[🔈]/g,'').split(/\s+/).filter((v)=>v).join(' ');
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = lang; // 根據語言代碼設定發音引擎
			utterance.rate = (lang.startsWith('ko')||lang.startsWith('ja')) ? 1.0 : 0.8;
			speechSynthesis.speak (utterance);
			if (e.getAttribute('x'))
				alert(e.getAttribute('x').replace(/;/,'\n')+'\n'+text);
        } else alert('您的瀏覽器不支援 Speech Synthesis API。');
    }	// }}}

	goto (e, key)
	{	// <button action='goto,keyword'> {{{
		let ts=this.Content.querySelector(`section[ks~="${key}"]`);
		console.assert(ts,'goto() => target not found');
		if (ts) this.activate(ts,true);
	}	// }}}

	async show (e, code)
	{	// <button action='show,RID_Key'> {{{
		//console.log(this.Plugins.TeX.resolve());
		let lang=e.getAttribute('lang');
		if (!code) code=e.getAttribute('code');
		if (code) {
			if (!lang) {
				lang=document.body.querySelector(`[RID="${code}"]`);
				code=lang.value || lang.cloneNode(true); 
				lang=lang.getAttribute('lang');
			}
		} else {
			code=e.querySelector('[caption]');
			if (code) return this.Aside.open(code.cloneNode(true));
		}
			
		const de=document.createElement("div");
		de.appendChild(document.createElement("div"));
		de.firstChild.style.overflow="auto";
		de.firstChild.style.width=de.firstChild.style.height="100%";

		switch (lang) {
		case 'mermaid':
			de.firstChild.setAttribute('style','text-align:center');
			await this.Plugins.TeX.renderMermaid(de.firstChild,code);
			break;
		case 'image':
			de.firstChild.outerHTML=`<div style='overflow:auto;height:100%;'><img src='${code}' style='object-fit:none;'/></div>`
			break;
		case 'photo':
			de.firstChild.outerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><img src='${code}' style='object-fit:contain;width:100%;height:100%;'/></div>`
			break;
		default:
			if (code.nodeType===1) de.firstChild.appendChild(code); else return;
			break;
		}

		de.setAttribute('caption',e.getAttribute('caption')||"");
		de.firstChild.addEventListener('click',(evt)=>{
			for (let e=evt.target; e.nodeType===1; e=e.parentNode){
				if (e.hasAttribute('action')) {
					this.handleAction(e);
					evt.stopPropagation();
					evt.preventDefault();
				}
			}
		});
		return this.Aside.open(de);
	}	// }}}
}

document.addEventListener('DOMContentLoaded', async () => { // {{{
	const loading=document.createElement("div");
	loading.beginTS=(new Date()).getTime();
	loading.style.textAlign='center';
	loading.textContent='Loading ...';
	document.body.insertBefore(loading,document.body.firstChild);

	// 1. Create {args} according to {location.search}
	const args=(location.search||'?').substr(1).split('&').reduce((r,a)=>{
		const pa=/^([^=]+)=(.*)$/.exec(a);
		if (pa) {
			switch (pa[1]) {
			case 's' :
				r[pa[1]]=decodeURIComponent(pa[2]).split('|').map((v)=>v.split('.')); break;
			default:
				r[pa[1]]=decodeURIComponent(pa[2]); break;
			}
		} else r[a] = true;
		return r;
	},{});

	// 2. Create Slide Instance
	let MS=window.App=new Slides(document.body);
	await MS.init(args);

	// 3. Install slide plugins
	for (const name of (CS.getAttribute('plugins')||"").split(',')) {
		if (name in Plugins)
			await MS.install(name,Plugins[name]);
		else if(name)
			await MS.install(name,await loadScript(currentScript.getAttribute("src").replace(/\.js/,`_${name}.js`)));
	}
	MS.Aside.install(MS.Content);

	// 4. Bind Events
	document.addEventListener('fullscreenchange', ()=>{
		if (document.fullscreenElement) {
			MS.set('pagemode', true);
			MS.Aside.update();
			MS.Aside.close();
			setTimeout(()=>MS.activate(MS.current, true),1000);
		}
	});
	window.addEventListener('keydown', (e) => {
		if (e.key==='ArrowLeft') {
			MS.activate(-1, true);
		} else if (e.key==='ArrowRight') {
			MS.activate(1, true);
		} else if (e.key==='Escape')
			MS.Aside.toggle();
		else return;
		e.preventDefault();
	});
	window.addEventListener('resize',(e) => MS.applyFontSize());

	// 5.1 Initialize the font size of play session
	MS.applyFontSize (1.0);
	// 5.2 Initialize the page hash to latest viewed page
	setTimeout((section)=>{
		MS.activate(section, false);
		loading.parentNode.removeChild(loading);
		document.body.style.opacity='1';
		console.log(`${(new Date()).getTime()-loading.beginTS} elapsed.`);
	}, 1, MS.Content.querySelector(location.hash ? `section[SID="${location.hash.substr(1)}"]` : "section"));
});	// }}}

})(document.currentScript);
