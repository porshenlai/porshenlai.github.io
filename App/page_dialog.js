(function(SCRIPT){

let DialogDB={ };

function handleEvent (elem, cmd, arg1, arg2) {
	switch (cmd) {
	case 'alert':
		console.log(elem);
		alert(arg1);
		break;
	}
}

SCRIPT.value=async function (slide, elem, arg) {
	if (arg) {
		DialogDB[arg]=elem;
		elem.removeAttribute("data-x","data-xl");
		elem.parentNode.removeChild(elem);
	} else {
		arg = elem.innerHTML;
		if (!DialogDB[arg]) return;
		while(elem.firstChild) elem.removeChild(elem.firstChild);
		elem.appendChild(DialogDB[arg].cloneNode(true));
	}
};

})(document.currentScript);
