raw_data = {}
data = {}
plot = []

function init(){
  socket = io()
  socket.emit('get_view', function(data){
    raw_data = data
    calculate()
  })
}

function dist(a, b){
  if(a.length == 0) return b.length;
  if(b.length == 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

function calculate(){
  for (let l of [0,1,2,3,4,5,6]){
    data[l]={}
    for (let g of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]){
      data[l][g] ={}
      for (let s of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26])
        data[l][g][s] = ""
    }
  }
  for (let entry of raw_data) {
    data[entry.lineage][entry.generation][entry.stimuli]=entry.word
  }
  for (let l of [1,2,3,4,5,6]){
    var next_line = { name:`Lineage ${l} - ${l in [0,1,2,3] ? 'female' : 'male'}`}
    next_line['x'] = []
    next_line['y'] = []
    for (let g of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]){
      if ( data[l][g][1] != ""){
        var err = 0.0
        for (let s of  [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]) {
          err += dist(data[l][g-1][s], data[l][g][s])
        }
        err /= 26
        next_line['x'].push(g)
        next_line['y'].push(err)
      }

    }
    if (next_line['x'] != []) {plot.push(next_line)}
  }
  var layout = {
  title: 'Transmission Error by Generation',
  mode:"line",
  xaxis: {
    title: 'Generation',
  },
  yaxis: {
    title: 'Mean Edit Distance to Prior Generation',
  }
};

  Plotly.newPlot('chart', plot, layout)
}
