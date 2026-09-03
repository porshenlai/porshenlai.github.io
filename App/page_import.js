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
	
	console.log(ur.getUB());
	Apps.changeRoot(ps, ur.getUB());
	sp.removeAttribute("id");
	slide.install(ps, sp);
	sp.parentNode.removeChild(sp);
	slide.updateTOC();
	ns[0].click();
/*
	let doc = await Apps.Ns.sync(code), s = Array.from(doc.querySelectorAll('section'));
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
*/
};

})(document.currentScript);
