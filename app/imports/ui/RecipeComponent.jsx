import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { CardOtherMeal } from "./CardOtherMeal";
import { CardRecommendedMeal } from "./CardRecommendedMeal";
import { OpenMealDetails } from "/imports/api/methods.js";
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import { getRecipeName } from "/imports/api/auxMethods";


const componentName = "RecipeComponent";
export const RecipeComponent = (({ recipeId, type }) => {

    const { recipe, allergensPresent, dietaryConflict, translatedName } = useTracker(() => {
        const noDataAvailable = {
            recipe: {},
            allergensPresent: false,
            dietaryConflict: false,
        };
        const handler = Meteor.subscribe("userpreferences");
        const handlerRecipe = Meteor.subscribe("recipes");

        if (!Meteor.user() || !handler.ready() || !handlerRecipe.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }
        const recipe = RecipesCollection.find({ id: recipeId }).fetch()[0];

        const userPreferences = UserPreferences.findOne({
            userid: Meteor.userId(),
        });

        const userAllergens = userPreferences?.allergens ? _.map(userPreferences?.allergens, a => a.allergen) : [];

        const recipeAllergens = _.without(
            _.map(_.toPairs(recipe.allergens), (n) => {
                if (n[1] == 1) return n[0];
            }),
            undefined
        );

        let allergensPresentTmp = false;
        userAllergens.forEach(userAllergy => {
            if (recipeAllergens.includes(userAllergy)) {
                allergensPresentTmp = true;
            }
        });
        const allergensPresent = allergensPresentTmp;

        const userDietaries = userPreferences?.dietaries ? _.map(userPreferences?.dietaries, a => a.dietary) : [];

        const recipeDietaryInfo = _.without(
            _.map(_.toPairs(recipe.dietary_info), (n) => {
                if (n[1] == true) return n[0];
            }),
            undefined
        );

        let dietariesPresentTmp = false;
        userDietaries.forEach(userDietary => {
            if (recipeDietaryInfo.includes(userDietary)) {
                dietariesPresentTmp = true;
            }
        });
        const dietaryConflict = dietariesPresentTmp;

        const translatedName = getRecipeName(recipe, userPreferences.languageChosen)

        return { recipe, allergensPresent, dietaryConflict, translatedName };
    });

    // Detail logic
    const handleDetailsClick = () => {
        OpenMealDetails.set([recipe, allergensPresent, translatedName]);
        Meteor.call("log", componentName, "handleDetailsClick", navigator.userAgent, recipe.id);
    };

    const renderSwitch = (type) => {
        switch (type) {
            case "other":
                return <CardOtherMeal
                    recipe={recipe}
                    handleDetailsClick={handleDetailsClick}
                    allergensPresent={allergensPresent}
                    dietaryConflict={dietaryConflict}
                    translatedName={translatedName}
                ></CardOtherMeal>
            case "recommended":
                return <CardRecommendedMeal
                    recipe={recipe}
                    handleDetailsClick={handleDetailsClick}
                    allergensPresent={allergensPresent}
                    dietaryConflict={dietaryConflict}
                    translatedName={translatedName}
                ></CardRecommendedMeal>
            default:
                break;
        }
    };

    return (
        <>
            {renderSwitch(type)}
        </>
    );
});
