import localforage from "./localForage/localforage.js" 

/*
    "reviewerNames" = contains the names of the user created reviewerzes
    "selectedReviewer" = contains the name of the reviewer that is going to be edited
    "selectedGroupExclusion" = contains the name of the groups that wont be taken when reviewing
    spaceRepetition = contains the datas of the user performance
*/

var reviewerPath = "reviewerContent_"

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
            <br/><br/>
            <button onclick="exportReviewer(`+i+`)"> Export Reviewer </button>
            <br/><br/>
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

// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //


function exportReviewer(index) {
    
    localforage.getItem("reviewerNames", function (err, reviewerNames) {
        var selectedReviewer = reviewerNames[index].ReviewerName

        localforage.getItem(reviewerPath+selectedReviewer, function (err, content){
            //console.log(reviewerPath+selectedReviewer)
            var exportData = [[selectedReviewer+"_Export"]]

            for (var i in content){
                var toBePushed = [[
                    content[i].answer,
                    0,                  //difficulty
                    content[i].disabled,
                    content[i].enumaration,
                    content[i].group,
                    content[i].id,
                    content[i].image,
                    content[i].question
                ]]

                exportData = [...exportData, ...toBePushed]        
            }

            console.log(exportData)

            /*/
            // Convert data to a string
            var rtrContent = exportData.map(row => row.join('\t')).join('\n');
            
            // Create a Blob with the content
            var blob = new Blob([rtrContent], { type: 'text/plain' });
            
            // Create a download link
            var downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = selectedReviewer+'.rtr';
            
            downloadLink.target = '_blank';
            
            // Append the link to the document body and trigger the download
            document.body.appendChild(downloadLink);
            //downloadLink.click();
            
            // Clean up
            document.body.removeChild(downloadLink);
            /**/

            // Get the text field
            var copyText = JSON.stringify(exportData)

            console.log(copyText)
            
            // Select the text field
            //copyText.setSelectionRange(0, 99999); // For mobile devices

            // Copy the text inside the text field
            navigator.clipboard.writeText(copyText);

            // Alert the copied text
            alert("Copied the content of "+selectedReviewer);
        });
          /*/

          /**/

    });
}

function importReviewer() {

    var importValue = document.querySelector(".importReviewerValue").value 

    try {
        importValue = JSON.parse(importValue)
    }catch(error){
        alert("Invalid imported reviewer!")
        return
    }

    /**/
    var ReviewerName = importValue[0][0]
    var Terms = 0
    var Id = reviewerId
    var Revi = {Id, ReviewerName, Terms}
    var alreadyExisted = false

    // the reviewerItems
    var importedReviewerItems = importValue.slice(1)
    var totalReviewerItems = []        
    var reviewerDetails = {
        idCounter: 0,
        amountOfItems: 0,
        groupList: []
    }
    var highestId = 0

    console.log("importedReviewerItems ",importedReviewerItems)

    // items to be added (just import stuff)
    for (var i in importedReviewerItems){
        var item = {
            answer: importedReviewerItems[i][0],
            difficulty: importedReviewerItems[i][1],
            disabled: importedReviewerItems[i][2],
            enumaration: importedReviewerItems[i][3],
            group: importedReviewerItems[i][4],
            id: importedReviewerItems[i][5],
            image: importedReviewerItems[i][6],
            question: importedReviewerItems[i][7]
        }

        // get the id
        if (highestId < importedReviewerItems[i][5]){highestId = importedReviewerItems[i][5];} 
        
        reviewerDetails.amountOfItems += 1
        reviewerDetails.idCounter = highestId+1
        reviewerDetails["groupList"].push(importedReviewerItems[i][4])
        totalReviewerItems.push(item)
    }


    /**/
    // add to reviewerNames
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

        // add items to the content
        console.log(reviewerPath+ReviewerName)
        console.log(reviewerPath+ReviewerName+"Details")
        localforage.setItem(reviewerPath+ReviewerName, totalReviewerItems)
        localforage.setItem(reviewerPath+ReviewerName+"_Details", reviewerDetails)

        document.querySelector(".importReviewerValue").value  = '';
        alert("Imported "+ReviewerName+" Successfully!")
    }); 
    /**/

}
document.querySelector('.importButton').addEventListener('click', importReviewer);

function OLDimportReviewer(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    
    var fileReader = new FileReader();
  
    fileReader.onload = function(event) {
        var arrayBuffer = event.target.result;
        var workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Extract data from the first worksheet
        var worksheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[worksheetName];
        var data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log(data[0][0])

        /**/
        var ReviewerName = data[0][0]
        var Terms = 0
        var Id = reviewerId
        var Revi = {Id, ReviewerName, Terms}
        var alreadyExisted = false

        // the reviewerItems
        var importedReviewerItems = data.slice(1)
        var totalReviewerItems = []        
        var reviewerDetails = {
            idCounter: 0,
            amountOfItems: 0,
            groupList: []
        }
        var highestId = 0

        console.log("importedReviewerItems ",importedReviewerItems)

        // items to be added (just import stuff)
        for (var i in importedReviewerItems){
            var item = {
                answer: importedReviewerItems[i][0],
                difficulty: importedReviewerItems[i][1],
                disabled: importedReviewerItems[i][2],
                enumaration: importedReviewerItems[i][3],
                group: importedReviewerItems[i][4],
                id: importedReviewerItems[i][5],
                image: importedReviewerItems[i][6],
                question: importedReviewerItems[i][7]
            }

            // get the id
            if (highestId < importedReviewerItems[i][5]){highestId = importedReviewerItems[i][5];} 
            
            reviewerDetails.amountOfItems += 1
            reviewerDetails.idCounter = highestId+1
            reviewerDetails["groupList"].push(importedReviewerItems[i][4])
            totalReviewerItems.push(item)
        }

        /**/
        // add to reviewerNames
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

            // add items to the content
            console.log(reviewerPath+ReviewerName)
            console.log(reviewerPath+ReviewerName+"Details")
            localforage.setItem(reviewerPath+ReviewerName, totalReviewerItems)
            localforage.setItem(reviewerPath+ReviewerName+"_Details", reviewerDetails)

            document.getElementById('importReviewer').value = '';
            alert("Imported "+data[0]+" Successfully!")
        }); 
        /**/


    };
  
    fileReader.readAsArrayBuffer(file);
}


initialize()


// exports
window.deleteReviewer = deleteReviewer
window.gotoEditor = gotoEditor
window.showOptionsBeforeReviTerm = showOptionsBeforeReviTerm
window.excludeGroup = excludeGroup
window.showDeleteMessage = showDeleteMessage
window.exportReviewer = exportReviewer