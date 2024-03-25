import localforage from "./localForage/localforage.js" 

//just load the script
//var VelocityJsScript = document.createElement('script');
//VelocityJsScript.src = './files/VelocityJS/velocity.js';

//document.body.appendChild(VelocityJsScript);

// html things

// id
var html_Question = document.getElementById("question")
var html_Choice = document.getElementById("choices")
var html_Answer = document.getElementById("answer")
var html_Feedback = document.getElementById("feedback")
var html_GroupTitle = document.getElementById("groupTitle")
var html_difficultyMeter = document.getElementById("difficultyMeter")
var html_forgetfulFlagId = document.getElementById("forgetfulFlag_RedId")
var html_forgetfulFlagYellowId = document.getElementById("forgetfulFlag_YellowId")
var html_choicesContainer = document.getElementById("choicesContainerId")
var html_restartContainer = document.getElementById("restartContainerId")

var html_questionImageContainerId = document.getElementById("questionImageContainerId")
var html_multipleChoiceContainer = document.getElementById("multipleChoiceContainerId")
var html_enumarationId = document.getElementById("enumarationId")
var html_enumSubContainerId = document.getElementById("enumSubContainerId")
var html_enumChoicesId = document.getElementById("enumChoicesId")

var html_health1Id = document.getElementById("health1Id")
var html_health2Id = document.getElementById("health2Id")
var html_health3Id = document.getElementById("health3Id")
var html_health4Id = document.getElementById("health4Id")
var html_enumHealthId = document.getElementById("enumHealthId")

var html_gameOverBlackScreenId = document.getElementById("gameOverBlackScreenId")
var html_gameOverContainerId = document.getElementById("gameOverContainerId")
var html_gameOverButtonContainerId = document.getElementById("gameOverButtonContainerId")

var html_lowHealthEffectsContainerId = document.getElementById("lowHealthEffectsContainerId")
html_lowHealthEffectsContainerId.style.opacity = 0

// classes

var html_health1 = document.querySelector("health1")
var html_health2 = document.querySelector("health2")
var html_health3 = document.querySelector("health3")
var html_health4 = document.querySelector("health4")

var html_forgetfulFlag = document.querySelector(".forgetfulFlag_Red")
var html_forgetfulFlagYellow = document.querySelector(".forgetfulFlag_Yellow")
var html_quizContainer = document.querySelector(".quizContainer")
var html_enumFlexContainer = document.querySelector(".enumFlexContainer")
var html_enumAnswer = document.querySelector(".enumAnswer")

var html_questionImageContainer = document.querySelector(".questionImageContainer")

var html_gameOverBlackScreen = document.querySelector(".gameOverBlackScreen")
var html_gameOverContainer = document.querySelector(".gameOverContainer")
var html_gameOverButtonContainer = document.querySelector(".gameOverButtonContainer")

// variables
var reviGame = {
    atNumber: 0,
    gotWrong: false,
    preventSubmission: false,
    options: [],

    // sneak peak :)
    questionTypes: [
        "MultipleChoice",
        "TrueOrFalse", 
        "Scrambled", 
        "Identification",
        "PickTheWrong",
        "FillInTheBlank"
    ],

    totalMistakes: 0,

    flagShakeIntensity: 20,  // the lower the more intense

    enumHidePercent: 65,
    enumFocusHidePercent: 65,
    enumFocusIndex: 0,

    health: 100,
    trueHealth: 100,

    offScreen: false,
    isPaused: false,
    remainingPauses: 2,

    isFinished: false,
    gameOver: false
}

var reviewItems_Groups = []     // the outline of this is {group: #, difficulty: #}
var reviewItems_Choices = {}

var local_selectedGroupExclusion = []
var local_temporarySaveForExcluded = []

var local_enumarationItems = []
var local_enumarationItemsP = []
var local_enumAlreadyAnswered = []
var local_enumInOrder = false

// Define sample quiz questions
var reviewItems = [];
var reviewerDatabase = ""
var difficultyRange = 5
var yellowFlagRange = 2
var redFlagRange = 4
var greyYellowFlagRange = 1
var middlePointFlagRange = 0
var greyGreenFlagRange = -1
var greenFlagRange = -2
var blueFlagRange = -4

// Remix mode stuff
var whichDifficultyType = "difficulty"
var remixModeValue = 0
var trueOrFalseAnswer = true
var unscrambledChoices = []
var blankedQuestion = ""
var answerForBlank = ""

var remixModeValueRange = 5
var remixModeValueRarity = 5


// damages
var multipleChoiceDMG = 18
var enumDMG = 8

// Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms 
// Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms 
// Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms 

