(function(SCRIPT){

const Init = (async () => {
	// https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js
	await Apps.loadScript(Apps.JSPrefix+'js/mermaid.min.js');
	mermaid.initialize({
		startOnLoad: false,
//		themeCSS: '.nodeLabel { white-space: nowrap !important; }'
		theme: 'default'
	});
	return mermaid;
})();

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');

	if (!code)
		code = await Apps.Ns.create('data', elem).get();

	Apps.E(elem).replace(await (async (e)=>{
		e.innerHTML = (await (await Init).render('graphDiv', code)).svg;
		return e;
	})(document.createElement("div")));
	// elem.innerHTML = await slide.NS.query('data', elem).get();
	// await (await Init).run({nodes:[elem]});
};

})(document.currentScript);
