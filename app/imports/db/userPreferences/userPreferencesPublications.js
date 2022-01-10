import { Meteor } from 'meteor/meteor';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';

Meteor.publish("userpreferences", function publishTasks() {
    return UserPreferences.find({ userid: this.userId });
});