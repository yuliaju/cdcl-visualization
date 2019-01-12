// import * as $ from 'jquery';
/// <reference path="updateDisplayContent.ts" />
/// <reference path="graph.ts" />
/// <reference path="toggleDisplay.ts" />
/// <reference path="conflict.ts" />
let s;

interface Not {
  num: number;
}

function isNot(maybeNot: Not | number): maybeNot is Not {
  return (<Not>maybeNot).num !== undefined;
}

type variable = number | Not;
type clause = variable[];
type clause_library = clause[];
type label = string;
type id = number;
type outgoingEdges = number;

let selected_var: number;
let uips: string[];
let closest_uip: string;
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

      console.log(response);

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
      console.log(errorMsg);
    },
    dataType: "json"
  });
}

function processResponse(response: any) {
  console.log(response);

  if (response.conflict > 0) {
    addNodes({'K': response.conflict_info[0].conflict_label});
    addNodes(response.conflict_info[0].state.new_nodes);
    addEdges(response.conflict_info[0].state.edges);
    updateClauseDatabaseState(response.conflict_info[0].state.all_clauses, response.conflict_info[0].state.clause_sat);
  } else {
    addNodes(response.state.new_nodes);
    addEdges(response.state.edges);
    updateClauseDatabaseState(response.state.all_clauses, response.state.clause_sat);
  }

  updateLevel(response.state.level);
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
    showFinishedSection(response.satisfied, response.decided);
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
      console.log(errorMsg);
    },
    dataType: "json"
  });
}
