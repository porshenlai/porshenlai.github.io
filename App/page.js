(function(CS){

const currentScript = document.currentScript;

const ASSERT = (ta, msg) => (Array.isArray(ta) ? ta : [ta]).filter((t)=>t||console.trace(msg));

const Apps = {

JSPrefix: (/(.*\/)([^\/]+)(\?.*)?/.exec(currentScript.src)||['',''])[1],
Args: (location.search||'?').substr(1).split('&').reduce((r,a) => {
	const pa = /^([^=]+)=(.*)$/.exec(a);
	if (pa) r[pa[1]] = pa ? decodeURIComponent(pa[2]) : true;
	return r;
}, {}),

loadScript: async function (src,attrs={})
{	// 載入 JS {{{
	const se=document.createElement("script"),
    	  rv=new Promise((or,oe)=>se.addEventListener("load",()=>or(se.value)));
	for(let key in attrs) se.setAttribute(key,attrs[key]);
	se.src=src;
	document.head.appendChild(se);
	return (await rv)||se;
},	// loadScript }}}

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

changeRoot: function (doc, url)
{	// {{{
	url = (url.indexOf('://')<0) ? ((r)=>{
		r.pathname = url.startsWith('/') ? url : (r.pathname.replace(/[^\/]*$/,'')+url.replace(/[^\/]*$/,''));
		return r;
	})(URL.parse(location.href)) : URL.parse(url);

	function rn (u) {
		return u.indexOf('://')>0 ? u
		:	this.origin + (u.startsWith('/') ? '' : url.pathname) + u
	}
	Array.from(doc.querySelectorAll('[src]')).forEach(
		(e)=>e.setAttribute("src",rn(e.getAttribute("src")))
	);
	Array.from(doc.querySelectorAll('[href]')).forEach(
		(e)=>e.setAttribute("href",rn(e.getAttribute("href")))
	);
	Array.from(doc.querySelectorAll('section')).forEach(
		(e)=>e.dataset.rbase=JSON.stringify([url.origin,url.pathname])
	);
}	// change root }}}

};

Apps.Ready = (() => {
	let swap = undefined, ps = new Promise((or,oe)=>(swap=[or,oe]));
	[ps.setReady, ps.setError] = swap;
	return ps;
})();

class KeyFilter 
{	// Format: A.B.C|D.E => (A and B and C) || (D and E) => [[A,B,C],[D,E]] {{{
	constructor (s) { this.D = 'string'===typeof(s) ? s.split('|').map((v) => v.split('.')) : (s||[]) ; }
	toString () { return this.D.map((a)=>a.join('.')).join('|'); }
	matches (ks)
	{
		if (this.D.length > 0)
			return this.D.reduce((r,a)=>(r || a.reduce((r,v)=>(r && (ks.indexOf(v)>=0)),true)),false);
		else return true;
	}
}	// }}}

class Content
{	// 顯示頁面管理界面 {{{
	constructor (e)
	{	// e: 顯示區塊 {{{
		this.E=e;
		this.Keywords = {};
		this.PageIndex = [];

		this.Xs={
			template: async function (slide, elem, temp, data)
			{
				if (elem.classList.contains('resolved')) return;
				elem.classList.add('resolved');
				// 檢索參數
				const I={'template':temp||elem,'data':data||elem};
				for (let k in I) {
					if (!I[k] || I[k] === '&this') I[k] = elem;
					I[k] = 'string' === typeof(I[k]) ? Apps.Ns.resolve(I[k])
						 : I[k] instanceof Element ? Apps.Ns.resolve(k,I[k]) : I[k] ;
				}
				[temp,data] = [I.template, I.data];
				// 取得資料
				data = await data.get();
				// 樣板資料填入
				await temp.put(elem, data);

				// 擴充模組驅動
				Promise.all(
					Array.from(elem.querySelectorAll('[data-xl]')).map((xe) => slide.prepare(xe))
				).then(()=>0, ()=>0);
			}
		};

		Apps.E('<link rel="stylesheet" href="/App/page.css"></link>').join(document.head);
	}	// }}}

	install (doc, bfe)	// doc: <div <...sections>|<...[data-template]>|<...[data-data]> >
	{	// 安裝待顯示的頁面 <...section> {{{ 
		// 使用者介面輸入資料前處理
		if (Apps.before_load)
			Apps.before_load(this, doc);

		// 宣告樣本與資料定義
		Apps.E(doc).forEach('[data-def]', (e) => {
			Apps.handleArgs(e.dataset.def, (cs, key) => {
				if (!key) return
				Apps.Ns.register(key, cs, e);
				e.parentNode.removeChild(e);
			});
		}); // declare template and data

		// 根據過濾器安裝要求的頁面
		let ksmap={}; // TODO inherit from this.Keywords
		Array.from(doc.querySelectorAll('section'))
		.reduce((E, se, k) => {
			// Organize keywords from data-ks 
			const ks=(se.dataset.ks||'').split(/[,\s]/).filter((v)=>v);
			ks.forEach((k)=>ksmap[k]=(ksmap[k]||0)+1);

			E.insertBefore(se, bfe);

			// filtering sections
			if (true/*this.Filters.matches(ks)*/) {
				se.classList.remove('disabled');
			} else se.classList.add('disabled');
			return E;
		}, this.E);

		if (bfe) bfe.parentNode.removeChild(bfe);

		let PageIndex=[];
		Array.from(this.E.querySelectorAll('section:not(.disabled)'))
		.forEach((se,k) => { // ensure all sections has ID for location
			if ((!se.id)||/__.*__/.exec(se.id)) se.id=`__${k}__`;
			PageIndex.push(se.id);
		});
		this.Keywords=Object.keys(ksmap);
		this.PageIndex=PageIndex;

		// 套用應用載入階段擴充
		Promise.all(
			Array.from(this.E.querySelectorAll('[data-x]')).map((xe) => this.prepare(xe))
		).then(() => {
			// 使用者介面安裝後處理
			if (Apps.after_load) // after_load for Page override
				Apps.after_load(this);
		}, console.log);
	}	// }}}

	async prepare (e, mn, args) // prepare x-module < data-xl >, < data-x > or <> module_name, args
	{	// 準備 頁面延伸模組 {{{
		if (!mn) {
			args = (e.dataset.xl || e.dataset.x).split(':');
			mn = args.shift();
		}
		if (!mn) throw Exception('Module name missing');
		if (!this.Xs[mn])
			this.Xs[mn] = Apps.loadScript(
				currentScript.getAttribute("src").replace(/\.js/,`_${mn}.js`)
			);
		return (await (this.Xs[mn]))(this, e, ...args);
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
		ASSERT(em, `Page not found (PN:${pn},v:${v})`);
		if (em && force) em.classList.remove('current');
		if (em && !em.classList.contains('current')) {
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

			// Trigger module extend of section loading
			let ms=em.dataset.xl ? [em] : Array.from(em.querySelectorAll('[data-xl]'));
			if(ms.length>0) Promise.all(ms.map((xe)=>this.prepare(xe))).then(()=>0,()=>0);

			setTimeout(()=>{ // SCROLL INTO VIEW
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
	constructor ()
	{ 	// ## 初始化設定變數 {{{
		this.Settings = {
			Controls:[{value:""}],
			FontScale:[{value:1.0}],
			Keywords:[{value:[]}], // [A1,A2,A3]
			Filters:[{value:[]}], // [[A1,A2,...],[A3,A4,...],...]
			PageCount:[{value:0}],
			PageNumber:[{value:0}],
			PlayMode:[{value:2}]
		};
	}	// constructor }}}

	async sync (pages)
	{	// 頁面資料匯入更新同步 {{{
		this.Content.install(pages, this.Content.CurPage); // 安裝頁面

		this.Keywords = this.Content.Keywords;
		this.PageCount = this.Content.PageIndex.length;
		this.PageNumber = location.hash ? (this.Content.indexOf(decodeURI(location.hash).substr(1))+1) : 1;
		this.FontScale = this.Settings.FontScale[0].value;
		this.PlayMode = this.PlayMode || this.Settings.PlayMode[0].value;
		this.Content.E.querySelector('#'+this.Content.PageIndex[this.PageNumber-1]).click();

		const aside = this.GC.querySelector('#overlay aside')
		// ## INSTALL TABLE of CONTENTS
		aside.querySelector('[data-case="TOC"]').innerHTML=
			"<ol>"+this.Content.Sections.reduce((rs, sec, idx) => {
				let t=sec.querySelector('h1') || sec.querySelector('h2');
				if (t) {
					t=t.textContent;
					rs+=`<li data-h="set:PageNumber:#${sec.id}">${t}</li>`;
				}
				return rs;
			}, "")+"</ol>";
	}	// }}}

	async init (args)
	{	// init
		// 蒐集待安裝的頁面
		const pages=await (async function _cp_ (from, docs=document.createElement("div")) {
			Array.from(from.querySelectorAll('[data-def]')).forEach((e)=>{
				if (e.dataset.def.indexOf(':')>0) docs.appendChild(e);
			});
			for (let e of Array.from(from.querySelectorAll('section'))) {
				if (e.dataset.def==='data') {
					// import external html sections
					const D = Apps.Ns.resolve('data',e);
					let db = (await D.get()).body;
					if (db) {
						if (D.URL) Apps.changeRoot(db, D.URL);
						await _cp_(db, docs);
					}
				} else docs.appendChild(e);
			}
			return docs;
		})(document.body);

		this.GC = await (async (e)=>{ // e: <main data-controls='aside,control'> 頁面容器
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
			this.Filters = new KeyFilter(args.s)
			this.Content = new Content(c);

			await (async (flags, plugins)=>{
				// 安裝輔助工具 
				if ('control' in flags) // ## 新增控制列
					((cp)=>{
						this.bindS('PageNumber',cp.querySelector('[data-uid="PageNumber"]'));
						this.bindS('PageCount',cp.querySelector('[data-uid="PageCount"]'));
						e.appendChild(cp);
					})(await Apps.R({url:"/App/page_control.html",cs:"#control"}).fetch());

				const ol = Apps.E('<div id="overlay" data-h="set:Overlay:none"></div>','#overlay').E;
				//ol.appendChild(await Apps.R({url:"/App/page_dialog.html",cs:"#dialog"}).fetch());
				if ('aside' in flags) { // 準備 目錄與設定控制列
					const aside = await Apps.R({url:'/App/page_aside.html',cs:'aside'}).fetch();
					ol.appendChild(aside);
					// ## 側板內容綁定 {{{
					this.bindS('PageNumber', aside.querySelector('[data-uid="Aside:Pager"] input'));
					this.bindS('PageNumber', aside.querySelector('[data-uid="Aside:Pager"] output'));
					this.bindS('PageCount', aside.querySelector('[data-uid="Aside:Pager"] span'));
					this.bindS('PageCount', new (class {
						constructor (e)	{ this.E=e; }
						set value (v)	{ this.E.setAttribute('max',parseInt(v)); }
						get value ()	{ return this.E.getAttribute('max'); }
					})(aside.querySelector('[data-uid="Aside:Pager"] input')));
					this.bindS('FontScale', aside.querySelector('[data-uid="Settings:FontScale"] input'));
					this.bindS('FontScale', aside.querySelector('[data-uid="Settings:FontScale"] output'));
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
					})(aside.querySelector('[data-uid="Settings:Keywords"]')));
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
					})(aside.querySelector('[data-uid="Settings:Filters"]')));
					/*this.bindS('PlayMode', new (class {
						constructor (e) {
							this.EOs = Array.from(e.querySelectorAll('[data-h^="set:PlayMode:"]'));
						}
						set value (v)	{
							this.EOs.forEach((e)=>
								e.classList[e.dataset.h==="set:PlayMode:"+v ? 'add' : 'remove']('current'));
						}
						get value ()	{
							return this.EOs.find((e)=>e.classList.contains('current'))
							       .dataset.h.replace(/.*:/,'');
						}
					})(aside.querySelector('[data-uid="Settings:PlayMode"] [data-uid="Switch"]')));*/
					// }}}
				}
				e.appendChild(ol);
			})( this.Controls.reduce((r,v)=>{ r[v]=true; return r; },{}), "" );
			return e;
		})(document.querySelector('main'));
		document.body.insertBefore(this.GC, document.body.querySelector('footer'));

		// 安裝頁面內容
		this.sync(pages);
	}	// init

	// Settings Utility
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
	{
		const CL=this.GC.querySelector('#overlay').classList;
		CL.remove('menu','dialog');
		for (let key of ['menu','dialog']) if (key===v) CL.add(key);
	}
	get Overlay ()
	{
		const CL=this.GC.querySelector('#overlay').classList;
		return CL.contains('menu') ? 'menu' : CL.contains('dialog') ? 'dialog' : undefined;
	}

	nop () { }

	set (name, value) // set:SettingName:SettingValue
	{	return this[name]=value; }

	call (fn, ...args)
	{
		try {
			Apps[fn](...args);
		} catch(x) { console.log(x); }
	}

	go (target, dft_url)
	{
		try { return this.PageNumber=target; } catch(x) { if (dft_url) location.replace(dft_url); }
	}

	sw (TK)
	{	// <class='switch' <data-case='A'> <data-case='B'>>
		(	Apps.E(Apps.E(event.target).trace('.switch'))
		).forEach(
			'[data-h^="sw:"]',
			(e) => e.classList[e.dataset.h === `sw:${TK}` ? 'add' : 'remove']('current')
		).forEach(
			'[data-case]',
			(e) => e.classList[e.dataset.case === TK ? 'remove' : 'add']('hide')
		);
	}

	play (caption, mn, ...args)
	{	// play:dom:&this:Caption
		// play('dom',document.getElementById(...),'Caption');
		const VE = document.createElement("div");
		let e = undefined;
		args.unshift(mn);
		if (args[args.length-1] instanceof Element)
			VE.innerHTML=args.pop().innerHTML;
		VE.dataset.xl = args.join(":");
		this.Content.prepare(VE);
		this.Overlay='dialog';
		((DLG)=>{
			DLG.querySelector('div').textContent=caption||'Dialog';
			const rv = DLG.querySelector('section');
			while (rv.firstChild) rv.removeChild(rv.firstChild);
			rv.removeAttribute('class');
			// rv._EH_=EH;
			rv.appendChild(VE);
		})(this.GC.querySelector('#dialog'));
	}

	prepare (elem, mn, ...args)
	{	// prepare:&this:template:...
		return this.Content.prepare(elem, mn, args).then(()=>0,()=>0);
	}

	// speak('bonjour','fr');
	// <span data-h='speak:&text:fr'>bonjour</span>
	async speak (text, lang='en')
	{
		text=text.replaceAll(/[🔈]/g,'').split(/\s+/).filter((v)=>v).join(' ');
		if ('speechSynthesis' in window) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = lang;
			utterance.rate = (lang.startsWith('ko')||lang.startsWith('ja')) ? 1.0 : 0.8;
			speechSynthesis.speak (utterance);
		} else alert('Speech Synthesis API not supported.');
	}

	filter (cmd)
	{
		if (cmd === 'add') {
			//<div data-uid='Settings:Keywords'><span data-h='filter:add'>➕</span></div>
			let flts=this.Filters;
			flts.push(this.Keywords);
			this.Filters.set(flts);
		} else
		if (cmd === 'run') {
			location.replace(`?s=${(new KeyFilter(this.Filters)).toString()}`);
			location.replace(`?s=${encodeFilter(this.Filters)}`);
		}
	}

	search (key)
	{
		let ts = this.Content.E.querySelector(`section[data-ks~="${key}"]`);
		if (ts) ts.click();
		this.set('Overlay','none');
	}

	fullscreen (e)
	{
		e = ({
			"body": ()=>document.body,
			"main": ()=>this.GC,
			"section": ()=>this.Content.CurPage
		}[e] || (()=>this.Content.CurPage.querySelector(e)))();

		if (e instanceof Element) {
			if (e !== document.fullscreenElement)
				e.requestFullscreen();
			else e = undefined;
		}
		if ((!e) && document.fullscreenElement)
			document.exitFullscreen(); // exit fullscreen mode
	}

	_EH_ (evt)
	{
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
	}

	_KH_ (evt)
	{
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
	}
}	// }}}

