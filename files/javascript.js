import localforage from "./localForage/localforage.js"

//The arrays
var shuffled_items = new Array;
var grouped_answer = new Array;
var grouped_questions = new Array;
var group_list = new Array;
var correctAnswersArray = new Array;
var remix3correctanswersArray = new Array;
var answers = new Array;
var bgMusicArray = new Array;

//Fonts
var randomFonts = [
	'font-family: "Arial";', 'font-family: "Times New Roman";', 
	'font-family: "eightbit"; font-size: 2.3vw;', 'font-family: "Papyrus"; font-size: 2.1vw;',
	'font-family: "Comic Sans MS"; font-size: 2vw;', 'font-family: "xiaowei"; font-size: 2.5vw;'
];


var finishedmsg = 
["(;\u014F__\u014F) come on, you can do better than that",
"( \uA20D\u1D17\uA20D) nicely done! Now take the real test!"]

// The html thingies
// the ids
var questionId = document.getElementById("q_id");
var questionpicId = document.getElementById("questionimg_id");
var userinputId = document.getElementById("userinput_Id");
var trackerId = document.getElementById("title_id");
var questionZoomImageId = document.getElementById("questionimg_zoom_id");
var questionZoomImage_blurId = document.getElementById("questionimg_blur_id");
var quizgui = document.getElementById("isplaying_id");
var lowHealthId = document.getElementById("lowHealth_id");
var gameOverScreenId = document.getElementById("gameOverScreen_id");
var gameOverMessage = document.getElementById("gameOver_class_textF_id");
var loadingScreen = document.getElementById("loading_class_id");
var loadingScreenMsg = document.getElementById("loading_classText_id");

// buttons
var choice1Id = document.getElementById("c1_id");
var choice2Id = document.getElementById("c2_id");
var choice3Id = document.getElementById("c3_id");
var choice4Id = document.getElementById("c4_id");
var choiceIds = [choice1Id,choice2Id,choice3Id,choice4Id];
var restartButtonPract = document.getElementById("gameOver_class_textPR_id");
var restartButtonPanic = document.getElementById("gameOver_class_textP_id");

var isplayingid = document.getElementById("isplaying_id");
var characterid = document.getElementById("character_id");
var focusEfxId= document.getElementById("focus_efx_id");

//var correctscoreid = document.getElementById("correctscore_id");
//var showscoreid = document.getElementById("showscore_id");
//var timerid = document.getElementById("timer_id");

// audio
var crrct_audio = new Audio('files/sfx/crrct.wav');
var wrng_audio = new Audio('files/sfx/wrng.wav');
var restart_audio = new Audio('files/sfx/restart.wav');
var bg_music0;

var bg_music0_started = false;
var isremixmode = false;

// the variables (argh these are gibberish, maku when will you objECtifY ThEM)
var clickable = true;
var restartClickable = true;
var atquestion = 0;
var remix = 2;

var mistakes = 0;

var finished = false;

var remix3 = false;
var remix3mistakes = 0;

var interval;
var remix3interval;
var healthinterval;
var gameOverinterval;
var goToGameOverSceneInterval;

var fullScreenImage = false;
var randomNumberCache;


var health = 100;
var gameOver = false;


var currentBgMusic = 0;

// audio effects
var slightLowPassFilter = new Pizzicato.Effects.LowPassFilter({
    frequency: 400,
    peak: 10
});

var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
    frequency: 400,
    peak: 10
});

var reverb = new Pizzicato.Effects.Reverb({
	mix: 0.6,
	time: 3,
	decay: 1,
	reverse: false
});

var delay = new Pizzicato.Effects.Delay({
    feedback: 0.2,
    time: 0.1,
    mix: 0.2
});


// The functions
function intGameOverScene(){
	health = 0;
	clickable = false;
	gameOver = true;
	gameOverScreenId.style.transition = "3s";
	gameOverScreenId.className += " show";
	
	if (bg_music0_started && noMusic == false){
		bgMusicArray[currentBgMusic].sourceNode.playbackRate.value = 0.3;
	}
	

	clearInterval(healthinterval);
	goToGameOverSceneInterval = setInterval(showGameOverScrn,3000);	
}

