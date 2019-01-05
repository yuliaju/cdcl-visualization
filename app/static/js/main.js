// import * as $ from 'jquery';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var s;
function isNot(maybeNot) {
    return maybeNot.num !== undefined;
}
var selected_var;
var uips;
var closest_uip;
var conflict_info;
var post_conflict_info;
var num_conflicts_remaining;
// to-do: definitely need to refactor this
var next_conflict_response = {};
/*************************************************************/
function sendClauseLibrary(cl) {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "/clause_db",
        data: JSON.stringify({ 'clauseLibrary': cl.trim() }),
        success: function (response) {
            // in case it's not the first time calling this method
            s.graph.clear();
            s.refresh();
            hideFinishedSection();
            console.log(response);
            var parseErrorMsg = document.getElementById("parseErrorMsg");
            if (!response.parser) {
                // parsing error
                parseErrorMsg.style.display = "block";
            }
            else {
                parseErrorMsg.style.display = "none";
                updateDropdown(response.available);
                updateLevel(response.level);
                // Display the dropdown and the box
                showSelectionSection();
                // Show the state of the clause database in the backend
                showClauseDatabaseState();
                updateClauseDatabaseState();
                // In case there's a propagation already
                processResponse(response);
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
// to-do
function updateClauseDatabaseState() {
    var clauseDatabaseState = document.getElementById("clauseDatabaseState");
    clauseDatabaseState.innerHTML = "";
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
            processResponse(response);
        },
        error: function (errorMsg) {
            // add better error response
            $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
            console.log(errorMsg);
        },
        dataType: "json"
    });
}
function processResponse(response) {
    console.log(response);
    if (response.conflict > 0) {
        addNodes({ 'K': response.conflict_info[0].conflict_label });
        addNodes(response.conflict_info[0].new_nodes);
        addEdges(response.conflict_info[0].edges);
    }
    else {
        addNodes(response.new_nodes);
        addEdges(response.edges);
    }
    updateLevel(response.level);
    updateDropdown(response.available);
    s.refresh();
    if (response.conflict > 0) {
        hideSelectionSection();
        addConflictUI();
        conflict_info = response.conflict_info[0];
        post_conflict_info = response.reset[0];
        num_conflicts_remaining = response.conflict - 1;
        if (num_conflicts_remaining != 0) {
            // shallow copy
            next_conflict_response = __assign({}, response);
            next_conflict_response.conflict = response.conflict - 1;
            next_conflict_response.conflict_info = response.conflict_info.slice(1);
            next_conflict_response.reset = response.reset.slice(1);
        }
    }
    else {
        updateDropdown(response.available);
    }
    if (response.finished) {
        // display response.options somewhere prominent
        hideSelectionSection();
        showFinishedSection(response.satisfied, response.decided);
    }
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
    var numNodes = s.graph.nodes().length;
    var sizeOddRows = numNodes < 13 ? 3 : 5;
    var sizeEvenRows = numNodes < 13 ? 2 : 4;
    var numRows = Math.ceil(numNodes / (sizeOddRows + sizeEvenRows)) * 2;
    s.graph.nodes().forEach(function (node, i, a) {
        var locInTwoRows = i % (sizeOddRows + sizeEvenRows);
        // check if it's in the first or the second of the two rows
        var inOddRow = locInTwoRows < sizeOddRows;
        var colNumber = inOddRow ? locInTwoRows : locInTwoRows - sizeOddRows;
        // columns should be tapered -- even rows start a bit more in and end a little more in
        if (!inOddRow) {
            colNumber += colNumber < (sizeEvenRows / 2) ? .33 : .66;
        }
        var rowNumber = Math.floor(i / (sizeOddRows + sizeEvenRows)) * 2;
        rowNumber += inOddRow ? 0 : 1;
        // slightly move down every other node in each row, unless that row only
        // has two
        rowNumber += (sizeEvenRows > 2 || locInTwoRows < sizeOddRows) && (Math.floor(colNumber) % 2 !== 0) ? 0.5 : 0;
        node.x = colNumber / (sizeOddRows - 1);
        node.y = rowNumber / numRows;
        node.size = 1;
    });
    console.log('in addNodes ', s.graph.nodes());
    s.render();
}
function addEdges(edges) {
    console.log("Here: ", edges);
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
function showClauseDatabaseState() {
    var clauseDatabaseStateSection = document.getElementById("clauseDatabaseStateSection");
    clauseDatabaseStateSection.style.display = "flex";
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
function showFinishedSection(satisfiable, decided) {
    var finishedSection = document.getElementById("finishedSection");
    finishedSection.style.display = "flex";
    var satOrUnsat = document.getElementById("satOrUnsat");
    if (satisfiable) {
        satOrUnsat.innerHTML = 'This clause database is satisfiable. Here is the satisfying solution you found!';
        var satisfyingSolution = document.getElementById("satisfyingSolution");
        satisfyingSolution.innerHTML = decided.join('\n');
    }
    else {
        satOrUnsat.innerHTML = 'This clause database is unsatisfiable.';
    }
    hideSelectionSection();
}
function hideFinishedSection() {
    var finishedSection = document.getElementById("finishedSection");
    finishedSection.style.display = "none";
}
function addConflictUI() {
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "flex";
    var firstButton = document.getElementById("conflict_getUIPs");
    firstButton.style.display = "inline-flex";
}
function removeConflictUI() {
    var conflictSection = document.getElementById("conflictSection");
    conflictSection.style.display = "none";
}
function getUIPs() {
    // color all possible uips red
    s.graph.nodes().forEach(function (node) {
        if (conflict_info.all_uips.indexOf(node.label) > -1) {
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
    // Recolor all the edges going into the cut as green
    s.graph.edges().forEach(function (edge) {
        if (cut_conflict.indexOf(edge.target) > -1 && cut_conflict.indexOf(edge.source) <= -1) {
            edge.color = '#FFB700';
        }
    });
    s.render();
    var thisButton = document.getElementById("conflict_showCut");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_addConflictClause");
    nextButton.style.display = "inline-flex";
}
function addConflictClause() {
    s.graph.clear();
    s.refresh();
    // to-do: add button to view propagation as a separate step
    addNodes(post_conflict_info.nodes);
    addEdges(post_conflict_info.edges);
    s.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 1.5 });
    s.refresh();
    s.render();
    var thisButton = document.getElementById("conflict_addConflictClause");
    thisButton.style.display = "none";
    removeConflictUI();
    if (num_conflicts_remaining > 0) {
        processResponse(next_conflict_response);
    }
    else {
        showSelectionSection();
        updateDropdown(post_conflict_info.available);
        updateLevel(post_conflict_info.level);
    }
}
