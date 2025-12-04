(function(SCRIPT){

class Cards
{	
	constructor (E) {
		if (!document.head.querySelector('style[STYID="Card"]'))
			(()=>{
				const SE=document.createElement("style");
				SE.setAttribute('STYID','Card');
				SE.innerHTML=`
.card {background-color:transparent;width: 30%;height: 0;padding-top:30%;border:1px solid #f1f1f1;perspective:1000px;}
.card .front,.card .back {position:absolute;width:100%;height:100%;overflow:hidden auto;backface-visibility:hidden;}
.card .front {background-color:#bbb;color:black;}
.card .back {background-color:#2980b9;color:white;transform:rotateX(180deg);}
.card>div {position:absolute;left:0;top:0;width:100%;height:100%;text-align:center;transition:transform 0.6s;transform-style:preserve-3d;box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);}
.card>div.flipped {transform: rotateX(180deg);}
`;
				document.head.appendChild(SE);
			})();
		if (E) this.install(E); else this.RE=undefined;
	}
	list (E) {
		const rs=Array.from(E.querySelectorAll('.card'));
		console.assert(rs.length>0,`
Usage:
	<div style='display:flex;flex-flow:row wrap;gap:1vw 2%;'>
		<div class='card' style='width:32%;padding-top:32%;'>
			<div class='front'> 正面 </div>
			<div class='back'> 背面 </div>
		</div>
	</div>
`);
		return rs;
	}
	install (E) {
		this.RE=E;
		this.list(E).forEach((E) => {
			const bc=E.querySelector('.back');
			const inner=((e)=>{
				if (e===E){
					e=document.createElement("div");
					while (E.firstChild) e.appendChild(E.firstChild);
					E.appendChild(e);
				}
				return e;
			})(bc.parentNode);
		});
		E.addEventListener('click', (evt) => {
			for (let e=evt.target;e&&e.classList;e=e.parentNode)
			{
				if (e.classList.contains('card')) {
					this.flip(e.querySelector('div'));
					evt.stopPropagation();
				}
			}
		});
		this.flip(true);
		return this;
	}
	flip (e) {
		switch (e) {
		case true:
			Array.from(this.RE.querySelectorAll('.card'))
			.forEach((e)=>e.classList.add('flipped'));
			break;
		case false:
			Array.from(this.RE.querySelectorAll('.card'))
			.forEach((e)=>e.classList.remove('flipped'));
			break;
		case undefined:
			break;
		default:
			e.classList.toggle('flipped');
			break;
		}
	}
}

SCRIPT.value=async function (slide) {
	const H=new Cards();
	H.install(slide.Content);
	return H;
};

})(document.currentScript);
