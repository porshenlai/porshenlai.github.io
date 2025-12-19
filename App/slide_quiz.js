(function(SCRIPT){

class Quiz
{	// Quiz Plugin
	constructor (e, ans)
	{	// (root element of Quiz, {... qi:qa})
		if (!document.head.querySelector('style[STYID="Quiz"]')) (() => {
			const SE=document.createElement("style"); // install style for Quiz
			SE.setAttribute('STYID','Quiz')
			SE.innerHTML=`
select {font-size:100%;}
[qo] {padding:4px; margin:4px; border:2px solid lightgrey;background-image: linear-gradient(white 60%,lightgrey);}
[qo]:hover {border-color:grey;background-image:linear-gradient(white 60%,grey);}
[qt] {border:2px solid blue;border-radius:8px;padding:8px;margin:2px 0;}
[qt][qr="x"] {border-color:red;background-image:linear-gradient(to right,white 60%,pink);}
[qt][qr="o"] {border-color:green;background-image:linear-gradient(to right,white 60%,lightgreen);}
[qt="s"][qa] :not(.QS)[qo] {display:none;}
[qt="m"][qa] [qo] {color:black;}
[qt="m"][qa] .QS[qo] {color:blue;font-weight:bolder;}
[qt]:not([qr='o']) .answer {display:none;}
[qt="sort"] .QS[qo] {color:blue;font-weight:bolder;}
`;
			document.head.appendChild(SE);
		})();
		if(e) this.install(e, ans);
		// install configuration menu
		window.App.Aside.installSetting((()=>{
			const E=document.createElement("div");
			E.setAttribute("SID","quiz:default");
			E.innerHTML=`
	QUIZ: <button action='downloadDLC'>下載數位學院CSV</button>
`;
			E.addEventListener('click',(evt)=>{
				for (let e=evt.target; e!==E; e=e.parentNode) {
					if (!e.hasAttribute('action')) continue;
					switch (e.getAttribute('action')) {
					case 'downloadDLC': this.downloadDLC(); break;
					}
					evt.stopPropagation();
					evt.preventDefault();
				}
			});
			return E;
		})());
	}
	saveCSV (aa) {
		const rst=aa.map((row)=>('"'+row.map((v)=>v.replaceAll('"','""')).join('","')+'"')).join('\n');
		((ae)=>{
			const url=URL.createObjectURL(new Blob([rst],{"type":"text/csv;charset:utf8"}));
			ae.href=url;
			ae.download='quiz.csv';
			document.body.appendChild(ae);
			ae.click();
			document.body.removeChild(ae);
			window.URL.revokeObjectURL(url);
		})(document.createElement('a'));
	}
	downloadDLC (tag='2025-0-1-0-0') {
		let table=[];
		for (let q of Array.from(this.E.querySelectorAll('[qt]'))) {
			// 題目類型(2:單選,3:複選,6:組合),
			// 答案({a:1},{b:2}),
			// 問題,
			// 選項(A||B@@1||2),
			// 說明,
			// 標籤(2025-0-3-0-0),
			// 難易度(3)
			let xq=q.cloneNode(true), qt=xq.getAttribute('qt'), xo, difficulty="3", explain="";
			xo=Array.from(xq.querySelectorAll('[qo]')).reduce((r,e)=>{
				r.push(e.textContent);
				e.parentNode.removeChild(e);
				return r;
			},[]).join(" || ");
			explain=Array.from(xq.querySelectorAll('.answer')).reduce((r,e)=>{
				r.push(e.innerHTML);
				e.parentNode.removeChild(e);
				return r;
			},[]).join("\n");
			table.push([
				qt==='m'?'3':'2',
				((a)=>{
					if (qt==='s') return a;
					let ta=[];
					for (let i=1,j=1; i<a; i*=2,j++)
						if ((a&i)>0) ta.push(j);
					return ta.join(',');
				})(xq.getAttribute('___')),
				xq.innerHTML.trim(), xo, explain, tag, difficulty
			]);
		}
		this.saveCSV(table);
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
			(()=>{
				e.classList.toggle('QS'); // toggle the flag of this answer
				const ans=[... p.querySelectorAll('.QS')].reduce((r,e)=>r|parseInt(e.getAttribute('qo')),0); // compute the selection mask
				p.setAttribute("qa",ans);
				if (this.AnsDB[qi]) // match the answer
					p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
			})();
			break;
		case 'sort':
			(()=>{
				let c=e.parentNode;
				e.classList.toggle('QS'); // toggle the flag of this answer
				if (e.classList.contains('QS'))
					c.insertBefore(e,c.querySelector('[qo]:not(.QS)'));
				else c.appendChild(e);
				const ans=parseInt(Array.from(c.querySelectorAll('[qo].QS')).reduce((r,e)=>{
					r.push(e.getAttribute('qo'));
					return r;
				},[]).join(''));
				p.setAttribute("qa",ans);
				if (this.AnsDB[qi]) // match the answer
					p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
			})();
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
