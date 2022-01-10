import { Button } from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';

const componentName = "LikeButton";
export const LikeButton = ({ recipe }) => {

    const { liked, nbLikes } = useTracker(() => {

        const noDataAvailable = {
            recipeRefresh: {},
            liked: false,
            nbLikes: 0,
        };
        const handler = Meteor.subscribe("userpreferences");
        const handlerRecipe = Meteor.subscribe("recipes");

        if (!Meteor.user() || !handler.ready() || !handlerRecipe.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        // refresh needed - otherwise number is not immediately updated!
        const recipeRefresh = RecipesCollection.findOne({ id: recipe.id })

        const nbLikes = recipeRefresh?.nbLikes ? recipeRefresh?.nbLikes : 0;

        const liked =
            UserPreferences.find({
                userid: Meteor.userId(),
                likedRecipes: { $in: [recipe.id] },
            }).fetch().length > 0;

        return { liked, nbLikes };
    });

    const handleIncreaseLike = () => {
        if (recipe.id) {
            Meteor.call("recipes.handleLike", recipe.id);
            Meteor.call("log", componentName, "handleIncreaseLike", navigator.userAgent, recipe.id);
        }
    };
    return (
        <Button
            size="large"
            onClick={() => handleIncreaseLike()}
            color="primary"
            style={
                liked
                    ? { backgroundColor: red[100], borderRadius: "14px" }
                    : undefined
            }
        >
            <FavoriteIcon style={{ color: red[300] }} /> &nbsp;{" "}
            <span>{nbLikes}</span>
        </Button>
    )
}

