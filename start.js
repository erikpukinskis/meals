var library = require("module-library")(require)

library.using(
  ["web-host", "./"],
  function(host, renderMeals) {
    host.onRequest(function(getBridge) {
      renderMeals(getBridge())
    })
  }
)
