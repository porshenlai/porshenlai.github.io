(function(CS){

const currentScript = document.currentScript;
const jsPrefix=(/(.*\/)([^\/]+)(\?.*)?/.exec(currentScript.src)||['',''])[1];

const Plugins={
};	// Built-in Plugins

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
	display:flex; flex-direction:row;
	scroll-behavior:smooth; overflow:hidden;
	opacity:0;
}
body>main { flex:1 1 auto; width:90%; height:100%; }
body>footer {
	color:black;background:silver;
	display:flex; flex-direction:column;
	justify-content:space-between; align-items:center;
}

@media (max-aspect-ratio: 1/1) {
	body { flex-direction:column; }
	body>main { flex:1 1 auto; width:100%; height:90%; }
	body>footer {
		color:black;background:silver;
		display:flex; flex-direction:row;
		justify-content:space-between; align-items:center;
	}
	[data-uid="ControlPanel"] { line-height:172%; }
}

[data-uid="ControlPanel"] [data-h]:hover { color:blue; }

#content {
	width:100%; height:100%;
	overflow:hidden scroll;
	background:#f0f0f0;
}
#content.PlayMode_1, #content.PlayMode_2 {
	scroll-snap-type:y mandatory;
}`;	// }}}
// PlayMode_*: all sections compacted in continuous pages
// PlayMode_1: all the minimal height of sections are greater than the page height 
// PlayMode_2: all the section not currently displayed is hidden
// section.cfbox: force layout expand to full page and centralize content
// section.fbox: force layout expand to full page
//
const CSS_CONTENT= // {{{
`
section {
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
.PlayMode_2 section:not(.current) {
	display:none;
}
section.current {
	border-color:#26A69A;
	box-shadow:0 4px 16px rgba(38, 166, 154, 0.2);
	cursor:default;
}
.PlayMode_1 section, .PlayMode_2 section {
	min-height:calc(100% - 2 * var(--base-margin));
}
.cfbox {
	display:flex;
	flex-flow:column nowrap;
	justify-content:center;
	align-items:center;
}
.fbox, .cfbox {
	width:calc(100% - 2 * var(--base-margin));
	height:calc(100% - 2 * var(--base-margin));
}

[data-h] { cursor:pointer; }
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

.full,.mask { left:0;top:0;width:100%;height:100%;overflow:auto; }
.mask { position:absolute;background-color:rgba(255,255,255,0.5); }
.hbar,.vbar { display:flex; flex-flow:row nowrap; justify-content:space-between; align-items:center; }
.vbar { flex-flow:column nowrap; }

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

.HSelect, .HTab {
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	width: 100%;
}
.HSelect>[data-h],
.HTab>[data-o] {
	flex: 1 1 auto;
	color:blue; text-align: center;
	border: 1px solid blue; border-radius: 4px;
	margin: 0 2px;
}
.HSelect>[data-h]:hover {
	background: lightgrey;
}
.HSelect>[data-h].current {
	color: black;
	border-color: black;
}
.HTab>[data-o].current {
	color: black;
	border-bottom-color: transparent; 
}
.hide,.disabled { display:none; }

`; // }}}
const HTML_CONTROL= // {{{
`
<span data-h='set:PageNumber:prev'>◤</span>
<output data-uid='PageNumber' style='font-size:50%'></output>
<span>
	<span data-h='toggleAside:1'>☰</span>
</span>
<output data-uid='PageCount' style='font-size:50%'></output>
<span data-h='set:PageNumber:next'>◢</span>
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
	<aside data-h='tab:ASIDE' style='background:white;'>
		<div class='HTab'>
			<div data-o="TOC" class='current'>導覽</div>
			<div data-o="Settings">設定</div>
		</div>
		<div style="flex:1 1 auto; overflow:hidden auto; width:100%; height:100%; padding:2px 8px; margin:0;background:white;">
			<nav class='tabPage' data-uid='ASIDE:TOC'></nav>
			<div class='tabPage hide' data-uid='ASIDE:Settings'>
				<div data-uid='Settings:PlayMode'>
					<label>播放模式</lable>
					<div data-uid='Switch' class='HSelect'>
						<div data-h='set:PlayMode:0'>連續</div>
						<div data-h='set:PlayMode:1'>分頁</div>
						<div data-h='set:PlayMode:2'>獨立</div>
					</div>
				</div>
				<div data-uid='Settings:FontScale'>
					<label>字型縮放 (<output value='1'></output>)</label>
					<div style='display:flex;flex-flow:row nowrap;align-items:center;'>
						0.8 <input data-h='set:FontScale:&value' type='range' min='0.8' max='1.5' step='0.1' value='1.0' style='flex:1 1 auto;width:100%'/> 1.5
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
			<input style='flex:1 1 auto;width:100%;margin:0 4px;' data-h='set:PageNumber:&value' type='range' min='1'/>
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

async function loadStyle (css, ukey, container)
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

class Chain {
	// 1. constructed with multiple elements
	// 2. set => fill into all elements
	// 3. get <= read from the first element
	constructor () { this.QS = Array.from(arguments); }
	__s__ (q,v) { q['value' in q ? 'value' : 'textContent'] = v; }
	__g__ (q) { return q['value' in q ? 'value' : 'textContent']; }
	set (v) { this.QS.forEach((q)=>this.__s__(q,v)); return this; }
	get () { return this.__g__(this.QS[0]); }
	add (q) { this.QS.push(q); this.__s__(q,this.get()); return this; }
	remove (q) { this.QS=this.QS.filter((e)=>e!==q); return this; }
}

class Content {
	constructor (e) {
		this.E=e;
		loadStyle(CSS_CONTENT, 'CSS_CONTENT', e);
		this.Keywords={};
		this.PageIndex=[];
		this.Xs={};
	}
	install (sections, filters) { // {{{ ## INSTALL SECTIONS
		// 1. complete id setting
		// 2. filter data-ks with disabled class
		// 3. update PageIndex and ksmap
		// 4. move sections to content box
		let ksmap={};
		let PageIndex=[];
		sections.reduce((E, se, k) => {
			// Organize keywords from data-ks 
			const ks=(se.dataset.ks||'').split(/[,\s]/).filter((v)=>v);
			ks.forEach((k)=>ksmap[k]=(ksmap[k]||0)+1);

			// ensure all sections has ID for location
			if(!se.id) se.id=`__${k}__`;
			E.appendChild(se);

			// filtering sections
			if (filters && (!filters.find(
				(ss)=>ss.reduce((r,k)=>(r && (ks.indexOf(k)>=0)),true)
			))) {
				se.classList.add('disabled');
			} else {
				se.classList.remove('disabled');
				PageIndex.push(se.id);
			}
			return E;
		}, this.E);
		this.Keywords=Object.keys(ksmap);
		this.PageIndex=PageIndex;
		this.extendMods(Array.from(this.E.querySelectorAll('[data-x]')));
	}	// }}}
				extendMods (mods) { // ## INSTALL EXTENSION MODULES (data-x="...") {{{
					Promise.all(
						mods.reduce((R,e)=>{
							const x=e.dataset.x||e.dataset.xl||"";
							R.push((async (T, N, E)=>{
								if (!T.Xs[N])
									T.Xs[N] = N in Plugins ?
										Promise.resolve(Plugins[N](T)) :
										loadScript(currentScript.getAttribute("src").replace(/\.js/,`_${N}.js`)) ;
								(await (T.Xs[N]))(T, E);
							})(this, x.split(':')[0], e));
							return R;
						},[])
					).then(()=>false,console.log);
				}	// }}}

	find (id)
		// rv: Section Element
	{	return this.E.querySelector(`section:not(.disabled)#${id}`);	}

	indexOf (id)
		// rv: PageNumber-1
	{ 	return this.PageIndex.indexOf(id instanceof Element ? id.id : id);	}

	get Sections ()
		// rv: [enabled sections]
	{	return Array.from(this.E.querySelectorAll('section:not(.disabled)'));	}

	convertPageNumber (k)
		// k in [number>1, id_string, Element]
		// rv: number>1
	{	// {{{
		if (k instanceof Element) return this.indexOf(k.id)+1;
		if ('string' === typeof(k)) {
			if (/^\d+$/.exec(k))
				k=parseInt(k);
			else {
				if (k.startsWith('#')) k=k.substring(1);
				return this.indexOf(k)+1;
			}
		}
		return k;
	}	// }}}

	set PageNumber (v)
		// v in [number>1, id_string, Element]
	{ 	// {{{
		let pn=undefined,force=false;
		switch (v) {
		case 'next':
			pn=this.PageNumber+1;
			if (pn>this.PageIndex.length) pn=this.PageIndex.length;
			break;
		case 'prev':
			pn=this.PageNumber-1;
			if (pn<1) pn=1;
			break;
		case 'refresh':
			pn=this.PageNumber;
			force=true;
			break;
		default:
			pn=this.convertPageNumber(v);
			break;
		}
		let em=this.find(this.PageIndex[pn-1]);
		if (force || !em.classList.contains('current')) {
			// 1. MOVE .current flag to new current
			Array.from(this.E.querySelectorAll('section.current'))
			.forEach((e)=>e.classList.remove('current'));
			em.classList.add('current');
			// 2. UPDATE URL HASH
			if (history.replaceState)
				history.replaceState(null, null, '#' + em.id);
			else location.hash = '#' + em.id;
			// 3. Trigger module extend of section loading
			let ms=em.dataset.xl ? [em] : Array.from(em.querySelectorAll('[data-xl]'));
			if(ms.length>0) this.extendMods(ms);
			// 4. SCROLL INTO VIEW
			em.scrollIntoView({
				behavior: scroll ? 'smooth' : 'auto',
				block: 'start'
			});
			em.scrollTop=0;
		}
	}	// }}}

	get PageNumber ()
		// ret: number>1
	{ 	return this.convertPageNumber(this.E.querySelector(`section:not(.disabled).current`)) || 1;	}

	set PlayMode (v)
		// v in [0:連續,1:滿框,2:分頁]
	{	// {{{
					const cl = this.E.classList;
					cl.remove(... Array.from(cl).filter((n)=>n.startsWith('PlayMode_')));
					cl.add(`PlayMode_${v}`);
	}	// }}}

	get PlayMode ()
		// ret in [0:連續,1:滿框,2:分頁]
	{	// {{{
					let rv = Array.from(this.E.classList).find((n)=>n.startsWith('PlayMode_'));
					return rv.substring(9);
	}	// }}}
}

class Player
{
	constructor (sections, filters)
	{	// {{{
		// ## ADD CSS DECLARATIONS
		loadStyle(CSS_PAGE, 'CSS_PAGE');

		// ## APPEND <MAIN>/id='content' ELEMENT TO HOLD SECTIONS
		this.GC=(()=>{ // sections container
			let e=document.createElement("main");
			e.innerHTML=HTML_MAIN;
			this.Content=new Content(e.querySelector('#content'));
			this.Content.install(sections, filters);
			return e;
		})();

		// ## INSTALL ELEMENT VARIABLE FOR PARAMETERS
		this.Settings=((ThisPlayer)=>({ // Parameter Settings
			"FontScale" : new Chain ( // {{{
				this.GC.querySelector('[data-uid="Settings:FontScale"] input'),
				this.GC.querySelector('[data-uid="Settings:FontScale"] output'),
				new (class {
					calc (w,h) { return w*26>h*30 ? Math.floor(h/26) : Math.floor(w/30); }
					set value (v) {
						const DFS=this.calc(window.innerWidth, window.innerHeight);
						document.documentElement.style.setProperty(
							'--base-font-size',
							`${DFS * v}px`
						);
					}
				})()
			),	// }}}
			"PageCount" : new Chain ( // {{{
				this.GC.querySelector('[data-uid="Aside:Pager"] span'),
				new (class {
					constructor (pg) { this.PG=pg; }
					set value (v) { this.PG.setAttribute("max",parseInt(v)); }
				})(this.GC.querySelector('[data-uid="Aside:Pager"] input'))
			),	// }}}
			"PageNumber" : new (class extends Chain { // {{{
				set (v) {
					ThisPlayer.Content.PageNumber=v;
					super.set(ThisPlayer.Content.PageNumber);
				}
			})(
				this.GC.querySelector('[data-uid="Aside:Pager"] input'),
				this.GC.querySelector('[data-uid="Aside:Pager"] output')
			),	// }}}
			"Keywords" : new Chain ( // {{{
				new (class {
					// value=['k1','k2','k3']
					constructor (e) { this.E=e; }
					set value (v) {
						this.E.innerHTML = v.reduce(
							(r,k) => r+`<div><input type='checkbox'/>${k}</div>`, ''
						) + "<span data-h='filter:add'>➕</span>";
					}
					get value () {
						return Array.from(
							this.E.querySelectorAll('input[type="checkbox"]')
						).filter((e)=>e.checked)
						.map((e)=>e.parentNode.textContent);
					}
				})(this.GC.querySelector('[data-uid="Settings:Keywords"]'))
			),	// }}}
			"Filters" : new Chain ( // {{{
				new (class {
					// value=[[A1,A2,...],[A3,A4,...],...]
					constructor (e) { this.E=e; }
					set value (v) {
						this.E.innerHTML = v.reduce((r,a) => r
							+ "<div class='OR'>"
							+ a.reduce((r,v)=>r.push(v)&&r,[]).join('&amp;')
							+ "</div>",
						"");
					}
					get value () {
						return Array.from(
							this.E.querySelectorAll("div")
						).reduce((r,v) => r.push(v.textContent.split('&'))&&r, []);
					}
				})(this.GC.querySelector('[data-uid="Settings:Filters"]'))
			),	// }}}
			"PlayMode" : new Chain ( // {{{
				new (class {
					constructor (e) {
						this.E=e;
						this.EOs=Array.from(e.querySelectorAll('[data-h^="set:PlayMode:"]'));
					}
					set value (v) {
						try {
							ThisPlayer.Content.PlayMode = v;
							ThisPlayer.Content.PageNumber = 'refresh';
							this.EOs.forEach(
								(e) => e.classList[
									e.dataset.h==="set:PlayMode:"+v ? 'add' : 'remove'
								]('current')
							);
						} catch(x) { console.log(x); }
					}	
					get value () {
						try {
							return this.EOs.find((e)=>e.classList.contains('current'))
									.dataset.h.replace(/.*:/,'');
						} catch(x) { console.log(x); }
					}
				})(this.GC.querySelector('[data-uid="Settings:PlayMode"] [data-uid="Switch"]'))
			)	// }}}
		}))(this);

		// ## INSTALL TABLE of CONTENTS
		((sections)=>{
			const TOC=this.GC.querySelector('[data-uid="ASIDE:TOC"]');
			TOC.innerHTML="<ol>"+sections.reduce((rs, sec, idx) => {
				let t=sec.querySelector('h1') || sec.querySelector('h2');
				if (t) {
					t=t.textContent;
					rs+=`<li data-h="set:PageNumber:#${sec.id}">${t}</li>`;
				}
				return rs;
			}, "")+"</ol>";
		})(this.Content.Sections);

		this.Settings.FontScale.set(1.0);
		this.Settings.PageCount.set(this.Content.PageIndex.length);
		this.Settings.Keywords.set(this.Content.Keywords);
		this.Settings.Filters.set(filters||[]);
		this.Settings.PlayMode.set(1);
	}	// constructor }}}

	toggleAside (v)
	{	// {{{
		const CL=this.GC.querySelector('[data-uid="Overlay"]').classList;
		if (v==undefined)
			v=(CL.contains("menu")||CL.contains("dialog")) ? 0 : 1;
		if (parseInt(v)>0) {
			CL.add("menu");
			CL.remove("dialog");
		} else
			CL.remove("menu","dialog"); // OFF
	}	// }}}

	set (name, value)
	{
		this.Settings[name].set(value);
	}

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

	tab (TK)
	{	// {{{
		const K=event.target.dataset.o, tb=queryContainer(event.target,'[data-h^="tab"]');
		if (!K) return;
		tb.querySelectorAll(`[data-o]`).forEach((e)=>e.classList[event.target===e?"add":"remove"]("current"));
		const tabs=queryContainer(tb,['section','aside']);
		tabs.querySelectorAll(`[data-uid^=${TK}]`).forEach((e)=>e.classList[e.dataset.uid!==`${TK}:${K}` ? "add" : "remove"]("hide"));
	}	// }}}

	async speak (text, lang='en')
	{	// <span data-h='speak,fr'>bonjour</span> {{{
		text=text.replaceAll(/[🔈]/g,'').split(/\s+/).filter((v)=>v).join(' ');
		console.log(`Speak(${text})`);
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = lang; // 根據語言代碼設定發音引擎
			utterance.rate = (lang.startsWith('ko')||lang.startsWith('ja')) ? 1.0 : 0.8;
			speechSynthesis.speak (utterance);
		} else alert('您的瀏覽器不支援 Speech Synthesis API。');
	}	// }}}

	playDOM (e, caption)
	{	// {{{
		((DE)=>{
			e=e.querySelector('.hide').cloneNode(true);
			e.classList.remove('hide');
			DE.appendChild(e);
		})(this.openDialog(caption));
	}	// }}}

	play (mn, code, caption)
	{	// {{{
		const VE=document.createElement("div");
		VE.dataset.xl=mn;
		VE.classList.add("full");
		if (code instanceof Element)
			code=code.innerHTML;
		VE.innerHTML=code;
		this.extendMods([VE]);
		((DE)=>{
			while (DE.firstChild) DE.removeChild(DE.firstChild);
			DE.appendChild(VE);
		})(this.openDialog(caption));
	}	// }}}

	filter (cmd)
	{	// {{{
		if (cmd==='add') {
			//<div data-uid='Settings:Keywords'><span data-h='filter:add'>➕</span></div>
			let flts=this.Settings.Filters.get();
			flts.push(this.Settings.Keywords.get());
			this.Settings.Filters.set(flts);
		} else if (cmd==='run') {
			function encodeFilter (aa) { return aa.map((a)=>a.join('.')).join('|'); }
			location.replace(`?s=${encodeFilter(this.Settings.Filters.get())}`);
		}
	}	// }}}

	search (key)
	{	// {{{
		let ts=this.Content.E.querySelector(`section[data-ks~="${key}"]`);
		if (ts) ts.click();
		this.toggleAside(0);
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
			let cp=document.createElement("footer");
			document.body.insertBefore((()=>{
				// guidance bar
				cp.dataset.uid='ControlPanel';
				((s)=>{
					s.padding='0.2%';
				})(cp.style);
				cp.innerHTML=HTML_CONTROL;
				return cp;
			})(), undefined);
			document.body.insertBefore(this.GC, document.body.querySelector('footer'));

			this.Settings.PageNumber.add(cp.querySelector('[data-uid="PageNumber"]'));
			this.Settings.PageCount.add(cp.querySelector('[data-uid="PageCount"]'));
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
							this[cmd].apply(this, args.map((a)=>{
								switch (a) {
								case '&this': return e;
								case '&text': return e.textContent;
								case '&value': return e.value;
								case '&target': return evt.target;
								case '&event': return evt;
								default: return a; }
							}));
						} else continue;
						evt.stopPropagation();
						// evt.preventDefault(); // default handler essential to change events
						break;
					}
					if (e.tagName==='SECTION' && e.id) {
						((pn)=>{
							if (pn>=0) this.Settings.PageNumber.set(pn+1);
						})(this.Content.indexOf(e.id));
						break;
					}
				}
			} catch(x) { console.log("Exception:",x); }
		}	// }}}
		_KH_ (evt)
		{	// {{{
			try {
				if (evt.key==='ArrowLeft')
					this.Settings.PageNumber.set('prev');
				else if (evt.key==='ArrowRight')
					this.Settings.PageNumber.set('next');
				else if (evt.key==='Escape')
					this.toggleAside();
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
	window.addEventListener('resize', (evt) => {
		UI.Settings.FontScale.set(UI.Settings.FontScale.get());
		UI.Content.PageNumber = 'refresh';
	});

	setTimeout( (section) => {
		if (section) section.click();
		document.body.style.opacity='1';
	}, 1, location.hash ? UI.Content.find(location.hash.substr(1)) : UI.Content.Sections[0]);
});	// }}}

})(document.currentScript);
