function Elements(selector, context) {
  var elems, elem, k;

  selector = selector || "";

  this.context = context || document;

  if (Array.isArray(selector) || selector instanceof Elements) {
    elems = selector;
  } else {
    try {
      elems = this.context.querySelectorAll(selector);
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

  if (elems.length) {
    k = -1;
    while (elem = elems[++k]) {
      this[k] = elem;
    }
  }

  this.length = elems.length;
}

Elements.prototype = {
  constructor: Elements,
  addClass: function(value) {
    this.forEach(function(elem) {
      elem.classList.add(value);
    });

    return this;
  },
  attr: function(key, value) {
    if (typeof value !== "undefined") {
      this.forEach(function(elem) {
        elem.setAttribute(key, value);
      });

      return this;
    } else {
      return this[0] && this[0].getAttribute(key);
    }
  },
  css: function(key, value) {
    if (typeof value !== "undefined") {
      this.forEach(function(elem) {
        elem.style[key] = value;
      });

      return this;
    } else {
      return this[0] && this[0].style[key];
    }
  },
  html: function(html) {
    if (typeof html !== "undefined") {
      this.forEach(function(elem) {
        elem.innerHTML = html;
      });
      return this;
    } else {
      return this[0] && this[0].innerHTML;
    }
  },
  filter: function() {
    return new Elements([].filter.apply(this, arguments));
  },
  forEach: function() {
    [].forEach.apply(this, arguments);
    return this;
  },
  indexOf: function() {
    return [].indexOf.apply(this, arguments);
  },
  push: function() {
    [].push.apply(this, arguments);
    return this;
  },
  slice: function() {
    return new Elements([].slice.apply(this, arguments));
  },
  sort: function() {
    return [].sort.apply(this, arguments);
  }
};