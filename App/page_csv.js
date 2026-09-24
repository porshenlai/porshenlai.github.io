(function(SCRIPT){

SCRIPT.value=async function (slide, elem, temp, doc) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('fill','resolved');

	if (!doc || doc==='&this') doc=elem;
	doc = Apps.Ns.resolve(...(doc instanceof Element ? ['data',doc] : [doc]))

	if (!temp || temp==='&this') temp=elem;
	temp = Apps.Ns.resolve(...(temp instanceof Element ? ['template',temp] : [temp]))

	try { doc = await doc.get(); } catch(x) { console.log("ERROR",x); }

	if (doc && temp) {
		while(elem.firstChild) elem.removeChild(elem.firstChild);
		elem.appendChild(temp.cloneNode(true));
		//elem.put(doc);
	}
};

})(document.currentScript);
