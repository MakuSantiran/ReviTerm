import localforage from "./localForage/localforage.js"


var reviewerDatabaseName = "reviewerContent"
var revieweraddOn = "reviewerContent_"

// selectedGroupExclusion --> includes the group that would not be taken in the reviterm

//  ^-- This might change especially for the structure of file

// temporary/local values to be updated in the reviewerContent_NAME_Details database
var local_idCounter = 0
var local_amountOfItems = 0
var local_groupList = []
var local_selectedItem = []
var local_selectedGroupExclusion = []

var local_qType = 0 // 0 Question and Answer | 1 Enumaration
var local_EnumarationItem = []

var local_questionPlaceHolder = ""
var local_groupPlaceHolder = ""
var local_atQuestionType = 0

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

var html_enumInOrderId = document.getElementById("enumInOrderId")
var html_QAAB = document.getElementById("QAButtonId")
var html_EnumB = document.getElementById("EnumButtonId")
var html_qAAContainer = document.getElementById("qAAContainerId")
var html_enumContainer = document.getElementById("enumContainerId")

var html_overlay = document.getElementById("overlay") 
var html_editBox = document.getElementById("editorId") 
var html_initOptionsDIV = document.getElementById("initOptionsDIVId") 

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

function deleteIndexInArray(){
    
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

function displayItems(){
    // then add
    localforage.getItem(reviewerDatabaseName, function (err, value) {

        localforage.setItem("selectedGroupExclusion", []);

        if (value != null) {

            value = value.sort((a, b) => a.id - b.id);
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
                    <div class="groupHeader">
                        `+totalGroups[i]+`
                    </div>
                `

                // so for each items (that is related to the group)
                for (var j in value){
                    
                    // now display the only related item to the group
                    if (value[j].group == totalGroups[i]) {

                        html_listOfItems.innerHTML += `
                            <div class="itemBox" onclick="showEditor(`+value[j].id+`,'`+value[j].group+`')">
                                <div class="textInItemBox"> 
                                    <pre>`+value[j].question+`</pre>
                                </div>
                                
                                <div class="itemAnswerText">`+answerTypeIndicator(value[j].answer)+`</div>
                            </div>                            
                        `

                        // <button onclick="removeItem(`+j+`)">Remove</button>
                    }
                }

                html_listOfItems.innerHTML += `
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
            }

            value = []
            console.log("Content of "+reviewerDatabaseName+" are "+value)
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

    var enumAnswer = local_EnumarationItem
    var enumInOrder = html_enumInOrder.checked

    // if going to add a questionAndAnswer
    if (local_atQuestionType == 0){
        // if the local_selectedItem is -1, it means just to add a new non existing.. but if its not
        // then update
        if (local_selectedItem.id == -1){

            // other things
            var id = local_idCounter
            var enumaration = false
            var difficulty = 0
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

            var item = {id, enumaration, group, question, answer, image, difficulty, disabled}
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

            var updatedItem = {id, enumaration, group, question, answer, image, difficulty, disabled}

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
            var disabled = false

            // check first if valid text
            if (group == "" || question == "" || enumAnswer.length<=0){
                alert("Please enter something!")
                return;
            }  

            // trim the right/left spaces
            group = group.trimRight()
            question = question.trimRight()
            //answer = answer.trimRight()

            // remove the image in enumaration
            image = ""

            var item = {id, enumaration, group, question, answer: enumAnswer, image, difficulty, disabled, enumInOrder}
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
            var disabled = local_selectedItem.disabled
            var changedGroup = false

            // check first if valid text
            if (group == "" || question == "" || enumAnswer.length<=0){
                alert("Please enter something!")
                return;
            }  

            // trim the right/left spaces
            group = group.trimRight()
            question = question.trimRight()

            var updatedItem = {id, enumaration, group, question, answer: enumAnswer, image, difficulty, disabled, enumInOrder}
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
                    element.innerHTML = local_selectedItem.difficulty
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
                    element.innerHTML = local_selectedItem.difficulty
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
            element.innerHTML = 0
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


document.querySelector(".initOptionsHide").addEventListener("click", hideOptionsBeforeReviTerm);
//document.querySelector(".addItemFunc").addEventListener("click", addItem);