// the good ol lerp :D
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function randomNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFillInTheBlank(sentence) {
    // Split the sentence into an array of words
    var words = sentence.split(/\s+/);
    
    // Filter out single-character words and words containing symbols
    var filteredWords = words.filter(word => word.length > 1 && !/\W/.test(word));
    
    // If there are no eligible words, return the original sentence
    if (filteredWords.length === 0) {
        return sentence;
    }
    
    // Generate a random index to choose a word
    var randomIndex = Math.floor(Math.random() * filteredWords.length);
    
    // Save the chosen word in a temporary variable
    answerForBlank = filteredWords[randomIndex];

    // Replace the chosen word with blank
    filteredWords[randomIndex] = "___";
    
    // Join the words back into a sentence
    return sentence.replace(answerForBlank, "___");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function shuffleString(str) {
    // Convert the string to an array of characters
    const charArray = str.split('');
    
    // Shuffle the array
    for (let i = charArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [charArray[i], charArray[j]] = [charArray[j], charArray[i]]; // Swap elements
    }
    
    // Join the shuffled array back into a string
    return charArray.join('');
}

function removeStringFromArray(arr, toRemove) {
    return arr.filter(str => str !== toRemove);
}

// addToGroupList first if it doesn't exists {}
function generateGroupList(typeOfDifficulty){

    // first scan the damn GrOUp you piece of sh-
    var lengthOfItems = reviewItems.length
    var tempGroupList = []
    var tempGroupListDifficulty = []

    // add the different types of group list
    for (var i in reviewItems){
        var theGroup = reviewItems[i]["group"]

        // if it doesnt exists
        if (!tempGroupList.includes(theGroup)){
            tempGroupList.push(theGroup)
        }

        // now if it exists
        var groupDifficulty = reviewItems[i][typeOfDifficulty]
        var indexOfGroup = tempGroupList.indexOf(theGroup)

        // if it doesnt exist
        if (tempGroupListDifficulty[indexOfGroup] == null){
            console.log("AH")
            tempGroupListDifficulty[indexOfGroup] = 0
        }

        // add difficulty number
        tempGroupListDifficulty[indexOfGroup] = tempGroupListDifficulty[indexOfGroup] + groupDifficulty
    }

    
    // now finally add the temporary group to the actual group list
    for (var i in tempGroupList){
        reviewItems_Groups.push({
            group: tempGroupList[i],
            difficulty: tempGroupListDifficulty[i]
        })
    }

    console.log(reviewItems_Groups)
}

// generate the choices list
function generateChoicesBasedOnGroup(Group, Item){
    if (reviewItems_Choices[Group] == null){
        reviewItems_Choices[Group] = [Item]
    } else {
        reviewItems_Choices[Group] = reviewItems_Choices[Group].concat(Item)
    }
}

// an algorithm that is based on the concepts of Leitner Spaced Repetition :)
function mayonnaiseAlgorithm(){
    var temporarySFS = []; // temporarySpaceForSorting
    var temporaryFO = []; // temporaryOutput
    var itemsToBeScanned = [...reviewItems]


    // first sort the group depending on the total number of difficulty/mistake
    reviewItems_Groups.sort((a, b) => b.difficulty - a.difficulty);

    // for each group
    for (var i in reviewItems_Groups){
        var selectedGroup = reviewItems_Groups[i].group

        console.log("|| "+selectedGroup+" ||")

        // then find the matching ones in the itemsTobeScanned
        for (var j in itemsToBeScanned){

            // add them to temporarySFS and choicesBasedOnGroup
            if (itemsToBeScanned[j].group == selectedGroup){
                
                temporarySFS.push(itemsToBeScanned[j])

                // only choose the question and answer
                if (checkIfStringOrArray(itemsToBeScanned[j].answer)){
                    generateChoicesBasedOnGroup(selectedGroup, itemsToBeScanned[j].answer)  
                }    
            }
        }


        // once the item is indeed in temporarySFS, sort them based on difficulty
        // the hardest being the first one
        temporarySFS.sort((a, b) => b.difficulty - a.difficulty);

        console.log(temporarySFS)

        // add to the final output
        temporaryFO = temporaryFO.concat(temporarySFS)

        // empty the SFS
        temporarySFS = [];
    }

    // clear the review Items then copy it to Temporary FO
    reviewItems = []
    reviewItems = temporaryFO
}

// same as mayonnaise but this time it randomizes if its going to sort from easiest to hardest or vice versa randomly 
// (this also includes the group)
function ketchupAlgorithm(typeOfDifficulty){
    var temporarySFS = []; // temporarySpaceForSorting
    var temporaryFO = []; // temporaryOutput
    var itemsToBeScanned = [...reviewItems]

    var randomizer = randomNumbers(1, 4)


    // this is for ketchupAlgorithm (to do variation and unpredictability)

    if (randomizer == 1){
        // first sort the group depending in the randomizer (from hardest to easiest)
        reviewItems_Groups.sort((a, b) => b[typeOfDifficulty] - a[typeOfDifficulty]);
    }
    else if (randomizer == 2){
        // first sort the group depending in the randomizer (from easiest to hardest)
        reviewItems_Groups.sort((a, b) => a[typeOfDifficulty] - b[typeOfDifficulty]);
    } 
    else if (randomizer == 3){
        // or shuffle them
        var shuffledGroups = shuffleArray(reviewItems_Groups)
        reviewItems_Groups = shuffledGroups
    }  // or do nothing

    console.log("KetchupRandomizer: ",randomizer)

    // for each group
    for (var i in reviewItems_Groups){
        var selectedGroup = reviewItems_Groups[i].group

        console.log("|| "+selectedGroup+" ||")

        // then find the matching ones in the itemsTobeScanned
        for (var j in itemsToBeScanned){

            // add them to temporarySFS and choicesBasedOnGroup
            if (itemsToBeScanned[j].group == selectedGroup){
                
                temporarySFS.push(itemsToBeScanned[j])

                // only choose the question and answer
                if (checkIfStringOrArray(itemsToBeScanned[j].answer)){
                    generateChoicesBasedOnGroup(selectedGroup, itemsToBeScanned[j].answer)  
                }    
            }
        }

        // do another shuffle
        randomizer = randomNumbers(1, 4)

        if (randomizer == 1){
            // sort item difficulty (from hardest to easiest)
            temporarySFS.sort((a, b) => b[typeOfDifficulty] - a[typeOfDifficulty]);
        }
        else if (randomizer == 2){
            // sort item difficulty (from easiest to hardest)
            temporarySFS.sort((a, b) => a[typeOfDifficulty] - b[typeOfDifficulty]);
        } 
        else if (randomizer == 3){
            // or shuffle them
            var shuffledItems = shuffleArray(temporarySFS)
            temporarySFS = shuffledItems
        }  // or do nothing

        console.log("RandomizerItems", randomizer, temporarySFS)

        // add to the final output
        temporaryFO = temporaryFO.concat(temporarySFS)

        // empty the SFS
        temporarySFS = [];
    }

    // clear the review Items then copy it to Temporary FO
    reviewItems = []
    reviewItems = temporaryFO
}

function extractExclusionGroup(){
    var tempReviewItems = [...reviewItems]

    // basically get the excluded groups and save it to the temporarySaveForExcluded
    for (var i in local_selectedGroupExclusion){
        var extracted = reviewItems.filter(item => item.group == local_selectedGroupExclusion[i]);
        var tempReviewItems = tempReviewItems.filter(item => item.group != local_selectedGroupExclusion[i]);

        local_temporarySaveForExcluded.push(extracted)

        // why do u have to make this complicated javascript??
        local_temporarySaveForExcluded = [].concat(...local_temporarySaveForExcluded);
    }

    // clear then replace
    reviewItems = []
    reviewItems = tempReviewItems

    console.log("Extracted: ",local_temporarySaveForExcluded)
    console.log("reviewItems", reviewItems)
}

function checkIfStringOrArray(variable){
    if (typeof variable === 'string') {
        return true
    } else if (Array.isArray(answer)) {
        return false
    }
}

function hideCharacter(str, percentage) {
    if (percentage < 10){
        return str
    }

    if (percentage >= 10 && percentage <= 100) {
        var numCharsToHide = Math.round(str.length * (percentage / 100));
        var hiddenIndexes = [];
        
        // Generate random indexes to hide
        while (hiddenIndexes.length < numCharsToHide) {
        var index = Math.floor(Math.random() * str.length);
            if (!hiddenIndexes.includes(index)) {
                hiddenIndexes.push(index);
            }
        }
        
        // Replace characters at random indexes with "_"
        var hiddenStr = str.split('').map((char, index) => {
            return hiddenIndexes.includes(index) ? '*' : char;
        }).join('');
        
        return hiddenStr;
    } else {
        return "Percentage should be between 0 and 100.";
    }
}

function scanString(arr, string) {
    for (let i = 0; i < arr.length; i++) {
        if (string == arr[i].toLowerCase()){
            return i;
        }
    }
    return -1;
}

// for enumaration
function checkIfTheSame(toBeCmp, string){
    if (toBeCmp == string){ 
        return reviGame.enumFocusIndex
    }
    return -1
}

// Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds 
// Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds 
// Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds // Sounds 

var crrct_audio = new Audio('./files/sfx/Correct.wav');
var wrng_audio = new Audio('./files/sfx/Wrong.wav');
var restart_audio = new Audio('./files/sfx/Start.wav');
//var bgmusic = new Audio('./files/sfx/ReviTermWeCantSlowDown.mp3')

// set things
restart_audio.volume = 0.3

var rndmBG = randomNumbers(0,2)
var reviTermSfx_BGSpeed = 1
//reviTermSfx_BGSpdLerp = 1
var reviTermSfx_CurrentBg;
var reviTermSfx_BGMUSIC1 = "./files/sfx/ReviTermWeCantSlowDown.mp3"
var reviTermSfx_BGMUSIC2 = "./files/sfx/ReviTermWeMustBattleNow.mp3"
var reviTermSfx_BGMUSIC3 = "./files/sfx/ReviTermReadyPlayer.mp3"
var reviTermSfx_BGARRAY = [reviTermSfx_BGMUSIC1, reviTermSfx_BGMUSIC2, reviTermSfx_BGMUSIC3]
var reviTermSfx_BGLoaded = false

function playBg(fileSource) {
    // Create a new sound object
    reviTermSfx_CurrentBg = new Pizzicato.Sound({
        source: 'file', // Use a sine wave as the sound source
        options: {
            path: fileSource,
            speed: 1,
            volume: 0.5,
            loop: true // Loop the sound
        }
    }
    // load the sound first
    ,function() {
        // Play the sound
        reviTermSfx_BGLoaded = true
        reviTermSfx_CurrentBg.play();
    });
}

function speedSmooth(oldSpeed, targetSpeed, value){
    var reviTermSfx_BGSpdLerp = lerp(reviTermSfx_BGSpeed, targetSpeed, 0.005)
    reviTermSfx_BGSpeed = reviTermSfx_BGSpdLerp

    return reviTermSfx_BGSpdLerp
}

function changeBgSpeed(newSpeed, smoothValue) {
    // Check if the sound object exists
    if (reviTermSfx_BGLoaded) {
        var editedSpeed = speedSmooth(reviTermSfx_BGSpeed, newSpeed, smoothValue)
        // Change the speed of the sound
        reviTermSfx_CurrentBg.sourceNode.playbackRate.value = editedSpeed;
        //console.log(editedSpeed)
    }
}



// Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations 
// Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations 
// Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations 

function flagShakeAnimation() {
    //Velocity(html_forgetfulFlag,properties,options)
    anime({
        targets: html_forgetfulFlag,
        top: ["10px","0px","10px","0px"],
        duration: 5000,
        easing: 'easeInOutQuad',
        loop: true,
    });
}

function wrongAnswerAnimation(){
    var randomXValue = randomNumbers(-5,5)
    var randomYValue = randomNumbers(-1,1)


    //Velocity(html_quizContainer,properties,options)

    //Velocity(html_quizContainer, {left: "49%", top: "50%" }, { duration: 1 });
    
    console.log( 50 + randomXValue + '%')

    if (reviGame.trueHealth > 0){
        anime({
            targets: html_quizContainer,
            left: 50 + randomXValue + '%',
            top: 40 + randomYValue + '%',
            duration: 5,
            easing: 'linear',
            loop: 1,
            complete: function(anim) {
                anime({targets: html_quizContainer, left: "49%", top: "50%"})
            }
        });
    }
}

function updateForgetfulFlag(difficultyType){
    var forgetfulLevel = reviewItems[reviGame.atNumber][difficultyType]

    html_forgetfulFlagId.style.display = "flex";

    remixModeValueRange = 0
    remixModeValueRarity = 10

    // Yellow Flag
    if (forgetfulLevel >= yellowFlagRange && forgetfulLevel < redFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FYELLOW.png'
    }
        
    // Red Flag
    if (forgetfulLevel >= redFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FRED.png'
    }

    // Grey Flag
    if (forgetfulLevel == greyYellowFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FGORANGE.png'
    }
    if (forgetfulLevel == middlePointFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FGREY.png'
    }
    if (forgetfulLevel == greyGreenFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FGGREEN.png'
    }
    
    // Green Flag
    if (forgetfulLevel <= greenFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FGREEN.png'
        remixModeValueRange = 5
        remixModeValueRarity = 10
    }

    // Blue Flag
    if (forgetfulLevel <= blueFlagRange){
        html_forgetfulFlagId.src = './files/img/flags/FBLUE.png'
        remixModeValueRange = 5
        remixModeValueRarity = 3
    }

    console.log(forgetfulLevel, reviGame.flagShakeIntensity)

    //html_forgetfulFlagYellow
}

function drainHealthAnimation(){

    var lerpHealth = lerp(reviGame.trueHealth, reviGame.health, 0.05)
    reviGame.trueHealth = lerpHealth

    var lowHPOpacity = html_lowHealthEffectsContainerId.style.opacity 

    if (lerpHealth > 100){
        lerpHealth = 100
        reviGame.health = 100
        reviGame.trueHealth = 100
    }

    if (lerpHealth > 50){
        html_health1Id.style.backgroundColor = "#2dc9328a"
        html_health2Id.style.backgroundColor = "#2dc9328a"
        html_health3Id.style.backgroundColor = "#2dc9328a"
        html_health4Id.style.backgroundColor = "#2dc9328a"
        html_enumHealthId.style.backgroundColor = "#2dc9328a"
        changeBgSpeed(1, 0.3)

        if (lowHPOpacity > 0){
            html_lowHealthEffectsContainerId.style.opacity = parseFloat(lowHPOpacity) - parseFloat(0.005)
        }
    }

    if (lerpHealth <= 50 && lerpHealth > 25){
        html_health1Id.style.backgroundColor = "#f4f12b8a"
        html_health2Id.style.backgroundColor = "#f4f12b8a"
        html_health3Id.style.backgroundColor = "#f4f12b8a"
        html_health4Id.style.backgroundColor = "#f4f12b8a"
        html_enumHealthId.style.backgroundColor = "#f4f12b8a"
        changeBgSpeed(1, 0.3)

        if (lowHPOpacity < 0){
            html_lowHealthEffectsContainerId.style.opacity = parseFloat(lowHPOpacity) - parseFloat(0.005)
        }
    }

    if (lerpHealth <= 25){
        html_health1Id.style.backgroundColor = "#ff4949" 
        html_health2Id.style.backgroundColor = "#ff4949" 
        html_health3Id.style.backgroundColor = "#ff4949" 
        html_health4Id.style.backgroundColor = "#ff4949" 
        html_enumHealthId.style.backgroundColor = "#ff4949"   
        changeBgSpeed(1.1, 0.3)
        
        if (lowHPOpacity < 1){
            //console.log(lowHPOpacity)
            // JavaScript is weird
            html_lowHealthEffectsContainerId.style.opacity = parseFloat(lowHPOpacity) + parseFloat(0.005)
        }
        
    }

    html_health1Id.style.width = lerpHealth+"%"
    html_health2Id.style.width = lerpHealth+"%"
    html_health3Id.style.width = lerpHealth+"%"
    html_health4Id.style.width = lerpHealth+"%"
    html_enumHealthId.style.width = lerpHealth+"%"



}

function hideGameOverScrn(){
    
}

function animateLowHealth(){
    var html_lowHealth = document.querySelector(".lowHealth")

    anime({
        targets: html_lowHealth,
        display: "block",
        opacity: [0,2],
        duration: 2000,
        easing: 'easeInQuad',
        loop: true,
    });
    


    setInterval(function(){
        if (reviGame.trueHealth < 25){
            createFireParticle()
        }
    }, 50)
}

function showGameOverScrn(){
    anime({
        targets: html_quizContainer,
        top: ["50%", "200%"],
        left: ["50%"],
        duration: 2000,
        rotate: '50deg',
        easing: 'easeInQuad',
        loop: 1,
        complete: function(anim) {
            anime({targets: html_quizContainer, 
                left: "50%", 
                top: "50%", 
                rotate: '0deg',
                translateX: "-50%",
                translateY: "-50%",})
        }
    });
    

    var html_gameOverBlackScreen = document.querySelector(".gameOverBlackScreen")
    html_gameOverBlackScreenId.style.display = "block"

    
    anime({
        targets: html_gameOverBlackScreen,
        display: "block",
        opacity: [0,1],
        duration: 1000,
        easing: 'easeInQuad',
        loop: 1,
    });
    

   //Velocity(html_gameOverBlackScreen, properties,options)

    console.log("Happening!, WTFFF")
    
    setTimeout(displayGameOverMessage, 1500)
    //setTimeout(startReviTerm, 1000) 
}

function createFireParticle() {
    var fireContainer = document.getElementById('fireContainer');
    var numberOfChildren = fireContainer.childElementCount;

    if (numberOfChildren < 20){
        var particle = document.createElement('div');
        particle.className = 'fireParticle';
        fireContainer.appendChild(particle);
        particle.style.left = (Math.random() * 95) + "%";
    
        var x = parseFloat(Math.random() * window.innerWidth);
        var y = window.innerHeight - 10; // Start at the bottom of the screen
        var speed = Math.random() * 2 + 1; // Random speed between 1 and 3
        var opacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        var size = Math.random() * 20 + 10; // Random size between 10 and 30
    
        anime({
            targets: particle,
            bottom: ["0%", "50%"],
            opacity: [opacity, 0],
            width: [size, 0],
            height: [size, 0],
            duration: 700,
            easing: 'easeOutExpo',
            complete: function(anim) {
                fireContainer.removeChild(particle); // Remove the particle after animation
            }
        });
    }


}


// QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes 
// QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes 
// QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes 

function multipleChoice(Group){
    var theChoices = []
    var amountOfChoices = 4

    // display the other 2
    document.getElementById("choiceContainerId3").style.display = "block"
    document.getElementById("choiceContainerId4").style.display = "block"
    
    // dynamic difficult :) [if yellow flag]
    if (reviewItems[reviGame.atNumber][whichDifficultyType] > yellowFlagRange && reviewItems[reviGame.atNumber][whichDifficultyType] < redFlagRange){
        amountOfChoices = 3
        document.getElementById("choiceContainerId4").style.display = "none"
    }

    // if red flag
    if (reviewItems[reviGame.atNumber][whichDifficultyType] >= redFlagRange){
        amountOfChoices = 2
        document.getElementById("choiceContainerId3").style.display = "none"
        document.getElementById("choiceContainerId4").style.display = "none"
    }


    for (var i in reviewItems_Choices[Group]) {
        if (checkIfStringOrArray(reviewItems_Choices[Group][i])){
            theChoices.push(reviewItems_Choices[Group][i])
        }
    }

    console.log("AAAsaadsdsa", reviewItems_Choices[Group])

    // for multiple choice
    var randomizedChoices = shuffleArray(theChoices)
    var correctIndexOfAnswer = randomNumbers(1,amountOfChoices)
    
    for (var i = 1; i<=amountOfChoices; i++){
        var html_choice = document.getElementById("choice"+i+"Id")
        
        var randomIndex = randomNumbers(0, randomizedChoices.length-1)
        var forMultipleChoice = randomizedChoices[randomIndex];

        html_choice.innerHTML = forMultipleChoice
    }

    var html_correctChoice = document.getElementById("choice"+correctIndexOfAnswer+"Id")
    html_correctChoice.innerHTML = reviewItems[reviGame.atNumber].answer
}

function scrambledMultipleChoice(Group){
    var theChoices = []
    var amountOfChoices = 4

    // display the other 2
    document.getElementById("choiceContainerId3").style.display = "block"
    document.getElementById("choiceContainerId4").style.display = "block"
    
    // dynamic difficult :) [if yellow flag]
    if (reviewItems[reviGame.atNumber][whichDifficultyType] > yellowFlagRange && reviewItems[reviGame.atNumber][whichDifficultyType] < redFlagRange){
        amountOfChoices = 3
        document.getElementById("choiceContainerId4").style.display = "none"
    }

    // if red flag
    if (reviewItems[reviGame.atNumber][whichDifficultyType] >= redFlagRange){
        amountOfChoices = 2
        document.getElementById("choiceContainerId3").style.display = "none"
        document.getElementById("choiceContainerId4").style.display = "none"
    }


    for (var i in reviewItems_Choices[Group]) {
        if (checkIfStringOrArray(reviewItems_Choices[Group][i])){
            theChoices.push(reviewItems_Choices[Group][i])
        }
    }

    console.log("AAAsaadsdsa", reviewItems_Choices[Group])

    // for multiple choice
    var randomizedChoices = shuffleArray(theChoices)
    var correctIndexOfAnswer = randomNumbers(1,amountOfChoices)

    unscrambledChoices = []
    
    for (var i = 1; i<=amountOfChoices; i++){
        var html_choice = document.getElementById("choice"+i+"Id")
        
        var randomIndex = randomNumbers(0, randomizedChoices.length-1)
        var forMultipleChoice = randomizedChoices[randomIndex];

        unscrambledChoices.push(forMultipleChoice)

        html_choice.innerHTML = shuffleString(forMultipleChoice)
        console.log(forMultipleChoice)
    }  

    unscrambledChoices[correctIndexOfAnswer-1] = reviewItems[reviGame.atNumber].answer

    var html_correctChoice = document.getElementById("choice"+correctIndexOfAnswer+"Id")
    html_correctChoice.innerHTML = shuffleString(unscrambledChoices[correctIndexOfAnswer-1])

    

    console.log("unscrambledChoices", correctIndexOfAnswer, unscrambledChoices)
}

function pickTheWrong(Group){
    var theChoices = []
    var amountOfChoices = 4

    // display the other 2
    document.getElementById("choiceContainerId3").style.display = "block"
    document.getElementById("choiceContainerId4").style.display = "block"
    
    // dynamic difficult :) [if yellow flag]
    if (reviewItems[reviGame.atNumber][whichDifficultyType] > yellowFlagRange && reviewItems[reviGame.atNumber][whichDifficultyType] < redFlagRange){
        amountOfChoices = 3
        document.getElementById("choiceContainerId4").style.display = "none"
    }

    // if red flag
    if (reviewItems[reviGame.atNumber][whichDifficultyType] >= redFlagRange){
        amountOfChoices = 2
        document.getElementById("choiceContainerId3").style.display = "none"
        document.getElementById("choiceContainerId4").style.display = "none"
    }


    for (var i in reviewItems_Choices[Group]) {
        if (checkIfStringOrArray(reviewItems_Choices[Group][i])){
            theChoices.push(reviewItems_Choices[Group][i])
        }
    }

    console.log("AAAsaadsdsa", reviewItems_Choices[Group])

    // for multiple choice
    var randomizedChoices = shuffleArray(theChoices)
    var wrongAnswerIndex = randomNumbers(1,amountOfChoices)

    var temporaryWrongChoice = removeStringFromArray(randomizedChoices, reviewItems[reviGame.atNumber].answer)
    
    for (var i = 1; i<=amountOfChoices; i++){
        var html_choice = document.getElementById("choice"+i+"Id")
        
        var randomIndex = randomNumbers(0, randomizedChoices.length-1)
        var forMultipleChoice = randomizedChoices[randomIndex];

        html_choice.innerHTML = forMultipleChoice
    }

    var html_incorrectChoice = document.getElementById("choice"+wrongAnswerIndex+"Id")
    html_incorrectChoice.innerHTML = temporaryWrongChoice[0]

    displayPickTheWrong()
}

function enumarationShowClues(){

    html_enumFlexContainer.innerHTML = ``    

    for (var i in local_enumarationItems){
        if (i == reviGame.enumFocusIndex){
            html_enumFlexContainer.innerHTML += `
            <div class="enumFlexItem" id="enumFlexItemId`+i+`">
                <div class="enumClue`+i+`" id="enumClueId`+i+`" style="color: #77ccf0">
                    `+hideCharacter(local_enumarationItems[i], local_enumarationItemsP[i])+`
                </div>
            </div>
            `    
        } else {
            // lazyyy
            if (local_enumInOrder){
                if (local_enumarationItemsP[i] != 0){
                    html_enumFlexContainer.innerHTML += `
                    <div class="enumFlexItem" id="enumFlexItemId`+i+`">
                        <div class="enumClue`+i+`" id="enumClueId`+i+`" style="color: #616161;">
                            `+hideCharacter(local_enumarationItems[i], local_enumarationItemsP[i])+`
                        </div>
                    </div>
                    `                    
                } else {
                    html_enumFlexContainer.innerHTML += `
                    <div class="enumFlexItem" id="enumFlexItemId`+i+`">
                        <div class="enumClue`+i+`" id="enumClueId`+i+`" style="color: #60ff51;">
                            `+hideCharacter(local_enumarationItems[i], local_enumarationItemsP[i])+`
                        </div>
                    </div>
                    `    
                }
            } else {
                if (local_enumarationItemsP[i] != 0){
                html_enumFlexContainer.innerHTML += `
                    <div class="enumFlexItem" id="enumFlexItemId`+i+`">
                        <div class="enumClue`+i+`" id="enumClueId`+i+`">
                            `+hideCharacter(local_enumarationItems[i], local_enumarationItemsP[i])+`
                        </div>
                    </div>
                    `
                } else {
                    html_enumFlexContainer.innerHTML += `
                    <div class="enumFlexItem" id="enumFlexItemId`+i+`">
                        <div class="enumClue`+i+`" id="enumClueId`+i+`" style="color: #60ff51;">
                            `+hideCharacter(local_enumarationItems[i], local_enumarationItemsP[i])+`
                        </div>
                    </div>
                    ` 
                }
            }
        }
    }
}

function trueOrFalse(Group){
    var theChoices = []

    var html_true = document.getElementById("choice1Id")
    var html_false = document.getElementById("choice2Id")

    trueOrFalseAnswer = false

    document.getElementById("choiceContainerId3").style.display = "none"
    document.getElementById("choiceContainerId4").style.display = "none"

    html_true.innerHTML = "True"
    html_false.innerHTML = "False"

    for (var i in reviewItems_Choices[Group]) {
        if (checkIfStringOrArray(reviewItems_Choices[Group][i])){
            theChoices.push(reviewItems_Choices[Group][i])
        }
    }

    theChoices = shuffleArray(theChoices)
    var toDisplay = theChoices[0]
    var fiftyFifty = randomNumbers(1,2)

    // if the shuffle somehow ended up making the correct answer
    if (reviewItems[reviGame.atNumber].answer == toDisplay){
        console.log("Won shuffle")
        toDisplay = reviewItems[reviGame.atNumber].answer
        trueOrFalseAnswer = true
    }

    if (fiftyFifty == 2){
        console.log("Won fifty fifty!")
        toDisplay = reviewItems[reviGame.atNumber].answer
        trueOrFalseAnswer = true
    }

    console.log(trueOrFalseAnswer, toDisplay, theChoices)

    displayTrueFalse(toDisplay)    
}

// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 
// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 
// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 

function showChoices(Group){

    // check first if the current item is 
    var currentItem = reviewItems[reviGame.atNumber].answer
    var currentQuestion = reviewItems[reviGame.atNumber].question

    
    // if Q and A
    if (checkIfStringOrArray(currentItem)) {

        // if Multiple Choice
        if (remixModeValue <= 0){
            html_multipleChoiceContainer.style.display = "block"
            html_enumarationId.style.display = "none"
            multipleChoice(Group)
        }
        // True or False
        if (remixModeValue == 1){
            html_multipleChoiceContainer.style.display = "block"
            html_enumarationId.style.display = "none"
            trueOrFalse(Group)
        }

        // Scrambled
        if (remixModeValue == 2){
            html_multipleChoiceContainer.style.display = "block"
            html_enumarationId.style.display = "none"
            scrambledMultipleChoice(Group)
        }

        // PickTheWrong
        if (remixModeValue == 3){
            html_multipleChoiceContainer.style.display = "block"
            html_enumarationId.style.display = "none"
            pickTheWrong(Group)
        }

        // identification
        if (remixModeValue == 4){
            html_multipleChoiceContainer.style.display = "none"
            html_enumarationId.style.display = "block"

            local_enumarationItems = []
            local_enumarationItemsP = []
            local_enumAlreadyAnswered = []
            html_enumChoicesId.style.color = "#FFFFFF"

            local_enumInOrder = false
            local_enumarationItems = [currentItem]
            reviGame.enumFocusIndex = 0

            // reset value
            reviGame.enumHidePercent = 70
            reviGame.enumFocusHidePercent = 70

            // dynamic difficult :) [if yellow flag]
            if (reviewItems[reviGame.atNumber][whichDifficultyType] > yellowFlagRange && reviewItems[reviGame.atNumber][whichDifficultyType] < redFlagRange){
                reviGame.enumHidePercent = 50
                reviGame.enumFocusHidePercent = 50
            }

            // if red flag
            if (reviewItems[reviGame.atNumber][whichDifficultyType] >= redFlagRange){
                reviGame.enumHidePercent = 30
                reviGame.enumFocusHidePercent = 30
            }

            // push the hide percentage
            for (var i in local_enumarationItems){
                local_enumarationItemsP.push(reviGame.enumHidePercent)
            }

            reviGame.gotWrong = false
            enumarationShowClues()
        }

        // fill in the blanks
        if (remixModeValue == 5){
            html_multipleChoiceContainer.style.display = "none"
            html_enumarationId.style.display = "block"

            blankedQuestion = generateFillInTheBlank(currentQuestion+" , "+currentItem)

            local_enumarationItems = []
            local_enumarationItemsP = []
            local_enumAlreadyAnswered = []
            html_enumChoicesId.style.color = "#FFFFFF"

            local_enumInOrder = false
            local_enumarationItems = [answerForBlank]
            reviGame.enumFocusIndex = 0

            // reset value
            reviGame.enumHidePercent = 70
            reviGame.enumFocusHidePercent = 70

            // dynamic difficult :) [if yellow flag]
            if (reviewItems[reviGame.atNumber][whichDifficultyType] > yellowFlagRange && reviewItems[reviGame.atNumber][whichDifficultyType] < redFlagRange){
                reviGame.enumHidePercent = 50
                reviGame.enumFocusHidePercent = 50
            }

            // if red flag
            if (reviewItems[reviGame.atNumber][whichDifficultyType] >= redFlagRange){
                reviGame.enumHidePercent = 30
                reviGame.enumFocusHidePercent = 30
            }

            // push the hide percentage
            for (var i in local_enumarationItems){
                local_enumarationItemsP.push(reviGame.enumHidePercent)
            }

            reviGame.gotWrong = false
            customDisplayQuestion(blankedQuestion)
            enumarationShowClues()
        }
        

    } else {
        // if enumaration
        html_multipleChoiceContainer.style.display = "none"
        html_enumarationId.style.display = "block"

        local_enumarationItems = []
        local_enumarationItemsP = []
        local_enumAlreadyAnswered = []
        html_enumChoicesId.style.color = "#FFFFFF"

        local_enumInOrder = reviewItems[reviGame.atNumber].enumInOrder
        local_enumarationItems = [...currentItem]
        reviGame.enumFocusIndex = 0

        if (local_enumInOrder == false){
            local_enumarationItems = shuffleArray(local_enumarationItems)
        }

        // reset value
        reviGame.enumHidePercent = 70
        reviGame.enumFocusHidePercent = 70

        // dynamic difficult :) [if yellow flag]
        if (reviewItems[reviGame.atNumber][whichDifficultyType] > yellowFlagRange && reviewItems[reviGame.atNumber][whichDifficultyType] < redFlagRange){
            reviGame.enumHidePercent = 50
            reviGame.enumFocusHidePercent = 50
        }

        // if red flag
        if (reviewItems[reviGame.atNumber][whichDifficultyType] >= redFlagRange){
            reviGame.enumHidePercent = 30
            reviGame.enumFocusHidePercent = 30
        }

        // push the hide percentage
        for (var i in local_enumarationItems){
            local_enumarationItemsP.push(reviGame.enumHidePercent)
        }

        reviGame.gotWrong = false
        enumarationShowClues()
    }
}

function clearFeedback(){
    console.log("Cleared")
    html_Feedback.innerHTML = ""
}

function reAllowToSubmit(){
    html_enumSubContainerId.style.backgroundColor = "#444444"
    html_enumSubContainerId.style.borderColor = "#000000"
    reviGame.preventSubmission = false  
}

function resetMultipleChoices(){
    for (var i = 1; i<=4; i++){
        var html_selectedContainer = document.getElementById("choiceContainerId"+i)
        html_selectedContainer.style.backgroundColor = "#444444"
        html_selectedContainer.style.borderColor = "#000000"
    }
}

function restartingMessage(){
    html_GroupTitle.innerHTML = "Restarting"
    html_Question.innerHTML = ``
    html_restartContainer.style.display = "none";

    if (whichDifficultyType == "difficultyClassic"){
        reviTermSfx_CurrentBg.play()
    }
    setTimeout(startReviTerm, 1000) 
}

function proceedToNextItem(){
    // if not finished
    if (reviewItems.length > reviGame.atNumber){
        if (reviGame.options.mode != "Practice"){
            remixModeValue = randomNumbers(-remixModeValueRarity, remixModeValueRange)
            console.log("remixMOdeValuE "+remixModeValue)
        }
        
        displayQuestion()
        //html_difficultyMeter.innerHTML = "DifficultyMeter: "+reviewItems[reviGame.atNumber][whichDifficultyType]
        showChoices(reviewItems[reviGame.atNumber].group)   
        reviGame.preventSubmission = false
        reviGame.gotWrong = false

        resetMultipleChoices()
        updateForgetfulFlag(whichDifficultyType)

    // if finished
    } else {
        displayCongrats()
    }
}

function getReviewerContent(){
    // first get the title
    localforage.getItem("selectedReviewer", function (err, title) {
        reviewerDatabase = "reviewerContent_"+title

        // then its content
        localforage.getItem(reviewerDatabase, function (err, items) {
            reviewItems = items

            // and get the excluded groups
            localforage.getItem("selectedGroupExclusion", function (err, exGroup) {
                local_selectedGroupExclusion = exGroup
                console.log(exGroup)

                // uhhhh                
                localforage.getItem("reviTermGameOptions", function (err, gameOptions) {
                    reviGame.options = gameOptions

                    console.log("EXTRACTED GAMEMODE: "+gameOptions)

                    // then start the reviTerm!
                    startIntervalLoop()
                    startReviTerm()
                })
                
            });
        });
    });
}

function goBackToEditor(){
    window.location.replace("reviEditor.html");
}

function restartFromGameOver(){
    html_gameOverContainerId.style.display = "none"
    html_gameOverButtonContainerId.style.display = "none"
    html_gameOverBlackScreenId.style.opacity = 0
    html_gameOverBlackScreenId.style.display = "none"
    reviTermSfx_BGSpeed = 1

    setTimeout(startReviTerm,100) 
}

// Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System 
// Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System 
// Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System // Health System 

function drainHealth(){
    if (reviGame.isPaused == false && reviGame.isFinished == false){
        if (reviGame.trueHealth > 0){
            //reviGame.health = reviGame.health - 0.007
            reviGame.health = reviGame.health - 0.007
            drainHealthAnimation(reviGame.health)    
            //console.log(reviGame.health)        
        } else {
            //console.log(reviGame.gameOver)
            if (reviGame.gameOver == false){
                console.log("GAME OVER")
                showGameOverScrn()
                reviGame.gameOver = true
            }
            
            changeBgSpeed(0, 0.05)
        }
    }
}


// Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs 
// Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs 
// Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs // Display question/Stuffs 

function displayImage(){
    console.log("Content of image", reviewItems[reviGame.atNumber].image)

    anime({
        targets: html_quizContainer,
        top: "50%",
        left: "50%",
        translateX: "-50%",
        translateY: "-50%",
        rotate: '0deg',
        loop: 1,
    });

    if (reviewItems[reviGame.atNumber].image != ""){
        html_questionImageContainerId.style.display = "block"

        var blobUrl = URL.createObjectURL(reviewItems[reviGame.atNumber].image)
        document.querySelector(".questionImage").src = blobUrl
        //console.log(reviewItems[reviGame.atNumber].image)
    }

    if (reviewItems[reviGame.atNumber].image == ""){
        html_questionImageContainerId.style.display = "none"
    }
    
}

function displayQuestion(){
    html_GroupTitle.innerHTML =  reviewItems[reviGame.atNumber].group
    html_Question.innerHTML = reviewItems[reviGame.atNumber].question
    displayImage()

    //html_difficultyMeter.innerHTML = "DifficultyMeter: "+reviewItems[reviGame.atNumber][whichDifficultyType]
}

function displayTrueFalse(toCheck){
    html_GroupTitle.innerHTML =  reviewItems[reviGame.atNumber].group
    html_Question.innerHTML = reviewItems[reviGame.atNumber].question+`<br/><br/><div style="display: inline-block; color: #77ccf0;">`+toCheck+`</div> is the answer!`
    displayImage()
}

function displayPickTheWrong(){
    html_GroupTitle.innerHTML =  reviewItems[reviGame.atNumber].group
    html_Question.innerHTML = reviewItems[reviGame.atNumber].question+`<br/><br/><div style="display: inline-block; color: #77ccf0;"> Pick the WRONG ANSWER!</div>`
    displayImage()
}

function displayCongrats(){
    html_questionImageContainerId.style.display = "none"
    html_GroupTitle.innerHTML = "Nicely Done!"
    html_Question.innerHTML =
    `You completed the review session!<br/><br/>Total Items: `+(reviGame.atNumber)+`<br/>Total Mistakes: `+reviGame.totalMistakes+``
    html_choicesContainer.style.display = "none"; 

    resetMultipleChoices()

    console.log(local_temporarySaveForExcluded)

    reviGame.isFinished = true

    if (reviGame.options.mode == "Practice"){
        // if there was an exclusion, before saving to database, put back the exclusion
        if (local_temporarySaveForExcluded.length > 1){
            console.log("The Old one", reviewItems)
            reviewItems = [...reviewItems, ...local_temporarySaveForExcluded]
            console.log("BackOriginal", reviewItems)
        }
    }

    if (whichDifficultyType == "difficultyClassic"){
        reviTermSfx_CurrentBg.pause()
    }

    localforage.getItem(reviewerDatabase, function (err, value) {
        console.log(value)
        localforage.setItem(reviewerDatabase, reviewItems)
        html_restartContainer.style.display = "block";
        //html_restartContainer.innerHTML = "Saved!"        
        //setTimeout(startReviTerm, 3000) 
    })   
}

function customDisplayQuestion(Question){
    html_GroupTitle.innerHTML =  reviewItems[reviGame.atNumber].group
    html_Question.innerHTML = Question
    displayImage()
}

function displayGameOverMessage(){
    html_gameOverContainerId.style.display = "block"
    var html_onlyAnswered = document.querySelector(".onlyAnswered")


    html_onlyAnswered.innerHTML = "You only answered "+reviGame.atNumber+"/"+reviewItems.length+" items"


    resetMultipleChoices()

    //reviGame.isFinished = true

    localforage.getItem(reviewerDatabase, function (err, value) {
        console.log(value)
        localforage.setItem(reviewerDatabase, reviewItems)
        html_gameOverButtonContainerId.style.display = "block";
    })  
}

// CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers 
// CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers 
// CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers // CheckAnswers 

function checkAnswer(userAnswer){
    userAnswer = userAnswer.toLowerCase()
    var toCheck = reviewItems[reviGame.atNumber].answer.toLowerCase()
    
    console.log("ToCheck: "+userAnswer)
    console.log("correctAnswer "+toCheck)

    // if correct
    if (toCheck == userAnswer){

        // decrease difficulty number
        if (reviGame.gotWrong == false){

            if (reviewItems[reviGame.atNumber][whichDifficultyType] > -difficultyRange){
                reviewItems[reviGame.atNumber][whichDifficultyType] -= 1
            }
        
            //displayQuestion()
        }

        updateForgetfulFlag(whichDifficultyType)
        reviGame.atNumber += 1

        html_Feedback.innerHTML = "Correct! "+userAnswer+" was the correct answer!"
        
        
        setTimeout(proceedToNextItem, 1000);

        //setTimeout(clearFeedback, 1000);

        return 1;

    // if incorrect
    } else {
    
        reviGame.gotWrong = true
        reviGame.totalMistakes += 1

        // add difficulty number
        if (reviewItems[reviGame.atNumber][whichDifficultyType] < difficultyRange){
            reviewItems[reviGame.atNumber][whichDifficultyType] += 1
        }

        updateForgetfulFlag(whichDifficultyType)
        wrongAnswerAnimation()
        //displayQuestion()
        //html_Feedback.innerHTML = "Wrong Answer!"
        //setTimeout(clearFeedback, 1000);
        setTimeout(reAllowToSubmit, 300)
        
        console.log("SADSADSA")

        return 0;
    }
    
}

function checkAnswerMultipleChoice(choiceNum){

    // multipleChoice
    if (remixModeValue <= 0){
        if (!reviGame.preventSubmission){
            reviGame.preventSubmission = true
    
            var html_selectedChoice = document.getElementById("choice"+choiceNum+"Id")
            var html_selectedContainer = document.getElementById("choiceContainerId"+choiceNum)
            var userAnswer = html_selectedChoice.innerHTML
            var html_health = document.getElementById("health"+choiceNum+"Id")
    
            // check First if user is trying to tap at the already wrong answer
            if (html_selectedContainer.style.backgroundColor != "rgb(128, 32, 32)"){
                // if correct
                if (checkAnswer(userAnswer)){
                    crrct_audio.play()
                    html_selectedContainer.style.backgroundColor = "#1bbb0c"
                    html_selectedContainer.style.borderColor = "#1bbb0c"
                    reviGame.health = reviGame.health + (multipleChoiceDMG*0.5)
                    
                }
                // if wrong
                else {
                    // this might change
                    html_selectedContainer.style.backgroundColor = "#802020"
                    html_selectedContainer.style.borderColor = "#802020"
                    reviGame.health = reviGame.health - multipleChoiceDMG
                    wrng_audio.play()
                }
            } else {
                reAllowToSubmit()
            }
    
            console.log(html_selectedContainer.style.backgroundColor)
        }
    }

    // TF
    if (remixModeValue == 1){
        if (!reviGame.preventSubmission){
            reviGame.preventSubmission = true
            var html_selectedChoice = document.getElementById("choice"+choiceNum+"Id")
            var html_selectedContainer = document.getElementById("choiceContainerId"+choiceNum)
            var html_health = document.getElementById("health"+choiceNum+"Id")   

            // check First if user is trying to tap at the already wrong answer
            if (html_health.style.backgroundColor != "rgb(209, 52, 52)"){
                // if correct
                if ((trueOrFalseAnswer && choiceNum == 1) || (trueOrFalseAnswer == false && choiceNum == 2)){
                    html_selectedContainer.style.backgroundColor = "#1bbb0c"
                    html_selectedContainer.style.borderColor = "#1bbb0c"
                    reviGame.health = reviGame.health + (multipleChoiceDMG*0.5)
                    checkAnswer(reviewItems[reviGame.atNumber].answer)
                    crrct_audio.play()
                }
                // if wrong
                else {
                    // this might change
                    html_selectedContainer.style.backgroundColor = "#802020"
                    html_selectedContainer.style.borderColor = "#802020"
                    reviGame.health = reviGame.health - multipleChoiceDMG
                    checkAnswer("")
                    wrng_audio.play()
                }
            } else {
                reAllowToSubmit()
            }
        }
    }

    // Scrambled
    if (remixModeValue == 2){
        if (!reviGame.preventSubmission){
            reviGame.preventSubmission = true
            
            var html_selectedContainer = document.getElementById("choiceContainerId"+choiceNum)
            var html_selectedChoice = document.getElementById("choice"+choiceNum+"Id")
            var userAnswer = unscrambledChoices[choiceNum-1]
            var html_health = document.getElementById("health"+choiceNum+"Id")

            // check First if user is trying to tap at the already wrong answer
            if (html_health.style.backgroundColor != "rgb(209, 52, 52)"){
                // if correct
                if (checkAnswer(userAnswer)){
                    html_selectedContainer.style.backgroundColor = "#1bbb0c"
                    html_selectedContainer.style.borderColor = "#1bbb0c"
                    reviGame.health = reviGame.health + (multipleChoiceDMG*0.5)
                    html_selectedChoice.innerHTML = userAnswer
                    unscrambledChoices = []
                    crrct_audio.play()
                }
                // if wrong
                else {
                    // this might change
                    html_selectedContainer.style.backgroundColor = "#802020"
                    html_selectedContainer.style.borderColor = "#802020"
                    reviGame.health = reviGame.health - multipleChoiceDMG
                    html_selectedChoice.innerHTML = userAnswer
                    wrng_audio.play()
                }
            } else {
                reAllowToSubmit()
            }
    
            console.log(html_health.style.backgroundColor)
        }
    }    

    // PickTheWrong
    if (remixModeValue == 3){
        if (!reviGame.preventSubmission){
            reviGame.preventSubmission = true
            
            var html_selectedContainer = document.getElementById("choiceContainerId"+choiceNum)
            var html_selectedChoice = document.getElementById("choice"+choiceNum+"Id")
            var userAnswer = html_selectedChoice.innerHTML
            var html_health = document.getElementById("health"+choiceNum+"Id")
    
            userAnswer = userAnswer.toLowerCase()
            var toCheck = reviewItems[reviGame.atNumber].answer.toLowerCase()

            // had to improvise to save space (basically if they chose the correct answer, make it wrong)
            if (userAnswer == toCheck){
                userAnswer = userAnswer+"WRONG"
            } else {
                userAnswer = toCheck
            }

            console.log("WAFSASFA", userAnswer)

            // check First if user is trying to tap at the already wrong answer
            if (html_health.style.backgroundColor != "rgb(209, 52, 52)"){
                // if correct
                if (checkAnswer(userAnswer)){
                    html_selectedContainer.style.backgroundColor = "#1bbb0c"
                    html_selectedContainer.style.borderColor = "#1bbb0c"
                    reviGame.health = reviGame.health + (multipleChoiceDMG*0.5)
                    crrct_audio.play()
                }
                // if wrong
                else {
                    // this might change
                    html_selectedContainer.style.backgroundColor = "#802020"
                    html_selectedContainer.style.borderColor = "#802020"
                    reviGame.health = reviGame.health - multipleChoiceDMG
                    wrng_audio.play()
                }
            } else {
                reAllowToSubmit()
            }
    
            console.log(html_health.style.backgroundColor)
        }
    }

}

function scanIfAnsweredAllEnum(){
    console.log(local_enumarationItemsP)

    var enumCompleted = true
    reviGame.enumFocusIndex = 0


    for (var i in local_enumarationItemsP){
        if (local_enumarationItemsP[i] == 0){
            reviGame.enumFocusIndex += 1
        } else {
            enumCompleted = false
            break
        }
    }

    enumarationShowClues()
    // 
    

    if (enumCompleted){

        // decrease difficulty number
        if (reviGame.gotWrong == false){
            if (reviewItems[reviGame.atNumber][whichDifficultyType] > -difficultyRange){
                reviewItems[reviGame.atNumber][whichDifficultyType] -= 1
                updateForgetfulFlag(whichDifficultyType)
            }
        }
        reviGame.gotWrong = false
        html_enumChoicesId.style.color = "#60ff51"
        reviGame.atNumber += 1
        setTimeout(proceedToNextItem, 1000);
    }
}

function checkAnswerEnumeration(){
    if (!reviGame.preventSubmission){
        reviGame.preventSubmission = true
        var userEnumAnswer = html_enumAnswer.value.toLowerCase()
        userEnumAnswer = userEnumAnswer.trimRight()

        var correctIndex = scanString(local_enumarationItems, userEnumAnswer)

        // 
        if (local_enumInOrder){
            correctIndex = checkIfTheSame(local_enumarationItems[reviGame.enumFocusIndex].toLowerCase(), userEnumAnswer)
        }


        console.log("The correct index "+correctIndex)

        //local_enumInOrder

        // if correct answer
        if (correctIndex > -1){
            if (scanString(local_enumAlreadyAnswered, userEnumAnswer) == -1){
                local_enumarationItemsP[correctIndex] = 0
                document.querySelector(".enumClue"+correctIndex).innerHTML = hideCharacter(local_enumarationItems[correctIndex], local_enumarationItemsP[correctIndex])
                local_enumAlreadyAnswered.push(userEnumAnswer)
                
                html_enumSubContainerId.style.backgroundColor = "#41ad37"
                html_enumSubContainerId.style.borderColor = "#41ad37"
                html_enumAnswer.value = ""

                reviGame.health = reviGame.health + (enumDMG*2)

                scanIfAnsweredAllEnum()
                setTimeout(reAllowToSubmit, 500)
                crrct_audio.play()
            } else {
                html_enumSubContainerId.style.backgroundColor = "#363636"
                html_enumSubContainerId.style.borderColor = "#363636"
                setTimeout(reAllowToSubmit, 100)
                console.log("Already Answered!")
            }

        } else {
        // if wrong answer

            console.log("Wrong!", userEnumAnswer)
            local_enumarationItemsP[reviGame.enumFocusIndex] = local_enumarationItemsP[reviGame.enumFocusIndex] - 10
            document.querySelector(".enumClue"+reviGame.enumFocusIndex).innerHTML = hideCharacter(local_enumarationItems[reviGame.enumFocusIndex], local_enumarationItemsP[reviGame.enumFocusIndex])
            
            console.log(html_enumSubContainerId.style.backgroundColor)

            html_enumSubContainerId.style.backgroundColor = "#d13434"
            html_enumSubContainerId.style.borderColor = "#d13434"
            
            // add difficulty number
            if (reviewItems[reviGame.atNumber][whichDifficultyType] < difficultyRange){
                reviewItems[reviGame.atNumber][whichDifficultyType] += 1
                reviGame.gotWrong = true
            }

            reviGame.health = reviGame.health - enumDMG

            updateForgetfulFlag(whichDifficultyType)
            wrongAnswerAnimation()
            setTimeout(reAllowToSubmit, 500) 
            wrng_audio.play()
        }
    }
}

// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!
// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!
// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!

function practiceMode(){
    remixModeValue = 0

    // check for exclusions
    extractExclusionGroup()

    // shuffle first
    reviewItems = shuffleArray(reviewItems)

    // start the functions
    generateGroupList("difficulty")
    mayonnaiseAlgorithm()
    displayQuestion()
    showChoices(reviewItems[reviGame.atNumber].group)   
    updateForgetfulFlag(whichDifficultyType)

    reviGame.preventSubmission = false
    reviGame.gotWrong = false
    //console.log(reviewItems)
}

function classicMode(){
    console.log("HelloThere! Classic!")

    //initiateHealth
    reviGame.health = 110
    reviGame.trueHealth = 110
    reviGame.gameOver = false
    reviGame.isFinished = false

    // shuffle first
    reviewItems = shuffleArray(reviewItems)

    // start the functions
    generateGroupList("difficultyClassic")
    ketchupAlgorithm("difficultyClassic")
    displayQuestion()
    showChoices(reviewItems[reviGame.atNumber].group)   
    updateForgetfulFlag(whichDifficultyType)

    reviGame.preventSubmission = false
    reviGame.gotWrong = false
}

function perfectionMode(){

}

function startReviTerm(){
    // reset variables
    reviGame.totalMistakes = 0
    reviGame.atNumber = 0
    reviGame.gotWrong = 0
    reviewItems_Groups = []
    local_temporarySaveForExcluded = []
    reviewItems_Choices = {}

    html_restartContainer.style.display = "none";
    html_choicesContainer.style.display = "block"
    //html_restartContainer.innerHTML = "[ Saving ]"      

    console.log("GAME MODE "+reviGame.options.mode)

    if (reviGame.options.mode == "Practice"){
        whichDifficultyType = "difficulty"
        practiceMode()
        restart_audio.play()
    } else if (reviGame.options.mode == "Classic"){
        whichDifficultyType = "difficultyClassic"
        classicMode()
        restart_audio.play()
        if (reviTermSfx_BGLoaded == false){
            playBg(reviTermSfx_BGARRAY[rndmBG])
        }
    } else if (reviGame.options.mode == "Perfection"){
        perfectionMode()
    }
}

function startIntervalLoop(){
    if (reviGame.options.mode == "Classic"){
        setInterval(drainHealth, 3);
    } else {
        html_health1Id.style.backgroundColor = "#64646464"
        html_health2Id.style.backgroundColor = "#64646464"
        html_health3Id.style.backgroundColor = "#64646464"
        html_health4Id.style.backgroundColor = "#64646464"
        html_enumHealthId.style.backgroundColor = "#64646464"
    }
}

getReviewerContent()
flagShakeAnimation()
animateLowHealth()

window.checkAnswerMultipleChoice = checkAnswerMultipleChoice
window.checkAnswerEnumeration = checkAnswerEnumeration

document.querySelector(".goBackButton").addEventListener("click", goBackToEditor);
document.querySelector(".restartButton").addEventListener("click", restartingMessage);

document.querySelector(".gameOverGoBackButton").addEventListener("click", goBackToEditor);
document.querySelector(".gameOverRestartButton").addEventListener("click", restartFromGameOver);


// initialize animations
anime({
    targets: html_quizContainer,
    top: "50%",
    left: "50%",
    translateX: "-50%",
    translateY: "-50%",
    loop: 1,
});