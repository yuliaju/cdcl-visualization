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

// Variables that have not yet been decided
let available_variables: number[];

/*************************************************************/

function sendClauseLibrary(cl: string) {
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "/clause_db",
    data: JSON.stringify({'clauseLibrary': cl}),
    success: function (response) {
      console.log(response);
      available_variables = response.available;

      // available_variables = [1,2];
      updateDropdown();
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

function updateDropdown() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;

  // Remove all options but the placeholder
  let length = dropdown.options.length;
  for (let i = 1; i < length; i++) {
    dropdown.options[i] = null;
  }

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
function sendDecision(b: string) {
  let decision: boolean = (b == 'true');

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
        addNodes(response.newnodes);
        addEdges(response.edges);
        updateLevel(response.level);
        s.refresh();

        if (response.conflict) {

          hideSelectionSection();
        } else {
          // sort available_variables in ascending order?
          available_variables = response.available;
          updateDropdown();
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

// function to get UIPs and display
function getUIPs(uips: string) {

}

// function to get conflict clause and display
function getConflict(conflictClause: string) {

}

// receive generated nodes at each level
function addNodes(nodes: object) {
  // s.graph.addNode({id: '0', label: "p0"});
  for (let index in nodes) {
    if (nodes.hasOwnProperty(index)) {
      s.graph.addNode({id: index, label: nodes[index]})
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
  // s.graph.addEdge({id: '01', source: '0', target: '1', size: 1, type: "arrow"});
  // s.graph.addEdge({id: '02', source: '0', target: '2', size: 1, type: "arrow"});

  // let edgesIsEmpty: boolean = Object.keys(edges).length === 0 && edges.constructor === Object;
  console.log(edges);

  if (Object.keys(edges).length !== 0) {
    for (let key in edges) {
      if (edges.hasOwnProperty(key)) {
        if (edges[key].length != 0) {
          s.graph.addEdge({
            id: key,
            source: edges[key][0].toString(),
            target: edges[key][1].toString(),
            size: 3,
            type: "arrow"
          })
        }
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
