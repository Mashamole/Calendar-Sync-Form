var dateObj = new Date("October 15, 1996 02:50");

var b = dateObj.toISOString();

console.log(b);

var time = "9:35:32.000";
var i = 0;
var iso = "";
for (i = 0; i < b.length; ++i) {
  if (i < 10) {
    // process.stdout.write(b[i]);
    iso += b[i];
  }
}

iso = iso + "T" + time + "Z";
console.log(iso);
// var bx = [];
