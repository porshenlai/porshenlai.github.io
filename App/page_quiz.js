(function(SCRIPT){

function csv_escape (s)
{
	return s.replaceAll('"','""');
}

function to_hex (arr)
{
 	return arr.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sha256 (str)
{
 	const hashBuffer = await crypto.subtle.digest(
		'SHA-256',
		(new TextEncoder()).encode(str)
	);
 	return Array.from(new Uint8Array(hashBuffer));
}

SCRIPT.value = class extends Apps.mod_template {
	constructor (slide)
	{
		super(slide);
		this.Mode='study'; // study|exam
	}

	async init (elem, qtype)
	{
		if (elem.classList.contains('mod_quiz')) return;
		elem.classList.add('mod_quiz');
		elem.dataset.qtype=qtype;

		const args=(elem.dataset.xl||elem.dataset.x).split(':');
		if (args[1]==='c') return;

		// shuffle opotions
		let te=[],pe=[];
		Apps.E(elem).forEach('[data-o]',(oe)=>{
			oe.dataset.h=`call:quiz:answer:${oe.dataset.o}`;
			oe.classList.add('mod_quiz_answer');
			delete oe.dataset.o;
			te.push([Math.random(),oe.outerHTML]);
			pe.push(oe);
		});
		te=te.sort((a,b)=>a[0]-b[0]);
		pe.forEach((oe,ix)=>(oe.outerHTML=te[ix][1]));
	}

	verify (e, a, k)
	{
		if (k) {

		}
		return e.dataset.h.endsWith(':'+a);
	}
	check_answer (qe)
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
					r&&=this.verify(oe, oe.classList.contains('QS') ? 'O' : 'X', key);
					return r;
				},true) ? 'QRO' : 'QRX';
			break;
		case 'sort':
			if (!key)
				ans = Array.from(qe.querySelectorAll('.mod_quiz_answer')).reduce((r,oe,ix)=>{
					if (this.verify(oe, '-', key)) return r;
					r&&=this.verify(oe, `${ix+1}`, key) 
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
	async answer (elem, value)
	{
		const p=Apps.E(elem).trace('.mod_quiz');
		switch (p.dataset.qtype) {
		case 's':
			return ((set)=>{
				Array.from(p.querySelectorAll('.QS'))
					.forEach((e)=>elem.classList.remove('QS'));
				if (set) elem.classList.add('QS');
				return this.check_answer(p);
			})(!elem.classList.contains('QS'));
		case 'm':
			return (()=>{
				elem.classList.toggle('QS');
				return this.check_answer(p);
			})();
			break;
		case 'sort':
			(()=>{
				let c=elem.parentNode;
				elem.classList.toggle('QS'); // toggle the flag of this answer
				if (elem.classList.contains('QS'))
					c.insertBefore(elem,c.querySelector('[data-h]:not(.QS)'));
				else c.appendChild(elem);
				return this.check_answer(p);
			})();
			break;
		}
	}

	async download (elme, target)
	{
		// <DLC Example>
		//	"1","1","YES or NO","","","0-0-0-0-0","3"
		//	"2","1","Pick One","A || B || C || D","","0-0-0-0-0","3"
		//	"3","1,2","Pick more than ONE","A || B || C || D","","1-0-0-0-0","3"
		switch(target) {
		case "slide":
			target = Apps.E(elem).trace('section');
			break;
		case "global":
			target = document.body;
			break;
		default:
			target = target ? document.body.querySelector(target) : document.body;
			break;
		}

		const qs=Array.from(target.querySelectorAll('.mod_quiz')).reduce((r,e)=>{
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
		},[]).map((q)=>{
			const Q=q.Q.replaceAll('"','""');
			if(q.A.length>1) // 3:多選
				return `"3","${q.A.join(',')}","${csv_escape(q.Q)}","${csv_escape(q.O.join(' || '))}","","0-0-0-0-0","3"`;
			else // 2:單選
				return `"2","${q.A[0]}","${csv_escape(q.Q)}","${csv_escape(q.O.join(' || '))}","","0-0-0-0-0","3"`;
		});
		Apps.B(qs.join('\n')).download(
			window.prompt("請輸入檔名",(new Date()).toISOString()+".csv")
		);
	}
};

})(document.currentScript);
