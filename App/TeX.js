((cse)=>{
	cse.id='TeX';
	function Element(hint, pe=document.body) {
		try {
			return hint.nodeType===1 ? hint : pe.querySelector(hint) ;
		} catch(x) { return document.body; }
	}
	async function NF(){ }
	cse.syncMD=cse.syncMath=cse.syncDiagram=NF;
	/*
		Usage: .syncMD(ELEMENT, MARKDOWN_TEXT);
		Usage: .syncMath(ELEMENT);
		Usage: .syncDiagram(ELEMENT);
	*/
   	window.MathJax = {
   		tex: {
		   	inlineMath: [['$', '$'], ['\\(', '\\)']],
		   	displayMath: [['$$', '$$'], ['\\[', '\\]']]
   		}
	};

	const TASKS=[
		['js/marked.min.js',async ()=>{ // https://cdn.jsdelivr.net/npm/marked/marked.min.js
			const renderer = new marked.Renderer();
			renderer.code = ({text,lang}) => (lang === 'mermaid') ? `<pre xlang="mermaid">${text}</pre>` : `<pre><code>${text}</code></pre>`;
			marked.setOptions({ renderer });
			cse.syncMD=async function(cw, text) {
				cw=Element(cw);
				if (text) {
					while(cw.firstChild) cw.removeChild(cw.firstChild);
					cw.innerHTML=marked.parse(text);
					await cse.syncMath(cw);
					await cse.syncDiagram(cw);
				} else Array.from(cw.querySelectorAll('[xlang="markdown"]')).forEach((e)=>{
					const ne=e.cloneNode(false);
					ne.markdown=e.innerHTML;
					e.parentNode.insertBefore(ne,e);
					cse.syncMD(ne,ne.markdown);
					e.parentNode.removeChild(e);
				});
			};
		}],
		['js/tex-mml-chtml.js',()=>{ // https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js
			cse.syncMath=async function (cw) {
				if (window.MathJax && window.MathJax.typesetPromise)
					await window.MathJax.typesetPromise([Element(cw)]);
			};
		}],
		['js/mermaid.min.js',()=>{ // https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js
			mermaid.initialize({ startOnLoad: false, theme: 'default' });
			cse.syncDiagram=async function (cw) {
				const es=Array.from(Element(cw).querySelectorAll('[xlang="mermaid"]'));
				if (es&&es.length>0) await mermaid.run({ nodes: es });
			};
		}]
	];

	cse.value = (async () => {
		const prefix=/(.*\/)([^\/]+)(\?.*)?/.exec(cse.src);
		await Promise.all(TASKS.map((s)=>{
			let se=document.createElement('script');
			se.src=prefix[1]+s[0];
			se.init=(s[1]||(()=>undefined));
			return se;
		}).reduce((rs,se)=>{
			rs.push(new Promise((or,oe)=>se.addEventListener('load',()=>{ se.init(); or(); })));
			document.head.appendChild(se);
			return rs;
		},[]));


		if (cse.hasAttribute('auto')) {
			if (document.readyState!=='complete')
				await new Promise((or,oe)=>{
					window.addEventListener('load', () => cse.syncMD(cse.getAttribute('auto')).then(or,oe));
				});
			else await cse.syncMD(cse.getAttribute('auto'));
		}
	})();
})(document.currentScript);


