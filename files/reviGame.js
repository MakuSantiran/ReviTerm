import localforage from "./localForage/localforage.js" 


//just load the script
//var VelocityJsScript = document.createElement('script');
//VelocityJsScript.src = './files/VelocityJS/velocity.js';

//document.body.appendChild(VelocityJsScript);

// html things
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

var html_multipleChoiceContainer = document.getElementById("multipleChoiceContainerId")
var html_enumarationId = document.getElementById("enumarationId")
var html_enumSubmit = document.getElementById("enumSubmitId")
var html_enumChoicesId = document.getElementById("enumChoicesId")

var html_forgetfulFlag = document.querySelector(".forgetfulFlag_Red")
var html_forgetfulFlagYellow = document.querySelector(".forgetfulFlag_Yellow")
var html_quizContainer = document.querySelector(".quizContainer")
var html_enumFlexContainer = document.querySelector(".enumFlexContainer")
var html_enumAnswer = document.querySelector(".enumAnswer")


// variables
var reviGame = {
    atNumber: 0,
    gotWrong: false,
    preventSubmission: false,

    // sneak peak :)
    questionTypes: [
        "MultipleChoice",
        "TrueOrFalse", 
        "Scrambled", 
        "Identification",
        "WhichIsWrong",
        "FillInTheBlank"
    ],

    totalMistakes: 0,

    flagShakeIntensity: 20,  // the lower the more intense

    enumHidePercent: 65,
    enumFocusHidePercent: 65,
    enumFocusIndex: 0
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
var yellowFlagRange = 1
var redFlagRange = 3

// Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms 
// Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms 
// Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms // Algorithms 

// addToGroupList first if it doesn't exists {}
function generateGroupList(){

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
        var groupDifficulty = reviewItems[i]["difficulty"]
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

function randomNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

// Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations 
// Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations 
// Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations // Game Animations 

function flagShakeAnimation() {
    var properties = {
        top: ['-10px', '10px'] // Bobbing range
    };

    var options = {
        duration: 1000, // Duration of each shake (milliseconds)
        easing: 'easeInOutQuad', // Linear easing for smooth motion
        loop: true
    };

    Velocity(html_forgetfulFlag,properties,options)

}

function wrongAnswerAnimation(){
    var properties = {
        left: function() {
          var leftValue = randomNumbers(-1,1)
          return 50 + leftValue + '%';
        },
        top: function() {
            var leftValue = randomNumbers(-1,1)
            return 50 + leftValue + '%';
        },
    };

    var options = {
        duration: 40, // Duration of each shake (milliseconds)
        easing: 'linear', // Linear easing for smooth motion
        loop: 1, // Number of times to repeat the animation
        complete: function() {
            // Chain another animation after fading out
            Velocity(html_quizContainer, {left: "49%", top: "50%" }, { duration: 1 });
        }
    };   

    Velocity(html_quizContainer,properties,options)
}

function updateForgetfulFlag(){
    var forgetfulLevel = reviewItems[reviGame.atNumber].difficulty

    if (forgetfulLevel > yellowFlagRange){
        html_forgetfulFlagId.style.display = "flex";
    } else {
        html_forgetfulFlagId.style.display = "none";
    }

    if (forgetfulLevel >= yellowFlagRange && forgetfulLevel < redFlagRange){
        html_forgetfulFlagId.src = './files/img/SlightlyForgetful.png'
    } else if (forgetfulLevel >= redFlagRange){
        html_forgetfulFlagId.src = './files/img/ForgetfulFlag.png'
    }

    console.log(forgetfulLevel, reviGame.flagShakeIntensity)

    //html_forgetfulFlagYellow
}


// QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes 
// QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes 
// QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes // QuestionTypes 

function multipleChoice(Group){
    var theChoices = []

    var amountOfChoices = 4

    // display the other 2
    document.getElementById("choice1ContainerId3").style.display = "block"
    document.getElementById("choice1ContainerId4").style.display = "block"
    
    // dynamic difficult :) [if yellow flag]
    if (reviewItems[reviGame.atNumber].difficulty > yellowFlagRange && reviewItems[reviGame.atNumber].difficulty < redFlagRange){
        amountOfChoices = 3
        document.getElementById("choice1ContainerId4").style.display = "none"
    }

    // if red flag
    if (reviewItems[reviGame.atNumber].difficulty >= redFlagRange){
        amountOfChoices = 2
        document.getElementById("choice1ContainerId3").style.display = "none"
        document.getElementById("choice1ContainerId4").style.display = "none"
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


// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 
// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 
// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 

function showChoices(Group){

    // check first if the current item is 
    var currentItem = reviewItems[reviGame.atNumber].answer

    // if Q and A
    if (checkIfStringOrArray(currentItem)) {
        // if multiple Choice
        html_multipleChoiceContainer.style.display = "block"
        html_enumarationId.style.display = "none"

        multipleChoice(Group)


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
        if (reviewItems[reviGame.atNumber].difficulty > yellowFlagRange && reviewItems[reviGame.atNumber].difficulty < redFlagRange){
            reviGame.enumHidePercent = 50
            reviGame.enumFocusHidePercent = 50
        }

        // if red flag
        if (reviewItems[reviGame.atNumber].difficulty >= redFlagRange){
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

function displayQuestion(){
    html_GroupTitle.innerHTML =  reviewItems[reviGame.atNumber].group
    html_Question.innerHTML = reviewItems[reviGame.atNumber].question
    //html_difficultyMeter.innerHTML = "DifficultyMeter: "+reviewItems[reviGame.atNumber].difficulty
}

function reAllowToSubmit(){
    html_enumSubmit.style.backgroundColor = "#646464"
    reviGame.preventSubmission = false  
}

function resetMultipleChoices(){
    for (var i = 1; i<=4; i++){
        var html_health = document.getElementById("health"+i+"Id")
        html_health.style.backgroundColor = "#646464"
    }
}

function displayCongrats(){
    html_GroupTitle.innerHTML = "Nicely Done!"
    html_Question.innerHTML =
    `You completed the review session!<br/><br/>Total Items: `+(reviGame.atNumber)+`<br/>Total Mistakes: `+reviGame.totalMistakes+``
    html_choicesContainer.style.display = "none"; 

    resetMultipleChoices()

    console.log(local_temporarySaveForExcluded)

    // if there was an exclusion, before saving to database, put back the exclusion
    if (local_temporarySaveForExcluded.length > 1){
        console.log("The Old one", reviewItems)
        reviewItems = [...reviewItems, ...local_temporarySaveForExcluded]
        console.log("BackOriginal", reviewItems)
    }

    localforage.getItem(reviewerDatabase, function (err, value) {
        console.log(value)
        localforage.setItem(reviewerDatabase, reviewItems)
        html_restartContainer.style.display = "block";
        //html_restartContainer.innerHTML = "Saved!"        
        //setTimeout(startReviTerm, 3000) 
    })   
}

function restartingMessage(){
    html_GroupTitle.innerHTML = "Restarting"
    html_Question.innerHTML = ``
    html_restartContainer.style.display = "none";
    setTimeout(startReviTerm, 1000) 
}

function proceedToNextItem(){
    // if not finished
    if (reviewItems.length > reviGame.atNumber){

        
        html_GroupTitle.innerHTML =  reviewItems[reviGame.atNumber].group
        html_Question.innerHTML = reviewItems[reviGame.atNumber].question
        //html_difficultyMeter.innerHTML = "DifficultyMeter: "+reviewItems[reviGame.atNumber].difficulty
        showChoices(reviewItems[reviGame.atNumber].group)   
        reviGame.preventSubmission = false
        reviGame.gotWrong = false

        resetMultipleChoices()
        updateForgetfulFlag()

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

                // then start the reviTerm!
                startReviTerm()

            });
        });
    });
}

function goBackToEditor(){
    window.location.replace("reviEditor.html");
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

            if (reviewItems[reviGame.atNumber].difficulty > -difficultyRange){
                reviewItems[reviGame.atNumber].difficulty -= 1
            }
        
            displayQuestion()
        }

        updateForgetfulFlag()
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
        if (reviewItems[reviGame.atNumber].difficulty < difficultyRange){
            reviewItems[reviGame.atNumber].difficulty += 1
        }

        updateForgetfulFlag()
        wrongAnswerAnimation()
        displayQuestion()
        //html_Feedback.innerHTML = "Wrong Answer!"
        //setTimeout(clearFeedback, 1000);
        setTimeout(reAllowToSubmit, 300)
        
        return 0;
    }
    
}

