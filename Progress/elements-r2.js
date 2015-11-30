function Elements(selector, context) {
  Array.call(this);

  var elems;

  this.context = context || document;

  if (Array.isArray(selector) || selector instanceof Elements) {
    elems = selector;
  } else {
    try {
      elems = this.context.querySelectorAll(selector || "");
    } catch (e) {
      elems = [];
    }
  }

  if (!elems) {
    // elems is either:
    //   - undefined because the selector was invalid
    //      resulting in a thrown exception
    //   - null because the querySelectorAll returns
    //      null instead of an empty object when no
    //      matching elements are found.
    elems = []
  }

  this.push.apply(this, elems);
}

Elements.prototype = Object.create(Array.prototype);
Elements.prototype.constructor = Elements;

Elements.prototype.addClass = function(value) {
  this.forEach(function(elem) {
    elem.classList.add(value);
  });

  return this;
};
Elements.prototype.attr = function(key, value) {
  if (typeof value !== "undefined") {
    this.forEach(function(elem) {
      elem.setAttribute(key, value);
    });

    return this;
  } else {
    return this[0] && this[0].getAttribute(key);
  }
};
Elements.prototype.css = function(key, value) {
  if (typeof value !== "undefined") {
    this.forEach(function(elem) {
      elem.style[key] = value;
    });

    return this;
  } else {
    return this[0] && this[0].style[key];
  }
};
Elements.prototype.html = function(html) {
  if (typeof html !== "undefined") {
    this.forEach(function(elem) {
      elem.innerHTML = html;
    });
    return this;
  } else {
    return this[0] && this[0].innerHTML;
  }
};
Elements.prototype.filter = function() {
  return new Elements([].filter.apply(this, arguments));
};
Elements.prototype.slice = function() {
  return new Elements([].slice.apply(this, arguments));
};
Elements.prototype.push = function() {
  [].push.apply(this, arguments);
  return this;
};