(function(SCRIPT){

window.Apps.loadStyle(`
.MediaItem, .MediaItem [data-dur], .MediaItem [data-ts] {
	position:absolute; left:0; top:0; width:100%; height:100%; overflow:hidden;
	border:0; margin:0; padding:0;
}
.MediaItem { position:relative; }
`,'CSS_X_Media');

class MediaShot {
	constructor (e) { // e: <[data-ts=開始時間(+:循環播放)] ...<[data-dur=長度]>>
		// 時間段落物件 {{{
		this.E = e;
		this.S = Array.from(e.querySelectorAll('[data-dur]'));
		this.S.forEach((m)=>{
			if (m.dataset.image)
				m.style.background = `url('${m.dataset.image}') no-repeat 50% 50%/contain`;
		});
		this.Dur = undefined;
		this.TS = e.dataset.ts;
		if (this.TS.endsWith('+')) {
			this.TS = this.TS.substring(0, this.TS.length - 1);
			this.Dur = this.S.reduce((r,e)=>r + parseInt(e.dataset.dur), 0);
		}
		this.TS = parseInt(this.TS);
		this.lts = -1;
	}	// }}}
	tick (ts) { // ts: timestamp in seconds
		// 時間事件 {{{
		let cur = undefined, t = ts;
		t -= this.TS;
		if (t >= 0) {
			if (this.Dur) t %= this.Dur;
			cur = this.S.find( (e) => (
				e.dataset.dur <= 0 && (t - ts + this.lts) <= 0
			) || (
				(t -= parseInt(e.dataset.dur)) <= 0
			));
		}
		if (cur) {
			this.E.classList.remove('hide');
			Array.from(this.E.querySelectorAll('[data-dur]'))
				.forEach((e) => e.classList[e===cur ? 'remove' : 'add']('hide'));
		} else this.E.classList.add('hide');
		this.lts = ts;
		if (cur && cur.dataset.dur <= 0) return "pause";
	}	// }}}
}

class MediaItem {
	static createDOM (s) { // s:HTML 腳本
		// 根據 HTML 建立元件 {{{
		const C=document.createElement("div");
		C.innerHTML=s;
		return C.firstChild;
	}	// }}}
	static create (e) { // e:<[data-media=網址] ...(MediaShot)>
		// 建立 ImageItem/AudioItem/VidoeItem 媒體管理物件 {{{
		let url=e.dataset.media;
		if (e.parentNode) e.parentNode.removeChild(e);

		if (url.startsWith('https://www.youtube.com/watch?')) {
			url=url.substring(30).split('&').reduce(
				(r, v) => {
					v = /([^=]+)=(.*)/.exec(v);
					if (v) r[v[1]]=v[2];
					return r;
				}, {}
			);
			return new YouTubeItem(e,url.v);
		}
		const ext=(/.*\.([^\.]+)(\?.*)?/.exec(url)||[null,''])[1].toLowerCase();
		switch ({jpg:"I", jpeg:"I", png:"I", gif:"I", mp4:"V", mp3:"A"}[ext]) {
		case "I": return new ImageItem(e,url);
		case "A": return new AudioItem(e,url);
		case "V": return new VideoItem(e,url);
		}
	}	// }}}
	constructor (e) { // e:建立媒體元件
		// 管理時間段落物件 {{{
		this.E = e;
		e.classList.add('MediaItem');
		this.Shots = Array.from(e.querySelectorAll('[data-ts]')).map((e)=>new MediaShot(e));
		this.LastTick=-1;
	}	// }}}
	tick () {}
	async play (ctrl) {}
	async pause () {}
}

class AudioItem extends MediaItem {
	tick () {
		// {{{
		const ts = this.A ? this.A.currentTime : 0;
		if (ts <= this.LastTick || (ts > 0 && this.A.paused)) return;
		this.Shots.forEach((s) => {
			const cmd = s.tick(ts);
			if (cmd && this[cmd]) this[cmd]();
		});
		this.LastTick = ts;
	}	// }}}
	async play (ctrl) {
		// {{{
		const CE=`<audio controls><source type="audio/mp3" src="${this.E.dataset.media}"/>Not supported: &lt;audio&gt;</audio>`;
		this.A = MediaItem.createDOM(CE);
		this.E.appendChild(this.A);
		ctrl.appendChild(this.A);
		this.A.play();
	}	// }}}
	async pause () { this.A[this.A.paused?"play":"pause"](); }
}

class VideoItem extends MediaItem {
	tick () {
		// {{{
		const ts = this.V ? this.V.currentTime : 0;
		if (ts <= this.LastTick || (ts > 0 && this.V.paused)) return;
		this.Shots.forEach((s) => {
			const cmd = s.tick(ts);
			if (cmd && this[cmd]) this[cmd]();
		});
		this.LastTick = ts;
	}	// }}}
	async play (ctrl) {
		// {{{
		ctrl.innerHTML = "<span style='flex:1 1 auto;'></span><span data-h='m:pause'>⏯️</span>";
		const CE = `<video width="100%" height="100%" controls>
<source type="video/mp4" src="${this.E.dataset.media}"/>
Not supported: &lt;video&gt;
</video>`;
		this.V = MediaItem.createDOM(CE);
		this.V.addEventListener('loadedmetadata', () => {
			const [vw,vh] = [this.V.videoWidth,this.V.videoHeight];
			const cr = this.E.parentNode.getBoundingClientRect();
			const gr = [1,1,1,1];
			if (vw*cr.height > vh*cr.width) {
				gr[0] = cr.width;
				gr[1] = Math.floor(cr.width/vw*vh);
			} else {
				gr[0] = Math.floor(cr.height/vh*vw);
				gr[1] = cr.height;
			}
			gr[2] = Math.floor((cr.width-gr[0])/2);
			gr[3] = Math.floor((cr.height-gr[1])/2);
			['width','height','left','top'].forEach((n,i) => (this.E.style[n] = gr[i]+'px'));
		});
		this.E.appendChild(this.V);
		this.V.play();
	}	// }}}
	async pause () { this.V[this.V.paused?"play":"pause"](); }
}

class ImageItem extends MediaItem {
	constructor (e) { 
		// 影像播放物件 {{{
		super(e);
		this.I = ((ee) => {
			ee.classList.add('fill', 'col');
			e.appendChild(ee);
			return ee;
		})(document.createElement("div"));
	}	// }}}
	async play (ctrl) {
		// {{{
		//this.E.style.width = this.E.style.height = '100%';
		const img = new Image();
		img.addEventListener('load',() => {
			this.Size = [img.width,img.height];
			this.scale('Contain');
		});
		img.src = this.E.dataset.media;
		this.I.style.background = `url("${img.src}") no-repeat 50% 50%/contain`;

		ctrl.innerHTML=`<select data-h='m:scale'>
	<option value='-'>Scale</option>
	<option value='Contain'>Contain</option>
	<option value='Cover'>Cover</option>
</select>
<input data-h='m:scale' style='flex:1 1 auto' value='1' type='range' min='0.5' max='2' step='0.1'></input>`;
		this.Since=(new Date()).getTime();
	}	// }}}
	tick () {
		// {{{
		const ts = ((new Date()).getTime()-this.Since)/1000;
		if (ts <= this.LastTick) return;
		this.Shots.forEach((s) => s.tick(ts));
		this.LastTick = ts;
	}	// }}}
	scale (v) {
		// {{{
		this.E.style.width = this.E.style.height = '100%';
		const CSize = ((cr) => [
			Math.floor(cr.width),
			Math.floor(cr.height)
		])(this.E.parentNode.getBoundingClientRect());

		if (v instanceof Event)
			v = v.target;
		if (v instanceof Element) {
			const VVALUE = v.value;
			if (v.tagName === 'SELECT')
				v.value = '-';
			v = VVALUE;
		}
		if ('string' === typeof(v)) {
			switch (v) {
			case 'Cover':
				((cw,ch,iw,ih) => {
					v = iw*ch < ih*cw ? 1 : ch*iw/ih/cw;
				})(...CSize, ...this.Size);
				break;
			case 'Contain':
				((cw,ch, iw, ih) => {
					v = iw*ch > ih*cw ? 1 : ch*iw/ih/cw;
				})(...CSize, ...this.Size);
				break;
			default:
				v = parseFloat(v);
				if (!v) return;
			}
		}
		const [w,h,p] = [
			Math.floor(100 * v),
			Math.floor(100 * v * this.Size[1] * CSize[0] / this.Size[0] / CSize[1]),
			this.E.parentNode ];
		[['width',w+'%'],
		 ['left',w<100 ? Math.floor((100-w)/2)+'%' : 0],
		 ['height',h+'%'],
		 ['top',h<100 ? Math.floor((100-h)/2)+'%' : 0]
		].forEach((v)=>(this.E.style[v[0]]=v[1]));
		if (w>100) p.scrollLeft=Math.floor((p.scrollWidth-CSize[0])/2);
		if (h>100) p.scrollTop=Math.floor((p.scrollHeight-CSize[1])/2);
		return v;
	}	// }}}
}

let YouTubeLoader=undefined;
class YouTubeItem extends MediaItem {
	constructor (e, id) {
		// {{{
		super(e);
		e.appendChild(MediaItem.createDOM(`<div id="YTPlayer" class="fill">`));
		if (!YouTubeLoader)
			YouTubeLoader = new Promise((or,oe)=>{
				window.onYouTubeIframeAPIReady = () => or(YT);
				window.Apps.loadScript('https://www.youtube.com/iframe_api');
			});
		this.Player = undefined;
		this.VideoID = id;
	}	// }}}
	tick ()
	{	// {{{
		if (!this.Player.getCurrentTime) return;
		const ts = this.Player.getCurrentTime();
		if (ts <= this.LastTick || (ts > 0 && 1 !== this.Player.getPlayerState())) return;
		this.Shots.forEach((s) => {
			const cmd = s.tick(ts);
			if(cmd && this[cmd]) this[cmd]();
		});
		this.LastTick = ts;
	}	// }}}
	async play (ctrl) {
		// {{{
		ctrl.innerHTML = "<span style='flex:1 1 auto;'></span><span data-h='m:pause'>⏯️</span>";
		this.Player = new (await YouTubeLoader).Player('YTPlayer', {
			videoId: this.VideoID,
			playerVars: {
				'controls': 1, // Show player controls
				'rel': 0,      // Disable related videos at end
				'modestbranding': 1 // Less intrusive branding
			},
			events: {
				'onReady': () => { // onPlayerReady,
					this.Player.playVideo();
				},
				'onStateChange': () => { // onPlayerStateChange
				}
			}
		});
	}	// }}}
	async pause () { this.Player[1===this.Player.getPlayerState() ? "pauseVideo" : "playVideo"](); }
}

class MediaList {
/*
	static invoke (e, ...a) {
		// {{{
		e.dispatchEvent(((evt) => {
			evt.initEvent("invokeHandler", true, true);
			evt.args = a;
			return evt;
		})(document.createEvent("Event")));
	}	// }}}
*/
	constructor (e) {
		// {{{
		this.E = e;

		// 建立播放清單
		let list = Array.from(e.querySelectorAll('[data-media]')).map((m) => MediaItem.create(m));

		// 建立播放界面
		e.innerHTML=`<div class='fill' style='position:relative'>
<div data-uid='canvas' class='fill' style='position:absolute;overflow:auto;'></div>
<div data-uid='control' style='position:absolute;left:5%;top:0;width:90%;padding:2px 4px;opacity:0;background-color:rgba(255,255,255,0.7)'>
	<div style='text-align:right;'>
		<span>
			<span data-h='prev'> &lt;&lt; </span>
			<output data-uid='pager' type='number'></output>
			<span data-h='next'> &gt;&gt; </span>
		</span>
	</div>
	<div data-uid='mctrl' class='row'>
	</div>
</div>
</div>`;

		this.PlayList = list;
		this.Current = 0;

		((C) => {
			C.addEventListener('mouseover', (evt) => C.style.opacity='1');
			C.addEventListener('mouseout', (evt) => C.style.opacity='0');
			C.addEventListener("click", (evt) => {
				evt.stopPropagation();
				evt.preventDefault();
				for (let e=evt.target; e!==C; e=e.parentNode) if (e.dataset.h) {
					const h = e.dataset.h.split(":");
					switch (h[0]) {
					case 'next': this.Current='+1'; break;
					case 'prev': this.Current='-1'; break;
					case 'm': this.PlayList[this.Current][h[1]](evt); break;
					}
					return;
				}
			});
		})(this.E.querySelector('[data-uid="control"]'));
/*
		((T)=>{
			if (e.__Handler__) e.removeEventHandler("invokeHandler", e.__Handler__);
			e.__Handler__ = (evt)=>T[evt.args.shift()](...evt.args);
			e.addEventListener("invokeHandler", e.__Handler__, false);
		})(this);
*/
	}	// }}}
	tick (on) {
		if (this.CurrentMedia) this.CurrentMedia[on ? "tick" : "pause"]();
	}
	set Current (v) {
		// {{{
		const [C, P, MC] = ['canvas', 'pager', 'mctrl'].map(
			(k) =>
			this.E.querySelector('[data-uid="'+k+'"]')
		);
		this.CurrentMedia = undefined;
		let cur = this.Current;
		if ('string' === typeof(v))
			cur = Math.floor(
				({
					'+':(a,b)=>a+b,
					'-':(a,b)=>a-b,
					'*':(a,b)=>a*b,
					'/':(a,b)=>a/b
				}[v[0]]||(() => parseFloat(v)))
				(cur, parseFloat(v.substring(1)))
			);
		else if ('number' === typeof(v)) cur = Math.floor(v);

		if (this.PlayList.length > 0)
			((PL, cur) => {
				cur = (cur+PL.length)%PL.length;
				while (C.firstChild) C.removeChild(C.firstChild);
				C.appendChild(PL[cur].E);
				while (MC.firstChild) MC.removeChild(MC.firstChild);
				(this.CurrentMedia=PL[cur]).play(MC);
				P.value=cur+1;
			})(this.PlayList, cur);
	}	// }}}
	get Current () { return this.E.querySelector('[data-uid="pager"]').value-1; }
}

SCRIPT.value=async function (slide, elem) {

	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');
	const ML = new MediaList(elem);
	window.Apps.queryContainer(elem,'section').tick = (v) => ML.tick(v);
};

})(document.currentScript);
