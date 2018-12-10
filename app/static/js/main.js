// import * as $ from 'jquery';
var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var selected_var;
var uips;
var closest_uip;
var conflict_info;
var post_conflict_info;
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
            // Display the dropdown and the box
            showSelectionSection();
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
    // Sort options in ascending order
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
                console.log(response);
                // update graph depending on what we get back from backend
                addNodes(response.new_nodes);
                if (response.conflict) {
                    addNodes({ 'K': response.conflict_info.conflict_label });
                }
                addEdges(response.edges);
                updateLevel(response.level);
                updateDropdown(response.available);
                s.refresh();
                if (response.conflict) {
                    hideSelectionSection();
                    addConflictUI();
                    conflict_info = response.conflict_info;
                    post_conflict_info = response.reset;
                }
                else {
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
    console.log('in addNodes ', s.graph.nodes());
    s.render();
}
function addEdges(edges) {
    if (Object.keys(edges).length !== 0) {
        var _loop_1 = function (key) {
            if (edges.hasOwnProperty(key)) {
                edges[key].map(function (target) {
                    s.graph.addEdge({
                        id: key.toString().concat(target.toString()),
                        source: key.toString(),
                        target: target.toString(),
                        size: 10,
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
    dropdown.style.display = "none";
    var selectionSection = document.getElementById("selectionSection");
    selectionSection.style.display = "none";
}
function showSelectionSection() {
    var dropdown = document.getElementById("varDropdown");
    dropdown.style.display = "inline-flex";
    var selectionSection = document.getElementById("selectionSection");
    selectionSection.style.display = "flex";
}
function addConflictUI() {
    var _a;
    var graph = document.getElementById("sigma-container");
    var graphConflictUIList = ['br2', 'bw3', 'ba', 'ph3', 'pv2', 'washed-red', 'br--top-l'];
    (_a = graph.classList).add.apply(_a, graphConflictUIList);
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "flex";
    var firstButton = document.getElementById("conflict_getUIPs");
    firstButton.style.display = "inline-flex";
}
function removeConflictUI() {
    var _a;
    var graph = document.getElementById("sigma-container");
    var graphConflictUIList = ['br2', 'bw3', 'ba', 'ph3', 'pv2', 'washed-red', 'br--top-l'];
    (_a = graph.classList).remove.apply(_a, graphConflictUIList);
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "none";
}
function getUIPs() {
    // color all possible uips red
    s.graph.nodes().forEach(function (node) {
        if (conflict_info.all_uips.indexOf(node.label) > -1) {
            console.log("here");
            node.color = 'red';
        }
    });
    // recolor all the edges to be blue again
    s.graph.edges().forEach(function (edge) { return edge.color = '#357EDD'; });
    s.render();
    var thisButton = document.getElementById("conflict_getUIPs");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_getUIP");
    nextButton.style.display = "inline-flex";
}
function getClosestUIP() {
    // only the closest uip remains red
    s.graph.nodes().forEach(function (node) {
        if (conflict_info.right_uip !== node.label) {
            node.color = '#357EDD';
        }
    });
    s.render();
    var thisButton = document.getElementById("conflict_getUIP");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_showCut");
    nextButton.style.display = "inline-flex";
}
function showCut() {
    var cut_conflict = conflict_info.cut_conflict.map(function (x) { return x.toString(); });
    // Show all elements on conflict side of cut as red
    s.graph.nodes().forEach(function (node) {
        if (cut_conflict.indexOf(node.id) > -1) {
            node.color = 'red';
        }
        else {
            node.color = '#357EDD';
        }
    });
    // recolor all the edges to be blue again
    s.graph.edges().forEach(function (edge) { return edge.color = '#357EDD'; });
    s.render();
    var thisButton = document.getElementById("conflict_showCut");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_addConflictClause");
    nextButton.style.display = "inline-flex";
}
function addConflictClause() {
    s.graph.clear();
    s.refresh();
    console.log('post_conflict_info ', post_conflict_info);
    addNodes(post_conflict_info.nodes);
    addEdges(post_conflict_info.edges);
    s.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 1.5 });
    s.refresh();
    s.render();
    var thisButton = document.getElementById("conflict_addConflictClause");
    thisButton.style.display = "none";
    removeConflictUI();
    showSelectionSection();
    updateDropdown(post_conflict_info.available);
    updateLevel(post_conflict_info.level);
}