function editHealth(damage){
	if (PanicMode){
		health = health + damage;

		var healthColor = ["39, 185, 26,0.2","251, 255, 0, 0.2","255, 0, 0, 0.2"];
		var selectColor = 0;

		if (health>50){
			selectColor = 0;
			lowHealthId.classList.remove("show");
		}
		if (health<50){
			selectColor = 1;
			lowHealthId.classList.remove("show");
		}
		if (health<20){
			selectColor = 2;
			lowHealthId.className += " show";
			//bg_music0.sourceNode.playbackRate.value = 0.5;
		}

		if (health<0){
			intGameOverScene();
			//bg_music0.sourceNode.playbackRate.value = 0.5;
		}	


		choice1Id.style.backgroundPosition = ""+(100-health)+"%";
		choice2Id.style.backgroundPosition = ""+(100-health)+"%";
		choice3Id.style.backgroundPosition = ""+(100-health)+"%";
		choice4Id.style.backgroundPosition = ""+(100-health)+"%";


		choice1Id.style.backgroundImage = ["linear-gradient(to right, rgba("+healthColor[selectColor]+") 50%", "rgba(255,0,0,0) 50%)"]
		choice2Id.style.backgroundImage = ["linear-gradient(to right, rgba("+healthColor[selectColor]+") 50%", "rgba(255,0,0,0) 50%)"]
		choice3Id.style.backgroundImage = ["linear-gradient(to right, rgba("+healthColor[selectColor]+") 50%", "rgba(255,0,0,0) 50%)"]
		choice4Id.style.backgroundImage = ["linear-gradient(to right, rgba("+healthColor[selectColor]+") 50%", "rgba(255,0,0,0) 50%)"]
	}
}

function deductHealth(){
	if (PanicMode){
		if (health>0){
			editHealth(drainBy);
		}
		
		if (health > 100){
			health = 100;
		}
	}
}

function mathRandom(min, max){
	var temp = Math.floor(Math.random() * ((max-1) - min + 1)) + min;
	if (min == max){
		temp = min;
	}
	randomNumberCache = temp;
	return temp;
}

function image(){
	if (fullScreenImage == false){
		questionZoomImage_blurId.className += " show";
		//questionZoomImageId.src = questionpicId.src;
		questionZoomImage_blurId.style.backgroundImage = ["url("+questionpicId.src+")"];
		quizgui.className += " blur";
		characterid.className += " blur";
		fullScreenImage = true;
		bgMusicArray[currentBgMusic].addEffect(slightLowPassFilter);
	} else {
		questionZoomImage_blurId.classList.remove("show");
		quizgui.classList.remove("blur");
		characterid.classList.remove("blur");
		fullScreenImage = false;
		bgMusicArray[currentBgMusic].removeEffect(slightLowPassFilter);
	}

}

function restartQuiz(){

	clearInterval(interval);
	clearInterval(healthinterval);
	clickable = true;
	restartClickable = true;
	atquestion = 0;
	remix = 2;
	answers = new Array;
	mistakes = 0;
	remix3 = false;
	interval = null;
	remix3interval = null;	
	finished = false;
	gameOver = false;

	shuffled_items = [];
	grouped_answer = [];
	grouped_questions = [];
	group_list = [];
	correctAnswersArray = []; 
	remix3correctanswersArray = [];	
	gameOverScreenId.style.backgroundImage = 'url()';
	healthinterval = setInterval(deductHealth,1);

	restartButtonPract.innerHTML = " Exam Mode :(";
	restartButtonPract.onclick = "";

	if (examMode == false){
		restartButtonPract.innerHTML = " Practice Mode ";	
		restartButtonPract.onclick = "gameOverRestart(1)";
	}

	restartButtonPanic.innerHTML = " Retry Panic Mode ";	
	restartButtonPract.classList.remove("textGO_restart");
	restartButtonPanic.classList.remove("textGO_restart");
	bgMusicArray[currentBgMusic].volume = 0.7;

	shuffled_items = shuffleQuestion(items);
	askquestion(shuffled_items[atquestion]);
	trackerId.innerHTML = shuffled_items[atquestion].group;
}

function checkDontInclude(array, check){
	for (var i=0; i<=check.length-1; i++){
		if (array == check[i]){
			return true;
		}
	}
	return false;
}

function scanIfExisted(array,check){
	if (array.includes(check)==true){
		//console.log("yay");
		return true;
	}
	return false;
}

function Shuffle(array, seperate){
	var temp = new Array;
	
	for (var i = array.length -1; i >= 0; i--) {
		temp[i] = array[i];
	}
	temp.sort(function(a, b){return 0.5 - Math.random()});
	var temp_String = temp.join(seperate);
	return temp_String;
}

