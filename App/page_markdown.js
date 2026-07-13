(function(SCRIPT){

// https://cdn.jsdelivr.net/npm/marked/marked.min.js
const Init=(async () => {
	await window.Apps.loadScript (window.Apps.JSPrefix+'js/marked.min.js');
	const renderer = new marked.Renderer();
	renderer.code = ({text,lang}) => (lang === 'mermaid') ? `<pre _mermaid_>${text}</pre>` : `<pre><code>${text}</code></pre>`;
	marked.setOptions({ renderer });
	return marked;
})();

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');
	if (!code)
		code = (Apps.E(elem).query('textarea')||{value:""}).value;
	if (elem.value) {
		container = document.createElement("div");
		elem.parentNode.insertBefore(container,elem);
		elem.parentNode.removeChild(elem);
		container.Editor=elem;
	} else container = elem;
	container.innerHTML=(await Init).parse(code);
};

})(document.currentScript);
