"use script"

// This is a commented version of oddweb, a static site generator
// that was mentioned in Beautiful JavaScript (O'Reilly 2015)
//
// For the most up-to-date version of this file and its test suite,
// please refer to its original repository: https://github.com/valueof/oddweb

var path = require("path")
var sh = require("shelljs")
var fs = require("fs")
var mime = require("mime")
var handlebars = require("handlebars")
var markdown = require("markdown").markdown
var moment = require("moment")

handlebars.registerHelper("date", function (date, format) {
  return moment(date).format(format)
})

// Our main focus of interest are the following three
// functions: read, build, and write. Each one of them
// takes an object as an argument, modifies the object
// in place and returns the modified object.
//
// The object's signature:
// {
//   src:       string,
//   dev:       boolean,
//   pages:     array,
//   cache:     array,
//   resources: array
// }

// Here we read all the necessary information from
// the disk: templates, supporting files, and so on.
function read(site) {
  var dir = site.dir
  var uid = 0

  // All pages are in the directory named 'pages'. Each
  // page may contain meta information before the template
  // so we check to see if the file starts with an opening
  // brace. If it does, we parse it as JSON, extract the
  // meta data and make necessary modifications.
  site.pages = sh.ls("-R", path.join(dir, "pages"))
  site.pages = site.pages.reduce(function (acc, file) {
    var ap = path.join(dir, "pages", file)

    if (sh.test("-d", ap))
      return acc

    var data = sh.cat(ap)
    var meta = {}

    if (data.trim()[0] === "{") {
      data = data.split("\n\n")
      meta = JSON.parse(data[0])
      data = data.slice(1).join("\n\n")
    }

    // Add runtime data to the meta object.
    meta.id   = uid++
    meta.type = path.extname(file).slice(1)
    meta.path = meta.type === "md" ? file.replace(/\.\S+$/, ".html") : file

    // Each page can declare alternative URL (useful for
    // legacy links) so we should respect it.
    if (meta.altUrl) {
      meta.altPath = normalize(meta.altUrl, meta.path)

      if (path.extname(meta.altPath) === "")
        meta.altPath = path.join(meta.altPath, "index.html")
    }

    if (meta.url)
      meta.path = normalize(meta.url, meta.path)
    else
      meta.url = "/" + meta.path

    if (path.extname(meta.path) === "")
      meta.path = path.join(meta.path, "index.html")

    if (meta.template && path.extname(meta.template) === "")
      meta.template = meta.template + ".html"

    return acc.concat({ meta: meta, data: data })
  }, [])

  // We want to read templates once and then access them
  // from memory in any of the functions that might follow.
  site.cache = sh.ls("-R", path.join(dir, "templates"))
  site.cache = site.cache.reduce(function (acc, file) {
    var ap = path.join(dir, "templates", file)

    if (sh.test("-d", ap) || path.extname(ap) !== ".html")
      return acc

    acc[file] = sh.cat(ap)
    return acc
  }, {})

  // The same logic applies to supporting files: functions
  // that might follow should have quick access to them without
  // having to know where on the disk these files are located.
  site.resources = sh.ls("-R", path.join(dir, "res"))
  site.resources = site.resources.reduce(function (acc, file) {
    var ap = path.join(dir, "res", file)

    if (sh.test("-d", ap))
      return acc

    var meta = { path: file, binary: !/^text\//.test(mime.lookup(file)) }
    var data = meta.binary ? fs.readFileSync(ap, { encoding: "binary" }) : sh.cat(ap)

    return acc.concat({ meta: meta, data: data })
  }, [])

  return site
}

// This function builds the site: it compiles all templates,
// executes plugins, and so on.
function build(site) {
  var src     = path.resolve(site.src)
  var config  = path.join(src, "package.json")
  var plugins = require(config).oddwebPlugins || []

  // Since we're working with a state that is represented
  // by a simple object, the following nine lines of code
  // are everything we need for a working plugin system.
  // Each plugin mirrors this function: it takes an object,
  // modifies it, and returns it back to us.
  //
  // For example, here's a plugin that replaces word 'cloud'
  // with 'cat' on all pages:
  //
  // module.exports = function (site, handlebars) {
  //   site.pages = site.pages.map(function (page) {
  //     page.data = page.data.replace(/cloud/g/, "cat")
  //     return page
  //   })
  //
  //   return site
  // }
  site = plugins.reduce(function (acc, plugin) {
    if (/^core\//.test(plugin))
      return require(path.join(path.dirname(module.filename), plugin) + ".js")(acc, handlebars)

    if (path.extname(plugin) === ".js")
      return require(path.join(src, plugin))(acc, handlebars)

    return require(path.join(src, "node_modules", plugin))(acc, handlebars)
  }, site)

  // This is 'the core' of oddweb where we compile templates
  // and Markdown files.
  site.pages = site.pages.map(function (page) {
    if (page.meta.skip)
      return page

    switch (page.meta.type) {
    case "xml":
    case "html":
      page.data = handlebars.compile(page.data)({ page: page.meta, site: site })
      break
    case "md":
      var html = []
      var tmp  = page.data.split("\n\n").map(function (block) {
        if (block.trim()[0] === "<")
          return "$" + (html.push(block) - 1) + "$"
        return block
      }).join("\n\n")

      page.data = markdown.toHTML(tmp).split("\n\n").map(function (block) {
        if (/^<p>\$\d+\$<\/p>$/.test(block))
          return html[block.slice(4, block.length - 5)]
        return block
      }).join("\n\n")

      if (!page.meta.url)
        page.meta.path = page.meta.path.replace(/\.md$/, ".html")
    }

    if (page.meta.template) {
      page.data = handlebars.compile(site.cache[page.meta.template])({
        content: new handlebars.SafeString(page.data),
        page:    page.meta,
        site:    site
      })
    }

    return page
  })

  return site
}

// Finally, a function to write our generated site
// to disk. It's pretty straightforward. We're generating
// a static site so its file hierarchy reflects its URL
// hierarchy.
function write(site) {
  function prep(root, p) {
    var dir = path.join(root, path.dirname(p))

    if (!sh.test("-e", dir))
      sh.mkdir("-p", dir)

    return path.join(root, p)
  }

  function wrt(list, root) {
    list.forEach(function (item) {
      var ap = prep(root, item.meta.path)

      if (item.meta.binary)
        fs.writeFileSync(ap, item.data, { encoding: "binary" })
      else
        item.data.to(ap)

      if (item.meta.altPath)
        ("<html><meta http-equiv=refresh content='0;" + item.meta.url + "'></html>").to(prep(root, item.meta.altPath))
    })
  }

  wrt(site.pages, path.resolve(path.join(site.src, "site")))
  wrt(site.resources, path.resolve(path.join(site.src, "site", "res")))

  return site
}

module.exports = {
  read: read,
  build: build,
  write: write
}

// Usage example:
//
// var oddweb = require('oddweb')
// var site = { dir: '/path/to/dir', dev: false }
//
// oddweb.write(oddweb.build(oddweb.read(site)))
