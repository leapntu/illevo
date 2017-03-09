socket = io()

function newUser () {
  let user_name = document.getElementById("user_name").value
  let password = document.getElementById("password").value
  socket.emit('new_user', user_name, password, function(response){
    console.log(response)
    if (response == 'added') { login() }
    else if (response == 'taken') {alert("That user name has already been taken. Please try another.")}
  })
}
function login () {
  var user_name = document.getElementById("user_name").value
  var password = document.getElementById("password").value
  socket.emit('login', user_name, password, function(response){
    console.log(response)
    if (response && response.pwd == password) {
      localStorage.illevo_user_name = response.login
      localStorage.illevo_gender = response.gender
      localStorage.illevo_consent = response.consent
      localStorage.illevo_user_id = response.id
      if (response.consent != 1) {
        console.log("needs consent"); document.location.href="html/consent.html"
      }
      else if (!response.gender) {
        console.log("needs gender"); document.location.href="html/survey.html"
      }
      else if (response.gender && response.consent == 1) {
        document.location.href="html/instructions.html"}
    }
    else {alert("Your password and user name do not match.")}
  })
}

// socket.on("render", function(js_src, html){
//   //console.log(html)
//   document.body.innerHTML=""
//   //current_js = document.createElement("script")
//   //current_js.src=js_src
//   //document.body.appendChild(current_js)
//   document.write(html)
// })

localStorage.illevo_lineage = 0
localStorage.illevo_consent = 0
localStorage.illevo_gender = null
localStorage.illevo_user_name = null
localStorage.illevo_user_id = 0
