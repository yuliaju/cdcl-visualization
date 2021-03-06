var explanations = {
    on_load: "The CDCL algorithm finds a satisfying solution to a propositional formula in Conjunctive Normal Form (CNF) if one exists. First enter clauses into the clause database.",
    propagation: "First the algorithm will propagate any decisions. For instance, if a unit clause exists, we know the value of that literal. The database is still not satisfied, so the algorithm needs an arbitrary assignment of a literal.",
    post_user_decision: "The chosen literal is added to the graph, and the decision is propagated. Nodes indicate the literal, its level, and (if it is not a decision node) the clause in which it was propagated. A propagated node is pointed to by all other nodes in its corresponding clause.",
    pre_user_decision: "The database is still not satisfied, so the algorithm needs an arbitrary assignment of a literal.",
    btwn_user_decisions: "The chosen literal is added to the graph, and the decision is propagated. Nodes indicate the literal, its level, and (if it is not a decision node) the clause in which it was propagated. A propagated node is pointed to by all other nodes in its corresponding clause.\n\nThe database is yet not satisfied, so the algorithm needs an arbitrary assignment of a literal.",
    conflict: "Given your arbitrary decisions thus far, a conflict in the database was reached. We now take steps to resolve the conflict.",
    all_uips: "To calculate all possible UIPs, the algorithm finds every path from the most recent decision node to the conflict. All nodes that appear on every path are considered possible UIPs (see red nodes above).",
    uip: "The algorithm chooses the closest UIP to the conflict.",
    cut: "A cut is made on the graph: all nodes reachable from the UIP are place in the conflict cut (see the red nodes above).\n\nA new conflict clause is calculated: any node pointing into the conflict cut (the yellow arrows above) is negated to create the clause.",
    conflict_clause: " The clause is then added to the database. After the new clause is added to the database, the algorithm rewinds the graph to the second highest level of all nodes associated with the conflict clause. If only one node is associated with the clause, by convention the algorithm rewinds to one level earlier.",
    propagate: "After the algorithm rewinds to the appropriate level, it propagates (if possible).",
    finished: "The CDCL algorithm has finished. You can enter another clause database to run it again!"
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
function updateEducationalExplanation(step) {
    var explanation = document.getElementById("explanation");
    explanation.innerHTML = explanations[step];
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
function updateSampleClauseLibrary() {
    var clauseLibrary = document.getElementById("clauseLibrary");
    clauseLibrary.value = "~p1 or ~p2 or ~p4\n~p1 or p2 or ~p3\np3 or ~p4\np4 or p5 or p6\n~p5 or p7\n~p6 or p7 or ~p8";
}
