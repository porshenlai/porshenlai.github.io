(function(CS){

const currentScript = document.currentScript;
const jsPrefix=(/(.*\/)([^\/]+)(\?.*)?/.exec(currentScript.src)||['',''])[1];

const CSS_PAGE= // {{{
`:root {
	--base-font-size:24px;
	--base-margin:calc(var(--base-font-size) / 3);
	--base-indent:var(--base-font-size);
}
* {
	box-sizing:border-box;
}
html, body {
	height:100%; margin:0;
}
body {
	font-size:var(--base-font-size);
	font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,-apple-system,Segoe UI,Arial;
	line-height:1.5;
	color:#222; background:#fff;
	display:flex; flex-direction:column;
	scroll-behavior:smooth; overflow:hidden;
	opacity:0;
}
body>main {
	flex:1 1 auto; width:100%; height:90%;
}
body>header,
body>footer {
	display:flex; flex-direction:row;
	justify-content:space-between; align-items:center;
}
[data-uid="ControlPanel"] { color:black;background:silver; }
@media screen and (orientation: landscape) {
	[data-uid="ControlPanel"] {
		position:absolute;
		bottom:0; width:100%;
		color:silver;background:rgba(255,255,255,0.5);
	}
}
[data-uid="ControlPanel"] [data-h]:hover { color:blue; }

#content {
	width:100%; height:100%;
	overflow:hidden scroll;
	background:#f0f0f0;
}
#content.byPage {
	scroll-snap-type:y mandatory;
}`;	// }}}
const CSS_CONTENT= // {{{
`section {
	margin:var(--base-margin);
	padding:calc(2 * var(--base-margin));
	border:2px solid #e6e6e6;
	border-radius:14px;
	box-shadow:0 2px 8px rgba(0,0,0,0.03);
	transition:border-color 0.4s ease,box-shadow 0.4s ease,background-color 0.4s ease;
	scroll-margin-top:var(--base-margin);
	background:white;
	cursor:pointer;
}
section:hover { border-color:#ccc; }
section.current-section {
	border-color:#26A69A;
	box-shadow:0 4px 16px rgba(38, 166, 154, 0.2);
	cursor:default;
}
.byPage section, section.cfbox {
	min-height:calc(100% - 2 * var(--base-margin));
}
section.cfbox {
	display:flex;
	flex-flow:column nowrap;
	justify-content:center;
	align-items:center;
}

[data-h] { cursor:pointer; }

[data-h^="tab:"],[data-h="switch"] { display:flex; flex-flow:row nowrap; }
[data-h^="tab:"] [data-o],
[data-h="switch"] [data-o] {
	flex:1 1 auto; border:2px solid silver; border-radius:4px;
	margin:2px 1px 0 1px; background:white; text-align:center;
}
[data-h="switch"] [data-o].selected { color:blue; border-color:blue; }
[data-h^="tab:"] [data-o].selected { border-bottom-color: transparent; }

[data-h^="set:"] [data-o].selected { color:blue; }

[data-h="display"] { text-decoration:underline;color:blue; }
[data-h="display"] [caption] { display:none; }

button {
	appearance:none;
	border:1px solid #cfd8dc;
	background:#fff;
	padding:8px 12px;
	border-radius:10px;
	cursor:pointer;
	font-size:95%;
}
button:hover { border-color:#90a4ae; }
h1 {
	font-size:172%;
	font-weight:bold;
	color:#1E88E5;
	margin:var(--base-margin) 0;
	text-align:center;
}
h2 {
	font-size:144%;
	font-weight:bold;
	color:#1E88E5;
	margin:var(--base-margin);
}
h3 {
	font-size:120%;
	font-weight:bold;
	color:#0d5ea8;
	margin:var(--base-margin);
}

.hide { display:none; }
.disabled { display:none; }
.centerBox { display:flex;flex-flow:column nowrap;align-items:center;justify-content:center;margin:auto; }
.cb { white-space: nowrap; padding-left:var(--base-indent); font-weight:bolder; overflow-x:auto; }
.frame { margin:16px 4px; padding:8px; border:2px dashed silver; border-radius:8px; background:#F0FFF0; }
.signature { text-align:right; font-style:italic; }
.black { color:black; }
.grey { color:grey; }
.red { color:red; }
.green { color:green; }
.blue { color:blue; }
.brown { color:brown; }
.orange { color:orange; }
.purple { color:purple; }
`; // }}}

const HTML_CONTROL= // {{{
`
<span data-h="set:Page:prev">◀</span>
<span>
	<span data-h="toggleAside:1">☰</span>
	<span>&copy; Porshen & Cyberpiers 2026</span>
</span>
<span data-h="set:Page:next">▶</span>
`;	// }}}
const HTML_MAIN= // {{{
`
<style>
[data-uid="Overlay"] {
	position:fixed; top:0; left:0; right:0; bottom:0; z-index:10001; background:rgba(0,0,0,0.4);
	visibility:hidden; opacity:0;
	transition:opacity 0.3s ease, visibility 0.3s;
}
[data-uid="Overlay"].menu, [data-uid="Overlay"].dialog {
	visibility:visible; opacity:1;
}

aside {
	position:fixed; top:0; right:0; bottom:0; z-index:10002;
	min-width:calc(var(--base-font-size) * 24); max-width:90vw;
	border-left:1px solid #eee; box-shadow:-2px 0 10px rgba(0,0,0,0.1);
	font-size:72%;
	transform:translateX(100%);transition:transform 0.3s ease;
	display:flex; flex-flow:column nowrap; justify-content:space-between; align-items:center;
}
.menu aside { transform:translateX(0); }

[data-uid="Dialog"] {
	position:fixed; overflow:hidden auto;
	left:var(--base-margin); top:var(--base-margin); right:var(--base-margin); bottom:var(--base-margin);
	display:none; flex-flow:column nowrap;
}
.dialog [data-uid="Dialog"] { display:flex; }

aside [data-uid^="Settings:"] { margin:4px;padding:4px 8px;border:2px solid silver;border-radius:8px; }
aside [data-uid^="Settings:"] label { font-size:110%; font-weight:bold; }

aside nav ol { list-style:none; padding:0; margin:0;}
aside nav li { border-bottom:1px solid silver; }

[data-uid="Settings:Keywords"] {
	display:flex; flex-flow:row wrap; justify-content:space-between; align-items:center;
} 
[data-uid="Settings:Keywords"]>div {
	flex:1 1 auto; border-bottom:1px solid black; margin:1px 4px;
}
[data-uid="Settings:Keywords"]>div:hover {
	color:blue; border-color:blue;
}
</style>

<div id='content'></div>
<div data-uid='Overlay' data-h='toggleAside:0'>
	<div data-uid='Dialog'>
		<div style='border-bottom:2px solid gold;margin-bottom:4px;padding:0 4px;border-radius:4px;background:white;'></div>
		<section style='flex:1 1 auto;height:100%;background:white;padding:0 4px;margin:4px 0;border-radius:6px;overflow:hidden;'></section>
	</div>
<style>
.HSelect { display:flex;flex-flow:row nowrap;align-items:center;width:100%; }
.HSelect>[data-o] { flex:1 1 auto;text-align:center;border:1px solid black;border-radius:8px;margin:0 4px; }
.HSelect>[data-o].selected { color:blue;border-color:blue; }
.HSelect>[data-o]:hover { background:lightgrey; }
</style>
	<aside data-h='nop'>
		<div data-h="tab:ASIDE" style='width:100%;background:white;'>
			<div data-o="TOC" class='selected'>導覽</div>
			<div data-o="Settings">設定</div>
		</div>
		<div style="flex:1 1 auto;overflow:hidden auto;width:100%;height:100%;padding:2px 8px;margin:0;background:white;">
			<nav class='tabPage selected' data-uid='ASIDE:TOC'></nav>
			<div class='tabPage' data-uid='ASIDE:Settings'>
				<div data-uid='Settings:PlayMode'>
					<label>播放模式</lable>
					<div data-h='set:PlayMode' class='HSelect'>
						<div data-o='0' class='selected'>連續</div>
						<div data-o='1'>分頁</div>
						<div data-o='2'>獨立</div>
					</div>
				</div>
				<div data-uid='Settings:FontScale'>
					<label>字型縮放 (<output value='1'></output>)</label>
					<div style='display:flex;flex-flow:row nowrap;align-items:center;'>
						0.8 <input data-h='set:FontScale' type='range' min='0.8' max='1.5' step='0.1' value='1.0' style='flex:1 1 auto;width:100%'/> 1.5
					</div>
				</div>
				<div data-uid='Settings:KWFilters'>
					<div style='display:flex;flex-flow:row nowrap;justify-content:space-between;padding:2px 6px;'>
						<label>關鍵字篩選</label>
						<span data-h='filter:run'>➤</span>
					</div>
					<div data-uid='Settings:Keywords'><span data-h='filter:add'>➕</span></div>
					<div data-uid='Settings:Filters'></div>
				</div>
			</div>
		</div>
		<div data-uid='Aside:Pager' style="width:100%;display:flex;flex-flow:row nowrap;align-items:center;background:#eee;">
			<input style='flex:1 1 auto;width:100%;margin:0 4px;' data-h='set:Page' type='range' min='1'/>
			<output style='margin:0 4px;'></output> /
			<span></span>
		</div>
	</aside>
</div>
`;	// }}}

async function loadScript (src,attrs={})
{	// {{{
	const se=document.createElement("script"),
	      rv=new Promise((or,oe)=>se.addEventListener("load",()=>or(se.value)));
	for(let key in attrs) se.setAttribute(key,attrs[key]);
	se.src=src;
	document.head.appendChild(se);
	return (await rv)||se;
}	// }}}

function loadStyle (css, ukey, container)
{	// loadStyle (CSSText, "StylePage") {{{
	// loadStyle (CSSText, "StyleContent", this.Content)
	let be=undefined;
	if (container) be=container.firstChild; else container=document.head;
	if (!ukey || !container.querySelector(`#${ukey}`))
	{
		container.insertBefore(((e)=>{
			if(ukey) e.id=ukey;
			e.innerHTML=css;
			return e;
		})(document.createElement('style')), be);
	}
}	// }}}

function queryContainer (e, cs)
{	// {{{
	cs = Array.isArray(cs) ? cs : [cs];
	while(e instanceof Element) {
		for (c of cs)
			if (e.matches(c)) return e;
		e=e.parentNode;
	}
}	// }}}

const Plugins={
};	// Built-in Plugins

class EV {
	constructor () { this.QS=Array.from(arguments); }
	set (value) { this.QS.forEach((q)=>q.value=value); }
	get () { return this.QS[0].value; }
}

class Player
{
	constructor (sections, filters)
	{	// {{{
		// ## CURRENT SECTION 
		this.current=undefined;

		// ## ADD CSS DECLARATIONS
		loadStyle(CSS_PAGE, 'CSS_PAGE');
		loadStyle(CSS_CONTENT, 'CSS_CONTENT', this.Content);

		// ## APPEND <MAIN>/id='content' ELEMENT TO HOLD SECTIONS
		this.GC=(()=>{ // sections container
			let e=document.createElement("main");
			e.innerHTML=HTML_MAIN;
			this.Content=e.querySelector('#content');
			return e;
		})();

		// ## INSTALL SECTIONS
		this.PageIndex=[];
		((sections, filters)=>{
			// 1. complete id setting
			// 2. filter data-ks with disabled class
			// 3. update PageIndex and ksmap
			// 4. move sections to content box
			if (!sections) sections=this.get('*');

			let ksmap={};
			this.PageIndex=[];
			sections.reduce((E, se, k) => {
				// Organize keywords from data-ks 
				const ks=(se.dataset.ks||'').split(/[,\s]/).filter((v)=>v);
				ks.forEach((k)=>ksmap[k]=(ksmap[k]||0)+1);

				// ensure all sections has ID for location
				if(!se.id) se.id=`__${k}__`;
				E.appendChild(se);

				// filtering sections
				if (filters && (!filters.find((ss)=>ss.reduce((r,k)=>(r && (ks.indexOf(k)>=0)),true)))) {
					se.classList.add('disabled');
				} else {
					se.classList.remove('disabled');
					this.PageIndex.push(se.id);
				}
				return E;
			}, this.Content);

			// TODO move to Element Variable
			this.GC.querySelector('[data-uid="Aside:Pager"] input')
				.setAttribute("max",this.PageIndex.length);
			this.GC.querySelector('[data-uid="Aside:Pager"] span')
				.textContent=this.PageIndex.length;
			this.Content.Keywords=Object.keys(ksmap);
		})(sections, filters);

		// ## INSTALL EXTENSION MODULES (data-x="...") 
		this.Xs={};
		Promise.all(
			Array.from(this.Content.querySelectorAll('[data-x]'))
			.reduce((R,e)=>{
				R.push((async (T, N, E)=>{
					if (!T.Xs[N])
						T.Xs[N] = N in Plugins ?
							Promise.resolve(Plugins[N](T)) :
							loadScript(currentScript.getAttribute("src").replace(/\.js/,`_${N}.js`)) ;
					(await (T.Xs[N]))(T, E);
				})(this, e.dataset.x.split(':')[0], e));
				return R;
			},[])
		).then(()=>false,console.log);

		// ## INSTALL ELEMENT VARIABLE FOR PARAMETERS
		((Content)=>{
			this.Settings={ // Parameter Settings
				"FontScale" : new EV(
					this.GC.querySelector('[data-uid="Settings:FontScale"] input'),
					this.GC.querySelector('[data-uid="Settings:FontScale"] output') ),
				"PlayMode" : new (class extends EV {
					constructor (e) {
						super(e);
						this.set(this.get());
					}
					set (tv) {
						console.log("TV is ",tv,event.target);
						if (tv===undefined) tv=event.target.dataset.o;
						console.log("TV is ",tv);
						Array.from(this.QS[0].querySelectorAll('[data-o]'))
						.forEach((e)=>e.classList[e.dataset.o===tv?"add":"remove"]('selected'));
						const CNs=["PMCont","PMPage","PMAlone"];
						Content.classList.remove.apply(Content.classList,CNs);
						Content.classList.add(CNs[tv]);
					}
					get () {
						return this.QS[0].querySelector('[data-o].selected').dataset.o;
					}
				})(this.GC.querySelector('[data-h="set:PlayMode"]')),
				"Page" : new EV(
					this.GC.querySelector('[data-uid="Aside:Pager"] input'),
					this.GC.querySelector('[data-uid="Aside:Pager"] output') ),
				"Keywords" : new (class extends EV {
					constructor (e) {
						super(e);
						this.set(Content.Keywords);
					}
					set (a) {
						this.QS[0].innerHTML = a.reduce((r,k) =>
							r+`<div><input type='checkbox'/>${k}</div>`,'')
							+ "<span data-h='filter:add'>➕</span>";
					}
					get () {
						return Array.from(this.QS[0].querySelectorAll('input[type="checkbox"]'))
							.filter((e)=>e.checked)
							.map((e)=>e.parentNode.textContent);
					}
				})(this.GC.querySelector('[data-uid="Settings:Keywords"]')),
				"Filters" : new (class extends EV {
					constructor (e) {
						super(e);
						this.set(filters||[]);
					}
					set (aa) {
						this.QS[0].innerHTML = aa.reduce((r,a) =>
							r+"<div class='OR'>"+a.reduce((r,v)=>r.push(v)&&r,[]).join('&amp;')+"</div>", "");
					}
					get	 () {
						return Array.from(this.QS[0].querySelectorAll("div"))
							.reduce((r,v)=>r.push(v.textContent.split('&'))&&r,[])
					}
				})(this.GC.querySelector('[data-uid="Settings:Filters"]'))
			};
		})(this.Content)
		this.Settings.FontScale.set(1.0);

		// ## INSTALL TABLE of CONTENTS
		((sections)=>{
			const TOC=this.GC.querySelector('[data-uid="ASIDE:TOC"]');
			TOC.innerHTML="<ol>"+sections.reduce((rs, sec, idx) => {
				let t=sec.querySelector('h1') || sec.querySelector('h2');
				if (t) {
					t=t.textContent;
					rs+=`<li data-h="set:Page:#${sec.id}">${t}</li>`;
				}
				return rs;
			}, "")+"</ol>";
		})(this.get('*'));
	}	// constructor }}}

	get ()
	{	// get section element by hints (0,"id") {{{
		let rv=undefined;
		Array.from(arguments).find((section)=>{
			switch (section) {
			case 0 :
				return (rv=this.Content.querySelector('section:not(.disabled'));
			case '*' :
				return (rv=Array.from(this.Content.querySelectorAll('section:not(.disabled)')));
			default:
				if ('string' === typeof(section))
					section = this.Content.querySelector(`#${section}`); 
				return (rv=section);
			}
		});
		return rv;
	}	// }}}

	set (name, value)
	{	// set/unset parameters {{{
		switch (name) {
		case 'Page':
			((k)=>{
				let pn=undefined, PNE=this.Settings.Page;
				PNE.set(
					k.startsWith('#') ? this.PageIndex.indexOf(k.substring(1))+1 :
					k==='next' ? (parseInt(PNE.get())+1) :
					k==='prev' ? (parseInt(PNE.get())-1) : PNE.get()
				); 
				document.getElementById(this.PageIndex[PNE.get()-1]).click();
			})(value||this.Settings[name].get());
			break;
		case 'FontScale':
			((v)=>{
				this.Settings[name].set(v);
				const DFS=((w,h)=>w*26>h*30 ? Math.floor(h/26) : Math.floor(w/30))(
					window.innerWidth,
					window.innerHeight
				);
				document.documentElement.style.setProperty('--base-font-size', `${DFS * v}px`);
			})(value||this.Settings[name].get());
			break;
		case 'PlayMode':
			this.Settings[name].set(value);
			break;
		}
	}	// }}}

	activate (section, scroll)
	{	// activate specified section {{{
		section = this.get(section);
		if (!section) return;

		if (section !== this.current) {
			this.current=section;

			// move .current-section to new section element
			Array.from(
				section.parentNode.querySelectorAll('.current-section')
			).forEach((s)=>s.classList.remove('current-section'));
			section.classList.add('current-section');

			// Update URL hash and scroll into view
			if (history.replaceState)
				history.replaceState(null, null, '#' + section.id);
			else location.hash = '#' + section.id;

			this.Settings.Page.set(this.PageIndex.indexOf(section.id)+1);

			if (scroll !== undefined) {
				this.current.scrollIntoView({
					behavior: scroll ? 'smooth' : 'auto',
					block: 'start'
				});
				this.current.scrollTop=0;
			}
		}
	}	// }}}

	async install (name, handler)
	{	// install page plugin {{{
		this.Plugins[name]=await Promise.resolve(handler(this));
	}	// }}}

	regEventHook (cat, name, handler)
	{	// (un)schedule a tick callback {{{
		let eh=this.EventHook[cat]||(this.EventHook[cat]={});
		if(handler) eh[name]=handler;
		else delete eh[name];
	}	// }}}

	handleAction (e)
	{ // {{{
		(e.dataset.h||"").split(";").forEach((a)=>{
			a=(a||"").split(',');
			const cmd=a[0]; a[0]=e;
			if(cmd) this[cmd].apply(this,a);	
		});
	}	// }}}

	async speak (te, lang='en')
	{	// <span data-h='speak,fr'>bonjour</span> {{{
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

	playPhoto (url, caption)
	{	// {{{
		((DE)=>{
			DE.innerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><img src='${url}' style='object-fit:contain;width:100%;height:100%;'/></div>`;
		})(this.openDialog(caption));
	}	// }}}

	playImage (url, caption)
	{	// {{{
		((DE)=>{
			DE.innerHTML=`
<div style='overflow:hidden;height:100%;'>
	<img src='${url}' style='object-fit:cover;width:auto;height:auto;'/>
</div>`;
			DE.querySelector('img').addEventListener('load',()=>{
				const cr = DE.getBoundingClientRect();
				const as = (img.width*cr.height > img.height*cr.width)
						? ['height','overflow-x']
						: ['width','overflow-y'] ;
 				img.style[as[0]]='100%';
				DE.style[as[1]]='auto';
			})
		})(this.openDialog(caption));
	}	// }}}

	playObj (url, caption)
	{	// {{{
		((DE)=>{
			DE.innerHTML=`
<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'>
	<iframe src='${url}' style='width:100%;height:100%;'>
		<a href='${url}'>Not support, download to open</a>
	</iframe>
</div>`;
		})(this.openDialog(caption));
	}	// }}}

	playMermaid (code, caption)
	{	// {{{
		console.log(code, caption);
		//de.firstChild.setAttribute('style', 'text-align:center');
		//await this.Plugins.TeX.renderMermaid(de.firstChild, tgt);
	}	// }}}

	filter (cmd)
	{	// {{{
		if (cmd==='add') {
			//<div data-uid='Settings:Keywords'><span data-h='filter:add'>➕</span></div>
			let flts=this.Settings.Filters.get();
			console.log("DEBUG",flts);
			flts.push(this.Settings.Keywords.get());
			this.Settings.Filters.set(flts);
		} else if (cmd==='run') {
			function encodeFilter (aa) { return aa.map((a)=>a.join('.')).join('|'); }
			location.replace(`?s=${encodeFilter(this.Settings.Filters.get())}`);
		}
	}	// }}}

	toggleAside (v)
	{	// {{{
		(	(v&&parseInt(v)>0) ? (CL) => { // ON
				CL.add("menu");
				CL.remove("dialog");
			} : (CL) => CL.remove("menu","dialog") // OFF
		)(this.GC.querySelector('[data-uid="Overlay"]').classList);
	}	// }}}

	openDialog (caption)
	{	// {{{
		const CL=this.GC.querySelector('[data-uid="Overlay"]').classList;
		CL.add("dialog");
		CL.remove("menu");

		return ((DLG)=>{
			DLG.querySelector('div').textContent=caption;
			return DLG.querySelector('section');
		})(this.GC.querySelector('[data-uid="Dialog"]'));
	}	// }}}

	search (key)
	{	// {{{
		let ts=this.Content.querySelector(`section[data-ks~="${key}"]`);
		if (ts) ts.click();
		this.toggleAside(0);
	}	// }}}

	async dialog (mtype, tgt, capt)
	{	// {{{
		const de=document.createElement("div");
		de.appendChild(document.createElement("div"));
		de.firstChild.style.overflow="auto";
		de.firstChild.style.width=de.firstChild.style.height="100%";

		switch (mtype) {
		case 'mermaid':
			de.firstChild.setAttribute('style', 'text-align:center');
			await this.Plugins.TeX.renderMermaid(de.firstChild, tgt);
			break;
		case 'image':
			de.firstChild.outerHTML=`<div style='overflow:hidden;height:100%;'><img src='${tgt}' style='object-fit:cover;width:auto;height:auto;'/></div>`;
			((v)=>{
				const img=v.querySelector('img');
				img.addEventListener('load',()=>{
					const cr=v.getBoundingClientRect();
					const as=(img.width*cr.height > img.height*cr.width) ? ['height','overflow-x'] : ['width','overflow-y'];
 					img.style[as[0]]='100%';
					v.style[as[1]]='auto';
				});
			})(de.firstChild);
			break;
		case 'obj':
			de.firstChild.outerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><iframe src='${tgt}' style='width:100%;height:100%;'><a href='${tgt}'>Not support, download to open</a></iframe></div>`
			break;
		default:
			if (code.nodeType===1) de.firstChild.appendChild(code); else return;
			break;
		}
		de.firstChild.addEventListener('click',(evt)=>{
			for (let e=evt.target; e.nodeType===1; e=e.parentNode){
				if (e.dataset.h) {
					console.log(e.dataset.h)
					evt.stopPropagation();
					evt.preventDefault();
				}
			}
		});
		return this.Aside.open(de, capt||"");
	}	// }}}

	async show (e, code)
	{	// <button data-h='show,RID_Key'> {{{
		//console.log(this.Plugins.TeX.resolve());
		let lang = e.getAttribute('lang');
		if (!code) code = e.getAttribute('code');
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
			de.firstChild.outerHTML=`<div style='overflow:hidden;height:100%;'><img src='${code}' style='object-fit:cover;width:auto;height:auto;'/></div>`;
			((v)=>{
				const img=v.querySelector('img');
				img.addEventListener('load',()=>{
					const cr=v.getBoundingClientRect();
					const as=(img.width*cr.height > img.height*cr.width) ? ['height','overflow-x'] : ['width','overflow-y'];
 					img.style[as[0]]='100%';
					v.style[as[1]]='auto';
				});
			})(de.firstChild);
			break;
		case 'photo':
			de.firstChild.outerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><img src='${code}' style='object-fit:contain;width:100%;height:100%;'/></div>`
			break;
		case 'obj':
			de.firstChild.outerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><iframe src='${code}' style='width:100%;height:100%;'><a href='${code}'>Not support, download to open</a></iframe></div>`
			break;
		default:
			if (code.nodeType===1) de.firstChild.appendChild(code); else return;
			break;
		}

		de.setAttribute('caption',e.getAttribute('caption')||"");
		de.firstChild.addEventListener('click',(evt)=>{
			for (let e=evt.target; e.nodeType===1; e=e.parentNode){
				if (e.dataset.h) {
					this.handleAction(e);
					evt.stopPropagation();
					evt.preventDefault();
				}
			}
		});
		return this.Aside.open(de);
	}	// }}}
<<<<<<< HEAD

	tab (TK)
	{	// {{{
		const K=event.target.dataset.o, tb=queryContainer(event.target,'[data-h^="tab"]');
		tb.querySelectorAll(`[data-o]`).forEach((e)=>e.classList[event.target===e?"add":"remove"]("selected"));
		const tabs=queryContainer(tb,['section','aside']);
		tabs.querySelectorAll(`[data-uid^=${TK}]`).forEach((e)=>e.classList[e.dataset.uid!==`${TK}:${K}` ? "add" : "remove"]("hide"));
	}	// }}}
}

document.addEventListener('DOMContentLoaded', async () => { // {{{

	function decodeFilter (s) { return s ? s.split('|').map((v) => v.split('.')) : []; }
	function encodeFilter (aa) { return aa.map((a)=>a.join('.')).join('|'); }

	let UI = window.App = new (class extends Player {
		constructor (args)
		{	// {{{
			super(
				Array.from(document.querySelectorAll('section')).map((s)=>s.parentNode.removeChild(s)||true),
				args.s ? decodeFilter(args.s) : undefined
			);

			// modify DOM to contain the player
			document.body.insertBefore((()=>{
				// guidance bar
				let e=document.createElement("footer");
				e.dataset.uid='ControlPanel';
				e.innerHTML=HTML_CONTROL;
				return e;
			})(), undefined);
			document.body.insertBefore(this.GC, document.body.querySelector('footer'));

			if (args.byPage)
				this.GC.classList.add("byPage");
		}	// }}}
		nop () { }
		//	if(!document.fullscreenElement)
		//		document.body.requestFullscreen();
		//	if(document.fullscreenElement)
		//		document.exitFullscreen();
		_EH_ (evt)
		{	// {{{
			try {
				for (let e=evt.target; e!==this.GC; e=e.parentNode){
					if (e.dataset && e.dataset.h) {
						const args=e.dataset.h.split(':'), cmd=args.shift();
						if (cmd in this && 'function' === typeof(this[cmd])) {
							this[cmd].apply(this,args);
						} else continue;
						evt.stopPropagation();
						// evt.preventDefault(); // default handler essential to change events
						break;
					}
					if (e.tagName==='SECTION') { this.activate(e, true); break; }
				}
			} catch(x) { console.log("Exception:",x); }
		}	// }}}
		_KH_ (evt)
		{	// {{{
			try {
				if (evt.key==='ArrowLeft')
					this.set('Page','prev');
				else if (evt.key==='ArrowRight')
					this.set('Page','next');
				else if (evt.key==='Escape')
					this.toggleAside(1);
				else return;
				evt.preventDefault();
			} catch(x) { }
		}	// }}}
	})(
		(location.search||'?').substr(1).split('&')
		.reduce((r,a) => {
			const pa = /^([^=]+)=(.*)$/.exec(a);
			if (pa) r[pa[1]] = pa ? decodeURIComponent(pa[2]) : true;
			return r;
		}, {})
	);

	document.body.addEventListener('click',(evt)=>UI._EH_(evt));
	document.body.addEventListener('change',(evt)=>UI._EH_(evt));
	window.addEventListener('keydown', (evt) => UI._KH_(evt));
	window.addEventListener('resize', (evt) => UI.set('FontScale'));

	setTimeout( (section) => {
		if (section) section.click();
		document.body.style.opacity='1';
	}, 1, UI.get(location.hash ? location.hash.substr(1) : 0, 0));
	
});	// }}}

})(document.currentScript);
