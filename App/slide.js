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
{	// Aside tutorial bar {{{
	constructor (RE=document.body, CB={}) {
		this.RE=RE;

		((E)=>{ // create panel-overlay (mask) {{{
			E.addEventListener('click', (evt) => this.close());
			((S)=>{
				// [CSS] position:fixed; top:0; left:0; right:0; bottom:0;
				S.position="fixed";
				S.top=S.left=S.right=S.bottom=0;
				// [CSS] background:rgba(0,0,0,0.4); z-index:99;
				S.background="rgba(0,0,0,0.4)";
				S.zIndex=1001;
				// [CSS] transition:opacity 0.3s ease, visibility 0.3s;
				S.transition="opacity 0.3s ease, visibility 0.3s";
			})(E.style);
			RE.appendChild(E);
		})(this.Overlay=document.createElement('div')); // }}}

		((E) => { // Aside bar {{{
			E.setAttribute("current","toc");
			E.innerHTML=`
<style>
aside {position:fixed;top:0;right:0;bottom:0;width:640px;max-width:80vw;font-size:24px;background:#fff;border-left:1px solid #eee;box-shadow:-2px 0 10px rgba(0,0,0,0.1);z-index:1002;transform:translateX(100%);transition:transform 0.3s ease;display:flex;flex-flow:column nowrap;justify-content:space-between;align-items:center;}
aside button {font-size:24px;border-radius:12px;padding:4px 12px;}
aside ol {list-style:none;padding:0;margin:0;}
aside li {margin: 4px 0;}
aside a {color:#0d5ea8;text-decoration:none;display:block;padding:6px 10px;border-radius:6px;font-size:0.9rem;}
aside a:hover {background-color:#f0f5fa;}
aside a.active {font-weight:700;background-color:#e3f2fd;}
[current="settings"] [tab="toc"], [current="toc"] [tab="settings"] {display:none;};
[tab="toc"], [tab="settings"] {flex:1;overflow-y:auto;padding:1rem;}
</style>
<div style="padding:0.5rem 1rem;border-bottom:1px solid #eee;width:100%;">
	<h3 style="margin:0;color:#0d5ea8;white-space:nowrap;">
		<button action="playBtn">⛶</button>
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
			<label style="color:#222;font-size: 0.9rem;">字型大小</label>
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
		<span uid="counter" style='{font-size:0.8rem;color:#666;width:100%;text-align:center;}'></span>
		<button action="nextBtn" title="下一節 Next (→)">→</button>
	</span>
</div>`;
			E.addEventListener('click', (evt) => {
				let e = evt.target;
				switch(e.getAttribute("action")){
				case "playBtn":
					if (CB.fullscreen) CB.fullscreen(evt);
					break;
				case "prevBtn":
					if (CB.activate) CB.activate(-1);
					break;
				case "nextBtn":
					if (CB.activate) CB.activate(1);
					break;
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

		((E)=>{ // Launch PAD {{{
			E.id="control-panel";
			E.innerHTML=`
<style>
#control-panel {position:fixed;bottom:0;left:0;display:flex;flex-flow:row wrap;width:150px;padding:10px;z-index:1000;pointer-events:none;}
#control-panel [action] {width:50px;height:50px;margin:5px;display:flex;justify-content:center;align-items:center;background-color:#3498db;color:white;font-weight:bold;font-size:1.2em;border-radius:5px;user-select:none;cursor:pointer;pointer-events:auto;}
#control-panel>[action="none"] {opacity:0;}
#control-panel>[action="none"]:hover {opacity:1;}
#control-panel:not(.active) :not([action="none"]) {display:none;}
</style>
<div action="prev">P</div><div action="menu">M</div>
<div action="none"></div><div action="next">N</div>
`;
			E.addEventListener('click',(evt)=>{
				const func=evt.target.getAttribute('action');
				switch(func){
				case 'none':
					E.classList.toggle('active');
					break;
				case 'menu':
					E.classList.remove('active'); this.open(); break;
				case 'prev':
					E.classList.remove('active'); 
					if (CB.activate) CB.activate(-1);
					break;
				case 'next':
					E.classList.remove('active');
					if (CB.activate) CB.activate(1);
					break;
				default:
					return;
				}
				evt.preventDefault();
			});
			RE.appendChild(E);
		})(document.createElement("div")); // }}}

		this.close();
	}
	update (index, total) {
		this.E.querySelector('[uid="counter"]').textContent=(index+1)+' / '+total;
		this.E.querySelector('[action="prevBtn"]').disabled=(index===0);
		this.E.querySelector('[action="nextBtn"]').disabled=(index===total-1);
		Array.from(this.E.querySelectorAll('[tab="toc"]>ol a'))
			.forEach((link, i) => link.classList.toggle('active', i === index));
	}
	createTocList (sections) {
		const tl=this.E.querySelector('[tab="toc"]>ol');
		sections.forEach((sec, idx) => {
			const h = sec.querySelector('h1') || sec.querySelector('h2');
			const title = h ? h.textContent.trim() : `Slide ${idx + 1}`;
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#' + sec.id;
			a.textContent = title;
			a.dataset.index = idx;
			li.appendChild(a);
			tl.appendChild(li);
		});
	}
	open () {
		((S)=>{
			// [CSS] opacity:1; visiblity:visible;
			S.opacity=1;
			S.visibility="visible";
		})(this.Overlay.style);
		// [CSS] transform: translateX(0);
		this.E.style.transform="translateX(0)";
	}
	close () {
		((S)=>{
			// CSS: { opacity:0; visiblity:hidden; }
			S.opacity=0;
			S.visibility="hidden";
		})(this.Overlay.style);
		// [CSS] transform: translateX(100%);
		this.E.style.transform="translateX(100%)";
	}
	toggle () {
		this["hidden" === this.Overlay.style.visibility ? "open" : "close"]();
	}
}	// }}}

class Slides
{	// {{{
	constructor (RE) {

		this.currentActiveIndex=-1;
		this.currentFontScale=1.0;

		(()=>{ // install style {{{
			const S=document.createElement("style")
			const PAGE=`
:root { --base-font-size: 24px; } /* Font size control */ 
* { box-sizing: border-box; }
html { font-size: var(--base-font-size); scroll-behavior: smooth; }
html, body { height: 100%; }
body {
	margin:0; font-family: "Noto Sans TC", "Microsoft JhengHei", system-ui, -apple-system, Segoe UI, Arial;
	color:#222; background:#fff; line-height:1.6;
	display: flex; flex-direction: column;
}
`;
			const SECTION=`
#content {flex:1;padding:1.5rem;overflow:hidden auto;background:#f0f0f0;}
#content section {margin:1.75rem 0 2.25rem 0;scroll-snap-align:none;}
#content[playmode="page"] {
	padding: 0; 
	scroll-snap-type: y mandatory;
	overflow-y: scroll;
	overflow-x: hidden;
}
#content[playmode="page"] section {
	margin: 0.5rem;
	height: calc(100% - 1rem);
	min-height: calc(100% - 1rem);
	padding: 1.25rem; 
	scroll-snap-align: start; 
	overflow-y: auto;
	scroll-margin-top: 0.5rem; 
}
#content[playmode="page"] section.current-section {
	scroll-margin-top: 0.5rem;
}

section { 
	margin: 1.75rem 0 2.25rem 0; padding: 1.25rem; border:2px solid #e6e6e6; border-radius:14px; 
	box-shadow: 0 2px 8px rgba(0,0,0,0.03); 
	transition: border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease;
	cursor: pointer;
	scroll-margin-top: 1.5rem;
}
section:hover {
	border-color: #ccc;
}
section.current-section {
	border-color: #26A69A;
	background-color: #f6fffd;
	box-shadow: 0 4px 16px rgba(38, 166, 154, 0.2);
	cursor: default;
}
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
[playmode="page"] section.cm { display:flex;flex-flow:column nowrap;align-items:center;justify-content:center;}
`;
			S.innerHTML=PAGE+SECTION+BASIC;
			document.head.appendChild(S);
		})(); // }}}
		
		this.Content=((content)=>{
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
					this.activateSection(parseInt(s.getAttribute("data-index"),10));
			});
			content.addEventListener('scrollend', (evt) => {
				console.log("scrollend");
			});
			return content;
		})(RE.querySelector('#content'));

		this.Sections=Array.from(content.querySelectorAll('section'));
		this.Sections.forEach((sec, idx) => {
			if (!sec.hasAttribute("data-index"))
				sec.setAttribute("data-index",idx);
			sec.id = 's' + (idx + 1);
		});

		this.Aside=new Aside(document.body, {
			"activate": (v,av) => this.activateSection(v?this.currentActiveIndex+parseInt(v):av),
			"fullscreen": () => document.getElementById('content').requestFullscreen(),
			"applyFontScale": (scale) => this.applyFontSize(this.currentFontScale + scale)
		});
		this.Aside.createTocList(this.Sections);

		this.Plugins={};

		// If <title> not exist, create one
		if (!document.head.querySelector("title"))
			document.head.appendChild(((E) => {
				E.textContent=(
					this.Content.querySelector('.title') ||
					{"textContent":"Presentation"}
				).textContent;
				return E;
			})(document.createElement('title')));
	}

	activateSection (index, smooth = true) {
		if (index < 0 || index >= this.Sections.length || index === this.currentActiveIndex)
			return; // Prevent invalid or redundant calls

		this.currentActiveIndex = index;
		if (this.Aside)
			this.Aside.update(index, this.Sections.length);
		((E)=>{
			if(E) E.update(index, this.Sections.length);
		})(document.getElementById("mobileControls"));

		this.Sections.forEach((sec, i) => sec.classList.toggle('current-section', i === index));
			
		// 4. Update URL hash and scroll into view
		const section = this.Sections[index];
		if (history.replaceState) {
			history.replaceState(null, null, '#' + section.id);
		} else {
			location.hash = '#' + section.id;
		}
		setTimeout(()=>{
			section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
			this.Sections[index].scrollTop=0;
		},0);
	}

	applyFontSize (scale) {
		const DEFAULT_FONT_SIZE=((w,h)=>w>h ? Math.floor(h/26) : Math.floor(w/30))(window.innerWidth,window.innerHeight);
		if(scale) this.currentFontScale = Math.max(0.8, Math.min(1.5, scale));
		document.documentElement.style.setProperty(
			'--base-font-size',
			`${DEFAULT_FONT_SIZE * this.currentFontScale}px`
		);
		this.Aside.E.querySelector('[action="fontDisplay"]').textContent = `${Math.round(this.currentFontScale * 100)}%`;
	}

	async install (name, handler) {
		this.Plugins[name]=await handler(this);
	}
}	// }}}

document.addEventListener('DOMContentLoaded', () => {
	if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
		document.body.classList.add('is-mobile');

	let MS=new Slides(document.body);

	((CS)=>{ // Install Plugins
		for (const name of (CS.getAttribute('plugins')||"").split(',')) {
			if (name in Plugins)
				MS.install(name,Plugins[name]);
			else if(name)
				loadScript(currentScript.getAttribute("src").replace(/\.js/,`_${name}.js`))
				.then((h)=>MS.install(name,h));
		}
	})(currentScript);

	let initialIndex = 0;
	if (location.hash) {
		const matchingSection = MS.Sections.find(s => '#' + s.id === location.hash);
		if (matchingSection)
			initialIndex = parseInt(matchingSection.getAttribute("data-index"), 10);
	}
	window.addEventListener('resize',(e)=>MS.applyFontSize());
	MS.applyFontSize (1.0);
	window.addEventListener('keydown', (e) => {
		if (e.key==='ArrowLeft') MS.activateSection(MS.currentActiveIndex - 1);
		if (e.key==='ArrowRight') MS.activateSection(MS.currentActiveIndex + 1);
		if (e.key==='Escape') {
			e.preventDefault();
			MS.Aside.toggle();
		}
	});

	setTimeout(()=>MS.activateSection(initialIndex, false),1);

	document.addEventListener('fullscreenchange', function () {
		document.getElementById("content")
		.setAttribute(
			"playmode",
			document.fullscreenElement ? "page" : "continuous"
		);
	});
});

})();
