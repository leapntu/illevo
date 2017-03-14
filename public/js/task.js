//DOM//
window.addEventListener("beforeunload", function (event) {
  // socket.emit('free_lineage', localStorage.illevo_lineage, function(response){
  //   console.log(`leaving ${localStorage.illevo_lineage}`)
    localStorage.illevo_lineage = 0
    localStorage.illevo_ready = 0
  // })
})

if (localStorage.illevo_lineage == 0) {document.location.href = "http://www.google.com"}

document.addEventListener("keydown", handle_key)

function handle_key(e) {
  if (mode == 'msg' && e.keyCode == 32) { mode = ''; scene += 1; handleScene()}
  if (mode == 'tst' && e.keyCode == 13) { mode = ''; validate(document.getElementById("response").value.trim())}
  if (mode == 'warn' && e.keyCode == 32) { mode = ''; stim_i -= 1, playTestItems()}
}


//GLOBALS//
var stage
var stimuli = {}
var socket = io.connect()
var mode = ''
var scene = 0
var stim_i
var seen = []
var unseen = []
var test_stims = []
var test_responses = []
var round_1 = []
var round_2 = []
var round_3 = []

//Setup App//
function init () { //initialize objects for createjs library onload of body
  socket.emit('register_start', localStorage.illevo_lineage)
  stage = new createjs.Stage("canvas")
  createjs.Ticker.setFPS(60)
  createjs.Ticker.addEventListener("tick", stage)
  createAssets()
}

function createAssets () {
  colors = {
    "black": "grey",
    "blue": "blue",
    "red": "red"
  }

  shapes = {
    "circle": function (obj) {
      obj.graphics.beginStroke("black")
      obj.graphics.drawCircle(0, 0, 50)
      obj.graphics.moveTo(obj.regX - 50,obj.regY).lineTo(obj.regX + 50,obj.regY)
    },
    "square": function (obj) {
      obj.regX = 50
      obj.regY = 50
      obj.graphics.beginStroke("black")
      obj.graphics.drawRect(0, 0, 100, 100);
    },
    "triangle": function (obj) {
      obj.regX = 50
      obj.regY = 68
      obj.graphics.beginStroke("black")
      obj.graphics.moveTo(50, 0)
        .lineTo(0, 100)
        .lineTo(100, 100)
        .lineTo(50, 0)
    }
  }

  motions = {
    "right": function () {
      this.x = 80
      this.y = stage.canvas.height / 2
      createjs.Tween.get(this, {loop: true}).
      to({x:700},2500,createjs.Ease.getPowInOut(4))
      .to({x:80},0)
      .to({x:700},2500,createjs.Ease.getPowInOut(4))
    },
    "zigzag": function () {
      this.x = 80
      this.y = stage.canvas.height / 2
      createjs.Tween.get(this, {loop: true})
      .to({x:220, y:85}, 500)
      .to({x:340, y:320}, 500)
      .to({x:460, y:85}, 500)
      .to({x:580, y:320}, 500)
      .to({x:700, y:85}, 500)
      .to({x:80, y: stage.canvas.height / 2},0)
      .to({x:220, y:85}, 500)
      .to({x:340, y:320}, 500)
      .to({x:460, y:85}, 500)
      .to({x:580, y:320}, 500)
      .to({x:700, y:85}, 500)
    },
    "spin": function () {
      this.centerCanvas()
      this.y -= 50
      this.rotation = 0
      createjs.Tween.get(this, {loop: true})
      .to({rotation:360},5000)
    }
  }

  function renderLoadScreen () {
    var msg = "Loading, please wait..."
    var style = "50px Arial"
    var loading_message = new createjs.Text(msg, style)
    loading_message.centerReg().centerCanvas()
    stage.addChild(loading_message)
    stage.update()
  }

  renderLoadScreen()

  var i = 1
  var new_stimuli = {}
  for (const color of ["black","blue","red"]) {
    for (const shape of ["circle","square","triangle"]) {
      for (const motion of ["right", "zigzag", "spin"]) {
        new_stimuli = new createjs.Shape()
        new_stimuli.graphics.beginFill(colors[color])
        shapes[shape](new_stimuli)
        new_stimuli["motion"] = motions[motion]
        stimuli[i] = new_stimuli
        i += 1
      }
    }
  }

  socket.emit("get_words", localStorage.illevo_lineage, localStorage.illevo_generation, function (response) {
    console.log(response)
    var style = "50px Arial"
    for (let item of response) {
      stimuli[item.stimuli]["signal"] = new createjs.Text(item.word, style)
    }
    j = 1
    js = []
    while (j <= 27) {js.push(j); j += 1}
    js = shuffle(shuffle(shuffle(js)))
    seen = js.slice(0,15)
    unseen = js.slice(15, 28)
    beginTask()
  })


}

