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

class PlayList {
	constructor (urls, canvas) {
		this.Rs=(Array.isArray(urls) ? urls : urls.split(/[;,\n]/)).map((u)=>({"U":u}));
		this.C=0;
		this.I=canvas;
		canvas.addEventListener('load',()=>{
			const container = canvas.parentNode, cr = container.getBoundingClientRect();
			const rec = this.Rs[this.C];
			[rec.O,rec.R] = canvas.width*cr.height > canvas.height*cr.width ?
				['width',100*cr.height*canvas.width/canvas.height/cr.width] :
				['height',100*cr.width*canvas.height/canvas.width/cr.height] ;
			canvas.style[rec.O]="100%";
			canvas.style[rec.O]=rec.R+"%";
			console.log(rec.R);
			canvas.style[rec.O==='width'?'height':'width']='auto';
			// container.style.overflow="";
		});
		this.go(0);
	}
	go (i) {
		this.C=i;
		this.I.src=this.Rs[i].U;
	}
}

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');
	if (!code) code=elem.innerHTML;
	elem.innerHTML="<div class='full centerBox'><img/><div class='full hide mask' style='position:absolute;background:rgba(127,127,127,0.5);'>MENU COME HERE</div></div>";
	elem.PlayList=new PlayList(code, elem.querySelector('img'));
	const container=elem.PlayList.I.parentNode;
	container.addEventListener("click",(evt)=>{
		for (let e=evt.target;e!==container;e=e.parentNode) if (e.dataset.h) {
			switch(e.dataset.h){
			default:
				console.log("Trigger:",e.dataset.h);
				break;
			}
			evt.stopPropagation();
			evt.preventDefault();
			return;
		}
		let mask=elem.querySelector('.mask');
		if (mask.classList.contains('hide')) {
			let lts=(mask.lts||0),cts=new Date().getTime();
			console.log(lts,cts,cts-lts);
			if (cts-lts<500) {
				mask.classList.remove('hide');
			} else mask.lts=cts;
		} else mask.classList.add('hide');
	});
};

})(document.currentScript);
