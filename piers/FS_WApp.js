(()=>{

let Driver=Piers.FS().Driver;

Driver.HttpGet=class extends Driver.Device
{
	constructor (home) {
		super();
		this.Home=Array.isArray(home) ? home : [];
	}
	async __newF__ (path, dft) {
		let home=this.Home;
		return new (class extends this.Entry {
			async read (dft) {
				this.Buf=(await Piers.fetch(
					home.concat(("string"===typeof(path)?path.split("/"):path).filter((v)=>v)).join("/")
				)) || dft
				return this.Buf;
			}
		})();
	}
}

Driver.HttpReq=class extends Driver.Device
{
	constructor (api) {
		super();
		this.API=Object.assign({
			read:()=>undefined,
			write:()=>undefined,
			remove:()=>undefined
		},api);
	}
	async __newF__ (path, dft) {
		let api=this.API;
		return new (class extends this.Entry {
			async read (dft) {
				let args=api.read(path);
				this.Buf=args ? ((await Piers.fetch.apply(Piers, args))||dft) : dft;
				return this.Buf;
			}
			async write () {
				let args=api.write(path, this.Buf);
				if (args) await Piers.fetch.apply(Piers, args);
				return this;
			}
			async remove () {
				let args=api.remove(path);
				if (args) await Piers.fetch.apply(Piers, args);
				return this;
			}
		})();
	}
}

})();
