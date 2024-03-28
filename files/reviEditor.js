import localforage from "./localForage/localforage.js"


var reviewerDatabaseName = "reviewerContent"
var revieweraddOn = "reviewerContent_"
var gameOption = {
    mode: "Practice",
    music: true,
    easyMode: false,
}

// selectedGroupExclusion --> includes the group that would not be taken in the reviterm (This might change especially for the structure of file)
// reviewerContent_NAME --> contains the items of the reviewer
// reviewerContent_NAME_Details --> contains other aspects of reviewer
// reviTermGameMode --> contains which game mode will be used in the review session
// selectedCharacter --> contains which character did the user picked

// temporary/local values to be updated in the reviewerContent_NAME_Details database
var local_idCounter = 0
var local_amountOfItems = 0
var local_groupList = []
var local_selectedItem = []
var local_selectedGroupExclusion = []
var local_contentOfReviewer = []

var local_forgetfulFlagScore = {} // this is per group
var local_bestFlagGroup = {}    // this is per group
var local_gameModeFlags = [-99,-99,0]    // contains the flag/rank of gameModes

var local_qType = 0 // 0 Question and Answer | 1 Enumaration
var local_EnumarationItem = []

var local_questionPlaceHolder = ""
var local_groupPlaceHolder = ""
var local_atQuestionType = 0

var local_whichGroupsAreHidden = []

var forgetfulScoreAdjacent = 5

// as the name suggests
var local_firstRun = true

// by classes

var html_group = document.querySelector(".itemGroup")
var html_question = document.querySelector(".itemQuestion")
var html_answer = document.querySelector(".itemAnswer")
var html_image = document.querySelector(".itemImage")
var html_addButton = document.querySelector(".addItemFunc")
var html_difficulty = document.querySelectorAll(".itemDifficulty")

var html_enumQuestion = document.querySelector(".enumItemQuestion")
var html_enumGroup = document.querySelector(".enumItemGroup")
var html_enumInOrder = document.querySelector(".enumInOrder")
var html_addEnumButton = document.querySelector(".addEnumItemFunc")

var html_gameModeFlag = document.querySelector(".gameModeFlag")

// by Ids
var html_itemAnswerId = document.getElementById("itemAnswerId")
var html_questionId = document.getElementById("itemQuestionId")
var html_enumInOrderId = document.getElementById("enumInOrderId")
var html_QAAB = document.getElementById("QAButtonId")
var html_EnumB = document.getElementById("EnumButtonId")
var html_qAAContainer = document.getElementById("qAAContainerId")
var html_enumContainer = document.getElementById("enumContainerId")
var html_practiceModeContainerId = document.getElementById("practiceModeContainerId")
var html_classicModeContainerId = document.getElementById("classicModeContainerId")
var html_perfectionModeContainerId = document.getElementById("perfectionModeContainerId")
var html_practiceModeButtonId = document.getElementById("practiceModeButtonId")
var html_classicModeButtonId = document.getElementById("classicModeButtonId")
var html_perfectionModeButtonId = document.getElementById("perfectionModeButtonId")

var html_overlay = document.getElementById("overlay") 
var html_editBox = document.getElementById("editorId") 
var html_initOptionsDIV = document.getElementById("initOptionsDIVId") 

var FGrey = "./files/img/flags/FGREY.png"
var FGreen = "./files/img/flags/FGREEN.png"
var FBlue = "./files/img/flags/FBLUE.png"
var FYellow = "./files/img/flags/FYELLOW.png"
var FRed = "./files/img/flags/FRED.png"

// OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS 
// OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS 
// OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS // OTHER FUNCTIONS 

function getItemById(array, id) {
    return array.find(function(item) {
        return item.id === id;
    });
}

function findItemIndexById(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            return i; // Return the index of the item if found
        }
    }
    return -1; // Return -1 if item not found
}

function checkDuplicates(arr) {

    // Check for duplicates
    const uniqueSet = new Set(arr);
    if (uniqueSet.size !== arr.length) {
        return true;
    }

    return false;
}

function trimStringArray(arr) {
    // Map over the array and trim each string
    return arr.map(str => str.trim()).filter(str => str !== "");
}

function removeHiddenGroup(arr, id) {
    // Find the index of the number in the array
    var index = arr.indexOf(id);

    // If the number exists in the array, remove it
    if (index !== -1) {
        arr.splice(index, 1);
    }

    // Return the modified array
    return arr;
}

function addPicture(event) {
    var file = event.target.files[0];

    console.log("Running")

    if (!file) {
        console.log("file not found!")
        return;
    }
    
    var fileReader = new FileReader();
    var Compressor = window.Compressor; //load the compressor
    var maxSize = 3 * 1024 * 1024; // 3MB

    fileReader.onload = function(loadedFile) {
        var arrayBuffer = loadedFile.target.result;

        if (file.size > maxSize) {
            alert('Please choose an image that is 3MB or less.');
            return;
        }

        // Adjust the options as needed
        var options = {
            quality: 0.3, // Change the quality as desired
            //maxWidth: 800, // Maximum width of the image
            //maxHeight: 600, // Maximum height of the image

            success(result) {
                //result, result.name
                console.log('Upload success', result.name);
                console.log("blob", result)

                local_selectedItem.image = result
                console.log(local_selectedItem)
                
                var blobUrl = URL.createObjectURL(result);
                document.querySelector(".itemImageShow").src = blobUrl

                updateBothQEQuestions()

                //alert(fileName)
            },

            error(err) {
                console.log(err.message);
            },
        };

        // Get the file name
        var fileName = document.getElementById('itemImageInputId').value
        var fileExtension = fileName.split('.').pop();

        var imageCompressor = new Compressor(file, options);
    };
  
    fileReader.readAsArrayBuffer(file);
}

function pictureManager(){
    console.log(local_selectedItem.image)

    if (local_selectedItem.image == ""){
        var fileInput = document.getElementById('itemImageInputId');
        fileInput.value = '';
        console.log("Picking image")
        document.getElementById('itemImageInputId').click()
        //updateBothQEQuestions()
        return
    }

    if (local_selectedItem.image != ""){
        local_selectedItem.image = ""
        document.querySelector(".itemImageShow").src = ""
        updateBothQEQuestions()
        console.log(local_selectedItem)
        return
    }
    
}

function removePicture(){
    console.log("A")
}

function countItemsInGroup(parentClassName) {
    // Select the parent element
    var parentElement = document.querySelector("." + parentClassName);
    
    // If parent element is found
    if (parentElement) {
        // Select all child elements of the parent
        var childElements = parentElement.children;
        
        // Filter out child elements with class "addItem"
        var filteredChildElements = Array.from(childElements).filter(function(child) {
            return !child.classList.contains("addItem");
        });
        
        // Return the count of filtered child elements
        return filteredChildElements.length;
    } else {
        // Return 0 if parent element is not found
        return 0;
    }
}

// WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE 
// WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE 
// WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE 

function answerTypeIndicator(answer){
    if (typeof answer === 'string') {
        return("Answer ["+answer+"]")

    } else if (Array.isArray(answer)) {

    console.log(answer)
    return("Enumarated Answer &lt;"+answer+"&gt;")

    }
}

function checkIfItHasImage(item){
    if (item.image != ""){
        return "📷"
    }
    return ""
}

function getFlagDescription(value){
    if (value <= -4){
        return "S"
    }

    if (value >= -3 && value < -2){
        return "A"
    }

    if (value >= -1 && value <= 1){
        return "B"
    }

    if (value >= 2 && value < 4){
        return "C"
    }

    if (value >= 4){
        return "F"
    }

    return "B"
}

function getWhichFlag(value){
    
    if (value <= -4){
        return FBlue
    }

    if (value >= -3 && value <= -2){
        return FGreen
    }

    if (value >= -1 && value <= 1){
        return FGrey
    }

    if (value >= 2 && value < 4){
        return FYellow
    }

    if (value >= 4){
        return FRed
    }

    return FGrey
}

function displayFlagRank(group){

    //console.log("flag level", group)

    var html_flag = `
        <div class="miniFlagContainer">
            Flag Rating: 
            <img class="miniFlag" src="`+getWhichFlag(group[0])+`">
            <img class="miniFlag" src="`+getWhichFlag(group[1])+`">
            <img class="miniFlag" src="`+FGrey+`">
        </div>   
    `
    return html_flag
/*

*/
}

function displayForgetfulScore(item){
    var practiceForgetfulScore = item.difficulty + forgetfulScoreAdjacent
    var classicForgetfulScore = item.difficultyClassic + forgetfulScoreAdjacent

    if (practiceForgetfulScore == -1){
        practiceForgetfulScore = 0
    }

    if (classicForgetfulScore == -1){
        classicForgetfulScore = 0
    }


    var toText = practiceForgetfulScore+" "+classicForgetfulScore+" 0"

    return toText
}

function generateForgetfulDetails(item){

    var finalizedGroup = item.group.replace(/ /g, "_");

    var html_forgetfulLabel = document.getElementById("forgetful"+finalizedGroup)
    var html_flagRankIndicator = document.getElementById("flagRank"+finalizedGroup)
    var html_gameModeFlagId = document.getElementById("gameModeFlagId")

    // update the forgetful things
    if (local_forgetfulFlagScore[finalizedGroup] == null){
        local_forgetfulFlagScore[finalizedGroup] = [0,0,0]
        local_bestFlagGroup[finalizedGroup] = [-99,-99,0]
    }

    // add difficulty score
    local_forgetfulFlagScore[finalizedGroup][0] = (local_forgetfulFlagScore[finalizedGroup][0] + item.difficulty) + forgetfulScoreAdjacent
    local_forgetfulFlagScore[finalizedGroup][1] = (local_forgetfulFlagScore[finalizedGroup][1] + item.difficultyClassic) + forgetfulScoreAdjacent


    // getTheWorstFlag
    if (item.difficulty > local_bestFlagGroup[finalizedGroup][0]){
        local_bestFlagGroup[finalizedGroup][0] = item.difficulty
    }
    if (item.difficultyClassic > local_bestFlagGroup[finalizedGroup][1]){
        local_bestFlagGroup[finalizedGroup][1] = item.difficultyClassic
    }

    // getWorstGameModeFlag
    if (item.difficulty > local_gameModeFlags[0]){
        local_gameModeFlags[0] = item.difficulty
    }
    if (item.difficultyClassic > local_gameModeFlags[1]){
        local_gameModeFlags[1] = item.difficultyClassic
    }

    var toText = local_forgetfulFlagScore[finalizedGroup].join(' ');

    html_forgetfulLabel.innerHTML = "Forgetful Score: "+toText
    html_flagRankIndicator.innerHTML = displayFlagRank(local_bestFlagGroup[finalizedGroup])
    html_gameModeFlagId.innerHTML = `Total Flag:
        <img class="miniFlag" src="`+getWhichFlag(local_gameModeFlags[0])+`">
        <img class="miniFlag" src="`+getWhichFlag(local_gameModeFlags[1])+`">
        <img class="miniFlag" src="`+FGrey+`">
    `

    //console.log("ASASA",local_forgetfulFlagScore, local_bestFlagGroup, local_gameModeFlags)                    
}

function displayEnumarationAns(enumarationItems){
    var html_enumItemsContainers = document.querySelector(".enumItemsContainer")
    html_enumItemsContainers.innerHTML = ""

    for (var i in enumarationItems){
        var enumarationitem = enumarationItems[i]

        html_enumItemsContainers.innerHTML +=`
        <div class="enumItem" id="enumItemId">
            <div class="flexContainer">
                <div class="flexItem">
                    <input placeholder="Type an Answer!" type="text" class="enumAnswer" id="enumAnswerId_`+i+`" value="`+enumarationitem+`" onchange="updateEnumarationAns(`+i+`)">
                </div>
                <div class="flexItem">
                    <div class="enumItemDelete" onclick="deleteEnumerationAns(`+i+`)">
                        Delete
                    </div>
                </div>
            </div>
        </div>
        `
    }
}

function updateEnumarationAns(index){
    var html_enumAnswerContent = document.getElementById("enumAnswerId_"+index)
    local_EnumarationItem[index] = html_enumAnswerContent.value
    displayEnumarationAns(local_EnumarationItem)
    updateBothQEQuestions()
}

function updateBothQEQuestions(){
    console.log("The questionTypeVal", local_atQuestionType)
    console.log("S The value is ",local_selectedItem.answer)

    if (local_selectedItem.image == ""){
        html_itemAnswerId.setAttribute('maxlength', 64)        
        html_questionId.setAttribute('maxlength', 255);
        html_question.value = html_question.value.substring(0, 255)
        html_answer.value = html_answer.value.substring(0, 64)
        
        console.log("Changed 255")
    }

    if (local_selectedItem.image != ""){
        html_itemAnswerId.setAttribute('maxlength', 25)
        html_questionId.setAttribute('maxlength', 64);
        html_question.value = html_question.value.substring(0, 64)
        html_answer.value = html_answer.value.substring(0, 25)
        console.log("Changed 64")
    }

    // question Type
    if (local_atQuestionType == 0){
        html_enumQuestion.value = html_question.value
        html_enumGroup.value = html_group.value
        local_EnumarationItem[0] = html_answer.value
        displayEnumarationAns(local_EnumarationItem)
        console.log("Q The value is ",local_EnumarationItem[0])
    } 

    // if enumaration Type
    else if(local_atQuestionType == 1){
        html_question.value = html_enumQuestion.value
        html_group.value = html_enumGroup.value
        console.log("The value is ",local_EnumarationItem[0])
        html_answer.value = local_EnumarationItem[0]
    }


}


// Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation 
// Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation 
// Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation // Animation 

function randomNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function floatText(){
    var textContainer = document.getElementById('floatingTextContainerId');
    var numberOfChildren = textContainer.childElementCount;

    if (numberOfChildren < 20){
        var lengthOfLocalReviewer = local_contentOfReviewer.length

        var randomNumber = randomNumbers(-30,90)
        var randomSpeed = randomNumbers(0,10)

        var particle = document.createElement('div');
        particle.className = 'floatingText';

        particle.style.width = "100%"
        particle.style.fontSize = 5+randomSpeed+"vw"
        particle.style.position = "absolute"
        particle.style.bottom = 0
        particle.style.left = randomNumber+"%"
        particle.style.whiteSpace = "nowrap"
        particle.style.color = "#6e6e6e"
        particle.style.filter = "blur(2px)";
        particle.style.userSelect = "none"
        
        if (lengthOfLocalReviewer != 0){
            var randomIndex = randomNumbers(0,lengthOfLocalReviewer-1)
            particle.innerHTML = local_contentOfReviewer[randomIndex]["answer"]    
        } else {
            particle.innerHTML = "ReviTerm"
        }

        anime({
            targets: particle,
            opacity: [0, 1],
            duration: 3000,
            easing: 'easeOutExpo'
        })

        anime({
            targets: particle,
            bottom: ["0%", "110%"],
            duration: 10000 + (1000*randomSpeed),
            easing: 'linear',
            complete: function(anim) {
                textContainer.removeChild(particle); // Remove the particle after animation
            }
        });

        /*
        particle.style.left = (Math.random() * 95) + "%";
        var x = parseFloat(Math.random() * window.innerWidth);
        var y = window.innerHeight - 10; // Start at the bottom of the screen
        var speed = Math.random() * 2 + 1; // Random speed between 1 and 3
        var opacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        var size = Math.random() * 20 + 10; // Random size between 10 and 30
        */

        // add to text
        textContainer.appendChild(particle);
    }    
}


function slideText(){
    var textContainer = document.getElementById('floatingTextContainerId');
    var numberOfChildren = textContainer.childElementCount;

    if (numberOfChildren < 20){
        var lengthOfLocalReviewer = local_contentOfReviewer.length

        var randomNumber = randomNumbers(-30,90)
        var randomSpeed = randomNumbers(0,10)

        var direction = [
            ["-30%", "110%"],
            ["110%", "-30%"]
        ]

        var particle = document.createElement('div');
        particle.className = 'floatingText';

        particle.style.width = "100%"
        particle.style.fontSize = 5+randomSpeed+"vw"
        particle.style.position = "absolute"
        particle.style.top = randomNumber+"%"
        particle.style.whiteSpace = "nowrap"
        particle.style.color = "#6e6e6e"
        particle.style.filter = "blur(2px)";
        particle.style.userSelect = "none"
        
        if (lengthOfLocalReviewer != 0){
            var randomIndex = randomNumbers(0,lengthOfLocalReviewer-1)
            particle.innerHTML = local_contentOfReviewer[randomIndex]["answer"]    
        } else {
            particle.innerHTML = "ReviTerm"
        }

        anime({
            targets: particle,
            opacity: [0, 1],
            duration: 3000,
            easing: 'easeOutExpo'
        })

        anime({
            targets: particle,
            left: direction[randomNumbers(0,1)],
            duration: 7000 + (1000*randomSpeed),
            easing: 'linear',
            complete: function(anim) {
                anime({
                    targets: particle,
                    opacity: [1, 0],
                    duration: 1000,
                    easing: 'easeOutExpo',
                    complete: function(anim){
                        textContainer.removeChild(particle); // Remove the particle after animation
                    }
                })
                
            }
        });

        /*
        particle.style.left = (Math.random() * 95) + "%";
        var x = parseFloat(Math.random() * window.innerWidth);
        var y = window.innerHeight - 10; // Start at the bottom of the screen
        var speed = Math.random() * 2 + 1; // Random speed between 1 and 3
        var opacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        var size = Math.random() * 20 + 10; // Random size between 10 and 30
        */

        // add to text
        textContainer.appendChild(particle);
    }    
}
setInterval(slideText, 700)

// Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items 
// Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items 
// Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items // Display Items 

