import {
  calculateNutrientforRecipe
} from "/imports/api/apiPersfo";

export function makeArrayOf(value, length) {
  let arr = [],
    i = length;
  while (i--) {
    arr[i] = value;
  }
  return arr;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getRecipeName(recipe, language) {
  if (language == "nl") {
    return recipe.name;
  } else if (language == "en") {
    for (let i = 0; i < recipe.custom_fields.length; i++) {
      let custom = recipe.custom_fields[i];
      if (custom.name == "name_en") {
        return custom.value;
      }
    }
  } else {
    console.log("Error in recipe name for: " + recipe.id + " " + language);
    return recipe.name;
  }
}

export function getRecipePrice(recipe, internal) {
  try {
    if ((internal !== "intern" || internal !== "intern-geel") && recipe.current_sell_price) {
      return "€" + recipe.current_sell_price?.pricing?.toFixed(2)
    } else if (internal == "intern" || internal == "intern-geel") {
      for (let i = 0; i < recipe.custom_fields.length; i++) {
        let custom = recipe.custom_fields[i];
        if (custom.name == "salesprice2") {
          return "€" + Number(custom.value).toFixed(2);
        }
      }
    } else {
      console.log("Error in recipe price for: " + recipe.id);
      return "€0";
    }
  } catch (error) {
    console.log("Error in recipe price");
    console.log(error);
    return "€0";
  }
}

export function getRecipePriceValue(recipe, internal) {
  try {
    if ((internal !== "intern" || internal !== "intern-geel") && recipe.current_sell_price) {
      return recipe.current_sell_price?.pricing
    } else if (internal == "intern" || internal == "intern-geel") {
      for (let i = 0; i < recipe.custom_fields.length; i++) {
        let custom = recipe.custom_fields[i];
        if (custom.name == "salesprice2") {
          return Number(custom.value)
        }
      }
    } else {
      console.log("Error in recipe price for: " + recipe.id);
      return 0;
    }
  } catch (error) {
    console.log("Error in recipe price value");
    console.log(error);
    return 0;
  }
}

export function getENComposition(ingredient) {
  for (let i = 0; i < ingredient.custom_fields.length; i++) {
    let custom = ingredient.custom_fields[i];
    if (custom.name == "composition_en") {
      return custom.value;
    }
  }
  return "No en ingredients for: " + ingredient.id
}

export function getLocation(status) {
  return (status == "intern-geel" || status == "extern-geel") ? "geel" : "beerse";
}

export function getLang() {
  const defaultLang = 'nl';
  const locales = ['en', defaultLang];

  let result =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.browserLanguage ||
    navigator.userLanguage ||
    defaultLang;

  result = result.substring(0, 2)

  if (!locales.includes(result)) {
    result = defaultLang;
  }
  return result;
}

const dietaryRecommendations = [
  { // sugar
    condition: (recipe, userPreferences, recommended) => userPreferences?.food4me?.Output?.Energy?.Sugar?.Percentage >= 10, // TODO
    adviseEN: "Sources of sugar include Table sugar, honey, soft drinks, confectionary. Remember a teaspoon of sugar = 5g."
  },
  { // total fat good
    condition: (recipe, userPreferences, recommended) => recipe.nutrition_info["fat"].quantity < 5,
    adviseEN: "Great choice because total fat content is low."
  },
  { // total fat bad
    condition: (recipe, userPreferences, recommended) => recipe.nutrition_info["fat"].quantity > 5 && !recommended,
    adviseEN: "Swap to a healthier alternative that contains less fat."
  },
  { // saturated fat
    condition: (recipe, userPreference, recommended) => recipe.nutrition_info["saturated_fat"].quantity > 10 && !recommended,
    adviseEN: "Warning: this meal contains more than 10% saturated fat, consider choosing a healthier option, such as dishes containing healthier fats (e.g. salmon, nuts, seeds)."
  },
  { // Salt good
    condition: (recipe, userPreferences, recommended) => calculateNutrientforRecipe(recipe, "salt") < 0.35,
    adviseEN: "Good salt content."
  },
  { // Salt bad
    condition: (recipe, userPreferences, recommended) => calculateNutrientforRecipe(recipe, "salt") > 0.35 && !recommended,
    adviseEN: "High in salt, it would be a good idea to look for another option with less salt."
  },
  { // Omega3 good
    condition: (recipe, userPreferences, recommended) => userPreferences?.food4me?.Output?.Energy?.Omega3?.Percentage < 0.6,
    adviseEN: "Omega 3 fats are especially good and necessary to keep a healthy heart."
  },
  { // fiber bad
    condition: (recipe, userPreferences, recommended) => calculateNutrientforRecipe(recipe, "fibre") > 3,
    adviseEN: "Good source of fibre."
  },
  { // Calcium low
    condition: (recipe, userPreferences, recommended) => userPreferences?.food4me?.Output?.Calcium?.Rating_Total == "LOW",
    adviseEN: "This meal contributes to your daily intake, but no one food contains enough to meet daily requirements. Make sure to also include a variety of calcium rich foods such as milk, yoghurts and cheese, and green leafy vegetables."
  },
  { // iron low
    condition: (recipe, userPreferences, recommended) => userPreferences?.food4me?.Output?.Iron?.Rating_Total == "LOW",
    adviseEN: "Iron plays an important role in your body system especially in your blood. But too much of it is also not a good thing. Therefore getting enough iron from your diet which is in a form your body can use efficiently is very important. Make sure to include iron-rich foods such as liver, red meat, oily fish, dark meat from poultry. Great plant sources of iron include: beans, nuts and seeds, fortified cereals and dark green leafy vegetables e.g. Brussels sprouts, spinach. "
  }
];

const randomAdvise = [
  "Iron plays an important role in your body system especially in your blood. But too much of it is also not a good thing. Therefore getting enough iron from your diet which is in a form your body can use efficiently is very important. Make sure to include iron-rich foods such as liver, red meat, oily fish, dark meat from poultry. Great plant sources of iron include: beans, nuts and seeds, fortified cereals and dark green leafy vegetables e.g. Brussels sprouts, spinach.",
  "Folate is important in red blood cell formation and for healthy cell growth and function. It is crucial during early stages of pregnancy to reduce risk of birth defects. Main sources of folate include: liver, poultry, shellfish, green leafy vegetables, fortified cereals, beans, legumes, nuts, and certain fruits such as oranges, melon, bananas, strawberries and lemons.",
  "Vitamin C is a powerful antioxidant which can be found in citrus fruits, berries, peppers, kiwis and tomatoes. Whilst the daily requirement is set quite low, many researchers claim that we need more of it for optimum health. Therefore, make sure to meet your daily target through consuming a variety of Vitamin C rich food throughout the day and where possible eat them with the skins!",
  "Vitamin D has a huge range of functions, from immune health, to heart health, muscle strength and maintaining blood sugar levels, this vitamin intake you have to get right. Known as the sunshine vitamin, our body mostly makes it in our skin, but we can get it from our diet too. Rich sources include eggs yolk, mushrooms, fortified foods and oily fish such as salmon and sardines. Make sure you are particularly vigilant during the winter months when sunlight exposure is limited.",
  "Magnesium is a mineral that plays an important role in our body by turning food into energy, and promoting bone health. Main sources of magnesium are green leafy vegetables (e.g. spinach), legumes, nuts, seeds, whole grains, and fortified breakfast cereals."
]

// todo: 

export function getDietaryRecommendation(recipe, userPreferences, recommended) {

  // plan: shuffleRecommendations, pick first matching recommendation.
  let shuffled = _.shuffle(dietaryRecommendations);
  for (let i = 0; i < shuffled.length; i++) {
    if (shuffled[i].condition(recipe, userPreferences, recommended)) {
      console.log(recommended)
      return shuffled[i].adviseEN;
    }
  }
  console.log("No dietary recommendation matched");
  return randomAdvise[Math.floor(Math.random() * randomAdvise.length)];
}