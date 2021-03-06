// import * as $ from 'jquery';
/// <reference path="updateDisplayContent.ts" />
/// <reference path="graph.ts" />
/// <reference path="toggleDisplay.ts" />
/// <reference path="conflict.ts" />
let s;

let selected_var: number;
let conflict_info: any;
let post_conflict_info: any;
// to-do: definitely need to refactor this
let next_conflict_response: any = [];

/*************************************************************/

function sendClauseLibrary(cl: string) {
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "/clause_db",
    data: JSON.stringify({'clauseLibrary': cl.trim()}),
    success: function (response) {
      // in case it's not the first time calling this method
      s.graph.clear();
      s.refresh();
      hideFinishedSection();
      hideSelectionSection();
      hideConflictUI();

      let parseErrorMsg = document.getElementById("parseErrorMsg") as HTMLElement;

      if (!response.parser) {
        // parsing error
        parseErrorMsg.style.display = "block";
      } else {
        parseErrorMsg.style.display = "none";

        // Display the dropdown and the box
        showSelectionSection();

        // Show the state of the clause database in the backend
        showClauseDatabaseState();
        updateClauseDatabaseState(response.state.all_clauses, response.state.clause_sat);

        // In case there's a propagation already
        processResponse(response);
      }
    },
    error: function(errorMsg) {
      // add better error response
      $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
      console.log("Error sending clause database to backend. ", errorMsg);
    },
    dataType: "json"
  });
}

function processResponse(response: any) {
  if (response.conflict > 0) {
    addNodes({'K': response.conflict_info[0].conflict_label});
    addNodes(response.conflict_info[0].state.new_nodes);
    addEdges(response.conflict_info[0].state.edges);
    updateClauseDatabaseState(response.conflict_info[0].state.all_clauses, response.conflict_info[0].state.clause_sat);
    updateLevel(response.conflict_info[0].state.level);
  } else {
    addNodes(response.state.new_nodes);
    addEdges(response.state.edges);
    updateClauseDatabaseState(response.state.all_clauses, response.state.clause_sat);
    updateLevel(response.state.level);
  }

  updateDropdown(response.available);
  updateEducationalExplanation(response.explanation);

  if (response.conflict > 0) {
    hideSelectionSection();
    showConflictUI();

    conflict_info = response.conflict_info[0];

    // shallow copy
    next_conflict_response = { ...response };
    next_conflict_response.conflict = response.conflict - 1;
    next_conflict_response.conflict_info = response.conflict_info.slice(1);
  }

  if (response.finished && response.conflict == 0) {
    hideSelectionSection();
    showFinishedSection(response.satisfied, response.state.decided);
  }
}

// On button click
function sendDecision(decision: boolean) {
  hideButtons();

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
    error: function(errorMsg) {
      // add better error response
      $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
      console.log("Error sending decision to backend. ", errorMsg);
    },
    dataType: "json"
  });
}
