import localforage from "./localForage/localforage.js"


var reviewerDatabaseName = "reviewerContent"
var revieweraddOn = "reviewerContent_"
//  ^-- This might change especially for the structure of file

// temporary/local values to be updated in the reviewerContent_NAME_Details database
var local_idCounter = 0
var local_amountOfItems = 0
var local_groupList = []
var local_selectedItem = []

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


// WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE 
// WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE 
// WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE // WEBSITE 

function displayItems(){
    // then add
    localforage.getItem(reviewerDatabaseName, function (err, value) {

        if (value != null) {
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
                                
                                <div class="itemAnswerText">Answer [`+value[j].answer+`]</div>
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

// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 
// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 
// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 

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

    console.log(local_selectedItem.id)

    var group = document.querySelector(".itemGroup").value
    var question = document.querySelector(".itemQuestion").value
    var answer = document.querySelector(".itemAnswer").value
    var image = document.querySelector(".itemImage").value


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


    // if the local_selectedItem is -1(which means the item is existing)
    // this is the update part :)
    } else {

        console.log("I see update :)")
        // other things
        var id = local_selectedItem.id
        var enumaration = local_selectedItem.enumaration
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



}
document.querySelector(".addItemFunc").addEventListener("click", addItem);

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

// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS
// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS
// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS// BUTTONS // BUTTONS

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


        
        // then remove



        /**/

    }); 
}
//document.querySelector(".remove").addEventListener("click", removeValue);

function showEditor(index = -1, selectedGroup){

    var html_group = document.querySelector(".itemGroup")
    var html_question = document.querySelector(".itemQuestion")
    var html_answer = document.querySelector(".itemAnswer")
    var html_image = document.querySelector(".itemImage")
    var html_addButton = document.querySelector(".addItemFunc")
    var html_difficulty = document.querySelector(".itemDifficulty")

    // if selected an existing item
    if (index != -1){
        localforage.getItem(reviewerDatabaseName, function (err, item) {
            
            local_selectedItem = getItemById(item, index)

            // assign it to the html groupings
            html_group.value = local_selectedItem.group
            html_question.value = local_selectedItem.question
            html_answer.value = local_selectedItem.answer
            html_image.value = local_selectedItem.image
            html_difficulty.innerHTML = local_selectedItem.difficulty

            console.log(local_selectedItem)

            //update mode
            html_addButton.value = "Update"
        })
    
    // if not
    } else {

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
        html_difficulty.innerHTML = 0

        console.log(local_selectedItem)

        // add mode
    }

    var html_overlay = document.getElementById("overlay") 
    var html_editBox = document.getElementById("editorId") 

    html_editBox.style.display = "block";
    html_overlay.style.display = "block";

    console.log("Hello World!", index, selectedGroup)
}


function hideEditor(){
    var html_overlay = document.getElementById("overlay") 
    var html_editBox = document.getElementById("editorId") 

    html_editBox.style.display = "none";
    html_overlay.style.display = "none";
    
}
document.querySelector(".hideEditorFunc").addEventListener("click", hideEditor);

// LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK 
// LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK 
// LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK // LINK 

function gotoSelectReviewer(){
    window.location.replace("index.html");
}


initialization()

window.removeItem = removeItem
window.gotoSelectReviewer = gotoSelectReviewer
window.showEditor = showEditor