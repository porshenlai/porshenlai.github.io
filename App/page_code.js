(function(SCRIPT){

function syntax_LC (t) {
	return t.startsWith("#") ? 'darkgreen'
	:	t.startsWith("import") ? 'brown'
	:	t.startsWith("from") ? 'brown'
	:	t.startsWith("if") ? 'blue'
	:	t.startsWith("else") ? 'blue'
	:	t.startsWith("elif") ? 'blue'
	:	t.startsWith("for") ? 'blue'
	:	t.startsWith("while") ? 'blue'
	:	t.startsWith("with") ? 'blue'
	:	t.startsWith("try") ? 'blue'
	:	t.startsWith("except") ? 'blue'
	:	t.startsWith("finally") ? 'blue'
	:	t.startsWith("def") ? 'red'
	:	t.startsWith("class") ? 'red'
	:	t.startsWith("!") ? 'red'
	:	t.startsWith("print") ? 'darkblue'
	:	t.startsWith("input") ? 'darkblue'
	:	undefined;
}

SCRIPT.value = class extends Apps.mod_template {
	async __init__ (elem)
	{	// initialize element
		if (elem.classList.contains('mod_code')) return;

		elem.classList.add('mod_code','frame');
		elem.style.padding='4px 32px';

		let s = elem.innerHTML.trim();
		elem.innerHTML = '';
		for (let le of s.split('\n').map((l)=>[(()=>{
			let c = 0;
			while (l.startsWith('\t')){ c++; l=l.substr(1); }
			return c;
		})(),l])) {
			elem.appendChild(((e)=>{
				e.innerHTML = le[1];
				if (!e.firstChild) return document.createElement("br");
				if (le[0]<=0 && e.firstChild==e.lastChild && e.firstChild.nodeType!==3) return e.firstChild;
				if (e.dataset.level===undefined) e.dataset.level=le[0];
				//if (le[0]>0) e.style.paddingLeft=(le[0]*48)+'px';
				return e;
			})(document.createElement('div')));
		}
	}	// __init__
	async syntax (elem, scf=()=>'black')
	{	// apply syntax high-light
		Array.from(elem.childNodes).forEach((e)=>{
			let v = scf(e.textContent.trim());
			if (v) e.style.color = v;
		});
	}	// syntax
	async init (elem, ...args)
	{	// init page
		await this.syntax(elem, syntax_LC);
	}	// init
	async copy (elem)
	{	// copy data to clipboard
		let buf = '';
		for (let e=elem.firstChild; e; e=e.nextSibling) if (e.nodeType===1)
			buf+='\t'.repeat(e.dataset.level)+e.textContent+'\n';
		const tarea = document.createElement("pre");
		tarea.textContent=buf;
		try {
			document.body.appendChild(tarea);
			const selection = window.getSelection();
			selection.removeAllRanges();
			const range = document.createRange();
			range.selectNodeContents(tarea);
			selection.addRange(range);

			let success = document.execCommand('copy');
			selection.removeAllRanges();
			alert(success ? "Copied" : "Copy failed");
		} catch (err) {
			console.error("Copy operation failed: ", err);
		} finally {
			document.body.removeChild(tarea);
		}
	}	// copy
};

})(document.currentScript);
