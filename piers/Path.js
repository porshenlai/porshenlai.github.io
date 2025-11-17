(()=>{

const RXESC={ "\\":"\\\\",".":"\\." };
document.currentScript.value={
	"join": function (parts, sep="/") {
		let xs=RXESC[sep] || sep;
		return (parts[0].startsWith("/") ? "/" : "") + parts.map(function (v) {
			return (new RegExp("[^"+xs+"].*[^"+xs+"]")).exec(v)[0]
		}).filter(
			(v)=>v
		).join(sep)
	},
	"dirname": function (path, sep="/") {
		let xs=RXESC[sep] || sep;
		try{
			return (new RegExp("(.*)"+xs+"[^"+xs+"]*")).exec(path)[1];
		}catch(x){ return ""; }
	},
	"basename": function (path, sep="/") {
		let xs=RXESC[sep] || sep;
		try{
			return (new RegExp(".*"+xs+"([^"+xs+"]*)")).exec(path)[1];
		}catch(x){ return path; }
	}
};

})();
