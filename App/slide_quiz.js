(function(SCRIPT){

class Quiz
{	// Quiz Plugin
	constructor (e, ans)
	{	// (root element of Quiz, {... qi:qa})
		if (!document.head.querySelector('style[STYID="Quiz"]')) (() => {
			const SE=document.createElement("style"); // install style for Quiz
			SE.setAttribute('STYID','Quiz')
			SE.innerHTML=`
[qi] { border:2px solid blue;border-radius:8px;padding:8px;margin:8px 4px; }
[qo] { padding:4px; margin:4px; border:2px solid lightgrey;background-image: linear-gradient(white 60%,lightgrey); }
[qo]:hover { border-color:grey;background-image: linear-gradient(white 60%,grey); }
[qt][qr="x"] { border-color:red;background-image: linear-gradient(to right,white 60%,pink); }
[qt][qr="o"] { border-color:green;background-image: linear-gradient(to right,white 60%,lightgreen); }
[qt="s"][qa] :not(.QS)[qo] { display:none; }
[qt="m"][qa] [qo] { color:black; }
[qt="m"][qa] .QS[qo] { color:blue;font-weight:bolder; }
[qt]:not([qr='o']) .answer { display:none; }
`;
			document.head.appendChild(SE);
		})();
		if(e) this.install(e, ans);
	}
	install (e, ans) {
		this.E=e;
		this.AnsDB=ans||(()=>{ // search answers from document
			let e=document.body.querySelector('[AID]') || document.head.querySelector('[AID]');
			// if (b64 answer avaialbe) then (decode it) else (find json stringified answer)
			e=e ? atob(getAttribute('AID'))
				: ((e=document.body.querySelector('[ANS]') || document.head.querySelector('[ANS]'))&&e.getAttribute('ANS'));
			// if (stringified JSON available) then (parse it) else (collect answers from quiz)
			return e ? JSON.parse(e) : Array.from(this.E.querySelectorAll('[qt][___]')).reduce((r,e)=>{
				if (!e.hasAttribute('qi')) // if qi not exist then generate the qi
					e.setAttribute('qi',this.MaxQI ? (++this.MaxQI) : (this.MaxQI=1));
				r[e.getAttribute('qi')]=parseInt(e.getAttribute('___'));
				return r;
			},{});
		})();
		// console.log(btoa(JSON.stringify(this.AnsDB)));

		console.assert(this.E.querySelector('[qt]'),`
Usage:
	<div [qi='1'] qt='s' [___'1']>
		<qiv qo='1'>1</qiv><qiv qo='2'>2</qiv><qiv qo='3'>3</qiv><qiv qo='4'>4</qiv>
	</div>
	<div [qi='2'] qt='s' [___'1']>
		<select qo='value'><option>請選擇</option><option value='1'></option><option value='2'></option></select>
	</div>
	<div [qi='3'] qt='m' [___'5']>
		<qiv qo='1'>1</qiv><qiv qo='2'>2</qiv><qiv qo='4'>3</qiv><qiv qo='8'>4</qiv>
	</div>
`);
		this.E.addEventListener('click',(evt)=>{
			for (let e=evt.target;e&&e.hasAttribute;e=e.parentNode) {
				let v=e.getAttribute('qo');
				if(v&&v!=='value') {
					evt.preventDefault();
					evt.stopPropagation();
					this.answer(e,v);
					break;
				}
			}
		});
		this.E.addEventListener('change',(evt)=>{
			let v=evt.target.getAttribute('qo');
			if(v==='value') {
				evt.preventDefault();
				evt.stopPropagation();
				evt.target.classList.remove('QS');
				this.answer(evt.target,evt.target.value);
			}
		});
		return this;
	}
	answer (e,v)
	{
		// locate the quiz block
		let p; for(p=e;p.nodeType&&(!p.matches('[qt]'));p=p.parentNode); if(!p) return;
		const qi=p.getAttribute("qi");
		switch(p.getAttribute('qt')){
		case 's':
			if (e.classList.contains('QS')) {
				// click selected one, clear all
				[... p.querySelectorAll('.QS')].forEach((e)=>e.classList.remove('QS'));
				p.removeAttribute("qr");
				p.removeAttribute("qa");
			} else {
				// click new answer, clear all, then select this one
				[... p.querySelectorAll('.QS')].forEach((e)=>e.classList.remove('QS'));
				e.classList.add('QS');
				v=parseInt(v);
				if (this.AnsDB[qi]) // match the answer
					p.setAttribute("qr",this.AnsDB[qi]===v ? 'o' : 'x');
				p.setAttribute("qa",v); // fill in the selection
			}
			break;
		case 'm':
			e.classList.toggle('QS'); // toggle the flag of this answer
			const ans=[... p.querySelectorAll('.QS')].reduce((r,e)=>r|parseInt(e.getAttribute('qo')),0); // compute the selection mask
			p.setAttribute("qa",ans);
			if (this.AnsDB[qi]) // match the answer
				p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
			break;
		}
	}
	mark () {
		// submit all the replied answers
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
