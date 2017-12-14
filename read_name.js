var fs = require('fs');
var p = require('path');

var name = [];
name[0] = 'name' + '\t' + 'instruction';
var readFolder = function(path) {
	var files = [];
	var names = [];
	names.push(name[0]);
	if(fs.existsSync(path)){
		files = fs.readdirSync(path);
		files.forEach(function(file, index){
			names.push(file + '\t' + '√');
		})
	}
	console.log(names);
	return name = names;
}

readFolder('../models');


	fs.writeFile('input.txt',name.join('\n'),function(err){
		if(err){
			return console.log(err);
		}
	})
