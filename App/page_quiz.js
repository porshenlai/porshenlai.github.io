(function(SCRIPT){

function collect (body)
{
	return Array.from(body.querySelectorAll('.mod_quiz')).reduce((r,e)=>{
		if (e.dataset.qtype==='c' || e.dataset.qtype==='sort') return r;
		const de = e.cloneNode(true);
		const opts = Array.from(de.querySelectorAll('.mod_quiz_answer')).reduce((r,o,x)=>{
			r.ot.push(o.textContent);
			if (o.dataset.h.endsWith(':O')) r.ans.push(x+1);
			o.parentNode.removeChild(o);
			return r;
		},{ot:[],ans:[]});
		r.push({
			"Q":de.innerHTML.trim(),
			"O":opts.ot,
			"A":opts.ans
		});
		return r;
	},[]);
}

function download (body=document.body)
{
	console.log("download quiz");
	const qs=collect(body).map((q)=>{
		if(q.A.length>1) // 3:多選
			return `"3","${q.A.join(' || ')}","${q.Q}","${q.O.join(' || ')}","","2026-0-3-0-0","3"`;
		else // 2:單選
			return `"2","${q.A[0]}","${q.Q}","${q.O.join(' || ')}","","2026-0-3-0-0","3"`;
	});
	console.log(qs.join('\n'));
}

function verify (e, a, k)
{
	if (k) {

	}
	return e.dataset.h.endsWith(':'+a);
}

function check_answer (qe)
{
	const key = undefined;
	//const key = '-';
	let ans='QR-';
	switch (qe.dataset.qtype) {
	case 's':
		ans=qe.querySelector('.mod_quiz_answer.QS') ? 'QR' : 'QR-';
	case 'm':
		if (!key)
			ans = Array.from(qe.querySelectorAll('.mod_quiz_answer')).reduce((r,oe)=>{
				r&&=verify(oe, oe.classList.contains('QS') ? 'O' : 'X', key);
				return r;
			},true) ? 'QRO' : 'QRX';
		break;
	case 'sort':
		if (!key)
			ans = Array.from(qe.querySelectorAll('.mod_quiz_answer')).reduce((r,oe,ix)=>{
				if (verify(oe, '-', key)) return r;
				r&&=verify(oe, `${ix+1}`, key) 
				return r;
			},true) ? 'QRO' : 'QRX';
		break;
	}
	const p=/QR?/;
	Array.from(qe.classList)
		.filter((s)=>p.exec(s))
		.forEach((s)=>qe.classList.remove(s));
	qe.classList.add(ans);
	return ans;
}

function answer (e, v)
{
	const p=Apps.E(e).trace('.mod_quiz');
	switch (p.dataset.qtype) {
	case 's':
		return ((set)=>{
			Array.from(p.querySelectorAll('.QS'))
				.forEach((e)=>e.classList.remove('QS'));
			if (set) e.classList.add('QS');
			return check_answer(p);
		})(!e.classList.contains('QS'));
	case 'm':
		return (()=>{
			e.classList.toggle('QS');
			return check_answer(p);
		})();
		break;
	case 'sort':
		(()=>{
			let c=e.parentNode;
			e.classList.toggle('QS'); // toggle the flag of this answer
			if (e.classList.contains('QS'))
				c.insertBefore(e,c.querySelector('[data-h]:not(.QS)'));
			else c.appendChild(e);
			return check_answer(p);
		})();
		break;
	}
}

function install (xe)
{
	let args=(xe.dataset.xl||xe.dataset.x).split(':');
	if (args[1]==='c') return;

	// shuffle opotions
	let te=[],pe=[];
	Apps.E(xe).forEach('[data-o]',(oe)=>{
		oe.dataset.h=`call:quiz:answer:${oe.dataset.o}`;
		oe.classList.add('mod_quiz_answer');
		delete oe.dataset.o;
		te.push([Math.random(),oe.outerHTML]);
		pe.push(oe);
	});
	te=te.sort((a,b)=>a[0]-b[0]);
	pe.forEach((oe,ix)=>(oe.outerHTML=te[ix][1]));
}

class Quiz
{	// Quiz Plugin
	saveCSV (aa)
	{
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
	downloadDLC (tag='2025-0-1-0-0')
	{
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
			xo=Array.from(xq.querySelectorAll('[data-o]')).reduce((r,e)=>{
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

	async __sha256__ (str)
	{
    	const hashBuffer = await crypto.subtle.digest(
			'SHA-256',
			(new TextEncoder()).encode(str)
		);
    	return Array.from(new Uint8Array(hashBuffer));
	}

	__toHex__ (arr)
	{
    	return arr.map(b => b.toString(16).padStart(2, '0')).join('')
	}

	mark ()
	{
		// submit all the replied answers
		return [... this.E.querySelectorAll('[_K_]')].reduce((r,e)=>{
			r[e.getAttribute('_K_')]=e.getAttribute('qa');
			return r;
		},{});
	}
}

SCRIPT.value = class extends Apps.mod_template {
	async init (elem, qtype) {
		if (!elem.classList.contains('mod_quiz')) {
			elem.classList.add('mod_quiz');
			elem.dataset.qtype=qtype;
			install(elem);
		}
	}
	async answer (elem, ...args) {
		return answer(elem, args[0]);
	}
	async download (elme, ...args) {
		return download();
	}
};

})(document.currentScript);
