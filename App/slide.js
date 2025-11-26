(function(){

const currentScript = document.currentScript;

class Aside
{	// Aside tutorial bar {{{
	constructor (RE=document.body, CB={}) {
		this.RE=RE;

		// create panel-overlay (mask)
		((E)=>{
			E.addEventListener('click', (evt) => this.close());
			((S)=>{
				// [CSS] position:fixed; top:0; left:0; right:0; bottom:0;
				S.position="fixed";
				S.top=S.left=S.right=S.bottom=0;
				// [CSS] background:rgba(0,0,0,0.4); z-index:99;
				S.background="rgba(0,0,0,0.4)";
				S.zIndex=99;
				// [CSS] transition:opacity 0.3s ease, visibility 0.3s;
				S.transition="opacity 0.3s ease, visibility 0.3s";
			})(E.style);
		})(this.Overlay=document.createElement('div'));
		RE.appendChild(this.Overlay);

		// Aside bar
		this.E=((E) => {
			((S) => {
				// [CSS] position: fixed; top: 0; right: 0; bottom: 0;
				S.position="fixed";
				S.top=S.right=S.bottom=0;
				// [CSS] width: 320px; max-width: 80vw;
				S.width="320px"; S.maxWidth="80vw";
				// [CSS] background: #fff;
				S.background="#fff";
				// [CSS] border-left: 1px solid #eee;
				S.borderLeft="1px solid #eee";
				// [CSS] box-shadow: -2px 0 10px rgba(0,0,0,0.1);
				S.boxShadow="-2px 0 10px rgba(0,0,0,0.1)";
				// [CSS] z-index: 100;
				S.zIndex=100;
				// [CSS] transform: translateX(100%);
				S.transform="translateX(100%)";
				// [CSS] transition: transform 0.3s ease;
				S.transition="transform 0.3s ease";
				// [CSS] display: flex; flex-direction: column;
				S.display="flex";
				S.flexDirection="column";
			})(E.style);
			E.setAttribute("current","toc");
			E.innerHTML=`
<style>
	.panel-header { padding: 1rem; border-bottom: 1px solid #eee; }
	.panel-header h3 { margin: 0; color: #0d5ea8; }
	[current="settings"] #toc, [current="toc"] #settings { display:none; }
	[current="settings"] #showSettings, [current="toc"] #showTOC { border-color:white; font-weight:bold; }
	#toc, #settings { flex: 1; overflow-y: auto; padding: 1rem; }
	#toc ol { list-style: none; padding: 0; margin: 0; }
	#toc li { margin: 4px 0; }
	#toc a { color:#0d5ea8; text-decoration: none; display: block; padding: 6px 10px; border-radius: 6px; font-size: 0.9rem; }
	#toc a:hover { background-color: #f0f5fa; }
	#toc a.active { font-weight:700; background-color: #e3f2fd; }
	#settings { display: flex; justify-content: space-between; align-items: center; }
	#settings label { color: var(--text); font-size: 0.9rem; }
	#settings .zoom-controls { display: flex; align-items: center; gap: 0.5rem; }
	.panel-footer { padding: 1rem; border-top: 1px solid #eee; background: #fcfcfc; text-align:center; }
	.zoom-controls button { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; background-color: #f9f9f9; cursor: pointer;}
	.nav-controls { display: flex; align-items: center; gap: 10px; }
	.help { font-size: 0.8rem; color: var(--muted); width:100%; text-align:center; }
</style>
<div class="panel-header">
	<h3 style="white-space:nowrap">
		<button class="btn" id="playBtn">⛶</button>
		<button class="btn" id="showTOC">導覽</button>
		<button class="btn" id="showSettings">設定</button>
	</h3>
</div>
<div style="overflow-y:auto;">
	<nav id="toc">
		<ol id="tocList"></ol>
	</nav>
	<div id="settings">
		<label>字型大小</label>
		<div class="zoom-controls">
			<button id="fontDecreaseBtn" title="縮小字型">-</button>
			<span id="fontDisplay">100%</span>
			<button id="fontIncreaseBtn" title="放大字型">+</button>
		</div>
	</div>
</div>
<div class="panel-footer">
	<div class="nav-controls">
		<button class="btn" id="prevBtn" title="上一節 Prev (←)">←</button>
		<span id="counter" class="help"></span>
		<button class="btn" id="nextBtn" title="下一節 Next (→)">→</button>
	</div>
	© 2025 Porshen Lai
</div>`;
			E.addEventListener('click', (evt) => {
				let e = evt.target;
				switch(e.id){
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
					if (e.tagName==="A") {
						evt.preventDefault();
						if (CB.activate) CB.activate(0,parseInt(e.dataset.index, 10));
						this.close();
					}
					break;
				}
				evt.stopPropagation();
			});
			return E;
		})(document.createElement("aside"));
		this.Overlay.appendChild(this.E);
		this.close();
	}
	update (index, total) {
		this.E.querySelector('#counter').textContent=(index+1)+' / '+total;
		this.E.querySelector('#prevBtn').disabled=(index===0);
		this.E.querySelector('#nextBtn').disabled=(index===total-1);
		Array.from(this.E.querySelectorAll('#tocList a'))
			.forEach((link, i) => link.classList.toggle('active', i === index));
	}
	createTocList (sections) {
		const tocList=this.E.querySelector('#tocList');
		sections.forEach((sec, idx) => {
			const h = sec.querySelector('h2') || sec.querySelector('h1');
			const title = h ? h.textContent.trim() : (idx + 1);
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#' + sec.id;
			a.textContent = title;
			a.dataset.index = idx;
			li.appendChild(a);
			tocList.appendChild(li);
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

class Quiz
{	// Quiz Plugin {{{
	constructor (e, ans)
	{	// (root element of Quiz, {... qi:qa})
		((SE) => { // install style for Quiz
			if (SE) return;
			SE=document.createElement("style");
			SE.innerHTML=`
[qi] { border:2px solid blue;border-radius:8px;padding:8px;margin:8px 4px; }
[qo] { padding:4px; margin:4px; border:2px solid lightgrey;background-image: linear-gradient(white 60%,lightgrey); }
[qo]:hover { border-color:grey;background-image: linear-gradient(white 60%,grey); }
[qt][qr="x"] { border-color:red;background-image: linear-gradient(to right,white 60%,pink); }
[qt][qr="o"] { border-color:green;background-image: linear-gradient(to right,white 60%,lightgreen); }
[qt="s"][qa] [qo] { display:none; }
[qt="s"][qa] .QS[qo] { display:block; }
[qt="m"][qa] [qo] { color:black; }
[qt="m"][qa] .QS[qo] { color:blue;font-weight:bolder; }
`;
			document.head.appendChild(SE);
		})(document.head.querySelector('style[STYID="Quiz"]'));

		this.E=e;
		this.AnsDB=ans||((ans)=>{
			//document.head.setAttribute("AID",btoa(JSON.stringify({ "1":3, "2-1":2, "3":2, "4":7 })));
			if (!ans)
				return Array.from(this.E.querySelectorAll('[qi][___]')).reduce((r,e)=>{
					r[e.getAttribute('qi')]=parseInt(e.getAttribute('___'));
					return r;
				},{});
			return JSON.parse(ans.getAttribute("ANS")||atob(ans.getAttribute("AID")));
		})(document.body.querySelector("[ANS]")||document.body.querySelector("[AID]")||document.head.querySelector("[AID]"));
		console.log(btoa(JSON.stringify(this.AnsDB)));
		this.E.addEventListener('click',(evt)=>{
			evt.stopPropagation();
			for(let e=evt.target;e&&e.hasAttribute;e=e.parentNode)
				if(e.hasAttribute('qo')) { this.answer(e); break; }
		});
	}
	answer (e)
	{
		let p,qi;
		for(p=e;p.nodeType&&(!p.matches('[qi]'));p=p.parentNode);
		if(!p) return;
		qi=p.getAttribute("qi");
		switch(p.getAttribute('qt')||'s'){
		case 's':
			if (e.classList.contains('QS')) {
				[... p.querySelectorAll('.QS')].forEach((e)=>e.classList.remove('QS'));
				p.removeAttribute("qr");
				p.removeAttribute("qa");
			} else {
				[... p.querySelectorAll('.QS')].forEach((e)=>e.classList.remove('QS'));
				e.classList.add('QS');
				const ans=parseInt(e.getAttribute("qo"));
				if (this.AnsDB[qi])
					p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
				p.setAttribute("qa",ans);
			}
			break;
		case 'm':
			e.classList.toggle('QS');
			const ans=[... p.querySelectorAll('.QS')].reduce((r,e)=>r|parseInt(e.getAttribute('qo')),0);
			p.setAttribute("qa",ans);
			if (this.AnsDB[qi])
				p.setAttribute("qr",this.AnsDB[qi]===ans ? 'o' : 'x');
			break;
		}
	}
	mark () {
		return [... this.E.querySelectorAll('[qi]')].reduce((r,e)=>{
			r[e.getAttribute('qi')]=e.getAttribute('qa');
			return r;
		},{});
	}
}	// }}}


class Cards
{	/* {{{
	<div class="flashcard">
		<div class='front'><h2>Question</h2><p>What CSS property creates a 3D space?</p></div>
		<div class='back'><h2>Answer</h2><p>The 'perspective' property.</p></div>
	</div>
	<script>
		(new Cards()).install(document.body);
	</script>
	*/
	constructor (E) {
		if (!document.head.querySelector('style#FlashCardStyle'))
			document.head.appendChild(((E) => {
				// {{{
				E.id="FlashCardStyle"
				E.innerHTML=`
.flashcard {
  background-color: transparent;
  width: 300px;
  height: 200px;
  border: 1px solid #f1f1f1;
  perspective: 1000px; /* This is the 3D space */
}
.flashcard .front,.flashcard .back {
  position: absolute;
  backface-visibility: hidden;
  width: 100%;
  height: 100%;
}
.flashcard .front {
  background-color: #bbb; color: black;
}
.flashcard .back {
  background-color: #2980b9; color: white;
  transform: rotateX(180deg);
}
.flashcard>div {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
}
.flashcard>div.flipped {
  transform: rotateX(180deg);
}
`;
				return E;
				// }}}
			})(document.createElement("style")));
		if (E) this.install(E); else this.RE=undefined;
	}
	install (E) {
		this.RE=E;
		Array.from(E.querySelectorAll('.flashcard'))
		.forEach((E) => {
			const bc=E.querySelector('.back');
			const inner=((e)=>{
				if (e===E){
					e=document.createElement("div");
					while (E.firstChild) e.appendChild(E.firstChild);
					E.appendChild(e);
				}
				return e;
			})(bc.parentNode);
		});
		E.addEventListener('click', (evt) => {
			for (let e=evt.target;e&&e.classList;e=e.parentNode)
			{
				if (e.classList.contains('flashcard')) {
					this.flip(e.querySelector('div'));
					evt.stopPropagation();
				}
			}
		});
		return this;
	}
	flip (e) {
		switch (e) {
		case true:
			Array.from(this.RE.querySelectorAll('.flashcard'))
			.forEach((e)=>e.classList.add('flipped'));
			break;
		case false:
			Array.from(this.RE.querySelectorAll('.flashcard'))
			.forEach((e)=>e.classList.remove('flipped'));
			break;
		case undefined:
			break;
		default:
			e.classList.toggle('flipped');
			break;
		}
	}
}	// }}}

class Slides
{	// {{{
	constructor (RE) {

		this.currentActiveIndex=-1;
		this.currentFontScale=1.0;
		
		this.Content=document.getElementById('content');
		this.Content.addEventListener('click',(evt) => {
			let e=evt.target, s;
			for (s=e;s&&s.tagName!=="SECTION";s=s.parentNode);
			if (s&&s.tagName==="SECTION")
				this.activateSection(parseInt(s.getAttribute("data-index"),10));
		});

		this.Sections=Array.from(content.querySelectorAll('section'));
		this.Sections.forEach((sec, idx) => {
			if (!sec.hasAttribute("data-index"))
				sec.setAttribute("data-index",idx);
			sec.id = 's' + (idx + 1);
		});

		this.Aside=new Aside(document.body, {
			"fullscreen": () => document.getElementById('content').requestFullscreen(),
			"activate": (s,c) => this.activateSection(s+(c===undefined?this.currentActiveIndex:c)),
			"applyFontScale": (scale) => this.applyFontSize(this.currentFontScale + scale)
		});
		this.Aside.createTocList(this.Sections);

		// Install Plugins
		this.Plugins={};
		if (this.Content.querySelector('[qi]')) // qi="Quiz ID"
			this.Plugins.Quiz=new Quiz(this.Content);
			// .addEventListener('click',(evt)=>{ console.log(qz.mark()); });

		if (this.Content.querySelector('.flashcard')) {
			this.Plugins.Cards=(new Cards()).install(document.body);
			this.Plugins.Cards.flip(true);
		}

		// If <title> not exist, create one
		if (!document.head.querySelector("title"))
			document.head.appendChild(((E) => {
				E.textContent=(
					this.Content.querySelector('.title') ||
					{"textContent":"Presentation"}
				).textContent;
				return E;
			})(document.createElement('title')));

		document.head.appendChild(( // import slide.css
			(e)=>{
				e.setAttribute("rel","stylesheet");
				const u=/(.*\/)[^\/]+(\?.*)?/.exec(currentScript.getAttribute("src"));
				e.setAttribute("href",u ? (u[1]+"/slide.css") : "slide.css");
				return e;
			}
		)(document.createElement("link")));
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
		section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
		this.Sections[index].scrollTop=0;
	}

	applyFontSize (scale) {
		const DEFAULT_FONT_SIZE = 24;
		this.currentFontScale = Math.max(0.8, Math.min(1.5, scale));
		document.documentElement.style.setProperty(
			'--base-font-size',
			`${DEFAULT_FONT_SIZE * this.currentFontScale}px`
		);
		this.Aside.E.querySelector('#fontDisplay').textContent = `${Math.round(this.currentFontScale * 100)}%`;
	}
}	// }}}

document.addEventListener('DOMContentLoaded', () => {
	if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
		document.body.classList.add('is-mobile');

	let MS=new Slides(document.body);

	let initialIndex = 0;
	if (location.hash) {
		const matchingSection = MS.Sections.find(s => '#' + s.id === location.hash);
		if (matchingSection)
			initialIndex = parseInt(matchingSection.getAttribute("data-index"), 10);
	}

	MS.applyFontSize (1.0);
	setTimeout(()=>MS.activateSection(initialIndex, false),1);

	window.addEventListener('keydown', (e) => {
		if (e.key==='ArrowLeft') MS.activateSection(MS.currentActiveIndex - 1);
		if (e.key==='ArrowRight') MS.activateSection(MS.currentActiveIndex + 1);
		if (e.key==='Escape') {
			e.preventDefault();
			MS.Aside.toggle();
		}
	});

	if (document.body.classList.contains('is-mobile')) {
		((E)=>{ // {{{
			E.id='mobileControls';
			E.innerHTML=`
<style>
#mobileControls {
	display: flex;
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 0.1rem 0.75rem;
	background: rgba(255, 255, 255, 0.95);
	border-top: 1px solid #ddd;
	box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
	z-index: 50;
	justify-content: space-between;
	gap: 0.5rem;
}
#mobileControls .btn {
	flex: 1;
	padding: 0.2rem 0.5rem;
	font-size: 0.9rem;
	font-weight: bold;
}
</style>
<button id="mobilePrevBtn" class="btn">← 上一頁</button>
<button id="mobileEscBtn" class="btn">☰ 導覽</button>
<button id="mobileNextBtn" class="btn">下一頁 →</button>
`;
			E.update=(index,total) => {
				E.querySelector("#mobilePrevBtn").disabled = (index === 0);
				E.querySelector("#mobileNextBtn").disabled = (index === total - 1);
			};
			E.addEventListener('click',(evt) => {
				let e=evt.target;
				switch(e.id){
				case 'mobilePrevBtn':
					MS.activateSection(MS.currentActiveIndex - 1);
					break;
				case 'mobileNextBtn':
					MS.activateSection(MS.currentActiveIndex + 1);
					break;
				case 'mobileEscBtn':
					MS.Aside.toggle();
					break;
				}
			});
			document.body.appendChild(E);
		})(document.createElement('div'));
	}	// }}}

	document.addEventListener('fullscreenchange', function () {
		document.getElementById("content")
		.setAttribute(
			"playmode",
			document.fullscreenElement ? "page" : "continuous"
		);
	});
});

})();
