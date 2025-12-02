(function(SCRIPT){

class Quiz
{	// Quiz Plugin
	constructor (e, ans)
	{	// (root element of Quiz, {... qi:qa})
		((SE) => { // install style for Quiz
			if (SE) return;
			SE=document.createElement("style");
			SE.innerHTML=`
[qi] { border:2px solid blue;border-radius:8px;padding:8px;margin:8px 4px; }
[qo] { padding:4px; margin:4px; border:2px solid lightgrey;background-image: linear-gradient(white 60%,lightgrey); }
[qo]:hover { border-color:grey;background-image: linear-gradient(white 60%,grey); }
[qt][qr="x"] { border-color:red;background-image: linear-gradient(to right,white 60%,pink); }
[qt][qr="o"] { border-color:green;background-image: linear-gradient(to right,white 60%,lightgreen); }
[qt="s"][qa] [qo] { display:none; }
[qt="s"][qa] .QS[qo] { display:block; }
[qt="m"][qa] [qo] { color:black; }
[qt="m"][qa] .QS[qo] { color:blue;font-weight:bolder; }
`;
			document.head.appendChild(SE);
		})(document.head.querySelector('style[STYID="Quiz"]'));
		if(e) this.install(e, ans);
	}
	install (e, ans) {
		this.E=e;
		this.AnsDB=ans||((ans)=>{
			//document.head.setAttribute("AID",btoa(JSON.stringify({ "1":3, "2-1":2, "3":2, "4":7 })));
			if (!ans)
				return Array.from(this.E.querySelectorAll('[qi][___]')).reduce((r,e)=>{
					r[e.getAttribute('qi')]=parseInt(e.getAttribute('___'));
					return r;
				},{});
			return JSON.parse(ans.getAttribute("ANS")||atob(ans.getAttribute("AID")));
		})(
			document.body.querySelector("[ANS]") ||
			document.body.querySelector("[AID]") ||
			document.head.querySelector("[AID]")
		);
		console.log(btoa(JSON.stringify(this.AnsDB)));
		this.E.addEventListener('click',(evt)=>{
			evt.stopPropagation();
			for(let e=evt.target;e&&e.hasAttribute;e=e.parentNode)
				if(e.hasAttribute('qo')) { this.answer(e); break; }
		});
		return this;
	}
	answer (e)
	{
		let p,qi;
		for(p=e;p.nodeType&&(!p.matches('[qi]'));p=p.parentNode);
		if(!p) return;
		qi=p.getAttribute("qi");
		switch(p.getAttribute('qt')||'s'){
		case 's':
			if (e.classList.contains('QS')) {
				[... p.querySelectorAll('.QS')].forEach((e)=>e.classList.remove('QS'));
				p.removeAttribute("qr");
				p.removeAttribute("qa");
			} else {
				[... p.querySelectorAll('.QS')].forEach((e)=>e.classList.remove('QS'));
				e.classList.add('QS');
				const ans=parseInt(e.getAttribute("qo"));
				if (this.AnsDB[qi])
					p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
				p.setAttribute("qa",ans);
			}
			break;
		case 'm':
			e.classList.toggle('QS');
			const ans=[... p.querySelectorAll('.QS')].reduce((r,e)=>r|parseInt(e.getAttribute('qo')),0);
			p.setAttribute("qa",ans);
			if (this.AnsDB[qi])
				p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
			break;
		}
	}
	mark () {
		return [... this.E.querySelectorAll('[qi]')].reduce((r,e)=>{
			r[e.getAttribute('qi')]=e.getAttribute('qa');
			return r;
		},{});
	}
}

SCRIPT.value=async function (slide) {
	const H=new Quiz();
	H.install(slide.Content);
	// .addEventListener('click',(evt)=>{ console.log(qz.mark()); });
	return H;
};

})(document.currentScript);
