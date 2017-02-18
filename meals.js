var library = require("module-library")(require)

module.exports = library.export(
  "meals",
  ["web-element", "basic-styles", "browser-bridge", "./dashify", "make-request", "phone-person", "./upcoming-meals"],
  function(element, basicStyles, BrowserBridge, dashify, makeRequest, phonePerson, upcomingMeals) {

    function prepareSite(site) {
      site.addRoute("get", "/meals", function(request, response) {
        renderMeals(new BrowserBridge().forResponse(response))
      })

      site.addRoute("post", "/ingredients/:tag/:status", function(request, response) {       
        var tag = request.params.tag
        var status = request.params.status

        response.json({ok: "yes"})
      })

      site.addRoute("post", "/meals/pantries", function(request, response) {

        var number = request.body.phoneNumber

        inPantry(number, pantry)

        var shopper = phonePerson(number)



        response.send("ok")
      })
    }


    function renderMeals(bridge) {
      basicStyles.addTo(bridge)


      var saveForm = element("form", {method: "post", action: "/meals/pantries"}, [
        element("p", "Text a link to yourself to save your pantry:"),
        element("input", {type: "text", name: "phoneNumber", placeholder: "Phone number or email"}),
        element("input", {type: "submit", value: "Text me"}, element.style({"margin-top": "10px"})),
      ])

      var toggleListPosition = bridge.defineFunction(function() {
        var listEl = document.querySelector(".shopping-list")
        if (listEl.classList.contains("open")) {
          listEl.classList.add("closed")
          listEl.classList.remove("open")
        } else {
          listEl.classList.add("open")
          listEl.classList.remove("closed")
        }
      })

      var title = element(
        ".shopping-list-title",
        "Shopping List"
      )

      var list = element(
        ".shopping-list",
        {onclick: toggleListPosition.evalable()},
        [title, element(".shopping-list-items")]
      )

      var page = element(saveForm, list, element.stylesheet(cellStyle, foodStyle,mealStyle, togglePurchase, togglePantry, shoppingListStyle, ruledItem, listTitleStyle))

      var preparations = []
      var sides = []
      var day = 1

      function prep(ingredients, food) {
        preparations.push(renderRows(bridge, ingredients, food, ".food"))
      }

      function side(ingredients, dish) {
        sides.push(renderRows(bridge, ingredients, dish, ".meal.food"))
      }

      function eat(ingredients, meal) {

        var elements = [
          element("h1", "Day "+day),
          preparations,
          element("br"),
          sides,
          renderRows(bridge, ingredients, meal, ".meal.food")
        ]

        preparations = []
        sides = []
        day++
        page.addChild(elements)
      }

      upcomingMeals(prep, eat, side)


      bridge.send(page)
    }





    renderMeals.prepareSite = prepareSite

    var ruledItem = element.style(".shopping-list-item, .shopping-list-title", {
      "border-bottom": "2px solid #c3ebff",
      "color": "#6be",
      "padding": "10px 20px",
    })

    var listTitleStyle = element.style(" .shopping-list-title", {
      "padding-top": "20px",
      "padding-bottom": "15px",
    })

    var shoppingListStyle = element.style(".shopping-list", {
      "position": "fixed",
      "bottom": "-235px",
      "transition": "bottom 100ms",
      "background-color": "white",
      "width": "200px",
      "height": "300px",
      "line-height": "20px",
      "right": "20px",
      "box-shadow": "0px 2px 10px 5px rgba(195, 255, 240, 0.58)",
      "color": "#df",
      "cursor": "pointer",

      "@media (min-width: 720px)": {
        "left": "500px",
      },

      ".peek": {
        "height": "300px !important",
        "bottom": "-100px !important",
      },

      ".open": {
        "bottom": "30px !important",
        "width": "250px",
      },
    })

    var cellStyle = element.style(".text-input", {
      "border-bottom-color": "#aeecf3",
    })

    var foodStyle = element.style(".food", {
      "color": "#f55a5a", // fafa
      "border-bottom-color": "#ffe1d2", // ffeld
    })

    var mealStyle = element.style(".meal", {
      "background-color": "#fffff4",
    })

    var togglePantry = element.style(
      ".button.toggle-pantry", {
        "background-color": "transparent",
        "border": "2px solid #9eeace",
        "color": "#3b8",

        ".lit": {
          "background-color": "#9eeace",
          "color": "white",
        }
      }
    )


    var togglePurchase = element.style(
      ".button.toggle-purchase", {
        "background-color": "transparent",
        "border": "2px solid #9df",
        "color": "#6be",

        ".lit": {
          "background-color": "#9df",
          "color": "white",
        }
      }
    )

    function prepareBridge(bridge) {
      if (bridge.remember("meals/have")) return

      var list = bridge.defineSingleton("shoppingList", function list() {
        return new Set()
      })

      var pantry = bridge.defineSingleton("pantry", function pantry() {
        return new Set()
      })

      var setStatus = bridge.defineFunction([makeRequest.defineOn(bridge), element.defineOn(bridge), list, pantry], function setStatus(makeRequest, element, shoppingList, pantry, status, tag) {

        // makeRequest("/ingredients/"+tag+"/"+status, {method: "post"})

        var opposite = {
          "have": "need",
          "need": "have",
        }

        if (status == "need") {
          shoppingList.add(tag)
          pantry.delete(tag)
        } else if (status == "have") {
          pantry.add(tag)
          shoppingList.delete(tag)
        }

        var html = ""

        var height = 70 + shoppingList.size*44
        console.log("height", height)
        height = Math.max(300, height)

        shoppingList.forEach(function(tag) {
          html = element(".shopping-list-item", tag.replace("-", " ")).html() + html
        })

        var listEl = document.querySelector(".shopping-list")
        listEl.classList.add("closed")
        
        listEl.setAttribute("style", "height: "+height+"px; bottom: "+(165 - height).toString()+"px;")



        document.querySelector(".shopping-list-items").innerHTML = html

        document.querySelectorAll("."+status+"-"+tag).forEach(light)

        function light(el) {
          el.classList.add("lit")
        }

        document.querySelectorAll("."+opposite[status]+"-"+tag).forEach(unlight)

        function unlight(el) {
          el.classList.remove("lit")
        }
      })

      bridge.see("meals/have", setStatus.withArgs("have"))

      bridge.see("meals/need",
        setStatus.withArgs("need"))
      
    }

    function removeQuantity(ingredient) {
      return ingredient.replace(/^[0-9]? ?[0-9]?\/?[0-9]? ?(cups|Tbsp|tsp|cup) ?/, "")
    }

    function renderRows(bridge, ingredients, food, lastSelector) {

      prepareBridge(bridge)

      var rows = []

      ingredients.forEach(function(ingredient, i) {

        var tag = dashify(removeQuantity(ingredient))
        var lastOne = i == ingredients.length-1

        var row = element(".row", [
          element(".text-input.grid-8", ingredient),
          element(".button.toggle-pantry.have-"+tag, "have", {onclick: bridge.remember("meals/have").withArgs(tag).evalable()}),
          element(".button.toggle-purchase.need-"+tag, "need", {onclick: bridge.remember("meals/need").withArgs(tag).evalable()}),
        ])



        if (lastOne) {
          row.addChild(element(".text-input.grid-8"+lastSelector, food))
        }

        rows.push(row)
      })

      return rows
    }


    return renderMeals
  }
)

