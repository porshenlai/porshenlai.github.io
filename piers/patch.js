(() => {
	if( !( "find" in Array.prototype ) )
		Array.prototype.find = function( cb, self ){
			var x;
			for( x=0; x<this.length; x++ )
				if( cb.call(self,this[x],x,this) )
					return this[x];
		};

	if( !( "assign" in Object ) )
		Object.assign = function(){
			var b,i,j;
			b = arguments[0];
			for( i=1; i<arguments.length; i++ ){
				for( j in arguments[i] )
					b[j] = arguments[i][j];
			}
			return b;
		};

	if( !( "keys" in Object ) )
		Object.keys = function(){
			var r=[];
			for (i in r)
				r.push(i);
			return r;
		};

	if( !FileReader.prototype.readAsBinaryString )
   		FileReader.prototype.readAsBinaryString = function( fileData ){
			var pt=this,binary="",reader;
			reader = new FileReader();
			reader.onload = function( e ){
				var bytes,length,evt,i;
				bytes = new Uint8Array( reader.result );
				length = bytes.byteLength;
				for( i=0; i<length; i++ )
					binary += String.fromCharCode(bytes[i]);
				pt.content = pt.IEResult = binary;
				DOM(pt).sendEvent("load");
   			};
			reader.readAsArrayBuffer(fileData);
		};
})();
