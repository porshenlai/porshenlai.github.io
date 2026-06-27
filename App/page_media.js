(function(SCRIPT){

if (!document.head.querySelector('style[data-cssid="Media"]')) (()=>{
	const SE=document.createElement("style");
	SE.dataset.cssid='Media';
	SE.innerHTML=`
.MediaItem, .MediaItem [data-dur], .MediaItem [data-ts] {
	position:absolute; left:0; top:0; width:100%; height:100%; overflow:hidden;
	border:0; margin:0; padding:0;
}
.MediaItem { position:relative; }
`;
	document.head.appendChild(SE);
})();

class MediaShot {
	constructor (e)
	{	// {{{
		this.E=e;
		this.S=Array.from(this.E.querySelectorAll('[data-dur]'));
		this.S.forEach((m)=>{
			if (m.dataset.image) {
				m.style.background=`url('${m.dataset.image}') no-repeat 50% 50%/contain`;
			}
		});
		this.Dur=undefined;
		this.TS=this.E.dataset.ts;
		if (this.TS.endsWith('+')) {
			this.TS=this.TS.substring(0,this.TS.length-1);
			this.Dur=this.S.reduce((r,e)=>r+parseInt(e.dataset.dur),0);
		}
		this.TS=parseInt(this.TS);
	}	// }}}
	tick (ts)
	{	// {{{
		let cur=undefined, t=ts;
		t-=this.TS;
		console.log("Tick ",ts);
		if (t>=0) {
			if (this.Dur) t%=this.Dur;
			cur=this.S.find((e)=>(t-=parseInt(e.dataset.dur))<=0);
		}
		if (cur) {
			this.E.classList.remove('hide');
			Array.from(this.E.querySelectorAll('[data-dur]'))
			.forEach((e)=>e.classList[e===cur?'remove':'add']('hide'));
		} else this.E.classList.add('hide');
	}	// }}}
}

class MediaItem {
	static create (e)
	{	// {{{
		let url=e.dataset.media;
		if (e.parentNode) e.parentNode.removeChild(e);

		if (url.startsWith('https://www.youtube.com/watch?')) {
			url=url.substring(30).split('&').reduce((r,v)=>{
				v=/([^=]+)=(.*)/.exec(v);
				if (v) r[v[1]]=v[2];
				return r;
			},{});
			return new YouTubeItem(e,url.v);
		}

		const ext=(/.*\.([^\.]+)(\?.*)?/.exec(url)||[null,''])[1].toLowerCase();
		switch ({
			jpg:"I",jpeg:"I",png:"I",gif:"I",
			mp4:"V",mp3:"A"
		}[ext]) {
		case "I": return new ImageItem(e,url);
		case "A": return new AudioItem(e,url);
		case "V": return new VideoItem(e,url);
		}
	}	// }}}
	static createDOM (s)
	{	// {{{
		const C=document.createElement("div");
		C.innerHTML=s;
		return C.firstChild;
	}	// }}}
	constructor (e)
	{	// {{{
		e.classList.add('MediaItem');
		this.E = e;
		this.Shots = Array.from(e.querySelectorAll('[data-ts]')).map((e)=>new MediaShot(e));
		this.LastTick=-1;
	}	// }}}
	tick () {}
	play (ctrl) {}
}

class AudioItem extends MediaItem {
	constructor (e)
	{	// {{{
		super(e);
		e.appendChild(
			this.A = MediaItem.createDOM(`<audio controls>
<source type="audio/mp3" src="${e.dataset.media}"/>
Not supported: &lt;audio&gt;
</audio>`)
		);
	}	// }}}
	play (ctrl)
	{	// {{{
		ctrl.appendChild(this.A);
	}	// }}}
	tick ()
	{	// {{{
		const ts = this.A ? this.A.currentTime : 0;
		if (ts<=this.LastTick) return;
		this.Shots.forEach((s)=>s.tick(ts));
		this.LastTick=ts;
	}	// }}}
}

class VideoItem extends MediaItem {
	play (ctrl)
	{	// {{{
		ctrl.innerHTML=`
	<span style='flex:1 1 auto;'></span>
	<span data-h='m:pause'>⏯️</span>
`;
		this.V = MediaItem.createDOM(`<video width="100%" height="100%" controls>
<source type="video/mp4" src="${this.E.dataset.media}"/>
Not supported: &lt;video&gt;
</video>`);
		this.V.addEventListener('loadedmetadata', ()=>{
			const [vw,vh]=[this.V.videoWidth,this.V.videoHeight];
			const cr=this.E.parentNode.getBoundingClientRect();
			const gr=[1,1,1,1];
			if (vw*cr.height > vh*cr.width) {
				gr[0]=cr.width;
				gr[1]=Math.floor(cr.width/vw*vh);
			} else {
				gr[0]=Math.floor(cr.height/vh*vw);
				gr[1]=cr.height;
			}
			gr[2]=Math.floor((cr.width-gr[0])/2);
			gr[3]=Math.floor((cr.height-gr[1])/2);
			['width','height','left','top'].forEach((n,i)=>this.E.style[n]=gr[i]+'px');
			console.log(gr);
		});
		this.E.appendChild(this.V);
	}	// }}}
	tick ()
	{	// {{{
		const ts = this.V ? this.V.currentTime : 0;
		if (ts<=this.LastTick) return;
		this.Shots.forEach((s)=>s.tick(ts));
		this.LastTick=ts;
	}	// }}}
	pause (v)
	{	this.V[this.V.paused?"play":"pause"](); }
}

class ImageItem extends MediaItem {
	constructor (e)
	{	// {{{
		super(e);
		this.I = ((ee)=>{
			ee.classList.add('fill','col');
			e.appendChild(ee);
			return ee;
		})(document.createElement("div"));

	}	// }}}
	play (ctrl)
	{	// {{{
		this.E.style.width=this.E.style.height='100%';
		const img=new Image();
		img.addEventListener('load',()=>{
			this.Size=[img.width,img.height];
			this.scale('Contain');
		});
		img.src=this.E.dataset.media;
		this.I.style.background=`url("${img.src}") no-repeat 50% 50%/contain`;

		ctrl.innerHTML=`<select data-h='m:scale'>
	<option value='-'>Scale</option>
	<option value='Contain'>Contain</option>
	<option value='Cover'>Cover</option>
</select>
<input data-h='m:scale' style='flex:1 1 auto' value='1' type='range' min='0.5' max='2' step='0.1'></input>`;
		this.Since=(new Date()).getTime();
	}	// }}}
	tick ()
	{	// {{{
		const ts = ((new Date()).getTime()-this.Since)/1000;
		if (ts<=this.LastTick) return;
		this.Shots.forEach((s)=>s.tick(ts));
		this.LastTick=ts;
	}	// }}}
	scale (v)
	{	// {{{
		this.E.style.width=this.E.style.height='100%';
		const CSize=((cr)=>[
			Math.floor(cr.width),
			Math.floor(cr.height)
		])(this.E.parentNode.getBoundingClientRect());

		if (v instanceof Event)
			v=v.target;
		if (v instanceof Element) {
			const VVALUE=v.value;
			if (v.tagName==='SELECT')
				v.value = '-';
			v=VVALUE;
		}
		if ('string'===typeof(v)) {
			switch (v) {
			case 'Cover':
				((cw,ch,iw,ih)=>{
					console.log("DEBUG",cw,ch,iw,ih,iw*ch<ih*cw);
					v = iw*ch<ih*cw ? 1 : ch*iw/ih/cw;
					console.log("RESULT is ",v);
				})(...CSize,...this.Size);
				console.log("v scale is ",v);
				break;
			case 'Contain':
				((cw,ch, iw, ih) => {
					v = iw*ch>ih*cw ? 1 : ch*iw/ih/cw;
				})(...CSize,...this.Size);
				break;
			default:
				v=parseFloat(v);
				if (!v) return;
			}
		}
		((s,p)=>{
			const [w,h] = [
				Math.floor(100*v),
				Math.floor(100*v*this.Size[1]*CSize[0]/this.Size[0]/CSize[1])
			]
			s.width=w+'%';
			s.height=h+'%';
			s.left=w<100 ? Math.floor((100-w)/2)+'%' : 0;
			s.top=h<100 ? Math.floor((100-h)/2)+'%' : 0;
			if (w>100) p.scrollLeft=Math.floor((p.scrollWidth-CSize[0])/2);
			if (h>100) p.scrollTop=Math.floor((p.scrollHeight-CSize[1])/2);
		})(this.E.style, this.E.parentNode);
		return v;
	}	// }}}
}

let YouTubeLoader=undefined;
class YouTubeItem extends MediaItem {
	constructor (e, id)
	{	// {{{
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
	async play (ctrl)
	{	// {{{
		ctrl.innerHTML=`<span style='flex:1 1 auto;'></span>
<span data-h='m:pause'>⏯️</span>`;
		this.Player = new (await YouTubeLoader).Player('YTPlayer', {
			videoId: this.VideoID,
			playerVars: {
				'controls': 1, // Show player controls
				'rel': 0,      // Disable related videos at end
				'modestbranding': 1 // Less intrusive branding
			},
			events: {
				'onReady': () => { // onPlayerReady,
					console.log('onReady');
				},
				'onStateChange': () => { // onPlayerStateChange
					console.log('onStateChange');
				}
			}
		});
	}	// }}}
	tick ()
	{	// {{{
		if (!this.Player.getCurrentTime) return;
		const ts = this.Player.getCurrentTime();
		if (ts<=this.LastTick) return;
		this.Shots.forEach((s)=>s.tick(ts));
		this.LastTick=ts;
	}	// }}}
	pause (v)
	{	this.Player[1===this.Player.getPlayerState() ? "pauseVideo" : "playVideo"](); }
}

/*
        const PAUSE_POINTS = [
            { time: 10, info: "Point 1: Introduction to the main theme. Note the setting and initial camera work. What tone does the speaker immediately establish?" },
            { time: 35, info: "Point 2: The speaker introduces their first major argument supported by a historical fact. Discuss the credibility of the source mentioned." },
            { time: 70, info: "Point 3: A compelling visual metaphor is used here. How does this visual aid reinforce the speaker's message? Consider the intended emotional impact." },
            { time: 105, info: "Point 4: Call to action is initiated. What specific steps does the speaker suggest the audience should take?" }
        ];

        // --- Global Variables ---
        let player;
        let timeCheckInterval;
        let handledPausePoints = new Set();
        const discussionPanel = document.getElementById('discussion-panel');
        const discussionText = document.getElementById('discussion-text');
        const resumeButton = document.getElementById('resume-button');
        const statusMessage = document.getElementById('status-message');

        // --- YouTube Player Initialization ---

        // This function is automatically called by the YouTube IFrame API script when it loads.
        function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
                videoId: VIDEO_ID,
                playerVars: {
                    'controls': 1, // Show player controls
                    'rel': 0,      // Disable related videos at end
                    'modestbranding': 1 // Less intrusive branding
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        // --- Event Handlers ---

        function onPlayerReady(event) {
            // Start playing immediately if preferred, or wait for user interaction.
            // event.target.playVideo(); 
            statusMessage.textContent = "Player is ready. Click the video to start playback.";
            // Attach resume logic
            resumeButton.addEventListener('click', resumePlayback);
        }

        function onPlayerStateChange(event) {
            // Check for playing state (State 1)
            if (event.data === YT.PlayerState.PLAYING) {
                statusMessage.textContent = "Video is currently playing...";
                startIntervalTimer();
            } 
            // Check for paused state (State 2)
            else if (event.data === YT.PlayerState.PAUSED) {
                // If it was paused *manually* by the user, we should stop the timer but not show the panel (unless it was triggered by the time logic)
                statusMessage.textContent = "Video is paused.";
                clearInterval(timeCheckInterval);
            }
            // Check for ended state (State 0)
            else if (event.data === YT.PlayerState.ENDED) {
                statusMessage.textContent = "Video playback finished.";
                clearInterval(timeCheckInterval);
            }
        }

        // --- Core Logic ---

        // Starts the timer that periodically checks the video's current time.
        function startIntervalTimer() {
            // Clear any existing timer to prevent duplicates
            clearInterval(timeCheckInterval);

            // Check the time every 500 milliseconds (0.5 seconds)
            timeCheckInterval = setInterval(checkTime, 500);
        }

        // Checks the current video time against the defined pause points.
        function checkTime() {
            if (player && typeof player.getCurrentTime === 'function') {
                const currentTime = player.getCurrentTime();

                // Find a pause point that hasn't been handled yet and whose time is now or in the immediate past
                const pointToTrigger = PAUSE_POINTS.find(point => 
                    !handledPausePoints.has(point.time) && currentTime >= point.time
                );

                if (pointToTrigger) {
                    clearInterval(timeCheckInterval); // Stop checking the time
                    handledPausePoints.add(pointToTrigger.time); // Mark as handled
                    
                    pauseAndDisplayInfo(pointToTrigger);
                }
            }
        }

        // Pauses the video and shows the discussion panel with relevant info.
        // @param {Object} point - The pause point object { time, info }
        function pauseAndDisplayInfo(point) {
            // Pause the video playback
            player.pauseVideo();
            statusMessage.textContent = `Paused at ${formatTime(point.time)} for discussion.`;

            // Update the discussion panel content
            discussionText.innerHTML = `<strong>(Time: ${formatTime(point.time)})</strong> ${point.info}`;

            // Show the discussion panel with animation
            discussionPanel.classList.remove('hidden', 'opacity-0', 'scale-95');
            discussionPanel.classList.add('opacity-100', 'scale-100');
        }

        // Resumes video playback and hides the discussion panel.
        function resumePlayback() {
            // Hide the discussion panel with animation
            discussionPanel.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                discussionPanel.classList.add('hidden');
            }, 300); // Wait for animation to finish before hiding

            // Resume playback and restart the timer
            player.playVideo();
            startIntervalTimer();
        }

        // Formats seconds into a M:SS string.
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

    </script>
*/

class MediaList {
	static invoke (e, ...a)
	{	// {{{
		e.dispatchEvent(((evt)=>{
			evt.initEvent("invokeHandler",true,true);
			evt.args=a;
			return evt;
		})(document.createEvent("Event")));
	}	// }}}
	constructor (e)
	{	// {{{
		this.E = e;
		for (let ee=e; ee; ee=ee.parentNode) if (ee.tagName==='SECTION') { this.SE=ee; break; }

		// COLLECT PLAYLIST DATA
		let list = Array.from(e.querySelectorAll('[data-media]')).map((m)=>MediaItem.create(m));

		// CREATE USER INTERFACE
		e.innerHTML=`<div class='fill' style='position:relative'>
	<div data-uid='canvas' class='fill' style='position:absolute;overflow:auto;'></div>
	<div data-uid='control' style='position:absolute;left:0;top:0;width:100%;padding:2px 4px;opacity:0;background-color:rgba(255,255,255,0.7)'>
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

		((C)=>{
			C.addEventListener('mouseover', (evt)=>C.style.opacity='1');
			C.addEventListener('mouseout', (evt)=>C.style.opacity='0');
			C.addEventListener("click", (evt)=>{
				evt.stopPropagation();
				evt.preventDefault();
				for (let e=evt.target;e!==C;e=e.parentNode) if (e.dataset.h) {
					const h=e.dataset.h.split(":");
					switch (h[0]) {
					case 'next': this.Current='+1'; break;
					case 'prev': this.Current='-1'; break;
					case 'm': this.PlayList[this.Current][h[1]](evt); break;
					}
					return;
				}
			});
		})(this.E.querySelector('[data-uid="control"]'));

		((T)=>{
			if (e.__Handler__) e.removeEventHandler("invokeHandler",e.__Handler__);
			e.__Handler__ = (evt)=>T[evt.args.shift()](...evt.args);
			e.addEventListener("invokeHandler",e.__Handler__,false);
		})(this);

		const TimerID=setInterval(()=>{
			if (this.SE.classList.contains('current')) {
				if (this.CurrentMedia)
					this.CurrentMedia.tick();
			} else {
				clearInterval(TimerID);
				console.log("Timer Canceled");
			}
		},200);
	}	// }}}
	set Current (v)
	{	// {{{
		const [C,P,MC] = ['canvas','pager','mctrl'].map((k)=>this.E.querySelector('[data-uid="'+k+'"]'));
		this.CurrentMedia=undefined;
		let cur=this.Current;
		if ('string'===typeof(v))
			cur=Math.floor(
				({
					'+':(a,b)=>a+b,
					'-':(a,b)=>a-b,
					'*':(a,b)=>a*b,
					'/':(a,b)=>a/b
				}[v[0]]||(()=>parseFloat(v)))
				(cur, parseFloat(v.substring(1)))
			);
		else if ('number'===typeof(v)) cur=Math.floor(v);

		((PL, cur)=>{
			cur=(cur+PL.length)%PL.length;
			while(C.firstChild) C.removeChild(C.firstChild);
			C.appendChild(PL[cur].E);
			while (MC.firstChild) MC.removeChild(MC.firstChild);
			(this.CurrentMedia=PL[cur]).play(MC);
			P.value=cur+1;
		})(this.PlayList, cur);
	}	// }}}
	get Current ()
	{	return this.E.querySelector('[data-uid="pager"]').value-1; }
}

SCRIPT.value=async function (slide, elem) {
	if (elem.classList.contains('resolved')) return;
	elem.classList.add('resolved');

	if (!elem.querySelector('[data-media]'))
		elem.innerHTML='<div data-media="'+elem.innerHTML+'"></div>';
	new MediaList(elem);
};

})(document.currentScript);
