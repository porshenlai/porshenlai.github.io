(()=>{
	let Driver=Piers.FS().Driver;
	Driver.localStorage=class extends Driver.Device
	{
		__calcUID__ (path) { return Array.isArray(path) ? path.join('/') : path; }
		async __newF__ (path, dft) {
			return new (class extends this.Entry {
				async read (dft) {
					this.Buf=localStorage.getItem(this.Path)||dft;
					try {
						this.Buf=await JSON.parse(this.Buf);
					} catch(x) {}
					return this;
				}
				async write () {
					localStorage.setItem(
						this.Path,
						"string"===typeof(this.Buf) ? this.Buf : JSON.stringify(this.Buf)
					);
					return this;
				}
				async remove () {
					localStorage.removeItem(this.Path);
					this.Buf=this.Path=undefined;
					return this;
				}
			})(Array.isArray(path) ? path.join('/') : path);
		}
	}	// class localStorage
})();
