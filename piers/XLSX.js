(async function(){
	document.currentScript.value = async function (data){
		// xr=Piers.XLSX([{"A":1,"B":2,"C":3},{"A":4,"B":5,"D":6}]);
		// xr.get((name, rows) => { console.log(rows); })
		// xr.download("filename.xlsx");
		let xr = new (class {
			constructor (XLSX) {
				// {{{
				this.Sheets={};
				this.XLSX=XLSX;
				// }}}
			}	// constructor
			async init (data) {
				// {{{
				if (data) {
					if (Array.isArray(data))
						this.set(data);
					else
						Piers.OBJ(data).forEach((d,k)=>rst.set(d,k));
				} else {
					let du=await Piers.fetch(
						null,
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,"+
						"application/vnd.ms-excel"
					);
					du=this.XLSX.read(du,{type:"binary",cellDates:true});
					du.SheetNames.forEach((sn) => {
						this.select(sn);
						this.set(this.XLSX.utils.sheet_to_json(du.Sheets[sn]));
					});
				}
				return this;
				// }}}
			}	// init
			select (name) {
				// {{{
				this.CSName=name;
				return this;
				// }}}
			}	// select
			set (rows, name=undefined) {
				// {{{
				this.CSName = name||this.CSName||"Default";
				this.Sheets[this.CSName]=rows;
				return this;
				// }}}
			}	// set
			get (cb) {
				// {{{
				for (let n in this.Sheets)
					cb(n, this.Sheets[n]);
				return this;
				// }}}
			}	// get
			getCNs (table) {
				// {{{
				return Object.keys(table.reduce((cns,row) => {
					for (let k in row) if (!cns[k]) cns[k]=1;
					return cns;
				}, {}));
				// }}}
			}	// getCNs
			async download (fn) {
				// {{{
				if (!fn) fn="download.xlsx";
				let wb = this.XLSX.utils.book_new();
				for (let sn in this.Sheets)
					this.XLSX.utils.book_append_sheet(
						wb,
						this.XLSX.utils.json_to_sheet(this.Sheets[sn]),
						sn
					);
				await this.XLSX.writeFile(wb,fn);
				return this;
				// }}}
			}	// download
		})((await Piers.import({"xl":"xlsx"})).XLSX);
		await xr.init(data);
		return xr;
	}
})();
