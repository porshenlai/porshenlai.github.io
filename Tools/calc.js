
console.log("TESTING...");

function calc (ss) {
	try {
		let ans=-1;
		ss=ss.replaceAll(/[^0-9+\-\*\/%\.]\(\),/g,'');
		eval('ans='+ss);
		return {"Ans":ans,"Eqn":ss};
	} catch (x) {
		return undefined;
	}
}
console.log(calc('(75,000-8,3.545*4)%(2**3)'));
