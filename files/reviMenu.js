import localforage from "./localForage/localforage.js" 

/*
    "reviewerNames" = contains the names of the user created reviewerzes
    "selectedReviewer" = contains the name of the reviewer that is going to be edited
    "selectedGroupExclusion" = contains the name of the groups that wont be taken when reviewing
    spaceRepetition = contains the datas of the user performance
*/

var reviewerId = 0
var selectedIndexToBeDeleted = -1


// for exclusion
var local_selectedGroupExclusion = []


// initialization (create the database once opened)
function initialize(){
    // 

    localforage.getItem("selectedGroupExclusion", function (err, value) {
        if (value == null){
            localforage.setItem("selectedGroupExclusion", [])
            console.log("selectedGroupExclusion is created!")
        }
    })
    
    localforage.getItem("reviewerNames", function (err, value) {
        // if its empty, then create a new "save file"
        if (value == null){
            localforage.setItem("reviewerNames", [])
            console.log("reviewerNames is created!")
        } else {
            console.log("reviewerNames contains", value)
            updateReviewerList()
        }
    })



    localforage.getItem("reviewerNamesId", function (err, value) {
        // if its empty, then create a new "save file"
        if (value == null){
            localforage.setItem("reviewerNamesId", 0)
            console.log("reviewerNamesId is created!")
        } else {
            console.log("reviewerNamesId contains", value)
            reviewerId = value
        }
    })
}

function getAmountOfTerms(reviewerName, index){

    var noQuoteName = reviewerName.replace(/['"]+/g, '')
    // ^-- temporary fix

    localforage.getItem(noQuoteName, function (err, value) {
        console.log(value.length)

    })
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

// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 
// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 
// CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD // CRUD 

function addReviewer(){
    var ReviewerName = document.querySelector(".nameReviewer").value.trim()
    var Terms = 0
    var Id = reviewerId
    var Revi = {Id, ReviewerName, Terms}
    var alreadyExisted = false;

    if (ReviewerName == ""){
        alert("please put somethingg!")
        return
    }

    localforage.getItem("reviewerNames", function (err, value) {

        if (value.some(item => item["ReviewerName"] === ReviewerName)){
            alert("Already existing Reviewer!")
            return  
        }

        var newValue = value
        newValue.push(Revi)
        
        localforage.setItem("reviewerNames", newValue)
        console.log(newValue)

        //document.querySelector(".userValue").value = ""
        setTimeout(updateReviewerList, 100);

        reviewerId += 1;
        localforage.setItem("reviewerNamesId", reviewerId)
    }); 
}
document.querySelector(".addReviewer").addEventListener("click", addReviewer);

function updateReviewerList(){
    // then add
    localforage.getItem("reviewerNames", function (err, value) {

        // clear first
        document.querySelector(".listOfReviewer").innerHTML = ""    

        for (var i=0; i<value.length; i++){

            var theTitle = JSON.stringify(value[i]["ReviewerName"])
            var theTerms = JSON.stringify(value[i]["Terms"])

            document.querySelector(".listOfReviewer").innerHTML += 
            `
            <br/>
            Title: `+theTitle+`<br/>
            <button onclick='showOptionsBeforeReviTerm(`+theTitle+`)'>Play</button> 
            <button onclick='gotoEditor(`+theTitle+`)'>Edit</button>
            <br/><br/><br/>
            <button onclick="showDeleteMessage(`+i+`)">Remove</button>
            <br/><br/>`
        }
    });
}

function deleteReviewer(){
    // remove item
    localforage.getItem("reviewerNames", function (err, value) {
        
        var reviewerName = value[selectedIndexToBeDeleted].ReviewerName
        var reviewerContent = "reviewerContent_"+reviewerName
        var reviewerDetails = "reviewerContent_"+reviewerName+"_Details"

        var newValue = value
        newValue.splice(selectedIndexToBeDeleted, 1);

        localforage.removeItem(reviewerContent)
        localforage.removeItem(reviewerDetails)
        console.log(reviewerName,reviewerContent, reviewerDetails)

        localforage.setItem("reviewerNames", newValue)
        console.log(newValue)

        hideDeleteMessage()

        alert(reviewerName+" was succesfully deleted!")

        setTimeout(updateReviewerList, 100);
    }); 
}
document.querySelector(".deleteMessageYes").addEventListener("click", deleteReviewer);

// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE
// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE
// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE// INTERFACE // INTERFACE

function gotoEditor(name){
    localforage.setItem("selectedReviewer", name)
    window.location.href = "reviEditor.html";
    //console.log(name)
}

function showOptionsBeforeReviTerm(name){
    localforage.setItem("selectedReviewer", name)

    localforage.getItem("reviewerContent_"+name+"_Details", function (err, reviewer) {

        var totalGroups = [...new Set(reviewer.groupList)]; //without the duplicates

        var html_overlay = document.getElementById("overlay") 
        var html_initOptionsDIV = document.getElementById("initOptionsDIVId") 
        
        var html_groupListContainer = document.querySelector(".groupListContainer")
        var html_initOptionsReviewerName = document.querySelector(".initOptionsReviewerName")
        var html_initOptionsTotalItems = document.querySelector(".initOptionsTotalItems")

        html_initOptionsDIV.style.display = "block";
        html_overlay.style.display = "block";            
        
        html_groupListContainer.innerHTML = ""
        html_initOptionsReviewerName.innerHTML = name
        html_initOptionsTotalItems.innerHTML = reviewer.amountOfItems

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
    
    //window.location.replace("reviGame.html");  
}

function hideOptionsBeforeReviTerm(){
    var html_overlay = document.getElementById("overlay") 
    var html_initOptionsDIV = document.getElementById("initOptionsDIVId") 

    html_initOptionsDIV.style.display = "none";
    html_overlay.style.display = "none";        
}
document.querySelector(".initOptionsHide").addEventListener("click", hideOptionsBeforeReviTerm);


function showDeleteMessage(index){

    localforage.getItem("reviewerNames", function (err, value) {

        var html_deleteName = document.querySelectorAll(".deleteName")

        var html_overlay = document.getElementById("overlay") 
        var html_deleteContainer = document.getElementById("deleteContainerId")

        // to affect all
        html_deleteName.forEach(element => {
            element.innerHTML = value[index].ReviewerName
        });

        html_deleteContainer.style.display = "block";
        html_overlay.style.display = "block";   

        //value[index]
        selectedIndexToBeDeleted = index
    });
 
}

function hideDeleteMessage(){
    var html_overlay = document.getElementById("overlay") 
    var html_deleteContainer = document.getElementById("deleteContainerId") 

    html_deleteContainer.style.display = "none";
    html_overlay.style.display = "none";        
}
document.querySelector(".deleteMessageHide").addEventListener("click", hideDeleteMessage);

//localforage.clear()

//localforage.removeItem("reviewerNamesId")
//console.log("reviewerName succesfully removed!")

//localforage.setItem("reviewerName", [])
//console.log("reviewerName is created!")



initialize()


// exports
window.deleteReviewer = deleteReviewer
window.gotoEditor = gotoEditor
window.showOptionsBeforeReviTerm = showOptionsBeforeReviTerm
window.excludeGroup = excludeGroup
window.showDeleteMessage = showDeleteMessage