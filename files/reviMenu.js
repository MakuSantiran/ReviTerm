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
var local_withImages = []


// html things
var html_deleteName = document.querySelectorAll(".deleteName")

var html_groupListContainer = document.querySelector(".groupListContainer")
var html_initOptionsReviewerName = document.querySelector(".initOptionsReviewerName")
var html_initOptionsTotalItems = document.querySelector(".initOptionsTotalItems")

var html_overlay = document.getElementById("overlay") 
var html_deleteContainer = document.getElementById("deleteContainerId")

var html_initOptionsDIV = document.getElementById("initOptionsDIVId") 
var html_addReviewerContainer = document.getElementById("addReviewerContainerId") 

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
            alert(ReviewerName+" is an already existing Reviewer!")
            return  
        }

        var newValue = value
        newValue.push(Revi)
        
        localforage.setItem("reviewerNames", newValue)
        console.log(newValue)

        //document.querySelector(".userValue").value = ""

        alert("Created "+ReviewerName+" reviewer!")
        hideReviewerContainer()

        setTimeout(updateReviewerList, 100);

        reviewerId += 1;
        localforage.setItem("reviewerNamesId", reviewerId)
    }); 
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
            `            
            <div class="reviewerItemContainer"> 
                `+theTitle+` 
                <div class="flexContainer">
                    <div class="flexItem">
                        <center>
                            <div class="deleteReviewerButton" onclick="showDeleteMessage(`+i+`)">Delete</div>
                        </center>
                    </div>
                    <div class="flexItem">
                        <center>
                            <div class="exportReviewerButton" onclick="exportReviewer(`+i+`)">Export</div>
                        </center>
                    </div>

                    <div class="flexItem">
                        <center>
                            <div class="openReviewerButton" onclick='gotoEditor(`+theTitle+`)'>Open</div>
                        </center>
                    </div>

                    <!--
                    <div class="flexItem">
                        <center>
                            <button onclick='showOptionsBeforeReviTerm(`+theTitle+`)'>Play</button> 
                        </center>
                    </div>
                    -->
                </div>
            </div>
            `
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
    html_initOptionsDIV.style.display = "none";
    html_overlay.style.display = "none";        
}

function showDeleteMessage(index){
    localforage.getItem("reviewerNames", function (err, value) {
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
    html_deleteContainer.style.display = "none";
    html_overlay.style.display = "none";        
}

function showReviewerContainer(){
    html_addReviewerContainer.style.display = "block";
    html_overlay.style.display = "block";   
}

function hideReviewerContainer(){
    html_addReviewerContainer.style.display = "none";
    html_overlay.style.display = "none";   
}

// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //// EXPORT/IMPORT //


function getDate() {
    var date = new Date();

    // Get date components
    var month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-indexed
    var day = String(date.getDate()).padStart(2, '0');
    var year = date.getFullYear();

    // Get time components
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    var seconds = String(date.getSeconds()).padStart(2, '0');
    var ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    // Combine components into desired format
    return month + day + year + hours + minutes + seconds + ampm;
}

function OLDExportReviewer(index) {
    
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

            // Copy the text inside the text field
            navigator.clipboard.writeText(copyText);

            // Alert the copied text
            alert("Copied the content of "+selectedReviewer);
        });
          /*/

          /**/

    });
}

function OLDimportReviewer() {

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
            alert(ReviewerName+" is an already existing Reviewer!")
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
        navigator.clipboard.writeText("");
    }); 
    /**/

}

function importReviewer(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    
    var fileReader = new FileReader();
  
    fileReader.onload = function(event) {
        var file = event.target.file;
        var arrayBuffer = event.target.result;

        // Get the file name
        var fileName = document.getElementById('importReviewerId').value
        var fileExtension = fileName.split('.').pop();

        if (fileExtension != "rtr"){
            alert("Please select an RTR file!")
            document.getElementById('importReviewerId').value = '';
            return
        }

        // Convert the array buffer to a string
        var textContent = new TextDecoder().decode(arrayBuffer);
        var data = JSON.parse(textContent);

        // Process the text content here
        console.log("ContentOfFile is", data);

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

            var imageToAdd = importedReviewerItems[i][6]

            if (importedReviewerItems[i][6] != ""){
                imageToAdd = convertImgToBlob(imageToAdd)
            }

            var item = {
                answer: importedReviewerItems[i][0],
                difficulty: importedReviewerItems[i][1],
                difficultyClassic: 0,
                disabled: importedReviewerItems[i][2],
                enumaration: importedReviewerItems[i][3],
                group: importedReviewerItems[i][4],
                id: importedReviewerItems[i][5],
                image: imageToAdd,
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
                alert(ReviewerName+" is an already existing Reviewer!")
                document.getElementById('importReviewerId').value = '';
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

            document.getElementById('importReviewerId').value = '';
            alert("Imported "+data[0]+" Successfully!")
        }); 
        /**/


    };
  
    fileReader.readAsArrayBuffer(file);
}

