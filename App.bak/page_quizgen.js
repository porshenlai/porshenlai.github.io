((SE)=>{
	const shuffle = (a)=>a.map((e)=>[Math.random(),e]).sort((a,b)=>a[0]-b[0]).map((e)=>e[1]);
	const toHex = (a)=>a.map(b => b.toString(16).padStart(2, '0')).join('');

	function saveCSV (aa) {
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

	async function sha256 (str) {
    	const hashBuffer = await crypto.subtle.digest(
			'SHA-256',
			(new TextEncoder()).encode(str)
		);
    	return Array.from(new Uint8Array(hashBuffer));
	}

	class Quiz {
		downloadDLC (tag='2026-0-1-0-0') {
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
				let xq=q.cloneNode(true), qt=xq.dataset.x.substring(5), xa=[], xo, difficulty="3", explain="";
				xo=shuffle(Array.from(xq.querySelectorAll('[data-o]'))).reduce((r,e,i)=>{
					r.push(e.textContent);
					if (e.dataset.o==='O') xa.push(i);
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
					xa.join(','),
					xq.innerHTML.trim(), xo, explain, tag, difficulty
				]);
			}
			saveCSV(table);
		}
	};

	SE.value=async function (content) {
		console.log("Quiz.Gen");
		const CE=[];
		function aq(C,e) {
			const se=document.createElement("section")
			se.appendChild(e);
			C.push(se);
			return C;
		}
		Array.from(content.querySelectorAll('[data-x^="quiz:c"]')).reduce(aq, CE);
		Array.from(content.querySelectorAll('[data-x^="quiz:"]')).reduce(aq, CE);
		Array.from(content.querySelectorAll('section')).forEach((e)=>content.removeChild(e));
		CE.forEach((e)=>content.appendChild(e));

		// install utilities services of Quiz. 
/*
		if (app) app.Aside.installSetting((()=>{
			const E=document.createElement("div");
			E.innerHTML=`<div data-uid="aside:Settings:Quiz">
	<label>QUIZ</label>
	<div class='Options'>
		<button data-h='downloadDLC'>下載數位學院CSV</button>
	</div>
</div>`;
			E.addEventListener('click',(evt)=>{
				for (let e=evt.target; e!==E; e=e.parentNode) {
					switch (e.dataset.h) {
					case 'downloadDLC':
						this.downloadDLC();
						break;
					}
					evt.stopPropagation();
					evt.preventDefault();
				}
			});
			return E;
		})());
*/
	};
})(document.currentScript);
