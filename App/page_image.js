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

let Scalar;

class PlayList {
	constructor (urls, panel) {
		this.Rs=urls;
		this.C=0;
		this.I=this.V=undefined;
		this.Panel=panel;
		this.go(0);
	}
	go (i) {
		if ('string'===typeof(i)) {
			if (i[0]==='+') i=Math.floor(this.C+parseFloat(i.substring(1)));
			else if (i[0]==='-') i=Math.floor(this.C-parseFloat(i.substring(1)));
			else if (i[0]==='*') i=Math.floor(this.C*parseFloat(i.substring(1)));
			else if (i[0]==='/') i=Math.floor(this.C/parseFloat(i.substring(1)));
			else i=parseInt(i);
		}
		this.C=i=(i+this.Rs.length)%this.Rs.length;
		((canvas, url)=>{
			while(canvas.firstChild) canvas.removeChild(canvas.firstChild);
			this.I=this.V=undefined;
			if(true){
				this.I=document.createElement("img");
				this.I.addEventListener('load',()=>this.resize());
				this.I.src=url;
				canvas.appendChild(this.I);
			}
		})(this.Panel.querySelector('[data-uid="canvas"]'), this.Rs[i].U);
		this.Panel.querySelector('[data-uid="pager"]').value=(1+this.C);
	}
	resize () {
		if(!this.I) return;

		const fp2=(v)=>Math.floor(v*100)/100,
			container = this.I.parentNode;
		((s)=>(s.width=s.height='100%'))(container.style);
		setTimeout(()=>{
			const rec = this.Rs[this.C],
				cr = container.getBoundingClientRect(),
				[iw,ih,cw,ch] = [this.I.width,this.I.height,cr.width,cr.height];
			[rec.O,rec.R] = iw*ch > ih*cw ? [true, fp2(ch*iw/ih/cw-0.03)] : [false, fp2(cw*ih/iw/ch-0.03)] ;
			console.log("Image resize:",rec);
			this.scale(Scalar.get());
		},1);
	}
	scale (v) {
		if(!this.I) return;

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
	elem.classList.add('resolved');

	code=decodeArgs(code||elem);
	elem.innerHTML=`<div style='position:relative;left:0;top:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;'>
	<div data-uid='canvas'></div>
	<div data-uid='control' style='position:absolute;left:0;top:0;width:100%;padding:2px 4px;opacity:0;'>
		<input data-h='scale' style='width:100%;' type='range' min='0.5' max='2' step='0.1'></input>
		<div class='row' style='justify-content:space-between;'>
			<span>
				<button data-h='prev'>&lt;</button>
				<output data-uid='pager' type='number' value='1'></output>
				<button data-h='next'>&gt;</button>
			</span>
			<span>
				Scale:<output data-uid='scalar' type='number' value='1'></output>
				<button data-h='scaleContain'>Contain</button>
				<button data-h='scaleCover'>Cover</button>
			</span>
		</div>
	</div>
</div>`;

	elem.PlayList=new PlayList(code, elem.firstChild);
	// Control Object: Scalar
	Scalar=new (class {
		constructor (es) { this.ES=es; this.set(1); }
		get () { return this.ES[0].value; }
		set (v) {
			v=elem.PlayList.scale(v);
			for (let e of this.ES) e.value=v;
		}
	})([
		elem.querySelector('input[type="range"]'),
		elem.querySelector('output[data-uid="scalar"]')
	]);
	// Install event handler
	const ctrl=elem.PlayList.Panel.querySelector('[data-uid="control"]');
	ctrl.addEventListener('mouseover',(evt)=>ctrl.style.opacity='1');
	ctrl.addEventListener('mouseout',(evt)=>ctrl.style.opacity='0');
	ctrl.addEventListener("click",(evt)=>{
		console.log("AAAAAAAAAAAAAAAAAAA");
		evt.stopPropagation();
		evt.preventDefault();
		for (let e=evt.target;e!==ctrl;e=e.parentNode) if (e.dataset.h) {
			switch(e.dataset.h){
			case 'scale': Scalar.set(Scalar.get()); break;
			case 'scaleContain': Scalar.set('contain'); break;
			case 'scaleCover': Scalar.set('cover'); break;
			case 'next': elem.PlayList.go('+1'); break;
			case 'prev': elem.PlayList.go('-1'); break;
			}
			return;
		}
/*
		let mask=elem.querySelector('.mask');
		if (mask.classList.contains('hide')) {
			let lts=(mask.lts||0),cts=new Date().getTime();
			if (cts-lts<500) mask.classList.remove('hide'); else mask.lts=cts;
		} else mask.classList.add('hide');
*/
	});
};

})(document.currentScript);
