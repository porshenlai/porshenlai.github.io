(()=>{

/* MANUAL

# Policies:
{ "A":null, "B":... } => { "B":... }
ActionType with Captialized Leading: clear, set, and get supported. :else: only clear and set supported.

_W_Shadowed_ : if set, filling actions won't recursive into child elements

# 取得所有登錄的 Widget Driver
{"Tempalte":...} = Piers.Widget();

# 取得已綁定至 Element 的 Widget 或套用 Driver 至該 Element 並回傳 Widget
{Widget} = Piers.Widget(<ELEMENT>, "Driver", {Options});

MANUAL */

let Driver=Piers.W();
let ValueMap={};
Piers.W.setValueMap=(n,vs) => {
	if (n) ValueMap[n]=vs;
	return ValueMap;
};

Driver.form=class extends Driver.Template
{	// 唯讀表單 {{{
	constructor (e, o={})
	{
		super(e, Object.assign({
			"tag": "_FORM_"
		}, o));
		if (e.hasAttribute("WidgetTag")) this.E._opts.tag=e.getAttribute("WidgetTag");
		super.set({});
	}
	async __setValue__ (e, doc)
	{	// set data value to element by types
		// SET VALUE to element.
		// e : element to show data
		// d : data to shown
		// t : type of element 
		//	   Text|text, Attribute|attribute, Value|value, Checked|checked, Style|style, VF
		// n : sub-type of element
		// async dh : default handler if not supported
		let o=this.E._opts, a=e.getAttribute(o.tag);
		if(!a) return;
		a.split(";")
		.filter((i)=>!!i)
		.forEach(async (a)=>{
			a=a.split(":");
			let d=Piers.OBJ(doc).get(a.shift(), undefined),
				n=(a[1]||"").split("@");
			switch (a[0]) {
			case "Text": case "text":
				e.textContent=
					d!==undefined
					? (n[1]&&ValueMap[n[1]]) ? ValueMap[n[1]][d] : d
					: "";
				break;
			case "Value": case "value":
				if (d!==undefined)
					e[n[0]||"value"]=(n[1]&&ValueMap[n[1]]) ? ValueMap[n[1]][d] : d;
				else
					(n[0]||"value")==="value" ? (e.value="") : (delete e[n[0]]);
				break;
			case "Attribute": case "attribute":
				d!==undefined
				? e.setAttribute(n[0]||"value", (n[1]&&ValueMap[n[1]]) ? ValueMap[n[1]][d] : d)
				: e.removeAttribute(n[0]||"value");
				break;
			case "Checked": case "checked":
				e.checked=d!==undefined ? !!d : false ;
				break;
			case "Style": case "style":
				d!==undefined
				? (e.style[n[0]||"display"]=d)
				: (delete e.style[n[0]||"display"]);
				break;
			case "Switch": case "switch":
				d=d!==undefined ? (""+d).split(",") : [];
				[... e.querySelectorAll("["+(n[0]||"Case")+"]")].forEach(
					(ee) => ee.classList[
						d.indexOf(ee.getAttribute(n||"Case"))<0 ? "add" : "remove"
					]("FilterOut")
				);
				break;
			case "NoNULL":
				if (d===undefined) {
					e._W_Shadowed_=true;
					e.classList.add("FilterOut");
				}else
					e.classList.remove("FilterOut");
				break;
			default:
				if (a[0] in Driver)
					await (async (w)=>{
						if(w!=this) await d!==undefined ? w.set(d, a[1]) : w.clear();
					})(Piers.W(e, a[0], {"tag":o.tag}));
				break;
			}
		});
	}	// __setValue__
	async set (d={}) {
		let o=this.E._opts, f;
		await super.set(d);
		await (f=async (e) => {
			if (e.nodeType!==1) return;
			await this.__setValue__(e,d);
			if (!e._W_Shadowed_)
				for (let ee=e.firstChild; ee; ee=ee.nextSibling)
					await f(ee);
		})(this.E);
		return this;
	}	// set
	async clear () {
		return await this.set();
	}	// clear
};	// Form }}}

Driver.Form=class extends Driver.form
{	// 表單 {{{
	async __getValue__ (e, doc)
	{
		let o=this.E._opts, a=e.getAttribute(o.tag);
		if(!a) return;
		a.split(";")
		.filter((i)=>!!i)
		.forEach(async (a)=>{
			a=a.split(":");
			let p=a.shift(),
				n=(a[1]||"").split("@"), v;
			switch (a[0]) {
			case "Text":
				v=n[1] ? ((v) => {
					for (let k in ValueMap[n[1]])
						if (v===ValueMap[n][k]) return k;
				})(e.textContent) : e.textContent;
				break;
			case "Value":
				v=e.matches('input[type="number"]') ? parseFloat(e[n||"value"]) : e[n[0]||"value"];
				break;
			case "Checked":
				v=e.checked ? 1 : 0;
				break;
			case "Attribute":
				v=e.getAttribute(n[0]||"NoAttr");
				break;
			case "Style":
				v=e.style[n||"display"];
				break;
			case "Switch":
				v=[... e.querySelectorAll("["+(n||"Case")+"]")].reduce((rv,ee)=>{
					if (!ee.classList.contains("FilterOut"))
						rv.push(ee.getAttribute(n||"Case"));
					return rv;
				},[]).join(",");
				break;
			default:
				if (a[0] in Driver)
					await (async (w)=>{
						if(w!=this) v=await w.get();
					})(Piers.W(e, a[0], {"tag":o.tag}));
				break;
			}
			if (v!==undefined) Piers.OBJ(doc).put(p, v);
		});
	} 	// __getValue__
	async get ()
	{
		let o=this.E._opts, d=(await super.get())||{}, f;
		await (f=async (e) => {
			if (e.nodeType!==1) return;
			await this.__getValue__(e,d);
			if (!e._W_Shadowed_)
				for (let ee=e.firstChild; ee; ee=ee.nextSibling)
					await f(ee);
		})(this.E);
		return d;
	}	// get
};	// }}}

Driver.list=class extends Driver.Template
{	// 唯讀列表 {{{
	//
	// new List( <ELEMENT>, [WidgetTag]||"_LIST_" )
	//	.clear() => THIS
	//	.set( {DOCUMENT} ) => THIS
	//	.get( {DEFAULT} ) => {DOCUMENT}
	constructor (e, o={})
	{
		super(e, Object.assign({
			"tag": e.getAttribute("WidgetTag") || "_LIST_"
		},o));
		e._W_Shadowed_=true;
		if (e.hasAttribute("WidgetTag")) this.E._opts.tag=e.getAttribute("WidgetTag");
		this.Temp=[];
		while (e.firstChild) {
			if (1===e.firstChild.nodeType) this.Temp.push(e.firstChild);
			e.removeChild(e.firstChild);
		}
		this.MemberType=Driver.form;
	}
	async set (ds=[])
	{
		const db=Piers.Records(ds);
		await this.clear();
		super.__update__(db);
		for (const row of db.list()){
			console.log("DEBUG",db.Key,row[db.Key]);
			await this.__draw__(row[db.Key],row)
		}
		return this;
	}
	async clear ()
	{
		Piers.DOM(this.E).clear();
		return this;
	}
	async __draw__ (k, d, loc) {
		await Promise.all(this.Temp.map(async (temp) => {
			let ne=temp.cloneNode(true),
				fm=Piers.W(ne, this.MemberType, {"tag": this.E._opts.tag});
			ne.setAttribute("__K__",k);
			this.E[loc ? "insertBefore":"appendChild"](ne, loc);
			await fm.set(d);
		}));
		return this;
	}
	async insert (d) {
		let db=super.__update__(),
			k=db[db.Key],
			e=this.E.querySelector('['+db.Key+'="'+k+'"]');
		db.set(k, d);
		await this.__draw__ (k, d, e);
		if (e) e.parentNode.removeChild(e);
		return this;
	}
	remove (e) {
		let db=super.__update__();
		if (!(e instanceof Element))
			e=this.E.querySelector('[__K__="'+e[db.Key]+'"]');
		if (e=Piers.DOM(e).find('[__K__]')) {
			let k=e.getAttribute("__K__");
			delete db[k];
			e.parentNode.removeChild(e);
		}
		return this;
	}
};	// list }}}

Driver.List=class extends Driver.list
{	// 列表 {{{
	constructor (e, o={}) {
		super(e, o);
		this.MemberType=Driver.Form;
	}
	async get () {
		let rs=super.__update__();
		await Promise.all(
			[... this.E.querySelectorAll('[__K__]')]
			.map(async (e) => rs.set(e.getAttribute("__K__"), await (Piers.W(e).get())))
		);
		return rs;
	}
}	// Driver.List }}}

Driver.dt=class extends Driver.Template
{	// 唯讀日期時間 {{{
	constructor (e, o={}) {
		super(e, Object.assign({}, o));
		e._W_Shadowed_=false;
		this.ICs={
			"D": e.querySelector('input[type="date"]'),
			"T": e.querySelector('input[type="time"]')
		};
		this.set(Piers.DateTime(null));
	}
	async set (d=new Date()) {
		if ("string"===typeof(d))
			((a)=>{ if (a) d=parseInt(a[0]); })(/^[0-9]+$/.exec(d));
		d=Piers.DateTime(d);
		await super.set(d);
		let va=(d.S||" ").split(" ");
		if (this.ICs.D) this.ICs.D.value=va[0];
		if (this.ICs.T) this.ICs.T.value=va[1];
		if (!(this.ICs.D||this.ICs.T)) {
			va=d.toFormat(this.E.getAttribute("fmt"));
			switch (this.E.tagName) {
			case "INPUT": case "SELECT": this.E.value=va; break;
			default: this.E.textContent=va; break; }
		}
	}
	async clear () {
		if (this.ICs.D) this.ICs.D.value="";
		if (this.ICs.T) this.ICs.T.value="";
		if (!(this.ICs.D||this.ICs.T))
			switch (this.E.tagName) {
			case "INPUT": case "SELECT": this.E.value=""; break;
			default: this.E.textContent=""; break; }
	}
}	// Driver.dt }}}

Driver.DT=class extends Driver.dt
{	// 日期時間 {{{
	async get () {
		if (this.ICs.D) {
			let va=this.ICs.D.value;
			if (va)
				va=(this.ICs.T && this.ICs.T.value) ? (va+" "+this.ICs.T.value) : va;
			else {
				va=null;
				if(this.ICs.T) this.ICs.T.value="";
			}
			await super.set(Piers.DateTime(va));
		}
		return await super.get();
	}
};	// Driver.DT }}}

Driver.checks=class extends Driver.Template
{	// checks {{{
	//	new ComboCheck(
	// 		<div>
	//			<input type="radio" value="V1"/>
	//			<input type="checkbox" value="V2"/>
	//			...
	//		</div>
	//	)
	//		.clear( ) => THIS
	//		.set( ["V1","V2",...] ) => THIS
	//		.get( ) => ["V1","V2",...]
	async set (d) {
		d=Array.isArray(d) ? d : [d];
		let r=[... this.E.querySelectorAll('input[type="radio"]')]
			.concat([... this.E.querySelectorAll('input[type="checkbox"]')])
			.forEach((e)=>(e.checked=d.indexOf(e.getAttribute("value"))>=0));
		await super.set(d);
		return this;
	}
};	// }}}

Driver.Checks=class extends Driver.checks
{	// {{{
	async get() {
		let r=[... this.E.querySelectorAll('input[type="checkbox"]')],
			s=r.length>0;
		r=r.concat([... this.E.querySelectorAll('input[type="radio"]')])
		.reduce((r,e) => (e.checked ? (r.push(e.getAttribute("value"))&&r) : r), []);
		await super.set(r);
		return s ? r : r[0];
	}
};	// Checks }}}

Driver.selects=class extends Driver.Template
{	// selects {{{
	constructor (e, o={}) {
		super(e, o);
		e._W_Shadowed_=true;
		this.Ss=[... e.querySelectorAll("select")];
		this.E.addEventListener("change", (evt) => {
			let rv=Piers.Tuple();
			for (let i=0;i<=this.Ss.indexOf(evt.target);i++)
				rv.push(this.Ss[i].value);
			if (rv.length>0)
				this.set(rv);
		});
	};
	async set (d, db) {
		await this.clear();
		let rv=Piers.Tuple();
		d=Piers.Tuple(d);
		if ("string"===typeof(db)) db=ValueMap[db];
		if (db) this.DB=Piers.OBJ(db);
		for (let i=0; i<=d.length; i++) {
			let e=this.Ss[i], cfg=this.DB.get(rv, undefined);
			if (e&&cfg) {
				e.classList.remove("FilterOut");
				(Array.isArray(cfg) ? cfg : Object.keys(cfg))
				.forEach((v) => Piers.DOM({"T":"option","A":{"value":v},"C":[v]}).join(e));
				if(d[i]) e.value=d[i];
				else d.push(e.value);
				rv.push(e.value);
			}
		}
		this.__update__(rv);
	};
	async clear () {
		this.Ss.forEach((e)=>{
			e.classList.add("FilterOut");
			Piers.DOM(e).clear();
		});
	};
};	// }}}

Driver.Selects=class extends Driver.selects
{	// {{{
	async get () {
		return this.__update__();
	}
}	// }}}

Driver.MPage=class extends Driver.Template
{	// 多重頁面 {{{
	// new MPage ( <ELEMENT> )
	//		.set( "HTML-URI" or <ELEMENT>, "JS-URI" or function, {ARGUMENT} ) => THIS
	//		.get( ) => ["HTML-URI", "JS-URI", {ARGUMENTS}]
	//		.clear( ) => THIS
	constructor (e=document.body, o={}) {
		super(e, o=Piers.OBJ({
			"trAttr":["left","-100%","0%"],
			//"trAttr":["top","-100%","0%"],
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
		e._W_Shadowed_=true;
		o.style.transition=o.trAttr[0]+" "+o.trDur+" "+o.trMethod;
		while(e.firstChild) e.removeChild(e.firstChild);
		o.style[this.E._opts.trAttr[0]]=this.E._opts.trAttr[1];
		for(let i=0; i<2; i++) Piers.DOM({"T":"div", "S":o.style}).join(e);
	}

	async set (d) {
		// { DOM:"page.htm", JS:"page.js" }
		super.set(d);
		let ne=this.E.firstChild, o=this.E._opts;
		while (ne.firstChild) ne.removeChild(ne.firstChild);
		ne.style[o.trAttr[0]]=o.trAttr[1];
		this.E.appendChild(this.E.firstChild);
		await Piers.DOM(ne).resolve(d.DOM, d.JS, d);
		await new Promise((or,oe)=>setTimeout(()=>or(),1));
		ne.style[o.trAttr[0]]=o.trAttr[2];
	}
};	// }}}

Driver.pie=class extends Driver.Template
{ 	// 圓餅圖 {{{
	// (new PieChart(element)).set([4,5,6]);
	constructor (e, o={}) {
		super(e, Object.assign({
			"width":"200px",
			"pallete":["red","green","blue","purple","orange"]
		},o));
		this.E._W_Shadowed_=true;
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
			n=c+v[i];
			s.push(i.replace(/.*:/,'')+" "+Math.floor(c*360/t)+"deg "+Math.floor(n*360/t)+"deg");
			c=n;
		}
		this.E.style.backgroundImage="conic-gradient("+s+")";
		super.set(v);
	}
};	// }}}

Driver.kbars=class extends Driver.Template
{	// K 線圖 {{{
	constructor (e, o={}) {
		super(e,o);
		Piers.Style
		.add('[KBAR], [KBAR]>div', {position:"absolute"})
		.add('[KBAR]>div:first-child', {left:"46%",width:"8%",top:"0",height:"100%"})
		.add('[KBAR]>div:last-child', {left:"5%",width:"90%"})
//		.add('[KBAR]>div>div', { position:"absolute", left:"10%",top:"10%",width:"80%",height:"80%", background:"white"})
		.add('[KBAR="down"]>div', {"background-color":"black"})
		.add('[KBAR="up"]>div', {"background-color":"red"})
		.add('[KBAR="flat"]>div', {"background-color":"orange"});
	}
	async set (d)
	{
		let es=this.E.querySelectorAll("[KBAR]"),
			max=d.reduce((r,d)=>d.H>r ? d.H : r, d[0].H)+0.05,
			min=d.reduce((r,d)=>d.L<r ? d.L : r, d[0].L)-0.05;
		if (es.length!==d.length) {
			[... es].forEach((e) => this.E.removeChild(e));
			let bw=parseInt(10000/d.length);
			for (let k=0; k<d.length; k++) {
				Piers.DOM({
					T:"div", A:{"KBAR":"-"},
					S:{"width":(bw/100)+"%","left":(bw*k/100)+"%"},
					C:[{T:"div"},{T:"div"}]
					//C:[{T:"div"},{T:"div",C:[{T:"div"}]}]
				}).join(this.E);
			}
			es=this.E.querySelectorAll("[KBAR]");
		}
		d.forEach((d,k) => {
			let e=es[k];
			e.value=d;
			((max, maxim) => {
				Object.assign(e.style,{
					border:"0",
					top:(parseInt(10000*(max-d.H)/maxim)/100)+"%",
					height:(parseInt(10000*(d.H-d.L)/maxim)/100)+"%"
				});
			})(max, max-min);
			((max, maxim) => {
				let hl=d.O<d.C ? [d.C,d.O,"up"] : [d.O,d.C,d.O==d.C?"flat":"down"];
				if(hl[0]==hl[1]) hl=[hl[0]+0.01,hl[1]-0.01,hl[2]];
				Object.assign(e.lastChild.style,{
					top:(parseInt(10000*(max-hl[0])/maxim)/100)+"%",
					height:(parseInt(10000*(hl[0]-hl[1])/maxim)/100)+"%"
				});
				e.setAttribute("KBAR",hl[2]);
			})(d.H, d.H-d.L);
		});
		return await super.set(d);
	}	// set
};	// }}}

Driver.qrcode=class extends Driver.Template
{	// QRCode {{{
	constructor (e, o={"w":512,"h":512}) {
		super(e,o);
	}
	async set (d) {
		(new (await Piers.import({"xl":"QRCode"}))(this.E, {"width":512,"height":512,"userSVG":true}))
		.makeCode(d);
		await super.set(d)
	}
};	// }}}

})();
