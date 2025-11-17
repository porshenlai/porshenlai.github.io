// <script type="javascript" PiersEntrance="Main.init" PiersXMods="Widget,TbUtil" PiersXCss="landscape,portrait" src="piers/init.js"></script>
(async function(){
	let Piers;

	if (!document.currentScript)
		return console.log("NULL = document.currentScript");

	const Env = ((i)=>({
		"Args" : (location.search||'?').substr(1).split('&').reduce((r,v)=>((i)=>{
			if (i[1]) r[i[1]]=i[3]||true;
			return r;
		})(/([^=]*)(=(.*))?/.exec(v)),{}),
		"Mobile":/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
		"OnTop":window.self === window.top,
		"ScriptPath": i[1],
		"PSDOM": document.currentScript
	}))(/(.*)init.js/.exec(document.currentScript.getAttribute("src")||""));

	function __get__ (o, n, dv) {
		try {
			if (!Array.isArray(n)) n=n.split(".").filter((v) => v);
				return (n||[]).reduce((r,i) => r[i],o);
		} catch (e) {
			return dv;
		}
	}

	function __put__ (o, n=[], v) {
		if (!Array.isArray(n))
			n=n.split(".").filter((v) => v);
		let nn=n[n.length-1], pn=n.slice(0,-1);
		o = pn.reduce((r, i) => {
			if (!r[i])
				r[i]={};
			return r[i];
		}, o);
		o[nn] = v;
	}

	async function __import__ (pf, re=document.head, be=undefined)
	{
		pf=(
			/^[^\?]+\.css(\?.*)*/.exec(pf.toString()) ? { "css":pf } :
			/^[^\?]+\.js(\?.*)*/.exec(pf.toString()) ? { "src":pf } : pf
		);
		if (pf.src)
			return await new Promise(function (or, oe) {
				const e=document.createElement("script");
				e.value={};
				for (let k in pf) e.setAttribute(k,pf[k]);
				e.addEventListener("load", async function(evt) {
					or(await Promise.resolve(this.value));
					e.parentNode.removeChild(e);
				});
				e.addEventListener("error", async function(evt) {
					oe(await Promise.resolve("Failed to load ("+pf.src+")"));
					e.parentNode.removeChild(e);
				});
				re.insertBefore(e,be);
			});
		else if (pf.pier){
			let m={}, r=[];
			for (const v of pf.pier.split("_")) {
				r.push(v);
				console.log("RESULT",v,r);
				if (!__get__(Piers,r)){
					let ps=__import__(Env.ScriptPath+r.join("_")+".js");
					__put__(Piers,r,ps);
					__put__(Piers,r,await ps);
				}
			}
			console.log("RESULT",r);
			return __get__(Piers,r);
		}
		else if (pf.xl) {
			let S=Piers.XLDB || (Piers.XLDB={
				"db":await Piers.fetch(Env.ScriptPath+"XLDB.json"),
				"modules":{},
				"loading":{}
			});
			if (!S.db[pf.xl]) throw("No such library");
			if (pf.xl in S.modules) return S.modules[pf.xl];

			if (!(pf.xl in S.loading))
				S.loading[pf.xl]=(async () => {
					if (!(pf.xl in S.modules)) {
						await __import__(S.db[pf.xl]);
						console.log("NAME is ",pf.xl, window[pf.xl]);
						S.modules[pf.xl]=window[pf.xl];
						delete window[pf.xl];
						delete S.loading[pf.xl];
					}
					return S.modules[pf.xl];
				})();
			await S.loading[pf.xl];
			return S.modules[pf.xl];
		}
		else if (pf.css) {
			const e=document.createElement("link");
			e.setAttribute("rel","stylesheet");
			e.setAttribute("href",pf.css);
			e.setAttribute("media",pf.media||"all");
			re.insertBefore(e,be);
		}
	}

	async function __upload__ (type, mul)
	{
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
	}	// __upload__

	// await __import__("patch.js");

	class BLOB
	{	// {{{
		constructor (b, t) {
			if (!(b instanceof Blob)) {
				switch(typeof(b)) {
				case "object":
					b=new Blob([JSON.stringify(b)], {"type":t||"application/json;charset=utf8"});
					break;
				case "string":
					b=new Blob([b], {"type":t||"text/plain;charset=utf8"});
					break;
				}
			}
			this.BB=b;
		}	// constructor
		getType () { return this.BB.type; }
		async getDataURL () {
			return await new Promise((or,oe)=>{
				let r=new FileReader();
				r.addEventListener("load",(e)=>or(e.target.result));
				r.addEventListener("error",oe);
				r.readAsDataURL(this.BB);
			});
		}	// getDataURL
		async get () {
			async function r (blob, parser, binary=false){
				let r=new FileReader();
				return new Promise((or,oe)=>{
					r.addEventListener("error", oe);
					r.addEventListener("load", (evt)=>or(parser(evt.target.result)));
					r[binary ? "readAsBinaryString" : "readAsText"](blob);
				});
			}
			let type=this.BB.type.split(';')[0];
			switch(type){
			case "application/json":
				return await r(this.BB, (d)=>JSON.parse(d));
			case "text/html": case "image/svg+xml":
				return await r(this.BB, (d)=>(new DOMParser()).parseFromString(d, type));
			case "image/jpeg": case "image/png": case "image/gif":
			case "application/pdf":
				return await this.getDataURL();
			default:
				return await r(this.BB, (d)=>d, !(""+type).startsWith("text/"));
			}
		}	// get
		async download (n) {
			const e=document.createElement("A");
			e.setAttribute("href",await this.getDataURL());
			e.setAttribute("target","_blank");
			e.setAttribute("download",n||"download");
			e.style.left="-100%";
			document.body.appendChild(e);
			e.click();
			setTimeout(function(){ document.body.removeChild(e); },500);
		}	// download
	}	// }}}

	class Request
	{	// {{{
		constructor (url, payload, type) {
			this.URL=url;
			if (this.URL) {
				this.Opts={method:"GET"};
				if (payload) {
					this.Opts.method="POST";
					if (payload instanceof Blob) {
						type=type||payload.type;
					} else if ("object"===typeof(payload)) {
						type=type||"application/json;charset=utf8";
						payload=JSON.stringify(payload);
					} 
					if(type) this.Opts.headers=Object.assign(this.Opts.headers||{},{"Content-Type":type});
					if(payload) this.Opts.body=payload;
				}
			} else type=payload||type;
			this.ContentType=type;
		}
		async fetch (decode=true) {
			let rv;
			if (this.URL) {
				const response=await fetch(this.URL,this.Opts);
				if (!response.ok)
					throw new Error("FAILED")
				let b=await response.blob();
				rv=new BLOB(b, response.headers.get("Content-Type")+";charset=utf8");
			} else
				rv=new BLOB((await __upload__(this.ContentType,false))[0]);
			return decode ? await rv.get() : rv;
		}
	}	// }}}

	// 資料物件
	class DateTime extends Date
	{	// DateTime {{{
		constructor (d) { super(); this.set(d); }
		toJSON () { return this.S; }
		toFormat (fmt) {
			let vm={
					"{Y}":()=>this.getFullYear(),
					"{M}":()=>this.getMonth()+1, "{MM}":()=>fz(this.getMonth()+1),
					"{D}":()=>this.getDate(), "{DD}":()=>fz(this.getDate()),
					"{h}":()=>this.getHours(), "{hh}":()=>fz(this.getHours()),
					"{m}":()=>this.getMinutes(), "{mm}":()=>fz(this.getMinutes()),
					"{s}":()=>this.getSeconds(), "{ss}":()=>fz(this.getSeconds())
				},fz=(v)=>(v<10?'0':'')+v;
			return (fmt)
			?	fmt.match(/{[^}]+}/g).reduce((r, pa) => r.replaceAll(pa, vm[pa]()), fmt)
			:	this.S;
		}
		set (d=new Date()) {
			this.V=this.S=undefined;
			if (Array.isArray(d)) {
				this.V=d; d=undefined;
			} else if ("string" === typeof(d)) {
				this.S=d; d=undefined;
			} else if ("number" === typeof(d)) {
				if (d <= 99999999) this.V=[d,0]; else d=new Date(d);
			} else if (d==null) {
				d=undefined; this.V=[0,0]; this.S=" "; return;
			} else
				console.assert(d instanceof Date,"Not recognized datetime value");

			// sync
			d=d||(this.S ? ((d,t) => {
				d=d.split("-").concat((t||"00:00:00").split(":")).map((v)=>parseInt(v));
				return new Date(d[0], d[1]-1, d[2], d[3]||0, d[4]||0, d[5]||0);
			}).apply(null,this.S.split(' ')) : ((d,t) => {
				d=[parseInt(d/10000), parseInt((d%10000)/100), d%100]
					.concat(t ? [parseInt(t/3600), parseInt((t%3600)/60), t%60] : [0, 0, 0]);
				return new Date(d[0], d[1]-1, d[2], d[3], d[4], d[5]);
			})(this.V[0], this.V[1]));
			this.S=this.S||d.toLocaleString("sv-se");
			this.V=this.V||[
				d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate(),
   				d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
			];
			this.setTime(d.getTime());
		}
	}	// class DateTime }}}

	class Tuple extends Array
	{	// {{{
		constructor (v, s=" ") {
			super();
			this.Sep=s;
			if (v) {
				if ("string"===typeof(v)) v=v.split(s)
				v.forEach((v)=>this.push(v));
			}
		}
		toJSON () { return this.join(this.Sep); }
		toString () { return this.join(this.Sep); }
	}	// Tuple }}}

	class Records
	{	// Records {{{
		constructor (d, key="_K_")
		{
			if ("string"===typeof(d))
				d=JSON.parse(d);
			if (Array.isArray(d))
				d=d.reduce((db,row,idx) => {
					//if (!(key in row)) row[key]=idx;
					db[key in row ? row[key] : idx]=row;
					return db;
				}, {});
			this.Key=key;
			this.DB=d;
		}
		set_window (wd=20) {
			if (wd) {
				this.WindowWidth=wd;
				this.Cursor=0;
			} else {
				delete this.WindowWidth;
				delete this.Cursor;
			}
		}
		next_window () {
			this.Cursor+=this.WindowWidth;
			if (this.Cursor >= Object.keys(this.DB).length)
				this.Cursor-=this.WindowWidth;
		}
		prev_window () {
			this.Cursor-=this.WindowWidth;
			if (this.Cursor<0) this.Cursor=0;
		}
		get (k, dft)
		{	// 取得資料或全資料列表
			return k === undefined ? (()=>{
				let k, r=[];
				for (k in this.DB) r.push(this.DB[k]);
				return r;
			})() : (k in this.DB) ? this.DB[k] : dft ;
		}
		set (v)
		{	// 設定或刪除資料列
			"object"===typeof(v)
			? this.DB[v[this.Key]]=v
			: delete this.DB[v];
		}
		has (v)
		{
			return v[this.Key] in this.DB;
		}
		* list ()
		{
			if (this.WindowWidth) {
				for (let k=0;k<this.WindowWidth;k++) {
					const ks=Object.keys(this.DB);
					if (this.Cursor+k<ks.length)
						yield this.DB[ks[this.Cursor+k]];
					else break
				}
			} else {
				for (let k in this.DB)
					yield this.DB[k];
			}
		}
		toJSON ()
		{	// 轉成 JSON 格式
			return JSON.stringify(this.get());
		}
	}	// class Records }}}

	// 檔案系統
	let FileSystem = new (class {
		// {{{
		constructor () {
			this.Driver={ "Device": class {
				constructor () {
					this.Entry=class {
						constructor (path) { this.Path=path; this.Buf=undefined; }
						async read (dft) { this.Buf=dft; return this; }
						async write () { return this; }
						async remove () { return this; }
						async close () { this.Path=this.Buf=undefined; return this; }
					};
					this.Cache={};
				}
				__calcUID__ (path) { return undefined; }
				async __newF__ (path) { return new this.Entry(this, path); }
				async open (path, dft={}) {
					let uid=this.__calcUID__(path), f;
					this.Cache=this.Cache.filter((f,k)=>f.Path);
					if (uid) {
						if (this.Cache[uid])
							return this.Cache[uid];
						f=this.Cache[uid]=await this.__newF__(path);
					} else f=await this.__newF__(path);
					await f.read(dft);
					return f;
				}
			} };
			this.MT={};
		}
		mount (mp, fs) {
			if ("string"===typeof(mp))
				mp=mp.split("/");
			this.MT.put(mp.filter((s)=>s), fs);
		}
		async open (path, dft={}) {
			let mt=this.MT.O;

			if ("string"===typeof(path))
				path=path.split("/");
			else path=[].concat(path);
			path=path.filter((s)=>s);

			while (path.length>0) {
				let n=path.shift();
				if (n in mt) {
					mt=mt[n];
					if (mt instanceof this.Driver.Device) break;
				} else throw new Error("NOT_FOUND",{"cause":[mt,path]});
			}
			let fn=await mt.open(path, dft);
			return fn;
		}
		// }}}
	})();	// (class FileSystem)

	// 人機界面
	let Widgets={
		// {{{
		Template: class
		{
			constructor (e, o) {
				console.assert(e, "W.constructor(<NULL>)");
				Object.assign(this.E=e, {
					"_gw": ()=>this,
					"_value": "",
					"_opts": o||{}
				});
			}
			__update__ (d) { if (d!=undefined) this.E._value=d; return this.E._value; }
			async set (d) { this.__update__(d); return this; }
			async get () { return this.__update__(); }
			async clear () { this.__update__(""); return this; }
			hook (cb) { cb(this.E); return this; }
		}
		// }}}
	};	// {Widgets}

	let UID_COUNT=0;
	Piers=window.Piers={
		Env:Env,
		// Piers.import({"src":"path/abc.js"})
		// Piers.import({"pier":"W_Core"})
		// Piers.import({"css":"path/abc.css"})
		// Piers.import({"xl":"chart"})
		import:__import__,

		DateTime:(d=new Date()) => d instanceof DateTime ? d : new DateTime(d),
		Tuple:(v, s=" ") => v instanceof Tuple ? v : new Tuple(v,s),
		Records:(l=[],k)=>l instanceof Records ? l : new Records(l,k),

		Request:(u,p,t)=>(u||p||t) ? new Request(u,p,t) : Request,
		fetch:async (u,p) => (new Request(u,p)).fetch(),
		// await Piers.Blob(Piers.Request(u)).get();

		Blob: async (v,t) => {	// {{{
			// Piers.Blob(new Piers.Request("api.aspx", {"A":123}))
			// Piers.Blob({"A":123})
			// Piers.Blob("<html><body>Hello World</body></html>","text/html")
			// Piers.Blob(null,"image/*")
			// Piers.Blob([],"image/*") => [... BLOB]
			return v instanceof Request
				? (await v.fetch(false))
				: v instanceof Blob
				? new BLOB(v)
				//: (v===null || v===undefined)
				//? new BLOB((await __upload__(t,false))[0])
				//: Array.isArray(v)
				//? (await __upload__(t,true))
				: "object"===typeof(v)
				? new BLOB(new Blob([JSON.stringify(v)], {"type":t||"application/json;charset=utf8"}))
				: new BLOB(new Blob([v], {"type":t||"text/plain;charset=utf8"}));
		},	// Piers.Blob }}}

		FS: function () {	// {{{
			if (arguments.length<=0) return FileSystem;
			return FileSystem.open.apply(FileSystem, arguments);
		},	//	}}}
		W: function (e, n, opts={}) {	// {{{
			if(!e) return Widgets;
			return "function"===typeof(e._gw) ? e._gw()
				: n ? "string" === typeof(n)
					? new Widgets[n](e, opts)
					: new n(e, opts)
					: undefined;
		},	// }}}
		DB: {},

		// await Piers.timeout(async(), 3000)
		timeout: (ps, ms) => Promise.race([ps,new Promise((or,oe)=>setTimeout(oe,ms))]),
		getUID: () => ((new Date()).getTime()*1000+((UID_COUNT++)%1000)).toString(36),
		setNN: (o, k, v) => (v===undefined?v:(o[k]=v)),

		debug: (obj) => { console.log(obj); return obj; },

		// callback functions
		undefined: () => undefined,
		log: () => console.log(arguments),
		throw: function (msg="Exception!") { throw new Error(msg); },
		true: () => true,
		false: () => false
	};

	if(Env) {
		((css)=>{ // install <style> element for used class
			const es=document.createElement("style");
			es.innerHTML=css;
			Env.PSDOM.parentNode.insertBefore(es,Env.PSDOM);
		})(`
.FILL {overflow:hidden;margin:0;padding:0;border:0;left:0;top:0;right:0;bottom:0;}
.FilterOut {display:none;}
`);

		for (const n of (Env.PSDOM.getAttribute("PierXMods")||"").split(",").filter((i)=>i))
			await __import__({pier:n});

		(Env.PSDOM.getAttribute("PierXCss")||"") // import PiersXCss arguments
		.split(",")
		.filter((i)=>i)
		.forEach((cs) => __import__(Env.ScriptPath+cs, undefined, Env.PSDOM));

		await (new Promise((or, oe)=>{ // setup onload triggers
			if( document.readyState==="complete" ||
				document.readyState==="loaded" ||
				document.readyState==="interactive" )
				or();
			else document.addEventListener("DOMContentLoaded", or);
		}));

		if (Env.PSDOM.hasAttribute("PierEntrance")) { // call entrance async function
			let b=(Env.PSDOM.getAttribute("PierEntrance")||"document.onload").split(".").filter((i)=>i),
				n=b.pop();
			b = __get__(window,b);
			await Promise.resolve(b[n].call(
				b,
				Array.from(Env.PSDOM.attributes).reduce((r,i) => {
					if(i.value)
						r[i.name] = i.value;
					return r;
				}, {})
			));
		}
	}
})();
