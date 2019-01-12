function getUIPs() {
    // color all possible uips red
    s.graph.nodes().forEach(function (node) {
        if (conflict_info.all_uips.indexOf(node.label) > -1) {
            node.color = 'red';
        }
    });
    // recolor all the edges to be blue again
    s.graph.edges().forEach(function (edge) { return edge.color = '#357EDD'; });
    s.render();
    var thisButton = document.getElementById("conflict_getUIPs");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_getUIP");
    nextButton.style.display = "inline-flex";
    updateEducationalExplanation("all_uips");
}
function getClosestUIP() {
    // only the closest uip remains red
    s.graph.nodes().forEach(function (node) {
        if (conflict_info.right_uip !== node.label) {
            node.color = '#357EDD';
        }
    });
    s.render();
    var thisButton = document.getElementById("conflict_getUIP");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_showCut");
    nextButton.style.display = "inline-flex";
    updateEducationalExplanation("uip");
}
function showCut() {
    var cut_conflict = conflict_info.cut_conflict.map(function (x) { return x.toString(); });
    // Show all elements on conflict side of cut as red
    s.graph.nodes().forEach(function (node) {
        if (cut_conflict.indexOf(node.id) > -1) {
            node.color = 'red';
        }
        else {
            node.color = '#357EDD';
        }
    });
    // recolor all the edges to be blue again
    s.graph.edges().forEach(function (edge) { return edge.color = '#357EDD'; });
    // Recolor all the edges going into the cut as green
    s.graph.edges().forEach(function (edge) {
        if (cut_conflict.indexOf(edge.target) > -1 && cut_conflict.indexOf(edge.source) <= -1) {
            edge.color = '#FFB700';
        }
    });
    s.render();
    var thisButton = document.getElementById("conflict_showCut");
    thisButton.style.display = "none";
    var nextButton = document.getElementById("conflict_addConflictClause");
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
    var thisButton = document.getElementById("conflict_addConflictClause");
    thisButton.style.display = "none";
    hideConflictUI();
    processResponse(next_conflict_response);
    showSelectionSection();
    updateEducationalExplanation("conflict_clause");
}
