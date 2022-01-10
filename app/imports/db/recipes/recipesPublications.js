import { Meteor } from 'meteor/meteor';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';

Meteor.publish("recipes", function publishTasks() {
    return RecipesCollection.find();
});