//Import Libraries//
var fs = require ('fs-extra')
var cp = require ('child_process')
var sql = require ('sqlite3').verbose()

//Backup Current Databse
if (fs.existsSync("data.db")) {
  fs.copySync ("data.db", `build/bkp/data_copy_${Date.now()}.db`)
  cp.execSync ("rm data.db")
}

//Replace with Blank Database//
cp.execSync ("sqlite3 data.db < build/create_db.sql")

var db = new sql.Database ('data.db') //Database Connections Loaded Here//
var wdb = new sql.Database ('data.db')
db.exec("PRAGMA BUSY_TIMEOUT = 20000")

//Set Permissions
cp.execSync("chmod -R 777 ../illevo")

//Generate Random Intial Words
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
console.log("Words\n\n",words)
//Populate with Required (Meta)Data//
db.exec("insert into users (login, pwd) values ('random','random');")
cmd = ""
//cmd += "begin exclusive transaction;"
wdb.exec("begin exclusive transaction;")
for (const color of ["black","blue","red"]) {
  for (const shape of ["circle","square","triangle"]) {
    for (const motion of ["right", "zigzag", "spin"]) {
      cmd +=`insert into stimuli (color, shape, motion) values ('${color}','${shape}','${motion}');`
    }
  }
}
for (const line of [1,2,3]) {
  cmd += `insert into lineage (condition, generation, open) values ('female', 0, 1);`
  cmd += `insert into dataevents (user, time, lineage, generation) values (1, 0, ${line}, 0);`
  i = 1
  while (i <= 27) {
    cmd += `insert into language (dataevent, stimuli, word) values (${line}, ${i}, '${words[i-1]}');`
    i += 1
  }
}
for (const line of [4,5,6]) {
  cmd += `insert into lineage (condition, generation, open) values ('male', 0, 1);`
  cmd += `insert into dataevents (user, time, lineage, generation) values (1, 0, ${line}, 0);`
  i = 1
  while (i <= 27) {
    cmd += `insert into language (dataevent, stimuli, word) values (${line}, ${i}, '${words[i-1]}');`
    i += 1
  }
}

//cmd += "commit transaction;"
wdb.exec(cmd, function () { console.log(cmd); wdb.exec("commit transaction;") })


//Test Database Read and Save Stimuli Record
db.all("select * from stimuli", function (err, rows) {
    console.log("Stimuli Rows in Database\n")
    console.log("-------------------------\n")
    console.log (rows)
    console.log("\n")
    let stimuli = {}
    for (let row of rows) {
      stimuli[row.id] = row
    }
    fs.outputJson("build/stimuli.json", stimuli)
})
