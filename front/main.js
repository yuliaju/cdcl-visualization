var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var my_clause_library = [];
var selected_var;
// variables that have not yet been decided
var available_variables = [1, 2];
/* graph stuff */
// initialize instance vars
// function to send clause library to backend as a string
function sendClauseLibrary(cl) {
    // update my_clause_library variable
    console.log(cl);
    // update available_variables dropdown
    updateDropdown();
    // to-do: this probably won't actually return anything eventually
    return cl;
}
function updateSelectedVar() {
    var dropdown = document.getElementById("varDropdown");
    var selectedValue = Number(dropdown.options[dropdown.selectedIndex].value);
    selected_var = selectedValue;
    updateButtons();
}
function updateButtons() {
    // update buttons
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    // update text on buttons
    varButton.textContent = "p" + selected_var.toString() + " is true";
    notVarButton.textContent = "p" + selected_var.toString() + " is false";
    // show buttons (not shown initially)
    varButton.style.display = "block";
    notVarButton.style.display = "block";
}
function updateDropdown() {
    var dropdown = document.getElementById("varDropdown");
    // remove all options
    dropdown.options.length = 0;
    available_variables.map(function (v) {
        var opt = document.createElement('option');
        opt.value = v.toString();
        opt.innerHTML = 'p' + v.toString();
        dropdown.appendChild(opt);
    });
}
// send decision at each level
function sendDecision(b) {
    var decision = (b == 'true');
    // to-do change using global var and b
    // send to backend showVariable(v);
    // update graph depending on what we get back from backend
    s.graph.addNode({ id: '0' });
    s.graph.addNode({ id: '1' });
    s.graph.addEdge({ id: '01', source: '0', target: '1' });
    // re render graph
    s.graph.refresh();
}
// function to get UIPs and display
function getUIPs(uips) {
}
// function to get conflict clause and display
function getConflict(conflictClause) {
}
// receive generated nodes at each level
function getGeneratedNodes(nodes) {
    var node_list = parseNodes(nodes);
    // to-do add nodes to sigma graph / return commands?
}
// receive list of possible variables at each level
function getPossibleVariables(vars) {
    available_variables = parseVars(vars).map(function (x) { return (isNot(x)) ? x.num : x; });
}
// helper functions
function parseNodes(nodes) {
    var _a;
    var l, id, edges;
    var result = [];
    var ns = nodes.split(';');
    for (var n in ns) {
        _a = n.split(','), l = _a[0], id = _a[1], edges = _a[2];
        result.push();
    }
    return result;
}
function parseVars(vars) {
    return [];
}
// this function may be unnecessary
function clauseLibraryToString(db) {
    var result = "";
    // refactor using reduce
    db.forEach(function (c) {
        result += '[';
        c.forEach(function (v) {
            result += showVariable(v) + ',';
        });
        // chop off the extra comma
        result = result.substring(0, result.length - 1);
        result += '],';
    });
    // chop off the extra comma
    result = result.substring(0, result.length - 1);
    return result;
}
// todo: make into a class method-type thing
function showVariable(v) {
    var result;
    if (isNot(v)) {
        result += '~p' + v.num.toString();
    }
    else {
        result += 'p' + v.toString();
    }
    return result;
}
