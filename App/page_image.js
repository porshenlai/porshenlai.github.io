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

function fp2(v) {
	return Math.floor(v*100)/100;
}

class PlayList {
	constructor (urls, canvas) {
		this.Rs=(Array.isArray(urls) ? urls : urls.split(/[;,\n]/)).map((u)=>({"U":u}));
		this.C=0;
		this.I=canvas;
		canvas.addEventListener('load',()=>{
			const container = canvas.parentNode, cr = container.getBoundingClientRect();
			const rec = this.Rs[this.C];
			[rec.O,rec.R] = canvas.width*cr.height > canvas.height*cr.width ?
				[true, fp2(cr.height*canvas.width/canvas.height/cr.width-0.03)] :
				[false, fp2(cr.width*canvas.height/canvas.width/cr.height-0.03)] ;
			this.scale(1);
			//this.scale(rec.R);
		});
		this.go(0);
	}
	go (i) {
		this.C=i;
		this.I.src=this.Rs[i].U;
	}
	scale (v) {
		const container = this.I.parentNode, cr = container.getBoundingClientRect();
		const rec = this.Rs[this.C];
		switch (v) {
		case 'contain': v=1.0; break;
		case 'cover': v=rec.R; break;
		}
		if (rec.O) {
			this.I.style.width=(v*100)+"%";
			this.I.style.height='auto';
			container.style.overflow = v>rec.R ? 'auto' : v>1 ? 'auto hidden' : 'hidden';
			container.style.flexFlow = 'column nowrap';
		} else {
			this.I.style.height=(v*100)+"%";
			this.I.style.width='auto';
			container.style.overflow = v>rec.R ? 'auto' : v>1 ? 'hidden auto' : 'hidden';
			container.style.flexFlow = 'row nowrap';
		}
		return v;
	}
}

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');
	if (!code) code=elem.innerHTML;
	elem.innerHTML=`<div class='full centerBox'><img style='margin:auto;'/><div class='full hide mask' style='position:absolute;background:rgba(127,127,127,0.5);'>
	<div data-h='scale' style='background:white;'>
		<input type='range' min='0.5' max='2' step='0.1'></input>
		<div>
			<button data-h='scaleContain'>Contain</button>
			<button data-h='scaleCover'>Cover</button>
			<output type='number'></output>
		</div>
	</div>
</div></div>`;
	elem.PlayList=new PlayList(code, elem.querySelector('img'));
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
	const container=elem.PlayList.I.parentNode;
	container.addEventListener("click",(evt)=>{
		for (let e=evt.target;e!==container;e=e.parentNode) if (e.dataset.h) {
			switch(e.dataset.h){
			case 'scale': Scaler.set(Scaler.get()); break;
			case 'scaleContain': Scaler.set('contain'); break;
			case 'scaleCover': Scaler.set('cover'); break;
			}
			evt.stopPropagation();
			evt.preventDefault();
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