function beginTask() {
  stage.removeAllChildren()
  begin_msg = makeMessage("Try your best to learn the alien language.\nPress space to begin.")
  stage.addChild(begin_msg)
  mode = 'msg'
}

function handleScene() {
  stage.removeAllChildren()
  createjs.Tween.removeAllTweens()
  document.getElementById("production_controls").style.visibility = "hidden"

  if (scene == 1) {
    stim_i = -1
    seen = shuffle(shuffle(seen))
    playSeens()
  }

  if (scene == 2) {
    pretest_msg = makeMessage("You will now see a number of items, and be asked to type the word for it. \nPress space to begin, and enter to submit each answer.")
    stage.addChild(pretest_msg)
    mode = 'msg'
  }

  if (scene == 3) {
    document.getElementById("production_controls").style.visibility = "visible"
    stim_i = -1
    test_stims = []
    test_responses = []
    seen = shuffle(shuffle(seen))
    unseen = shuffle(shuffle(unseen))
    j = 7
    while (j > 0) {
      test_stims.push(seen[j])
      test_stims.push(unseen[j])
      j -= 1
    }
    test_stims = shuffle(shuffle(test_stims))
    playTestItems()
  }

  if (scene == 4) {
    posttest_msg = makeMessage("Good Job! That completes one of three rounds. \nPress space to begin round 2.")
    stage.addChild(posttest_msg)
    mode = 'msg'
  }

  if (scene == 5) {
    stim_i = -1
    seen = shuffle(shuffle(seen))
    playSeens()
  }

  if (scene == 6) {
    pretest2_msg = makeMessage("You will now see a number of items again, and be asked to type the word for it. \nPress space to begin, and enter to submit each answer.")
    stage.addChild(pretest2_msg)
    mode = 'msg'
  }

  if (scene == 7) {
    document.getElementById("production_controls").style.visibility = "visible"
    stim_i = -1
    test_stims = []
    test_responses = []
    seen = shuffle(shuffle(seen))
    unseen = shuffle(shuffle(unseen))
    j = 7
    while (j > 0) {
      test_stims.push(seen[j])
      test_stims.push(unseen[j])
      j -= 1
    }
    test_stims = shuffle(shuffle(test_stims))
    playTestItems()
  }

  if (scene == 8) {
    posttest2_msg = makeMessage("Good Job! That completes two of three rounds.\nOne more to go~ \nPress space to begin round 3.")
    stage.addChild(posttest2_msg)
    mode = 'msg'
  }

  if (scene == 9) {
    stim_i = -1
    seen = shuffle(shuffle(seen))
    playSeens()
  }

  if (scene == 10) {
    pretest3_msg = makeMessage("You will now see a number of items one final time, and be asked to type the word for it. \nPress space to begin, and enter to submit each answer.")
    stage.addChild(pretest3_msg)
    mode = 'msg'
  }

  if (scene == 11) {
    document.getElementById("production_controls").style.visibility = "visible"
    stim_i = -1
    test_stims = []
    test_responses = []
    j = 27
    while (j >= 1) {
      test_stims.push(j)
      j -= 1
    }
    test_stims = shuffle(shuffle(test_stims))
    playTestItems()
  }

  if (scene == 12) {
    socket.emit('record_data', round_3, localStorage.illevo_lineage, localStorage.illevo_generation, localStorage.illevo_user_id ,function(){
      posttest3_msg = makeMessage("Good Job - That completes The study!.\n Thank you for your time and feel free to\nclose the browser tab when you are done.\n\n If you would like to learn more about this study,\n please visit http://54.169.226.46/html/about.html")
      stage.addChild(posttest3_msg)
    })
  }

}