function displayItems(){
    // then add
    localforage.getItem(reviewerDatabaseName, function (err, value) {
        localforage.setItem("selectedGroupExclusion", []);

        if (value != null) {
            //console.log("Sorted value by group:", value)
            //console.log("length of value THing", value.length)

            // clear first
            var html_listOfItems = document.querySelector(".listOfItems")
            html_listOfItems.innerHTML = ""   
            
            var totalGroups = [...new Set(local_groupList)]; //without the duplicates
            totalGroups = totalGroups.sort()
            
            console.log("totalGroups:", totalGroups)

            // display empty message if empty
            if (totalGroups.length == 0){
                html_listOfItems.innerHTML += `
                    <div class="emptyItemMessage" id="emptyItemMessageId">
                        Woaaah soo empty! (   ŏ⁠﹏⁠ŏ⁠) <br/>
                        Press the [ Add Item ] to add new Items!
                    </div>
                `      
            }

            // this is unoptimized but gets the job done
            for (var i in totalGroups){
                var replacedSpacedWith_ = totalGroups[i].replace(/ /g, "_");

                html_listOfItems.innerHTML += `
                <div class="groupSection`+replacedSpacedWith_+`">
                    <div class="groupHeaderFlexContainer">
                        <div class="groupHeaderHideButton" id="groupHideButtonId`+replacedSpacedWith_+`" onclick="showOrHideGroup('`+replacedSpacedWith_+`')">^</div>
                        <div class="groupHeaderFlexItemTitle">
                            <div class="groupHeader">
                                `+totalGroups[i]+`
                            </div>
                        </div>
                    </div>

                    <div class="groupDetailsContainer">
                        <div class="flexContainer">
                            <div class="flexItem">
                                <div id="forgetful`+replacedSpacedWith_+`">
                                    Forgetful Score: #
                                </div>
                            </div>
                            <div class="flexItem">
                                <div id="flagRank`+replacedSpacedWith_+`">
                                    Best Flag: 
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <div class="groupSectionItmShowClass`+replacedSpacedWith_+`" id="groupSectionItmShowId`+replacedSpacedWith_+`"></div>
                </div>
                `

                var html_groupSectionItmShow = document.querySelector(".groupSectionItmShowClass"+replacedSpacedWith_)

                if (local_whichGroupsAreHidden.includes(replacedSpacedWith_)){
                    removeHiddenGroup(local_whichGroupsAreHidden, replacedSpacedWith_)
                    showOrHideGroup(replacedSpacedWith_) // restore the hidden option?
                }

                // hides the list in the first run
                if (local_firstRun){
                    showOrHideGroup(replacedSpacedWith_) 
                }

                // so for each items (that is related to the group)
                for (var j in value){

                    // now display the only related item to the group
                    if (value[j].group == totalGroups[i]) {

                        html_groupSectionItmShow.innerHTML += `
                        <div class="itemNo`+value[j].id+`">
                            <div class="miniFlagFlexItem">
                                <div class="miniFlagContainer"></div>
                                <div class="miniFlagContainer itemImageNo`+value[j].id+`" style="padding-right: 1vw;">
                                `+checkIfItHasImage(value[j])+`
                                </div>
                            </div>            

                            <div class="itemBox" onclick="showEditor(`+value[j].id+`,'`+value[j].group+`')">                    
                                <div class="textInItemBox"> 
                                    <pre class="itemQuestionNo`+value[j].id+`">`+value[j].question+`</pre>
                                </div>                                
                                <div class="itemAnswerText itemAnswerNo`+value[j].id+`">`+answerTypeIndicator(value[j].answer)+`</div>
                                <div class="miniFlagPerItemContainer">  
                                    <div class="miniFlagFlexCont">
                                        <div class="miniFlagFlexItem">
                                            <div class="itemForgetfulScore">`+displayForgetfulScore(value[j])+`</div>
                                        </div>
                                        <div class="miniFlagFlexItem">
                                            <div class="miniFlagContainer">
                                                <img class="miniFlag" src="`+getWhichFlag(value[j].difficulty)+`">
                                                <img class="miniFlag" src="`+getWhichFlag(value[j].difficultyClassic)+`">
                                                <img class="miniFlag" src="`+FGrey+`">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        </div>                           
                        `
                        generateForgetfulDetails(value[j])
                        //console.log(j)
                        // <button onclick="removeItem(`+j+`)">Remove</button>
                    }    
                }

                console.log("ForgetfulScore", local_forgetfulFlagScore)
                

                html_groupSectionItmShow.innerHTML += `
                    <div class="addItem addItem`+replacedSpacedWith_+`" onclick="showEditor(`+-1+`,'`+totalGroups[i]+`')">
                        +
                    </div>
                `
            }

            local_firstRun = false

            console.log("Completed!")
        } else {
            // display empty message if empty
            var html_listOfItems = document.querySelector(".listOfItems")
            html_listOfItems.innerHTML += `
                <div class="emptyItemMessage" id="emptyItemMessageId">
                    Woaaah soo empty! (   ŏ⁠﹏⁠ŏ⁠) <br/>
                    Press the [ Add Item ] to add new Items!
                </div>
            `               
        }
    });
}

function displayAddedItem(newItem){

    var finalizedGroup = newItem.group.replace(/ /g, "_");

    var html_groupSectionItmShow = document.querySelector(".groupSectionItmShowClass"+finalizedGroup)
    var html_groupSectionAddButton = document.querySelector(".addItem"+finalizedGroup)

    if (local_groupList.length > 0){
        if (document.getElementById("emptyItemMessageId") != null){
            document.getElementById("emptyItemMessageId").style.display = "none"
        }
    }

    if (html_groupSectionAddButton != null) {
        html_groupSectionAddButton.remove()
    } else {
        var html_listOfItems = document.querySelector(".listOfItems")
        html_listOfItems.innerHTML += `
        <div class="groupSection`+finalizedGroup+`">
            <div class="groupHeaderFlexContainer">
                <div class="groupHeaderHideButton" id="groupHideButtonId`+finalizedGroup+`" onclick="showOrHideGroup('`+finalizedGroup+`')">^</div>
                <div class="groupHeaderFlexItemTitle">
                    <div class="groupHeader">
                        `+newItem.group+`
                    </div>
                </div>
            </div>

            <div class="groupDetailsContainer">
                <div class="flexContainer">
                    <div class="flexItem">
                        <div id="forgetful`+finalizedGroup+`">
                            Forgetful Score: #
                        </div>
                    </div>
                    <div class="flexItem">
                        <div id="flagRank`+finalizedGroup+`">
                            Best Flag: 
                        </div>
                    </div>
                </div>
            </div>
        
            <div class="groupSectionItmShowClass`+finalizedGroup+`" id="groupSectionItmShowId`+finalizedGroup+`"></div>
        </div>
        `
        
        html_groupSectionItmShow = document.querySelector(".groupSectionItmShowClass"+finalizedGroup)
        html_groupSectionAddButton = document.querySelector(".addItem"+finalizedGroup)
    }

    // now display the only related item to the group
    html_groupSectionItmShow.innerHTML += `
    <div class="itemNo`+newItem.id+`">
        <div class="miniFlagFlexItem">
            <div class="miniFlagContainer"></div>
            <div class="miniFlagContainer itemImageNo`+newItem.id+`" style="padding-right: 1vw;">
            `+checkIfItHasImage(newItem)+`
            </div>
        </div>            

        <div class="itemBox" onclick="showEditor(`+newItem.id+`,'`+newItem.group+`')">                    
            <div class="textInItemBox"> 
                <pre class="itemQuestionNo`+newItem.id+`">`+newItem.question+`</pre>
            </div>                                
            <div class="itemAnswerText itemAnswerNo`+newItem.id+`">`+answerTypeIndicator(newItem.answer)+`</div>
            <div class="miniFlagPerItemContainer">  
                <div class="miniFlagFlexCont">
                    <div class="miniFlagFlexItem">
                        <div class="itemForgetfulScore">`+displayForgetfulScore(newItem)+`</div>
                    </div>
                    <div class="miniFlagFlexItem">
                        <div class="miniFlagContainer">
                            <img class="miniFlag" src="`+getWhichFlag(newItem.difficulty)+`">
                            <img class="miniFlag" src="`+getWhichFlag(newItem.difficultyClassic)+`">
                            <img class="miniFlag" src="`+FGrey+`">
                        </div>
                    </div>
                </div>
            </div>
        </div> 
    </div>                           
    `

    html_groupSectionItmShow.innerHTML += `
    <div class="addItem addItem`+finalizedGroup+`" onclick="showEditor(`+-1+`,'`+newItem.group+`')">
        +
    </div>
    `

    generateForgetfulDetails(newItem)

    console.log(newItem)
}

