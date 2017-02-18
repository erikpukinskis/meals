module.exports = function(prep, eat, side) {


  // Long term prep
  prep(["soy beans"], "make tempeh")
  prep(["mung beans"], "sprout them")


  // Day 1
  prep(["canned tomatoes"], "rinse and drain")

  prep([
    "1/2 cup chickpea flour",
    "1/8 cup tahini",
    "1/4 cup silken tofu, pressed half out",
    "1 Tbsp olive oil",
    "1/2 tsp kala namak",
    "1 tsp nutritional yeast",
    "cheesecloth",
  ], "mix vegan egg")

  prep(["1 1/2 cups flour", "vegan egg"], "make pasta") // Dough: https://www.youtube.com/watch?v=ESz55eORW44

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

}
