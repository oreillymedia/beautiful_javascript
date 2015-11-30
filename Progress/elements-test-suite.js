function assert(expr) {
  return !!expr;
}

function fixture() {
  var div = document.createElement("div");
  var li = document.createElement("li");
  var ul = document.createElement("ul");

  div.appendChild(document.createElement("span"));
  div.firstElementChild.textContent = "test text content";

  div.appendChild(ul.cloneNode());
  div.lastElementChild.appendChild(li.cloneNode());

  div.appendChild(ul.cloneNode());
  div.lastElementChild.appendChild(li.cloneNode());

  return div;
}

var tests = {
  "The Elements class prototype": function() {
    var elems = new Elements();
    var methods = [
    "addClass", "attr", "css", "html",
    "filter", "forEach", "indexOf", "push", "slice", "sort"
    ];

    return methods.reduce(function(result, method) {
      return typeof Elements.prototype[method] === "function";
    }, true);
  },
  "Zero length instance": function() {
    var elems = new Elements();

    return assert(elems.length === 0);
  },
  "Elements from Elements": function(fixture) {
    var elems = new Elements(new Elements([fixture]));

    return assert(elems.length === 1);
  },
  "One match will have a length of 1 (no context)": function() {
    var elems = new Elements("body");

    return assert(elems.length === 1);
  },
  "One match will have a length of 1": function(fixture) {
    var elems = new Elements("span", fixture);

    return assert(elems.length === 1);
  },
  "Two matches will have a length of 2": function(fixture) {
    var elems = new Elements("ul", fixture);

    return assert(elems.length === 2);
  },
  "Add a class": function(fixture) {
    var elems = new Elements("span", fixture);

    elems.addClass("foo");

    return assert(elems[0].className === "foo");
  },
  "Set and get an attribute": function(fixture) {
    var elems = new Elements("span", fixture);

    elems.attr("id", "foo");

    return assert(elems.attr("id") === "foo");
  },
  "Set and get a css style property": function(fixture) {
    var elems = new Elements("span", fixture);

    elems.css("color", "red");

    return assert(elems.css("color") === "red");
  },
  "Set and get some html": function(fixture) {
    var elems = new Elements("span", fixture);
    var html = "<span>hi!</span>";

    elems.html(html);

    return assert(elems.html() === html);
  },
  "Filtering produces a new instance": function(fixture) {
    var elems = new Elements("*", fixture);
    var filtered = elems.filter(Boolean);

    return assert(filtered instanceof Elements) &&
      assert(filtered !== elems);
  },
  "Filter with a dummy predicate": function(fixture) {
    var elems = new Elements("*", fixture);
    var filtered = elems.filter(Boolean);

    return assert(filtered.length === elems.length) &&
      assert(filtered instanceof Elements) &&
      assert(filtered !== elems);
  },
  "Filter with a predicate": function(fixture) {
    var elems = new Elements("*", fixture);
    var filtered = elems.filter(function(elem) {
      return elem.nodeName.toLowerCase() === "span";
    });

    return assert(filtered.length === 1);
  },
  "Invocation forEach item in the list": function(fixture) {
    var elems = new Elements("*", fixture);
    var calls = 0;
    elems.forEach(function(elem) {
      calls++;
    });

    return assert(calls === 5);
  },
  "Find the indexOf an element": function(fixture) {
    var elems = new Elements("*", fixture);

    return assert(elems.indexOf(fixture.firstElementChild) === 0);
  },
  "Push an element onto the list": function(fixture) {
    var elems = new Elements("*", fixture);
    elems.push(fixture.firstElementChild);

    return assert(elems.length === 6);
  },
  "Push returns the instance, not the length": function(fixture) {
    var elems = new Elements("*", fixture);
    elems.push(fixture.firstElementChild);

    return assert(elems.push(fixture.firstElementChild) === elems);
  },
  "Slicing produces a new instance": function(fixture) {
    var elems = new Elements("*", fixture);
    var sliced = elems.slice(1);

    return assert(sliced instanceof Elements) &&
      assert(sliced !== elems);
  },
  "Slice a list of elements": function(fixture) {
    var elems = new Elements("*", fixture);
    var sliced = elems.slice(1);

    return assert(sliced.length === 4);
  },
  "Sort a list of elements by nodeName": function(fixture) {
    var elems = new Elements("*", fixture);
    elems.sort(function(a, b) {
      if (a.nodeName < b.nodeName) {
        return -1;
      }
      if (a.nodeName > b.nodeName) {
        return 1;
      }
      return 0;
    });

    return assert(elems[0].nodeName === "LI") &&
      assert(elems[2].nodeName === "SPAN") &&
      assert(elems[3].nodeName === "UL");
  }
};

Object.keys(tests).forEach(function(message) {
  var result = tests[message](fixture());
  var response = (result ? "Pass" : "Fail") + ": " + message;

  console.log(response);
});

console.log("tests complete");