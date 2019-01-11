let explanations = {
                      on_load: "The CDCL algorithm finds a satisfying solution to a propositional formula in Conjunctive Normal Form (CNF) if one exists. First enter clauses into the clause database."
                      ,propogation: "First the algorithm will propogate any decisions. For instance, if a unit clause exists, we know the value of that literal. The database is still not satisfied, so the algorithm needs an arbitrary assignment of a literal."
                      ,post_user_decision: "The chosen literal is added to the graph, and the decision is propogated. Nodes indicate the literal, its level, and (if it is not a decision node) the clause in which it was propogated. A propogated node is pointed to by all other nodes in its corresponding clause."
                      ,pre_user_decision: "The database is still not satisfied, so the algorithm needs an arbitrary assignment of a literal."
                      ,conflict: "Given your arbitrary decisions thus far, a conflict in the database was reached. We now take steps to resolve the conflict."
                      ,all_uips: "To calculate all possible UIPs, the algorithm finds every path from the most recent decision node to the conflict. All nodes that appear on every path are considered possible UIPs."
                      ,uip: "The algorithm chooses the closest UIP to the conflict."
                      ,cut: "A cut is made on the graph: all nodes reachable from the UIP are place in the conflict cut (see the red nodes above)."
                      ,conflict_clause: "A new conflict clause is calculated: any node pointing into the conflict cut is negated. This clause is added to the database"
                      ,rewind: "After the new clause is added to the database, the algorithm rewinds the graph to the second highest level of all nodes associated with the conflict clause. If only one node is associated with the clause, by convention the algorithm rewinds to one level earlier."
                      ,propogate: "After the algorithm rewinds to the appropriate level, it propogates (if possible)."
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
