(() => {

class OBJ
{	// 物件
	constructor (o) {
		this.O = o
	}
	keys () {
		Object.keys(this.O);
	}
	isEmpty () {
		return this.keys().length > 0;
	}
	assign (o) {
		Object.assign(this.O, o);
	}
	forEach (cb) {
		for(let k in this.O)
			cb(this.O[k], k);
	}
	reduce (cb, r) {
		for(let k in this.O)
			r=cb(r, this.O[k], k);
		return r;
	}
	filter (cb) {
		this.reduce(function (r,v,k) {
			if (cb(v,k)) r[k]=v;
			return r;
		},{});
	}
	get (p=[], dv="") {
		try{
			if (!Array.isArray(p)) p=p.split(".").filter((v)=>v);
				return (p||[]).reduce(function(r,i){
					return r[i];
				},this.O);
		}catch(e){ return dv; }
	}
	put (p=[], v="") {
		if (!Array.isArray(p)) p=p.split(".").filter((v)=>v);
		let n=p.pop(), o;
		console.assert(p.length>=0, "OBJ.put: Empty Path: "+p+","+v);
		o = p.reduce(function (r, i) {
			if (!r[i])
				r[i]={};
			return r[i];
		}, this.O);
		o[n] = v;
		console.assert(p.length>=0, "OBJ.put: Empty Path: "+p+","+v);
	}
	and (B) {
		// and({OBJECT_B}) => {OBJECT_NEW}
		console.assert('object'===typeof(this.O), "OBJ.and: operand A is not an object");
		console.assert('object'===typeof(B), "OBJ.and: operand B is not an object");

		if (Array.isArray(B)){
			console.assert(Array.isArray(this.O), "operand A is not an array")
			return this.O.reduce((r, v) => {
				if (B.indexOf(v)>=0) r.push(v);
				return r;
			}, []);
		}

		return this.reduce(function (r, v, k) {
			if (k in B)
				r[k]=('object'===typeof(v) && 'object'===typeof(B[k]))
					? (new OBJ(v)).and( B[k]) : v;
			return r;
		}, {});
	}
	or (B) {
		// or({OBJECT_B}) => {OBJECT_NEW}
		console.assert('object'===typeof(this.O), "OBJ.or: operand A is not an object");
		console.assert('object'===typeof(B), "OBJ.or: operand B is not an object");

		return (function join (a, b) {
			if (Array.isArray(b)) {
				console.assert(Array.isArray(a), "OBJ.or: operand A is not an Array");
				return b.reduce(function (r,v) {
					if (r.indexOf(v)<0) r.push(v);
						return r;
					}, [...a]);
				}
				let aa=Object.assign({}, a), k;
				for (k in b)
					switch (typeof(a[k])+"-"+typeof(b[k])) {
					case "object-object":
						aa[k] = join(aa[k], b[k]);
						break;
					default:
						if (b[k]===undefined)
							delete aa[k];
						else
							aa[k] = b[k];
						break;
					}
			return aa;
		})(this.O, B);
	}
	remove (B) {
		console.assert('object'===typeof(this.O), "OBJ.remove: operand A is not an object")
		console.assert('object'===typeof(B), "OBJ.remove: operand B is not an object");

		return (function remove (a, b) {
			if (Array.isArray(b)) {
				console.assert(Array.isArray(a),"OBJ.remove: operand A is not an array");
				return a.reduce((r, v) => {
					if (b.indexOf(v)<0) r.push(v);
					return r;
				}, []);
			}
			Piers.OBJ(this.O).reduce(function(r, v, k){
				switch (typeof(v)+"-"+typeof(b[k])) {
				case "object-object":
					r[k]=remove(v, b[k]);
					break;
				default:
					if (!b[k]) r[k]=v;
					break;
				}
				if (r[k]===undefined) delete r[k];
				return Object.keys(r).length>0 ? r : undefined;
			}, {});
		})(this.O, B);
	}
	copy (deep=false) {
		return deep ? JSON.parse(JSON.stringify(this.O)) : this.assign({}, this.O);
	}
	join (no) {
		for (let k in no) {
			if (k in this.O && 'object' === typeof(this.O[k]))
				Piers.OBJ(this.O[k]).join(no[k]);
			else this.O[k] = no[k];
		}
		return this.O;
	}
	methodCall (func) {
		return func.apply(this.O, arguments);
	}
	toJSON (replacer=undefined, space=undefined) {
		return JSON.stringify(this.O, replacer, space);
	}
	toQueryString (qo) {
		return this.reduce(function (r,v,k) {
			return r + "&"+k+(v===true?"":("="+encodeURIComponent(v)));
		}, "").replace(/^&/,'?');
	}
}	// class OBJ 

document.currentScript.value = function (o, t="obj") {
	switch(t){
	case "json":
		o=JSON.parse(o);
		break;
	case "querystring":
		o=o.replace(/^\?/, '').split(/&/).reduce(function (r,i) {
			if (i=/^([^=]+)(=(.*)){0,1}/.exec(i))
				r[decodeURIComponent(i[1])] = i[2]
				? decodeURIComponent(i[3]) : true;
			return r;
		}, {})
		break;
	}
	return o instanceof OBJ ? o : (new OBJ(o));
};

})();
