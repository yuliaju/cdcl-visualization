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

/*************************************************************/

function sendClauseLibrary(cl: string) {
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "/clause_db",
    data: JSON.stringify({'clauseLibrary': cl}),
    success: function (response) {
      console.log(response);

      updateDropdown(response.available);
      updateLevel(response.level);

      // Display the dropdown and the box (only need to do this the first time)
      let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
      dropdown.style.display = "inline-flex";

      let selectionSection = document.getElementById("selectionSection") as HTMLElement;
      selectionSection.style.display = "flex";
    },
    error: function(errorMsg) {
      // add better error response
      $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
      console.log(errorMsg);
    },
    dataType: "json"
  });
}

function updateDropdown(available_variables: number[]) {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;

  // Remove all options but the placeholder
  dropdown.options.length = 1;

  available_variables.sort();

  available_variables.map(
    function(v: number) {
      let opt = document.createElement('option');
      opt.value = v.toString();
      opt.innerHTML = 'p' + v.toString();
      dropdown.appendChild(opt);
    }
  );
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
      if (response.finished) {
        // display response.options somewhere prominent
        hideSelectionSection();
      } else {
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
        } else {
          // sort available_variables in ascending order?
          updateDropdown(response.available);
        }
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

// Receive generated nodes at each level
function addNodes(nodes: object) {
  // nodes :: { int: string }
  for (let index in nodes) {
    if (nodes.hasOwnProperty(index)) {
      s.graph.addNode({id: index.toString(), label: nodes[index]})
    }
  }

  // Reposition all nodes
  s.graph.nodes().forEach(function(node, i, a) {
    node.x = Math.cos(Math.PI * 2 * i / a.length);
    node.y = Math.sin(Math.PI * 2 * i / a.length);
    node.size=1;
  });
}

function addEdges(edges: object) {
  if (Object.keys(edges).length !== 0) {
    for (let key in edges) {
      if (edges.hasOwnProperty(key)) {
        edges[key].map(target =>
          s.graph.addEdge({
            id: key.toString().concat(target.toString()),
            source: key.toString(),
            target: target.toString(),
            size: 3,
            type: "arrow"
          })
        )
      }
    }
  }
}

function updateLevel(level: number) {
  var levelDiv = document.getElementById("currentLevel") as HTMLElement;
  levelDiv.style.display = "inline-flex";
  levelDiv.innerHTML = "Current Level: " + level.toString();
}

function hideSelectionSection() {
  let varButton = document.getElementById("decideVar") as HTMLElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLElement;

  varButton.style.display = "none";
  notVarButton.style.display = "none";

  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "inline-flex";

  let selectionSection = document.getElementById("selectionSection") as HTMLElement;
  selectionSection.style.display = "flex";
}

// function to get UIPs and display
function getUIPs(uips: string) {

}

// function to get conflict clause and display
function getConflict(conflictClause: string) {

}
