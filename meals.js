var library = require("module-library")(require)

library.define(
  "my-pantry",
  ["identifiable"],
  function(identifiable) {

    var pantries = {}
    var phoneNumbers = {}

    var count = 0
    function myPantry(id) {
      if (pantries[id]) {
        return pantries[id]
      }

      var pantry = {
        id:id,
        status: {},
        isTemporary: true,
      }
      pantry.statusOf = statusOf.bind(pantry)
      pantry.copyTo = copyTo.bind(pantry)

      count++

      if (!pantry.id) {
        identifiable.assignId(pantries, pantry)
      }

      pantries[pantry.id] = pantry

      return pantry
    }

    function copyTo(tellUniverse) {
      tellUniverse("myPantry", this.id)

      for(var ingredient in this.status) {
        var status = this.status[ingredient]
        tellUniverse("myPantry.status", this.id, ingredient, status)
      }
    }

    function statusOf(tag) {
      return this.status[tag]
    }

    function setIngredientStatus(pantryId, tag, status) {
      var pantry = get(pantryId)
      pantry.status[tag] = status
    }

    var get = identifiable.getFrom(pantries, "pantry")

    function getStatus(pantryId, tag) {
      var pantry = get(pantryId)
      return pantry.status[tag]
    }


    myPantry.ingredient = setIngredientStatus

    myPantry.status = getStatus

    myPantry.suggestPhone = function suggestPhone(pantryId, number) {
      if (phoneNumbers[pantryId]) {
        throw new Error("Can't add a new number after you already associated a pantry with a number")
      }
      phoneNumbers[pantryId] = number
    }

    return myPantry
  }
)






library.define(
  "fill-pantry", 
  ["web-element", "./dashify"],
  function(element, dashify) {

    function fillPantry(bridge, func, pantry) {

      var week = {
        preparations: [],
        sides: [],
        day: 1,
        pantry: pantry,
        page: element(),
        bridge: bridge,
      }

      if (!pantry || !pantry.id) {
        throw new Error("Pantryyyyyyyyy")
      }

      func(prep.bind(week), eat.bind(week), side.bind(week))

      return week.page
    }

    function prep(ingredients, food) {
      this.preparations.push(renderRows(this.bridge, ingredients, food, ".food", this.pantry))
    }

    function side(ingredients, dish) {
      this.sides.push(renderRows(this.bridge, ingredients, dish, ".meal.food", this.pantry))
    }

    function eat(ingredients, meal) {

      var elements = [
        element("h1", "Day "+this.day),
        this.preparations,
        element("br"),
        this.sides,
        renderRows(this.bridge, ingredients, meal, ".meal.food", this.pantry)
      ]

      this.preparations = []
      this.sides = []
      this.day++

      this.page.addChild(elements)
    }

    function renderRows(bridge, ingredients, food, lastSelector, pantry) {

      if (!pantry) {
        throw new Error("Pannnntryyyyy")
      }

      var rows = []

      ingredients.forEach(function(ingredient, i) {

        var tag = dashify(removeQuantity(ingredient))
        var lastOne = i == ingredients.length-1

        var status = pantry.statusOf(tag)

        var haveButton =           element(".button.toggle-pantry.have-"+tag, "have", {onclick: bridge.remember("meals/have").withArgs(tag).evalable()})

        if (status == "have") {
          haveButton.addSelector(".lit")
        }

        var needButton = element(".button.toggle-purchase.need-"+tag, "need", {onclick: bridge.remember("meals/need").withArgs(tag).evalable()})

        if (status == "need") {
          needButton.addSelector(".lit")
        }

        var row = element(".row", [
          element(".text-input.grid-8", ingredient),
          haveButton,
          needButton,
        ])



        if (lastOne) {
          row.addChild(element(".text-input.grid-8"+lastSelector, food))
        }

        rows.push(row)
      })

      return rows
    }

    function removeQuantity(ingredient) {
      return ingredient.replace(/^[0-9]? ?[0-9]?\/?[0-9]? ?(cups|Tbsp|tsp|cup) ?/, "")
    }

    return fillPantry
  }
)






