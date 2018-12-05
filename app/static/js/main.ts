import * as $ from "jquery";

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
  console.log("Heyo");
    // console.log("inside func");
    $.post('/clause_db', {
      clauses: cl
  }).done(function(response) {
      console.log("done");
      // available_variables = response.available;
      // sort available_variables in ascending order?
  }).fail(function() {
      console.log("fail");
      $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
  });

  available_variables=[1,2];
  updateDropdown();

  // Display the dropdown and the box (only need to do this the first time)
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "inline-flex";

  let selectionSection = document.getElementById("selectionSection") as HTMLElement;
  selectionSection.style.display = "flex";
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

  // to-do change using global var and b
  // send to backend showVariable(v);
  (function($){
    $.post('/decision', {
      num: selected_var,
      sign: decision
  }).done(function(response) {
      if (response.finished) {

      } else {
        // update graph depending on what we get back from backend
        addNodes(response.newnodes);
        addEdges(response.edges);
        s.refresh();

        if (response.conflict) {
          // todo: hide everything in selectionSection, add step-through buttons

        } else {
          // sort available_variables in ascending order?
          available_variables = response.available;
          updateDropdown();
        }
      }
  }).fail(function() {
      $("#errorMsg").text("{{ _('Error: Could not contact server.') }}");
  })});
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
  // s.graph.addNode({id: '1', label: "p1"});
  // s.graph.addNode({id: '2', label: "p2"});
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
  for (let key in edges) {
    if (edges.hasOwnProperty(key)) {
      s.graph.addEdge({
                        id: key,
                        source: edges[key][0].toString(),
                        target: edges[key][1].toString,
                        size: 3,
                        type: "arrow"
                      })
    }
  }
}


// todo: may be unnecessary make into a class method-type thing
function showVariable(v: variable): string {
  let result: string;

  if (isNot(v)) {
    result += '~p' + v.num.toString();
  } else {
    result += 'p' + v.toString();
  }

  return result;
}
