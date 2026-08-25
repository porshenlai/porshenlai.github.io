let cfg=[
	"https://d288slw6nyxep2.cloudfront.net/20260216-BerninaExpress/111537.jpg",
	[	0,
		[3,"html:0-3 seconds"],
		[5,"html:3-8 seconds"]
	],
	"https://www.w3schools.com/html/movie.mp4",
	[ 0,"style:height:50%;width:50%",
		[5,"style:border:1px solid red","text:TEST-1"],
		[0,"style:border:1px solid red;background:rgba(255,255,255,0.5)","text:TEST-2"]
	],
	"https://d288slw6nyxep2.cloudfront.net/music/260217-米蘭・時空的交響.mp3",
	[	"0+",
		[3,"image:https://d288slw6nyxep2.cloudfront.net/20260216-BerninaExpress/111537.jpg"],
		[3,"image:https://d288slw6nyxep2.cloudfront.net/20260216-BerninaExpress/104722.jpg"],
		[3,"image:https://d288slw6nyxep2.cloudfront.net/20260216-BerninaExpress/100005_V.jpg"],
		[3,"image:https://d288slw6nyxep2.cloudfront.net/20260216-BerninaExpress/115114.jpg"],
		3,
		[5, "text:Hello World"],
		[5, "text:Hello Kitty"]
	],
	"https://www.youtube.com/watch?v=7kCb_aV3RGg",
	[	0,
		[10, "html:<span style='background:white;'>Youtube Video</span>"],
		[0, "html:<span style='background:white;'>Paused</span>"]
	]
];

let r=cfg.reduce((r,i)=>{
	if ('string'===typeof(i)) {
		r.push({h:`<div data-media="${i}">`,t:'</div>'});
	} else
	if (Array.isArray(i)) {
		r[r.length-1].h+=i.reduce((r,j)=>{
			let t=r[r.length-1];
			if (Array.isArray(j)) {
				t.ready=true;
				//r.push({});
			} else if (t.ready) {
				r.push({ts:j});
			} else t.x=j;
			return r;
		},[{}]).map((i)=>JSON.stringify(i)).join('\n');
	}
	return r;
},[]).map((i)=>i.h+i.t);
console.log(r);
/*
	<div data-c="foreach:" data-v="data:media:m"/>
		<div data-c="foreach:s" data-v="data:ts:ts">
			<div data-v="data:dur:dur;html:html;style:style"></div>
		</div>
	</div>
*/
