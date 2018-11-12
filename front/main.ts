function init() {
  var sigRoot = document.getElementById('sigma-example');
  var sigInst = sigma.init(sigRoot);
  sigInst.addNode('hello',{
    label: 'Hello',
    x: 10,
    y: 10,
    size: 5,
    color: '#ff0000'
  }).addNode('world',{
    label: 'World !',
    x: 20,
    y: 20,
    size: 3,
    color: '#00ff00'
  }).addEdge('hello_world','hello','world').draw();
}

if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', init, false);
} else {
  window.onload = init;
}