function removeItemFromDisplay(item){
    console.log("deletus", item.id, item.group, "itemQuestionNo"+item.id)
    
    var html_itemNo = document.querySelector(".itemNo"+item.id)
    html_itemNo.remove()

    var finalizedGroupId = item.group.replace(/ /g, "_");
    var forgetFulScoreGroup = local_forgetfulFlagScore[finalizedGroupId]

    console.log("aasda",local_forgetfulFlagScore)

    // update forgetfulScore
    local_forgetfulFlagScore[item.group] = [
        forgetFulScoreGroup[0] - (item.difficulty +5),
        forgetFulScoreGroup[1] - (item.difficultyClassic +5),
        forgetFulScoreGroup[2] - 5
    ]

    console.log("LOCAL GROUP LIST LEGNT", local_groupList.length, local_groupList)
    console.log("New forgetful score", local_forgetfulFlagScore)
}

function displayUpdatedItem(updatedItem, changedGroup){
    console.log("HEY LISTEN YOU PICE")

    if (changedGroup != false){
        var html_updatedQuestion = document.querySelector(".itemQuestionNo"+updatedItem.id)
        var html_updatedAnswer = document.querySelector(".itemAnswerNo"+updatedItem.id)
        var html_updatedImage = document.querySelector(".itemImageNo"+updatedItem.id)
    
        html_updatedImage.innerHTML = checkIfItHasImage(updatedItem)
        html_updatedQuestion.innerHTML = updatedItem.question
        html_updatedAnswer.innerHTML = answerTypeIndicator(updatedItem.answer)
    } else {
        
        console.log("GROUP",html_groupSectionItmShow,"Not existing!")

    }

   

    console.log("The id of updated", updatedItem.id)
}

// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 
// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 
// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 


// kunin muna yung "selectedReviewer"
function initialization(){

    localforage.getItem("selectedReviewer", function (err, value) {
        reviewerDatabaseName = revieweraddOn+value
        console.log(reviewerDatabaseName)
        setTimeout(displayItems, 25);

        localforage.getItem(reviewerDatabaseName, function (err, value) {

            // if empty 
            if (value == null){
                value = []
            } else {
                // do update here?
                updateContentsOfReviewer("difficultyClassic", 0)
            }
            
            console.log("Content of ",reviewerDatabaseName," are ",value)
            var reviewerHeaderName = reviewerDatabaseName.replace(revieweraddOn, "");
            local_contentOfReviewer = value

            document.querySelector(".reviewerName").innerHTML += reviewerHeaderName
            document.querySelector(".totalItems").innerHTML = value["amountOfItems"]

            replaceContentOfReviewer("image", undefined, "")
        })
        
        //localforage.removeItem(reviewerDatabaseName+"_Details")
        // to set up the details of the reviewer
        localforage.getItem(reviewerDatabaseName+"_Details", function (err, value) {
            // if its empty, then create a new "save file"
            if (value == null){

                var reviewerDetails = {
                    idCounter: 0,
                    amountOfItems: 0,
                    groupList: []
                }
                

                localforage.setItem(reviewerDatabaseName+"_Details", reviewerDetails)
                console.log(reviewerDatabaseName+"_Details is created!")

                var html_totalItems = document.querySelector(".totalItems")
                html_totalItems.innerHTML = 0


                // although check if the reviewer was imported


            // if not then just load
            } else {

                console.log(reviewerDatabaseName+"_Details contains", value)

                // save to local values
                local_idCounter = value["idCounter"]
                local_amountOfItems = value["amountOfItems"]
                local_groupList = value["groupList"]

                var html_totalItems = document.querySelector(".totalItems")
                html_totalItems.innerHTML = value["amountOfItems"]

                //console.log(local_idCounter)
            }
        })

    })
}

function updateReviewerDetails(updId, updAOI, updGL){
    localforage.getItem(reviewerDatabaseName+"_Details", function (err, value) {

        var html_totalItems = document.querySelector(".totalItems")
        html_totalItems.innerHTML = updAOI

        value.idCounter = updId
        value.amountOfItems = updAOI
        value.groupList = updGL

        localforage.setItem(reviewerDatabaseName+"_Details", value)
        console.log(reviewerDatabaseName+"_Details is updated!")
    
    })
}

