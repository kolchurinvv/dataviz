var fileLocation = "assets/datasets/sample-report.csv";
var rawData = null;
var subResult = null;
var results = {};
var colNames = [], camelColNames = [];
var conditions = null, possibleAnswers = {}, graphConditions = {};
var x=null, searchResults = []; 

// there might be a way to save them in one object in a way, that'd work with my search logic
conditions = [
	// {why: "Far less deadly than flying shards of metal in a dense city."},
	{vote: 'no'},
	// {location: "Oakland, CA, US"},
	{ageGroup: '35'},
 ];






// #figure out how the hell this works!!! ...
function csvToArray(text) {
    var p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l in text) {
        l = text[l];
        if ('"' === l) {
            if (s && l === p) {row[i] += l;}
            s = !s;
        } else if (',' === l && s) {l = row[++i] = '';}
        else if ('\n' === l && s) {
            if ('\r' === p) {row[i] = row[i].slice(0, -1);}
            row = ret[++r] = [l = '']; i = 0;
        } else {row[i] += l;}
        p = l;
    }
    return ret;
}

//pull data from CSV file @fileLocation
function read(fileURL){
	var newData=new XMLHttpRequest();
    newData.onreadystatechange = function() {
	    if (newData.readyState === 4 && newData.status === 200) {
	    	//saves newData contents to rawData asynchronously | use showData() 
	       rawData = this.responseText;
	    }
	};
    newData.open('GET',fileURL+"?="+Math.random(), true);
    newData.send(null);
}


// initialize "showDataCallback" every 500ms after showData() has been called,
// until rawData has been updated
var showData = setInterval(function(){showDataCallback();}, 500);

