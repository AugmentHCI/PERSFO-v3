import { Meteor } from 'meteor/meteor';
import { RecommendedRecipes } from '/imports/db/recommendedRecipes/RecommendedRecipes';

Meteor.publish("recommendedrecipes", function publishTasks() {
    return RecommendedRecipes.find({ userid: this.userId });
});