function addItem(){

    console.log("LOCAL QUESTION TYPE "+local_atQuestionType)

    var group = document.querySelector(".itemGroup").value
    var question = document.querySelector(".itemQuestion").value
    var answer = document.querySelector(".itemAnswer").value
    var image = local_selectedItem.image

    // remove whiteSpaces
    local_EnumarationItem = trimStringArray(local_EnumarationItem)

    var enumAnswer = local_EnumarationItem
    var enumInOrder = html_enumInOrder.checked

    local_forgetfulFlagScore = {} // this is per group
    local_bestFlagGroup = {}    // this is per group
    local_gameModeFlags = [-99,-99,0]    // contains the flag/rank of gameModes

    // the code below code be optimized
    // if going to add a questionAndAnswer
    if (local_atQuestionType == 0){
        // if the local_selectedItem is -1, it means just to add a new non existing..
        if (local_selectedItem.id == -1){

            // other things
            var id = local_idCounter
            var enumaration = false
            var difficulty = 0
            var difficultyClassic = 0
            var disabled = false

            // check first if valid text
            if (group == "" || question == "" || answer == ""){
                alert("Please enter something!")
                return;
            }  

            // trim the right/left spaces
            group = group.trimRight()
            question = question.trimRight()
            answer = answer.trimRight()

            var item = {id, enumaration, group, question, answer, image, difficulty, difficultyClassic, disabled}
            console.log(item)

            // add new item
            localforage.getItem(reviewerDatabaseName, function (err, value) {

                // check first if the database is empty
                if (value == null){
                    value = []
                }

                // for testing purposes
                //for (var i=0; i<255; i++){
                var newValue = value
                newValue.push(item)

                localforage.setItem(reviewerDatabaseName, newValue)
                console.log(newValue)

                // update reviewerDetails
                local_idCounter += 1
                local_amountOfItems += 1
                local_groupList.push(group)
                updateReviewerDetails(local_idCounter, local_amountOfItems, local_groupList)
                //}
 
                //document.querySelector(".userValue").value = ""
                hideEditor()
                //setTimeout(displayItems, 25);
                //displayItems()

                /**/ 
                displayAddedItem(item)

                local_forgetfulFlagScore = {} // this is per group
                local_bestFlagGroup = {}    // this is per group
                local_gameModeFlags = [-99,-99,0]    // contains the flag/rank of gameModes

                // update the forgetful details
                for (var i in value){  
                    generateForgetfulDetails(value[i]);
                    console.log("Added", value[i])
                }

                local_contentOfReviewer = value
                /**/


            }); 
        } else {
        // if the local_selectedItem is not -1(which means the item is existing)
        // this is the update part :)

            console.log("I see update :)")
            // other things
            var id = local_selectedItem.id
            var enumaration = false
            var difficulty = local_selectedItem.difficulty
            var difficultyClassic = local_selectedItem.difficultyClassic
            var disabled = local_selectedItem.disabled
            var changedGroup = false

            // check first if valid text
            if (group == "" || question == "" || answer == ""){
                alert("Please enter something!")
                return;
            }  

            // trim the right/left spaces
            group = group.trimRight()
            question = question.trimRight()
            answer = answer.trimRight()

            var updatedItem = {id, enumaration, group, question, answer, image, difficulty, difficultyClassic, disabled}

            console.log("["+group+"]")

            // check if they changed the group
            if (local_selectedItem.group != group){
                changedGroup = true
                console.log("changed group!")
            }

            // add new item
            localforage.getItem(reviewerDatabaseName, function (err, value) {
                var selectedITBU_Index = findItemIndexById(value, id) // selected Item To Be Updated
                value[selectedITBU_Index] = updatedItem
                var newValue = value

                // if changed Group then
                if (changedGroup){
                    local_groupList.push(group)
                    var indexToRemove = local_groupList.indexOf(local_selectedItem.group);
                    if (indexToRemove !== -1) {
                        local_groupList.splice(indexToRemove, 1);
                    }
                    updateReviewerDetails(local_idCounter, local_amountOfItems, local_groupList)
                }

                localforage.setItem(reviewerDatabaseName, newValue)
                hideEditor()
                //displayUpdatedItem(updatedItem)
                setTimeout(displayItems, 25);

                local_contentOfReviewer = value
            }); 
        }
    } else {
        // if going to add an enumaration question type
        if (local_selectedItem.id == -1){

            // other things
            var id = local_idCounter
            var enumaration = true
            var difficulty = 0
            var difficultyClassic = 0
            var disabled = false

            // trim left or right and remove ""
            enumAnswer = trimStringArray(enumAnswer)
            displayEnumarationAns(trimStringArray(enumAnswer))

            // check for duplicates
            if (checkDuplicates(enumAnswer)){
                alert("Please make sure the answers aren't duplicated!")
                return
            }

            // check first if valid text
            if (group == "" || question == "" || enumAnswer.length<=0){
                alert("Please enter the missing fields")
                return;
            }  

            // trim the right/left spaces
            group = group.trimRight()
            question = question.trimRight()
            //answer = answer.trimRight()

            // remove the image in enumaration
            image = ""

            var item = {id, enumaration, group, question, answer: enumAnswer, image, difficulty, difficultyClassic, disabled, enumInOrder}
            console.log(item)

            /**/ 
            // add new item
            localforage.getItem(reviewerDatabaseName, function (err, value) {

                // check first if the database is empty
                if (value == null){
                    value = []
                }

                var newValue = value
                newValue.push(item)

                localforage.setItem(reviewerDatabaseName, newValue)
                console.log(newValue)


                // update reviewerDetails
                local_idCounter += 1
                local_amountOfItems += 1
                local_groupList.push(group)
                updateReviewerDetails(local_idCounter, local_amountOfItems, local_groupList)

                //document.querySelector(".userValue").value = ""
                hideEditor()
                //setTimeout(displayItems, 25);
                /**/
                displayAddedItem(item)

                local_forgetfulFlagScore = {} // this is per group
                local_bestFlagGroup = {}    // this is per group
                local_gameModeFlags = [-99,-99,0]    // contains the flag/rank of gameModes

                // update the forgetful details
                for (var i in value){  
                    generateForgetfulDetails(value[i]);
                    console.log("Added", value[i])
                }

                local_contentOfReviewer = value
                /**/
            }); 
             /**/
        } else {
        // if the local_selectedItem is not -1(which means the item is existing)
        // this is the update part for enumeration :)

            console.log("I see update :)")
            // other things
            var id = local_selectedItem.id
            var enumaration = true
            var difficulty = local_selectedItem.difficulty
            var difficultyClassic = local_selectedItem.difficultyClassic
            var disabled = local_selectedItem.disabled
            var changedGroup = false

            // trim left or right and remove ""
            enumAnswer = trimStringArray(enumAnswer)
            displayEnumarationAns(trimStringArray(enumAnswer))

            // check for duplicates
            if (checkDuplicates(enumAnswer)){
                alert("Please make sure the answers aren't duplicated!")
                return
            }

            // check first if valid text
            if (group == "" || question == "" || enumAnswer.length<=0){
                alert("Please enter something!")
                return;
            }  

            // trim the right/left spaces
            group = group.trimRight()
            question = question.trimRight()

            var updatedItem = {id, enumaration, group, question, answer: enumAnswer, image, difficulty, difficultyClassic, disabled, enumInOrder}
            console.log("["+group+"]")
            console.log(updatedItem)

            // check if they changed the group
            if (local_selectedItem.group != group){
                changedGroup = true
                console.log("changed group!")
            }

            /**/ 
            // update item
            localforage.getItem(reviewerDatabaseName, function (err, value) {
                var selectedITBU_Index = findItemIndexById(value, id) // selected Item To Be Updated
                value[selectedITBU_Index] = updatedItem
                var newValue = value

                // if changed Group then
                if (changedGroup){
                    local_groupList.push(group)
                    var indexToRemove = local_groupList.indexOf(local_selectedItem.group);
                    if (indexToRemove !== -1) {
                        local_groupList.splice(indexToRemove, 1);
                    }
                    updateReviewerDetails(local_idCounter, local_amountOfItems, local_groupList)
                }

                localforage.setItem(reviewerDatabaseName, newValue)
                hideEditor()
                //displayUpdatedItem(updatedItem, changedGroup)
                setTimeout(displayItems, 25);

                local_contentOfReviewer = value
            }); 
            /**/
        }
    }
}