// if rawData has been updated,
function showDataCallback(){
	if(rawData !== null){
		// clear the interval
		clearInterval(showData);
		// do stuff to data ....
		subResult = csvToArray(rawData);
		// go through the names of the columns
		for (var x=0; x<subResult[0].length; x++){
			colNames.splice(x, 0, subResult[0][x]);
			// makes names of columns camelCase, removes '?' marks and populates colNames[]
			camelColNames.splice(x, 0, subResult[0][x].replace(/(?:^\w|[A-Z]|\b\w|\s+|[?])/g, function(match, index) {
				if (/\s+/.test(match)) {return "";}
				if (/[?]+/.test(match)) {return '';}
				return index === 0 ? match.toLowerCase() : match.toUpperCase();
			}));
		}
		// remove ids from camelColNames
		camelColNames.splice(0,1);
		//remove id from colNames, leaving it with all visible names
		colNames.splice(0,1);
		// remove first row with names of columns
		subResult.splice(0,1);
		// #testing: normalize the input ('' and "n/a" should become 'unknown')
		x = 0;
		for (x = 0; x<subResult.length; x++){
			for (var v in subResult[x]){
				if(!/[^\s]/.test(subResult[x][v])){subResult[x].splice(v, 1 , 'unknown');}
				if(/n\/a/.test(subResult[x][v])){subResult[x].splice(v, 1 , 'unknown');}
			}
		}
		x=0;

		var counter = null;

		// ----- creating final results{{}} and searching for entries ----- //


		for (var a in subResult){
			results[subResult[a][0]] = {};
			for (var b in camelColNames) {
				b = parseInt(b, 10);
				results[subResult[a][0]][camelColNames[b]] = subResult[a][b+1];
			}
			// searching for every entry that meets ALL the conditions
			searchResults[a] = [];
			for (var i in conditions){

				if (results[subResult[a][0]][Object.keys(conditions[i])] === conditions[i][Object.keys(conditions[i])])  {
				searchResults[a].splice(i,1,true);
				}
				if(searchResults[a].length === conditions.length){ counter++; }
			}
			//remove id numbers, leaving an array with all possible answers
			subResult[a].splice(0,1);
		}
		// --------- end of results and searching --------  //

		// ============== #figure out how to move this section into the camelCasing part
		for(var y in camelColNames){ // this is almost like for (var x=0; x<subResult[0].length; x++) only there should be an adjustmen of x
			possibleAnswers[camelColNames[y]] = {};
			for(var z in subResult){
				possibleAnswers[camelColNames[y]][subResult[z][y]] = 0;
			}
			for (var w in Object.keys(possibleAnswers[camelColNames[y]])){
				for (var r in subResult){
					if(subResult[r][y] === Object.keys(possibleAnswers[camelColNames[y]])[w]){
						possibleAnswers[camelColNames[y]][subResult[r][y]] += 1;
					}
				}
			}
		}
		// =====================
		 console.log(results);
		// console.log(subResult);
		console.log(possibleAnswers);
		// console.log(colNames);
		// console.log(searchResults);
		counter = null;
		searchResults = {};

		// ===================== #graph ========================= //

		// !important: you have to work with the results{{}} for creation of individual cells

		// create a 2d object with all conditions
		// cross-reference that with the results{{}} i pull from a file

		// start small (one subsection with all genders, whose answers qualify x/y conditions)
		//  build it as many times as needed



		x = 0;
		var k = 0;
		var div = null;
		var tNode = null;
		for(k; k<Object.keys(possibleAnswers.ageGroup).length; k++){
			div = document.createElement('div');
			tNode = document.createTextNode(Object.keys(possibleAnswers.ageGroup)[k]);
			div.appendChild(tNode);
			document.getElementById('x-axis').appendChild(div);
		}
		var lengthOfX = k;

		k=0;
		var h = 0;
		var subsection = null;
		var sections = document.getElementsByClassName('section');
		var genderCol = null;

		for (h=0; h<sections.length; h++){
			for (k=0; k<lengthOfX; k++){
				subsection = document.createElement('div');
				subsection.className = 'subsection';
				sections[h].appendChild(subsection);
			}
		}
		h=0;
		k=0;
		tNode = null;

		var allSubsections = document.getElementsByClassName('subsection');
		for (h=0; h<allSubsections.length;h++){
			for (x = 0; x<Object.keys(possibleAnswers.gender).length; x++){
				genderCol = document.createElement('div');
				genderCol.className = 'gender-col';
				genderCol.className += ' '+Object.keys(possibleAnswers.gender)[x];
				allSubsections[h].appendChild(genderCol);
			}
		}



		div = null;
		tNode = null;
		h=0;
		k=0;
		var putAfter = null;
		for (k; k< Object.keys(possibleAnswers.vote).length; k++){
			div = document.createElement('div');
			tNode = Object.keys(possibleAnswers.vote)[k];
			switch(tNode){
				case 'yes':
					div.className += ' sec0';
					break;
				case 'no':
					div.className += ' sec2';
					break;
				case 'maybe':
					div.className += ' sec1';
					break;
				case 'not sure':
					div.className += ' sec1';
					break;
				default:
					div.className += ' sec'+k;
			}
			tNode = document.createTextNode(tNode);
			div.appendChild(tNode);
			putAfter = document.getElementById('subtitles');
			putAfter.appendChild(div);

		}
		k=null;
		h=null;
		x=null;
		counter = null;
		var id = null;


		for (k in results){

			searchResults[k] = [];
			for (h =0; h<graphConditions.length; h++){
				for (x in graphConditions[h]){
					// console.log(x);
					// console.log(graphConditions[h][x]);
					// console.log(results[k][x] +' + '+graphConditions[h][x]);
					// if (results[k][x] === graphConditions[h][x]){
					// searchResults[k].splice(h,1,true);
					// }
					// if (searchResults[k].length === Object.keys(graphConditions[h]).length){
					// 	counter++;
					// 	// id = searchResults.indexOf(searchResults[k]).toString() + 
					// 	// document.getElementById(id).innerHTML = counter;
					// }
				}
			}
			counter = null;
			// console.log(searchResults[k]);
		}


	// ===================== ------ ========================= //
	}
}

 graphConditions = [
 	{vote: 'yes', ageGroup: '35', gender: 'male'},
 	{vote: 'yes', ageGroup: '35', gender: 'female'},
 	{vote: 'yes', ageGroup: '35', gender: 'other'},
 	{vote: 'yes', ageGroup: '35', gender: 'unknown'},
 	// {vote: 'yes', ageGroup: 'unknown', gender: 'male'},
 	// {vote: 'yes', ageGroup: 'unknown', gender: 'female'},
 	// {vote: 'yes', ageGroup: 'unknown', gender: 'other'},
 	// {vote: 'yes', ageGroup: 'unknown', gender: 'unknown'},
 ];

read(fileLocation);

