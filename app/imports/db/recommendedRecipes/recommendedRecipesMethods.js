import { check } from 'meteor/check';
import { RecommendedRecipes } from '/imports/db/recommendedRecipes/RecommendedRecipes';
import { MenusCollection } from '/imports/db/menus/MenusCollection';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';

import { getElementID, getNutriscoreRankingValue, getNbDisliked } from "/imports/api/apiPersfo";
import { calculateNutrientforRecipe } from '../../api/apiPersfo';

import { FALLBACK_DATE } from "/imports/api/methods.js";
import { red } from '@material-ui/core/colors';

const coursesToIgnore = ["Dranken", "Soep", "Soup"];

Meteor.methods({
    "recommender.updateRecommendations"() {

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }
        // init recommendations

        // 7 days earlier
        // const earlier = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().substring(0, 10);

        const today = new Date().toISOString().substring(0, 10);
        // find today's menu
        let menu = MenusCollection.findOne({
            // starting_date: earlier,
            starting_date: today,
        });
        // pick random menu when no menu available today
        if (!menu) {
            menu = MenusCollection.findOne({ starting_date: FALLBACK_DATE });
            console.log("recommender: no menu for today!")
        }

        let todaysCourses = menu.courses;

        const userpreferences = UserPreferences.findOne({ userid: this.userId });

        // Find all recipes that are available today --> TODO tailor per course
        let todaysRecipes = [];
        todaysCourses.forEach((course) => {
            todaysRecipes = todaysRecipes.concat(course.recipes);
        });
        todaysRecipes = _.map(todaysRecipes, getElementID);

        todaysRecipes = RecipesCollection.find({
            id: { $in: todaysRecipes },
        }).fetch();

        // Filter courses
        let filteredCourseURLs = _.filter(todaysCourses, c => _.includes(coursesToIgnore, c.name));
        filteredCourseURLs = _.flatten(filteredCourseURLs.map(c => c.recipes));
        const filteredCourseIds = _.map(filteredCourseURLs, getElementID);
        todaysRecipes = _.filter(todaysRecipes, (recipe) => !_.includes(filteredCourseIds, recipe.id));

        // Filter allergies
        let userAllergens = [];
        try {
            userAllergens = userpreferences.allergens;
        } catch (error) { }
        if (!userAllergens) userAllergens = [];
        todaysRecipes = _.filter(todaysRecipes, (recipe) => {
            const recipeAllergens = recipe.allergens;
            for (let i = 0; i < userAllergens.length; i++) {
                const userAllergen = userAllergens[i];
                if (recipeAllergens[userAllergen.allergen]) {
                    return false;
                }
            }
            return true;
        });

        // prevent that todays recommendation gets filtered again.
        const allLastRecommendations = _.filter(userpreferences.lastRecommendations, rec => rec.date !== today);
        const lastRecommendations = _.filter(allLastRecommendations, rec => {
            // filter recipes recommended more than three days ago
            return new Date(rec.date) > new Date() - (3 * 24 * 60 * 60 * 1000);
        });

        const lastRecommendationIds = _.map(lastRecommendations, rec => rec.recipeId);
        const lastRecommendationDates = _.map(lastRecommendations, rec => rec.date);

        if (lastRecommendations) {
            // filter recipes that were recommended in the last 3 days
            todaysRecipes = _.filter(todaysRecipes, (recipe) => {
                return !_.includes(lastRecommendationIds, recipe.id);
            });
        }

        // filter recipes without an image and/or no nutrient data
        todaysRecipes = _.filter(todaysRecipes, (recipe) => {
            return recipe.main_image !== null;
        });

        // filter recipes without ingredients
        todaysRecipes = _.filter(todaysRecipes, (recipe) => {
            if (recipe.cleanedIngredients) {
                return recipe.cleanedIngredients.length > 0;
            } else {
                return false;
            }
        });

        // filter smoothies
        todaysRecipes = _.filter(todaysRecipes, recipe => {
            if (recipe.recipe_type_other) {
                return recipe.recipe_type_other !== "Smoothie";
            } else {
                return true;
            }
        });

        // calculate min and max nutritional values
        // average and nonZeroCount needed so recipes with, for example, Vitamine C values do not get too much weight.
        let fiber = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 5, high: 0, neutral: 0, apicName: "fibre", quisperName: "Fiber", quisperRating: "Rating_Total" };
        let vitamineA = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 2, high: 0, neutral: 0, apicName: "vitamin_a", quisperName: "VitaminA", quisperRating: "Rating_Total" };
        let vitamineB12 = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 3, high: 0, neutral: 0, apicName: "vitamin_b12", quisperName: "VitaminB12", quisperRating: "Rating_Total" };
        let vitamineC = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 5, high: 0, neutral: 0, apicName: "vitamin_c", quisperName: "VitaminC", quisperRating: "Rating_Total" };
        let monoUnsaturatedFat = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 1, high: 0, neutral: 0, apicName: "mono_unsaturated_fat", quisperName: "UnsaturatedFat.MonoUnsaturatedFat", quisperRating: "Rating_Total" };
        let polyUnsaturatedFat = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 3, high: -0.5, neutral: 0, apicName: "poly_unsaturated_fat", quisperName: "UnsaturatedFat.PolyUnsaturatedFat", quisperRating: "Rating_Total" };
        let protein = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 3, high: -0.3, neutral: 0, apicName: "protein", quisperName: "Protein", quisperRating: "Rating_Total" };
        let totalFat = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 1, high: -1, neutral: 0, apicName: "fat", quisperName: "TotalFat", quisperRating: "Rating_Total" };
        let calcium = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 5, high: 0, neutral: 0, apicName: "calcium", quisperName: "Calcium", quisperRating: "Rating_Total" };;
        let iron = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 2, high: 0, neutral: 0, apicName: "iron", quisperName: "Iron", quisperRating: "Rating_Total" };
        let saturatedFats = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 0, high: -1, neutral: 0, apicName: "saturated_fat", quisperName: "SaturatedFats", quisperRating: "Rating" };
        let carbohydrate = { min: 9999, max: 0, average: 0, nonZeroCount: 0, low: 3, high: -0.5, neutral: 0, apicName: "carbohydrate", quisperName: "Carbohydrate", quisperRating: "Rating" };


        const nutrients = [fiber, vitamineA, vitamineB12, vitamineC, monoUnsaturatedFat, polyUnsaturatedFat, protein, totalFat, calcium, iron, saturatedFats, carbohydrate]

        let nbOrderedMax = 0;

        // update today's min and max values.
        todaysRecipes.forEach(recipe => {
            nutrients.forEach(nutrient => {
                const value = calculateNutrientforRecipe(recipe, nutrient["apicName"])
                nutrient["min"] = nutrient["min"] < value ? nutrient["min"] : value;
                nutrient["max"] = nutrient["max"] > value ? nutrient["max"] : value;
                if (value !== 0) {
                    nutrient["average"] = value;
                    nutrient["nonZeroCount"] = nutrient["nonZeroCount"] + 1;
                }
            });
            const nbOrders = OrdersCollection.find({ recipeId: recipe.id }).fetch().length;
            nbOrderedMax = nbOrders < nbOrderedMax ? nbOrderedMax : nbOrders;
        });

        nutrients.forEach(nutrient => {
            let result = nutrient["average"] / nutrient["nonZeroCount"];
            nutrient["average"] = isNaN(result) ? 0 : result;
        });

        // sort recipe by dislikedingredient first, then by decent nutriscore
        const dislikedIngredients = userpreferences?.dislikedIngredients ? userpreferences.dislikedIngredients : [];
        const food4me = userpreferences?.food4me?.Output;
        const nbLikedMax = _.maxBy(todaysRecipes, "nbLikes")?.nbLikes;

        // last step! Assign rankings
        const now = new Date().getTime();
        for (let i = 0; i < todaysRecipes.length; i++) {
            let totalfood4meRankingScore = 0;
            let scoreContributions = [];
            const recipe = todaysRecipes[i];

            nutrients.forEach(nutrient => {
                score = getNutrientRatingForRecipe(nutrient, recipe);
                totalfood4meRankingScore += score.value;
                scoreContributions.push(score);
            });

            todaysRecipes[i].dislikedIngredientsRanking = dislikedIngredients.length !== 0 ? 1 - (getNbDisliked(recipe, dislikedIngredients) / dislikedIngredients.length) : 0;
            todaysRecipes[i].nblikedRanking = nbLikedMax ? recipe.nbLikes / nbLikedMax : 0;
            todaysRecipes[i].nutriscoreRanking = getNutriscoreRankingValue(recipe);
            todaysRecipes[i].food4meRanking = totalfood4meRankingScore;
            todaysRecipes[i].ordersRanking = OrdersCollection.find({ recipeId: recipe.id }).fetch().length / nbOrderedMax; // TODO make smarter, use Nyi Nyi's ranking score
            todaysRecipes[i].explanations = _.sortBy(scoreContributions, s => -Math.abs(s.value));

            let cosineSimilarity = 0;
            if(userpreferences.orderBasedRecommendations) {
                let result = _.find(userpreferences.orderBasedRecommendations, rec => rec.recipeId == recipe.id);
                if (result) {
                    todaysRecipes[i].cosineSimilarity = result.cosineSimilarity;
                }
            }

            todaysRecipes[i].totalRanking = 0.65 * totalfood4meRankingScore + 0.25 * cosineSimilarity + 0.1 * todaysRecipes[i].ordersRanking;

            // needed to force rerender (new order does not change ids)
            todaysRecipes[i].lastUpdated = now;
        }

        const result = _.sortBy(todaysRecipes, r => -r.food4meRanking);


        if (result?.length) {
            // insert/update recommendations for user
            RecommendedRecipes.upsert(
                { userid: this.userId },
                { $set: { recommendations: result } }
            );

            if (!_.includes(lastRecommendationDates, today)) {
                UserPreferences.update({ userid: this.userId },
                    { $addToSet: { lastRecommendations: { recipeId: result[0].id, date: today } } });
            }
        }


        function getNutrientRatingForRecipe(ranges, recipe) {
            let rating;
            let splittedQuisperName = ranges.quisperName.split(".");
            if (splittedQuisperName.length == 1) {
                rating = food4me[ranges.quisperName][ranges.quisperRating]
            } else {
                rating = food4me[splittedQuisperName[0]][splittedQuisperName[1]][ranges.quisperRating]
            }
            let normalizedNutrient = (calculateNutrientforRecipe(recipe, ranges["apicName"]) / ranges["max"]);
            if (normalizedNutrient == 0 || isNaN(normalizedNutrient)) {
                normalizedNutrient = ranges["average"];
            }
            let score = { value: 0, food4me: ranges.quisperName, rating: rating, normalizedNutrient: normalizedNutrient }
            switch (rating) {
                case "LOW":
                    score.value = ranges["low"] * normalizedNutrient;
                    break;
                case "HIGH":
                    score.value = ranges["high"] * normalizedNutrient;
                    break;
                case "NA":
                    score.value = ranges["neutral"] * normalizedNutrient;
                    break;
                case "NORMAL":
                    score.value = ranges["neutral"] * normalizedNutrient;
                    break;
                default:
                    break;
            }
            return score;
        }
    },
});