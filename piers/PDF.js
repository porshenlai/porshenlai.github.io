(function(){

class PDF {
	//	let tu=new TU("table")
	//	await tu.print("test.pdf",{ori:"p",ww:640,rpp:8});
	//	await tu.sort((a,b)=>a-b);
	constructor (e, o={}) {
		this.E = "string"===typeof(e) ? document.body.querySelector(e) : e;
		console.assert(this.E, "Table failed to created with NULL element");
		if (!this.E.querySelector('style[_LIB_="PiersTable"]'))
			Piers.import({
				"styles": {
					'[_PT_="OOP"], [_PT_="PRINTING"] .noPrint': { display:"none" }
				},
				"attrs": { "_LIB_": "PiersTable" }
			}, this.E);
		console.log(this.E.querySelector('style[_LIB_="PiersTable"]'));
	}

	createPager (cs="tbody>tr", rpp=20) {
		return new (class {
			constructor (cs, rpp) {
				this.CS=cs;
				this.RPP=rpp;
			}
			set (e, pn) {
				let min=pn*this.RPP, max=min+this.RPP, es=e.querySelectorAll(cs);
				if (min > es.length) return false;
				[... es].forEach(
					(e,i) => e.setAttribute("_PT_", (i<min || i>=max) ? "OOP" : "OK")
				);
				return true;
			}
			clear (e) {
				[... e.querySelectorAll('[_PT_]')].forEach((e) => e.removeAttribute("_PT_"));
			}
		})(cs, rpp);
	}

	async print (ofn="print.pdf", options={}, pager={"set":(e,pn) => pn===0}) {
		let X = await Promise.all([
			Piers.import({"xl":"jspdf"}),
			Piers.import({"xl":"html2canvas"})
		]);
		console.log(X);
		options = Object.assign({ori:'l', ww:1920, rpp:20}, options||{});
		let twh = options.ori==="l" ? [210, 297] : [297, 210],
			doc = new X[0](options.ori, 'mm', twh),
			page, wh, cr=0;
		this.E.setAttribute("_PT_", "PRINTING");
		for (let pn=0; pager.set(this.E, pn); pn++) {	// 分頁
			wh = [twh[1]-10, twh[0]-10];
			page = await X[1](this.E, {"scale":1, "windowWidth":options.ww})
			page.style.width = "100%";
			if (page.width*wh[1] > wh[0]*page.height)
				wh[1] = wh[0]*page.height/page.width;
			else
				wh[0] = wh[1]*page.width/page.height;
			if (pn>0) doc.addPage();
			doc.addImage(page, 'Canvas', 5, 5, wh[0], wh[1]);
		}
		doc.save(ofn); // 存檔
		if (pager.clear) pager.clear(this.E);
		this.E.removeAttribute("_PT_");
	}
}

document.currentScript.value=PDF;

})();
