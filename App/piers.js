((SCRIPT) => {

class E
{ 	// {{{
	// E = new E(<>)
	// E = new E("HTML")
	constructor (e) {
		if ('string' === typeof(e)) {
			e = (new DOMParser()).parseFromString('<html><body>'+e+'</body></html>','text/html');
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
				text: ()=>e.textContent.trim(),
				value: ()=>e.value,
				data: (n)=>e.dataset[n],
				style: (n)=>e.style[n]
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
				text: (v)=>(e.textContent=v),
				value: (v)=>(e.value=v),
				data: (v, a)=>(e.dataset[a]=v),
				style: (v, a)=>(e.style[a]=v)
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
	// let d = new D({"url":"網址","payload":{負載}})
	// d.request(R)
	async request (base) {
		if (this.D.url)
			return await (base ?
				base.resolve(this.D.url) :
				(new R()).resolve(this.D.url)
			).fetch(this.D.payload);
		else return (
			this.D.doc ? JSON.parse(this.D.doc) :
			this.D.raw ? this.D.raw : {}
		);
	}
}	// }}}

class R
{	// {{{
	//	R = new R();
	//	R = new R(URL.parse(網址));
	//	R = new R(<... <data-v='url:網址'>...>)
	//	R = new R("JSON 或 文字資料")
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
	//	R = base.resolve(位置);
	resolve (src) // R = R.resolve('test.json')
	{
		let u = URL.parse(this.A.url);
		u.pathname = src.startsWith('/') ? src : (u.pathname.replace(/[^\/]*$/,'')+src);
		return new R(u);
	}
	// D = await R.fetch(籌載);
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
}	// }}}

SCRIPT.value={
	E: (...a)=>new E(...a), _E:E,
	D: (...a)=>new D(...a),
	R: (...a)=>new R(...a),
};

})(document.currentScript);
