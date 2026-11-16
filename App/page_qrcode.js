(function(SCRIPT){

// https://cdn.jsdelivr.net/npm/marked/marked.min.js

SCRIPT.value = class extends Apps.mod_template {
	constructor (slide) {
		super(slide);
		this.QRCode = undefined;
	}
	async __init__ (elem) {
		if (this.QRCode) return;
		if (!window.QRCode)
			await Apps.loadScript (Apps.JSPrefix+'js/qrcode.min.js');
		this.QRCode = window.QRCode;
	}
	async init (elem, code) {
		if (elem.classList.contains('mod_qr')) return;
		elem.classList.add('mod_qr');

		if (!code)
			code = await Apps.Ns.resolve('data', elem).get();

		elem.innerHTML = await this.QRCode.toString(decodeURIComponent(code), { type: 'svg', margin: 1 });
	}
};

})(document.currentScript);
