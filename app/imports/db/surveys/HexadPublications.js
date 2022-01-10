import { Meteor } from 'meteor/meteor';
import { HexadCollection } from '/imports/db/surveys/HexadCollection';

Meteor.publish("survey-hexad", function publishTasks() {
    return HexadCollection.find();
});