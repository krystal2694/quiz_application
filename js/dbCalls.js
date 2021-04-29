const endPointRoot = "https://calm-beyond-56373.herokuapp.com/v1/";
// const endPointRoot = "http://localhost:8080/v1/";


// retrieve all questions stored in the database
export function retrieveQuestionsFromDB() {
    return new Promise(function (resolve, reject) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", endPointRoot + "questions", true);
        xhttp.send();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.response)
                if (this.response == '[{}]') {
                    reject();
                } else {
                    resolve(JSON.parse(this.response));
                }
            }
        };
    });
}

// update a single question on the database
export function updateQuestionToDB(questionJSON) {
    return new Promise(function (resolve) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("PUT", endPointRoot + "questions", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve();
            }
        };
        xhttp.send(JSON.stringify(questionJSON));
    });
}

// delete a single question from the database
export function deleteQuestionFromDB(questionId) {
    return new Promise(function (resolve) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("DELETE", endPointRoot + "questions/" + questionId, true);
        xhttp.send();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve();
            }
        };
    });
}

// add a single question to the database
export function addQuestionToDB(questionJSON) {
    return new Promise(function (resolve) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", endPointRoot + "questions", true);
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve();
            }
        };
        xhttp.send(JSON.stringify(questionJSON));
    });
}

