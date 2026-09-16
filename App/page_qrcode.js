(function(SCRIPT){

// https://cdn.jsdelivr.net/npm/marked/marked.min.js
const Init=(async () => {
	await window.Apps.loadScript (window.Apps.JSPrefix+'js/qrcode.min.js');
	return QRCode;
})();

SCRIPT.value=async function (slide, elem, code) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');

	if (!code)
		code = await Apps.Ns.resolve('data', elem).get();

	elem.innerHTML='';
	(await Init).toString(decodeURIComponent(code), { type: 'svg', margin: 1 })
		.then(svgString => { elem.innerHTML = svgString; })
		.catch(err => { console.error("Failed to generate QR Code:", err); });
};

})(document.currentScript);
