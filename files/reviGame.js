import localforage from "./localForage/localforage.js" 

// html
var html_Question = document.getElementById("question")
var html_Choice = document.getElementById("choices")
var html_Answer = document.getElementById("answer")
var html_Feedback = document.getElementById("feedback")
var html_GroupTitle = document.getElementById("groupTitle")
var html_difficultyMeter = document.getElementById("difficultyMeter")

// variables
var Game = {
    atNumber: 0,
    gotWrong: false,
    isGoingToNext: false,
}
var reviewItems_Groups = []     // the outline of this is {group: #, difficulty: #}
var reviewItems_Choices = {}

var local_selectedGroupExclusion = []
var local_temporarySaveForExcluded = []

// Define sample quiz questions
var reviewItems = [];
var reviewerDatabase = ""

var difficultyRange = 5

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
                generateChoicesBasedOnGroup(selectedGroup, itemsToBeScanned[j].answer)                    
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


// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 
// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 
// Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function // Game Function 

function showChoices(Group){
    
    html_Choice.innerHTML = "<br/>Choices: <br/>"

    var theChoices = []

    for (var i in reviewItems_Choices[Group]) {
        theChoices.push(reviewItems_Choices[Group][i])
    }

    var randomizedChoices = shuffleArray(theChoices)

    for (var i in reviewItems_Choices[Group]) {
        html_Choice.innerHTML += randomizedChoices[i]+"<br/>"
    }
}

function clearFeedback(){
    console.log("Cleared")
    html_Feedback.innerHTML = ""
}

function displayQuestion(){
    html_GroupTitle.innerHTML =  reviewItems[Game.atNumber].group
    html_Question.innerHTML = reviewItems[Game.atNumber].question
    html_difficultyMeter.innerHTML = "DifficultyMeter: "+reviewItems[Game.atNumber].difficulty
}

function reAllowToSubmit(){
    Game.isGoingToNext = false  
}

function proceedToNextItem(){

    // if not finished
    if (reviewItems.length > Game.atNumber){
        html_Answer.value = ""
        html_GroupTitle.innerHTML =  reviewItems[Game.atNumber].group
        html_Question.innerHTML = reviewItems[Game.atNumber].question
        html_difficultyMeter.innerHTML = "DifficultyMeter: "+reviewItems[Game.atNumber].difficulty
        showChoices(reviewItems[Game.atNumber].group)   
        Game.isGoingToNext = false
        Game.gotWrong = false

    // if finished
    } else {
        html_Question.innerHTML = "You completed the review session!, Restarting!"
        html_Choice.innerHTML = ""
        html_Answer.value = ""

        // if there was an exclusion, before saving to database, put back the exclusion
        if (local_temporarySaveForExcluded.length > 1){

            console.log(reviewItems)

            reviewItems = [...reviewItems, ...local_temporarySaveForExcluded]

            console.log("BackOriginal", reviewItems)

            localforage.getItem(reviewerDatabase, function (err, value) {
                console.log(value)
                localforage.setItem(reviewerDatabase, reviewItems)
                setTimeout(startReviTerm, 3000) 
            })   
        }
        
        /*/
      
        /**/

    }


}

function checkAnswer(){
    var userAnswer = html_Answer.value.trimRight()
    userAnswer = userAnswer.toLowerCase()

    var toCheck = reviewItems[Game.atNumber].answer.toLowerCase()
    

    if (!Game.isGoingToNext){
        // if correct
        if (toCheck == userAnswer){

            Game.isGoingToNext = true

            // decrease difficulty number

            if (Game.gotWrong == false){

                if (reviewItems[Game.atNumber].difficulty > -difficultyRange){
                    reviewItems[Game.atNumber].difficulty -= 1
                }
            
                displayQuestion()
            }

            Game.atNumber += 1

            html_Feedback.innerHTML = "Correct! "+userAnswer+" was the correct answer!"

            setTimeout(clearFeedback, 1000);
            setTimeout(proceedToNextItem, 1000);

        // if incorrect
        } else {
            
            Game.isGoingToNext = true
            Game.gotWrong = true

            // add difficulty number
            if (reviewItems[Game.atNumber].difficulty < difficultyRange){
                reviewItems[Game.atNumber].difficulty += 1
            }

            displayQuestion()
            html_Feedback.innerHTML = "Wrong Answer!"
            setTimeout(clearFeedback, 1000);
            setTimeout(reAllowToSubmit, 1000)
        }
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


function includeGroups(){

}


// start!
function startReviTerm(){
    // reset variables
    Game.atNumber = 0
    reviewItems_Groups = []
    reviewItems_Choices = {}

    // check for exclusions
    extractExclusionGroup()

    // shuffle first
    reviewItems = shuffleArray(reviewItems)

    // start the functions
    generateGroupList()
    mayonnaiseAlgorithm()
    displayQuestion()
    showChoices(reviewItems[Game.atNumber].group)   

    Game.isGoingToNext = false
    Game.gotWrong = false
    //console.log(reviewItems)
    //console.log(reviewItems_Choices)
}

getReviewerContent()

window.checkAnswer = checkAnswer