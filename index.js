const http = require("http");
const fs = require("fs");
const port = process.env.PORT || 3000;


let server = http.createServer((req, res)=>{
	console.log(req.method);

	if (req.method == "GET") {
		app.get(req, res);
	}else if(req.method == "POST"){
		app.post(req, res);
	}
}).listen(port, console.log('server is ready'));

let app = {
	path: __dirname
}

app.get = (req, res)=>{
		console.log("here", typeof req.url)	
	if (req.url.toString().endsWith("/") && req.url.toString().length === 1) {
		res.writeHead(200, {"Content-Type": "text/html"});
		pipeStaticFileForResponse(__dirname+req.url+"index.html", res);
	}
	if (req.url.toString().endsWith(".html")){
		res.writeHead(200, {"Content-Type": "text/html"});
		pipeStaticFileForResponse(app.path+req.url, res);
	}else if (req.url.toString().endsWith(".css")) {
		res.writeHead(200, {"Content-Type": "text/css"});
		pipeStaticFileForResponse(app.path+req.url, res);
	} else {
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.end()
	}
	console.log('get', server._connectionKey);
}

app.post = (req, res)=>{
	console.log('post')
	if (req.url =="/login") {
		let info = "?"
		req.on("data", (chunk)=>{
			info +=chunk.toString()
		});
		req.on("end", ()=>{
			info = queryToJson(info)
			info.userPassword = hash(info.userPassword);
			// console.log(info);
			fs.readFile("userdb.json", "utf8", (err, data)=>{
				if (err) {throw new Error("file writing issue")}
				data=JSON.parse(data);
				for (i in data) {
					console.log('here')
					if(data[i].userEmail == info.userEmail 
						&& data[i].userPassword == info.userPassword){
						res.end("Thanks for login. We will send infomations to you at "+ info.userEmail);
						break;
					}
					if (i == data.length-1) {
						res.end("<h1> wrong email or password </h1>");
					}
				}
			});
		});
	}else if (req.url =="/reg") {
		let info = "?"
		req.on("data", (chunk)=>{
			info +=chunk.toString()
		});
		req.on("end", ()=>{
			info = queryToJson(info)
			info.userPassword = hash(info.userPassword);
			// console.log(info);

			fs.readFile("userdb.json", "utf8", (err, data)=>{
				if (err) {throw new Error("file writing issue")}
				// console.log(data);
				data=JSON.parse(data);
				data.push(info);
				fs.writeFile("userdb.json", JSON.stringify(data), (err)=>{
					if (err) {throw new Error("file writing issue")}
					// console.log("done")
				});
			});
			res.end("Thanks for registering with us. We will send infomations to you at "+ info.userEmail)
		});
	}
}

let error404 =(res)=>{
	res.end(`<h1> File Not Found </h1>`);
}

let pipeStaticFileForResponse = (path, res)=>{
	console.log(typeof path, path);
	let st = fs.createReadStream(path);
	st.on("error", ()=>{
		error404(res);
	});
	st.pipe(res);
}

// special function
function queryToJson(link){
	if(link.indexOf('?') < 0){
		return "URL must contain query strings";
	}
	if(link){
		link = link.substring(link.indexOf('?')+1)
		.replace(/=/g, ' : ')
		.replace(/&/g, ' , ')
		.split(' ')
	}else{
		link = location.search.substring(1)
		.replace(/=/g, ' : ')
		.replace(/&/g, ' , ')
		.split(' ');
	}

	link=link.map((a)=>{
		return (a==':' || a==',')? a: a = `\"${a}\"`;
	})
	link = decodeURIComponent(`{${link.join('').replace(/\+/g, ' ')}}`);
	try{
		return JSON.parse(link);
	}catch(errmsg){
		console.log("error", errmsg);
		return "error in url query string"
	}
}

function hash(t) {
	let d = ""
	for (var i = 0; i < t.length; i++) {
		d+=(t.charAt()+""+t.charCodeAt(i))
	}
	return d.toString()
}