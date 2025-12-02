(function(SCRIPT){

class Cards
{	
	constructor (E) {
		if (!document.head.querySelector('style#FlashCardStyle'))
			document.head.appendChild(((E) => {
				// {{{
				E.id="FlashCardStyle"
				E.innerHTML=`
.flashcard {
  background-color: transparent;
  width: 300px;
  height: 200px;
  border: 1px solid #f1f1f1;
  perspective: 1000px; /* This is the 3D space */
}
.flashcard .front,.flashcard .back {
  position: absolute;
  backface-visibility: hidden;
  width: 100%;
  height: 100%;
}
.flashcard .front {
  background-color: #bbb; color: black;
}
.flashcard .back {
  background-color: #2980b9; color: white;
  transform: rotateX(180deg);
}
.flashcard>div {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
}
.flashcard>div.flipped {
  transform: rotateX(180deg);
}
`;
				return E;
				// }}}
			})(document.createElement("style")));
		if (E) this.install(E); else this.RE=undefined;
	}
	install (E) {
		this.RE=E;
		Array.from(E.querySelectorAll('.flashcard'))
		.forEach((E) => {
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
				if (e.classList.contains('flashcard')) {
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
			Array.from(this.RE.querySelectorAll('.flashcard'))
			.forEach((e)=>e.classList.add('flipped'));
			break;
		case false:
			Array.from(this.RE.querySelectorAll('.flashcard'))
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
