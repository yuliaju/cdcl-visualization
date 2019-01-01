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


/*************************************************************/

function sendClauseLibrary(cl: string) {
  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "/clause_db",
    data: JSON.stringify({'clauseLibrary': cl}),
    success: function (response) {
      // Clear graph in case it's not the first time calling this method
      s.graph.clear();
      s.refresh();
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
      if (response.finished) {
        // display response.options somewhere prominent
        hideSelectionSection();
      } else {
        console.log(response);
        // update graph depending on what we get back from backend
        addNodes(response.new_nodes);

        if (response.conflict) {
          addNodes({'K': response.conflict_info.conflict_label});
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
        } else {
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

  console.log('in addNodes ', s.graph.nodes());

  s.render();
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
      console.log("here");
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
  s.render()

  let thisButton = document.getElementById("conflict_showCut") as HTMLElement;
  thisButton.style.display = "none";

  let nextButton = document.getElementById("conflict_addConflictClause") as HTMLElement;
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

  let thisButton = document.getElementById("conflict_addConflictClause") as HTMLElement;
  thisButton.style.display = "none";

  removeConflictUI();
  showSelectionSection();

  updateDropdown(post_conflict_info.available);
  updateLevel(post_conflict_info.level);
}
