socket = io.connect()

$("#agree").click( function() {
  user_name = localStorage.illevo_user_name
  socket.emit( 'consent', user_name, function (response) {
    if (response == 'consent') {
      localStorage.illevo_consent = 1
      if (response.gender) {
        document.location.href="instructions.html"
      }
      else if (!response.gender) {
        document.location.href="survey.html"
      }
    }
  })
})


$("#decline").click( function() {
  document.location.href="http://www.google.com/"
})
