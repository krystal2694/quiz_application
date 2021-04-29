import * as db from "./dbCalls.js";

let questionId = 1;
let questions = [];

// Question Editor class to help in managing question templates
class QuestionEditor {
    constructor(questionId) {
        this.id = questionId;
        this.numOptions = 2;
    }

    addOption = () => {
        if (this.numOptions < 4) {
            this.numOptions++;
            addOptionField(this.id, this.numOptions);
        }
    }

    deleteOption = () => {
        if (this.numOptions > 2) {
            this.numOptions--;
            let optionsContainer = document.getElementById('q' + this.id).getElementsByClassName('answers-container')[0];
            optionsContainer.removeChild(optionsContainer.lastElementChild);
        }
    };

    updateQuestion = () => {
        let questionJSON = getQuestionContent(this.id);
        db.updateQuestionToDB(questionJSON).then(() => {
            showSnackBar("updated-snackbar");
        });
    }

    deleteQuestionFromDB = () => {
        db.deleteQuestionFromDB(this.id).then(() => {
            showSnackBar("deleted-snackbar");
            document.getElementById("q" + this.id).remove();
        });
    }
}

// add an additional option field for the specified question template
function addOptionField(questionId, optionNumber) {
    let optionsContainer = document.getElementById('q' + questionId).getElementsByClassName('answers-container')[0];
    let optionInput = document.getElementById('option-input');
    let clonedOptionInput = optionInput.cloneNode(true);

    clonedOptionInput.getElementsByClassName("radio-values")[0].setAttribute("value", optionNumber);
    clonedOptionInput.getElementsByClassName("radio-values")[0].name = "optradio" + questionId;
    optionsContainer.appendChild(clonedOptionInput);
}

// add an empty question template to the page with appropriate attributes
function addNewTemplate(questionId) {
    let questionContainer = document.querySelector('#questions-container');
    let question = document.querySelector("#question-template");
    
    let clonedQuestion = question.cloneNode(true);
    clonedQuestion.id = "q" + questionId;
    
    let questionInput = clonedQuestion.querySelector(".question-input");
    questionInput.id = "qi" + questionId;

    let radioInputs = clonedQuestion.getElementsByClassName("radio-values");
    for (let i = 0; i < radioInputs.length; i++) {
        radioInputs[i].name = "optradio" + questionId;
      }

    setTemplateButtonEventListeners(clonedQuestion, questionId);
    clonedQuestion.style["display"] = "inline";
    questionContainer.appendChild(clonedQuestion);
}

// set event listeners for buttons in new template
function setTemplateButtonEventListeners(questionTemplate, questionId) {
    let questionEditor = new QuestionEditor(questionId);

    let btnAddOption = questionTemplate.getElementsByClassName("btn-add-option")[0];
    btnAddOption.onclick = () => {questionEditor.addOption()}

    let btnDeleteOption = questionTemplate.getElementsByClassName("btn-delete-option")[0];
    btnDeleteOption.onclick = () => {questionEditor.deleteOption()}

    let btnDelete = questionTemplate.getElementsByClassName("btn-delete")[0];
    btnDelete.id = "btn-delete" + questionId;
    btnDelete.onclick = () => {questionEditor.deleteQuestionFromDB()}

    let btnUpdate = questionTemplate.getElementsByClassName("btn-update")[0];
    btnUpdate.id = "btn-update" + questionId;
    btnUpdate.onclick = () => {questionEditor.updateQuestion()}
}

// get question content from the question template and pack it into an object
function getQuestionContent(questionId) {
    let question = document.getElementById("q" + questionId);
    let questionText = question.querySelector("#qi" + questionId).value;
    let optionsElements = question.getElementsByClassName("options");
    let optionsRadios = question.getElementsByClassName("radio-values");
    let correctAnswer;
    let options = [];

    // make sure all necessary fields are filled out
    if (!questionText) {
        window.alert("Question cannot be blank.")
        return;
    }

    for (let i = 0; i < optionsElements.length; i++) {
        if (!optionsElements[i].value) {
            window.alert("An option cannot be blank.");
            return;
        } else {
            options.push(optionsElements[i].value);
            if (optionsRadios[i].checked) {
                correctAnswer = optionsElements[i].value;
            }
        }
    }

    if (!correctAnswer) {
        window.alert("You have not selected the correct answer.")
        return;
    }

    // assemble object with acquired information
     let questionJSON = {
        "questionId" : questionId,
        "questionText": questionText,
        "options": options,
        "correctAnswer": correctAnswer
    }
    return questionJSON;
}

// add a single question to the DB
function addQuestionToDB(questionId) {
    let questionJSON = getQuestionContent(questionId);
    if (!questionJSON) {return false}

    db.addQuestionToDB(questionJSON).then(() => {
        showSnackBar("added-snackbar");
    })
    return true;
}

// show snackbar to notify user when question has been added/updated/deleted
function showSnackBar (snackBarId) {
    let snackBar = document.getElementById(snackBarId);
    snackBar.className = "show";

    setTimeout(() => { 
        snackBar.className = snackBar.className.replace("show", "");
    }, 3000);
}

// add question to DB and add a new empty question template to the page
function addQuestionHandler() {
    if (!addQuestionToDB(questionId)) {return} 

    // enable update and delete buttons for added question
    document.getElementById("btn-update" + (questionId)).disabled = false;       
    document.getElementById("btn-delete" + (questionId)).disabled = false;    

    // increment question ID and add empty template
    questionId++;
    addNewTemplate(questionId);
}

// populate question template with content from question object
function populateQuestionTemplate(questionId, questionObj) {
    let questionTemplate = document.getElementById("q" + questionId);
    questionTemplate.getElementsByTagName("textarea")[0].value = questionObj["text"];

    // add extra options fields if question contains more than 2
    let numOptions = questionObj["options"].length;
    for (let i = 2; i < numOptions; i++) {
        addOptionField(questionId, i + 1);
    }

    // assign appropriate values to radio inputs and check correct answer
    let optionsInputBoxes = questionTemplate.getElementsByClassName("options");
    let radioButtons = questionTemplate.getElementsByClassName("radio-values");
    for (let j = 0; j < numOptions; j++) {
        optionsInputBoxes[j].value = questionObj["options"][j];
        if (questionObj["answer"] == questionObj["options"][j]) {
            radioButtons[j].checked = true;
        }
    }

    // enable update and delete buttons for this question
    document.getElementById("btn-update" + (questionId)).disabled = false;       
    document.getElementById("btn-delete" + (questionId)).disabled = false; 
}

// add all questions retrieved from the DB onto the page
function addQuestionsFromDB() {
    questions.forEach(question => {
        addNewTemplate(question["ID"]);
        populateQuestionTemplate(question["ID"], question);
    });

    // after all questions from database have been added, update current question ID and add a new template 
    questionId = questions[questions.length - 1]["ID"] + 1;
    addNewTemplate(questionId);
}

window.onload = function () {
    document.getElementById("loading-snackbar").style.visibility = "visible";
    document.getElementById("add-btn").addEventListener("click", addQuestionHandler);
    document.getElementById("add-btn").disabled = true;

    // retrieve all questions from the DB if there are any
    db.retrieveQuestionsFromDB().then(
        function(response) {
            questions = response;
            addQuestionsFromDB();
        },
        function() {
            addNewTemplate(questionId);
        }
    )
    .finally(function() {
        document.getElementById("add-btn").disabled = false;
        document.getElementById("loading-snackbar").style.visibility = "hidden";
    });
};
