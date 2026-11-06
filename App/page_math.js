(function(SCRIPT){

// https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js

SCRIPT.value=class extends Apps.mod_template {
	constructor (slide) {
		super(slide);
		window.MathJax = {
			tex: {
				inlineMath: [['$', '$'], ['\\(', '\\)']],
				displayMath: [['$$', '$$'], ['\\[', '\\]']]
			}
		};
		this.Loaded=false;
	}
	async __init__ (elem) {
		if (this.Loaded) return;
		await Apps.loadScript (Apps.JSPrefix+'js/tex-mml-chtml.js')
	}
	async init (elem) {
		await window.MathJax.typesetPromise([elem]);
	}
}

})(document.currentScript);
