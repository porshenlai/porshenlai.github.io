(() => {

class DOM
{	// Data Object Model
	constructor (e) {
		// new (
		//     <ELEMENT> ||
		//     {
		//         "T":"",
		//         "A":{"border":"1",...},
		//         "S":{"width":"30%",...},
		//         "V":{"value":100,...},
		//         "E":{"click":cb,...},
		//         "C":["Text",{...}]
		//     }
		// ) => DOM
		console.assert(e, "DOM(null)");
		this.E=e.nodeType===1 ? e : (function(pf){
			var self=this;
			let e,i;
			if( "string" === typeof(pf) )
				return document.createTextNode(pf);
			console.assert("T" in pf, "DOM(",pf,")");

			if( "T" in pf ) e = document.createElement(pf.T);
			if( "A" in pf ) for( i in pf.A ) e.setAttribute(i,pf.A[i]);
			if( "S" in pf ) for( i in pf.S ) e.style.setProperty(i,pf.S[i]);
			if( "V" in pf ) for( i in pf.V ) e[i] = pf.V[i];
			if( "E" in pf ) for( i in pf.E ) e.addEventListener(i,pf.E[i]);
			if( "C" in pf ){
				console.assert(Array.isArray(pf.C),"profile.C is not an array");
				pf.C.forEach((i)=>e.appendChild((new DOM(i)).E));
			}
			return e;
		})(e);
	}
	async load (src, type="text/html", be=undefined) {
		// await loadDOM("http://....");
		// await loadDOM("<!DocType:html><html><body>Not found</body></html>","text/html");
		if ('string' === typeof(src)){
			let dom = src.startsWith("<")
				? (new DOMParser()).parseFromString(src, type)
				: await Piers.fetch(src);
			console.assert(dom, "DOM.load: Parameter Error");
			dom = dom.querySelector("body");
			if (dom)
				[... dom.childNodes]
					.filter((e) => e.nodeType===1)
					.forEach((e) => this.add(e, be));
			else this.add(dom);
		}else this.add(src);
	}
	select (qs, dft=undefined) {
		// select( "CSS_SELECTOR_STRING" ) => <ELEMENT>
		dft=this.E.querySelector(qs)||dft;
		if (dft instanceof Error) throw(dft);
		return dft;
	}
	find (qs, dft=undefined) {
		// find(
		//    CSS_SELECTOR_STRING ||    // CSS selector query string to match elements
		//    (<ELEMENT>) => true|false // callback to match elements
		// ) => <ELEMENT>
		let r='string' === typeof(qs) ? (i) => (i.matches ? i.matches(qs) : false) : qs;
		for (let e=this.E; e; e=e.parentNode)
			if (e.nodeType==1 && r(e)) return e;
			if (dft instanceof Error) throw(dft);
		return dft;
	}
	forEach (cb, qs) {
		// forEach(
		//     (<ELEMENT>),         // callback function for all matched element
		//     CSS_SELECTOR_STRING, // CSS selector compatible query string
		// ) => this
		if (qs)
			[... this.E.querySelectorAll(qs)].forEach(cb);
		else
			for (let e=this.E.firstChild; e; e=e.nextSibling) cb(e);
		return this;
	}
	reduce (cb, qs, r={}) {
		try {
			if (qs)
				r=[... this.E.querySelectorAll(qs)].reduce(cb,r);
			else
				for (let e=this.E.firstChild; e; e=e.nextSibling)
					if(e.nodeType===1){
						let rr=cb(r, e);
						r=rr===undefined ? r : rr;
					}
		} catch (x) {
			console.log("Error",x);
		}
		return r;
	}
	dfs (cb, qs, r={}, xself=false) {
		// dfs(
		//     ({OBJECT-R}, <ELEMENT>) => false|true, // callback function for each matched element in dfs traverse and {OBJECT-R},
		//                                            // return true to stop go deep
		//     CSS_SELECTOR_STRING,                   // CSS selector compatible query string to filter elements
		//     {OBJECT-R},                            // object passed to callback function
		//     false|true                             // true if root element called
		// ) => {OBJECT-R}
		if(xself) cb(r, this.E);
		for (let e=this.E.firstChild; e; e=e.nextSibling) {
			if (e.nodeType!==1) continue;
			if (qs && !e.matches(qs)) continue;
			if (!cb(r, e)) Piers.DOM(e).dfs(cb, qs, r);
		}
		return r;
	}
	get () {
		// get() => value
		return "value" in this.E ? this.E.value : this.E.textContent;
	}
	set (val) {
		// set(value) => this
		if ("value" in this.E)
			this.E.value = val;
		else
			this.E.textContent = val || "";
		return this;
	}
	read (an) {
		// get values from DOM
		// read("ATTRIBUTE_NAME") => {DATA}
		// EXAMPLE: ==================================
		// <body>
		//   <input VN="A" value="100"/>
		//   <span VN="B">200</span>
		// </body>
		// (new (document.body)).get("VN") => {"A":"100","B":"200"}
		return this.reduce(function (r, v) {
			r[v.getAttribute(an)]=Piers.DOM(v).get();
			return r;
		}, "["+an+"]", {});
	}
	write (d, an) {
		// set values to DOM
		// write({DATA}, "ATTRIBUTE_NAME") => this
		// EXAMPLE: ==================================
		// (new (document.body)).set({"A":"100","B":"200"}, "VN") => this
		// => <body>
		//   <input VN="A" value="100"/>
		//   <span VN="B">200</span>
		// </body>
		this.forEach(function (v) {
			Piers.DOM(v).set(d[v.getAttribute(an)]);
		}, "["+an+"]");
		return this;
	}
	clear () {
		// remove all child elements
		// clear() => this
		while (this.E.firstChild)
			this.E.removeChild(this.E.firstChild);
		return this;
	}
	join (e, be=undefined) {
		// join as e's children
		// join(<ELEMENT>) => this
		e.insertBefore(this.E, be);
		return this;
	}
	add (plan, be=undefined) {
		this.E.insertBefore(
			plan.nodeType===1 ? plan : (new DOM(plan)).E,
			be
		);
		return this;
	}
	quit () {
		if (this.E.parentNode)
			this.E.parentNode.removeChild(this.E)
	}
	sort (cf, qs=":scope>tr") {
		let es = [... this.E.querySelectorAll(qs)];
		es.sort(cf).forEach((r)=>r.parentNode.appendChild(r));
	}
	filter (cf, qs=":scope>tr") {
		let es = [... this.E.querySelectorAll(qs)];
		es.forEach((r)=>r.classList[cf(r)?"remove":"add"]("FilterOut"));
	}
	isContained (p) {
		try {
			return !!this.find((v)=>v===p);
		} catch (x) { return false; }
	}
	isSibling (s) {
		return this.E.parentNode === s.parentNode; 
	}
	listen (ET, H, AN="func") {
		// .listen("click", {"func":()=>1}, "func")
		const VN="_"+ET+"_PiersHandler_";
		let lock=false;
		if (this.E[VN]) this.E.removeEventListener(ET, this.E[VN]);
		this.E[VN] = "function"===typeof(H) ? H : async (evt) => {
			let e,h;
			try {
				if (lock) return console.log("Event Locked!");
				lock=true;
				if (e=Piers.DOM(evt.target).find((e)=>e.hasAttribute(AN))) {
					if (h=H[e.getAttribute(AN)])
						await h.call(H,e,evt);
				}
			} finally {
				lock=false;
			}
		};
		this.E.addEventListener(ET,this.E[VN]);
		return this;
	}
	sendEvent (name, args, evtopt={bubbles: true}) {
		this.E.dispatchEvent(args ? new CustomEvent(name, args, evtopt) : new Event(name, evtopt));
		return this;
	}
	async resolve (htm, js, jsa={}) {
		await this.clear().load(htm);
		if (js)
			return await Promise.resolve(
				(await Piers.import(js))(this.E, jsa)
			);
	}
	async setAttribute (name, value) {
		this.E.setAttribute(
			name,
			'function' === typeof(value)
			? await value(this.E.getAttribute(name))
			: value
		);
	}
	async playDialog (content, handle) {
		//	let result = await playDialog("dialog.html", async function(H){
		//		return await new Promise((onready)=>{
		//			H.listen("click",(evt)=>{
		//				if (evt.target.hasAttribute("rvalue")) {
		//					onready(evt.target.getAttribute("rvalue"));
		//					H.close();
		//				}
		//			});
		//		});
		//	});
		//	console.log("Dialog return ",result);
		let wnd = Piers.DOM({
			"C":[{
				"S":{
					"padding":"16px", "border":"solid 4px silver", "border-radius":"16px",
					"background":"white", "color":"black"
				}, "T":"div"
			}], "S":{
				"position":"absolute", "overflow":"auto",
				"display":"flex", "justify-content":"center", "align-items":"center",
				"left":"0", "top":"0", "width":"100%", "height":"100%",
				"background":"rgba(0,0,0,0.5)",
				"opacity":"0", "transition":"opacity 500ms ease"
			}, "T":"div"
		}), cw = wnd.E.firstChild;
		Piers.DOM(cw).load(content);
		wnd.join(this.E);
		setTimeout(()=>wnd.E.style.setProperty("opacity","1"),1);
		return 'function' === typeof(handle) ? await handle({
			"getclient": () => cw,
			"querySelector": (s) => cw.querySelector(s),
			"listen": (name, handler, an="func") => Piers.DOM(cw).listen(name, handler, an),
			"close": () => wnd.E.parentNode.removeChild(wnd.E)
		}) : cw;
	}
}	// DOM }}}

document.currentScript.value=function (e) {
	return new DOM(e);
};

})();
