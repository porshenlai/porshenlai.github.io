(function(SCRIPT){

//	<div style='display:flex;flex-flow:row wrap;gap:1vw 2%;'>
//		<div data-x='card' style='width:32%;padding-top:32%;'>
//			<div class='front'> 正面 </div>
//			<div class='back'> 背面 </div>
//		</div>
//	</div>

SCRIPT.value = class extends Apps.mod_template {
	async flip (elem, ...args) {
		const e=Apps.E(event.target).trace('.mod_card>div');
		if (e) e.classList.toggle('flipped');
	}
	async __init__ (elem) {
		if (elem.classList.contains('mod_card')) return;

		elem.classList.add('mod_card');
		const bc=elem.querySelector('.back');
		const inner=((e)=>{ // add flip layer
			if (e===elem){
				e=document.createElement("div");
				while (elem.firstChild) e.appendChild(elem.firstChild);
				elem.appendChild(e);
			}
			return e;
		})(bc.parentNode);
		elem.dataset.h = 'call:card:flip';
	}
	async init (elem, ...args) {
		elem.classList.remove('flipped'); // remove, toggle
	}
};

})(document.currentScript);
