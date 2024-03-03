import localforage from "./localForage/localforage.js" 

/*
    "quizNames" = contains the names of the user created quizzes
    "selectedQuiz" = contains the name of the quiz that is going to be edited
    spaceRepetition = contains the datas of the user performance
*/

var quizId = 0


// initialization (create the database once opened)
function initialize(){
    localforage.getItem("quizNames", function (err, value) {

        // if its empty, then create a new "save file"
        if (value == null){
            localforage.setItem("quizNames", [])
            console.log("quizNames is created!")
        } else {
            console.log("quizNames contains", value)
            updateQuizList()
        }

        
    })

    localforage.getItem("quizNamesId", function (err, value) {
        // if its empty, then create a new "save file"
        if (value == null){
            localforage.setItem("quizNamesId", 0)
            console.log("quizNamesId is created!")
        } else {
            console.log("quizNamesId contains", value)
            quizId = value
        }
    })
}

function addQuiz(){
    var QuizName = document.querySelector(".nameQuiz").value
    var Terms = 0
    var Id = quizId
    var Revi = {Id, QuizName, Terms}

    if (QuizName == ""){
        alert("please put somethingg!")
        return
    }

    localforage.getItem("quizNames", function (err, value) {
        var newValue = value
        newValue.push(Revi)

        localforage.setItem("quizNames", newValue)
        console.log(newValue)

        //document.querySelector(".userValue").value = ""
        setTimeout(updateQuizList, 100);

        quizId += 1;
        localforage.setItem("quizNamesId", quizId)
    }); 
}
document.querySelector(".addQuiz").addEventListener("click", addQuiz);


function getAmountOfTerms(quizName, index){

    var noQuoteName = quizName.replace(/['"]+/g, '')
    // ^-- temporary fix

    localforage.getItem(noQuoteName, function (err, value) {
        console.log(value.length)

    })
}


function updateQuizList(){
    // then add
    localforage.getItem("quizNames", function (err, value) {

        // clear first
        document.querySelector(".listOfQuiz").innerHTML = ""    

        for (var i=0; i<value.length; i++){

            var theTitle = JSON.stringify(value[i]["QuizName"])
            var theTerms = JSON.stringify(value[i]["Terms"])

            document.querySelector(".listOfQuiz").innerHTML += 
            `Title: `+theTitle+`__Terms: `+theTerms+`___
            <button onclick='gotoPlay(`+theTitle+`)'>Play</button> 
            <button onclick='gotoEditor(`+theTitle+`)'>Edit</button>
            <button onclick="removeQuiz(`+i+`)">Remove</button>
            <br/><br/>`
        }
    });
}

function removeQuiz(index){
    // remove item
    localforage.getItem("quizNames", function (err, value) {
        var newValue = value
        newValue.splice(index, 1);

        localforage.setItem("quizNames", newValue)
        console.log(newValue)
        setTimeout(updateQuizList, 100);
    }); 
}


function gotoEditor(name){
    localforage.setItem("selectedQuiz", name)
    window.location.replace("reviEditor.html");
    //console.log(name)
}

function gotoPlay(name){
    localforage.setItem("selectedQuiz", name)
    window.location.replace("reviGame.html");  
}

//localforage.removeItem("quizNamesId")
//console.log("quizName succesfully removed!")

//localforage.setItem("quizName", [])
//console.log("quizName is created!")



initialize()


// exports
window.removeQuiz = removeQuiz
window.gotoEditor = gotoEditor
window.gotoPlay = gotoPlay