function playSeens() {
  stim_i += 1
  if (stim_i >= seen.length) {
    scene += 1
    handleScene()
  }
  else {
    playSeen(stimuli[seen[stim_i]])
  }
}

function playSeen(stim) {
  function textPop(txt){
    stage.removeAllChildren()
    txt.centerReg()
    txt.centerCanvas()
    txt.y += 100
    stage.addChild(txt)
    var popTime = 100
    createjs.Tween.get(txt)
    .to({color:"red"},1)
    .to({color:"slate"},popTime)
    .to({color:"red"},popTime)
    .to({color:"slate"},popTime)
  }

  function animate() {
    stage.addChild(stim)
    stim.motion()
  }

  function removeVisual () {
    stage.removeChild(stim)
  }

  createjs.Tween.removeAllTweens()
  var first = 2000
  var second = 5000
  var third = 1000
  createjs.Tween.get(stim)
  .call(textPop, [stim.signal]).wait(first)
  .call(animate).wait(second)
  .call(removeVisual).wait(third)
  .call(playSeens)
}

function playTestItems() {
  stim_i += 1
  if (stim_i >= test_stims.length) {
    scene += 1
    handleScene()
  }
  else {
    document.getElementById('response').value = ""
    playTestStim(stimuli[test_stims[stim_i]])
  }
}

function playTestStim(stim) {
  mode = 'tst'
  stage.removeAllChildren()
  createjs.Tween.removeAllTweens()
  stage.addChild(stim)
  stim.motion()
}

function validate(str) {
  function warn(type){
    var warningText
    if(type == 'english'){ warningText = "You cannot use English words!\n\nYou must try and use the alien language you learned,\nor if you didn't see a pattern,\nimmitate how it sounds.\n\nIf you think you don't have the time for this now,\nplease close this window and try again later.\n\nOtherwise, press space to return to the questions."}
    if(type == 'phon'){warningText = "You are using symbols not found in the alien language.\n\nUse fragments you remember or imitate the sounds you read if you are having trouble.\n\nIf you think you don't have the time for this now,\nplease close this window and try again later.\n\n\nJust a reminder, the symbols used were:\n\na  i  u  k  t  p  n \n\n\nPress space to return to the questions."}
    if(type == 'blank'){warningText = "You didn't enter anything. \n\nIf you think you don't have the time for this now,\nplease close this window and try again later.\n\nOtherwise, press space to return to the questions"}
    if(type == 'dup'){warningText = "You have already used that word.\n\nTake a moment to think of an alternative alien response.\n\nPress space to return to the questions."}
    var warningMessage = makeMessage(warningText)
    warningMessage.y = (stage.canvas.height / 2) - 150
    stage.removeAllChildren()
    stage.addChild(warningMessage)
    mode = 'warn'
  }

  function isBlank(word){
    if(word == ""){return true}
    else{return false}
  }

  function isEnglish(word){
    var word = word.split(' ').join('').toLowerCase()
    var blocked = ["rectangle","circle","red","blue","solid","square","shape","round","straight","line","black"]
    return isInArray(word, blocked)
  }

  function isPhonological(word){
    var sylls = ["a", "i", "u", "k", "t", "p", "n"]
    var charList = word.split("")
    return andArray(
      charList.map(
        function(char){return isInArray(char,sylls)}
      )
    )
  }

  function isDuplicate(word){
    return isInArray(word, test_responses)
  }

  function isValidResponse(response){
    if(isEnglish(response)){warn('english')}
    else if(! isPhonological(response)){warn('phon')}
    else if(isBlank(response)){warn('blank')}
    else if(isDuplicate(response)){warn('dup')}
    else{return true}
  }

  if(isValidResponse(str)) {
    test_responses.push(str)
    if (scene == 3) {
      round_1.push( {"stimuli": test_stims[stim_i], "signal": str} )
      playTestItems()
    }
    if (scene == 7) {
      round_2.push( {"stimuli": test_stims[stim_i], "signal": str} )
      playTestItems()
    }
    if (scene == 11){
      round_3.push( {"stimuli": test_stims[stim_i], "signal": str} )
      playTestItems()
    }
  }
}

