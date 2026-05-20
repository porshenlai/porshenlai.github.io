const Topics=[
	["例題一", 'MOS_MO201_1.html'],
	["例題二", 'MOS_MO201_2.html'],
	["例題三", 'MOS_MO201_3.html'],
	["例題EX", 'MOS_MO201_4.html']
];

((CSS)=>{
	if(CSS) return;
	CSS=document.createElement("style");
	CSS.innerHTML=`
body { font-size:2.5vmin; }
section { border:2px solid darkblue; padding:8px 1px; margin:8px; }
section [scope] { border:1px solid silver; padding:4px 4px; margin:2px; }
section [DN="S"] { color:black; background:#DDD; padding-top:12px; padding-bottom:12px; }
section [DN="S"] .active { background:#ffd; border:2px solid orange; }
.hidden { display:none; }
.sheet { color:red; }
.menu { background:white; color:darkgreen; border-radius:4px; margin:2px 4px; padding:4px; }
.dialog { background:white; color:blue; border-radius:4px; margin:4px; padding:4px; }
.dialog b { border:2px solid blue; margin:1px; padding:1px 4px; }
.dialog b:hover { border-color:red; }
.dialog .tab {
	border:2px solid black; border-bottom:0; padding:0 4px;
}
.dialog .input, .sheet .input { background:white; color:black; padding:4px 0; }
figure {
	background:white; color:black;
	border-radius:4px; border:solid; border-width:0 0 0 2px; margin:4px; padding:4px; }
figure>figcaption { margin:4px 0; padding:2px 0; color:blue; background:linear-gradient(#fff 0,#eef 85%,#00f 100%); }
figure>div { padding:4px 0; }
figure>div div { padding-left:32px; }
figure>div.tab {
	color:darkgreen; padding:0 8px;
	font-weight:bolder; background:linear-gradient(#0d0 0,#8f8 20%,#fff 100%); }
figure b { color:blue; border:2px solid blue; margin:1px; padding:1px 4px; }
figure b:hover { border-color:red; }
.settings { border:1px solid silver; background:white; color:black; border-radius:4px; margin:2px 4px; padding:4px; }
.settings li, .settings li ul, .settings li ol { margin:0; }
.settings i { color:darkgreen; text-decoration:underline; }
.settings .click { font-weight:bolder }
`;
	document.head.appendChild(CSS);
})(document.querySelector('link[UIE="IJCSS"]'));

((BE)=>{
	if(!BE) return;
	let cur=Topics.findIndex((i)=>location.pathname.endsWith(i[1]));
	BE.innerHTML=Topics.reduce(
		(r,v,i)=>r+`<option value='${v[1]}' ${i===cur?"selected":""}>${v[0]}</option>`,
		`<h1>${Topics[cur][0]}</h1><select class='hidden' size='${Topics.length}'>`
	)+'</select>';

	const se=BE.querySelector('select'), h1=BE.querySelector('h1');
	h1.addEventListener('click',(evt)=>{
		se.classList.toggle("hidden");
	});
	se.addEventListener('change',(evt)=>{
		location.replace(se.value);
	});
})(document.querySelector('[UIE="PATH"]'));

Array.from(document.querySelectorAll('[DN="S"]'))
.forEach((SE)=>{
	SE.addEventListener("click",(evt)=>{
		let e,i,cancel=false;
		for (e=evt.target; e.parentNode&&e.parentNode!=SE; e=e.parentNode);
		if (!e.parentNode) return;
		if (e.classList.contains("active")) cancel=true;
		for (i=e.parentNode.firstChild; i; i=i.nextSibling)
			if(i.classList) i.classList.remove("active");
		if (!cancel) e.classList.add("active");
	});
});

Array.from(document.querySelectorAll('[DN="Q"]'))
.forEach((QE)=>{
	QE.addEventListener("click",(evt)=>{
		QE.classList.toggle("active");
		evt.stopPropagation();
	});
});
