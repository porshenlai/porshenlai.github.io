(function(SCRIPT){

const prefix=/(.*\/)([^\/]+)(\?.*)?/.exec(SCRIPT.src);
function loadScript (url,init) {
	return new Promise((or,oe)=>{
		let se=document.createElement('script');
		se.addEventListener('load',()=>init(se).then(or,oe));
		se.src=prefix[1]+url;
		document.head.appendChild(se);
	});
}

const Init=loadScript ('js/mermaid.min.js', async (SE) => {
	mermaid.initialize({ startOnLoad: false, theme: 'default' });
	return mermaid;
}); // https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js

SCRIPT.value=async function (slide, elem, code) {
	if (code) {
		elem.innerHTML=(await (await Init).render('graphDiv', code)).svg
	} else {
		if (elem instanceof Element) elem=[elem];
		await (await Init).run({nodes:elem});
	}
};

})(document.currentScript);
