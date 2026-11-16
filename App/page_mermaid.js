(function(SCRIPT){

// https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js

SCRIPT.value=class extends Apps.mod_template {
	constructor (slide) {
		super(slide);
		this.mermaid = undefined;
	}
	async __init__ (elem) {
		if (this.mermaid) return;
		if (!window.mermaid)
			await Apps.loadScript(Apps.JSPrefix+'js/mermaid.min.js');
		window.mermaid.initialize({
			startOnLoad: false,
			themeCSS: '.nodeLabel { white-space: nowrap !important; }',
		 	theme: 'default'
		});
		this.mermaid = window.mermaid;
	}
	async init (elem, code) {
		if (elem.classList.contains('mod_mermaid')) return;
		elem.classList.add('mod_mermaid');

		if (!code)
			code = await Apps.Ns.resolve('data', elem).get();

		try{
			elem.innerHTML='<span>Rendering ...</span>';
			elem.innerHTML=(await this.mermaid.render('graphDiv_'+(new Date()).getTime().toString(36), code)).svg;
		}catch(x){ console.log(x); }

		const svg = elem.querySelector('svg');
		if (svg && svg.style.maxWidth) svg.style.maxWidth='';
	}
};

})(document.currentScript);
