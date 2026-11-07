(function(SCRIPT){

// quiz_secret=practice

function csv_escape (s) { return s.replaceAll('"','""'); }

SCRIPT.value = class extends Apps.mod_template
{
	constructor (slide)
	{
		super(slide);
		this.Secret = Apps.Args.quiz_secret || 'practice';
		if (this.Secret!=='practice') console.log('Enter exam mode');
	}

	async hash_control (e, a)
	{	// security coding applied here
		if (!a) a = e.dataset.o;
 		const hash = Array.from(new Uint8Array(await crypto.subtle.digest(
			'SHA-256',
			(new TextEncoder()).encode(`${a}:${e.textContent}:${this.Secret}`)
		))).map(b => b.toString(32).padStart(2, '0')).join('');
		if (e.dataset.kh) return e.dataset.kh === hash;
		e.dataset.kh = hash;
	}

	async check_answer (qe)
	{
		let ans='QR-';

		if (true || this.Secret==='practice') {
			let r = true;
			switch (qe.dataset.qtype) {
			case 's':
				ans=qe.querySelector('.mod_quiz_answer.QS') ? 'QR' : 'QR-';
			case 'm':
				for (let oe of Array.from(qe.querySelectorAll('.mod_quiz_answer')))
					r &&= (await this.hash_control(oe, oe.classList.contains('QS') ? 'O' : 'X'));
				break;
			case 'sort':
				for (let oes=Array.from(qe.querySelectorAll('.mod_quiz_answer')), ix=0; ix<oes.length; ix++) {
					if (await this.hash_control(oes[ix], '-')) continue;
					r &&= (await this.hash_control(oes[ix], `${ix+1}`))
				}
				break;
			}
			ans = r ? 'QRO' : 'QRX';
		}
		const p=/QR?/;
		Array.from(qe.classList)
			.filter((s)=>p.exec(s))
			.forEach((s)=>qe.classList.remove(s));
		qe.classList.add(ans);
		return ans;
	}

	async init (elem, qtype)
	{
		if (elem.classList.contains('mod_quiz')) return;
		elem.classList.add('mod_quiz');
		elem.dataset.qtype = qtype;

		const args=(elem.dataset.xl||elem.dataset.x).split(':');
		if (args[1]==='c') return;

		// shuffle opotions
		let te=[],pe=[];
		for (let oe of Array.from(elem.querySelectorAll('[data-o]'))) {
			oe.dataset.h=`call:quiz:answer`;
			oe.classList.add('mod_quiz_answer');
			if (!oe.dataset.kh)
				await this.hash_control(oe);
			delete oe.dataset.o;
			te.push([Math.random(),oe.outerHTML]);
			pe.push(oe);
		}	
		te.sort((a,b)=>a[0]-b[0]);
		pe.forEach((oe,ix)=>(oe.outerHTML=te[ix][1]));
	}

	async configure (elem, ...args)
	{
		return `<ul>
	<li><button data-h='call:quiz:download:doc:DLC'>下載 DLC</button></li>
	<li><button data-h='call:quiz:download:doc:HTML'>下載 HTML</button></li>
	<li><button data-h='call:quiz:download:doc:JSON'>下載 JSON</button></li>
</ul>`;
	}

	async answer (elem)
	{
		const p=Apps.E(elem).trace('.mod_quiz');
		switch (p.dataset.qtype) {
		case 's':
			return await (async (set)=>{
				Array.from(p.querySelectorAll('.QS'))
					.forEach((e)=>e.classList.remove('QS'));
				if (set) elem.classList.add('QS');
				return await this.check_answer(p);
			})(!elem.classList.contains('QS'));
		case 'm':
			return await (async()=>{
				elem.classList.toggle('QS');
				return await this.check_answer(p);
			})();
		case 'sort':
			return await (async()=>{
				let c=elem.parentNode;
				elem.classList.toggle('QS'); // toggle the flag of this answer
				if (elem.classList.contains('QS'))
					c.insertBefore(elem,c.querySelector('[data-h]:not(.QS)'));
				else c.appendChild(elem);
				return await this.check_answer(p);
			})();
		}
	}

	async download (elme, target, format='DLC')
	{
		// <DLC Example>
		//	"1","1","YES or NO","","","0-0-0-0-0","3"
		//	"2","1","Pick One","A || B || C || D","","0-0-0-0-0","3"
		//	"3","1,2","Pick more than ONE","A || B || C || D","","1-0-0-0-0","3"
		switch(target) {
		case "slide":
			target = Apps.E(elem).trace('section');
			break;
		case "doc":
			target = document.body;
			break;
		default:
			target = target ? document.body.querySelector(target) : document.body;
			break;
		}

		let ext='csv',qs=''
		if (format === 'DLC') {
			const r = [];
			for (let e of Array.from(target.querySelectorAll('.mod_quiz'))) {
				if (e.dataset.qtype==='c' || e.dataset.qtype==='sort') continue;
				const [de,opts] = [e.cloneNode(true), {ot:[],ans:[]}];
				const os = Array.from(de.querySelectorAll('.mod_quiz_answer'))
				for (let x=0; x<os.length; x++) {
					opts.ot.push(os[x].textContent);
					if (await this.hash_control(os[x],'O')) opts.ans.push(x+1);
					os[x].parentNode.removeChild(os[x]);
				}
				r.push({
					"Q":de.innerHTML.trim(),
					"O":opts.ot,
					"A":opts.ans
				});
			}
			qs = r.map((q)=>{
				const Q=q.Q.replaceAll('"','""');
				if(q.A.length>1) // 3:多選
					return `"3","${q.A.join(',')}","${csv_escape(q.Q)}","${csv_escape(q.O.join(' || '))}","","0-0-0-0-0","3"`;
				else // 2:單選
					return `"2","${q.A[0]}","${csv_escape(q.Q)}","${csv_escape(q.O.join(' || '))}","","0-0-0-0-0","3"`;
			}).join('\n');
		} else if (format === 'HTML') {
			ext = 'html';
			qs = '';
			for (let page of Array.from(target.querySelectorAll('.mod_quiz')))
				qs += '<section>'+page.outerHTML+'</section>\n';
			qs = `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="/App/page.js"></script></head><body style='opacity:0'>\n${qs}</body></html>`;
		} else if (format === 'JSON') {
			ext = 'json';
			qs = Array.from(target.querySelectorAll('.mod_quiz')).reduce((qr,qe)=>{
				qr.push(Array.from(qe.querySelectorAll('.mod_quiz_answer.QS')).reduce((r,e)=>{
					r.push(e.dataset.kh);
					return r;
				},[]));
				return qr;
			},[]);
			qs = JSON.stringify(qs);
		}
		Apps.B(qs).download(
			window.prompt("請輸入檔名",(new Date()).toISOString()+"."+ext)
		);
	}
};

})(document.currentScript);
