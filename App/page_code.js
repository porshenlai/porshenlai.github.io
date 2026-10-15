(function(SCRIPT){

class ICode
{
	constructor (elem) {
		if (!elem.classList.contains('resolved')) {
			elem.classList.add('resolved');
			this.prepare(elem);
		}
		elem.classList.add('frame');
		elem.style.padding='4px 32px';
		this.E = elem;
	}
	prepare (elem) {
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
				if (e.firstChild==e.lastChild && e.firstChild.nodeType!==3) return e.firstChild;
				e.dataset.level=le[0];
				if (le[0]>0) e.style.paddingLeft=(le[0]*48)+'px';
				return e;
			})(document.createElement('div')));
		}
		elem.addEventListener('ModCMD', (event)=>{
			console.log(`Hello, ${event.detail.username}! Role: ${event.detail.role}`);
		});
	}
	command (cmd) {
		const cmdEvt = new CustomEvent('ModCMD',{detail:cmd});
		console.log('====>',cmdEvt);
		this.E.dispatchEvent(cmdEvt);
	}
	syntax (on=true) {
		Array.from(this.E.childNodes).forEach((e)=>{
			let v = this.syntax_LC(e.textContent.trim());
			if (v) e.style.color = v;
		});
	}
	syntax_LC (t) {
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
		:	t.startsWith("!") ? 'red'
		:	t.startsWith("print") ? 'darkblue'
		:	t.startsWith("input") ? 'darkblue'
		:	undefined;
	}
	copy () {
		const tarea = document.createElement("textarea");
		for (let e=this.E.firstChild; e; e=e.nextSibling) if (e.nodeType===1)
			tarea.value+='\t'.repeat(e.dataset.level)+e.textContent+'\n';
		try {
			document.body.appendChild(tarea);
			const selection = window.getSelection();
			selection.removeAllRanges();
			const range = document.createRange();
			range.selectNodeContents(tarea);
			selection.addRange(range);

			let success = document.execCommand('copy');
			selection.removeAllRanges();
			console.log(success ? "HTML copied via execCommand" : "Copy failed");
		} catch (err) {
			console.error("Copy operation failed: ", err);
		} finally {
			document.body.removeChild(tarea);
		}
	}
}

SCRIPT.value=async function (slide, elem, args) {
	console.log("=======================>",elem,args);
	const IC = new ICode(elem);
	if (args) {
		IC.command({ username: args, role: 'Admin' });
	} else {
		IC.syntax();
	}
	elem.addEventListener('click',(evt)=>{
		//IC.copy();
		IC.command({ username: 'Alice', role: 'Admin' });
	});
};


})(document.currentScript);
