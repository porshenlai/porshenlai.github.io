(()=>{
let Widgets;

function __clearValue__(e, t, n, dh) {
	// CLEAR VALUE on element. 
	// e : element to show data
	// t : type of element 
	//     Text|text, Attribute|attribute, Value|value, Style|style, VF
	// n : sub-type of element
	// dh : default handler if not supported
	// {{{
	switch(t){
	case "Text": case "text":
		e.textContent="";
		break;
	case "Attribute": case "attribute":
		e.removeAttribute(n||"value");
		break;
	case "Value": case "value":
		if (!n||n==="value") e.value="";
		else delete e[n];
		break;
	case "Style": case "style":
		delete e.style[n||"display"];
		break;
	case "VF":
		(e.__setValue__||console.log)();
		break;
	default:
		if(dh) dh();
	}
}	__clearValue__ // }}}

function __getValue__ (e, t, n, dh) {
	// GET VALUE from element.
	// e : element to show data
	// t : type of element 
	//     Text, Value, Checked, Attribute, Style, VF
	// n : sub-type of element
	// dh : default handler if not supported
	// {{{
	switch (t) {
	case "Text":
		return e.textContent;
	case "Value":
		return e.matches('input[type="number"]') ? parseFloat(e[n||"value"]) : e[n||"value"];
	case "Checked":
		console.log("CHECKED",e); return e.checked ? 1 : 0;
	case "Attribute":
		return e.getAttribute(n||"NoAttr");
	case "Style":
		return e.style[n||"display"];
	case "VF":
		return (e.__getValue__||console.log)();
	default:
		if (dh)
			return dh(e, t, n);
	}
} 	// }}}

function __setValue__(e, d, t, n, dh) {
	// SET VALUE to element.
	// e : element to show data
	// d : data to shown
	// t : type of element 
	//	   Text|text, Attribute|attribute, Value|value, Checked|checked, Style|style, VF
	// n : sub-type of element
	// dh : default handler if not supported
	// {{{
	switch(t){
	case "Text": case "text":
		e.textContent=d;
		break;
	case "Attribute": case "attribute":
		e.setAttribute(n||"value", d) ;
		break;
	case "Value": case "value":
		e[n||"value"]=d;
		break;
	case "Checked": case "checked":
		e.checked = !!d;
		break;
	case "Style": case "style":
		e.style[n||"display"]=d;
		break;
	case "VF":
		(e.__setValue__||console.log)(d);
		break;
	default:
		if(dh) dh(e, d, t, n);
		break;
	}
}	// __setValue__ }}}

class Template {
	//	the base of all Widget classes
	//	<ELEMENT>._gw() => {WIDGET}
	//		query class object from the bounded DOM element
	//	<ELEMENT>._value => {DOCUMENT}
	//		the value of element will be stored as ELEMENT["value"]
	//	new Template( <ELEMENT>, {OPTIONS} )
	//		.clear() => THIS
	//			clear data value from bounded element
	//		.set( {DOCUMENT} ) => THIS
	//			set data value to bounded element
	//		.get( {DEFAULT} ) => {DOCUMENT}
	//			get data value from bounded element
	// {{{
	constructor (e, o) {
		let self=this;
		console.assert(e, "Widget.constructor(element not available)");
		Object.assign(self.E=e, {
			"_gw":()=>self,
			"_value":"",
			"_opts":o||{}
		});
	}
	async set (d) {
		this.E._value=d ;
		return this;
	}
	get () {
		return this.E._value;
	}
	clear () {
		this.E._value="";
		return this;
	}
} 	// Template }}}

class Form extends Template {
	// Form 
	// new Form( <ELEMENT>, {Options} ) 
	//	.clear() => THIS
	//	.set( {DOCUMENT} ) => THIS
	//	.get( {DEFAULT} ) => {DOCUMENT}
	// {{{
	constructor (e=document.body, o={}) {
		super(e, Object.assign({
			"shadowed": true,
			"tag": "_FORM_"
		}, o));
		if (e.hasAttribute("WidgetTag")) this.E._opts.tag=e.getAttribute("WidgetTag");
		super.set({});
	}
	async set (d={}) {
		let self = this, o=this.E._opts;
		super.set(d);
		Piers.DOM(self.E).dfs(function (r,e) {
			if ((e._opts||{}).shadowed) return true;
			let w = e._gw ? e._gw() : undefined;
			(e.getAttribute(o.tag) || "")
			.split(";").filter((i)=>!!i)
			.forEach(function (a) {
				let dd = Piers.OBJ(d).get((a=a.split(":")).shift(), undefined);
				dd === undefined
				?	__clearValue__(
						e, a[0], a[1],
						() => (w && self!=w) ? w.clear() : undefined
					)
				:	__setValue__(
						e, dd, a[0], a[1],
						function (e, d, t, n) {
							if ((!w) && (t in Widgets))
								w=new Widgets[t] (e, {"tag":o.tag});
							if (w && self!=w) return w.set(d);
						}
					) ;
			});
		}, undefined, {}, true );
		return this;
	}
	get (d) {
		let self = this, o=this.E._opts;
		if(!d)  d = super.get();
		Piers.DOM(self.E).dfs(function (d, e) {
			let w = e._gw ? e._gw() : undefined;
			(e.getAttribute(o.tag) || "")
			.split(";").filter((i) => !!i)
			.forEach(function (a) {
				a = a.split(":");
				let k = a.shift(),
					v = __getValue__(
						e, a[0], a[1],
						(e, t, n) => (w && self!=w) ? w.get() : undefined
					);
				if(v!==undefined) Piers.OBJ(d).put(k,v);
			});
			if (o.shadowed) return true;
		}, undefined, d, true);
		return d;
	}
	clear () {
		let self = this, o=this.E._opts;
		Piers.DOM(self.E).dfs(function (r, e) {
			let w = e._gw ? e._gw() : undefined;

			(e.getAttribute(o.tag) || "")
			.split(";").filter( (i) => !!i )
			.forEach(function (a) {
				a=a.split(":");
				a.shift();
				__clearValue__(
					e, a[0], a[1],
					() => (w && self!=w) ? w.clear() : undefined
				);
			});
		}, undefined, {}, true);
		return this;
	}
}	// Form }}}

class List extends Template {
	// List
	// new List( <ELEMENT>, [WidgetTag]||"_LIST_" )
	//	.clear() => THIS
	//	.set( {DOCUMENT} ) => THIS
	//	.get( {DEFAULT} ) => {DOCUMENT}
	//  .sort (CALLBACK(A,B)) => Sort List
	//  .filter (CALLBACK(D)) => Filter List
	//  .removeItem (ROW.__Idx__) => Remove Item by index number
	//  .insertItem (DATA, LOCATION) => Insert Item to location
	//  .onEvent ("dragStart"||"dragStep"||"dragStop",ELEMENT) => [TODO]
	// {{{
	constructor (e, o={}) {
		super(e, Object.assign({
			"shadowed": true,
			"tag": e.getAttribute("WidgetTag") || "_LIST_"
		},o));
		if (e.hasAttribute("WidgetTag")) this.E._opts.tag=e.getAttribute("WidgetTag");
		this.Temp = [];
		while (e.firstChild) {
			if (1===e.firstChild.nodeType) this.Temp.push(e.firstChild);
			e.removeChild(e.firstChild);
		}
	}
	async set (ds=[]) {
		let e=this.E, o =this.E._opts, t=this.Temp;
		this.clear();
		super.set(ds);
		ds.forEach(function (d, ix) {
			if(!d) return;
			let ea = {
				"__Idx__":ix,
				"RowType":ix%2==0?"Even":"Odd"
			};
			t.forEach(function (temp) {
				let ne = Piers.OBJ(ea).reduce(function(r,v,k){
						r.setAttribute(k,v);
						return r;
					}, temp.cloneNode(true)),
					fm = new Widgets.Form(ne, {"tag":o.tag});
				e.appendChild(fm.E);
				fm.set(d);
			});
		});
		return this;
	}
	get () {
		var self=this, rd=[];
		for (let e=self.E.firstChild; e; e=e.nextSibling) {
			if (1!==e.nodeType) continue;
			if (!e._gw) continue;
			let d = e._gw().get();
			if (e.__Idx__ in rd)
				rd[e.__Idx__]=Object.assign(rd[e.__Idx__],d);
			else
				rd.push(d);
		}
		super.set(rd);
		return super.get();
	}
	clear () {
		while( this.E.firstChild )
			this.E.removeChild(this.E.firstChild);
		return this;
	}
	sort (func) {
		return this.set(this.get().sort(func));
	}
	filter (func, doc) {
		return this.set((doc||this.get()).filter(func));
	}
	removeItem (i) {
		let lst=this.get();
		if (1===i.nodeType) i=Piers.DOM(i).find("[__Idx__]").getAttribute("__Idx__")
		console.assert(i>=0&&i<lst.length, "Widget.List.removeItem (Data Index: Out of Range)");
		lst.splice(parseInt(i), 1);
		return this.set(lst);
	}
	insertItem (d, loc=undefined) {
		let lst=this.get();
		if( undefined !== loc )
			lst.splice(loc, 0, d);
		else
			lst.push(d);
		return this.set(lst);
	}
	onEvent (s, e) {
		switch(s){
		case "dragStart":
			this.FX = e.__Idx__;
			break;
		case "dragStep":
			if (this.FX != undefined && this.FX != e.__Idx__) {
				let sw=this.E.value[this.FX];
				this.E.value[this.FX] = this.E.value[e.__Idx__];
				this.E.value[e.__Idx__] = sw;
				this.FX = e.__Idx__;
				this.set(this.E.value);
			}
			break;
		case "dragStop":
			this.FX = undefined;
			break;
		}
	}
}	// List }}}

class NNOP extends Template {
	// Non Null Only Pages
	// new NNOP( <ELEMENT>, [WidgetTag]||"_NNOP_" )
	//	.clear() => THIS
	//	.set( {DOCUMENT} ) => THIS
	// 	.get( {DEFAULT} ) => {DOCUMENT}
	// {{{
	constructor (e, o={}) {
		super(e, Object.assign({
			"shadowed": true,
		},o));
		if (e.hasAttribute("WidgetTag")) this.E._opts.tag=e.getAttribute("WidgetTag");
		this.Box = Piers.DOM(this.E).reduce((r, v)=>{
			r.push([
				v,
				v.getAttribute("_NNOP_"),
				v.nextSibling,
				v.parentNode
			]);
			return r;
		}, "[_NNOP_]", []);
	}
	async set (d) {
		this.Box.forEach((v) => {
			if(v[1] in d) {
				new Form(v[0],{"tag":this.E._opts.tag}).set(d[v[1]]);
				if (v[0].parentNode) return;
				v[3].insertBefore(v[0], v[2]);
			} else if(v[0].parentNode)
				v[0].parentNode.removeChild(v[0]);
		});
		return this;
	}
}	// }}}

class MPage extends Template {
	// new MPage ( <ELEMENT> )
	//		.set( "HTML-URI" or <ELEMENT>, "JS-URI" or function, {ARGUMENT} ) => THIS
	//		.get( ) => ["HTML-URI", "JS-URI", {ARGUMENTS}]
	//		.clear( ) => THIS
	// {{{
	constructor (e=document.body, o={}) {
		super(e, o=Piers.OBJ({
			"shadowed": true,
			"trAttr":["left","100%","0%"],
			//"trAttr":["top","100%","0%"],
			//"trAttr":["opacity","0","1"],
			"trDur":"300ms",
			"trMethod":"ease",
			"style":{
				"position": "absolute",
				"left": 0,
				"top": 0,
				"width": "100%",
				"height": "100%"
			}
		}).join(o));
		o.style.transition=o.trAttr[0]+" "+o.trDur+" "+o.trMethod;
		while(e.firstChild) e.removeChild(e.firstChild);
		o.style[this.E._opts.trAttr[0]]=this.E._opts.trAttr[1];
		for(let i=0; i<2; i++) Piers.DOM({"T":"div", "S":o.style}).join(e);
	}

	async set (layout, script, args) {
		super.set([layout, script, args]);
		let ne=this.E.firstChild, o=this.E._opts;
		while (ne.firstChild) ne.removeChild(ne.firstChild);
		ne.style[o.trAttr[0]]=o.trAttr[1];
		this.E.appendChild(this.E.firstChild);
		await Piers.DOM(ne).resolve(layout, script, args);
		await new Promise((or,oe)=>setTimeout(()=>or(),1));
		ne.style[o.trAttr[0]]=o.trAttr[2];
	}

	get () {
		return super.get();
	}
}	// }}}

class DateTime extends Template {
	//	new DateTime(
	//		<div>
	//			<input type="date"/>
	//			<input type="time"/>
	//		</div>
	//	)
	//		.clear( ) => THIS
	//		.set( {DATE} ) => THIS
	//		.get( {DEFAULT} ) => {DATE}
	// {{{
	constructor (e, o={}) {
		super(e, Object.assign({
			"shadowed":true
		},o));
		this.DE=Piers.OBJ({"D":'input[type="date"]', "T":'input[type="time"]'})
		.reduce((r, v, k) => {
			v=e.querySelector(v);
			if (v) r[k]=v;
			return r;
		}, {"S":e.matches('[_SFMT_]') ? e : e.querySelector('[_SFMT_]')});
		this.TZ=((ts)=>(
			ts>9 ? ("+"+ts+":00")
			: ts>=0 ? ("+0"+ts+":00")
			: ts>-10 ? ("-0"+(-ts)+":00")
			: (ts+":00")
		))((new Date).getTimezoneOffset()/(-60));
		if (!this.E._on_change_) {
			this.E._on_change_ = (self) => {
				self.set(((d,t) => new Date(
					parseInt(d[0]),
					parseInt("1"+d[1])-101,
					parseInt("1"+d[2])-100,
					parseInt("1"+t[0])-100,
					parseInt("1"+t[1])-100
				))(
					((self.DE.D&&self.DE.D.value) || self.__gDs__()).split("-"),
					((self.DE.T&&self.DE.T.value) || self.__gTs__()).split(":")
				));
			};
			this.E.addEventListener("change", (evt) => this.E._on_change_(this));
		}
		this.clear();
		this.E._on_change_(this);
	}
	__gDs__(d) {
		if(!d) d=new Date();
		return 	d.getFullYear() + "-" +
				[d.getMonth()+1,d.getDate()]
				.map((v)=>(v+100).toString()
				.substr(1)).join("-");
	}
	__gTs__ (d) {
		if(!d) d=new Date();
		return 	[d.getHours(),d.getMinutes()]
				.map((v)=>(v+100).toString().substr(1))
				.join(":");
	}
	clear () {
		if(this.DE.D) delete this.DE.D.value;
		if(this.DE.T) delete this.DE.T.value;
	}
	async set (dt) {
		let fz=(v)=>(v<10?"0":"")+v,
			ds=dt.getFullYear()+"-"+fz(dt.getMonth()+1)+"-"+fz(dt.getDate()),
			ts=fz(dt.getHours())+":"+fz(dt.getMinutes()),
			tss=ts+":"+fz(dt.getSeconds());
		if(this.DE.D) this.DE.D.value=ds;
		if(this.DE.T) this.DE.T.value=ts;
		if(this.DE.S)
			this.DE.S.textContent = ((fmt)=>{
				return fmt.replaceAll('{YMD}',ds)
				          .replaceAll('{HMS}',tss)
				          .replaceAll('{HM}',ts);
			})(this.DE.S.getAttribute("_SFMT_"));
		return super.set(dt);
	}
	get () {
		return super.get();
	}
}	// DateTime }}}

class Checks extends Template {
	//	new Checks(
	// 		<div>
	//			<input type="radio" value="V1"/>
	//			<input type="checkbox" value="V2"/>
	//			...
	//		</div>
	//	)
	//		.clear( ) => THIS
	//		.set( ["V1","V2",...] ) => THIS
	//		.get( ) => ["V1","V2",...]
	// {{{
	constructor (e) {
		super(e);
	}
	async set (d) {
		d = Array.isArray(d) ? d : [d];
		let r = [... this.E.querySelectorAll('input[type="radio"]')].concat(
				[... this.E.querySelectorAll('input[type="checkbox"]')]).forEach((e)=>{
			e.checked=d.indexOf(e.getAttribute("value"))>=0;
		});
		super.set(d);
		return this;
	}
	get() {
		let r = [... this.E.querySelectorAll('input[type="radio"]')].concat(
				[... this.E.querySelectorAll('input[type="checkbox"]')]).reduce((r,v)=>{
			if (v.checked) r.push(v.getAttribute("value"));
			return r;
		},[]);
		super.set(r);
		return super.get();
	}
}	// }}}

class ComboSelect extends Template {
	// new ComboSelect( <ELEMENT> )
	//	.clear() => THIS
	//	.config({"CAT1":["ITEM1","ITEM2"],"CAT2":["ITEM3","ITEM4"]}) => THIS
	//	.set( ["CAT1","ITEM2"] ) => THIS
	//	.get() => ["CAT1","ITEM2"]
	// {{{
	constructor (e, o={}) {
		super(e, Object.assign({
			"shadowed": true
		},o));
		super.set([]);
		e.addEventListener("change", (evt)=>this.on_change());
	}
	on_change () {
		let i, s=[];
		super.set(
			[... this.E.querySelectorAll("select")]
			.reduce((r,e)=>{
				s.push(e);
				r.push(e.value);
				return r;
			},[])
		);
		this.__sync__(
			0, s,
			this.Options || [],
			super.get()
		);
		event.preventDefault();
	}
	config (options) {
		this.__sync__(
			0,
			[... this.E.querySelectorAll("select")],
			this.Options = options,
			super.get()
		);
		this.clear();
		return this;
	}
	async set (v) {
		this.__sync__(
			0, [... this.E.querySelectorAll("select")], this.Options, v
		);
		return super.set(
			[... this.E.querySelectorAll("select")].reduce((r,e) => (r.push(e.value)&&r), [])
		);
	}
	clear () {
		this.set([]);
	}
	__sync__ (i,s,d,v) {
		if (!s[i]) return;

		let db={}, p = (new Piers.DOM(s[i])).clear();
		if(d)
			(Array.isArray(d) ? d : Object.keys(d))
			.reduce(function (p, v) {
				let x=v.split('\r');
				if(x.length<2) x.push(x[0]);
				db[x[0]]=v;
				Piers.DOM({
					"T": "option",
					"A": {"value": x[0]},
					"C": [x[1]]
				}).join(p.E);
				return p;
			}, p);

		if (v[i])
			s[i].value=v[i];
		v[i]=s[i].value;
		this.__sync__(
			i+1,
			s,
			d ? d[db[s[i].value]] : undefined,
			v
		);
	}
}	// }}}

class Dialog extends Template {	// {{{
	// await (new Dialog(ELEMENT)).set(DPAGE_URL);
	constructor (E=document.body, options={}) {
		super(E);

		let self=this;
		self.Opts=Object.assign({
			"nox":false,
			"sty":{}
		},options);
		self.Emask=Piers.DOM({
			"T":"div",
			"S":{
				"position":"fixed",
				"margin":"0",
				"border":"0",
				"padding":"0",
				"left":"0",
				"top":"0",
				"width":"100%",
				"height":"100%",
				"backgroundColor":"rgba(0,0,0,0.5)"
			},
			"C":((r)=>{
				if (!self.Opts.nox)
					r.push({
						"T":"button", "C":["X"],
						"S":{
							"position":"fixed",
							"right":"1%",
							"top":"1%",
							"backgroundColor":"red",
							"color":"gold",
							"cursor":"pointer"
						},
						"E":{
							"click":(event)=>self.cancel()
						}
					});
				return r;
			})([{
				"T":"Content",
				"S":Object.assign({
					"position":"absolute",
					"margin":"0",
					"border":"1px solid silver",
					"left":"10%",
					"top":"10%",
					"width":"80%",
					"height":"80%",
					"background":"white",
					"color":"black"
				},self.Opts.sty)
			}])
		});
	}
	async set (v) {
		let self=this, rv,
			dpe=self.Emask.E.firstChild;
		if (!dpe._gw) new MPage(dpe);
		self.Emask.join(self.E);
		super.set(v);
		rv=await Promise.race([
			new Promise((or)=>(self.cancel=or)),
			dpe._gw().set(v)
		]);
		dpe._gw().clear();
		self.Emask.quit();
		return rv;
	}
}	// }}}

class PieChart extends Template {
	// (new PieChart(element)).set([4,5,6]);
	// {{{
	constructor (e, o={}) {
		super(e, Object.assign({
			"shadowed":true,
			"width":"200px",
			"pallete":["red","green","blue","purple","orange"]
		},o));
		this.E.style.width=this.E.style.height=this.E._opts.width;
		this.E.style.borderRadius="50%";
	}
	async set (v) {
		let i,t,c,n,s=[], plt=this.E._opts.pallete;
		t=0; for(i in v) t += v[i]; // total
		if (Array.isArray(v))
			v=v.reduce((r,v,i)=>{
				r[i+":"+plt[i%plt.length]]=v;
				return r;
			},{});
		c=0; for(i in v){ // ratio
			n = c+v[i];
			s.push(i.replace(/.*:/,'')+" "+Math.floor(c*360/t)+"deg "+Math.floor(n*360/t)+"deg");
			c = n;
		}
		this.E.style.backgroundImage="conic-gradient("+s+")";
		super.set(v);
	}
}	// }}}

document.currentScript.value=Widgets={
	"Template": Template,
	"Form": Form,
	"List": List,
	"NNOP": NNOP,
	"Checks": Checks,
	"ComboSelect": ComboSelect,

	"DateTime": DateTime,
	"Dialog" : Dialog,
	"MPage" : MPage,
	"Dialog": Dialog,
	"PieChart": PieChart
};
})();