function shuffleQuestion(array) { 
	var temp = new Array; // original array
	var temp2 = new Array; // group answer
	var temp2cache = new Array; // group list
	var temp3 = new Array; // group question
	var groupIndex = 0;	
	
	var currentIndex = 0


	for (var i = array.length - 1; i >= 0; i--){   
		
		// check muna kung included ba yung group sa [DontIncludeGroups]
		var isExclusion = DontIncludeGroups.includes(array[i].group);

		// check muna kung included ba yung group sa [DontIncludeGroups]
		if (isExclusion == false){
			temp[currentIndex] = array[i];
			// checks if a group exists within the temp2 
			if (temp2cache.includes(temp[currentIndex].group,0) == false){
				temp2cache.push(temp[currentIndex].group);
				//document.write(""+temp2cache+"<br/>");
				temp2.push([]);
				temp3.push([]);
			
				temp2[groupIndex].push(temp[currentIndex].answer);
				temp3[groupIndex].push(temp[currentIndex].question);
				//console.log(temp2[groupIndex]);
				groupIndex++;

			// if it does then..	
			}else{
				var indexlocation = temp2cache.indexOf(temp[currentIndex].group);
				//console.log("group "+temp[i].group+" located at "+indexlocation+"");
				temp2[indexlocation].push(temp[currentIndex].answer);
				temp3[indexlocation].push(temp[currentIndex].question);
			};
			currentIndex = currentIndex + 1;
		};
	};
	
	// randomizer
	temp.sort(function(a, b){return 0.5 - Math.random()});

	// put them into respective variables
	group_list = temp2cache;
	grouped_answer = temp2;
	grouped_questions = temp3;
	return temp; 
}

function generate4Questions(QuestionArray, GROUP_ANSWERS, QuestionOrAnswer){

	correctAnswersArray = [];
	answers = [];

	//mathRandom(min, max)
	var indexlocation = group_list.indexOf(QuestionArray.group);
	var rnd_ind = mathRandom(0, GROUP_ANSWERS[indexlocation].length-1);
	var rnd_correct_number = mathRandom(0, 3)
	var rnd_ans = mathRandom(0, GROUP_ANSWERS[indexlocation][rnd_ind].length); 
	
	// checks if it generated a correct answer to avoid duplications
	var HadAnswer = false;

	if (QuestionOrAnswer == "question"){
		rnd_ans = mathRandom(0, QuestionArray.answer.length);
		questionId.innerHTML = QuestionArray.answer[rnd_ans];
		//console.log(rnd_ans);
		rnd_ans = mathRandom(0, QuestionArray.question.length);
	}
	
	for (var i = 0; i <= 3; i++){
		rnd_ind = mathRandom(0, GROUP_ANSWERS[indexlocation].length); // ==> generate random number indexes from grouped_answer[whaat group]
		rnd_ans = mathRandom(0, GROUP_ANSWERS[indexlocation][rnd_ind].length); //  ==> generate random number indexes from grouped_answers[what group][what answers]
		
		answers[i] = GROUP_ANSWERS[indexlocation][rnd_ind][rnd_ans]; // choose what group, chooses what answer, chooses alternative answers
		choiceIds[i].innerHTML = answers[i] // print the answer in the choiceid innerhtml 
		
		// checks if its a question to generate or answer
		if (QuestionOrAnswer == "question"){
			if (scanIfExisted(QuestionArray.question, answers[i])){
				correctAnswersArray.push(choiceIds[i]); // adds the choicesId[i] to the correctAnswersArray
				HadAnswer = true;
			}
		} else {
			if (scanIfExisted(QuestionArray.answer, answers[i])){
				correctAnswersArray.push(choiceIds[i]); // adds the choicesId[i] to the correctAnswersArray
				HadAnswer = true;
			}				
		}		
	}	

	// checks if its a question to generate or answer
	if (HadAnswer == false){
		if (QuestionOrAnswer == "question"){
			rnd_ans = mathRandom(0, QuestionArray.question.length); 	
			answers[rnd_correct_number] = QuestionArray.question[rnd_ans] // put the question in the answers array
		}else{
			rnd_ans = mathRandom(0, QuestionArray.answer.length); 	
			answers[rnd_correct_number] = QuestionArray.answer[rnd_ans] // put the answer in the answers array
		}
	
		// print the correct 
		choiceIds[rnd_correct_number].innerHTML = answers[rnd_correct_number] // print the answer in the choiceid innerhtml 
		correctAnswersArray.push(choiceIds[rnd_correct_number]); // adds the choicesId[i] to the correctAnswersArray	
	}


	if (remix3){
		correctAnswersArray = [];
		
		for (var i = 0; i<QuestionArray.answer.length; i++){
			correctAnswersArray.push(QuestionArray.answer[i].toLowerCase()); 
		}
		choiceIds[3].innerHTML = "Confirm";
		
	}

}

