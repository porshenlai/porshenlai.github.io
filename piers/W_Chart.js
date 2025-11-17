(()=>{

/* MANUAL
{BarChart} = Piers.Widget(<ELEMENT>, "BarChart", {Options});
{BarChart} = Piers.Widget(<ELEMENT>, "PieChart", {Options});
{BarChart} = Piers.Widget(<ELEMENT>, "RadarChart", {Options});
{BarChart} = Piers.Widget(<ELEMENT>, "LineChart", {Options});
{BarChart} = Piers.Widget(<ELEMENT>, "ScatterChart", {Options});
MANUAL */

let Driver = Piers.W();

Driver.Chart=class extends Driver.Template
{	// Chart {{{
	constructor (e, o={}) {
		o=Object.assign({dft:{}}, o);
		super(e,o);
		Piers.DOM(this.E).clear();
		this.VE=(() => {
			let ve=Piers.DOM({"T":"canvas"});
			ve.join(this.E);
			return ve.E;
		})();
		this.Chart=undefined;
		this.reset();
	}
	reset () {
		if (this.Chart)
			this.Chart.destroy();
		this.Chart=undefined;
	}
	config (dft) {
		this.E._opts.dft=Object.assign(
			this.E._opts.dft,
			dft
		);
	}
	async plot (type, data) {
		this.reset();
		this.Chart=new (await Piers.import({"xl":"chart"}))
		.Chart(this.VE, {
			type: type,
			data: Object.assign({}, data, {
				"datasets": data.datasets.map((d) => Object.assign({}, this.E._opts.dft, d))
			})
		});
	}
}	// }}}

Driver.BarChart=class extends Driver.Chart
{	// 長條圖 (chart.js) {{{
	async set (d, style="bar")
	{ 	//	await set("bar", {
		//		"2024":{ "A":30, "B":25, "C":20 },
		//		"2025":{ "A":35, "B":30, "C":50 }
		//	});
		let ls=[];
		Piers.OBJ(d).forEach(
			(d,k) => (ls=Piers.OBJ(ls).or(Piers.OBJ(d).reduce((r,v,k) => (r.push(k)&&r), [])))
		);
		await this.plot(style, {
			labels: ls,
			datasets: Piers.OBJ(d).reduce((r,d,k) => r.push({
				label: k,
				data: ls.reduce((r,v,k) => r.push(d[v]||0)&&r,[])
			})&&r, [])
		});
		super.set(d);
	}	// set
}	// }}}

Driver.PieChart=class extends Driver.BarChart 
{	// 圓餅圖 (chart.js) {{{
	async set (d)
	{
		return await super.set(d, "pie");
	}	// set
}	// }}}

Driver.RadarChart=class extends Driver.BarChart 
{	// 雷達圖 (chart.js) {{{
	async set (d)
	{
		return await super.set(d, "radar");
	}	// set
}	// }}}

Driver.LineChart=class extends Driver.Chart
{	// 線圖 (chart.js) {{{
	// let w=new LineChart(<div>);
	// w.set({"1":{"A":1,"B":2},"2":{"A":3,"B":2},"3":{"A":1,"B":4}});
	async set (d, cmd="line")
	{
		let idx=[... Object.keys(d)].sort();
		await this.plot(cmd, {
			labels: idx,
			datasets: [... Object.keys(d[idx[0]])].reduce((r,v)=>(r.push({
				label: v,
				data: idx.reduce((r,vv)=>(r.push(d[vv][v])&&r),[]),
			})&&r),[])
		});
		return await super.set(d);
	}	// set
}	// }}}

Driver.ScatterChart=class extends Driver.LineChart
{	// 散佈圖 (chart.js) {{{
	async set (d)
	{
		return await super.set(d, "scatter");
	}	// set
}	// }}}

})();
