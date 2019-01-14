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
