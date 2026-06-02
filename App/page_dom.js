(function(SCRIPT){

function handleEvent (elem, cmd, arg1, arg2) {
	switch (cmd) {
	case 'alert':
		console.log(elem);
		alert(arg1);
		break;
	}
}

SCRIPT.value=async function (slide, elem, args) {
	if (!elem) return handleEvent(slide, ...args);

	if (elem.classList.contains('resolved')) return;
	((nv)=>{
		if(!nv) return;
		while(elem.firstChild) elem.removeChild(elem.firstChild);
		nv.classList.remove('hide');
		elem.appendChild(nv);
	})(elem.querySelector('.hide'))
	elem.classList.add('resolved','centerBox');
};

})(document.currentScript);