function removeItem(){

    if (local_selectedItem.id == -1){
        console.log("Nothing to be deleted")
    }

    // remove item
    localforage.getItem(reviewerDatabaseName, function (err, value) {

        // get the item to be removed
        var selectedITBR_Index = findItemIndexById(value, local_selectedItem.id) // selected Item To Be Removed
        
        // get the group first
        var groupToBeRemoved = value[selectedITBR_Index]["group"]
        var groupWith_ForHtml = value[selectedITBR_Index]["group"].replace(/ /g, "_");

        // with the deleted
        var newValue = value
        newValue.splice(selectedITBR_Index, 1);
        
        // update it to the database
        localforage.setItem(reviewerDatabaseName, newValue)
        console.log(newValue)

        // update reviewerDetails
        local_amountOfItems -= 1
        
        // this could've been simplier aarghhh (update group list)
        var indexToRemove = local_groupList.indexOf(groupToBeRemoved);
        if (indexToRemove != -1) {
            local_groupList.splice(indexToRemove, 1);
        }

        // remove first from item
        removeItemFromDisplay(local_selectedItem)

        local_forgetfulFlagScore = {} // this is per group
        local_bestFlagGroup = {}    // this is per group
        local_gameModeFlags = [-99,-99,0]    // contains the flag/rank of gameModes
        
        updateReviewerDetails(local_idCounter, local_amountOfItems, local_groupList)

        // uhh, add each item forgetful details
        for (var i in value){  
            generateForgetfulDetails(value[i]);
            console.log("DEletefusfdfdhsv", value[i])
        }

        //and remove another display if the group is empty
        var indexToRemove = local_groupList.indexOf(groupToBeRemoved);
        if (indexToRemove == -1) {
            console.log("AHAHAHAHAHAHHAHAHAHAAHAH -cough-")
            document.querySelector(".groupSection"+groupWith_ForHtml).remove()
        }

        // display empty message if empty
        if (local_groupList.length == 0){
            var html_listOfItems = document.querySelector(".listOfItems")
            
            html_listOfItems.innerHTML = `
                <div class="emptyItemMessage" id="emptyItemMessageId">
                    Woaaah soo empty! (   ŏ⁠﹏⁠ŏ⁠) <br/>
                    Press the [ Add Item ] to add new Items!
                </div>
            `      
        }

        local_contentOfReviewer = value
        hideEditor()
    }); 
}

function excludeGroup(groupName){
    // works like checkbox thing

    // if it exists in excluded group (remove)
    if (local_selectedGroupExclusion.includes(groupName)) {
        // remove the string from the exclusion (gosh i wish this worked like python tho)
        local_selectedGroupExclusion = local_selectedGroupExclusion.filter(item => item !== groupName);
    } else {
        local_selectedGroupExclusion.push(groupName)
    }

    // update to database
    localforage.setItem("selectedGroupExclusion", local_selectedGroupExclusion)

    console.log("Exclusion List: ", local_selectedGroupExclusion)

}

function deleteEnumerationAns(index){
    local_EnumarationItem.splice(index, 1);
    displayEnumarationAns(local_EnumarationItem)
    updateBothQEQuestions()
}

function addEnumaratorAns(){
    local_EnumarationItem.push("")
    displayEnumarationAns(local_EnumarationItem)
}

function replaceContentOfReviewer(key, toReplace, value){
    localforage.getItem(reviewerDatabaseName, function (err, content) {

        for (var i in content){
            if (content[i][key] == toReplace){
                console.log(content[i][key])
                content[i][key] = value
                console.log(content[i][key])
                console.log("replaced")
            }
        }
        
        console.log(content)
        localforage.setItem(reviewerDatabaseName, content)
    })
}

function updateContentsOfReviewer(key, value){
    localforage.getItem(reviewerDatabaseName, function (err, content) {

        for (var i in content){
            if (content[i][key] == null){
                console.log("Added!",key)
                content[i][key] = value
            }
        }

        console.log("updated!")
        localforage.setItem(reviewerDatabaseName, content)
    })
}

// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS
// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS
// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS

function showEditor(index = -1, selectedGroup){
    // if selected an existing item
    if (index != -1){
        localforage.getItem(reviewerDatabaseName, function (err, item) {
            
            local_selectedItem = getItemById(item, index)

            console.log(local_selectedItem)

            // enumaration mode
            if (local_selectedItem.enumaration){
                html_enumGroup.value = local_selectedItem.group
                html_enumQuestion.value = local_selectedItem.question
                html_enumInOrder.checked = local_selectedItem.enumInOrder
                local_EnumarationItem = local_selectedItem.answer

                local_atQuestionType = 1
                selectQType(1)
                displayEnumarationAns(local_EnumarationItem)

                html_difficulty.forEach(function(element) {
                    element.innerHTML = `
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficulty)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficultyClassic)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">            
                    `
                });

            //update mode
            } else {
            // Q&A mode
                
                // assign it to the html groupings
                html_group.value = local_selectedItem.group
                html_question.value = local_selectedItem.question
                html_answer.value = local_selectedItem.answer
                html_image.value = local_selectedItem.image                
                console.log(local_selectedItem)

                if (local_selectedItem.image != ""){
                    var blobUrl = URL.createObjectURL(local_selectedItem.image);
                    document.querySelector(".itemImageShow").src = blobUrl
                }

                updateBothQEQuestions()
                
                html_difficulty.forEach(function(element) {
                    element.innerHTML = `
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficulty)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficultyClassic)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">            
                    `
                });
            }

            html_addEnumButton.value = "Update"
            html_addButton.value = "Update"
        })
    
    // if not
    } else {
        // add mode

        local_selectedItem = {
            id: -1,
            enumaration: false,
            group: selectedGroup,
            question: "",
            answer: "",
            image: "",
            difficulty: 0,
            disabled: false
        }

        html_group.value = local_selectedItem.group
        html_question.value = local_selectedItem.question
        html_answer.value = local_selectedItem.answer
        html_image.value = local_selectedItem.image
        html_addButton.value = "Add"
        html_addEnumButton.value = "Add"
        html_difficulty.forEach(function(element) {
            element.innerHTML = `
                <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">
                <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">
                <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">            
            `
        });

        console.log(local_selectedItem)
        updateBothQEQuestions()
        
    }

    html_editBox.style.display = "block";
    html_overlay.style.display = "block";

    displayEnumarationAns(local_EnumarationItem)
    selectQType(0)
    console.log("Hello World!", index, selectedGroup)
    
}

function hideEditor(){
    html_enumQuestion.value = ""
    html_enumGroup.value = ""
    local_EnumarationItem = []

    html_editBox.style.display = "none";
    html_overlay.style.display = "none";

    document.querySelector(".itemImageShow").src = ""
    
    local_atQuestionType = 0
    selectQType(0)
}

function showOptionsBeforeReviTerm(){
    localforage.getItem("selectedReviewer", function (err, reviewerName) {

        var totalGroups = [...new Set(local_groupList)]; //without the duplicates

        var html_overlay = document.getElementById("overlay") 
        var html_initOptionsDIV = document.getElementById("initOptionsDIVId") 

        var html_groupListContainer = document.querySelector(".groupListContainer")
        var html_initOptionsReviewerName = document.querySelector(".initOptionsReviewerName")
        var html_initOptionsTotalItems = document.querySelector(".initOptionsTotalItems")

        html_initOptionsDIV.style.display = "block";
        html_overlay.style.display = "block";            
        
        html_groupListContainer.innerHTML = ""

        // lazyyy
        var html_totalItems = document.querySelector(".totalItems").innerHTML
        var html_reviewerName = document.querySelector(".reviewerName").innerHTML

        html_initOptionsReviewerName.innerHTML = html_reviewerName
        html_initOptionsTotalItems.innerHTML = html_totalItems

        gameOption = {
            mode: "Practice",
            music: true,
            easyMode: false,
        }

        switchGameModeMenu(0)

        // print the html :)
        for (var i in totalGroups){
            var replacedSpacedWith_ = totalGroups[i].replace(/ /g, "_");

            html_groupListContainer.innerHTML += `
				<div class="groupListItem">				
					<div class="groupListItemCheckBox">
						<input type="checkbox" class="itemDisabled" onclick='excludeGroup("`+replacedSpacedWith_+`")' checked>
					</div>
					`+replacedSpacedWith_+`
				</div>
            `
        }
        
        //console.log(totalGroups)


        //localforage.getItem("reviewerContent_"+reviewerName+"_Details", function (err, value) {
        //})
    })
}

