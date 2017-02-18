var library = require("module-library")(require)

module.exports = library.export(
  "meals",
  ["web-element", "basic-styles", "browser-bridge", "./dashify", "make-request"],
  function(element, basicStyles, BrowserBridge, dashify, makeRequest) {

    function renderMeals(bridge) {
      basicStyles.addTo(bridge)


      var toggleListPosition = bridge.defineFunction(function() {
        var list = document.querySelector(".shopping-list")
        if (list.classList.contains("peek")) {
          list.classList.delete("peek")
        } else {
          list.classList.add("peek")
        }
      })

      var title = element(
        ".shopping-list-title",
        "Shopping List",
        {onclick: toggleListPosition.evalable()}
      )

      var list = element(".shopping-list", [
        title,
        element(".shopping-list-items")
      ])

      var page = element(list, element.stylesheet(cellStyle, foodStyle,mealStyle, togglePurchase, togglePantry, shoppingListStyle, listStyle, listTitleStyle))

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




      // Long term prep

      prep(["soy beans"], "make tempeh")
      prep(["mung beans"], "sprout them")


      // Day 1

      prep(["tomatoes"], "rinse and drain")

      prep([
        "1/2 cup chickpea flour",
        "1/8 cup tahini",
        "1/4 cup silken tofu, pressed half out",
        "1 Tbsp olive oil",
        "1/2 tsp kala namak",
        "1 tsp nutritional yeast",
        "cheesecloth",
      ], "mix vegan egg")

      prep(["1 1/2 cups all-purpose flour", "vegan egg"], "make pasta") // Dough: https://www.youtube.com/watch?v=ESz55eORW44

      side(["hot chocolate mix"], "cocoa")
      side(["lettuce", "onion"], "salad")
      eat(["porcini", "mushrooms", "garlic"], "ravioli")

      // Day 2
      prep(["shitake", "porcini", "kombu", "carrot"], "make broth")
      prep(["napa", "daikon", "korean paprika"], "prep kimchi")
      prep(["flour"], "make dough")

      eat(["scallion", "silken tofu", "ramen", "eggplant", "sesame seeds", "miso"], "ramen")

      // Day 3
      prep(["carrots", "celery", "oats", "hoisin"], "make oat paste")
      prep(["beets"], "cook")
      prep(["rice"], "cook")
      prep(["tempeh", "onion", "tofu", "mung beans", "breadcrumbs"], "prep veggie patty")
      prep(["dough"], "bake buns")
      prep(["dough"], "bake bagels")
      prep(["fennel", "nutmeg", "paprika", "thyme", "sage", "veggie bouillon", "gluten", "tempeh", "rice"], "prep sausage")
      prep(["flour"], "make waffle batter")

      eat(["lettuce", "tomato", "onion", "mayo", "mustart", "potato"], "veggie burger and fries")

      // Day 4
      eat(["fruit"], "waffles and sausage")

      // Day 5
      eat(["rice noodles", "cabbage", "peanuts", "basil", "cilantro"], "pad thai")

      prep(["flour"], "dough")

      // day 6        
      prep(["dough"], "pizza dough")
      prep(["paprika", "garlic", "oregano", "tempeh"], "pepperoni")
      prep(["tomato"], "drain")

      side(["lettuce"], "salad")
      eat(["olive oil", "tofu", "artichoke", "olives", "miso", "sauerkraut"], "pizza")

      // day 7
      prep(["masa"], "tortillas")
      prep(["cabbage", "cilantro"], "slaw")

      eat(["mayo", "beer", "tofu", "paprika"], "tacos")

      // day 8
      prep(["beans"], "cook")
      prep(["masa", "flour", "sugar"], "corn bread")

      eat(["greens"], "beans and cornbread")

      // day 9
      prep(["tomato can"], "rinse")
      prep(["gluten free crust"], "make")
      prep(["rice"], "cook")
      prep(["sauerkraut", "hoisin", "flour", "rice", "mayo", "firm tofu"], "fried cheese")
      eat(["paprika", "oregano", "olive oil"], "gluten free vegan pizza")

      // Taglierini technique: https://www.youtube.com/watch?v=IKe3uatYLmo 


      bridge.send(page)
    }





    renderMeals.prepareSite = function(site) {
      site.addRoute("get", "/meals", function(request, response) {
        renderMeals(new BrowserBridge().forResponse(response))
      })

      site.addRoute("post", "/ingredients/:tag/:status", function(request, response) {        
        response.json({ok: "yes"})
      })
    }

    var listStyle = element.style(".shopping-list-item, .shopping-list-title", {
      "border-bottom": "2px solid #c3ebff",
      "color": "#698",
      "padding": "10px 20px",
    })

    var listTitleStyle = element.style(" .shopping-list-title", {
      "padding-top": "20px",
      "padding-bottom": "15px",
    })

    var shoppingListStyle = element.style(".shopping-list", {
      "position": "fixed",
      "bottom": "-335px",
      "transition": "bottom 100ms",
      "background-color": "white",
      "width": "200px",
      "height": "400px",
      "line-height": "20px",
      "right": "20px",
      "box-shadow": "0px 2px 10px 5px rgba(195, 255, 240, 0.58)",
      "color": "#df",

      "@media (min-width: 720px)": {
        "left": "500px",
      },

      ".peek": {
        "bottom": "-200px",
      }
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
        "color": "#4cc8ca",

        ".lit": {
          "background-color": "#9df",
          "color": "white",
        }
      }
    )

    function prepareBridge(bridge) {
      if (bridge.remember("meals/have")) return

      var list = bridge.defineSingleton("shoppingList", function() {
        return new Set()
      })

      var setStatus = bridge.defineFunction([makeRequest.defineOn(bridge), element.defineOn(bridge), list], function setStatus(makeRequest, element, shoppingList, status, tag) {

        makeRequest("/ingredients/"+tag+"/"+status, {method: "post"})

        var opposite = {
          "have": "need",
          "need": "have",
        }

        if (status == "need") {
          shoppingList.add(tag)
        } else {
          shoppingList.delete(tag)
        }

        console.log("list is", shoppingList)
        var html = ""

        shoppingList.forEach(function(tag) {
          html += element(".shopping-list-item", tag.replace("-", " ")).html()
        })

        document.querySelector(".shopping-list").classList.add("peek")

        document.querySelector(".shopping-list-items").innerHTML = html

        document.querySelector("."+status+"-"+tag).classList.add("lit")

        document.querySelector("."+opposite[status]+"-"+tag).classList.remove("lit")
      })

      bridge.see("meals/have", setStatus.withArgs("have"))

      bridge.see("meals/need",
        setStatus.withArgs("need"))
      
    }

    function renderRows(bridge, ingredients, food, lastSelector) {

      prepareBridge(bridge)

      var rows = []

      ingredients.forEach(function(ingredient, i) {

        var tag = dashify(ingredient)
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

