(function(SCRIPT){

SCRIPT.value = class extends Apps.mod_template {
	async init (elem, url) {
		if (elem.classList.contains('mod_import')) return;
		elem.classList.add('mod_import');
		if (!url) {
			// TODO
		}
		const
			sp = Apps.E(elem).trace('section'),
			ur = Apps.R(URL.parse(sp.dataset.rbase)).resolve(url),
			ps = (await ur.fetch()).body,
			ns = [...ps.querySelectorAll('section')];
	
		Apps.changeRoot(ps, ur.getUB());
		sp.removeAttribute("id");
		Apps.Player.sync(ps);
		sp.parentNode.removeChild(sp);
		this.Slide.updateTOC();
		ns[0].click();
	}
};

})(document.currentScript);
