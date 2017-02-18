var library = require("module-library")(require)

module.exports = library.export(
  "meals",
  ["web-element", "basic-styles", "browser-bridge", "./dashify", "make-request"],
  function(element, basicStyles, BrowserBridge, dashify, makeRequest) {

    function renderMeals(bridge) {
      basicStyles.addTo(bridge)


      var page = element(element.stylesheet(cellStyle, foodStyle,mealStyle, togglePurchase, togglePantry))

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

      prep(["soy beans"], "tempeh")
      prep(["mung beans"], "sprout")


      // Day 1

      prep(["tomatoes"], "rinse")

      prep([
        "1/2 cup chickpea flour",
        "1/8 cup tahini",
        "1/4 cup silken tofu, pressed half out",
        "1 Tbsp olive oil",
        "1/2 tsp kala namak",
        "1 tsp nutritional yeast",
        "cheesecloth",
      ], "vegan egg")

      prep(["1 1/2 cups all-purpose flour", "vegan egg"], "pasta") // Dough: https://www.youtube.com/watch?v=ESz55eORW44

      side(["hot chocolate mix"], "cocoa")
      side(["lettuce", "onion"], "salad")
      eat(["porcini", "mushrooms", "garlic"], "ravioli")

      // Day 2
      prep(["shitake", "porcini", "kombu", "carrot"], "broth")
      prep(["napa", "daikon", "korean paprika"], "kimchi")
      prep(["flour"], "dough")

      eat(["scallion", "silken tofu", "ramen", "eggplant", "sesame seeds", "miso"], "ramen")

      // Day 3
      prep(["carrots", "celery", "oats", "hoisin"], "oat paste")
      prep(["beets"], "cook")
      prep(["rice"], "cook")
      prep(["tempeh", "onion", "tofu", "mung beans", "breadcrumbs"], "veggie patty")
      prep(["dough"], "buns")
      prep(["dough"], "bagels")
      prep(["fennel", "nutmeg", "paprika", "thyme", "sage", "veggie bouillon", "gluten", "tempeh", "rice"], "sausage")
      prep(["flour"], "waffle batter")

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

        console.log(request.params.status, request.params.tag)
      })
    }

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

    function renderRows(bridge, ingredients, food, lastSelector) {

      if (!bridge.remember("meals/have")) {

        var setStatus = bridge.defineFunction([makeRequest.defineOn(bridge)], function setStatus(makeRequest, status, tag) {

          makeRequest("/ingredients/"+tag+"/"+status, {method: "post"})

          var opposite = {
            "have": "need",
            "need": "have",
          }

          document.querySelector("."+status+"-"+tag).classList.add("lit")

          document.querySelector("."+opposite[status]+"-"+tag).classList.remove("lit")
        })

        bridge.see("meals/have", setStatus.withArgs("have"))

        bridge.see("meals/need",
          setStatus.withArgs("need"))

      }
      
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

