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
        state_string += " Clause #" + index.toString() + ": ";
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
