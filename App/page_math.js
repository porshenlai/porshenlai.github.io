(function(SCRIPT){

window.MathJax = {
	tex: {
		inlineMath: [['$', '$'], ['\\(', '\\)']],
		displayMath: [['$$', '$$'], ['\\[', '\\]']]
	}
};

const Init=(async (SE) => {
	// https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js
	await window.Apps.loadScript (window.Apps.JSPrefix+'js/tex-mml-chtml.js')
	return MathJax;
})();

SCRIPT.value=async function (slide,elem) {
	await (await Init).typesetPromise([elem]);
};

})(document.currentScript);