function checkAnswerMultipleChoice(choiceNum){
    if (!reviGame.preventSubmission){
        reviGame.preventSubmission = true

        var html_selectedChoice = document.getElementById("choice"+choiceNum+"Id")
        var userAnswer = html_selectedChoice.innerHTML
        var html_health = document.getElementById("health"+choiceNum+"Id")

        // check First if user is trying to tap at the already wrong answer
        if (html_health.style.backgroundColor != "rgb(209, 52, 52)"){
            // if correct
            if (checkAnswer(userAnswer)){
                html_health.style.backgroundColor = "#41ad37"

            }
            // if wrong
            else {
                // this might change
                html_health.style.backgroundColor = "#d13434"
            }
        } else {
            reAllowToSubmit()
        }

        console.log(html_health.style.backgroundColor)
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
            if (reviewItems[reviGame.atNumber].difficulty > -difficultyRange){
                reviewItems[reviGame.atNumber].difficulty -= 1
                updateForgetfulFlag()
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
                
                html_enumSubmit.style.backgroundColor = "#41ad37"
                html_enumAnswer.value = ""

                scanIfAnsweredAllEnum()
                setTimeout(reAllowToSubmit, 500)
            } else {
                html_enumSubmit.style.backgroundColor = "#363636"
                setTimeout(reAllowToSubmit, 100)
                console.log("Already Answered!")
            }

        } else {
        // if wrong answer

            console.log("Wrong!", userEnumAnswer)
            local_enumarationItemsP[reviGame.enumFocusIndex] = local_enumarationItemsP[reviGame.enumFocusIndex] - 10
            document.querySelector(".enumClue"+reviGame.enumFocusIndex).innerHTML = hideCharacter(local_enumarationItems[reviGame.enumFocusIndex], local_enumarationItemsP[reviGame.enumFocusIndex])
            html_enumSubmit.style.backgroundColor = "#d13434"
            console.log(html_enumSubmit.style.backgroundColor)


            // add difficulty number
            if (reviewItems[reviGame.atNumber].difficulty < difficultyRange){
                reviewItems[reviGame.atNumber].difficulty += 1
                reviGame.gotWrong = true
            }

            updateForgetfulFlag()
            wrongAnswerAnimation()
            setTimeout(reAllowToSubmit, 500) 
            
        }
    }
}

// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!
// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!
// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!// start!

function startReviTerm(){
    // reset variables
    reviGame.atNumber = 0
    reviGame.gotWrong = 0
    reviewItems_Groups = []
    local_temporarySaveForExcluded = []
    reviewItems_Choices = {}

    html_restartContainer.style.display = "none";
    html_choicesContainer.style.display = "block"
    //html_restartContainer.innerHTML = "[ Saving ]"      

    // check for exclusions
    extractExclusionGroup()

    // shuffle first
    reviewItems = shuffleArray(reviewItems)

    // start the functions
    generateGroupList()
    mayonnaiseAlgorithm()
    displayQuestion()
    showChoices(reviewItems[reviGame.atNumber].group)   
    updateForgetfulFlag()

    reviGame.preventSubmission = false
    reviGame.gotWrong = false
    //console.log(reviewItems)
}

getReviewerContent()
flagShakeAnimation()


window.checkAnswerMultipleChoice = checkAnswerMultipleChoice
window.checkAnswerEnumeration = checkAnswerEnumeration

document.querySelector(".goBackButton").addEventListener("click", goBackToEditor);
document.querySelector(".restartButton").addEventListener("click", restartingMessage);