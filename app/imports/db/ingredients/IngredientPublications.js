import { Meteor } from 'meteor/meteor';
import { IngredientCollection } from '/imports/db/ingredients/IngredientCollection';

Meteor.publish("ingredients", function publishTasks() {
    return IngredientCollection.find();
});