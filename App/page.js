(function(CS){

const currentScript = document.currentScript;

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
	scroll-behavior:smooth; overflow:hidden;
	opacity:0;
}
body>main { width:100%; height:100%; }

main {
	display:flex;
	flex-flow:row nowrap;
}
main>[data-uid="ControlBar"] {
	color:black;background:silver;
	display:flex; flex-direction:column;
	justify-content:space-between; align-items:center;
}
@media (max-aspect-ratio: 1/1) {
	main { flex-flow:column nowrap; }
	main>[data-uid="ControlBar"] {
		color:black;background:silver;
		display:flex; flex-direction:row;
		justify-content:space-between; align-items:center;
	}
	[data-uid="ControlBar"] { line-height:172%; }
}
[data-uid="ControlBar"] [data-h]:hover { color:blue; }
[data-def] { display:none; }

#content {
	flex:1 1 auto;
	width:100%; height:100%;
	overflow:hidden auto;
	background:#f0f0f0;
}
#content.PlayMode_1,
#content.PlayMode_2 { scroll-snap-type:y mandatory; }`;

// }}}
// PlayMode_*: all sections compacted in continuous pages
// PlayMode_1: all the minimal height of sections are greater than the page height 
// PlayMode_2: all the section not currently displayed is hidden
// section.page: expand the slide to full page in all mode
// section.cfbox: force layout expand to full page and centralize content
// section.fbox: force layout expand to full page
//
// fill cm col

const ASSERT = (ta, msg) => (Array.isArray(ta) ? ta : [ta]).filter((t)=>t||console.log(msg));

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
section.current {
	border-color:#26A69A;
	box-shadow:0 4px 16px rgba(38, 166, 154, 0.2);
	cursor:default;
}

.PlayMode_1 section,
.PlayMode_2 section { min-height:calc(100% - 2 * var(--base-margin)); }
section.page { height:calc(100% - 2 * var(--base-margin)); }
.PlayMode_2 section:not(.current) { display:none; }

.fill,.full,.mask { width:100%; height:100%; left:0; top:0; margin:0; padding:0; overflow:hidden; }
.fill { overflow-y:auto; }
.mask { position:absolute;background-color:rgba(255,255,255,0.5); }

.ncs,.zcs,.col,.row,.tabBar
{ display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:center;align-items:center;overflow:hidden; }
.col { flex-direction:column; }
.zcs { flex-wrap:wrap;align-items:flex-start;overflow-y:auto; }
.ncs { overflow-x:auto; }
.col>.fill,.row>.fill { flex:1 1 auto; }

.tabBar { width:100%; margin:8px; padding:8px; }
.tabBar [data-h^="sw"] { flex:1 1 auto; background:darkblue; color:white; border-radius:8px; margin:8px; text-align:center; }
.tabBar [data-h^="sw"].current { background:white; color:darkblue; font-weight:bolder; }

