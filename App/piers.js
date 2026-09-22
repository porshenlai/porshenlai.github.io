((SCRIPT) => {

function dfs (e,h,x=false)
{ // {{{
	let r=[],m;
	if (x) {
		m=h(e); if (m) r.push(e);
		if ('boolean'!==typeof(m)) return r;
	}
	for (let i=e.firstChild; i; i=i.nextSibling) if (i.nodeType===1) {
		m=h(i); if (m) r.push(i);
		if ('boolean'===typeof(m)) r.push(...dfs(i,h));
	}
	return r;
} // }}}

async function get_data_url (blob)
{	// {{{
	return await new Promise((or,oe)=>{
		let r=new FileReader();
		r.addEventListener("load",(e)=>or(e.target.result));
		r.addEventListener("error",oe);
		r.readAsDataURL(blob);
	});
}	// get_data_url }}}

async function decode_blob (blob, type='image/*')
{	// {{{
	async function r (blob, parser, binary=false){
		let r=new FileReader();
		return new Promise((or,oe)=>{
			r.addEventListener("error", oe);
			r.addEventListener("load", (evt)=>or(parser(evt.target.result)));
			r[binary ? "readAsBinaryString" : "readAsText"](blob);
		});
	}
	switch(type){
	case "application/json":
		return await r(this.BB, (d)=>JSON.parse(d));
	case "text/html": case "image/svg+xml":
		return await r(this.BB, (d)=>(new DOMParser()).parseFromString(d, type));
	case "image/jpeg": case "image/png": case "image/gif":
	case "application/pdf":
		return await get_data_url(blob);
	default:
		if (type.startsWith('image/'))
			return await get_data_url(blob);
		return await r(bb, (d)=>d, !(""+type).startsWith("text/"));
	}
}	// decode_blob }}}

async function upload (type, mul)
{ // {{{
	return await new Promise(function (or, oe) {
		const e=document.createElement("input");
		e.multiple=mul;
		e.setAttribute("type","file");
		e.setAttribute("accept",type||"*/*");
		e.style.position="absolute";
		e.style.top="100%";
		e.addEventListener("error",oe);
		e.addEventListener("change",function (evt) {
			or([... this.files]);
			if (this.parentNode)
				this.parentNode.removeChild(this);
		});
		document.body.appendChild(e);
		e.click();
		setTimeout(function () {
			if (e.E.parentNode)
				e.E.parentNode.removeChild(e);
		}, 3000);
	});
}	// upload }}}

async function download (blob, name)
{	// {{{
	const e=document.createElement("A");
	e.setAttribute("href",await get_data_url(blob));
	e.setAttribute("target","_blank");
	e.setAttribute("download",name||"download");
	e.style.left="-100%";
	document.body.appendChild(e);
	e.click();
	setTimeout(function(){ document.body.removeChild(e); },500);
}	// download }}}

class E { 
	// new E(<>); new E("<html>", "CSS_Selector"); {{{
	constructor (e) {
		if ('string' === typeof(e)) {
			e = (new DOMParser()).parseFromString('<html><body>'+e+'</body></html>','text/html');
			e = e.body.firstChild;
		}
		this.E = e;
	}	// }}}
	// <祖先> = E.trace(..."CSS 選擇") {{{
	trace (...cs) {
		for (let e=this.E; e instanceof Element; e=e.parentNode)
			for (let c of cs) if (e.matches(c)) return e;
	}	// }}}
	// <子孫> = E.query("CSS 選擇") {{{
	query (cs) {
		if (this.E.matches(cs)) return this.E;
		return this.E.querySelector(cs);
	}	// }}}
	// [<子孫>] = E.list("CSS 選擇") {{{
	list (cs) {
		let r=Array.from(this.E.querySelectorAll(cs));
		if (this.E.matches(cs)) r.unshift(this.E);
		return r;
	}	// }}}
	// E.forEach("CSS 選擇", (<>)=>處理) {{{
	forEach (cs, h) {
		this.E.matches(cs) && h(this.E);
		Array.from(this.E.querySelectorAll(cs)).forEach(h);
		return this;
	}	// }}}
	dfs (h,x=false) { return dfs(this.E,h,x); }
	replace (ce) { // E.replace(<用來取代目前元件的新元件>) {{{
		const pe = this.E.parentNode;
		if (pe) {
			pe.insertBefore(ce, this.E);
			pe.removeChild(this.E);
		}
		this.E=ce;
		return this;
	}	// }}}
	get (cn) { // "內容" = E.get("text | value | data:名稱 | style:名稱") {{{
		const read = (e, n) => {
			return {
				text: ()=>e.textContent.trim(),
				value: ()=>e.value,
				data: (n)=>e.dataset[n],
				style: (n)=>e.style[n],
				attr: (n)=>e.getAttribute(n)
			}[n.shift()](...n);
		}, readAll = (e, val) => {
			for (let i of (new E(e)).dfs((e)=>e.matches('[data-c]') ? 1 : e.matches('[data-v]'), true)) {
				if (i.dataset.v) for (let cn of i.dataset.v.split(';')) {
					cn = cn.split(':');
					val.put(cn.pop(), read(i, cn));
				}
				if (i.dataset.c) {
					const a=i.dataset.c.split(':'), t=a.shift(), da=[];
					for (let row of Array.from(i.querySelectorAll('[data-aid]'))) {
						let rid=parseInt(row.dataset.aid);
						if (!da[rid]) da[rid]={};
						readAll(row,new D(da[rid]));
					}
					val.put(a.pop(), da);
				}
			}
			return val.D;
		};
		return cn ?
			read(this.E, Array.isArray(cn) ? cn : cn.split(':')) :
			readAll(this.E, new D({})) ;
	}	// }}}
	put (val, cn) { // E.put("text | value | data:名稱 | style:名稱", "內容") {{{
		const write = (e, v, n) => {
			return {
				text: (v)=>(e.textContent=v),
				value: (v)=>(e.value=v),
				data: (v, a)=>(e.dataset[a]=v),
				style: (v, a)=>(e.style[a]=v),
				attr: (v, a)=>e.setAttribute(a,v)
			}[n.shift()](v, ...n);
		}, writeAll = (e, val) => {
			for (let i of (new E(e)).dfs((e)=>e.matches('[data-c]') ? 1 : e.matches('[data-v]'))) {
				if (i.dataset.v) for (let cn of i.dataset.v.split(';')) {
					cn = cn.split(':');
					write(i, cn.length<2 ? val.D : val.get(cn.pop()), cn)
				}
				if (i.dataset.c) {
					const a=i.dataset.c.split(':'), t=a.shift() ;
					i.template=((te)=>{
						while (i.firstChild) te.appendChild(i.firstChild);
						return te;
					})(document.createElement("div"));
					let v = val.get(a.pop());
					if (t === 'kvs') {
						let r=[],k;
						for(k in v)
							r.push( 'object' === typeof(val[k])
								? Object.assign({_k_:k},val[k])
								: {_k_:k,_v_:v[k]} ) ;
						v = r;
					} else if (t === 'ss') v = Array.isArray(v) ? v.map((s)=>({_v_:s})) : [v];
					if(v)
						v.forEach((v,x) => {
							const te = i.template.cloneNode(true);
							writeAll(te, new D(v));
							while (te.firstChild) if(te.firstChild.nodeType===1) {
								te.firstChild.dataset.aid=x;
								i.appendChild(te.firstChild);
							} else te.removeChild(te.firstChild);
						});
				}
			}
		};
		if (cn) return write(this.E, val, Array.isArray(cn) ? cn : cn.split(':'));
		writeAll(this.E, new D(val));
	}	// }}}
	join (pe, ne) { // E.join(父元件, 弟元件=undefined)  {{{
		pe.insertBefore(this.E, ne);
	}	// }}}
}	// class E

class D {
	// new D({"A":{"a":123},"B":456}); {{{
	constructor (d) {
		if (d instanceof Element) d = (new E(d)).get();
		try {
			if ('string'===typeof(d)) d=JSON.parse(d||'{}');
		} catch(x) {};
		this.D = d;
	}	// }}}
	// d.get("A.a") => 123 {{{
	get (p) {
		if (!p) return this.D;
		let nv = {},
			rv = (Array.isArray(p) ? p : p.split('.'))
				.filter((n)=>n)
				.reduce((d,n)=>n in d ? d[n] : nv,this.D);
		return rv!==nv ? rv : undefined;
	}	// }}}
	// d.put("A.a",999) {{{
	put (p,v) {
		if (p) {
			p = (Array.isArray(p) ? p : p.split('.')).filter((n)=>n);
			let n = p.pop(),
				d = p.reduce((d,n)=> { if (!(n in d)) d[n] = {}; return d[n]; }, this.D);
			d[n] = v;
		} else this.D = v;
	}	// }}}
	// toString() => JSON string {{{
	toString () {
		return JSON.stringify(this.D);
	}	// }}}
	// await (new D({"url":"網址","payload":{負載}})).request(R) {{{
	async request (base) {
		if (this.D.url) {
			return await (base ?
				base.resolve(this.D.url) :
				(new R()).resolve(this.D.url)
			).fetch(this.D.payload);
		} else return (
			this.D.doc ? JSON.parse(this.D.doc) :
			this.D.raw ? this.D.raw : {}
		);
	}	// }}}
}	// class D

class R {
	constructor (a) {
		//	目前頁面 = new R();
		//  特定網址 = new R(URL.parse(網址));
		//	<定義> = new R(<... <data-v='url:網址'>...>);
		//	"內容" = new R("文字資料")
		//  使用者上傳 = new R({"type":"MIME-TYPE"});
		//  {{{
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
		this.A = a;
		//  }}}
	}
	resolve (src) {
		//	R = 基底R.resolve(位置)
		//  {{{
		let u = URL.parse(this.A.url);
		u.pathname = src.startsWith('/') ? src : (u.pathname.replace(/[^\/]*$/,'')+src);
		return new R(u);
		//  }}}
	}
	getUB () {
		//  URL基底 = getUB()
		//  {{{
		let u = this.A.url,p;
		if ('string'===typeof(u)) u = URL.parse(u);
		p = u.pathname.split('/'); p.pop(); p = p.join('/');
		return u.origin+p+'/';
		//  }}}
	}
	async fetch (payload) {
		// {} | <> | "" = await 網址R.fetch(籌載)
		// {{{
		if (this.A.raw||this.A.doc) return this.A.raw||this.A.doc;
		if (this.A.upload) {
			let f, fs = await upload(this.A.upload, this.A.multiple), rs=[];
			for (f of fs) rs.push(decode(blob(f)));
			return rs;
		}
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
				return ((s) => {
    				const doc = (new DOMParser).parseFromString(s, 'text/html');
					return this.A.cs ? doc.body.querySelector(this.A.cs) : doc;
				})(await res.text());
			}
			return await res.text();
		}
		return {'E':res.statusText};
		// }}}
	}
}

(new E('<link rel="stylesheet" href="/App/piers.css"/>')).join(document.head);
SCRIPT.value={
	E: (...a)=>new E(...a),
	D: (...a)=>new D(...a),
	R: (...a)=>new R(...a),
};
SCRIPT.value.E.Class = E;


})(document.currentScript);
