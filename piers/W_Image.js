(()=>{

let Driver=Piers.W();

Driver.Image=class extends Driver.Template
{
	constructor (e, o={})
	{
		super(e,o);
	}
	async set (d)
	{	// {"P":"/upload/test.jpg","T":"image/jpeg"}
		if (d.getType().startsWith("embed")) {
			let s=this.E.querySelector("embed").style;
			s.backgroundImage="url("+(await d.getDataURL())+")";
			s.backgroundPosition="center";
			s.backgroundRepeat="no-repeat";
			s.backgroundSize="contain";
		} else {
			this.E.querySelector("embed").setAttribute("src",(await d.getDataURL()));
		}
		return super.set(d);
	}
};

})();