module.exports = library.export(
  "meals",
  ["web-element", "basic-styles", "browser-bridge", "make-request", "phone-person", "./upcoming-meals", "identifiable", "tell-the-universe", "my-pantry", "fill-pantry"],
  function(element, basicStyles, BrowserBridge, makeRequest, phonePerson, eriksUpcoming, identifiable, tellTheUniverse, myPantry, fillPantry) {

    tellTheUniverse = tellTheUniverse.called("meals").withNames({"myPantry": "my-pantry"})

    tellTheUniverse.load()

    function renderMeals(bridge, pantry) {

      basicStyles.addTo(bridge)

      if (!pantry) {
       pantry = myPantry()
      }

      var listSingleton = bridge.defineSingleton("shoppingList", function newShoppingList() { return new Set() })

      bridge.see("meals/shoppingListSingleton", listSingleton)

      var pantrySingleton = bridge.defineSingleton(
        "pantry",
        [pantry],
        function newPantry(options) {
          var pantry = new Set()
          pantry.id = options.id
          pantry.isTemporary = options.isTemporary
          return pantry
        }
      )

      bridge.see("meals/pantrySingleton", pantrySingleton)

      prepareBridge(bridge)

      var week = fillPantry(bridge, eriksUpcoming, pantry)


      var page = element([
        saveForm(pantry.id),
        shoppingListOverlay(bridge),
        week,
        element.stylesheet(cellStyle, foodStyle,mealStyle, togglePurchase, togglePantry, shoppingListStyle, ruledItem, listTitleStyle)
      ])

      bridge.send(page)
    }

    renderMeals.prepareBridge = prepareBridge


    function prepareBridge(bridge) {
      if (bridge.remember("meals/have")) return

      var toggleShoppingList = bridge.defineFunction(function toggleShoppingList() {
        var listEl = document.querySelector(".shopping-list")
        if (listEl.classList.contains("open")) {
          listEl.classList.add("closed")
          listEl.classList.remove("open")
        } else {
          listEl.classList.add("open")
          listEl.classList.remove("closed")
        }
      })

      bridge.see("meals/toggleShoppingList", toggleShoppingList)

      var setStatus = bridge.defineFunction([makeRequest.defineOn(bridge), element.defineOn(bridge), bridge.remember("meals/shoppingListSingleton"), bridge.remember("meals/pantrySingleton")], function setStatus(makeRequest, element, shoppingList, pantry, status, tag) {

        var update = {
          status: status,
          isTemporary: pantry.isTemporary,
          pantryId: pantry.id
        }

        makeRequest("/meals/ingredient-status/"+tag, {method: "post", data: update})

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

    renderMeals.prepareSite = prepareSite

    function prepareSite(site) {
      site.addRoute("get", "/meals", function(request, response) {
        renderMeals(new BrowserBridge().forResponse(response))
      })

// API:
//   /meals/ingredient-status/dai-kon {
//     pantryId: "temp-34a1",
//     isTemporary: true,
//     status: "have", // or "need"
//   }

      site.addRoute("post", "/meals/ingredient-status/:tag", function(request, response) {       
        var status = request.body.status
        var isPermanent = !request.body.isTemporary
        var pantryId = request.body.pantryId
        var tag = request.params.tag

        myPantry.ingredient(pantryId, tag, status)

        if (isPermanent) {
          tellTheUniverse("myPantry.ingredient", pantryId, tag, status)
        }

        response.json({ok: "yes"})
      })

      site.addRoute("get", "/pantries/:id", function(request, response) {

        var pantry = myPantry(request.params.id)

        var bridge = new BrowserBridge().forResponse(response)

        renderMeals(bridge, pantry)
      })

      site.addRoute("post", "/pantries", function(request, response) {

        var number = request.body.phoneNumber
        var id = request.body.pantryId

        if (!id) {
          throw new Error("PANTRYYY")
        }
        var pantry = myPantry(id)

        pantry.isTemporary = false

        pantry.copyTo(tellTheUniverse)

        myPantry.suggestPhone(pantry.id, number)

        tellTheUniverse("myPantry.suggestPhone", pantry.id, number)

        response.redirect("/pantries/"+pantry.id)

        var shopper = phonePerson(number)

        // shopper.send("Just created your pantry at http://ezjs.co/meals/"+pantry.id)
      })
    }


    function saveForm(pantryId) {
      return element("form", {method: "post", action: "/pantries"}, [
        element("p", "Text a link to yourself to save your pantry:"),
        element("input", {type: "text", name: "phoneNumber", placeholder: "Phone number or email"}),
        element("input", {type: "hidden", name: "pantryId", value: pantryId}),
        element("input", {type: "submit", value: "Text me"}, element.style({"margin-top": "10px"})),
      ])
    }


    function shoppingListOverlay(bridge) {
      var toggle = bridge.remember("meals/toggleShoppingList")
      if (!toggle) {
        throw new Error("boo: "+bridge.id)
      }

      var shoppingListEl = element(
        ".shopping-list",
        {onclick: toggle.evalable()},
        [
          element(
            ".shopping-list-title",
            "Shopping List"
          ),
          element(".shopping-list-items"),
        ]
      )

      return shoppingListEl
    }

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
      "box-shadow": "0px 2px 10px 5px rgba(138, 193, 179, 0.19)",
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



    return renderMeals
  }
)