.swd { flex:1 0 auto;width:80%;max-width:97%; }
@media (orientation: landscape) { .swd { width:40%;max-width:47%; } }
.fill>.swd { height:100%; }

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
h1,.h1 { font-size:200%;font-weight:bold;color:#1E88E5;margin:var(--base-margin);text-align:center; }
h2,.h2 { font-size:172%;font-weight:bold;color:#1E88E5;margin:var(--base-margin); }
h3,.h3 { font-size:128%;font-weight:bold;color:#0d5ea8;margin:var(--base-margin); }
ul li, ol li { line-height:1.8 }

table.std { margin:auto; border:1px solid silver; }
table.std th, table.std td { padding:2px 16px; border:1px solid black; }
table.std>thead th, table.std>thead td { font-weight:900; background:lightgrey; }
table.std>tbody th, table.std>tbody td { background:white; }

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

.hide,.disabled { display:none; }

[data-uid="Overlay"] {
	position:fixed; top:0; left:0; right:0; bottom:0; z-index:10001; background:rgba(0,0,0,0.4);
	visibility:hidden; opacity:0;
	transition:opacity 0.3s ease, visibility 0.3s;
}
[data-uid="Overlay"].menu, [data-uid="Overlay"].dialog {
	visibility:visible; opacity:1;
}
[data-uid="Dialog"] {
	position:fixed; overflow:hidden auto;
	left:var(--base-margin); top:var(--base-margin); right:var(--base-margin); bottom:var(--base-margin);
	display:none; flex-flow:column nowrap;
}
.dialog [data-uid="Dialog"] { display:flex; }
`; // }}}
const CSS_ASIDE= // {{{
`
aside {
	position:fixed; top:0; right:0; bottom:0; z-index:10002;
	min-width:calc(var(--base-font-size) * 24); max-width:90vw;
	border-left:1px solid #eee; box-shadow:-2px 0 10px rgba(0,0,0,0.1);
	font-size:72%;
	transform:translateX(100%);transition:transform 0.3s ease;
	display:flex; flex-flow:column nowrap; justify-content:space-between; align-items:center;
}
.menu aside { transform:translateX(0); }

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
`; // }}}
const HTML_CONTROL= // {{{
`
<span data-h='set:PageNumber:prev'>◤</span>
<output data-uid='PageNumber' style='font-size:72%'></output>
<span>
	<span data-h='set:Overlay:menu'>☰</span>
</span>
<output data-uid='PageCount' style='font-size:72%'></output>
<span data-h='set:PageNumber:next'>◢</span>
`;	// }}}
const HTML_DIALOG= // {{{
`
<div data-uid='Dialog'>
	<div data-h='set:Overlay:none' style='border-bottom:2px solid gold;margin-bottom:4px;padding:0 4px;border-radius:4px;background:white;'></div>
	<section data-h='nop' style='flex:1 1 auto;height:100%;background:white;padding:0 4px;margin:4px 0;border-radius:6px;overflow:hidden;'></section>
</div>`;	// }}}
const HTML_ASIDE= // {{{
`
<aside class='switch' style='background:white;'>
	<div class='tabBar'>
		<div data-h="sw:TOC" class='current'>導覽</div>
		<div data-h="sw:Settings">設定</div>
	</div>
	<div style="flex:1 1 auto; overflow:hidden auto; width:100%; height:100%; padding:2px 8px; margin:0;background:white;">
		<nav class='tabPage' data-case='TOC'></nav>
		<div class='tabPage hide' data-case='Settings'>
			<div data-uid='Settings:PlayMode'>
				<label>播放模式</lable>
				<div data-uid='Switch' class='HSelect'>
					<div data-h='set:PlayMode:0'>連續</div>
					<div data-h='set:PlayMode:1'>滿框</div>
					<div data-h='set:PlayMode:2'>分頁</div>
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
</aside>`; // }}}

class _E {
	// {{{
	constructor (e) { this.E = e; }
	trace (...cs) {
		for (let e=this.E; e instanceof Element; e=e.parentNode)
			for (let c of cs) if (e.matches(c)) return e;
	}
	query (cs) {
		if (this.E.matches(cs)) return this.E;
		return this.E.querySelector(cs);
	}
	list (cs) {
		let r=Array.from(this.E.querySelectorAll(cs));
		if (this.E.matches(cs)) r.unshift(this.E);
		return r;
	}
	forEach (cs, h) {
		this.E.matches(cs) && h(this.E);
		Array.from(this.E.querySelectorAll(cs)).forEach(h);
		return this;
	}
	replace (ce) {
		const pe = this.E.parentNode;
		if (!pe) throw new Error('Not in DOM tree:', this.E);
		pe.insertBefore(ce, this.E);
		pe.removeChild(this.E);
		this.E=ce;
		return this;
	}
}	// }}}

const Apps = {

JSPrefix: (/(.*\/)([^\/]+)(\?.*)?/.exec(currentScript.src)||['',''])[1],
loadScript: async function (src,attrs={})
{	// {{{
	const se=document.createElement("script"),
	      rv=new Promise((or,oe)=>se.addEventListener("load",()=>or(se.value)));
	for(let key in attrs) se.setAttribute(key,attrs[key]);
	se.src=src;
	document.head.appendChild(se);
	return (await rv)||se;
},	// }}}
loadStyle: async function (css, ukey, container)
{	// loadStyle (CSSText, "StylePage") {{{
	// loadStyle (CSSText, "StyleContent", this.Content)
	let be=undefined;
	if (container) be=container.firstChild; else container=document.head;
	if (!ukey || !container.querySelector(`#${ukey}`))
		container.insertBefore(((e)=>{
			if(ukey) e.id=ukey;
			e.innerHTML=css;
			return e;
		})(document.createElement('style')), be);
},	// }}}
E: (e)=>new _E(e),

splitArgs: function (s, d=':')
{	// {{{
	let m=undefined, bf=[];
	return s.split(d).reduce((r,v)=>{
		if (m) {
			if (v.endsWith(m)) {
				bf.push(v.substring(0,v.length-1));
				r.push(bf.join(d));
				m=undefined;
			} else bf.push(v);
		} else if (v.startsWith('"') || v.startsWith("'")) {
			m=v[0]
			bf.push(v.substring(1));
		} else r.push(v);
		return r;
	},[]);
},	// }}}
handleArgs: (s, h) => s.split(';').filter((a)=>a).forEach((a)=>h(...Apps.splitArgs(a))),

NT:{
template: class extends _E
{	// {{{
	async put (doc) // doc:DOC Object
	{	// write DOC to template Element {{{
		const e = this.E.cloneNode(true);
		if (e.dataset.def) e.removeAttribute('data-def');
		function w(e, d, nr=false)
		{	// {{{
			if (nr) {
				if (e.dataset.c)
					for (let args of e.dataset.c.split(';').filter((a)=>a))
						((cmd, ...args) => {
							switch (cmd) {
							case "repeat":
								((t,p,d)=>{
									p.removeChild(t);
									for (let i=0; i<d.length; i++) {
										const D=d[i], row=t.cloneNode(true);
										if (row.dataset.def) row.removeAttribute('data-def');
										if (row.dataset.c) row.removeAttribute('data-c');
										row.dataset.index=(i%2)+"-"+i;
										p.appendChild(row);
										w(row,D);
									}
								})(e,e.parentNode,d[args[0]]||[]);
								break;
							}
						})(...Apps.splitArgs(args))
				if (e.dataset.v)
					for (let args of e.dataset.v.split(';').filter((a)=>a))
						((cmd, a1, a2) => {
							try {
								switch (cmd) {
								case "text": e.textContent=d[a1]; break;
								case "value": e.value=d[a1]; break;
								case "data": e.dataset[a1]=d[a2]; break;
								}
							} catch(x) { console.log(x); console.log(e,d); }
						})(...Apps.splitArgs(args));
			} else {
				if (e.dataset.v||e.dataset.c) w(e, d, true);
				for (let c=e.firstChild; c; c=c.nextSibling) {
					if (c.nodeType!==1) continue;
					w(c,d);
				}
			}
		}	// }}}
		if (!doc) console.trace();
		for (doc of ASSERT(doc,'template:put > document is not available')) w(e, doc);
		return e;
	}	// }}}
	async get ()
	{	// read DOC from template Element {{{
		let rd={};
		(function w(e, d, nr=0) {
			if (nr===2) {
				if (e.dataset.c)
					for (let args of e.dataset.c.split(';').filter((a)=>a))
						((cmd, ...args) => {
							switch (cmd) {
							case "repeat": // TODO
								break;
							}
						})(...Apps.splitArgs(args))
				if (e.dataset.v)
					for (let args of e.dataset.v.split(';').filter((a)=>a))
						((cmd, a1, a2) => {
							switch (cmd) {
							case "text": d[a1]=e.textContent; break;
							case "value": d[a1]=e.value; break;
							case "data": d[a2]=e.dataset[a1]; break;
							}
						})(...Apps.splitArgs(args));
			} else {
				if (e.dataset.v||e.dataset.c) w(e, d, 2);
				for (let c=e.firstChild; c; c=c.nextSibling) {
					if (c.nodeType!==1) continue;
					if (e.dataset.h&&nr>0) continue;
					w(c,d,1);
				}
			}
			return d;
		})(this.E,rd,0);
		return rd;
	}	// }}}
},	// NT.template }}}
data: class extends _E
{	// {{{
	static async fetch (doc)
	{	// {{{
		let res=undefined;
		if (doc.post) {
			res=await fetch(doc.post, {
      			method: 'POST',
      			headers: { 'Content-Type': 'application/json' },
      			body: doc.payload||'{}'
			});
		}else if (doc.get) res=await fetch(doc.get);
		if (res) {
			if (res.ok) try {
				if (res.headers.has('content-type')) {
					switch (res.headers.get('content-type')) {
					case 'application/json':
						return await res.json();
					case 'text/html':
						return ((s)=>{
    						const parser = new DOMParser();
    						const doc = parser.parseFromString(s, 'text/html');
							return doc;
						})(await res.text());
					default:
						console.log(res.headers.get('content-type'));
						return await res.text();
					}
				} else return await res.json();
			} catch(x) { return await res.text(); }
			console.log({"E":res.statusText});
		}
	}	// }}}

	constructor (re) { super(Apps.E(re).query('[data-def="data"]')||re); }
	async put (doc) // doc:DOC Object
	{	// write DOC to data source {{{
	}	// }}}
	async get ()
	{	// read DOC from data Source {{{
		const doc = await (new Apps.NT.template(this.E)).get();
		if (doc.doc) return JSON.parse(doc.doc);
		if (doc.raw) return doc.raw;
		let r = await Apps.NT.data.fetch(doc);
		if ((!r) && this.E.querySelector('[data-h="submit"]')) {
			r=this.E.cloneNode(true);
			delete r.dataset.def;
		}
		return r;
	}	// }}}
}	// NT.data }}}
},	// NameType

KeyFilter: class
{	// Format: A.B.C|D.E => (A and B and C) || (D and E) => [[A,B,C],[D,E]] {{{
	constructor (s) { this.D = 'string'===typeof(s) ? s.split('|').map((v) => v.split('.')) : (s||[]); }
	toString () { return this.D.map((a)=>a.join('.')).join('|'); }
	matches (ks)
	{	// {{{
		if (this.D.length > 0)
			return this.D.reduce((r,a)=>(r || a.reduce((r,v)=>(r && (ks.indexOf(v)>=0)),true)),false);
		else return true;
	}	// }}}
}	// }}}
};
window.Apps = Object.assign(Apps, window.Apps||{});

class Content
{	// 顯示頁面管理界面 {{{
	constructor (e) { // e: #content 顯示區塊
		// 顯示區塊操作物件 {{{
		this.E=e;
		this.Keywords = {};
		this.PageIndex = [];
		this.Ns = {}; // database of Namespaces
		this.Xs={
			template:async function (slide, elem, name, buf)
			{	// {{{
				if (elem.classList.contains('resolved')) return;
				elem.classList.add('resolved');

				if (!buf) buf = elem;
				if ("string" === typeof(buf))	buf = slide.Ns[buf];
				if (buf instanceof Element)		buf = new Apps.NT.data(buf);
				buf = await buf.get();
				if (buf instanceof Element) {
					buf = await new Promise((or,oe)=>{
						Apps.E(elem).replace(buf);
						elem=buf;
						elem.addEventListener('click',(evt)=>{
							let e=Apps.E(evt.target).trace('[data-h]');
							if (e) switch (e.dataset.h) {
							case 'submit':
								(async ()=>{
									let d = await (new Apps.NT.template(elem)).get(),
										f = await (new Apps.NT.template(e)).get();
									for (let k in f)
										f[k]=f[k].split('${').reduce((r,v)=>{
											if (!r.length) return v;
											let i=/([^}]+)}(.*)/.exec(v);
											return i ? r+d[i[1]]+i[2] : r+v;
										},"");
									or(Apps.NT.data.fetch(f));
								})(); break;
							}
						});
					});
				}
				if ("string" === typeof(name))	name = slide.Ns[name];
				if (name instanceof Element)	name = new slide.Ns_CS.template(name);
				Apps.E(elem).replace(buf=await name.put(buf||{}));
				slide.extendMods(Array.from(buf.querySelectorAll('[data-xl]')));
			}	// }}}
		};
		Apps.loadStyle(CSS_CONTENT, 'CSS_CONTENT', e);
	}	// }}}

	install (doc, filters) { // doc: <div <...sections>|<...[data-template]>|<...[data-data]> >
							 // filter: [ ...[...COND] ]
		// 安裝待顯示的頁面 <...section> {{{ 

		// 使用者介面輸入資料前處理
		if (Apps.before_load)
			Apps.before_load(this, doc);

		// 宣告樣本與資料定義
		Apps.E(doc).forEach('[data-def]', (e) => {
			Apps.handleArgs(e.dataset.def, (cs, key) => {
				if (!key) return
				this.Ns[key] = new Apps.NT[cs](e);
				e.parentNode.removeChild(e);
			});
		}); // declare template and data

		// 根據過濾器安裝要求的頁面
		let ksmap={};
		let PageIndex=[];
		Array.from(doc.querySelectorAll('section'))
		.reduce((E, se, k) => {
			// Organize keywords from data-ks 
			const ks=(se.dataset.ks||'').split(/[,\s]/).filter((v)=>v);
			ks.forEach((k)=>ksmap[k]=(ksmap[k]||0)+1);

			// ensure all sections has ID for location
			if (!se.id) se.id=`__${k}__`;
			E.appendChild(se);

			// filtering sections
			if (filters.matches(ks)) {
				se.classList.remove('disabled');
				PageIndex.push(se.id);
			} else se.classList.add('disabled');
			return E;
		}, this.E);
		this.Keywords=Object.keys(ksmap);
		this.PageIndex=PageIndex;

		// 套用應用載入階段擴充
		this.extendMods(Array.from(this.E.querySelectorAll('[data-x]')));

		// 使用者介面安裝後處理
		if (Apps.after_load) // after_load for Page override
			Apps.after_load(this);
	}	// }}}

	getByName (n, e) // n: class name or variable name, e: element to find data
	{	// {{{
		if (n in this.Ns) return this.Ns[n];
		if (n in this.Ns_CS) return new (this.Ns_CS[n])(e);
	}	// }}}

	extendMods (mods) // mods: [data-x="..."] || [data-xl="..."]
	{	// 安裝外部模組 {{{
		Promise.all(
			mods.reduce((R,e)=>{
				const args=Apps.splitArgs(e.dataset.x||e.dataset.xl||"",':'), mn=args.shift();
				if (mn) R.push((async (T, N, E)=>{
					if (!T.Xs[N])
						T.Xs[N] = Apps.loadScript(
							currentScript.getAttribute("src").replace(/\.js/,`_${N}.js`) );
					(await (T.Xs[N]))(T, E, ...args);
				})(this, mn, e));
				return R;
			},[])
		).then(()=>false,console.log);
	}	// }}}

	find (id) // rv: Section Element
	{	return this.E.querySelector(`section:not(.disabled)#${id}`); }

	indexOf (id) // rv: PageNumber-1
	{	return this.PageIndex.indexOf(id instanceof Element ? id.id : id); }

	get Sections () // rv: [enabled sections]
	{	return Array.from(this.E.querySelectorAll('section:not(.disabled)')); }

	convertPageNumber (k) // k in [number>1, id_string, Element]
	{	// rv: number>1 {{{
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

	set PageNumber (v) // v in [number>1, id_string, Element]
	{	// 跳頁 {{{
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
		console.assert(em, `Page not found (PN:${pn},v:${v})`);
		if (force) em.classList.remove('current');
		if (!em.classList.contains('current')) {
			// #. MOVE .current flag to new current
			Array.from(this.E.querySelectorAll('section:not(.disabled).current'))
			.forEach((e)=>{
				e.classList.remove('current')
				if (e.tick) e.tick(false);
			});
			// #. Apply style check
			Apps.E(em).forEach('[data-style]', (e) => {
				((e,nvs) => { // e: Element, nvs: name-value pair of style settings
					// apply nvs style settings to element {{{
					if ('string' === typeof(nvs)) // nvs: na:va,nb:vb,... -> {na:va,nb:vb,...}
						nvs = nvs ? nvs.split(',').filter((s)=>s).reduce((r, nv)=>{
							nv=/([^:]+)(:(.*))/.exec(nv);
							r[nv[1]]=nv[3]||true;
							return r;
						},{}) : {}
					const Defs={
						bg:(v)=>['background',((vs)=>{
							if (vs[1]) vs[1]=`url(${vs[1]}) no-repeat center center/${ vs[0] ? 'contain' : 'cover' }`;
							return vs.join(' ');
						})(v.split(':'))],
					}
					for (let n in nvs) {
						let [sn,sv] = n in Defs ? Defs[n](nvs[n]) : [n,nvs[n]];
						e.style[sn] = sv;
					}
					e.removeAttribute("data-style");
					// }}}
				})(e, e.dataset.style);
			});

			em.classList.add('current');
			// #. UPDATE URL HASH
			if (history.replaceState)
				history.replaceState(null, null, '#' + em.id);
			else location.hash = '#' + em.id;
			// #. Call Apps.page_load override
			if (!force && Apps.page_load)
				Apps.page_load(em);
			// E. Trigger module extend of section loading
			let ms=em.dataset.xl ? [em] : Array.from(em.querySelectorAll('[data-xl]'));
			if(ms.length>0) this.extendMods(ms);
			// 5. SCROLL INTO VIEW
			setTimeout(()=>{
				em.scrollIntoView({
					behavior: scroll ? 'smooth' : 'auto',
					block: 'start'
				});
				em.scrollTop = 0;
			}, 100);
		}
	}	// }}}

	get CurPage ()
	{	return this.E.querySelector(`section:not(.disabled).current`); }

	get PageNumber () // ret: number>1
	{	return this.convertPageNumber(this.CurPage) || 1; }

	set PlayMode (v) // v in [0:連續,1:滿框,2:分頁]
	{	// 模式切換 {{{
		const cl = this.E.classList;
		cl.remove(... Array.from(cl).filter((n)=>n.startsWith('PlayMode_')));
		cl.add(`PlayMode_${v}`);
	}	// }}}

	get PlayMode () // ret in [0:連續,1:滿框,2:分頁]
	{	// {{{
		let rv = Array.from(this.E.classList).find((n)=>n.startsWith('PlayMode_')) || "PlayMode_";
		return rv.substring(9);
	}	// }}}
}	// class Content }}}

