((cse)=>{
	const prefix=/(.*\/)([^\/]+)(\?.*)?/.exec(cse.src);
	cse.id='TeX';

	function loadScript (url,init) {
		return new Promise((or,oe)=>{
			let se=document.createElement('script');
			se.addEventListener('load',()=>init(se).then(or,oe));
			se.src=prefix[1]+url;
			document.head.appendChild(se);
		});
	}

	function Element(hint, pe=document.body) {
		try {
			return hint.nodeType===1 ? hint : pe.querySelector(hint) ;
		} catch(x) { return document.body; }
	}

	// Usage: .renderMarkdown(ELEMENT, MARKDOWN_TEXT, RECURSIVE=true);
	// Usage: .renderMarkdown(ELEMENT);
	// Usage: .renderMarkdown(ELEMENT, MERMAID_TEXT, RECURSIVE=true);

	const LANGTAG='xlang'
	const TeX = cse.value = new (class {
		constructor () {
			this.MDInit=this.MathInit=this.DiagramInit=undefined;
		}
		async resolve (cw) {
			cw=Element(cw);
			if (cw.hasAttribute(LANGTAG)) {
				switch (cw.getAttribute(LANGTAG)) {
				case 'markdown':
					await this.renderMarkdown(cw,cw.getAttribute('markdown')||cw.innerHTML);
					break;
				case 'mermaid':
					await this.renderMermaid(cw,cw.getAttribute('mermaid')||cw.innerHTML);
					break;
				}
				cw.removeAttribute(LANGTAG);
			} else for (let e of Array.from(cw.querySelectorAll(`[${LANGTAG}]`)))
				await this.resolve(e);
		}
		async renderMarkdown (cw, text, recursive=true) { // markdown
			if (!this.MDInit) {
				this.MDInit=loadScript('js/marked.min.js',async (SE) => {
					const renderer = new marked.Renderer();
					renderer.code = ({text,lang}) => (lang === 'mermaid') ? `<pre _mermaid_>${text}</pre>` : `<pre><code>${text}</code></pre>`;
					marked.setOptions({ renderer });
				}); // https://cdn.jsdelivr.net/npm/marked/marked.min.js
			}
			await this.MDInit;
			cw=Element(cw);
			while (cw.firstChild) cw.removeChild(cw.firstChild);
			cw.innerHTML=marked.parse(text);
			if (recursive) {
				await TeX.renderMermaid(cw);
				await TeX.renderMath(cw);
			}
		}
		async renderMermaid (cw, lang, recursive=true) {
			if (!this.DiagramInit)
				this.DiagramInit=loadScript('js/mermaid.min.js',async (SE) => {
					mermaid.initialize({ startOnLoad: false, theme: 'default' });
				}); // https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js
			await this.DiagramInit;
			if (lang)
				cw.innerHTML=(await mermaid.render('graphDiv',lang)).svg;
			else {
				const es=Array.from(Element(cw).querySelectorAll('[_mermaid_]'));
				es.forEach((e)=>e.removeAttribute('_mermaid_'));
				if (es&&es.length>0) await mermaid.run({ nodes: es });
			}
		}
		async renderMath (cw) {
			if (!this.MathInit) {
   				window.MathJax = {
   					tex: {
		   				inlineMath: [['$', '$'], ['\\(', '\\)']],
		   				displayMath: [['$$', '$$'], ['\\[', '\\]']]
   					}
				};
				this.MathInit=loadScript('js/tex-mml-chtml.js',async (SE) => {
				}); // https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js
			}
			await this.MathInit;
			if (window.MathJax && window.MathJax.typesetPromise)
				await window.MathJax.typesetPromise([Element(cw)]);
		}
	})();

	if (cse.hasAttribute('auto')) {
		if (document.readyState!=='complete')
			window.addEventListener('load', () => {
				TeX.resolve(cse.getAttribute('auto')).then(()=>0,console.log);
			});
		else
			TeX.resolve(cse.getAttribute('auto')).then(()=>0,console.log);
	}
})(document.currentScript);


