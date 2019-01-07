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
// import * as $ from 'jquery';
/// <reference path="updateDisplayContent.ts" />
/// <reference path="graph.ts" />
/// <reference path="toggleDisplay.ts" />
/// <reference path="conflict.ts" />
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
                // Display the dropdown and the box
                showSelectionSection();
                // Show the state of the clause database in the backend
                showClauseDatabaseState();
                updateClauseDatabaseState(response.all_clauses, response.clause_sat);
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
        updateClauseDatabaseState(response.conflict_info[0].all_clauses, response.conflict_info[0].clause_sat);
    }
    else if (response.new_nodes) {
        // on the last response (if it's not a conflict), these all will all be undefined
        addNodes(response.new_nodes);
        addEdges(response.edges);
        updateClauseDatabaseState(response.all_clauses, response.clause_sat);
    }
    // similarly, these will be undefined in the last response (if it's not a conflict)
    if (response.available) {
        updateLevel(response.level);
        updateDropdown(response.available);
    }
    if (response.conflict > 0) {
        hideSelectionSection();
        showConflictUI();
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
        if (response.conflict_info[0].finished) {
            hideSelectionSection();
            showFinishedSection(response.conflict_info[0].satisfied, response.conflict_info[0].decided);
        }
    }
    else if (response.finished) {
        // clause satisfiability should update to what is in conflict info first,
        // then once conflict clause is added, update to the clause-sat in data
        hideSelectionSection();
        showFinishedSection(response.satisfied, response.decided);
    }
}
