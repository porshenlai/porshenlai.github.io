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
	}
}

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	code=decodeArgs(code||elem);
	elem.classList.add('resolved','centerBox');
	elem.innerHTML=`
<div>
	VIDEO COMES HERE
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

	elem.PlayList=new PlayList(code, elem.querySelector('video')||elem.querySelector('audio'));
};

})(document.currentScript);
