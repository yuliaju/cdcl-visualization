// import * as $ from 'jquery';

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
let num_conflicts_remaining: number;
// to-do: definitely need to refactor this
let next_conflict_response: any = {};

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

      console.log(response);

      let parseErrorMsg = document.getElementById("parseErrorMsg") as HTMLElement;

      if (!response.parser) {
        // parsing error
        parseErrorMsg.style.display = "block";
      } else {
        parseErrorMsg.style.display = "none";

        updateDropdown(response.available);
        updateLevel(response.level);

        // Display the dropdown and the box
        showSelectionSection();

        // Show the state of the clause database in the backend
        showClauseDatabaseState();
        updateClauseDatabaseState(response.all_clauses, response.clause_sat);

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

function updateClauseDatabaseState(clause_list: string[], clause_sat: boolean[]) {
  let state_string: string = "";

  clause_list.map(function(clause, index) {
    // check or x mark
    state_string += clause_sat[index] ? "&#10003;" : "&#10007;";
    state_string += " Clause #" + index.toString() + ": ";
    state_string += clause + "<br />";
  });
  state_string = state_string.trim();

  let clauseDatabaseState = document.getElementById("clauseDatabaseState") as HTMLElement;
  clauseDatabaseState.innerHTML = state_string;
}

function updateDropdown(available_variables: number[]) {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;

  // Remove all options but the placeholder
  dropdown.options.length = 1;

  // Sort options in ascending order
  available_variables.sort();

  available_variables.map(
    function(v: number) {
      let opt = document.createElement('option');
      opt.value = v.toString();
      opt.innerHTML = 'p' + v.toString();
      dropdown.appendChild(opt);
    }
  );

  // reset value to disabled value each time
  dropdown.value = '';
}

function updateSelectedVar() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  let selectedValue: number = Number(dropdown.options[dropdown.selectedIndex].value);

  selected_var = selectedValue;

  updateButtons();
}

function updateButtons() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  // Update text on buttons
  varButton.textContent= "p" + selected_var.toString() + " is true";
  notVarButton.textContent= "p" + selected_var.toString() + " is false";

  // Display buttons
  varButton.style.display = "inline-flex";
  notVarButton.style.display = "inline-flex";
}

// On button click
function sendDecision(decision: boolean) {
  // Hide buttons
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

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
    addNodes(response.conflict_info[0].new_nodes);
    addEdges(response.conflict_info[0].edges);
    updateClauseDatabaseState(response.conflict_info[0].all_clauses, response.conflict_info[0].clause_sat);
  } else if (response.new_nodes){
    // on the last response (if it's not a conflict), these all will all be undefined
    addNodes(response.new_nodes);
    addEdges(response.edges);
    updateClauseDatabaseState(response.all_clauses, response.clause_sat);
  }

  // similarly, these will be undefined in the last response (if it's not a conflict)
  if (response.level) {
    updateLevel(response.level);
    updateDropdown(response.available);
  }

  if (response.conflict > 0) {
    hideSelectionSection();
    addConflictUI();

    conflict_info = response.conflict_info[0];
    post_conflict_info = response.reset[0];
    num_conflicts_remaining = response.conflict - 1;

    if (num_conflicts_remaining != 0) {
      // shallow copy
      next_conflict_response = { ...response };
      next_conflict_response.conflict = response.conflict - 1;
      next_conflict_response.conflict_info = response.conflict_info.slice(1);
      next_conflict_response.reset = response.reset.slice(1);
    }

    if (response.conflict_info[0].finished) {
      hideSelectionSection();
      showFinishedSection(response.conflict_info[0].satisfied, response.conflict_info[0].decided);
    }
  } else if (response.finished) {
    // clause satisfiability should update to what is in conflict info first,
    // then once conflict clause is added, update to the clause-sat in data
    hideSelectionSection();
    showFinishedSection(response.satisfied, response.decided);
  }
}

// Receive generated nodes at each level
function addNodes(nodes: object) {
  // nodes :: { int: string }
  for (let index in nodes) {
    if (nodes.hasOwnProperty(index)) {
      s.graph.addNode({id: index.toString(), label: nodes[index]})
    }
  }

  // Reposition all nodes
  let numNodes: number = s.graph.nodes().length;
  let sizeOddRows: number = numNodes < 13 ? 3 : 5;
  let sizeEvenRows: number = numNodes < 13 ? 2 : 4;
  let numRows = Math.ceil(numNodes/(sizeOddRows + sizeEvenRows)) * 2;

  s.graph.nodes().forEach(function(node, i, a) {
    let locInTwoRows: number = i % (sizeOddRows + sizeEvenRows);

    // check if it's in the first or the second of the two rows

    let inOddRow: boolean = locInTwoRows < sizeOddRows;

    let colNumber: number = inOddRow ? locInTwoRows : locInTwoRows - sizeOddRows;
    // columns should be tapered -- even rows start a bit more in and end a little more in
    if (!inOddRow) {
      colNumber +=colNumber < (sizeEvenRows/2) ? .33 : .66;
    }

    let rowNumber: number = Math.floor(i/(sizeOddRows + sizeEvenRows)) * 2;

    rowNumber += inOddRow ? 0 : 1;

    // slightly move down every other node in each row, unless that row only
    // has two
    rowNumber += (sizeEvenRows > 2 || locInTwoRows < sizeOddRows) && (Math.floor(colNumber) % 2 !== 0) ? 0.5 : 0;

    node.x = colNumber / (sizeOddRows - 1);
    node.y = rowNumber / numRows;

    node.size=1;
  });

  s.render();
  s.refresh();
}

