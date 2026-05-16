(function(SCRIPT){

// TO REMOVE {{{
const MENU=`
	<div class='full hide mask' style='position:absolute;background:rgba(127,127,127,0.5);'>MENU COME HERE</div>
`;

function fillContent(elem, url, type) {
	switch (type) {
	default: case "photo":
		elem.innerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><img src='${url}' style='object-fit:contain;width:100%;height:100%;'/>${MENU}</div>`;
		break;
	case "image":
		elem.innerHTML=`<div style='overflow:hidden;height:100%;'><img src='${url}' style='object-fit:cover;width:auto;height:auto;'/>${MENU}</div>`;
		((img)=>{
			img.addEventListener('load',()=>{
				const cr = DE.getBoundingClientRect();
				const as = (img.width*cr.height > img.height*cr.width)
					? ['height','overflow-x']
					: ['width','overflow-y'] ;
 				img.style[as[0]]='100%';
				elem.style[as[1]]='auto';
			});
		})(elem.querySelector('img'));
		break;
	case "object":
		elem.innerHTML=`<div style='overflow:hidden;display:flex;justify-content:center;align-items:center;height:100%;'><iframe src='${url}' style='width:100%;height:100%;'><a href='${url}'>Not support, download to open</a></iframe>${MENU}</div>`;
		break;
	}
	elem.classList.add('resolved');
}	// }}}

function decodeArgs (e)
{	// {{{
	if (e instanceof Element)
		e = e.textContent;
	if ('string' === typeof(e))
		e = e.split(/[;,\s]/).filter((e)=>e).map((u)=>({"U":u}));
	console.log("ARGS is ",e);
	return e;
}	// }}}


class PlayList {
	constructor (urls, canvas) {
		this.Rs=urls;
		this.C=0;
		this.I=canvas;
		canvas.addEventListener('load',()=>this.resize());
		this.go(0);
	}
	go (i) {
		this.C=i;
		this.I.src=this.Rs[i].U;
	}
	resize () {
		const fp2=(v)=>Math.floor(v*100)/100,
			container = this.I.parentNode;
		((s)=>(s.width=s.height='100%'))(container.style);
		setTimeout(()=>{
			const rec = this.Rs[this.C],
				cr = container.getBoundingClientRect(),
				[iw,ih,cw,ch] = [this.I.width,this.I.height,cr.width,cr.height];
			[rec.O,rec.R] = iw*ch > ih*cw ? [true, fp2(ch*iw/ih/cw-0.03)] : [false, fp2(cw*ih/iw/ch-0.03)] ;
			this.scale(1);
		},1);
	}
	scale (v) {
		const container = this.I.parentNode, rec = this.Rs[this.C];
		v = v==='contain' ? 1.0 : v==='cover' ? rec.R : v;
		if (rec.O) {
			this.I.style.width= v>1 ? ((v*100)+"%") : '100%';
			this.I.style.height='auto';
			container.style.overflow = v>rec.R ? 'auto' : v>1 ? 'auto hidden' : 'hidden';
			container.style.height = v>rec.R ? '100%' : 'auto';
			container.style.width = v>1 ? '100%' : ((v*100)+'%');
		} else {
			this.I.style.height= v>1 ? ((v*100)+"%") : '100%';
			this.I.style.width='auto';
			container.style.overflow = v>rec.R ? 'auto' : v>1 ? 'hidden auto' : 'hidden';
			container.style.width = v>rec.R ? '100%' : 'auto';
			container.style.height = v>1 ? '100%' : ((v*100)+'%');
		}
		container.scrollLeft=Math.floor((container.scrollWidth-container.clientWidth)/2);
		container.scrollTop=Math.floor((container.scrollHeight-container.clientHeight)/2);
		return v;
	}
}

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	code=decodeArgs(code||elem);
	elem.classList.add('resolved','centerBox');
	elem.innerHTML=`
<div>
	<img/>
	<div class='full hide mask'>
		<div data-h='scale' style='background:white;bottom:95%;padding:1% 5%;border:1px solid silver;margin:1%;'>
			<input style='width:100%;' type='range' min='0.5' max='2' step='0.1'></input>
			<div class='hbar'>
				<button data-h='scaleContain'>Contain</button>
				<button data-h='scaleCover'>Cover</button>
				<output type='number'></output>
			</div>
		</div>
	</div>
</div></div>`;

	elem.PlayList=new PlayList(code, elem.querySelector('img'));
	// Control Object: Scaler
	const Scaler=new (class {
		constructor (es) { this.ES=es; this.set(1); }
		get () { return this.ES[0].value; }
		set (v) {
			v=elem.PlayList.scale(v);
			for (let e of this.ES) e.value=v;
		}
	})([
		elem.querySelector('input[type="range"]'),
		elem.querySelector('output')
	]);
	// Install event handler
	const container=elem.PlayList.I.parentNode;
	container.addEventListener("click",(evt)=>{
		evt.stopPropagation();
		evt.preventDefault();
		for (let e=evt.target;e!==container;e=e.parentNode) if (e.dataset.h) {
			switch(e.dataset.h){
			case 'scale': Scaler.set(Scaler.get()); break;
			case 'scaleContain': Scaler.set('contain'); break;
			case 'scaleCover': Scaler.set('cover'); break;
			}
			return;
		}
		let mask=elem.querySelector('.mask');
		if (mask.classList.contains('hide')) {
			let lts=(mask.lts||0),cts=new Date().getTime();
			if (cts-lts<500) mask.classList.remove('hide'); else mask.lts=cts;
		} else mask.classList.add('hide');
	});
};

})(document.currentScript);
