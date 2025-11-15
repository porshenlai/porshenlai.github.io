#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const FILE_PATH = process.argv[2];
async function processLineByLine() {
	// 1. Validate that a filename was provided
	if (!FILE_PATH) {
		console.error('Error: Please provide a filename as a command-line argument.');
		console.log('Usage: node read_file_arg.js <filename>');
		return;
	}
	
	try {
		// 2. Check if the file exists before attempting to read
		if (!fs.existsSync(FILE_PATH)) {
			console.error(`Error: File not found at path: ${FILE_PATH}`);
			return;
		}

		// 3. Create a readable stream from the file
		const fileStream = fs.createReadStream(FILE_PATH);

		// 4. Create the readline interface
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity 
		});

		let records=[], record=undefined;

		// Event listener for each line read
		rl.on('line', (line) => {
			line = line.trim();
			let m=/^\[(.*)\]$/.exec(line);
			if (m) {
				if (record) records.push(record);
				record={"Q":"","O":[],"C":m[1].split(',').map((v)=>v.trim())};
			} else {
				if (line.startsWith('o'))
					record.O.push([line.substr(2),1]);
				else if (line.startsWith('x'))
					record.O.push([line.substr(2),0]);
				else record.Q+=line;
			}
		});

		// Event listener for when the file reading is complete
		rl.on('close', () => {
			if (record) records.push(record);
			let Answer={},HTML;
			HTML=records.reduce((r,row,i)=>{
				let O="",
					ans=row.O.reduce((r,v,i)=>{ if(v[1]) r.push(i); return r; },[]);
				if (ans.length>1) {
				} else {
					O="<section>\n<div qi='"+(i+1)+"' qt='s' qc='"+row.C.join(",")+"'>"
					O+="\n	"+row.Q+"\n";
					O+=row.O.map((v,i)=>"	<div qo='"+(i+1)+"'>"+v[0]+"</div>\n").join("");
					O+="</div>\n</section>\n";
					Answer[(i+1).toString()]=(1+ans[0]);
				}
				r.push(O);
				return r;
			},[]);
			console.log("<div id='content' AID='"+btoa(JSON.stringify(Answer))+"'>\n"+HTML.join("\n")+"\n</div>\n");
		});

	} catch (err) {
		// Handle potential errors during stream creation or reading
		console.error(`An unexpected error occurred:`, err);
	}
}

// Execute the main function
processLineByLine();