function hideOptionsBeforeReviTerm(){
    html_initOptionsDIV.style.display = "none";
    html_overlay.style.display = "none";   
    
    switchGameModeMenu(0)
}

function selectQType(type){
    var COLOR_white = "#ffffff"
    var COLOR_gray = "#bbbbbb"

    local_atQuestionType = type

    // show questionAndAnswer
    if (type == 0){
        html_enumContainer.style.display = "none"
        html_EnumB.style.backgroundColor = COLOR_gray
        html_qAAContainer.style.display = "block"
        html_QAAB.style.backgroundColor = COLOR_white
    } else {
        html_qAAContainer.style.display = "none"
        html_QAAB.style.backgroundColor = COLOR_gray
        html_enumContainer.style.display = "block"
        html_EnumB.style.backgroundColor = COLOR_white       
    }

    console.log(local_atQuestionType)
    updateBothQEQuestions()
}

function showOrHideGroup(id){
    var buttonContent = document.getElementById("groupHideButtonId"+id)
    var groupSectionItmShow = document.getElementById("groupSectionItmShowId"+id)

    console.log(id)

    if (buttonContent.innerHTML == "^"){
        buttonContent.innerHTML = "v"
        groupSectionItmShow.style.display = "none"
        local_whichGroupsAreHidden.push(id)

    } else if (buttonContent.innerHTML == "v"){
        buttonContent.innerHTML = "^"
        groupSectionItmShow.style.display = "block"
        removeHiddenGroup(local_whichGroupsAreHidden, id)
    }
    
    console.log("UPDATED SHOW HIDE", buttonContent.innerHTML, local_whichGroupsAreHidden)
}

function switchGameModeMenu(mode){
    var COLOR_white = "#ffffff"
    var COLOR_gray = "#bbbbbb"
    var html_initFlagDescription = document.getElementById("initFlagDescription")

    // html_practiceModeContainerId 
    // html_classicModeContainerId 
    // html_practiceModeButtonId 
    // html_classicModeButtonId
    // html_perfectionModeContainerId
    // html_perfectionModeButtonId

    if (mode == 0){

        html_initFlagDescription.innerHTML = `Flag: 
        <img class="normalSizeFlagIL" src="`+getWhichFlag(local_gameModeFlags[0])+`" /><div style="font-size: 3.3vw; display: inline-block;">`+getFlagDescription(local_gameModeFlags[0])+`</div>
        `

        html_practiceModeContainerId.style.display = "block"
        html_practiceModeButtonId.style.backgroundColor = COLOR_white
        html_classicModeContainerId.style.display = "none"
        html_classicModeButtonId.style.backgroundColor = COLOR_gray
        html_perfectionModeContainerId.style.display = "none"
        html_perfectionModeButtonId.style.backgroundColor = COLOR_gray

        gameOption = {
            mode: "Practice",
            music: true,
            easyMode: false,
        }

        


        localforage.setItem("reviTermGameOptions", gameOption)

    } else if (mode == 1) {

        html_initFlagDescription.innerHTML = `Flag: 
        <img class="normalSizeFlagIL" src="`+getWhichFlag(local_gameModeFlags[1])+`" /><div style="font-size: 3.3vw; display: inline-block;">`+getFlagDescription(local_gameModeFlags[1])+`</div>
        `

        html_classicModeContainerId.style.display = "block"
        html_classicModeButtonId.style.backgroundColor = COLOR_white    
        html_practiceModeContainerId.style.display = "none"
        html_practiceModeButtonId.style.backgroundColor = COLOR_gray
        html_perfectionModeContainerId.style.display = "none"
        html_perfectionModeButtonId.style.backgroundColor = COLOR_gray
    
        gameOption = {
            mode: "Classic",
            music: true,
            easyMode: false,
        }

        localforage.setItem("reviTermGameOptions", gameOption)
    } else if (mode == 2){

        html_initFlagDescription.innerHTML = `Flag: 
        <img class="normalSizeFlagIL" src="`+getWhichFlag(local_gameModeFlags[3])+`" /><div style="font-size: 3.3vw; display: inline-block;">`+getFlagDescription(local_gameModeFlags[3])+`</div>
        `
        html_perfectionModeContainerId.style.display = "block"
        html_perfectionModeButtonId.style.backgroundColor = COLOR_white   
        html_practiceModeContainerId.style.display = "none"
        html_practiceModeButtonId.style.backgroundColor = COLOR_gray        
        html_classicModeContainerId.style.display = "none"
        html_classicModeButtonId.style.backgroundColor = COLOR_gray

        gameOption = {
            mode: "Perfection",
            music: true,
            easyMode: false,
        }

        localforage.setItem("reviTermGameOptions", gameOption)
    }

    console.log(mode)
}

function getListOfShowOrHide(){
    //var buttonContent = document.getElementById("groupHideButtonId"+id)
    //var groupSectionItem = document.getElementById("groupSectionItemId"+id)
}

// LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK 
// LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK 
// LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK 

function gotoSelectReviewer(){
    window.location.replace("index.html");
}

function startReviterm(){
    window.location.replace("reviGame.html");
}
//document.querySelector(".startReviterm").addEventListener("click", startReviterm);

initialization()


window.removeItem = removeItem
window.hideEditor = hideEditor
window.gotoSelectReviewer = gotoSelectReviewer
window.showEditor = showEditor
window.showOptionsBeforeReviTerm = showOptionsBeforeReviTerm
window.excludeGroup = excludeGroup
window.selectQType = selectQType
window.addEnumaratorAns = addEnumaratorAns
window.updateEnumarationAns = updateEnumarationAns
window.deleteEnumerationAns = deleteEnumerationAns
window.updateBothQEQuestions = updateBothQEQuestions
window.addItem = addItem
window.showOrHideGroup = showOrHideGroup
window.switchGameModeMenu = switchGameModeMenu
window.pictureManager = pictureManager

document.querySelector(".initOptionsHide").addEventListener("click", hideOptionsBeforeReviTerm);
document.querySelector('.itemImageInput').addEventListener('change', addPicture);
//document.querySelector(".addItemFunc").addEventListener("click", addItem);


