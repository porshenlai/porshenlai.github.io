(function(SCRIPT){

function findParent (e,cs) {
	try {
		while (!e.matches(cs))
			e=e.parentNode;
	} catch(x) { return undefined; }
	return e;
}

class Quiz
{	// Quiz Plugin
	constructor (app)
	{
		this.QEs={};
		if (!document.head.querySelector('style[STYID="Quiz"]')) (() => {
			const SE=document.createElement("style"); // install style for Quiz
			SE.setAttribute('STYID','Quiz')
			SE.innerHTML=`
[X="Q"] select {
	font-size:100%;
}
[X="Q"] [qo] {
	padding:4px;
	margin:4px;
	border:2px solid lightgrey;
	background-image:linear-gradient(white 60%,lightgrey);
}
[X="Q"] [qo]:hover {
	border-color:grey;
	background-image:linear-gradient(white 60%,grey);
}
[X="Q"][qt] {
	border:2px solid blue;
	border-radius:8px;
	padding:8px;
	margin:2px 0;
}
[X="Q"][qr="x"] {
	border-color:red;
	background-image:linear-gradient(to right,white 60%,pink);
}
[X="Q"][qr="o"] {
	border-color:green;
	background-image:
	linear-gradient(to right,white 60%,lightgreen);
}
[X="Q"][qr='o'] :not(.QS)[qo] {
	display:none;
}
[X="Q"][qt]:not([qr='o']) .answer {
	display:none;
}
[X="Q"] :not([qo="value"]).QS {
	color:blue;
	font-weight:bolder;
}
`;
			document.head.appendChild(SE);
		})();

		// install utilities services of Quiz.
		if (app) app.Aside.installSetting((()=>{
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
		for (let k in this.QEs) {
			let q=this.QEs[k];
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
	install (e) {
		if (undefined===e._K_) e._K_=`${new Date().getTime().toString(36)}${Object.keys(this.QEs).length}`;
		if (e._K_ in this.QEs) return;

		this.QEs[e._K_]=e;

		if (!e._Q_on_click_) {
			e._Q_on_click_=(evt)=>{
				let v=findParent(evt.target,'[qo]');
				if (!v) return;
				if (v.getAttribute('qo')!=='value') {
					evt.preventDefault();
					evt.stopPropagation();
					this.answer(v);
				}
			}
			e.addEventListener('click',e._Q_on_click_);
		}
		if (!e._Q_on_change_) {
			e._Q_on_change_=(evt)=>{
				let v=evt.target.getAttribute('qo');
				if(v==='value') {
					evt.preventDefault();
					evt.stopPropagation();
					evt.target.classList.remove('QS');
					this.answer(evt.target,evt.target.value);
				}
			}
			e.addEventListener('change',e._Q_on_change_);
		}
		return this;
	}
	answer (e, v)
	{
		// locate the quiz block
		e=findParent(e,'[qo]');
		const p=findParent(e,'[X="Q"]');
		if (!p) return;
		const ANSWER=parseInt(this.QEs[p._K_].getAttribute("___"));

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
				if(!v) v=e.getAttribute('qo');
				p.setAttribute("qa",v); // fill in the reply
				if(ANSWER) p.setAttribute("qr",ANSWER===parseInt(v) ? 'o' : 'x');
			}
			break;
		case 'm':
			(()=>{
				e.classList.toggle('QS'); // toggle the flag of this answer
				const ans=[... p.querySelectorAll('.QS')].reduce((r,e)=>r|parseInt(e.getAttribute('qo')),0); // compute the selection mask
				p.setAttribute("qa",ans); // fill in the reply
				if(ANSWER) p.setAttribute("qr",ANSWER===ans ? 'o' : ((~ANSWER)&ans)>0 ? 'x' : '-');
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
				if(ANSWER) p.setAttribute(
					"qr",ANSWER===ans ? 'o' :
					 	ANSWER.toString().startsWith(ans.toString()) ? '-' : 'x'
				);
			})();
			break;
		}
	}
	mark () {
		// submit all the replied answers
		return [... this.E.querySelectorAll('[_K_]')].reduce((r,e)=>{
			r[e.getAttribute('_K_')]=e.getAttribute('qa');
			return r;
		},{});
	}
}

let H=undefined;
SCRIPT.value=async function (slide,elem) {
	if (!H) H=new Quiz(slide);
	H.install(elem);
};

})(document.currentScript);
