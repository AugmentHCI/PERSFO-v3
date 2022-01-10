import { Meteor } from 'meteor/meteor';
import { FFQCollection } from '/imports/db/surveys/FFQCollection';

Meteor.publish("survey-ffq", function publishTasks() {
    return FFQCollection.find();
});