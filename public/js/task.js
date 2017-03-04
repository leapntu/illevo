//GLOBALS//
var stage
var stimuli = {}

//Setup App//
function init () { //initialize objects for createjs library onload of body
  stage = new createjs.Stage("canvas")
  createAssets()
}

function createAssets () {
  function renderLoadScreen () {
    var msg = "Loading"
    var style = "50px Arial"
    var loading_message = new createjs.Text(msg, style)
    loading_message.center_reg().center_canvas()
    stage.addChild(loading_message)
    stage.update()
  }

  renderLoadScreen()
}

//Utility Functions

function center_reg () {
  this.regX = this.getMeasuredWidth() / 2
  this.regY = this.getMeasuredHeight() / 2
  return this
}

function center_canvas () {
  this.x = stage.canvas.width / 2
  this.y = stage.canvas.height / 2
  return this
}

createjs.DisplayObject.prototype.center_reg = center_reg
createjs.DisplayObject.prototype.center_canvas = center_canvas
