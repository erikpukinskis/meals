var library = require("module-library")(require)

library.using(
  ["web-host", "./"],
  function(host, renderMeals) {
    host.onSite(function(site) {
      renderMeals.prepareSite(site)
    })

    host.onRequest(function(getBridge) {
      renderMeals(getBridge())
    })
  }
)
