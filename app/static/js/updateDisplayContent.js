var explanations = {
    on_load: "The CDCL algorithm finds a satisfying solution to a propositional formula in Conjunctive Normal Form (CNF) if one exists. First enter clauses into the clause database.",
    on_send_db: "First the algorithm will propagate any decisions. For instance, if a unit clause exists, we know the value of that literal.",
    user_decision: "This literal is added to the graph, and the decision is propagated. Nodes indicate the literal, its level, and (if it is not a decision node) the clause from which it was propagated. A propagated node is pointed to by all other nodes in its corresponding clause. If a decision has been propagated but the database is not yet satisfied, the algorithm asks the user for an arbitrary assignment of a literal.",
    conflict: "When a conflict is reached, ... UIP, CUT, conflict clause, propagate"
};
function updateButtons() {
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    // Update text on buttons
    varButton.textContent = "p" + selected_var.toString() + " is true";
    notVarButton.textContent = "p" + selected_var.toString() + " is false";
    showButtons();
}
function updateClauseDatabaseState(clause_list, clause_sat) {
    var state_string = "";
    clause_list.map(function (clause, index) {
        // check or x mark
        state_string += clause_sat[index] ? "&#10003;" : "&#10007;";
        state_string += " Clause #" + (index + 1).toString() + ": ";
        state_string += clause + "<br />";
    });
    state_string = state_string.trim();
    var clauseDatabaseState = document.getElementById("clauseDatabaseState");
    clauseDatabaseState.innerHTML = state_string;
}
function updateDropdown(available_variables) {
    var dropdown = document.getElementById("varDropdown");
    // Remove all options but the placeholder
    dropdown.options.length = 1;
    // Sort options in ascending order
    available_variables.sort();
    available_variables.map(function (v) {
        var opt = document.createElement('option');
        opt.value = v.toString();
        opt.innerHTML = 'p' + v.toString();
        dropdown.appendChild(opt);
    });
    // reset value to disabled value each time
    dropdown.value = '';
}
function updateLevel(level) {
    var levelDiv = document.getElementById("currentLevel");
    levelDiv.style.display = "inline-flex";
    levelDiv.innerHTML = "Current Level: " + level.toString();
}
function updateSelectedVar() {
    var dropdown = document.getElementById("varDropdown");
    var selectedValue = Number(dropdown.options[dropdown.selectedIndex].value);
    selected_var = selectedValue;
    updateButtons();
}
function updateEducationalExplanation(step) {
    console.log('here');
    var explanation = document.getElementById("explanation");
    explanation.innerHTML = explanations[step];
}