function askquestion(array){

	clickable = true;
	
	answers = [];

	remix = mathRandom(0,RemixModeRarity + 5);

	if (PanicMode == false){
		remix = 0;
	}
	if (identificationMode == true){
		remix = 5;
	}
	
	// change font
	questionId.style = randomFonts[mathRandom(0, 6)]

	// question 
	var rnd_question = mathRandom(0, array.question.length);
	questionId.innerHTML = array.question[rnd_question]; // ==> the question

	var WhatToAsk = "answer";
	var WhatIsChoices = grouped_answer;
	questionpicId.src = array.picture;
	
	// if not remix 3
	//resets the classname of the choices
	choiceIds[0].className = " choice1";
	choiceIds[1].className = " choice2";
	choiceIds[2].className = " choice3";
	choiceIds[3].className = " choice4";
	questionpicId.className = "questionimg_class";
	userinputId.className = " hide";
	userinputId.value = "";
	characterid.className = "character_class"; 
	
	// Remix 2 : swaps question and answer
	if ((remix == 4 && array.picture == "slot/img/") && (checkDontInclude(array.group,DontIncludeFromRemix2) == false)){
		answers = [];
		WhatToAsk = "question";
		WhatIsChoices = grouped_questions;
		//console.log(WhatToAsk);
		bgMusicArray[currentBgMusic].addEffect(lowPassFilter);
		bgMusicArray[currentBgMusic].addEffect(reverb);
		bgMusicArray[currentBgMusic].addEffect(delay);
		bgMusicArray[currentBgMusic].volume = 0.1;
		isremixmode = true;

		characterid.className += " charactershow2";
		focusEfxId.className += " show";

		trackerId.innerHTML = "Panic mode!";
	}
	
	
	// Remix 3 : User must input the answer without choices
	if (remix == 5 && (checkDontInclude(array.group,DontIncludeFromRemix3) == false)){
		remix3 = true;
		remix3mistakes = 0;
		
		answers = [];
		userinputId.className = "remix3input";
		choiceIds[0].className += " hide";
		choiceIds[1].className += " hide";
		choiceIds[2].className += " hide";
		//correctAnswersArray = [];
		
		characterid.className += " charactershow";
		focusEfxId.className += " show";

		bgMusicArray[currentBgMusic].addEffect(lowPassFilter);
		bgMusicArray[currentBgMusic].addEffect(reverb);
		bgMusicArray[currentBgMusic].addEffect(delay);
		bgMusicArray[currentBgMusic].volume = 0.1;
		isremixmode = true;	
		
		trackerId.innerHTML = "Panic mode!";
	}


	//check if there's no picture
	if (array.picture=="slot/img/"){
		questionpicId.className += " hide";
	}

	generate4Questions(array,WhatIsChoices,WhatToAsk);	
	
	//console.log(grouped_list.includes(DontIncludeFromRemix[0]));
	//console.log(checkDontInclude(grouped_list,DontIncludeFromRemix));

	
	// Remix 1 : scrambles letters and words
	if (remix == 3 && (checkDontInclude(array.group,DontIncludeFromRemix1) == false)){
		choiceIds[0].innerHTML = Shuffle(answers[0],'');
		choiceIds[1].innerHTML = Shuffle(answers[1],'');
		choiceIds[2].innerHTML = Shuffle(answers[2],'');
		choiceIds[3].innerHTML = Shuffle(answers[3],'');
		//questionId.innerHTML = array.question[rnd_question].split(' ').sort(() => Math.floor(Math.random() * Math.floor(3)) - 1).join(' '); // ==> the question
		characterid.className += " charactershow";
		focusEfxId.className += " show";
		bgMusicArray[currentBgMusic].addEffect(lowPassFilter);
		bgMusicArray[currentBgMusic].addEffect(reverb);
		bgMusicArray[currentBgMusic].addEffect(delay);
		bgMusicArray[currentBgMusic].volume = 0.1;
		isremixmode = true;		

		trackerId.innerHTML = "Panic mode!";
	}


}

