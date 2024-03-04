import localforage from "./localForage/localforage.js" 

/*
    "reviewerNames" = contains the names of the user created reviewerzes
    "selectedReviewer" = contains the name of the reviewer that is going to be edited
    spaceRepetition = contains the datas of the user performance
*/

var reviewerId = 0


// initialization (create the database once opened)
function initialize(){
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

function addReviewer(){
    var ReviewerName = document.querySelector(".nameReviewer").value
    var Terms = 0
    var Id = reviewerId
    var Revi = {Id, ReviewerName, Terms}

    if (ReviewerName == ""){
        alert("please put somethingg!")
        return
    }

    localforage.getItem("reviewerNames", function (err, value) {
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


function getAmountOfTerms(reviewerName, index){

    var noQuoteName = reviewerName.replace(/['"]+/g, '')
    // ^-- temporary fix

    localforage.getItem(noQuoteName, function (err, value) {
        console.log(value.length)

    })
}


function updateReviewerList(){
    // then add
    localforage.getItem("reviewerNames", function (err, value) {

        // clear first
        document.querySelector(".listOfReviewer").innerHTML = ""    

        for (var i=0; i<value.length; i++){

            var theTitle = JSON.stringify(value[i]["ReviewerName"])
            var theTerms = JSON.stringify(value[i]["Terms"])

            document.querySelector(".listOfReviewer").innerHTML += 
            `Title: `+theTitle+`__Terms: `+theTerms+`___
            <button onclick='gotoPlay(`+theTitle+`)'>Play</button> 
            <button onclick='gotoEditor(`+theTitle+`)'>Edit</button>
            <br/>
            <button onclick="removeReviewer(`+i+`)">Remove</button>
            <br/><br/>`
        }
    });
}

function removeReviewer(index){
    // remove item
    localforage.getItem("reviewerNames", function (err, value) {

        var reviewerName = value[index].ReviewerName
        var reviewerContent = "reviewerContent_"+reviewerName
        var reviewerDetails = "reviewerContent_"+reviewerName+"_Details"

        var newValue = value
        newValue.splice(index, 1);

        localforage.removeItem(reviewerContent)
        localforage.removeItem(reviewerDetails)
        console.log(reviewerName,reviewerContent, reviewerDetails)



        localforage.setItem("reviewerNames", newValue)
        console.log(newValue)
        setTimeout(updateReviewerList, 100);
    }); 
}


function gotoEditor(name){
    localforage.setItem("selectedReviewer", name)
    window.location.replace("reviEditor.html");
    //console.log(name)
}

function gotoPlay(name){
    localforage.setItem("selectedReviewer", name)
    window.location.replace("reviGame.html");  
}

//localforage.clear()

//localforage.removeItem("reviewerNamesId")
//console.log("reviewerName succesfully removed!")

//localforage.setItem("reviewerName", [])
//console.log("reviewerName is created!")



initialize()


// exports
window.removeReviewer = removeReviewer
window.gotoEditor = gotoEditor
window.gotoPlay = gotoPlay