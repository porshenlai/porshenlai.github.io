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

const Init=loadScript ('js/marked.min.js', async (SE) => {
	const renderer = new marked.Renderer();
	renderer.code = ({text,lang}) => (lang === 'mermaid') ? `<pre _mermaid_>${text}</pre>` : `<pre><code>${text}</code></pre>`;
	marked.setOptions({ renderer });
	return marked;
}); // https://cdn.jsdelivr.net/npm/marked/marked.min.js

SCRIPT.value=async function (slide, elem, code) {
	if (!code)
		code=elem.innerHTML;
	elem.innerHTML=(await Init).parse(code);
};

})(document.currentScript);
