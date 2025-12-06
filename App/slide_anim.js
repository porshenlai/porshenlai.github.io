(function(SCRIPT){

class Animation
{
	constructor (RE,slide) {
		this.E=RE;
		this.Slide=slide;
		this.Ls=Array.from(RE.querySelectorAll('.aniFr'));
		this.Guide=RE.querySelector('.aniInit');
		this.Timer=this.Guide.querySelector('audio')||this.Guide.querySelector('video');
		if (this.Timer) this.Timer.addEventListener('ended', ()=>this.stop()); // 處理單曲播放結束
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
			for (let e of this.Ls) {
				let dur=(e.getAttribute("dur")||"").split('-');
				if (!dur[0]) continue;
				if (!dur[1]) {
					e.repeat=true;
					e.dur=[t,t+parseFloat(dur[0]),true];
					t=e.dur[1];
				} else e.dur=[dur[0],dur[1]];
			}
			for (let e of this.Ls) if (e.dur&&e.dur[2]) e.dur[2]=t;
		})();
		this.stop();
	}

	getTS () {
		if (this.Timer)
			return this.Timer.currentTime;
		return ((new Date()).getTime()-this.StartTS)/1000;
	}

	start () {
		this.StartTS=new Date().getTime();
		this.Guide.style.zIndex='-9000';
		this.Slide.setTickHandler(this.E.getAttribute('ani'),(t)=>this.sync(this.getTS()));
		if (this.Timer){
			this.Timer.play();
		}
		else {
			this.Cur=-1;
			this.flip(1);
		}
	}

	stop () {
		this.Slide.setTickHandler(this.E.getAttribute('ani'));
		delete this.StartTS;
		this.Guide.style.zIndex='9000';
	}

	sync (ts) {
		for (let e of this.Ls) if (e.dur) {
			if (
				(e.dur[0]<=ts && ts<e.dur[1])||
				(Math.floor((ts-e.dur[0])/e.dur[2])>Math.floor((ts-e.dur[1])/e.dur[2]))
			){
				if (!e.classList.contains('active'))
					this.activate(e);
			} else e.classList.remove('active');
		}
	}

	activate (e) {
		e.setAttribute("transition", ['slide','zoom','reveal'][Math.floor(Math.random()*3)]);
		setTimeout(()=>e.classList.add('active'), 0);
	}

	flip (shift) {
		let cur=this.Cur+shift;
		if(cur<0) cur=this.Ls.length-1;
		if(cur>=this.Ls.length) cur=0;
		this.Cur=cur;
		this.Ls.forEach((fr) => fr.classList.remove('active'));
		this.activate(this.Ls[cur]);
	}
}
SCRIPT.value=async function (slide) {
	if (!document.head.querySelector('style[STYID="Anim"]')) (()=>{ // install style
		const se=document.createElement('style');
		se.setAttribute("STYID","Anim");
		se.innerHTML=`
[ani] {width:100%;padding-top:50%;height:0;overflow:hidden;position:relative;}
.aniInit {position:absolute;left:0;top:0;right:0;bottom:0;background:white;z-index:-9000;}
.aniFr {position:absolute;left:0;top:0;right:0;bottom:0;opacity:0;transform:scale(1.1);z-index:0;}
.aniFr img {width:100%;height:100%;object-fit:contain;}
.aniFr.active {opacity:1;transform:scale(1);z-index:100;}
.aniFr[transition="slide"] {transition:all 1s ease-in-out;transform:translateX(100%);}
.aniFr[transition="slide"].active {transform:translateX(0);}
.aniFr[transition="zoom"] {transition:all 1s ease-in-out;transform:scale(1.5);opacity:0;}
.aniFr[transition="zoom"].active {transform:scale(1);opacity:1;}
.aniFr[transition="reveal"] {transition:all 1s ease-in-out;clip-path:circle(0% at 0 0);}
.aniFr[transition="reveal"].active {clip-path:circle(150% at 0 0);}
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