class Player
{	// Content + ...輔助工具列 {{{
	constructor () {
		// ## 新增樣式
		Apps.loadStyle(CSS_PAGE, 'CSS_PAGE');

		// ## 初始化設定變數
		this.Settings = {
			Controls:[{value:""}],
			FontScale:[{value:1.0}],
			Keywords:[{value:[]}], // [A1,A2,A3]
			Filters:[{value:[]}], // [[A1,A2,...],[A3,A4,...],...]
			PageCount:[{value:0}],
			PageNumber:[{value:0}],
			PlayMode:[{value:2}]
		};
	}	// constructor

	async init (args)
	{	// init
		const pages = await (async function _cp_ (from, docs=document.createElement("div")) {
			let e;
			for (e of from.querySelectorAll('[data-def]'))
				if (e.dataset.def.indexOf(':')>0) docs.appendChild(e);
			for (e of from.querySelectorAll('section'))
				if (e.dataset.def==='data') {
					for (const d of ASSERT(await (new Apps.NT.data(e)).get(),[e,'not available'])) {
						_cp_ (d, docs);
					}
				} else docs.appendChild(e);
			return docs;
		})(document); // ## 準備成員資料

		this.GC = ((e)=>{ // e: <main data-controls='aside,control'> 頁面容器
			// 準備顯示畫面
			if (!e)
				e = document.createElement("main");
			if (!e.dataset.controls)
				e.dataset.controls='aside,control';
			if (e.dataset.settings)
				e.dataset.settings.split(',').forEach((s)=>{
					s=s.split(':');
					this.Settings[s[0]][0].value=s[1];
				});

			this.Controls=(e.dataset.controls||"").split(',');
			// 新增頁面框 #content -> <main <#content> >
			let c = e.querySelector('#content');
			if (!c) {
				c=document.createElement("div");
				c.id='content';
				e.insertBefore(c,e.firstChild);
			}
			// 建立頁面管理物件
			this.Filters = new Apps.KeyFilter(args.s)
			this.Content = new Content(c);
			this.Content.install(pages, this.Filters); // 安裝頁面

			this.Keywords = this.Content.Keywords;
			this.PageCount = this.Content.PageIndex.length;
			this.PageNumber = location.hash ? (this.Content.indexOf(location.hash.substr(1))+1) : 1;
			this.FontScale = this.Settings.FontScale[0].value;
			this.PlayMode = this.PlayMode || this.Settings.PlayMode[0].value;

			((flags,plugins)=>{
				// 安裝輔助工具 
				if ('control' in flags) // ## 新增控制列
					e.appendChild(((cp)=>{
						cp.dataset.uid='ControlBar';
						[
							['padding','0.2%'],
							['fontSize','160%']
						].forEach((v)=>cp.style[v[0]]=v[1]);
						cp.innerHTML=HTML_CONTROL;
						this.bindS('PageNumber',cp.querySelector('[data-uid="PageNumber"]'));
						this.bindS('PageCount',cp.querySelector('[data-uid="PageCount"]'));
						return cp;
					})(document.createElement("div")))

				plugins+=HTML_DIALOG;
				if ('aside' in flags) { // 準備 目錄與設定控制列
					Apps.loadStyle(CSS_ASIDE, 'CSS_ASIDE', e);
					plugins += HTML_ASIDE;
				}
				e.appendChild(((o)=>{ // [data-uid="Overlay"] -> <main <#content> <data-uid='Overlay'>>
					o.dataset.uid='Overlay';
					o.dataset.h='set:Overlay:none';
					o.innerHTML=plugins;
					return o;
				})(document.createElement("div")));
			})( this.Controls.reduce((r,v)=>{ r[v]=true; return r; },{}), "" );
			return e;
		})(document.querySelector('main'));

		document.body.insertBefore(this.GC, document.body.querySelector('footer'));

		((A)=>{	// ## 側板內容綁定 {{{
			if (!A) return;

			this.bindS('PageNumber', A.querySelector('[data-uid="Aside:Pager"] input'));
			this.bindS('PageNumber', A.querySelector('[data-uid="Aside:Pager"] output'));
			this.bindS('PageCount', A.querySelector('[data-uid="Aside:Pager"] span'));
			this.bindS('PageCount', new (class {
				constructor (e)	{ this.E=e; }
				set value (v)	{ this.E.setAttribute('max',parseInt(v)); }
				get value ()	{ return this.E.getAttribute('max'); }
			})(A.querySelector('[data-uid="Aside:Pager"] input')));
			this.bindS('PlayMode', new (class {
				constructor (e) { this.EOs = Array.from(e.querySelectorAll('[data-h^="set:PlayMode:"]')); }
				set value (v)	{
					this.EOs.forEach(
						(e) => e.classList[e.dataset.h==="set:PlayMode:"+v ? 'add' : 'remove']('current')
					);
				}
				get value ()	{
					return this.EOs.find((e)=>e.classList.contains('current')).dataset.h.replace(/.*:/,'');
				}
			})(A.querySelector('[data-uid="Settings:PlayMode"] [data-uid="Switch"]')));
			this.bindS('FontScale', A.querySelector('[data-uid="Settings:FontScale"] input'));
			this.bindS('FontScale', A.querySelector('[data-uid="Settings:FontScale"] output'));
			this.bindS('Keywords', new (class {
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
			})(A.querySelector('[data-uid="Settings:Keywords"]')));
			this.bindS('Filters',new (class {
				constructor (e) { this.E = e; }
				set value (v) {
					this.E.innerHTML = v.D.reduce((r,a) => r
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
			})(A.querySelector('[data-uid="Settings:Filters"]')));
			// ## INSTALL TABLE of CONTENTS
			const TOC=A.querySelector('[data-case="TOC"]');
			TOC.innerHTML="<ol>"+this.Content.Sections.reduce((rs, sec, idx) => {
				let t=sec.querySelector('h1') || sec.querySelector('h2');
				if (t) {
					t=t.textContent;
					rs+=`<li data-h="set:PageNumber:#${sec.id}">${t}</li>`;
				}
				return rs;
			}, "")+"</ol>";
		})(this.GC.querySelector('[data-uid="Overlay"] aside')); // }}}
	}	// init }}}

	// Settings Utility {{{
	setS (n, v) {
		console.assert(n in this.Settings, 'No Such Setting');
		this.Settings[n].forEach((e)=>(e.value=v));
	}
	bindS (n, c) {
		console.assert(n in this.Settings, 'No Such Setting');
		if (c) {
			c.value = this.Settings[n][0].value;
			this.Settings[n].push(c);
		}
	}
	unbindS (n, c) {
		console.assert(n in this.Settings, 'No Such Setting');
		if (c) this.Settings[n]=this.Settings[n].filter((e)=>c!==e);
	}

	// this.PlayMode=this.V.PlayMode[0].value;
	set PlayMode (v) {
		this.Content.PlayMode = v;
		this.Content.PageNumber = 'refresh';
	}
	get PlayMode () { return this.Content.PlayMode; }
	set PageCount (v) { this.setS('PageCount',v); }
	get PageCount () { return this.Settings.PageCount[0].value; }
	set PageNumber (v) {
		this.Content.PageNumber=v;
		this.setS('PageNumber', this.Content.PageNumber);
	}
	get PageNumber ()	{ return this.Content.PageNumber; }
	set FontScale (v)	{
		const DFS = ((w,h) => w*26>h*30 ? Math.floor(h/26) : Math.floor(w/30))(
			window.innerWidth,
			window.innerHeight
		);
		document.documentElement.style.setProperty('--base-font-size', `${DFS * v}px`);
		this.setS('FontScale', v);
	}
	get FontScale ()	{ return this.Settings.FontScale[0].value; }
	set Keywords (v)	{ this.setS('Keywords', this.Content.Keywords=v); }
	get Keywords ()		{ return this.Settings.Keywords[0].value; }
	set Filters (v)		{ this.setS('Filters', v); }
	get Filters ()		{ return this.Settings.Filters[0].value; }
	set Controls (v)	{ this.setS('Controls', v); }
	get Controls ()		{ return this.Settings.Controls[0].value; }
	set Overlay (v)
	{	// {{{
		const CL=this.GC.querySelector('[data-uid="Overlay"]').classList;
		CL.remove('menu','dialog');
		for (let key of ['menu','dialog']) if (key===v) CL.add(key);
	}	// }}}
	get Overlay ()
	{	// {{{
		const CL=this.GC.querySelector('[data-uid="Overlay"]').classList;
		return CL.contains('menu') ? 'menu' : CL.contains('dialog') ? 'dialog' : undefined;
	}	// }}}
	// }}}

	nop () { }

	set (name, value) // set:SettingName:SettingValue
	{	return this[name]=value; }

	call (fn, ...args)
	{	// {{{
		console.log(fn, args);
		try {
			Apps[fn](...args);
		} catch(x) { console.log(x); }
	}	// }}}

	go (target)
	{	return this.PageNumber=target;	}

	sw (TK)
		// <class='switch' <data-case='A'> <data-case='B'>>
	{	// {{{
		Apps.E(Apps.E(event.target).trace('.switch'))
		.forEach(
			'[data-h^="sw:"]',
			(e) => e.classList[e.dataset.h === `sw:${TK}` ? 'add' : 'remove']('current')
		)
		.forEach(
			'[data-case]',
			(e) => e.classList[e.dataset.case === TK ? 'remove' : 'add']('hide')
		);
	}	// }}}

	play (caption, mn, ...args)
		// play:dom:&this:Caption
		// play('dom',document.getElementById(...),'Caption');
	{	// {{{
		const VE = document.createElement("div");
		let e = undefined;
		args.unshift(mn);
		if (args[args.length-1] instanceof Element)
			VE.innerHTML=args.pop().innerHTML;
		VE.dataset.xl = args.join(":");
		this.Content.extendMods([VE]);
		this.Overlay='dialog';
		((DLG)=>{
			DLG.querySelector('div').textContent=caption||'Dialog';
			const rv = DLG.querySelector('section');
			while (rv.firstChild) rv.removeChild(rv.firstChild);
			rv.removeAttribute('class');
			// rv._EH_=EH;
			rv.appendChild(VE);
		})(this.GC.querySelector('[data-uid="Dialog"]'));
	}	// }}}

	async speak (text, lang='en')
		// speak('bonjour','fr');
		// <span data-h='speak:&text:fr'>bonjour</span>
	{	// {{{
		text=text.replaceAll(/[🔈]/g,'').split(/\s+/).filter((v)=>v).join(' ');
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = lang; // 根據語言代碼設定發音引擎
			utterance.rate = (lang.startsWith('ko')||lang.startsWith('ja')) ? 1.0 : 0.8;
			speechSynthesis.speak (utterance);
		} else alert('您的瀏覽器不支援 Speech Synthesis API。');
	}	// }}}

	filter (cmd)
	{	// {{{
		if (cmd==='add') {
			//<div data-uid='Settings:Keywords'><span data-h='filter:add'>➕</span></div>
			let flts=this.Filters;
			flts.push(this.Keywords);
			this.Filters.set(flts);
		} else if (cmd==='run') {
			location.replace(`?s=${(new Apps.KeyFilter(this.Filters)).toString()}`);
			location.replace(`?s=${encodeFilter(this.Filters)}`);
		}
	}	// }}}

	search (key)
	{	// {{{
		let ts=this.Content.E.querySelector(`section[data-ks~="${key}"]`);
		if (ts) ts.click();
		this.set('Overlay','none');
	}	// }}}

	fullscreen (e)
	{	// {{{
		switch (e) {
		case 'body' : e = document.body; break;
		case 'main' : e = this.GC; break;
		case 'section': e = this.Content.CurPage; break;
		default: e = this.Content.CurPage.querySelector(e); break;
		}
		if (e instanceof Element) {
			if (e !== document.fullscreenElement)
				e.requestFullscreen();
			else e = undefined;
		}
		if ((!e) && document.fullscreenElement)
			document.exitFullscreen(); // exit fullscreen mode
	}	// }}}

	_EH_ (evt)
	{	// {{{
		try {
			for (let e=evt.target; e && e!==this.GC; e=e.parentNode){
				if (e && e.dataset && e.dataset.h) {
					let args = Apps.splitArgs(e.dataset.h,':'), cmd = args.shift();
					args = args.map((a)=>{
						switch (a) {
						case '&this': return e;
						case '&text': return e.textContent;
						case '&value': return e.value;
						case '&target': return evt.target;
						case '&event': return evt;
						default: return a; }
					});
					if (cmd in this && 'function' === typeof(this[cmd])) {
						this[cmd](...args);
					} else continue;
					evt.stopPropagation();
					// evt.preventDefault(); // default handler essential to change events
					break;
				}
				if (e && e.tagName==='SECTION' && e.id) {
					((pn)=>{
						if (pn>=0) this.PageNumber=(pn+1);
					})(this.Content.indexOf(e.id));
					break;
				}
			}
		} catch(x) { console.log("Exception:",x); }
	}	// }}}

	_KH_ (evt)
	{	// {{{
		try {
			if (evt.key === 'ArrowLeft')
				this.PageNumber = 'prev';
			else if (evt.key === 'ArrowRight')
				this.PageNumber = 'next';
			else if (evt.key === 'Escape')
				this.Overlay = 'menu';
			else return;
			evt.preventDefault();
		} catch(x) { }
	}	// }}}
}	// }}}

document.addEventListener('DOMContentLoaded', async () => { // {{{

	const
	Args = (location.search||'?').substr(1).split('&').reduce((r,a) => {
		const pa = /^([^=]+)=(.*)$/.exec(a);
		if (pa) r[pa[1]] = pa ? decodeURIComponent(pa[2]) : true;
		return r;
	}, {});

	Apps.Player = new Player();
	await window.Apps.Player.init(Args);

	document.body.addEventListener('click', (evt)=>window.Apps.Player._EH_(evt));
	document.body.addEventListener('change', (evt)=>window.Apps.Player._EH_(evt));
	window.addEventListener('keydown', (evt)=>window.Apps.Player._KH_(evt));
	window.addEventListener('resize', (evt)=>{
		window.Apps.Player.FontScale = window.Apps.Player.FontScale;
		window.Apps.Player.Content.PageNumber = 'refresh';
	});

	let timer=setInterval(()=>{
		const cp=window.Apps.Player.Content.CurPage;
		if (cp && cp.tick) cp.tick(true);
	},500);

	document.body.style.opacity='1';
});	// }}}

})(document.currentScript);
