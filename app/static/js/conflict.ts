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

  updateEducationalExplanation("all_uips");
}

function getClosestUIP() {
  // only the closest uip remains red
  s.graph.nodes().forEach(function(node) {
    if (conflict_info.right_uip !== node.label) {
      node.color = '#357EDD'
    }
    node.size = 1;
  });

  s.render()

  let thisButton = document.getElementById("conflict_getUIP") as HTMLElement;
  thisButton.style.display = "none";

  let nextButton = document.getElementById("conflict_showCut") as HTMLElement;
  nextButton.style.display = "inline-flex";

  updateEducationalExplanation("uip");
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

  // Recolor all the edges going into the cut as yellow
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

  updateEducationalExplanation("cut");
}

function addConflictClause() {
  s.graph.clear();
  s.refresh();

  // to-do: add button to view propagation as a separate step
  addNodes(conflict_info.pre_prop_state.pre_prop_nodes);
  addEdges(conflict_info.pre_prop_state.pre_prop_edges);
  updateClauseDatabaseState(conflict_info.pre_prop_state.pre_prop_all_clauses, conflict_info.pre_prop_state.pre_prop_clause_sat);

  s.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 1.5 });
  s.refresh();
  s.render();

  updateEducationalExplanation("conflict_clause");
  // need to do this manually
  updateLevel(next_conflict_response.state.level);

  let thisButton = document.getElementById("conflict_addConflictClause") as HTMLElement;
  thisButton.style.display = "none";

  let nextButton = document.getElementById("conflict_propagate") as HTMLElement;
  nextButton.style.display = "inline-flex";
}

function propagatePostConflict() {
  hideConflictUI();

  let thisButton = document.getElementById("conflict_propagate") as HTMLElement;
  thisButton.style.display = "none";

  showSelectionSection();

  processResponse(next_conflict_response);
  updateEducationalExplanation("propagate");
}
