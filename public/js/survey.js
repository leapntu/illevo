socket = io.connect()

function survey() {
  user_name = localStorage.illevo_user_name
  gender = document.getElementById('gender').value
  localStorage.illevo_gender = gender
  native = document.getElementById('native').value
  second = document.getElementById('second').value
  age = document.getElementById('age').value
  email = document.getElementById('email').value
  socket.emit('survey', user_name, native, second, age, gender, email, function(response) {
    if(response) {
      document.location.href="instructions.html"
    }
  })
}
