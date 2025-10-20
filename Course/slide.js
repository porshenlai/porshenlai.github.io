(function(){
	
	/**
	 * 原始的投影片主腳本
	 * 只有在 <aside> 成功載入後才會被呼叫
	 */
	function initializePresentation() {
		// --- Element Selectors ---
		const content = document.getElementById('content');
		const sections = Array.from(content.querySelectorAll('section'));
		const tocList = document.getElementById('tocList');
		const prevBtn = document.getElementById('prevBtn');
		const nextBtn = document.getElementById('nextBtn');
		const counter = document.getElementById('counter');
		const panelOverlay = document.getElementById('panel-overlay'); 
		const operationsPanel = document.getElementById('operationsPanel');
		
		// NEW: Mobile control selectors
		const mobilePrevBtn = document.getElementById('mobilePrevBtn');
		const mobileNextBtn = document.getElementById('mobileNextBtn');
		const mobileEscBtn = document.getElementById('mobileEscBtn');
		
		let currentActiveIndex = -1;

		((te)=>{
			if(te.textContent) return;
			te.textContent=(document.body.querySelector('.title')||{"textContent":"Presentation"}).textContent;
		})(document.head.querySelector("title"));

		// --- Build TOC ---
		sections.forEach((sec, idx) => {
			if (!sec.hasAttribute("data-index"))
				sec.setAttribute("data-index",idx);
			sec.id = 's' + (idx + 1);
			const h = sec.querySelector('h2') || sec.querySelector('h1');
			const title = h ? h.textContent.trim() : 'Section ' + (idx + 1);
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#' + sec.id;
			a.textContent = title;
			a.dataset.index = idx;
			li.appendChild(a);
			tocList.appendChild(li);
		});
		const tocLinks = Array.from(tocList.querySelectorAll('a'));

		// --- Core UI Update & Navigation Function ---
		function activateSection(index, smooth = true) {
			if (index < 0 || index >= sections.length || index === currentActiveIndex) {
					return; // Prevent invalid or redundant calls
			}
			currentActiveIndex = index;

			// 1. Update progress bar and counter
			counter.textContent = (index + 1) + ' / ' + sections.length;
			
			// 2. Update button states
			prevBtn.disabled = (index === 0);
			nextBtn.disabled = (index === sections.length - 1);
			// NEW: Also update mobile buttons
			if (mobilePrevBtn) {
				mobilePrevBtn.disabled = (index === 0);
				mobileNextBtn.disabled = (index === sections.length - 1);
			}
			
			// 3. Highlight active section and TOC link
			sections.forEach((sec, i) => {
				sec.classList.toggle('current-section', i === index);
			});
			tocLinks.forEach((link, i) => {
				link.classList.toggle('active', i === index);
			});
			
			// 4. Update URL hash and scroll into view
			const section = sections[index];
			if (history.replaceState) {
				history.replaceState(null, null, '#' + section.id);
			} else {
				location.hash = '#' + section.id;
			}
			section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
		}

		// --- Panel Logic ---
		function openPanel() { document.body.classList.add('panel-open'); }
		function closePanel() { document.body.classList.remove('panel-open'); }
		function togglePanel() {
			document.body.classList.contains('panel-open') ? closePanel() : openPanel();
		}

		// --- Event Listeners ---
		prevBtn.addEventListener('click', () => activateSection(currentActiveIndex - 1));
		nextBtn.addEventListener('click', () => activateSection(currentActiveIndex + 1));
		
		tocLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const index = parseInt(e.currentTarget.dataset.index, 10);
				activateSection(index);
				closePanel();
			});
		});

		window.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') activateSection(currentActiveIndex - 1);
			if (e.key === 'ArrowRight') activateSection(currentActiveIndex + 1);
			
			if (e.key === 'Escape') {
				e.preventDefault(); // Stop default browser action (like exiting fullscreen)
				togglePanel();
			}
		});
		
		sections.forEach(section => {
			section.addEventListener('click', function() {
				const index = parseInt(this.dataset.index, 10);
				activateSection(index);
			});
		});

		panelOverlay.addEventListener('click', closePanel);
		
		operationsPanel.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		// NEW: Mobile control listeners
		if (document.body.classList.contains('is-mobile')) {
			mobilePrevBtn.addEventListener('click', () => activateSection(currentActiveIndex - 1));
			mobileNextBtn.addEventListener('click', () => activateSection(currentActiveIndex + 1));
			mobileEscBtn.addEventListener('click', () => togglePanel());
		}

		// --- Font Size Controls ---
		const fontIncreaseBtn = document.getElementById('fontIncreaseBtn');
		const fontDecreaseBtn = document.getElementById('fontDecreaseBtn');
		const fontDisplay = document.getElementById('fontDisplay');
		const root = document.documentElement;

		const FONT_STEP = 0.05, MAX_FONT_SCALE = 1.5, MIN_FONT_SCALE = 0.8, DEFAULT_FONT_SIZE = 24;
		let currentFontScale = 1.0;

		function applyFontSize(scale) {
			currentFontScale = Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, scale));
			root.style.setProperty('--base-font-size', `${DEFAULT_FONT_SIZE * currentFontScale}px`);
			fontDisplay.textContent = `${Math.round(currentFontScale * 100)}%`;
			localStorage.setItem('fontScale', currentFontScale);
		}

		fontIncreaseBtn.addEventListener('click', () => applyFontSize(currentFontScale + FONT_STEP));
		fontDecreaseBtn.addEventListener('click', () => applyFontSize(currentFontScale - FONT_STEP));

		// --- Initialization ---
		function init() {
			// Load font size setting
			const savedScale = localStorage.getItem('fontScale');
			applyFontSize(savedScale ? parseFloat(savedScale) : 1.0);
			
			// Set initial section based on URL hash or default to first
			let initialIndex = 0;
			if (location.hash) {
				const matchingSection = sections.find(s => '#' + s.id === location.hash);
				if (matchingSection) {
					initialIndex = parseInt(matchingSection.dataset.index, 10);
				}
			}
			activateSection(initialIndex, false); // Initial activation without smooth scroll
		}
		
		// 執行初始化
		init();
	} // --- 結束 initializePresentation 函式 ---


	// -----------------------------------------------------------------
	// MODIFIED: 啟動邏輯
	// -----------------------------------------------------------------

	// NEW: Mobile Detection
	function isMobile() {
		return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
	if (isMobile()) {
		document.body.classList.add('is-mobile');
	}
	
	// 1. 將 <aside> 面板的 HTML 內容定義為字串
	const asideHTMLString = `
	<aside id="operationsPanel">
		<div class="panel-header">
			<h3>
				<span onclick="document.getElementById('operationsPanel').classList.toggle('show-settings');" style="cursor:pointer">🛞</span>
				導覽與設定
				<span onclick="document.getElementById('content').requestFullscreen();" style="cursor:pointer">「」</span>
			</h3>
			<div class="setting-item">
				<label>字型大小</label>
				<div class="zoom-controls">
					<button id="fontDecreaseBtn" title="縮小字型">-</button>
					<span id="fontDisplay">100%</span>
					<button id="fontIncreaseBtn" title="放大字型">+</button>
				</div>
			</div>
		</div>
		<nav id="toc">
			<ol id="tocList"></ol>
		</nav>
		<div class="panel-footer">
			<div class="nav-controls">
				<button class="btn" id="prevBtn" title="上一節 Prev (←)">←</button>
				<span id="counter" class="help"></span>
				<button class="btn" id="nextBtn" title="下一節 Next (→)">→</button>
			</div>
			<footer>
			© 2025 Porshen Lai
			</footer>
		</div>
	</aside>
	`;

	// 2. 建立並附加 panel-overlay
	const overlay = document.createElement('div');
	overlay.id = 'panel-overlay';
	document.body.appendChild(overlay);

	// 3. 使用 DOMParser 解析字串並附加 <aside>
	const parser = new DOMParser();
	const doc = parser.parseFromString(asideHTMLString, 'text/html');
	const asideElement = doc.getElementById('operationsPanel'); // 從解析的文檔中取得元素

	// NEW: 4. 建立並附加 mobile controls
	const mobileControls = document.createElement('div');
	mobileControls.id = 'mobileControls';
	mobileControls.innerHTML = `
		<button id="mobilePrevBtn" class="btn">← 上一頁</button>
		<button id="mobileEscBtn" class="btn">☰ 導覽</button>
		<button id="mobileNextBtn" class="btn">下一頁 →</button>
	`;
	document.body.appendChild(mobileControls); // 無條件附加，CSS 會根據 .is-mobile 決定是否顯示

	// 5. 附加 aside 並啟動主腳本
	if (asideElement) {
		document.body.appendChild(asideElement);
		
		// 6. *** 成功附加後，呼叫主函式來綁定事件 ***
		initializePresentation();
	} else {
		console.error('從 HTML 字串解析 <aside> 面板失敗。');
	}

})();
