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

var local_forgetfulFlagScore = {}
var local_bestFlagGroup = {}

var local_qType = 0 // 0 Question and Answer | 1 Enumaration
var local_EnumarationItem = []

var local_questionPlaceHolder = ""
var local_groupPlaceHolder = ""
var local_atQuestionType = 0

var local_whichGroupsAreHidden = []

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

// by Ids

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


function getWhichFlag(value){
    
    if (value <= -4){
        return FBlue
    }

    if (value >= -3 && value < -2){
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

    console.log("flag level", group)

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

function generateForgetfulDetails(item){

    var html_forgetfulLabel = document.getElementById("forgetful"+item.group)
    var html_flagRankIndicator = document.getElementById("flagRank"+item.group)

    // update the forgetful things
    if (local_forgetfulFlagScore[item.group] == null){
        local_forgetfulFlagScore[item.group] = [0,0,0]
        local_bestFlagGroup[item.group] = [-99,-99,0]
    }
    
    // add difficulty score
    if (item.difficulty > 0){
        local_forgetfulFlagScore[item.group][0] = local_forgetfulFlagScore[item.group][0] + item.difficulty
    }
    if (item.difficultyClassic > 0){
        local_forgetfulFlagScore[item.group][1] = local_forgetfulFlagScore[item.group][1] + item.difficultyClassic
    }

    // getTheBestFlag
    if (item.difficulty > local_bestFlagGroup[item.group][0]){
        local_bestFlagGroup[item.group][0] = item.difficulty
    }
    if (item.difficultyClassic > local_bestFlagGroup[item.group][1]){
        local_bestFlagGroup[item.group][1] = item.difficultyClassic
    }

    var toText = local_forgetfulFlagScore[item.group].join(' ');

    html_forgetfulLabel.innerHTML = "Forgetful Score: "+toText
    html_flagRankIndicator.innerHTML = displayFlagRank(local_bestFlagGroup[item.group])

    console.log("ASASA",local_forgetfulFlagScore, local_bestFlagGroup)
                        
}

function displayItems(){
    // then add
    localforage.getItem(reviewerDatabaseName, function (err, value) {

        localforage.setItem("selectedGroupExclusion", []);

        if (value != null) {
            // sort by id first
            value = value.sort((a, b) => a.group - b.group);
            console.log(value)
            //console.log("length of value THing", value.length)

            // clear first
            var html_listOfItems = document.querySelector(".listOfItems")
            html_listOfItems.innerHTML = ""   
            
            var totalGroups = [...new Set(local_groupList)]; //without the duplicates
            
            console.log(totalGroups)

            // display empty message if empty
            if (totalGroups.length == 0){
                html_listOfItems.innerHTML += `
                    <div class="emptyItemMessage">
                        Woaaah soo empty! (   ŏ⁠﹏⁠ŏ⁠) <br/>
                        Press the [ Add Item ] to add new Items!
                    </div>
                `      
            }

            // this is unoptimized but gets the job done
            for (var i in totalGroups){
                html_listOfItems.innerHTML += `
                    <div class="groupHeaderFlexContainer">
                        <div class="groupHeaderHideButton" id="groupHideButtonId`+i+`" onclick="showOrHideGroup(`+i+`)">^</div>
                        <div class="groupHeaderFlexItemTitle">
                            <div class="groupHeader">
                                `+totalGroups[i]+`
                            </div>
                        </div>
                    </div>

                    <div class="groupDetailsContainer">
                        <div class="flexContainer">
                            <div class="flexItem">
                                <div id="forgetful`+totalGroups[i]+`">
                                    Forgetful Score: #
                                </div>
                            </div>
                            <div class="flexItem">
                                <div id="flagRank`+totalGroups[i]+`">
                                    Best Flag: 
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <div class="groupSectionClass`+i+`" id="groupSectionId`+i+`"></div>
                `

                var html_groupSection = document.querySelector(".groupSectionClass"+i)

                if ( local_whichGroupsAreHidden.includes(parseInt(i, 10))){
                    removeHiddenGroup(local_whichGroupsAreHidden, parseInt(i, 10))
                    showOrHideGroup(parseInt(i, 10)) // restore the hidden option?
                }

                // so for each items (that is related to the group)
                for (var j in value){

                    // now display the only related item to the group
                    if (value[j].group == totalGroups[i]) {

                        html_groupSection.innerHTML += `
                            <div class="itemBox" onclick="showEditor(`+value[j].id+`,'`+value[j].group+`')">                                
                                <div class="textInItemBox"> 
                                    <pre>`+value[j].question+`</pre>
                                </div>                                
                                <div class="itemAnswerText">`+answerTypeIndicator(value[j].answer)+`</div>
                                <div class="miniFlagPerItemContainer">  
                                    <div class="miniFlagFlexCont">
                                        <div class="miniFlagFlexItem">
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
                        `

                        generateForgetfulDetails(value[j])

                        // <button onclick="removeItem(`+j+`)">Remove</button>
                    }
                    
                
                }

                console.log(local_forgetfulFlagScore)
                

                html_groupSection.innerHTML += `
                    <div class="addItem" onclick="showEditor(`+-1+`,'`+totalGroups[i]+`')">
                        +
                    </div>
                `
            }



        } else {
            // display empty message if empty
            var html_listOfItems = document.querySelector(".listOfItems")
            html_listOfItems.innerHTML += `
                <div class="emptyItemMessage">
                    Woaaah soo empty! (   ŏ⁠﹏⁠ŏ⁠) <br/>
                    Press the [ Add Item ] to add new Items!
                </div>
            `               
        }
    });
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

            document.querySelector(".reviewerName").innerHTML += reviewerHeaderName
            document.querySelector(".totalItems").innerHTML = value["amountOfItems"]
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
    var image = document.querySelector(".itemImage").value

    // remove whiteSpaces
    local_EnumarationItem = trimStringArray(local_EnumarationItem)

    var enumAnswer = local_EnumarationItem
    var enumInOrder = html_enumInOrder.checked

    // the code below code be optimized

    // if going to add a questionAndAnswer
    if (local_atQuestionType == 0){
        // if the local_selectedItem is -1, it means just to add a new non existing.. but if its not
        // then update
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
                setTimeout(displayItems, 25);
            }); 
        } else {
        // if the local_selectedItem is -1(which means the item is existing)
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
                setTimeout(displayItems, 25);
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
                setTimeout(displayItems, 25);
            }); 
             /**/
        } else {
        // if the local_selectedItem is -1(which means the item is existing)
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
                setTimeout(displayItems, 25);
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

        // with the deleted
        var newValue = value
        newValue.splice(selectedITBR_Index, 1);

        localforage.setItem(reviewerDatabaseName, newValue)
        console.log(newValue)

        // update reviewerDetails
        local_amountOfItems -= 1
        
        // this could've been simplier aarghhh (update group list)
        var indexToRemove = local_groupList.indexOf(groupToBeRemoved);
        if (indexToRemove !== -1) {
            local_groupList.splice(indexToRemove, 1);
        }

        updateReviewerDetails(local_idCounter, local_amountOfItems, local_groupList)
        hideEditor()
        setTimeout(displayItems, 25);
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
                html_difficulty.forEach(function(element) {
                    element.innerHTML = `
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficulty)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficultyClassic)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">            
                    `
                });

                local_atQuestionType = 1
                selectQType(1)
                displayEnumarationAns(local_EnumarationItem)

                //update mode

            } else {
            // Q&A mode
                
                // assign it to the html groupings
                html_group.value = local_selectedItem.group
                html_question.value = local_selectedItem.question
                html_answer.value = local_selectedItem.answer
                html_image.value = local_selectedItem.image

                html_difficulty.forEach(function(element) {
                    element.innerHTML = `
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficulty)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(local_selectedItem.difficultyClassic)+`">
                    <img class="normalSizeFlag" src="`+getWhichFlag(0)+`">            
                    `
                });
                
                console.log(local_selectedItem)

                updateBothQEQuestions()
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
            html_groupListContainer.innerHTML += `
				<div class="groupListItem">				
					<div class="groupListItemCheckBox">
						<input type="checkbox" class="itemDisabled" onclick='excludeGroup("`+totalGroups[i]+`")' checked>
					</div>
					`+totalGroups[i]+`
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
    var groupSection = document.getElementById("groupSectionId"+id)

    if (buttonContent.innerHTML == "^"){
        buttonContent.innerHTML = "v"
        groupSection.style.display = "none"
        local_whichGroupsAreHidden.push(id)

    } else if (buttonContent.innerHTML == "v"){
        buttonContent.innerHTML = "^"
        groupSection.style.display = "block"
        removeHiddenGroup(local_whichGroupsAreHidden, id)
    }
    
    console.log(buttonContent.innerHTML, local_whichGroupsAreHidden)
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
    //var groupSection = document.getElementById("groupSectionId"+id)
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


document.querySelector(".initOptionsHide").addEventListener("click", hideOptionsBeforeReviTerm);
//document.querySelector(".addItemFunc").addEventListener("click", addItem);


