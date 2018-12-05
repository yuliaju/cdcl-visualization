// import * as $ from 'jquery';
var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var selected_var;
/*************************************************************/
function sendClauseLibrary(cl) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/clause_db",
        data: JSON.stringify({ 'clauseLibrary': cl }),
        success: function (response) {
            console.log(response);
            updateDropdown(response.available);
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
function updateDropdown(available_variables) {
    var dropdown = document.getElementById("varDropdown");
    // Remove all options but the placeholder
    dropdown.options.length = 1;
    available_variables.sort();
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
function sendDecision(decision) {
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
                addNodes(response.new_nodes);
                addEdges(response.edges);
                updateLevel(response.level);
                updateDropdown(response.available);
                s.refresh();
                if (response.conflict) {
                    hideSelectionSection();
                }
                else {
                    // sort available_variables in ascending order?
                    updateDropdown(response.available);
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
// Receive generated nodes at each level
function addNodes(nodes) {
    // nodes :: { int: string }
    for (var index in nodes) {
        if (nodes.hasOwnProperty(index)) {
            s.graph.addNode({ id: index.toString(), label: nodes[index] });
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
    if (Object.keys(edges).length !== 0) {
        var _loop_1 = function (key) {
            if (edges.hasOwnProperty(key)) {
                edges[key].map(function (target) {
                    return s.graph.addEdge({
                        id: key.toString().concat(target.toString()),
                        source: key.toString(),
                        target: target.toString(),
                        size: 3,
                        type: "arrow"
                    });
                });
            }
        };
        for (var key in edges) {
            _loop_1(key);
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
// function to get UIPs and display
function getUIPs(uips) {
}
// function to get conflict clause and display
function getConflict(conflictClause) {
}