function goToNext(){
	if (shuffled_items.length != atquestion){
		trackerId.innerHTML = shuffled_items[atquestion].group;
		askquestion(shuffled_items[atquestion]);
		clearInterval(interval);
	} else {

		if (mistakes>=3){
			questionId.innerHTML = finishedmsg[0]; 
		}else{	
			questionId.innerHTML = finishedmsg[1];
		}

		bgMusicArray[currentBgMusic].stop();

		finished = true;
		choiceIds[0].className = " choice1";
		choiceIds[1].className = " choice2";
		choiceIds[2].className = " choice3";
		choiceIds[3].className = " choice4";
		questionpicId.className = "questionimg_class";
		userinputId.className = " hide";			
		questionpicId.className += " hide";
		characterid.className = "character_class"; 

		
		choiceIds[0].innerHTML = ("You answered "+atquestion+" questions");
		choiceIds[1].innerHTML = ("You have "+mistakes+" mistakes");
		choiceIds[2].innerHTML = "Press here for Panic Mode";
		
		if (examMode == false){
			choiceIds[3].innerHTML = "Press here for Practice Mode";
		}else{	
			choiceIds[3].innerHTML = "No Practice Mode >:)";
		}
		

		PanicMode = false;
		trackerId.innerHTML = "Statistics";
		clearInterval(interval);
		clearInterval(remix3interval);	
	}
}

function refreshInput(){
	clearInterval(remix3interval);
	if (remix3) {
		userinputId.className = " remix3input";
		clickable = true;
	}else{
		choiceIds[0].className = " choice1";
		choiceIds[1].className = " choice2";
		choiceIds[2].className = " choice3";
		choiceIds[3].className = " choice4";	
	}
	
}

function showGameOverScrn(){
	clearInterval(goToGameOverSceneInterval);
	gameOverMessage.className += " show";
	restartButtonPract.className += " show";
	restartButtonPanic.className += " show";
	gameOverScreenId.style.transition = "0.5s";
	gameOverScreenId.style.backgroundImage = 'url("files/img/Fail.gif")';
	questionZoomImage_blurId.classList.remove("show");
	quizgui.classList.remove("blur");
	characterid.classList.remove("blur");
	fullScreenImage = false;

	bgMusicArray[currentBgMusic].stop();
	bgMusicArray[currentBgMusic].removeEffect(lowPassFilter);
	bgMusicArray[currentBgMusic].removeEffect(reverb);
	bgMusicArray[currentBgMusic].removeEffect(delay);	
	bgMusicArray[currentBgMusic].removeEffect(slightLowPassFilter);	
	editHealth(100);

	gameOverMessage.innerHTML = "I only answered "+atquestion+" questions ...";
}

function gameOverRestart(type){
	if (restartClickable){
		if (type == 0){
			restartClickable = false;
			finished = null;
			restart_audio.currentTime = 0
			restart_audio.volume = 0.4;
			restart_audio.play();		
			restartButtonPract.innerHTML = "Restarting :)";	
			restartButtonPract.className += " textGO_restart";	
			if (noMusic == false){
				currentBgMusic = mathRandom(0, 4);
				bgMusicArray[currentBgMusic].play();
			}
			

			gameOverMessage.classList.remove("show");
			restartButtonPract.classList.remove("show");
			restartButtonPanic.classList.remove("show");
			gameOverScreenId.classList.remove("show");
			health = 100;
			editHealth(100);
			gameOver = false;

			PanicMode = false;
			noMusic = true;
			bgMusicArray[currentBgMusic].stop();
			restartQuiz();

		}else if (type == 1){	
			restartClickable = false;
			finished = null;
			restart_audio.currentTime = 0
			restart_audio.volume = 0.4;
			restart_audio.play();		
			restartButtonPanic.innerHTML = "Restarting :)";	
			restartButtonPanic.className += " textGO_restart";	

			currentBgMusic = mathRandom(0, 4);

			if (gameOver){
				if (noMusic == false){
					bgMusicArray[currentBgMusic].play();
				}
			}

			gameOverMessage.classList.remove("show");
			restartButtonPract.classList.remove("show");
			restartButtonPanic.classList.remove("show");
			gameOverScreenId.classList.remove("show");

			health = 100;
			gameOver = false;
			noMusic = false;
			PanicMode = true;
			bgMusicArray[currentBgMusic].play();
			restartQuiz();
		}

	}
}

