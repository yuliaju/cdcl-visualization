// import * as $ from 'jquery';
var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var selected_var;
var uips;
var closest_uip;
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
                    // addConflictUI();
                    console.log(response.conflict_info.all_uips);
                    uips = response.conflict_info.all_uips;
                    closest_uip = response.conflict_info.right_uip;
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
                    if (target != "K") {
                        s.graph.addEdge({
                            id: key.toString().concat(target.toString()),
                            source: key.toString(),
                            target: target.toString(),
                            size: 10,
                            type: "arrow"
                        });
                    }
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
    dropdown.style.display = "none";
    var selectionSection = document.getElementById("selectionSection");
    selectionSection.style.display = "none";
}
function addConflictUI() {
    var graph = document.getElementById("graph");
    graph.classList.add("br2 bw3 ba ph3 pv2 mb2 washed-red br--top-l");
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "flex";
}
function removeConflictUI() {
    var graph = document.getElementById("graph");
    graph.removeAttribute("br2 bw3 ba ph3 pv2 mb2 washed-red br--top-l");
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "none";
}
// function to get UIPs and display
function getUIPs() {
    console.log('in getUIPs', uips);
    s.graph.nodes().forEach(function (node) {
        console.log(node);
        if (uips.indexOf(node.label) > -1) {
            console.log("here");
            node.color = 'red';
        }
    });
    s.render();
    var thisButton = document.getElementById("conflict_getUIPs");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_getUIP");
    thisButton.style.display = "inline-flex";
}
function getClosestUIP() {
    s.graph.nodes().forEach(function (node) {
        if (closest_uip !== node.label) {
            node.color = '#357EDD';
        }
    });
    s.render();
    var thisButton = document.getElementById("conflict_getUIP");
    thisButton.style.display = "none";
}
// function to get conflict clause and display
function getConflict(conflictClause) {
}
