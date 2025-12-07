(function(SCRIPT){

class Animation
{
	constructor (RE,slide) {
		this.E=RE;
		this.Slide=slide;

		// generate plan lists
		this.ALs=[]; // <div class='af' dur='...'>...</div>
		this.MLs=[]; // <div class='af' [action='...']>...</div>
		this.MLs.Cur=-1;
		this.Guide=undefined; // <div class='af' dur='0'>...</div>
		this.Ms=[]; // <audio>...</audio> | <video>...</video>
		this.Ms.Cur=-1;
		for (let e=this.E.firstChild;e;e=e.nextSibling) {
			if (e.nodeType!==1) continue;
			if (e.classList.contains('af')) {
				let dur=e.getAttribute('dur');
				if (dur!==undefined) {
					if ((''+dur)==='0')
						this.Guide=e;
					else this.ALs.push(e);
				} else this.MLs.push(e);
			} else if (/AUDIO|VIDEO/.exec(e.tagName)) {
				e.addEventListener('ended', ()=>this.stop(e)); // 處理單曲播放結束
				this.Ms.push(e);
			}
		}

		this.E.addEventListener('click', (event) => {
			let e,f;
			for(e=event.target;e&&e!==this.E;e=e.parentNode){
				const f=e.getAttribute("action");
				if (f) switch (f) {
					case 'next': this.flip(1); break;
					case 'prev': this.flip(-1); break;
					case 'stop': this.stop(); break;
					case 'start': this.start(); break;
				}
			}
		});

		(()=>{ // duration auto control preparation
			let t=0;
			for (let e of this.ALs) {
				let dur=(e.getAttribute("dur")||"").split('-');
				if (!dur[0]) continue;
				if (!dur[1]) {
					e.repeat=true;
					e.dur=[t,t+parseFloat(dur[0]),true];
					t=e.dur[1];
				} else e.dur=[dur[0],dur[1]];
			}
			for (let e of this.ALs) if (e.dur&&e.dur[2]) e.dur[2]=t;
		})();
		this.stop();
	}

	getTS () {
		if (this.Ms[this.Ms.Cur])
			return (this.Ms.Shift||0)+this.Ms[this.Ms.Cur].currentTime;
		return ((new Date()).getTime()-this.ALs.StartTS)/1000;
	}

	start () {
		this.ALs.StartTS=new Date().getTime();
		this.Guide.style.zIndex='-9000';
		this.Slide.setTickHandler(this.E.getAttribute('ani'),(t)=>this.sync(this.getTS()));
		for (let e of this.Ms) e.pause();
		if (this.Ms.length>0) this.Ms[this.Ms.Cur=0].play();
		if (this.MLs.length>0) { this.MLs.Cur=-1; this.flip(1); }
	}

	stop (e) {
		if (e) {
			e.pause();
			let n=1+this.Ms.indexOf(e);
			if (n<this.Ms.length) {
				n=this.Ms[this.Ms.Cur=n];
				this.Ms.Shift=0;
				for (e of this.Ms){ if (e==n) break; else this.Ms.Shift+=e.duration; }
				console.log("Shift is ",this.Ms.Shift);
				return n.play();
			}
			if (n<this.Ms.length) return this.Ms[this.Ms.Cur=n].play();
		} else for (let e of this.Ms) e.pause();
		this.Slide.setTickHandler(this.E.getAttribute('ani'));
		delete this.StartTS;
		this.Guide.style.zIndex='9000';
	}

	activate (e) {
		e.setAttribute("transition", ['slide','zoom','reveal'][Math.floor(Math.random()*3)]);
		setTimeout(()=>e.classList.add('active'), 0);
	}

	sync (ts) {
		console.log("SYNC:",ts);
		for (let e of this.ALs) if (e.dur) {
			if (
				(e.dur[0]<=ts && ts<e.dur[1])||
				(Math.floor((ts-e.dur[0])/e.dur[2])>Math.floor((ts-e.dur[1])/e.dur[2]))
			){
				if (!e.classList.contains('active'))
					this.activate(e);
			} else e.classList.remove('active');
		}
	}

	flip (shift) {
		let cur=this.MLs.Cur+shift;
		if(cur<0) cur=this.MLs.length-1;
		if(cur>=this.MLs.length) cur=0;
		this.MLs.Cur=cur;
		this.MLs.forEach((fr) => fr.classList.remove('active'));
		this.activate(this.MLs[cur]);
	}
}

SCRIPT.value=async function (slide) {
	if (!document.head.querySelector('style[STYID="Anim"]')) (()=>{ // install style
		const se=document.createElement('style');
		se.setAttribute("STYID","Anim");
		se.innerHTML=`
[ani] {width:100%;padding-top:50%;height:0;overflow:hidden;position:relative;}
.af {position:absolute;left:0;top:0;right:0;bottom:0;opacity:0;transform:scale(1.1);z-index:0;}
.af[dur="0"] {background:white;opacity:1;z-index:-9000;transform:scale(1);}
.af.active {opacity:1;transform:scale(1);z-index:100;}
.af[transition="slide"] {transition:all 1s ease-in-out;transform:translateX(100%);}
.af[transition="slide"].active {transform:translateX(0);}
.af[transition="zoom"] {transition:all 1s ease-in-out;transform:scale(1.5);opacity:0;}
.af[transition="zoom"].active {transform:scale(1);opacity:1;}
.af[transition="reveal"] {transition:all 1s ease-in-out;clip-path:circle(0% at 0 0);}
.af[transition="reveal"].active {clip-path:circle(150% at 0 0);}
.af img {width:100%;height:100%;object-fit:contain;}
`;
		document.head.appendChild(se);
	})();
	const list=Array.from(slide.Content.querySelectorAll('[ani]'));
	console.assert(list.length>0,`
Usage:
	<div ani="Animation_Name">
		<div class='aniFr'>Hello</div>
		<div class='aniFr'>World</div>
	</div>
`);
	return list.reduce((r,e)=>{
		r[e.getAttribute('ani')]=new Animation(e,slide);
		return r;
	},{});
};

})(document.currentScript);
