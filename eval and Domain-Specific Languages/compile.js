function compile(template) {
  var code = "var _out = '';", uniq = 0; var parts = template.split("#");
  for (var i = 0; i < parts.length; ++i) {
    var part = parts[i], m;
    if (i % 2) { // Odd elements are templating directives
    if (m = part.match(/^for (\S+) in (.*)/)) {
      var loopVar = m[1], arrayExpr = m[2];
      var indexVar = "_i" + (++uniq), arrayVar = "_a" + uniq;
      code += "for (var " + indexVar + " = 0, " + arrayVar + " = " +
        arrayExpr + ";" + indexVar + "<" + arrayVar + ".length; ++" +
        indexVar + ") {" + "var " + loopVar + " = " + arrayVar +
        "[" + indexVar + "];";
      } else if (m = part.match(/^if (.*)/)) {
        code += "if (" + m[1] + ") {";
      } else if (part == "end") {
        code += "}";
      } else {
        code += "_out += " + part + ";";
      }
    } else if (part) { // Even elements are plain text
      code += "_out += " + JSON.stringify(part) + ";";
    }
  }
  return new Function("$in", code + "return _out;");
}

var template =
  "#$in.title#\n" +
  "==============\n\n" +
  "Items on today's list:\n" +
  "#for item in $in.items#" +
  "* #item.name##if item.note# (Note: #item.note#) #end#\n" +
  "#end#"

var compiled = compile(template)
console.log(compiled({
  title: 'My List',
  items: [
    {name: 'Item one', note: 'Note one'},
    {name: 'Item two', note: 'Note two'}
  ]
}))
//console.log(compile(example)())