function makeMessage(text) { //take a string and return a createjsText object for messages to display to user
  stimuliObject = new createjs.Text(text, "20px Times", "slate")
  stimuliObject.x = 20
  stimuliObject.y = stage.canvas.height / 2
  return stimuliObject
}

//Utility Functions
function shuffle(array) { //Simple Fisher-Yates shuffle: start at the end of the list, walk through each item and swap it with another random spot in the list
  var currentIndex = array.length, temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array;
}

function centerReg () {
  this.regX = this.getMeasuredWidth() / 2
  this.regY = this.getMeasuredHeight() / 2
  return this
}

function centerCanvas () {
  this.x = stage.canvas.width / 2
  this.y = stage.canvas.height / 2
  return this
}

createjs.DisplayObject.prototype.centerReg = centerReg
createjs.DisplayObject.prototype.centerCanvas = centerCanvas

function test_database_update () {
  var consonants = ["t","k","n","p","t","k","n","p"]
  var vowels = ["a","i","u","a","i","u"]
  var sylls = [2,3,4,2,3,1]
  var words = []

  function shuffle(array) { //Simple Fisher-Yates shuffle: start at the end of the list, walk through each item and swap it with another random spot in the list
    var currentIndex = array.length, temporaryValue, randomIndex
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
    return array;
  }

  function randomPick(xs){
    return shuffle(shuffle(shuffle(xs)))[0]
  }

  var i = 1
  while (i <= 27) {
    count = randomPick(sylls)
    word = ""
    while (count > 0){
        word += randomPick(consonants)
        word += randomPick(vowels)
        count -= 1
    }
    unique = 1
    for (const w of words) {
      if (w == word) {unique = 0}
    }
    if (unique == 1) {words.push(word); i += 1}
  }

  test_stims = []
  test_responses = []
  j = 27
  while (j >= 1) {
    test_stims.push(j)
    j -= 1
  }
  test_stims = shuffle(shuffle(test_stims))
  test_responses = words
  zipped = zip(test_stims, test_responses)
  for (const [ts, tr] of zipped){
    round_3.push({"stimuli": ts, "signal": tr})
  }
  scene = 12
  handleScene()
}

//functional

function not(bool){
  return ! bool
}

function isEmpty(array){
  return array.length == 0 ? true : false
}

function cons(value, array){
  var copy = array.slice()
  copy.unshift(value)
  return copy
}

function append(value, array){
  var copy = array.slice()
  copy.push(value)
  return copy
}

function head(array){
  return array.slice(0,1)[0] || []
}

function tail(array){
  return array.slice(1)
}

function first(array){
  return head(array)
}

function second(array){
  return head(tail(array))
}

function map(fn, array){
  return array.map(fn)
}

function fold(fn, initial, array){
  return array.reduce(fn, initial)
}

function all(fn, array){
  return array.every(fn)
}

function any(fn, array){
  return array.some(fn)
}

function isEqual(value, item){
  return value == item
}

function length(array){
  return array.length
}

function arrayEqual(array, item){
  var pairs = zip(array, item)
  function isMatch(pair){return first(pair) == second(pair)}
  return and(map(isMatch, pairs))
}

function and(array){
  return array.every(partial(isEqual,true))
}

function or(array){
  return array.some(partial(isEqual,true))
}

function compose(f, g){
  return function() {
    return f(g.apply(null, arguments))
  }
}

function sequence(){
  var fns = [].slice.call(arguments)
  return fold(compose, head(fns), tail(fns))
}

function partial(fn){
  var args = [].slice.call(arguments)
  return fn.bind.apply(fn, cons(null,tail(args)))
}

function zip(){
  var arrays = [].slice.call(arguments)
  function recurse(result, remaining){
    if (any(isEmpty, remaining)){
      return result
    }
    else {
      var matchings = map(head, remaining)
      var newResult = append(matchings, result)
      var newRemaining = map(tail, remaining)
      return recurse(newResult, newRemaining)
     }
  }
  return recurse([],arrays)
}

function choose(array){
  return array[Math.floor(Math.random() * array.length)]
}

function member(value, array){
  return array.indexOf(value) > 0 ? true : false
}

function arrayMember(array, container){
  return or(map(partial(arrayEqual, array), container))
}

function isInArray(value, array){
  return array.indexOf(value) > -1
}

function andArray(array){
  return ! isInArray(false, array)
}
