(function(){

const currentScript = document.currentScript;

async function loadScript (src,attrs={})
{	// {{{
	const se=document.createElement("script"),
	      rv=new Promise((or,oe)=>se.addEventListener("load",()=>or(se.value)));
	for(let key in attrs) se.setAttribute(key,attrs[key]);
	se.src=src;
	document.head.appendChild(se);
	return rv;
}	// }}}

const Plugins={
	"math":async function(){ // {{{
    	window.MathJax = {
        	tex: {
            	inlineMath: [['$', '$'], ['\\(', '\\)']],
            	displayMath: [['$$', '$$'], ['\\[', '\\]']]
        	}
    	};
		await loadScript(
			'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
			{'async':true}
		);
		return {};
	}	// }}}
};	// Built-in Plugins

class Aside
{	// Aside tutorial bar
	constructor (RE=document.body, CB={})
	{	// {{{
		this.RE=RE;

		((E)=>{ // create panel-overlay (mask) {{{
			E.addEventListener('click', (evt) => this.close());
			((S)=>{
				// [CSS] position:fixed; top:0; left:0; right:0; bottom:0;
				S.position="fixed";
				S.top=S.left=S.right=S.bottom=0;
				// [CSS] background:rgba(0,0,0,0.4); z-index:10001;
				S.background="rgba(0,0,0,0.4)";
				S.zIndex=10001;
				// [CSS] transition:opacity 0.3s ease, visibility 0.3s;
				S.transition="opacity 0.3s ease, visibility 0.3s";
			})(E.style);
			RE.appendChild(E);
		})(this.Overlay=document.createElement('div')); // }}}

		((E) => { // Aside bar {{{
			E.setAttribute("current","toc");
			E.innerHTML=`
<style>
aside {position:fixed;top:0;right:0;bottom:0;width:640px;max-width:80vw;font-size:24px;background:#fff;border-left:1px solid #eee;box-shadow:-2px 0 10px rgba(0,0,0,0.1);z-index:10002;transform:translateX(100%);transition:transform 0.3s ease;display:flex;flex-flow:column nowrap;justify-content:space-between;align-items:center;}
aside button {font-size:24px;border-radius:12px;padding:4px 12px;}
aside ol {list-style:none;padding:0;margin:0;}
aside li {margin: 4px 0;}
aside a {color:#0d5ea8;text-decoration:none;display:block;padding:6px 10px;border-radius:6px;font-size:20px;}
aside a:hover {background-color:#f0f5fa;}
aside a.active {font-weight:700;background-color:#e3f2fd;}
[current="settings"] [tab="toc"], [current="toc"] [tab="settings"] {display:none;};
[tab="toc"], [tab="settings"] {flex:1;overflow-y:auto;padding:1rem;}
</style>
<div style="padding:0.5rem 1rem;border-bottom:1px solid #eee;width:100%;">
	<h3 style="margin:0;color:#0d5ea8;white-space:nowrap;">
		[<input type='checkbox' action="fsToggle" style='width:24px;height:24px;'></input>]
		<button tab="settings" action="showTOC">導覽</button>
		<span tab="settings">設定</span>
		<span tab="toc">導覽</span>
		<button tab="toc" action="showSettings">設定</button>
	</h3>
</div>
<div style="flex:1 1 auto;overflow-y:auto;width:100%;padding:32px;">
	<nav tab="toc"><ol></ol></nav>
	<div tab="settings">
		<div style='display:flex;justify-content:space-between;align-items:flex-start;'>
			<label style="color:#222;font-size:20px;">字型大小</label>
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<button action="fontDecreaseBtn" title="縮小字型">-</button>
				<span action="fontDisplay">100%</span>
				<button action="fontIncreaseBtn" title="放大字型">+</button>
			</div>
		</div>
	</div>
</div>
<div style="padding:0.5rem 1rem;border-top:1px solid #eee;background:#fcfcfc;width:100%;display:flex;flex-flow:row nowrap;justify-content:space-between;">
	<span style='width:0px;overflow:display;white-space:nowrap;'>© 2025 Porshen Lai</span>
	<span style='background:#fff;gap:10px;'>
		<button action="prevBtn" title="上一節 Prev (←)">←</button>
		<span uid="counter" style='{font-size:20px;color:#666;width:100%;text-align:center;}'></span>
		<button action="nextBtn" title="下一節 Next (→)">→</button>
	</span>
</div>`;
			E.addEventListener('click', (evt) => {
				let e = evt.target;
				switch(e.getAttribute("action")){
				case "fsToggle": if(CB.fullscreen) CB.fullscreen(e.checked); break;
				case "prevBtn": if (CB.activate) CB.activate(-1); break;
				case "nextBtn": if (CB.activate) CB.activate(1); break;
				case "fontDecreaseBtn":
					if (CB.applyFontScale) CB.applyFontScale(-0.05);
					break;
				case "fontIncreaseBtn":
					if (CB.applyFontScale) CB.applyFontScale(0.05);
					break;
				case "showTOC":
					this.E.setAttribute("current","toc");
					break;
				case "showSettings":
					this.E.setAttribute("current","settings");
					break;
				default:
					if (e.hasAttribute("data-index")) {
						evt.preventDefault();
						console.log("CLICK",CB.activate,e);
						if (CB.activate) CB.activate(0,parseInt(e.dataset.index, 10));
						this.close();
					}
					break;
				}
				evt.stopPropagation();
			});
			this.Overlay.appendChild(E);
			return E;
		})(this.E=document.createElement("aside")); // }}}

		this.close();
	}	// }}}
	update (index, total)
	{	// update status information {{{
		this.E.querySelector('[uid="counter"]').textContent=(index+1)+' / '+total;
		this.E.querySelector('[action="prevBtn"]').disabled=(index===0);
		this.E.querySelector('[action="nextBtn"]').disabled=(index===total-1);
		Array.from(this.E.querySelectorAll('[tab="toc"]>ol a'))
			.forEach((link, i) => link.classList.toggle('active', i === index));
	}	// }}}
	installTOC (sections)
	{	// install TOC table {{{
		const tl=this.E.querySelector('[tab="toc"]>ol');
		sections.forEach((sec, idx) => {
			const h = sec.querySelector('h1') || sec.querySelector('h2');
			const title = h ? h.textContent.trim() : `Slide ${idx + 1}`;
			const li = document.createElement('li');
			while (li.firstChild) li.removeChild(li.firstChild);
			const a = document.createElement('a');
			a.href = '#' + sec.id;
			a.textContent = title;
			a.dataset.index = idx;
			li.appendChild(a);
			tl.appendChild(li);
		});
	}	// }}}
	open ()
	{	// launch aside bar {{{
		// if (document.fullscreenElement) document.exitFullscreen();
	
		((S)=>{
			// [CSS] opacity:1; visiblity:visible;
			S.opacity=1;
			S.visibility="visible";
		})(this.Overlay.style);
		// [CSS] transform: translateX(0);
		this.E.style.transform="translateX(0)";
	}	// }}}
	close ()
	{	// hide aside bar {{{
		((S)=>{
			// CSS: { opacity:0; visiblity:hidden; }
			S.opacity=0;
			S.visibility="hidden";
		})(this.Overlay.style);
		// [CSS] transform: translateX(100%);
		this.E.style.transform="translateX(100%)";
	}	// }}}
	toggle ()
	{	// toggle aside bar {{{
		this["hidden" === this.Overlay.style.visibility ? "open" : "close"]();
	}	// }}}
}

class Slides
{
	constructor (RE)
	{	// {{{
		this.current=-1;
		this.fontScale=1.0;

		(()=>{ // install style {{{
			const S=document.createElement("style")
			const PAGE=`
:root {--base-font-size:24px;}
* {box-sizing:border-box;}
html {font-size:var(--base-font-size);scroll-behavior:smooth;}
html, body {height:100%;}
body {margin:0;font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,-apple-system,Segoe UI,Arial;color:#222;background:#fff;line-height:1.6;display:flex;flex-direction:column;}
`;
			const SECTION=`
#content {flex:1;padding:0;overflow:hidden auto;background:#f0f0f0;}
#content section {margin:1.5rem 1rem 1.5rem 1rem;scroll-snap-align:none;background:white;}
#content[playmode="page"] {margin:0;border:0;padding:0;overflow:hidden;scroll-snap-type:y mandatory;}
#content[playmode="page"] section {margin:0.5rem;height:calc(100% - 1rem);min-height:calc(100% - 1rem);padding:1.25rem;croll-snap-align:start;overflow-y:auto;scroll-margin-top:0.5rem;}
section {margin:1.75rem 0 2.25rem 0;padding:1.25rem;border:2px solid #e6e6e6;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.03);transition:border-color 0.4s ease,box-shadow 0.4s ease,background-color 0.4s ease;cursor:pointer;scroll-margin-top:1.5rem;}
section:hover {border-color:#ccc;}
section.current-section {border-color:#26A69A;background-color:#f6fffd;box-shadow:0 4px 16px rgba(38, 166, 154, 0.2);cursor:default;}
`;
			const BASIC=`
.title {font-size:clamp(1.75rem, 4vw, 2.5rem);font-weight:800;margin:0 0 0.375rem 0;color:#1E88E5;}
.subtitle {font-size:clamp(1rem, 2.4vw, 1.25rem);color:#666;margin:0;}
.frame {margin:16px 4px;padding:8px;border:2px dashed silver;border-radius:8px;background:#F0FFF0;}
h2 {margin:0 0 0.625rem 0;font-size:1.375rem;color:#1E88E5;}
h3 {margin:0.625rem 0;font-size:1.125rem;color:#0d5ea8;}
ul, ol {margin:8px 0 8px 22px;}
button {appearance:none;border:1px solid #cfd8dc;background:#fff;padding:8px 12px;border-radius:10px;cursor:pointer;font-size:95%;}
button:hover {border-color:#90a4ae;}
#content[playmode="page"] section.cm { display:flex;flex-flow:column nowrap;align-items:center;justify-content:center;}
#content[playmode="page"] section.full { margin:0;padding:0;border:0;height:100%;scroll-margin-top:0; }
`;
			S.innerHTML=PAGE+SECTION+BASIC;
			document.head.appendChild(S);
		})(); // }}}
		
		(()=>{ // Content {{{
			const content=this.Content=RE.querySelector('#content');
			content.insertBefore(((s)=>{
				const code=`
.cb { white-space: nowrap; padding-left:48px; font-weight:bolder; overflow-x:auto; }
.fxl { display:flex;align-items:center;justify-content:flex-start; }
`;
				s.innerHTML=`
`;
				s.innerHTML+=code;
				return s;
			})(document.createElement("style")),content.firstChild);
			content.addEventListener('click', (evt) => {
				let e=evt.target, s;
				for (s=e;s&&s.tagName!=="SECTION";s=s.parentNode);
				if (s&&s.tagName==="SECTION")
					this.activate(parseInt(s.getAttribute("data-index"),10));
			});
			content.addEventListener('scrollend', (evt) => { // auto activate page when current slide out of viewport
				let i,x=this.Content.getBoundingClientRect().height/3;
				for (i=0;i<this.Sections.length;i++) {
					const eb=this.Sections[i].getBoundingClientRect();
					if ((eb.y+eb.height)>x) break;
				}
				this.activate(i,true);
			});
		})(); // }}}

		this.Sections=Array.from(this.Content.querySelectorAll('section'));
		this.Sections.forEach((sec, idx) => {
			if (!sec.hasAttribute("data-index"))
				sec.setAttribute("data-index",idx);
			sec.id=`s${idx+1}`
		});

		this.Aside=new Aside(document.body, {
			"activate": (v,av) => this.activate(v?this.current+parseInt(v):av),
			"fullscreen": (mode) => {
				if (mode) {
					if(!document.fullscreenElement) document.body.requestFullscreen();
				} else if(document.fullscreenElement) document.exitFullscreen();
			},
			"applyFontScale": (scale) => this.applyFontSize(this.fontScale + scale)
		});
		this.Aside.installTOC(this.Sections);

		this.Plugins={};

		((E)=>{ // Launch PAD {{{
			E.id="control-panel";
			E.innerHTML=`
<style>
#control-panel {position:fixed;bottom:0;left:0;display:flex;flex-flow:row wrap;width:150px;padding:10px;z-index:10000;pointer-events:none;}
#control-panel [action] {width:50px;height:50px;margin:5px;display:flex;justify-content:center;align-items:center;background-color:#3498db;color:white;font-weight:bold;font-size:20px;border-radius:5px;user-select:none;cursor:pointer;pointer-events:auto;}
#control-panel>[action="none"] {background:rgba(0,0,0,0);border:1px solid silver;}
#control-panel:not(.active) :not([action="none"]) {display:none;}
</style>
<div action="prev">◀</div>
<div action="menu">☰</div>
<div action="none"></div>
<div action="next">▶</div>
`;
			E.addEventListener('mouseover',(evt)=>E.classList.add('active'));
			E.addEventListener('click',(evt)=>{
				const func=evt.target.getAttribute('action');
				switch(func){
				case 'none':
					E.classList.toggle('active');
					break;
				case 'menu':
					E.classList.remove('active'); this.Aside.open(); break;
				case 'prev':
					E.classList.remove('active'); this.activate(this.current-1); break;
				case 'next':
					E.classList.remove('active'); this.activate(this.current+1); break;
				default:
					return;
				}
				evt.preventDefault();
			});
			this.Content.appendChild(E);
		})(document.createElement("div")); // }}}

		this.TickHandlers={};
		setInterval(()=>{ for(let n in this.TickHandlers) this.TickHandlers[n](); },1000)
	}	// }}}

	activate (index, smooth = true)
	{	// activate the index-th section {{{
		if (index < 0 || index >= this.Sections.length || index === this.current)
			return; // Prevent invalid or redundant calls

		this.current=index;
		if (this.Aside)
			this.Aside.update(index, this.Sections.length);

		this.Sections.forEach((sec, i) => sec.classList.toggle('current-section', i === index));
			
		// Update URL hash and scroll into view
		const section = this.Sections[index];
		if (history.replaceState)
			history.replaceState(null, null, '#' + section.id);
		else location.hash = '#' + section.id;

		setTimeout(()=>{
			section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
			section.scrollTop=0;
		},0);
	}	// }}}
	applyFontSize (scale)
	{	// apply font size {{{
		const DEFAULT_FONT_SIZE=((w,h)=>w>h ? Math.floor(h/26) : Math.floor(w/30))(window.innerWidth,window.innerHeight);
		if(scale) this.fontScale = Math.max(0.8, Math.min(1.5, scale));
		document.documentElement.style.setProperty(
			'--base-font-size',
			`${DEFAULT_FONT_SIZE * this.fontScale}px`
		);
		this.Aside.E.querySelector('[action="fontDisplay"]').textContent = `${Math.round(this.fontScale * 100)}%`;
	}	// }}}

	set (name, value) {
		switch (name) {
		case 'pagemode':
			this.Content.setAttribute("playmode",value ? "page" : "continuous");
		}
	}
	regTickHandler (name, handler)
	{	// (un)schedule a tick callback {{{
		if(handler) this.TickHandlers[name]=handler;
		else delete this.TickHandlers[name];
	}	// }}}
	async install (name, handler)
	{	// install page plugin {{{
		this.Plugins[name]=await handler(this);
	}	// }}}
}	// }}}

document.addEventListener('DOMContentLoaded', () => {
	const content=document.body.querySelector('#content'),
	      loading=document.createElement("div");
	content.style.opacity='0';
	loading.style.textAlign='center';
	loading.textContent='Loading ...';
	document.body.insertBefore(loading,document.body.firstChild);

	(()=>{	// complete the <title> element automatically. {{{
		let te=document.head.querySelector("title");
		if(!te) document.head.appendChild(te=document.createElement('title'));
		te.textContent=te.textContent||(content.querySelector('.title')||{"textContent":"Presentation"}).textContent
	})();	// }}}

	let MS=window.App=new Slides(document.body);

	((CS)=>{	// install page plugins {{{
		for (const name of (CS.getAttribute('plugins')||"").split(',')) {
			if (name in Plugins)
				MS.install(name,Plugins[name]);
			else if(name)
				loadScript(currentScript.getAttribute("src").replace(/\.js/,`_${name}.js`))
				.then((h)=>MS.install(name,h));
		}
	})(currentScript);	// }}}

	document.addEventListener('fullscreenchange', ()=>MS.set('pagemode',document.fullscreenElement));
	window.addEventListener('keydown', (e) => {
		if (e.key==='ArrowLeft') MS.activate(MS.current-1);
		if (e.key==='ArrowRight') MS.activate(MS.current+1);
		if (e.key==='Escape') {
			e.preventDefault();
			MS.Aside.toggle();
		}
	});
	window.addEventListener('resize',(e) => MS.applyFontSize());
	MS.applyFontSize (1.0);

	(()=>{	// apply url hash and activate the section {{{
		let index=0;
		if (location.hash) {
			const section=MS.Sections.find(s => `#${s.id}` === location.hash);
			if (section) index=parseInt(section.getAttribute("data-index"));
		}
		setTimeout(()=>{
			MS.activate(index, false);
			loading.parentNode.removeChild(loading);
			content.style.opacity='1';
		}, 1);
	})();	// }}}
});

})();
