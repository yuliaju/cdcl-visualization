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
let my_clause_library: clause_library = [];

type label = string;
type id = number;
type outgoingEdges = number;
type node = [label, id, outgoingEdges];

let selected_var: number;

// variables that have not yet been decided
let available_variables: number[] = [1, 2];

/* graph stuff */
// initialize instance vars

// function to send clause library to backend as a string
function sendClauseLibrary(cl: string): string {
  (function($){
    $.post('/clause_db', {
      clauses: cl
  }).done(function(response) {

  }).fail(function() {
      $("#destElem").text("{{ _('Error: Could not contact server.') }}");
  })});

  // update my_clause_library variable
  console.log(cl);

  // update available_variables dropdown
  updateDropdown();

  // display variable selection dropdown
  // let inputs = document.getElementById("inputs") as HTMLElement;
  // inputs.style.display = "block";

  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  dropdown.style.display = "block";

  // to-do: this probably won't actually return anything eventually
  return cl;
}

function updateSelectedVar() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;
  let selectedValue: number = Number(dropdown.options[dropdown.selectedIndex].value);

  selected_var = selectedValue;

  updateButtons();
}

function updateButtons() {
  // update buttons
  let varButton = document.getElementById("decideVar") as HTMLButtonElement;
  let notVarButton = document.getElementById("decideNotVar") as HTMLButtonElement;

  // update text on buttons
  varButton.textContent= "p" + selected_var.toString() + " is true";
  notVarButton.textContent= "p" + selected_var.toString() + " is false";

  // show buttons (not shown initially)
  varButton.style.display = "block";
  notVarButton.style.display = "block";
}

function updateDropdown() {
  let dropdown = document.getElementById("varDropdown") as HTMLSelectElement;

  // remove all options
  // to-do: always add default, non-selectable select instruction
  dropdown.options.length = 0;

  available_variables.map(
    function(v: number) {
      let opt = document.createElement('option');
      opt.value = v.toString();
      opt.innerHTML = 'p' + v.toString();
      dropdown.appendChild(opt);
    }
  );
}

// send decision at each level
function sendDecision(b: string) {
  let decision: boolean = (b == 'true');

  // to-do change using global var and b
  // send to backend showVariable(v);

  // update graph depending on what we get back from backend

  s.graph.addNode({id: '0', label: "p0"});
  s.graph.addNode({id: '1', label: "p1"});
  s.graph.addNode({id: '2', label: "p2"});
  s.graph.addNode({id: '3', label: "p3"});
  s.graph.addEdge({id: '01', source: '0', target: '1', size: 1, type: "arrow"});
  s.graph.addEdge({id: '02', source: '0', target: '2', size: 1, type: "arrow"});

  s.graph.nodes().forEach(function(node, i, a) {
    node.x = Math.cos(Math.PI * 2 * i / a.length);
    node.y = Math.sin(Math.PI * 2 * i / a.length);
    node.size=1;
    node.color='#f00';
  });
  s.refresh();
}

// function to get UIPs and display
function getUIPs(uips: string) {

}

// function to get conflict clause and display
function getConflict(conflictClause: string) {

}

// receive generated nodes at each level
function getGeneratedNodes(nodes: string) {
  let node_list: node[] = parseNodes(nodes);

  // to-do add nodes to sigma graph / return commands?
}

// receive list of possible variables at each level
function getPossibleVariables(vars: string) {
  available_variables = parseVars(vars).map(x => (isNot(x)) ? x.num : x);
}

// helper functions
function parseNodes(nodes: string): node[] {
  let l, id, edges;
  let result: node[] = []
  let ns = nodes.split(';');

  for (let n in ns) {
    [l, id, edges] = n.split(',');

    result.push();
  }

  return result;
}

function parseVars(vars: string): variable[] {
  return [];

}

// this function may be unnecessary
function clauseLibraryToString(db: clause_library): string {
  let result: string = "";

  // refactor using reduce
  db.forEach(function (c: clause) {
    result += '[';

    c.forEach(function(v: variable) {
      result += showVariable(v) + ',';
    })

    // chop off the extra comma
    result = result.substring(0, result.length - 1);
    result += '],';
  })

  // chop off the extra comma
  result = result.substring(0, result.length - 1);
  return result;
}

// todo: make into a class method-type thing
function showVariable(v: variable): string {
  let result: string;

  if (isNot(v)) {
    result += '~p' + v.num.toString();
  } else {
    result += 'p' + v.toString();
  }

  return result;
}
