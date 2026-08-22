let v = '10:"[A:123,B:789]"'.split(':');

console.log(v);
v=v.reduce((r,v)=>{
	if (r.X.length>0) {
		if (v.endsWith('"')) {
			r.X.push(v.substring(0,v.length-1));
			r.R.push(r.X.join(":"));
			r.X=[];
		} else r.X.push(v);
	} else if(v.startsWith('"')) r.X=[v.substring(1)]; else r.R.push(v);
	return r;
},{R:[],X:[]}).R;

console.log(v);
