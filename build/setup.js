//Import Libraries//
var fs = require ('fs-extra')
var cp = require ('child_process')
var sql = require ('sqlite3').verbose()

//Backup Current Databse
fs.copySync ("data.db", `build/bkp/data_copy_${Date.now()}.db`)

//Replace with Blank Database//
cp.execSync ("rm data.db")
cp.execSync ("sqlite3 data.db < build/create_db.sql")

var db = new sql.Database ('data.db') //Database Loaded Here//
var wdb = new sql.Database ('data.db')
db.configure('busyTimeout', 60000)

//Set Permissions
cp.execSync("chmod -R 777 ../illevo")

//Populate with Required (Meta)Data//

//db.serialize ( function () {
  wdb.exec ("begin exclusive transaction")
  cmd = ""
  for (const color of ["black","blue","red"]) {
    for (const shape of ["circle","square","triangle"]) {
      for (const motion of ["right", "zigzag", "spin"]) {
        cmd+=`insert into stimuli (color, shape, motion) values ('${color}','${shape}','${motion}');`
      }
    }
  }
  wdb.exec(cmd)
  wdb.run ("insert into meta (var, val) values ('open_female_lines', '[1,2,3]')")
  wdb.run ("insert into meta (var, val) values ('open_male_lines', '[4,5,6]')")
  wdb.exec ("commit transaction")

//})
//Test Database Read and Save Stimuli Record

i = 30
while (i>0) {

db.exec ("begin transaction")
//db.serialize ( function () {
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
db.exec ("commit transaction")

db.exec ("begin transaction")
  db.all("select * from meta", function (err, rows) {
    let male = JSON.parse(rows[0].val)
    let female = JSON.parse(rows[1].val)
    console.log("Male and Female Lineages\n")
    console.log("-------------------------\n")
    console.log(male)
    console.log(female)
    console.log("\n")
    console.log("Should Be Numeric")
    console.log("-------------------------\n")
    console.log(typeof(male[0]))
  })
db.exec ("commit transaction")

i -= 1}

//})
