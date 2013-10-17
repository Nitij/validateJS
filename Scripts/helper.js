; var emailRegExp = "^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$";
var vManager1 = null, vManager2 = null, vManager3 = null;

var messageCollection = {
    salaryBlank: "Salary cannot be blank.",
    incorrectEmail: "The email id that you entered does not seem to be correct.",
    salaryRange: "Salary should be between $1000 and $2000.",
    salaryLessThan: "Salary should be less than or equal to $100.",
    nameRequired: "Please enter your name.",
    salaryMultiples: "Salary should be in multiples of 100.",
    salaryMaxLength: "Maximum length for this field is 4.",
    salaryMinLength: "Minimum length for this field is 2.",
    onlyNumbers: "Only numbers are allowed in this field",
    firstNameRequired: "Please enter your first name.",
    lastNameRequired: "Please enter your last name.",
    onlyAlphabetsFirstName: "Only alphabets are allowed in the first name.",
    onlyAlphabetsLastName: "Only alphabets are allowed in the last name.",
    emailMaxLength: "The maximum length for email id is 20 characters.",
    phoneMaxLength: "Phone number maximum length can only be upto 15.",
    phoneMinLength: "Phone number minimum length can only be upto 6.",
    correctInformation: "You must agree that the information that you have provided is correct."
};
$(document).ready(function () {
    vManager1 = new ValidationManager()
                .addValidator(["name"], [{ type: ValidationType.Required, message: messageCollection.nameRequired }])
                .addValidator(["salary1"], [{
                    type: ValidationType.Compare
                    , rule: { compareType: CompareType.LessThanEqual, value: 100 }
                    , message: messageCollection.salaryLessThan
                }])
                .addValidator(["salary2"], [{
                    type: ValidationType.Range
                    , rule: [1000, 2000]
                    , message: messageCollection.salaryRange
                }])
                .addValidator(["email"], [{
                    type: ValidationType.RegularExpression
                    , rule: emailRegExp
                    , message: messageCollection.incorrectEmail
                }])
                .addValidator(["salary3"], [{
                    type: ValidationType.Custom
                    , rule: CustomSalaryValidation
                    , message: messageCollection.salaryMultiples
                }])
                .addValidator(["salary4"], [{ type: ValidationType.Required, message: messageCollection.salaryBlank },
                    { type: ValidationType.Range, rule: [1000, 2000], message: messageCollection.salaryRange },
                    { type: ValidationType.Custom, rule: CustomSalaryValidation, message: messageCollection.salaryMultiples }])
                .initialize();

    vManager2 = new ValidationManager()
                .addValidator(["salary5"], [{ type: ValidationType.Required, message: messageCollection.salaryBlank },
                    { type: ValidationType.Range, rule: [1000, 2000], message: messageCollection.salaryRange },
                    { type: ValidationType.Custom, rule: CustomSalaryValidation, message: messageCollection.salaryMultiples },
                    { type: ValidationType.MaxLength, rule: [4], message: messageCollection.salaryMaxLength },
                    { type: ValidationType.MinLength, rule: [2], message: messageCollection.salaryMinLength },
                    { type: ValidationType.Numeric, message: messageCollection.onlyNumbers }])
                .validateOnTextChange(true, SetSummary2)
                .initialize();

    vManager3 = new ValidationManager()
                .addValidator(["demoFirstName"], [{ type: ValidationType.Required, message: messageCollection.firstNameRequired },
                { type: ValidationType.Alphabets, message: messageCollection.onlyAlphabetsFirstName }])
                .addValidator(["demoLastName"], [{ type: ValidationType.Required, message: messageCollection.lastNameRequired },
                { type: ValidationType.Alphabets, message: messageCollection.onlyAlphabetsLastName }])
                .addValidator(["demoEmail"], [{
                    type: ValidationType.RegularExpression
                    , rule: emailRegExp
                    , message: messageCollection.incorrectEmail
                },
                {
                    type: ValidationType.MaxLength
                    , rule: [20]
                    , message: messageCollection.emailMaxLength
                }])
                .addValidator(["demoPhone"], [{
                    type: ValidationType.Numeric
                    , message: messageCollection.onlyNumbers
                },
                {
                    type: ValidationType.MaxLength
                    , rule: [15]
                    , message: messageCollection.phoneMaxLength
                },
                {
                    type: ValidationType.MinLength
                    , rule: [6]
                    , message: messageCollection.phoneMinLength
                }])
                .addValidator(["demoCorrectInfo"], [{
                    type: ValidationType.Required
                    , message: messageCollection.correctInformation
                }])
                .validateOnTextChange(true, SetDemoSummary)
                .highlightBackground(true)
                .initialize();
});
function ValidateName1() {
    vManager1.validate(["name"]);
    SetSummary("name1Sumamry", "name");
}
function ValidateSalary1() {
    vManager1.validate(["salary1"]);
    SetSummary("salary1Summary", "salary1");
}
function ValidateSalary2() {
    vManager1.validate(["salary2"]);
    SetSummary("salary2Summary", "salary2");
}
function ValidateEmail1() {
    vManager1.validate(["email"]);
    SetSummary("email1Summary", "email");
}
function ValidateSalary3() {
    vManager1.validate(["salary3"]);
    SetSummary("salary3Summary", "salary3");
}
function ValidateSalary4() {
    vManager1.validate(["salary4"]);
    SetSummary("salary4Summary", "salary4");
}
function ValidateDemoForm() {
    vManager3.validate(["demoFirstName", "demoLastName", "demoEmail", "demoPhone", "demoCorrectInfo"]);
    SetDemoSummary();
}
function CustomSalaryValidation(s) {
    if (s.length === 0 || !isNumber(s)) { return false; }
    if (s % 100 !== 0) {//salary should be in multiples of 100
        return false;
    }
    else {
        return true;
    }
}
function SetDemoSummary() {
    var i = 0;
    var validationResults = null;
    var validationSummary = "";
    validationResults = vManager3.getValidationResults();
    validationSummary += "<ul>";
    for (; i < validationResults.length; i++) {
        validationSummary += "<li style='padding:4px;'>";
        validationSummary += validationResults[i].message;
        validationSummary += "</li>";
    }
    validationSummary += "</ul>";
    $("#divDemoFormSummary").html(validationSummary);
}
function SetSummary(divSummary, validator) {
    var i = 0;
    var validationResults = null;
    var validationSummary = "";
    validationResults = vManager1.getValidationResults(validator);
    validationSummary += "<ul>";
    for (; i < validationResults.length; i++) {
        validationSummary += "<li>";
        validationSummary += validationResults[i].message;
        validationSummary += "</li>";
    }
    validationSummary += "</ul>";
    $("#" + divSummary).html(validationSummary);
}
function SetSummary2(validator) {
    var i = 0;
    var validationResults = null;
    var validationSummary = "";
    validationResults = vManager2.getValidationResults(validator[0]);
    validationSummary += "<ul>";
    for (; i < validationResults.length; i++) {
        validationSummary += "<li>";
        validationSummary += validationResults[i].message;
        validationSummary += "</li>";
    }
    validationSummary += "</ul>";
    $("#salary5Summary").html(validationSummary);
}
//function to check if a given value is numeric or not
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
