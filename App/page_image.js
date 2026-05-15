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

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	if (!code){
		if (elem.querySelector('img')) return;
		code=elem.innerHTML;
	}
	code=code.split(/[;,\n]/);
	//fillContent(elem,code,'photo');

	elem.innerHTML=`<div style='overflow:hidden;height:100%;'>
	<img src='${code[0]}' style='object-fit:cover;width:auto;height:auto;'/>
	<div class='full hide mask' style='position:absolute;background:rgba(127,127,127,0.5);'>MENU COME HERE</div>
</div>`;
	((img)=>{
		const container=img.parentNode;
		img.addEventListener('load',()=>{
			const cr = container.getBoundingClientRect();
			const as = (img.width*cr.height > img.height*cr.width)
				? ['height','overflow-x']
				: ['width','overflow-y'] ;
 			img.style[as[0]]='100%';
			elem.style[as[1]]='auto';
		});
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
	})(elem.querySelector('img'));
};

})(document.currentScript);