function downloadReviewer(name, data){
    console.log("HEYA", data)

    try {
        var plugin = cordova.plugins.safMediastore;

        // Prompt the user to select a file location
        var dateString = getDate();
        var fileName = name+"_"+dateString+".rtr";
        var fileContent = JSON.stringify(data);
        var base64Data = Base64.encode(fileContent)

        try {
            plugin.writeFile({
                "data": base64Data,
                "filename": fileName
            });
            alert(""+fileName+" saved in your download folder!")
        }catch(error2){
            alert(error2)
        }
    }catch(error){ 
        alert(error)

        var dateString = getDate();
        var fileName = name+"_"+dateString+".rtr";
        var fileContent = JSON.stringify(data);

        var blob = new Blob([fileContent], { type: 'text/plain' });

        // Create a download link
        var downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;

        // Append the link to the document body and trigger the click event
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        document.body.removeChild(downloadLink);

        //alert(error)
    }
}

function convertImgToBlob(base64String){
    // Extract the MIME type from the base64 string
    var mimeType = base64String.match(/^data:(.*?);/)[1];

    // Split the base64 string to get the data part
    var byteCharacters = atob(base64String.split(',')[1]);

    // Convert the byte characters into a typed array
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);

    // Create a Blob from the typed array
    var blob = new Blob([byteArray], { type: mimeType }); // Use the extracted MIME type

    return blob
}



function exportReviewer(index){
    localforage.getItem("reviewerNames", function (err, reviewerNames) {
        var selectedReviewer = reviewerNames[index].ReviewerName

        localforage.getItem(reviewerPath+selectedReviewer, function (err, content){
            //console.log(reviewerPath+selectedReviewer)

            console.log("The contetnt is",content)
            //var exportData = [[selectedReviewer+"_Export"]]
            var exportData = [[selectedReviewer]]
            local_withImages = []

            console.log("export datta is",exportData)

            for (var i in content){
                var savedImage = content[i].image
                console.log("The item is",content[i])

                // for images
                if (savedImage != ""){
                    local_withImages.push(i)
                }

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

                console.log("savedImage is", i ,content[i]["answer"], savedImage)

                exportData = [...exportData, ...toBePushed]     
                
                //console.log(i)
            }

            console.log("WHAWHGEUIHGSO",exportData)
            
            // for the damn images
            for (var i in local_withImages){

                // Create a new FileReader object
                var reader = new FileReader();

                // what the hell javascript
                var adjustedIndex = parseInt(local_withImages[i])+1

                // Define a function to handle the FileReader onload event
                // used some "illegal" techiniques
                reader.onload = (function(index, item) {
                    return function(event) {

                        console.log("IndexIS", index, item)

                        // Access the base64-encoded string
                        var base64String = event.target.result;
                        
                        // Use the base64String as needed
                        var stringified = base64String;
                        savedImage = JSON.stringify(stringified);

                        // save to the exportData
                        exportData[index + 1][6] = stringified;
                        console.log(exportData[index + 1][6]);

                        // remove the list of items with images
                        local_withImages.shift(); 

                        if (local_withImages.length == 0) {
                            console.log("To be downloaded", exportData);
                            console.log("Downloading");
                            downloadReviewer(selectedReviewer, exportData)
                        }
                    };
                })(parseInt(i), exportData[adjustedIndex]); // <-- "illegal" file parameters

                // read the image and save
                reader.readAsDataURL(exportData[adjustedIndex][6]);
            }

            //console.log(local_withImages)
            //console.log("TheExportedOne", exportData)

            if (local_withImages.length == 0){
                downloadReviewer(selectedReviewer, exportData)
            }
        });
    });
}

// exports
window.deleteReviewer = deleteReviewer
window.gotoEditor = gotoEditor
window.showOptionsBeforeReviTerm = showOptionsBeforeReviTerm
window.excludeGroup = excludeGroup
window.showDeleteMessage = showDeleteMessage
window.exportReviewer = exportReviewer


// the button listeners
document.querySelector(".addReviewerShow").addEventListener("click", showReviewerContainer);
document.querySelector(".addReviewer").addEventListener("click", addReviewer);
document.querySelector(".addReviewerContainerHide").addEventListener("click", hideReviewerContainer);

document.querySelector(".deleteMessageHide").addEventListener("click", hideDeleteMessage);
document.querySelector(".deleteMessageYes").addEventListener("click", deleteReviewer);

document.querySelector(".initOptionsHide").addEventListener("click", hideOptionsBeforeReviTerm);
document.querySelector('.importReviewerFileItself').addEventListener('change', importReviewer);

initialize()