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
	constructor (urls, canvas) {
		this.Rs=urls;
		this.C=0;
		this.I=canvas;
		canvas.addEventListener('load',()=>this.resize());
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
		//this.I.src=this.Rs[i].U;
		//this.I.parentNode.parentNode.querySelector('[data-uid="pager"]').value=(1+this.C);
	}
}

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	code=decodeArgs(code||elem);
	elem.classList.add('resolved','centerBox');
	elem.innerHTML=`
<div>
	<video>
	</video>
	<div class='full hide mask'>
		<div style='background:white;bottom:95%;padding:1% 5%;border:1px solid silver;margin:1%;'>
			<div class='hbar'>
				<span>
					<button data-h='prev'>&lt;</button>
					<output data-uid='pager' type='number' value='1'></output>
					<button data-h='next'>&gt;</button>
				</span>
			</div>
		</div>
	</div>
</div></div>`;

	elem.PlayList=new PlayList(code, elem.querySelector('img'));
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
	const container=elem.PlayList.I.parentNode;
	container.addEventListener("click",(evt)=>{
		evt.stopPropagation();
		evt.preventDefault();
		for (let e=evt.target;e!==container;e=e.parentNode) if (e.dataset.h) {
			switch(e.dataset.h){
			case 'scale': Scalar.set(Scalar.get()); break;
			case 'scaleContain': Scalar.set('contain'); break;
			case 'scaleCover': Scalar.set('cover'); break;
			case 'next': elem.PlayList.go('+1'); break;
			case 'prev': elem.PlayList.go('-1'); break;
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
