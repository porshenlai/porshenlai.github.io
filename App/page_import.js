(function(SCRIPT){

SCRIPT.value=async function (slide, elem, url) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');

	if (!url) {
		// TODO
		console.log("TODO");
	}

	const
		sp = Apps.E(elem).trace('section'),
		ur = Apps.R(sp.rbase).resolve(url),
		ps = (await ur.fetch()).body,
		ns = [...ps.querySelectorAll('section')];
	
	Apps.changeRoot(ps, ur.getUB());
	sp.removeAttribute("id");
	Apps.Player.sync(ps);
	sp.parentNode.removeChild(sp);
	slide.updateTOC();
	ns[0].click();
};

})(document.currentScript);