(async (Ps)=>{
	Object.assign(Apps, await Ps);

	Apps.Ns = new (class {
		// Named Object Database {{{
		constructor () {
			this.CDB = {
				template: class {
					constructor (e) { this.Temp = e.innerHTML; }
					async put (e,d) {
						e.innerHTML = this.Temp;
						await Apps.E(e).put(d);
						return e;
					}
				},
				data: class {
					constructor (re) {
						re = Apps.E(re).query('[data-def="data"]') || re;
						this.D = Apps.E(re).get();
						if (this.D.url) {
							let rb = Apps.E(re).trace('section');
							this.RBase = Apps.R((rb && rb.dataset.rbase) ? {"url":rb.dataset.rbase} : undefined);
						}
					}
					async get () {
						return this.D.url ? await this.RBase.resolve(this.D.url).fetch(this.D.payload)
							: this.D.doc ? JSON.parse(this.D.doc)
							: (this.D.raw || "");
					}
				}
			},
			this.DB = {
				"MView": Apps.E(`<div class='fill'><div data-xl='media' class='fill'><div data-v='data:media:media'></div></div></div>`).E
			};
		}
		register (n, cn, ...a) {
			this.DB[n] = new this.CDB[cn] (...a);
		}
		resolve (n, ...a) {
			return n in this.DB ? this.DB[n] :
				n in this.CDB ? new this.CDB[n] (...a) :
				a[0]; 
		}
/*
		async sync (n, payload) {
			return await ( n in this.DB ?
				this.DB[n].get() :
				Apps.fetch(payload ? {"post":n,"payload":payload} : {"get":n})
			);
		}
		getClass (n, dft) { return this.CDB[n] || dft; }
*/
		// }}}
	})();

	window.Apps = Object.assign(Apps, window.Apps||{});
	Apps.Ready.setReady(Apps);
})(Apps.loadScript(Apps.JSPrefix+"piers.js"));

document.addEventListener('DOMContentLoaded', async () => {
	await Apps.Ready;

	Apps.Player = new Player();
	await Apps.Player.init(Apps.Args);

	document.body.addEventListener('click', (evt)=>Apps.Player._EH_(evt));
	document.body.addEventListener('change', (evt)=>Apps.Player._EH_(evt));
	window.addEventListener('keydown', (evt)=>Apps.Player._KH_(evt));
	window.addEventListener('resize', (evt)=>{
		Apps.Player.FontScale = Apps.Player.FontScale;
		Apps.Player.Content.PageNumber = 'refresh';
	});

	if (!Apps.Timer)
		Apps.Timer = setInterval(()=>{
			const cp=Apps.Player.Content.CurPage;
			if (cp && cp.tick) cp.tick(true);
		},500);

	document.body.style.opacity='1';
});

})(document.currentScript);
