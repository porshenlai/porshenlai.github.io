(function(SCRIPT){

SCRIPT.value = class extends Apps.mod_template {
	async init (elem, temp, doc) {
		if (elem.classList.contains('mod_csv')) return;
		elem.classList.add('mod_csv','fill');

		if (!doc || doc==='&this') doc=elem;
		doc = Apps.Ns.resolve(...(doc instanceof Element ? ['data',doc] : [doc]))

		if (!temp || temp==='&this') temp=elem;
		temp = Apps.Ns.resolve(...(temp instanceof Element ? ['template',temp] : [temp]))

		try { doc = await doc.get(); } catch(x) { console.log("ERROR",x); }

		if (doc && temp) {
			while(elem.firstChild) elem.removeChild(elem.firstChild);
			elem.appendChild(temp.clone());
			Apps.E(elem).put(doc);
		}
	}
}

})(document.currentScript);