function chckanswer(v, whatIndex){
	if (remix3 == true){
		v = userinputId.value.toLowerCase();
	}

	if((v == choice4Id && finished) && (examMode == false)){
		finished = null;
		restart_audio.currentTime = 0
		restart_audio.volume = 0.4;
		restart_audio.play();		
		choiceIds[3].innerHTML = "Restarting :)";	
		choiceIds[3].className += " restart";	
		if (noMusic == false){
			currentBgMusic = mathRandom(0, 4);
			//bgMusicArray[currentBgMusic].play();
		}
		interval = setInterval(restartQuiz,1500);
	}
	if((v == choice3Id && finished)){
		finished = null;
		restart_audio.currentTime = 0
		restart_audio.volume = 0.4;
		restart_audio.play();		
		choiceIds[2].innerHTML = "Restarting >:)";	
		choiceIds[2].className += " wrong";	
		if (noMusic == false){
			currentBgMusic = mathRandom(0, 4);
			//bgMusicArray[currentBgMusic].play();
		}
		interval = setInterval(function() { gameOverRestart(1); },1500);
	}	

	if (clickable){

		// if correct answer then
		if (scanIfExisted(correctAnswersArray,v)){
			crrct_audio.currentTime = 0
			crrct_audio.play();

			++atquestion;
			correctAnswersArray = [];
			//bgMusicArray[currentBgMusic].volume = 0.7;
			editHealth(10);
			
			if (bg_music0_started == false){
				bg_music0_started = true;
				if (noMusic == false){
					currentBgMusic = mathRandom(0, 4);
					bgMusicArray[currentBgMusic].play();
				}
				
				//bgMusicArray[currentBgMusic].volume = 0.7;
				//bg_music0.loop = true;
				if (PanicMode){
					healthinterval = setInterval(deductHealth,1);
				}
			}



			
			if (isremixmode) {
				bgMusicArray[currentBgMusic].removeEffect(lowPassFilter);
				bgMusicArray[currentBgMusic].removeEffect(reverb);
				bgMusicArray[currentBgMusic].removeEffect(delay);
				bgMusicArray[currentBgMusic].volume = 0.7;
				focusEfxId.classList.remove("show");
			}
			

			if (remix3){
				userinputId.className += " correct";
				choiceIds[3].className += " correct";
				userinputId.placeholder = "Type your answer here";
				remix3mistakes = 0;
				clearInterval(remix3interval);
			}else{
				v.className += " correct";
				v.innerHTML = answers[whatIndex];
			}
			
			remix3 = false;
			clickable = false;
			interval = setInterval(goToNext,1000);

			//console.log(""+atquestion+"/"+shuffled_items.length+"");
			//interval = setInterval(nextquestion ,1000);

		// if wrong answer then..	
		}else{
			
			
			// check if remix 3 is false
			if (remix3 == false){
				if (v.classList.contains("wrong") == false){
					v.className += " wrong";
					v.innerHTML = answers[whatIndex];

					mistakes++; 
					wrng_audio.currentTime = 0
					wrng_audio.play();
					
					editHealth(-wrongDamage);

				}
			} else {
				clickable = false;
				userinputId.className += " wrong";
				remix3mistakes++;
				remix3interval = setInterval(refreshInput,1000);
				mistakes++;

				wrng_audio.currentTime = 0
				wrng_audio.play();

				editHealth(-wrongDamage/2.5);

				if (remix3mistakes == 3){
					userinputId.placeholder = ("its "+correctAnswersArray[0]+"");
				}
			}
		}
	}
}

//pizzicato dfnaejfesiogo
// also starts the program

