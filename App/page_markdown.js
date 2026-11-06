(function(SCRIPT){

// https://cdn.jsdelivr.net/npm/marked/marked.min.js

SCRIPT.value=class extends Apps.mod_template {
	constructor (slide) {
		super(slide);
		this.marked = undefined;
	}
	async __init__ (elem) {
		if (this.marked) return;
		if (!window.marked)
			await Apps.loadScript (Apps.JSPrefix+'js/marked.min.js');
		const renderer = new marked.Renderer();
		renderer.code = ({ text, lang }) => (lang === 'mermaid')
			? `<pre _mermaid_>${text}</pre>`
			: `<pre><code>${text}</code></pre>` ;
		window.marked.setOptions({ renderer });
		this.marked = window.marked;
	}
	async init (elem, code) {
		if (elem.classList.contains('mod_marked')) return;
		elem.classList.add('mod_marked');

		if (!code)
			code = await Apps.Ns.resolve('data', elem).get();
		Apps.E(elem).replace(await (async (e)=>{
			e.innerHTML = this.marked.parse(code);
			return e;
		})(document.createElement("div")));
	}
};

})(document.currentScript);
