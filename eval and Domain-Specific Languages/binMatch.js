function binMatch(spec) {
  var totalSize = 0, code = "", match;
  while (match = /^([^:]+):(\w+)(\d+)\s*/.exec(spec)) {
    spec = spec.slice(match[0].length);
    var pattern = match[1], type = match[2], size = Number(match[3]);
    totalSize += size;
  
    if (pattern == "_") {
      code += "pos += " + size + ";";
    } else if (/^[\w$]+$/.test(pattern)) {
      code += "out." + pattern + " = " + binMatch.read[type](size) + ";";
    } else {
      code += "if (" + binMatch.read[type](size) + " !== " +
        pattern + ") return null;";
    }
  }

  code = "if (input.length - pos < " + totalSize + ") return null;" +
    "var out = {end: pos + " + totalSize + "};" + code + "return out;";
  return new Function("input, pos", code);
}

binMatch.read = {
  uint: function(size) {
    for(var exprs=[],i=1;i<=size;++i)
      exprs.push("input[pos++] * " + Math.pow(256, size - i));
    return exprs.join(" + ");
  },
  str: function(size) {
    for(var exprs=[],i=0;i<size;++i)
      exprs.push("input[pos++]");
    return "String.fromCharCode(" + exprs.join(", ") + ")";
  }
};
