((SCRIPT) => {

class E
{ 	// {{{
	// E = new E(<>)
	// E = new E("HTML")
	constructor (e) {
		if ('string' === typeof(e)) {
			e = (new DOMParser()).parseFromString('<html><body>'+html+'</body></html>','text/html');
			e = e.body.firstChild;
		}
		this.E = e;
	}
	// <祖先> = E.trace(..."CSS 選擇")
	trace (...cs) {
		for (let e=this.E; e instanceof Element; e=e.parentNode)
			for (let c of cs) if (e.matches(c)) return e;
	}
	// <子孫> = E.query("CSS 選擇")
	query (cs) {
		if (this.E.matches(cs)) return this.E;
		return this.E.querySelector(cs);
	}
	// [<子孫>] = E.list("CSS 選擇")
	list (cs) {
		let r=Array.from(this.E.querySelectorAll(cs));
		if (this.E.matches(cs)) r.unshift(this.E);
		return r;
	}
	// E.forEach("CSS 選擇", (<>)=>處理)
	forEach (cs, h) {
		this.E.matches(cs) && h(this.E);
		Array.from(this.E.querySelectorAll(cs)).forEach(h);
		return this;
	}
	// E.replace(<用來取代目前元件的新元件>)
	replace (ce) {
		const pe = this.E.parentNode;
		if (!pe) throw new Error('Not in DOM tree:', this.E);
		pe.insertBefore(ce, this.E);
		pe.removeChild(this.E);
		this.E=ce;
		return this;
	}
	// "內容" = E.get("text | value | data:名稱 | style:名稱")
	get (cn) {
		const read=(e, n) => {
			return {
				text: ()=>this.E.textContent,
				value: ()=>this.E.value,
				data: (n)=>this.E.dataset[n],
				style: (n)=>this.E.style[n]
			}[n.shift()](...n);
		}
		return cn ?
		read(this.E, Array.isArray(cn) ? cn : cn.split(':')) :
		Array.from(this.E.querySelectorAll('[data-v]')).reduce((r, e)=>{
			let n=e.dataset.v.split(':');
			r.put(n.pop(), read(e, n));
			return r;
		}, new D({})).D ;
	}
	// E.put("text | value | data:名稱 | style:名稱", "內容")
	put (val, cn) {
		const write=(e, v, n) => {
			return {
				text: (v)=>(this.E.textContent=v),
				value: (v)=>(this.E.value=v),
				data: (v, a)=>(this.E.dataset[a]=v),
				style: (v, a)=>(this.E.style[a]=v)
			}[n.shift()](v, ...n);
		}, d=new D({})
		if (cn) return write(this.E, val, Array.isArray(cn) ? cn : cn.split(':'));
		val = new D(val);
		Array.from(this.E.querySelectorAll('[data-v]')).forEach((e)=>{
			let n=e.dataset.v.split(':');
			write(e, val.get(n.pop()), n);
		});
	}
}	// }}}

class D
{	// {{{
	// let d = new D({"A":{"a":123},"B":456});
	constructor (d) {
		this.D = "string" === typeof(d) ? JSON.parse(d) : d;
	}
	// d.get("A.a") => 123
	get (p) {
		let nv = {},
				rv = (Array.isArray(p) ? p : p.split('.'))
					.filter((n)=>n)
					.reduce((d,n)=>n in d ? d[n] : nv,this.D);
		return rv!==nv ? rv : undefined;
	}
	// d.put("A.a",999)
	put (p,v) {
		p = (Array.isArray(p) ? p : p.split('.')).filter((n)=>n);
		let n = p.pop(),
			d = p.reduce((d,n)=> { if (!(n in d)) d[n] = {}; return d[n]; }, this.D);
		d[n] = v;
	}
	// toString() => JSON string
	toString () {
		return JSON.stringify(this.D);
	}
}	// }}}

//	R = new R();
//	R = new R(URL.parse(網址));
//	R = new R(<... <data-v='url:網址'>...>)
//	R = new R("JSON 或 文字資料")
//	R = await base.resolve(位置);
//	D = R.fetch(籌載);
//	D = await base.sync({ url: 位置, payload: 籌載 });
class R
{	// {{{
	constructor (a)
	{
		if (!a) a=URL.parse(location.href);
		if (a instanceof URL)
			a = { "url": a };
		if (a instanceof Element)
			a = Array.from(a.querySelectorAll('[data-v]')).reduce((r,e)=>{
				let ep=e.dataset.v.split(':');
				r.set(ep.pop(),e.get(ep));
				return r;
			},new D({})).D;
		if ('string' === typeof(a))
			a = { "raw": a };
		if ('object' === typeof(a) && !("url" in a || "text" in a || "doc" in a) )
			try {
				a = { "doc": JSON.parse(a) };
			} catch (x) { a = {"doc": a}; }
		this.A = a;
	}
	// {} | <> | "" = await r.get({payload})
	async fetch (payload)
	{
		if (this.A.raw||this.A.doc) return this.A.raw||this.A.doc;
		let res = payload ? await fetch(this.A.url, {
      			method: 'POST',
      			headers: { 'Content-Type': 'application/json' },
      			body: 'string'===typeof(payload) ? payload : JSON.stringify(payload)
			}) : await fetch(this.A.url);
		if (res.ok) {
			if (res.headers.has('content-type'))
			switch (res.headers.get('content-type').replaceAll(/;.*$/g,'')) {
			case 'application/json':
				return await res.json();
			case 'text/html':
				return ((s)=>{
    				const parser = new DOMParser();
    				const doc = parser.parseFromString(s, 'text/html');
					return doc;
				})(await res.text());
			}
			return await res.text();
		}
		return {'E':res.statusText};
	}
	resolve (src) // R = R.resolve('test.json')
	{
		let u = URL.parse(this.A.url);
		u.pathname = src.startsWith('/') ? src : (u.pathname.replace(/[^\/]*$/,'')+src);
		return new R(u);
	}
	async sync (cfg)	// this:<base>, ({ url:..., payload:..., raw:... })
	{
		if (cfg.url)
			return await this.resolve(cfg.url).fetch(cfg.payload);
		else
		if (cfg.doc)
			try {
				return JSON.parse(cfg.doc);
			} catch(x) { return cfg.doc; }
		else
		if (cfg.raw)
			return cfg.raw;
	}
}	// }}}

class Data extends E
{	// Data {{{
	constructor (re) {
		super((new Apps.E(re)).query('[data-def="data"]')||re);
	}
	async createRequest () {
		const doc = await Apps.Ns.create('template',this.E).get();
		try {
			doc.rbase=JSON.parse((new Apps.E(this.E)).trace('section').dataset.rbase);
		} catch(x) { }
		return doc;
	}
	async put (doc) // doc:DOC Object
	{	// write DOC to data source
	}
	async get ()
	{	// read DOC from data Source
		let doc = await this.createRequest();
		doc = Object.keys(doc).reduce((r,k)=>{
			switch(k){
			case 'get': case 'post':
				r.url = doc[k]; break;
			default:
				r[k] = doc[k]; break;
			}
			return r;
		},{})

		if (doc.url) this.URL = doc.url;
		let r = await (new R()).sync(doc);

		if ((!r) && this.E.querySelector('[data-h="submit"]')) {
			r = this.E.cloneNode(true);
			delete r.dataset.def;
		}
		return r;
	}
}	// Data }}}

class Template extends E
{	// Template {{{
	async put (doc) // doc:DOC Object
	{	// write DOC to template Element {{{
		const e = this.E.cloneNode(true);
		if (e.dataset.def) e.removeAttribute('data-def');
		console.log("DEBUGGGGGGGGGGGGGGGGGGGG",doc);
		function w(e, d, nr=false)
		{	// {{{
			if (nr) {
				if (e.dataset.c)
					for (let args of e.dataset.c.split(';').filter((a)=>a))
						((cmd, ...args) => {
							switch (cmd) {
							case "repeat": case 'foreach':
								((t,p,d)=>{
									p.removeChild(t);
									if (!Array.isArray(d))
										d=Object.entries(d).reduce((r,p)=>{
											let o=('object'===typeof(p[1])) ? p[1] : {_v_:p[1]};
											o._k_=p[0];
											r.push(o); return r;
										},[]);
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
								case "text": e.textContent=a1 ? d[a1] : d; break;
								case "value": e.value=a1 ? d[a1] : d; break;
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
				if (e.dataset.v) {
					for (let args of e.dataset.v.split(';').filter((a)=>a))
						((cmd, a1, a2) => {
							switch (cmd) {
							case "text": d[a1]=e.textContent; break;
							case "value": d[a1]=e.value; break;
							case "data": d[a2]=e.dataset[a1]; break;
							}
						})(...Apps.splitArgs(args));
				}
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
}	// }}}

SCRIPT.value={
	E: (...a)=>new E(...a),
	D: (...a)=>new D(...a),
	U: (...a)=>new U(...a),
	R: (...a)=>new R(...a),
	Data: Data, Template: Template,
	fetch: fetch,
	test: async () => {
		console.log(await (new U()).resolve('list_test.json').get());
		console.log(await (new R((new U()).resolve('list_test.json'))).get());
	}
};

})(document.currentScript);
