(function(SCRIPT){

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');

	let doc = await Apps.getData(code), s = Array.from(doc.querySelectorAll('section'));
	if (s.length<1) {
		while (doc.body.firstChild)
			elem.appendChild(doc.body.firstChild);
	} else {
		let p=Apps.E(elem).trace('section'), r=p.nextSibling;
		s.forEach((e)=>{
			p.parentNode.insertBefore(e, r);
			// TODO sync page refereneces
			console.log('DEBUG',e,e.parentNode);
		});
	}
};

})(document.currentScript);
