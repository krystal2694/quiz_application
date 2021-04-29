import * as db from "./dbCalls.js";

let questions;

function addQuestionToPage(questionNumber) {
    let question = questions[questionNumber - 1];
    let questionTemplate = document.querySelector("#question-template").cloneNode(true);
    questionTemplate.id = "q" + questionNumber;
    

    // populate question card with question text and options
    questionTemplate.querySelector(".question-text").innerHTML = question["text"];
    let Options = questionTemplate.getElementsByClassName("form-check");
    let radioOptions = questionTemplate.getElementsByClassName("form-check-input");
    let radioLabels = questionTemplate.getElementsByClassName("form-check-label");

    for (let i = 0; i < question["options"].length; i++) {
        Options[i].style["display"] = "block";
        radioOptions[i].name = "q" + questionNumber;
        radioLabels[i].innerHTML = question["options"][i];
    }

    // display the question and add it to the DOM
    questionTemplate.style["display"] = "inline";
    document.querySelector('.card-deck').appendChild(questionTemplate);
}

function startQuiz() {
    if (!questions) {
        window.alert("No quiz found in database.");
    } else {
        for (let i = 1; i < questions.length + 1; i++) {
            addQuestionToPage(i);
        }
        document.getElementById("start-quiz-btn").disabled = true;
        document.getElementById("submit-quiz-btn").style.display = "inline";
    }
}

function markQuiz() {
    let answers = getAnswers();

    // calculate user mark
    let correctAnswerCount = 0;
    for (let i = 0; i < questions.length; i++) {
        if (answers['userAnswers'][i] == answers['correctAnswers'][i]) {
            correctAnswerCount++;
        }
    }
    // show results
    displayScore(correctAnswerCount);
    displayCorrectAnswers(answers['correctAnswers'], answers['userAnswers']);

    disableRadioButtons();
    document.getElementById("submit-quiz-btn").disabled = true;
}

function getAnswers() {
    let correctAnswers = [];
    let userAnswers = [];

    for (let i = 0; i < questions.length; i++ ) {
        // get user answer
        let question = document.getElementById("q" + (i + 1));
        let userAnswer = question.querySelector('input[name="q' + (i + 1) + '"]:checked');
        if (!userAnswer) {
            window.alert("You must answer all questions before submitting!");
            return;
        }
        userAnswers.push(userAnswer.value);

        // get correct answer
        let questionObj = questions[i];
        correctAnswers.push(questionObj["options"].indexOf(questionObj["answer"]));
    }

    return {'userAnswers': userAnswers, 'correctAnswers': correctAnswers};
}

function displayScore(score) {
    let scoreContainer = document.querySelector('#user-mark-container');
    scoreContainer.innerHTML = "Your score: " + score + "/" + questions.length;
    scoreContainer.style.display = "inline";
}


function displayCorrectAnswers(answers, userAnswers) {
    for (let i = 0; i < answers.length; i++) {
        let question = document.querySelector('#q' + (i + 1));
        let options = question.getElementsByClassName("form-check");
        options[userAnswers[i]].getElementsByTagName('span')[0].innerHTML = "&#10060;";
        options[answers[i]].getElementsByTagName('span')[0].innerHTML = "&#10004;";
    }
}

function disableRadioButtons() {
    let radioButtons = document.getElementsByClassName("form-check-input");
    for (let i = 0; i < radioButtons.length; i++) {
        radioButtons[i].disabled = true;
    }
}

window.onload = function () {
    db.retrieveQuestionsFromDB().then(
        function (response) {
            questions = response;
            document.getElementById("start-quiz-btn").disabled = false;
        },
        function() {
            questions = null;
        });
    document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
    document.getElementById("start-quiz-btn").disabled = true;
    document.getElementById("submit-quiz-btn").addEventListener("click", markQuiz);
};