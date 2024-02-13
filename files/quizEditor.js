import localforage from "./localForage/localforage.js"


var quizDatabaseName = "quizContent"
//  ^-- This might change especially for the structure of file


function updateList(){
    // then add
    localforage.getItem(quizDatabaseName, function (err, value) {
        console.log("length of value THing", value.length)

        // clear first
        document.querySelector(".listOfItems").innerHTML = ""      

        for (var i=0; i<value.length; i++){

            var theValue = JSON.stringify(value[i])

            document.querySelector(".listOfItems").innerHTML += `
            `+theValue+
            `___<button onclick="removeItem(`+i+`)">Remove</button>
            <br/><br/>`
        }
    });
}

function addItem(){
    //console.log("HelloWorld!")
    var Group = document.querySelector(".itemGroup").value
    var Question = document.querySelector(".itemQuestion").value
    var Answer = document.querySelector(".itemAnswer").value
    var Image = document.querySelector(".itemImage").value

    // check first if valid text
    if (Group == "" || Question == "" || Answer == ""){
        alert("Please enter something!")
        return;
    }  

    var item = {Group, Question, Answer, Image}
    console.log(item)

    // add new item
    localforage.getItem(quizDatabaseName, function (err, value) {

        // check first if the database is empty
        if (value == null){
            value = []
        }

        var newValue = value
        newValue.push(item)

        localforage.setItem(quizDatabaseName, newValue)
        console.log(newValue)

        //document.querySelector(".userValue").value = ""
        setTimeout(updateList, 100);
    }); 

}
document.querySelector(".addItem").addEventListener("click", addItem);


function removeItem(index){
    // remove item
    localforage.getItem(quizDatabaseName, function (err, value) {
        var newValue = value
        newValue.splice(index, 1);

        localforage.setItem(quizDatabaseName, newValue)
        console.log(newValue)
        setTimeout(updateList, 100);
    }); 
}
//document.querySelector(".remove").addEventListener("click", removeValue);

localforage.getItem(quizDatabaseName, function (err, value) {
    console.log(value)
})

updateList()

window.removeItem = removeItem