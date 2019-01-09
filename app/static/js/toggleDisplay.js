/* Show */
function showButtons() {
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    varButton.style.display = "inline-flex";
    notVarButton.style.display = "inline-flex";
}
function showClauseDatabaseState() {
    var clauseDatabaseStateSection = document.getElementById("clauseDatabaseStateSection");
    clauseDatabaseStateSection.style.display = "flex";
}
function showConflictUI() {
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "flex";
    var firstButton = document.getElementById("conflict_getUIPs");
    firstButton.style.display = "inline-flex";
}
function showFinishedSection(satisfiable, decided) {
    var finishedSection = document.getElementById("finishedSection");
    finishedSection.style.display = "flex";
    var satOrUnsat = document.getElementById("satOrUnsat");
    if (satisfiable) {
        satOrUnsat.innerHTML = 'This clause database is satisfiable. Here is the satisfying solution you found!';
        var satisfyingSolution = document.getElementById("satisfyingSolution");
        satisfyingSolution.innerHTML = decided.join('</br>');
    }
    else {
        satOrUnsat.innerHTML = 'This clause database is unsatisfiable.';
    }
    hideSelectionSection();
}
function showSelectionSection() {
    var dropdown = document.getElementById("varDropdown");
    dropdown.style.display = "inline-flex";
    var selectionSection = document.getElementById("selectionSection");
    selectionSection.style.display = "flex";
}
/* Hide */
function hideButtons() {
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    varButton.style.display = "none";
    notVarButton.style.display = "none";
}
function hideConflictUI() {
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "none";
}
function hideFinishedSection() {
    var finishedSection = document.getElementById("finishedSection");
    finishedSection.style.display = "none";
}
function hideSelectionSection() {
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    varButton.style.display = "none";
    notVarButton.style.display = "none";
    var dropdown = document.getElementById("varDropdown");
    dropdown.style.display = "none";
    var selectionSection = document.getElementById("selectionSection");
    selectionSection.style.display = "none";
}
