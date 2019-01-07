// Receive generated nodes at each level
function addNodes(nodes) {
    // nodes :: { int: string }
    for (var index in nodes) {
        if (nodes.hasOwnProperty(index)) {
            s.graph.addNode({ id: index.toString(), label: nodes[index] });
        }
    }
    // Reposition all nodes
    var numNodes = s.graph.nodes().length;
    var sizeOddRows = numNodes < 13 ? 3 : 5;
    var sizeEvenRows = numNodes < 13 ? 2 : 4;
    var numRows = Math.ceil(numNodes / (sizeOddRows + sizeEvenRows)) * 2;
    s.graph.nodes().forEach(function (node, i, a) {
        var locInTwoRows = i % (sizeOddRows + sizeEvenRows);
        // check if it's in the first or the second of the two rows
        var inOddRow = locInTwoRows < sizeOddRows;
        var colNumber = inOddRow ? locInTwoRows : locInTwoRows - sizeOddRows;
        // columns should be tapered -- even rows start a bit more in and end a little more in
        if (!inOddRow) {
            colNumber += colNumber < (sizeEvenRows / 2) ? .33 : .66;
        }
        var rowNumber = Math.floor(i / (sizeOddRows + sizeEvenRows)) * 2;
        rowNumber += inOddRow ? 0 : 1;
        // slightly move down every other node in each row, unless that row only
        // has two
        rowNumber += (sizeEvenRows > 2 || locInTwoRows < sizeOddRows) && (Math.floor(colNumber) % 2 !== 0) ? 0.5 : 0;
        node.x = colNumber / (sizeOddRows - 1);
        node.y = rowNumber / numRows;
        node.size = 1;
    });
    s.render();
    s.refresh();
}
function addEdges(edges) {
    if (Object.keys(edges).length !== 0) {
        var _loop_1 = function (key) {
            if (edges.hasOwnProperty(key)) {
                edges[key].map(function (target) {
                    s.graph.addEdge({
                        id: key.toString().concat(target.toString()),
                        source: key.toString(),
                        target: target.toString(),
                        size: 10,
                        type: "arrow"
                    });
                });
            }
        };
        for (var key in edges) {
            _loop_1(key);
        }
    }
    s.render();
    s.refresh();
}
