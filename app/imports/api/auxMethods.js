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
  if (internal !== "intern" && recipe.current_sell_price) {
    return "€" + recipe.current_sell_price?.pricing?.toFixed(2)
  } else if (internal == "intern") {
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