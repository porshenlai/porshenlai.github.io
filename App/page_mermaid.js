(function(SCRIPT){

const Init = (async () => {
	// https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js
	await window.Apps.loadScript(window.Apps.JSPrefix+'js/mermaid.min.js');
	mermaid.initialize({ startOnLoad: false, theme: 'default' });
	return mermaid;
})();

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');

	if (code) {
		elem.innerHTML=(await (await Init).render('graphDiv', code)).svg
	} else {
		elem.innerHTML=Apps.querySelector(elem,'textarea').value;
		await (await Init).run({nodes:[elem]});
	}
};

})(document.currentScript);