function addEdges(edges: object) {
  if (Object.keys(edges).length !== 0) {
    for (let key in edges) {
      if (edges.hasOwnProperty(key)) {
        edges[key].map(target => {
            s.graph.addEdge({
              id: key.toString().concat(target.toString()),
              source: key.toString(),
              target: target.toString(),
              size: 10,
              type: "arrow"
            })
        })
      }
    }
  }

  s.render();
  s.refresh();
}

function updateLevel(level: number) {
  var levelDiv = document.getElementById("currentLevel") as HTMLElement;
  levelDiv.style.display = "inline-flex";
  levelDiv.innerHTML = "Current Level: " + level.toString();
}

function showClauseDatabaseState() {
  let clauseDatabaseStateSection = document.getElementById("clauseDatabaseStateSection") as HTMLElement;

  clauseDatabaseStateSection.style.display = "flex";
}

function hideSelectionSection() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  varButton.style.display = "none";
  notVarButton.style.display = "none";

  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "none";

  let selectionSection = document.getElementById("selectionSection") as HTMLElement;
  selectionSection.style.display = "none";
}

function showSelectionSection() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "inline-flex";

  let selectionSection = document.getElementById("selectionSection") as HTMLElement;
  selectionSection.style.display = "flex";
}

function showFinishedSection(satisfiable: boolean, decided: any) {
  let finishedSection = document.getElementById("finishedSection") as HTMLElement;
  finishedSection.style.display = "flex";

  let satOrUnsat = document.getElementById("satOrUnsat") as HTMLElement;

  if (satisfiable) {
    satOrUnsat.innerHTML = 'This clause database is satisfiable. Here is the satisfying solution you found!';

    let satisfyingSolution = document.getElementById("satisfyingSolution") as HTMLElement;
    satisfyingSolution.innerHTML = decided.join('\n');
  } else {
    satOrUnsat.innerHTML = 'This clause database is unsatisfiable.';
  }

  hideSelectionSection();
}

function hideFinishedSection() {
  let finishedSection = document.getElementById("finishedSection") as HTMLElement;
  finishedSection.style.display = "none";
}

function addConflictUI() {
  let conflictSection = document.getElementById("conflictSection") as HTMLElement;
  conflictSection.style.display = "flex";

  let firstButton = document.getElementById("conflict_getUIPs") as HTMLElement;
  firstButton.style.display = "inline-flex";
}

function removeConflictUI() {
  let conflictSection = document.getElementById("conflictSection") as HTMLElement;
  conflictSection.style.display = "none";
}

function getUIPs() {
  // color all possible uips red
  s.graph.nodes().forEach(function(node) {
    if (conflict_info.all_uips.indexOf(node.label) > -1) {
      node.color = 'red';
    }
  });

  // recolor all the edges to be blue again
  s.graph.edges().forEach(edge => edge.color = '#357EDD');
  s.render()

  let thisButton = document.getElementById("conflict_getUIPs") as HTMLElement;
  thisButton.style.display = "none";

  let nextButton = document.getElementById("conflict_getUIP") as HTMLElement;
  nextButton.style.display = "inline-flex";
}

function getClosestUIP() {
  // only the closest uip remains red
  s.graph.nodes().forEach(function(node) {
    if (conflict_info.right_uip !== node.label) {
      node.color = '#357EDD'
    }
  });

  s.render()

  let thisButton = document.getElementById("conflict_getUIP") as HTMLElement;
  thisButton.style.display = "none";

  let nextButton = document.getElementById("conflict_showCut") as HTMLElement;
  nextButton.style.display = "inline-flex";
}

function showCut() {
  let cut_conflict : string[] = conflict_info.cut_conflict.map(x => x.toString());
  // Show all elements on conflict side of cut as red
  s.graph.nodes().forEach(function(node) {
    if (cut_conflict.indexOf(node.id) > -1) {
      node.color = 'red';
    } else {
      node.color = '#357EDD';
    }
  });

  // recolor all the edges to be blue again
  s.graph.edges().forEach(edge => edge.color = '#357EDD');

  // Recolor all the edges going into the cut as green
  s.graph.edges().forEach(function(edge) {
    if (cut_conflict.indexOf(edge.target) > -1 && cut_conflict.indexOf(edge.source) <= -1) {
      edge.color = '#FFB700';
    }
  });

  s.render();

  let thisButton = document.getElementById("conflict_showCut") as HTMLElement;
  thisButton.style.display = "none";

  let nextButton = document.getElementById("conflict_addConflictClause") as HTMLElement;
  nextButton.style.display = "inline-flex";
}

function addConflictClause() {
  s.graph.clear();
  s.refresh();

  // to-do: add button to view propagation as a separate step
  addNodes(post_conflict_info.new_nodes);
  addEdges(post_conflict_info.edges);
  updateClauseDatabaseState(conflict_info.all_clauses, conflict_info.clause_sat);

  s.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 1.5 });
  s.refresh();
  s.render();

  let thisButton = document.getElementById("conflict_addConflictClause") as HTMLElement;
  thisButton.style.display = "none";

  removeConflictUI();

  if (num_conflicts_remaining > 0) {
    processResponse(next_conflict_response);
  } else {
    showSelectionSection();

    updateClauseDatabaseState(post_conflict_info.all_clauses, post_conflict_info.clause_sat);
    updateLevel(post_conflict_info.level);
  }
}
