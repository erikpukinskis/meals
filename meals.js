var library = require("module-library")(require)

module.exports = library.export(
  "meals",
  ["web-element", "basic-styles"],
  function(element, basicStyles) {

    function renderMeals(bridge) {
      basicStyles.addTo(bridge)
      bridge.send(page)
    }

    var cellStyle = element.style(".text-input", {
      "display": "inline-block",
      "width": "7em",
      "border-bottom-color": "#aeecf3",
    })

    var foodStyle = element.style(".food", {
      "color": "#a42",
      "border-bottom-color": "#eea",
    })

    var mealStyle = element.style(".meal", {
      "background-color": "#fffff4",
    })

    var page = element(element.stylesheet(cellStyle, foodStyle,mealStyle))

    var preparations = []
    var sides = []

    function renderRows(ingredients, food, lastSelector) {
      
      var rows = []

      ingredients.forEach(function(ingredient, i) {

        var lastOne = i == ingredients.length-1
        var row = element(".row",
          element(".text-input", ingredient))

        if (lastOne) {
          row.addChild(element(".text-input"+lastSelector, food))
        }

        rows.push(row)
      })

      return rows
    }

    function prep(ingredients, food) {
      preparations.push(renderRows(ingredients, food, ".food"))
    }

    function side(ingredients, dish) {
      sides.push(renderRows(ingredients, dish, ".meal.food"))
    }

    var day = 1
    function eat(ingredients, meal) {

      var elements = [
        element("h1", "Day "+day),
        preparations,
        element("br"),
        sides,
        renderRows(ingredients, meal, ".meal.food")
      ]

      preparations = []
      sides = []
      day++
      page.addChild(elements)
    }

    // Day 1
    prep(["soy beans"], "tempeh")
    prep(["mung beans"], "sprout")
    prep(["tomatoes"], "rinse")
    prep(["flour"], "pasta")

    side(["lettuce", "onion"], "salad")
    eat(["porcini", "mushrooms", "garlic"], "ravioli")

    // Day 2
    prep(["shitake", "porcini", "kombu", "carrot"], "broth")
    prep(["napa", "daikon", "korean paprika"], "kimchi")
    prep(["flour"], "dough")

    eat(["scallion", "silken tofu", "ramen", "eggplant", "sesame seeds", "miso"], "ramen")

    // Day 3
    prep(["beets"], "cook")
    prep(["rice"], "cook")
    prep(["tempeh", "onion", "tofu", "mung beans"], "veggie patty")
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
    prep(["paprika", "garlic", "oregano"], "pepperoni paste")
    prep(["tomato"], "drain")

    side(["lettuce"], "salad")
    eat(["olive oil", "tofu", "artichoke", "olives", "miso"], "pizza")

    // day 7
    prep(["masa"], "tortillas")
    prep(["cabbage", "cilantro"], "slaw")

    eat(["mayo", "beer", "tofu", "paprika"], "tacos")

    // day 8
    prep(["beans"], "cook")
    prep(["masa", "flour", "sugar"], "corn bread")

    eat(["green"], "beans and cornbread")

    return renderMeals
  }
)

