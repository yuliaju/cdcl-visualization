let explanations = {
                      on_load: "The CDCL algorithm finds a satisfying solution to a propositional formula in Conjunctive Normal Form (CNF) if one exists. First enter clauses into the clause database."
                      , on_send_db: "First the algorithm will propagate any decisions. For instance, if a unit clause exists, we know the value of that literal."
                      , user_decision: "This literal is added to the graph, and the decision is propagated. Nodes indicate the literal, its level, and (if it is not a decision node) the clause from which it was propagated. A propagated node is pointed to by all other nodes in its corresponding clause. If a decision has been propagated but the database is not yet satisfied, the algorithm asks the user for an arbitrary assignment of a literal."
                      , conflict: "When a conflict is reached, ... UIP, CUT, conflict clause, propagate"
                   };


function updateButtons() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  // Update text on buttons
  varButton.textContent= "p" + selected_var.toString() + " is true";
  notVarButton.textContent= "p" + selected_var.toString() + " is false";

  showButtons();
}

function updateClauseDatabaseState(clause_list: string[], clause_sat: boolean[]) {
  let state_string: string = "";

  clause_list.map(function(clause, index) {
    // check or x mark
    state_string += clause_sat[index] ? "&#10003;" : "&#10007;";
    state_string += " Clause #" + (index + 1).toString() + ": ";
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

function updateEducationalExplanation(step: string) {
  console.log('here');
  var explanation = document.getElementById("explanation") as HTMLElement;
  explanation.innerHTML = explanations[step];
}
