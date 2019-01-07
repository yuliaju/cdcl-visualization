function updateButtons() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  // Update text on buttons
  varButton.textContent= "p" + selected_var.toString() + " is true";
  notVarButton.textContent= "p" + selected_var.toString() + " is false";

  // Display buttons
  varButton.style.display = "inline-flex";
  notVarButton.style.display = "inline-flex";
}

function updateClauseDatabaseState(clause_list: string[], clause_sat: boolean[]) {
  let state_string: string = "";

  clause_list.map(function(clause, index) {
    // check or x mark
    state_string += clause_sat[index] ? "&#10003;" : "&#10007;";
    state_string += " Clause #" + index.toString() + ": ";
    state_string += clause + "<br />";
  });
  state_string = state_string.trim();

  let clauseDatabaseState = document.getElementById("clauseDatabaseState") as HTMLElement;
  clauseDatabaseState.innerHTML = state_string;
}

function updateDropdown(available_variables: number[]) {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;

  // Remove all options but the placeholder
  dropdown.options.length = 1;

  // Sort options in ascending order
  available_variables.sort();

  available_variables.map(
    function(v: number) {
      let opt = document.createElement('option');
      opt.value = v.toString();
      opt.innerHTML = 'p' + v.toString();
      dropdown.appendChild(opt);
    }
  );

  // reset value to disabled value each time
  dropdown.value = '';
}

function updateLevel(level: number) {
  var levelDiv = document.getElementById("currentLevel") as HTMLElement;
  levelDiv.style.display = "inline-flex";
  levelDiv.innerHTML = "Current Level: " + level.toString();
}

function updateSelectedVar() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  let selectedValue: number = Number(dropdown.options[dropdown.selectedIndex].value);

  selected_var = selectedValue;

  updateButtons();
}
