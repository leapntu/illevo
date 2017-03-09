socket = io.connect()
function enter () {
  gender = localStorage.illevo_gender
  socket.emit('join_lineage', gender, function (response) {
    if (response == 'closed') {alert("All sessions are curently full. Please try again in 10-15 minutes.")}
    else {
      localStorage.illevo_lineage = response.lineage
      localStorage.illevo_generation = response.generation
      console.log("entering task")
      document.location.href="../html/task.html"
    }
  })
}