var MotivationalArrayMessage = [
`
<center>
	"I have trusts issues so I made this"<br/> 
	-Maku Santiran<br/><br/><br/><br/><br/>

	L O A D I N G
</center>
`,

`
<center>
	"I do not fear the man who practiced 10,000 kicks once..<br/> 
	but the man who practiced one kick 10,000 times"<br/> 
	-Bruce Lee<br/><br/><br/><br/><br/>

	L O A D I N G
</center>
`,

`
<center>
	"Dont forget to take breaks! Brain works efficiently when you're relaxed!"<br/> 
	-Maku Santiran<br/><br/><br/><br/><br/>

	L O A D I N G
</center>
`,

`
<center>
	"I guess i'll have to forget something to remember a new one.."<br/> 
	-Maku Santiran<br/><br/><br/><br/><br/>

	L O A D I N G
</center>
`,

`
<center>
	"Expectation can ruin everything"<br/> 
	-Maku Santiran<br/><br/><br/><br/><br/>

	L O A D I N G
</center>
`,


]
 
loadingScreenMsg.innerHTML = MotivationalArrayMessage[mathRandom(0, 4)]

//convertSpecialChars();

if (examMode == true){
	PanicMode = true;
	noMusic = false;	
}


// load ze musics
var bgMusicChecker = 0;

var bg_music4 = new Pizzicato.Sound({ 
    source: 'file',
    options: { path: bgmusic4_PF, loop: true }
}, function() {
	bgMusicChecker += 1;
	gameStart(bgMusicChecker);
});

var bg_music3 = new Pizzicato.Sound({ 
    source: 'file',
    options: { path: bgmusic3_PF, loop: true }
}, function() {
	bgMusicChecker += 1;
	gameStart(bgMusicChecker);
});

var bg_music2 = new Pizzicato.Sound({ 
    source: 'file',
    options: { path: bgmusic2_PF, loop: true }
}, function() {
	bgMusicChecker += 1;
	gameStart(bgMusicChecker);
});

var bg_music1 = new Pizzicato.Sound({ 
    source: 'file',
    options: { path: bgmusic1_PF, loop: true }
}, function() {
	bgMusicChecker += 1;
	gameStart(bgMusicChecker);
});

bg_music0 = new Pizzicato.Sound({ 
	source: 'file',
	options: { 
		path: bgmusic0_PF ,
		loop: true
	}
},function() {
    // Sound loaded!
    console.log(bg_music0);
	bgMusicChecker += 1;
	gameStart(bgMusicChecker);	
});


// starts the game
function gameStart(checker){

	if (checker == 5){
		//
		//document.getElementById('fileInput').addEventListener('change', getExcel);

		localforage.getItem("quizContent", function (err, value) {

			for (var i=0; i<value.length; i++){
				question = [value[i]["Question"]]
				answer = [value[i]["Answer"]]
				group = value[i]["Group"]
				picture = "slot/img/";

				items.push({question,answer,group,picture});
			}


			console.log(value)
			console.log(items)
			console.log("Successfully Loaded!")

			shuffled_items = shuffleQuestion(items);
			gameStart(6)
		})
	} 

	if (checker == 6){
		bgMusicArray = [bg_music0,bg_music1,bg_music2,bg_music3,bg_music4];
		console.log(bgMusicArray);

		trackerId.innerHTML = shuffled_items[atquestion].group;
		askquestion(shuffled_items[atquestion]);

		loadingScreen.style.opacity = "0";
		loadingScreen.style.pointerEvents = "none";

		if (examMode){
			restartButtonPract.innerHTML = " Exam Mode :(";
			restartButtonPract.onclick = "";
		}
	}
}




function getExcel(event) {
    const file = event.target.files[0];
	
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });

			// Assuming the first sheet is of interest
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];

			// Convert worksheet to JSON
			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

		// Display the data (you can customize this part based on your needs)
		quizSize = jsonData.length - 5
		//outputDiv.innerHTML = '<pre>' + quizSize + '</pre>';
		
		// check if panic mode or not
		if (jsonData[1][1] == "N"){
			PanicMode = true
		}

		for (let i = 5; i < jsonData.length; i++) {
			question = [jsonData[i][2]]
			answer = [jsonData[i][3]]
			group = jsonData[i][0]
			picture = "slot/img/";
			items.push({question,answer,group,picture});
		}

		//localStorage.TEST = JSON.stringify(items);
		
		console.log(JSON.parse(localStorage.TEST))

		// shuffle the items first
		shuffled_items = shuffleQuestion(items);
		gameStart(6)
        };

        reader.readAsArrayBuffer(file);
    }

}

// exported functions
window.chckanswer = chckanswer
window.image = image
window.gameOverRestart = gameOverRestart

// exported variables
window.choice1Id = choice1Id
window.choice2Id = choice2Id
window.choice3Id = choice3Id
window.choice4Id = choice4Id