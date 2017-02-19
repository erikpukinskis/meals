var library = require("module-library")(require)


module.exports = library.export(
  "popup",
  ["web-element", "function-call"],
  function(element, functionCall) {

    function popup(bridge, el) {

      prepareBridge(bridge)

      var toggle = bridge.remember("popup/toggle")

      el.addSelector(".popup")

      var container = element(
        ".popup-container",
        {onclick: toggle.evalable()},
        el
      )

      return container
    }

    function prepareBridge(bridge) {

      if (bridge.remember("popup/toggle")) { return }

      var toggle = bridge.defineFunction(function togglePopup(e) {

        e.preventDefault()
        var containerEl = document.querySelector(".popup-container")

        if (containerEl.classList.contains("open")) {
          document.body.style.overflow = "scroll"
          containerEl.classList.add("peek")
          containerEl.classList.remove("open")
        } else {
          document.body.style.overflow = "hidden"
          containerEl.classList.add("open")
          containerEl.classList.remove("peek")
        }
      }).withArgs(functionCall.raw("event"))

      bridge.see("popup/toggle", toggle)

      var popupContainer = element.style(".popup-container", {
        "position": "fixed",
        "bottom": "70px",
        "left": "0",
        "height": "0",
        "width": "100%",

        ".open": {
          "height": "100%",
          "bottom": "0",
          "overflow": "scroll",
          "background": "rgba(0,0,0,0.5)",
        },

        ".peek": {
          "bottom": "200px",
        },
      })

      var popup = element.style(".popup-container.open .popup", {
        "float": "none",
        "margin": "100px auto",
      })

      bridge.addToHead(
        element.stylesheet(popupContainer, popup)
      )
    }

    return popup
  }
)
