// import * as $ from 'jquery';
var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var selected_var;
// Variables that have not yet been decided
var available_variables;
/*************************************************************/
function sendClauseLibrary(cl) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/clause_db",
        data: JSON.stringify({ 'clauseLibrary': cl }),
        success: function (response) {
            console.log(response);
            available_variables = response.available;
            // available_variables = [1,2];
            updateDropdown();
            updateLevel(response.level);
            // Display the dropdown and the box (only need to do this the first time)
            var dropdown = document.getElementById("varDropdown");
            dropdown.style.display = "inline-flex";
            var selectionSection = document.getElementById("selectionSection");
            selectionSection.style.display = "flex";
        },
        error: function (errorMsg) {
            // add better error response
            $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
            console.log(errorMsg);
        },
        dataType: "json"
    });
}
function updateDropdown() {
    var dropdown = document.getElementById("varDropdown");
    // Remove all options but the placeholder
    var length = dropdown.options.length;
    for (var i = 1; i < length; i++) {
        dropdown.options[i] = null;
    }
    available_variables.map(function (v) {
        var opt = document.createElement('option');
        opt.value = v.toString();
        opt.innerHTML = 'p' + v.toString();
        dropdown.appendChild(opt);
    });
}
function updateSelectedVar() {
    var dropdown = document.getElementById("varDropdown");
    var selectedValue = Number(dropdown.options[dropdown.selectedIndex].value);
    selected_var = selectedValue;
    updateButtons();
}
function updateButtons() {
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    // Update text on buttons
    varButton.textContent = "p" + selected_var.toString() + " is true";
    notVarButton.textContent = "p" + selected_var.toString() + " is false";
    // Display buttons
    varButton.style.display = "inline-flex";
    notVarButton.style.display = "inline-flex";
}
// On button click
function sendDecision(b) {
    var decision = (b == 'true');
    // Hide buttons
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    varButton.style.display = "none";
    notVarButton.style.display = "none";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/decision",
        data: JSON.stringify({
            'num': selected_var,
            'sign': decision
        }),
        success: function (response) {
            if (response.finished) {
                // display response.options somewhere prominent
                hideSelectionSection();
            }
            else {
                console.log("here");
                console.log(response);
                // update graph depending on what we get back from backend
                addNodes(response.newnodes);
                addEdges(response.edges);
                updateLevel(response.level);
                s.refresh();
                if (response.conflict) {
                    hideSelectionSection();
                }
                else {
                    // sort available_variables in ascending order?
                    available_variables = response.available;
                    updateDropdown();
                }
            }
        },
        error: function (errorMsg) {
            // add better error response
            $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
            console.log(errorMsg);
        },
        dataType: "json"
    });
}
// function to get UIPs and display
function getUIPs(uips) {
}
// function to get conflict clause and display
function getConflict(conflictClause) {
}
// receive generated nodes at each level
function addNodes(nodes) {
    // s.graph.addNode({id: '0', label: "p0"});
    for (var index in nodes) {
        if (nodes.hasOwnProperty(index)) {
            s.graph.addNode({ id: index, label: nodes[index] });
        }
    }
    // Reposition all nodes
    s.graph.nodes().forEach(function (node, i, a) {
        node.x = Math.cos(Math.PI * 2 * i / a.length);
        node.y = Math.sin(Math.PI * 2 * i / a.length);
        node.size = 1;
    });
}
function addEdges(edges) {
    // s.graph.addEdge({id: '01', source: '0', target: '1', size: 1, type: "arrow"});
    // s.graph.addEdge({id: '02', source: '0', target: '2', size: 1, type: "arrow"});
    // let edgesIsEmpty: boolean = Object.keys(edges).length === 0 && edges.constructor === Object;
    console.log(edges);
    if (Object.keys(edges).length !== 0) {
        for (var key in edges) {
            if (edges.hasOwnProperty(key)) {
                if (edges[key].length != 0) {
                    s.graph.addEdge({
                        id: key,
                        source: edges[key][0].toString(),
                        target: edges[key][1].toString(),
                        size: 3,
                        type: "arrow"
                    });
                }
            }
        }
    }
}
function updateLevel(level) {
    var levelDiv = document.getElementById("currentLevel");
    levelDiv.style.display = "inline-flex";
    levelDiv.innerHTML = "Current Level: " + level.toString();
}
function hideSelectionSection() {
    var varButton = document.getElementById("decideVar");
    var notVarButton = document.getElementById("decideNotVar");
    varButton.style.display = "none";
    notVarButton.style.display = "none";
    var dropdown = document.getElementById("varDropdown");
    dropdown.style.display = "inline-flex";
    var selectionSection = document.getElementById("selectionSection");
    selectionSection.style.display = "flex";
}
