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
section [DN="S"] * { margin-bottom:2vmin; }
section [DN="S"] *:hover { text-decoration:underline; }
section [DN="S"] .active { background:#ffd; border:2px solid orange; }
.hidden { display:none; }
.menu { color:blue; }
.sheet { color:red; }
.dialog { color:green; }
.settings { color:black; background:#eee; margin:0; }
.settings li, .settings li ul, .settings li ol { margin:0; }
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
