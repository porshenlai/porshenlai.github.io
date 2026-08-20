((SCRIPT) => {

async function do_fetch (doc) // { "get":url, "post":url, "raw":text, "doc":doc }
{	// {{{
	let res=undefined,
			resolve = doc.rbase ? (u)=>(
				(rb,u)=>u.indexOf('://')>0 ? u : (rb[0] + (u.startsWith('/') ? '' : rb[1]) + u)
			)(doc.rbase,u) : (u)=>u;

	if (doc.post) {
		res=await fetch(resolve(doc.post), {
    		method: 'POST',
     		headers: { 'Content-Type': 'application/json' },
     		body: doc.payload||'{}'
		});
	}else if (doc.get) res=await fetch(resolve(doc.get));
	if (res) {
		if (res.ok) try {
			if (res.headers.has('content-type')) {
				switch (res.headers.get('content-type').replaceAll(/;.*$/g,'')) {
				case 'application/json':
					return await res.json();
				case 'text/html':
					return ((s)=>{
   						const parser = new DOMParser();
   						const doc = parser.parseFromString(s, 'text/html');
						return doc;
					})(await res.text());
				default:
					console.log(res.headers.get('content-type').replaceAll(/;.*$/g,''));
					return await res.text();
				}
			} else return await res.json();
		} catch(x) { return await res.text(); }
		console.log({"E":res.statusText});
	}
}	// }}}

class _E
{ 	// {{{
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
	get (cn) {
		cn=Array.isArray(cn) ? cn : cn.split(':');
		switch (cn[0]) {
		case 'text': return this.E.textContent;
		case 'value': return this.E.value;
		case 'data': return this.dataset[cn[1]];
		case 'style': return this.style[cn[1]];
		}
	}
	put (cn, val) {
		cn=Array.isArray(cn) ? cn : cn.split(':');
		switch (cn) {
		case 'text': this.E.textContent = val; break;
		case 'value': this.E.value = val; break;
		case 'data': this.E.dataset[cn[1]] = val; break;
		case 'style': this.E.style[cn[1]] = val; break;
		}
	}
}	// }}}

class _D
{	// {{{
	// let d = new _D({"A":{"a":123},"B":456});
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

class _U
{	// {{{
	// let u = new _U('http://localhost:8080/Study/index.html');
	constructor (u) {
		u = u||location;
		this.Base = u.href || u;
	}
	// URL ret = u.resolve("Course/index.html");
	resolve (u) {
		let r = URL.parse(u);
		if (!r) {
			r = URL.parse(this.Base);
			r.pathname = u.startsWith('/') ? u : (r.pathname.replace(/[^\/]*$/,'')+u);
		}
		return r;
	}
}	// }}}

class _R
{	// {{{
	// let r = new _R(URL.parse(...))
	// let r = new _R(<... <data-v="url:..."> ...>)
	// let r = new _R("data string")
	// let r = new _R({object})
	constructor (a) {
		if (!a) throw('null argument');
		if (a instanceof URL)
			a = { "url": a };
		if (a instanceof Element)
			a = Array.from(a.querySelectorAll('[data-v]')).reduce((r,e)=>{
				let ep=e.dataset.v.split(':');
				r.set(ep.pop(),e.get(ep));
				return r;
			},new _D({})).D;
		if ('string' === typeof(a))
			a = { "text": a };
		if ('object' === typeof(a) && !("url" in a || "text" in a || "doc" in a) )
			a = { "doc": a };
		this.A = a;
	}
	// {} | <> | "" = await r.get({payload})
	async get (payload) {
		if (this.A.url) {
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
			console.log({"E":res.statusText});
		} else return this.A.doc || this.A.text;
	}
}	// }}}

class Data extends _E
{	// Data {{{
	constructor (re) {
		super(Apps.E(re).query('[data-def="data"]')||re);
	}
	async createRequest () {
		const doc = await Apps.Ns.create('template',this.E).get();
		try {
			doc.rbase=JSON.parse(Apps.E(this.E).trace('section').dataset.rbase);
		} catch(x) { }
		return doc;
	}
	async put (doc) // doc:DOC Object
	{	// write DOC to data source {{{
	}	// }}}
	async get ()
	{	// read DOC from data Source {{{
		const doc = await this.createRequest();
		if (doc.doc) return JSON.parse(doc.doc);
		if (doc.raw) return doc.raw;
		this.URL = doc.post || doc.get;
		let r = await do_fetch(doc);
		if ((!r) && this.E.querySelector('[data-h="submit"]')) {
			r = this.E.cloneNode(true);
			delete r.dataset.def;
		}
		return r;
	}	// }}}
}	// Data }}}

class Template extends _E
{	// Template {{{
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
	_E: _E, _D: _D, _U: _U, _R: _R,
	Data: Data, Template: Template,
	fetch: fetch,
	test: async () => {
		console.log(await (new _U()).resolve('list_test.json').get());
		console.log(await (new _R((new _U()).resolve('list_test.json'))).get());
	}
};

})(document.currentScript);
