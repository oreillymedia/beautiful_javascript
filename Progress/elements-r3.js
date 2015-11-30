class Elements extends Array {
  constructor(selector = "", context = document) {
    super();

    let elems;

    this.context = context;

    if (Array.isArray(selector) ||
        selector instanceof Elements) {
      elems = selector;
    } else {
      try {
        elems = this.context.querySelectorAll(selector);
      } catch (e) {
        // Thrown Exceptions caused by invalid selectors
        // is a nuisance.
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

    this.push(...elems);
  }
  addClass(value) {
    return this.forEach(elem => elem.classList.add(value));
  }
  attr(key, value) {
    if (typeof value !== "undefined") {
      return this.forEach(elem => elem.setAttribute(key, value));
    } else {
      return this[0] && this[0].getAttribute(key);
    }
  }
  css(key, value) {
    if (typeof value !== "undefined") {
      return this.forEach(elem => elem.style[key] = value);
    } else {
      return this[0] && this[0].style[key];
    }
  }
  html(html) {
    if (typeof html !== "undefined") {
      return this.forEach(elem => elem.innerHTML = html);
    } else {
      return this[0] && this[0].innerHTML;
    }
  }
  filter(callback) {
    return new Elements(super.filter(callback, this));
  }
  slice(...args) {
    return new Elements(super.slice(...args));
  }
  forEach(callback) {
    super.forEach(callback, this);
    return this;
  }
  push(...elems) {
    super.push(...elems);
    return this;
  }
}
