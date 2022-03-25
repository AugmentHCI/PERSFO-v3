import { MenusCollection } from "/imports/db/menus/MenusCollection";
import { RecipesCollection } from "/imports/db/recipes/RecipesCollection";
import { IngredientCollection } from '/imports/db/ingredients/IngredientCollection';
import { HexadCollection } from "/imports/db/surveys/HexadCollection";
import { UserPreferences } from "/imports/db/userPreferences/UserPreferences"
import { capitalizeFirstLetter, getENComposition } from "/imports/api/auxMethods";
import { LAST_MENU_UPDATE } from "./methods";
import { food4me } from '/imports/api/apiFFQ';
import { QIBCollection } from "../db/exportCollections/QIBCollection";

const token = "iu60UIAuSQwkQ5ld1XrmUM6Pg0gDuh";
const url = "https://www.apicbase.com/api/v1/recipes/";
const API_LOGS = false;

var fs = require("fs");

export function initData() {
  // first load menus to only load relevant recipes!

  // init menus
  let allMenus = JSON.parse(Assets.getText("data/menus/menuJJ.json")).results;
  // let allMenus = JSON.parse(Assets.getText("data/menus/menu2.json")).results;
  let allRecipeIds = [];

  allMenus.forEach((menu) => {
    menu.courses = _.filter(menu.courses, c => !_.isEmpty(c.recipes));
    menu.last_update = LAST_MENU_UPDATE;

    // full menu in Beerse
    // menu.location = "beerse";
    MenusCollection.upsert({ starting_date: menu.starting_date, location: "beerse" }, { $set: menu });

    // refresh all recipe data
    menu.courses.forEach((course) => {
      course.recipes.forEach((recipeURL) => {
        allRecipeIds.push(getElementID(recipeURL));
      });
    });

    // limited menu in Geel
    // menu.location = "geel";
    menu.courses = _.filter(menu.courses, c => c.name.toLowerCase().indexOf("modern recipe") < 0);
    MenusCollection.upsert({ starting_date: menu.starting_date, location: "geel" }, { $set: menu });
  });

  allRecipeIds = [...new Set(allRecipeIds)];

  console.log("initData: menus loaded: " + new Date());

  // allRecipeIds.forEach((recipeId) => {
  //   try {
  //     let recipeDetails = JSON.parse(Assets.getText("data/recipeDetails/" + recipeId + ".json"));
  //     try {
  //       recipeDetails.kcal = calculateNutrientforRecipe(recipeDetails, "kcal");
  //     } catch (error) {
  //       recipeDetails.kcal = -1;
  //     }
  //     RecipesCollection.upsert({ id: recipeId }, { $set: recipeDetails });
  //   } catch (error) {
  //     console.log("initData: data or datafield missing for recipe id:" + recipeId);
  //   }
  // });

  let languageQuestion = JSON.parse(Assets.getText("data/surveys/language.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { languageSurvey: languageQuestion, languageVersion: "1" } });

  let statusQuestions = JSON.parse(Assets.getText("data/surveys/status-nl.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { statusQuestionSurvey: statusQuestions, statusVersion: "1" } });
  let statusQuestionsEN = JSON.parse(Assets.getText("data/surveys/status-en.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { statusQuestionSurveyEN: statusQuestionsEN, statusVersion: "1" } });

  // init hexad
  let hexadQuestions = JSON.parse(Assets.getText("data/surveys/hexad-nl.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { hexadSurvey: hexadQuestions, hexadVersion: "1" } });
  let hexadENQuestions = JSON.parse(Assets.getText("data/surveys/hexad-en.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { hexadSurveyEN: hexadENQuestions, hexadVersion: "1" } });

  // init resque
  let resqueQuestions = JSON.parse(Assets.getText("data/surveys/resque-nl.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { resqueSurvey: resqueQuestions, resqueVersion: "1" } });
  let resqueENQuestions = JSON.parse(Assets.getText("data/surveys/resque-en.json"));
  HexadCollection.upsert({ id: "1" }, { $set: { resqueSurveyEN: resqueENQuestions, resqueVersion: "1" } });

  console.log("initData: hexad loaded: " + new Date());

  let index = 0;
  let allIngredients = [];
  let ingredientIndex = 0;

  Meteor.setInterval(function () {
    console.log("initData: regular updated started: " + new Date());
    // start the interval with the first recipe
    index = 0;
    allIngredients = [];
    ingredientIndex = 0;
    updateRecipeDetails();

  }, 50 * 60 * 1000);

  updateRecipeDetails();
  console.log("initData: reciped loadings started: " + new Date());

  // try {
  //   // update food4me data on each app run
  //   const userPreferences = UserPreferences.find({}).fetch();
  //   userPreferences.forEach(pref => {
  //     // update food4me data
  //     food4me(pref.ffqAnswers, pref.userid);

  //     // create export collection for study
  //     // todo: bug: old values are saved in export (asynchronous call)
  //     if (pref.ffqAnswers && pref.ffqAnswers?.status_survey !== "test") {
  //       QIBCollection.upsert({ userid: pref.userid }, { userid: pref.userid, ffq: pref.ffqAnswers, food4me: pref.food4me, finalFFQ: pref.finalFfqAnswers });
  //     }
  //   });
  //   console.log("Food4me update done: " + new Date());
  // } catch (error) {
  //   console.log("update in production update: " + new Date());
  //   console.log(error);
  // }

  // function to fetch data in intervals
  function updateRecipeDetails() {
    Meteor.setTimeout(function () {
      try {
        const currentId = allRecipeIds[index];
        if (currentId) {
          if (API_LOGS) console.log("initData: recipe: " + currentId);
          let call = HTTP.call("GET", url + currentId, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (call.data) {
            RecipesCollection.upsert({ id: currentId }, { $set: call.data });
            // fs.writeFile(
            //   process.env["PWD"] + "/public/newRecipeDetails/" + currentId + ".json",
            //   JSON.stringify(call.data),
            //   (err) => {
            //     if (err) throw err;
            //   }
            // );
            if (call.data.ingredients) {
              allIngredients = allIngredients.concat(call.data.ingredients);
            }
          }
        } else {
          console.log("initData: recipe error at index: " + index);
          console.log("initData: recipe error at id: " + currentId);
        }
      } catch (error) {
        console.log(error);
      }

      index++;

      if (index < allRecipeIds.length) {
        updateRecipeDetails();
      } else {
        console.log("initData: update recipes finished: " + new Date());
        // start downloading ingredientdata

        // add custom fields if not exists (do not overwrite old data)
        RecipesCollection.update(
          { nbLikes: { $exists: false } },
          { $set: { nbLikes: 0 } },
          { multi: true }
        );
        RecipesCollection.update(
          { reviews: { $exists: false } },
          { $set: { reviews: [] } },
          { multi: true }
        );

        allIngredients = [...new Set(allIngredients)];

        updateIngredientDetails();
      }
    }, 1001);
  }

  // function to fetch data in intervals
  function updateIngredientDetails() {
    Meteor.setTimeout(function () {
      try {
        let ingredientURL = allIngredients[ingredientIndex].ingredient;
        if (ingredientURL) {
          if (API_LOGS) console.log("initData: ingredient: " + ingredientURL);
          let call = HTTP.call("GET", ingredientURL, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (call.data) {
            IngredientCollection.upsert({ id: call.data.id }, { $set: call.data });
            // fs.writeFile(
            //   process.env["PWD"] + "/public/newIngredientDetails/" + call.data.id + ".json",
            //   JSON.stringify(call.data),
            //   (err) => {
            //     if (err) throw err;
            // }
            // );
          }
        } else {
          console.log("initData: ingredient error at index: " + ingredientIndex);
        }
      } catch (error) {
        console.log(error);
        console.log("initData: ingredient error at index: " + ingredientIndex);
      }

      ingredientIndex++;

      if (ingredientIndex < allIngredients.length) {
        updateIngredientDetails();
      } else {
        console.log("initData: update ingredients finished: " + new Date());
        configureIngredients();
      }
    }, 1001);
  }

  function configureIngredients() {
    console.log("initData: ingredient cleaning started: " + new Date());
    RecipesCollection.find({}).fetch().forEach(recipe => {

      let cleanedIngredients = [];
      let cleanedIngredientsEN = [];

      if (recipe.remarks) {
        // ingredients from remarks
        let remarkIngredients = recipe.remarks
          .replace(/<[^>]*>?/gm, "")
          .replace(/ *\([^)]*\) */g, "")
          .split(",");
        // remove trailing spaces, unneeded quotes and stars
        remarkIngredients = _.map(remarkIngredients, (ingredient) =>
          ingredient.trim().replace(/['"*]+/g, "")
        );
        cleanedIngredients.push(remarkIngredients.sort());
      }

      if (recipe.ingredients) {
        recipe.ingredients.forEach(recipeIngredient => {
          const ingredientID = getElementID(recipeIngredient.ingredient);
          try {
            let ingredient = IngredientCollection.findOne({ id: ingredientID });
            let composition = ingredient.composition;
            if (composition && composition !== null) {
              let tempIngredients = composition
                .replace(/\*/g, "")
                .replace(/NFM/g, "")
                .split(',');
              tempIngredients = tempIngredients.map(tmp => capitalizeFirstLetter(tmp
                .trim()
                .replace(/\[|\]/g, "")
                .replace(/(^'+|'+$)/mg, "")
                .replace(/\./g, "")
                .toLowerCase()));
              cleanedIngredients.push(tempIngredients);
            }
            if (getENComposition(ingredient)) {
              let enComposition = getENComposition(ingredient);
              let tempIngredients = enComposition
                .replace(/\*/g, "")
                .replace(/NFM/g, "")
                .split(',');
              tempIngredients = tempIngredients.map(tmp => capitalizeFirstLetter(tmp
                .trim()
                .replace(/\[|\]/g, "")
                .replace(/(^'+|'+$)/mg, "")
                .replace(/\./g, "")
                .toLowerCase()));
              cleanedIngredientsEN.push(tempIngredients);
            }
          } catch (error) {
            console.log("initData: composition error for: " + ingredientID + "  " + recipe.id);
          }
        });
      }

      // combine ingredient arrays
      cleanedIngredients = _.flatten(cleanedIngredients);
      cleanedIngredientsEN = _.flatten(cleanedIngredientsEN);

      // remove empty values
      cleanedIngredients = _.without(cleanedIngredients, "")
      cleanedIngredientsEN = _.without(cleanedIngredientsEN, "")

      recipe.cleanedIngredients = cleanedIngredients;
      recipe.cleanedIngredientsEN = cleanedIngredientsEN;

      RecipesCollection.upsert({ id: recipe.id }, { $set: recipe });

    });

    console.log("initData: done: " + new Date());
  }
}

export function getNutriscore(recipe) {
  if (recipe && recipe.custom_fields) {
    for (let i = 0; i < recipe.custom_fields.length; i++) {
      let custom = recipe.custom_fields[i];
      if (custom.name == "NutriScore") {
        return custom.value;
      }
    }
  }
  return null;
}

export function getNutriscoreImage(recipe) {
  return "/images/nutri" + getNutriscore(recipe) + ".jpg";
}

export function getNutriscoreRankingValue(recipe) {
  switch (getNutriscore(recipe)) {
    case "A":
      return 1;
    case "B":
      return 0.8;
    case "C":
      return 0.5;
    case "D":
      return 0.2;
    case "E":
      return 0;
    default:
      console.log("apipersfo - getNutriscoreRankingValue: should not have happend!")
      break;
  };
}

export function getEcoScore(recipe) {
  if (recipe && recipe.custom_fields) {
    for (let i = 0; i < recipe.custom_fields.length; i++) {
      let custom = recipe.custom_fields[i];
      if (custom.name == "CO2Rating") {
        return custom.value;
      }
    }
  }
  return null;
}

export function getEcoImage(recipe) {
  return "/images/eco" + getEcoScore(recipe) + ".png";
}

export function getNbDisliked(recipe, dislikedIngredients) {
  let counter = 0;
  if (recipe && recipe.cleanedIngredients) {
    for (let i = 0; i < recipe.cleanedIngredients.length; i++) {
      if (_.includes(dislikedIngredients, recipe.cleanedIngredients[i])) {
        counter++;
      }
    }
  }
  return counter;
}

export function getImage(recipe) {
  if (recipe) {
    if (recipe.id) { // cached images for demo version
      const demoIds = ["149111125750001", "249111155760009", "249111385740003", "249111465720005", "349111275700004", "349111555940007", "349111745970001", "349111926820003", "349111926820003", "449111635760002", "549111135960007", "549111625900005", "649111695730000", "949111468960002", "949111745730006"];
      if (demoIds.findIndex(element => element === recipe.id) > -1) {
        return "/images/demo/" + recipe.id + ".jpg";
      } else {
        // console.log("no cached image for: " + recipe.id);
      }
    }
    if (recipe.main_image) {
      return recipe.main_image.thumb_image_url;
    }
    if (recipe.custom_fields) {
      for (let i = 0; i < recipe.custom_fields.length; i++) {
        let custom = recipe.custom_fields[i];
        if (custom.name == "Picture") {
          if (custom.value) {
            return custom.value.split(" ").join("%20");
          }
        }
      }
    }
  }

  return "/images/Image-not-found.png";
}

export function getElementID(recipeURL) {
  if (recipeURL) {
    let splittedURL = recipeURL.split("/");
    return splittedURL[splittedURL.length - 2];
  }
}

export function calculateNutrientforRecipe(recipeDetails, nutrient) {
  try {
    let netWeightUnit = recipeDetails.net_weight_unit;
    let multiplier = -1;
    if (netWeightUnit == "kg") {
      multiplier = 1000;
    } else if (netWeightUnit == "g") {
      multiplier = 1;
    } else {
      console.log(
        "other weight unit: " +
        netWeightUnit +
        " for recipe: " +
        recipeDetails.id
      );
    }
    return Math.round(
      (recipeDetails.nutrition_info[nutrient].quantity / 100) *
      (recipeDetails.net_weight * multiplier)
    );
  } catch (error) {
    return 0;
  }
}
