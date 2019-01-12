/* Show */
function showButtons() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  varButton.style.display = "inline-flex";
  notVarButton.style.display = "inline-flex";
}

function showClauseDatabaseState() {
  let clauseDatabaseStateSection = document.getElementById("clauseDatabaseStateSection") as HTMLElement;
  clauseDatabaseStateSection.style.display = "flex";
}

function showConflictUI() {
  let conflictSection = document.getElementById("conflictSection") as HTMLElement;
  conflictSection.style.display = "flex";

  let firstButton = document.getElementById("conflict_getUIPs") as HTMLElement;
  firstButton.style.display = "inline-flex";
}

function showEducationalExplanation() {
  let educationalExplanationSection = document.getElementById("educationalExplanationSection") as HTMLElement;
  educationalExplanationSection.style.display = "flex";
}

function showFinishedSection(satisfiable: boolean, decided: any) {
  let finishedSection = document.getElementById("finishedSection") as HTMLElement;
  finishedSection.style.display = "flex";

  let satOrUnsat = document.getElementById("satOrUnsat") as HTMLElement;

  if (satisfiable) {
    satOrUnsat.innerHTML = 'This clause database is satisfiable. Here is the satisfying solution you found!';

    let satisfyingSolution = document.getElementById("satisfyingSolution") as HTMLElement;
    satisfyingSolution.innerHTML = decided.join('</br>');
  } else {
    satOrUnsat.innerHTML = 'This clause database is unsatisfiable.';
  }

  hideSelectionSection();
}

function showSelectionSection() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "inline-flex";

  let selectionSection = document.getElementById("selectionSection") as HTMLElement;
  selectionSection.style.display = "flex";
}

/* Hide */
function hideButtons() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  varButton.style.display = "none";
  notVarButton.style.display = "none";
}

function hideConflictUI() {
  let conflictSection = document.getElementById("conflictSection") as HTMLElement;
  conflictSection.style.display = "none";
}

function hideEducationalExplanation() {
  let educationalExplanationSection = document.getElementById("educationalExplanationSection") as HTMLElement;
  educationalExplanationSection.style.display = "none";
}

function hideFinishedSection() {
  let finishedSection = document.getElementById("finishedSection") as HTMLElement;
  finishedSection.style.display = "none";
}

function hideSelectionSection() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  varButton.style.display = "none";
  notVarButton.style.display = "none";

  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "none";

  let selectionSection = document.getElementById("selectionSection") as HTMLElement;
  selectionSection.style.display = "none";
}
