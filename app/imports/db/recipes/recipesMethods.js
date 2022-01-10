import { check } from 'meteor/check';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';

Meteor.methods({
    "recipes.handleLike"(recipeId) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        if (
            UserPreferences.find({
                userid: this.userId,
                likedRecipes: { $in: [recipeId] },
            }).fetch().length > 0
        ) {
            // recipe was already liked
            RecipesCollection.update({ id: recipeId }, { $inc: { nbLikes: -1 } });
            UserPreferences.update(
                { userid: this.userId },
                { $pull: { likedRecipes: recipeId } }
            );
        } else {
            RecipesCollection.update({ id: recipeId }, { $inc: { nbLikes: 1 } });
            UserPreferences.upsert(
                { userid: this.userId },
                { $addToSet: { likedRecipes: recipeId } }
            );
        }
    }
});