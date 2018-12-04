"use strict";
exports.__esModule = true;
var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var my_clause_library = [];
var selected_var;
// variables that have not yet been decided
var available_variables;
/* graph stuff */
// initialize instance vars
// function to send clause library to backend as a string
function sendClauseLibrary(cl) {
    (function ($) {
        $.post('/clause_db', {
            clauses: cl
        }).done(function (response) {
        }).fail(function () {
            $("#destElem").text("{{ _('Error: Could not contact server.') }}");
        });
    });
    // update my_clause_library variable
    console.log(cl);
    available_variables = [1, 2];
    console.log(available_variables);
    console.log("before calling updateDropdown");
    // update available_variables dropdown
    updateDropdown();
    // display variable selection dropdown
    // let inputs = document.getElementById("inputs") as HTMLElement;
    // inputs.style.display = "block";
    var dropdown = document.getElementById("varDropdown");
    dropdown.style.display = "block";
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
    // to-do: always add default, non-selectable select instruction
    dropdown.options.length = 0;
    console.log(available_variables);
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
    s.graph.addNode({ id: '0', label: "p0" });
    s.graph.addNode({ id: '1', label: "p1" });
    s.graph.addNode({ id: '2', label: "p2" });
    s.graph.addNode({ id: '3', label: "p3" });
    s.graph.addEdge({ id: '01', source: '0', target: '1', size: 1, type: "arrow" });
    s.graph.addEdge({ id: '02', source: '0', target: '2', size: 1, type: "arrow" });
    s.graph.nodes().forEach(function (node, i, a) {
        node.x = Math.cos(Math.PI * 2 * i / a.length);
        node.y = Math.sin(Math.PI * 2 * i / a.length);
        node.size = 1;
        node.color = '#f00';
    });
    s.refresh();
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
