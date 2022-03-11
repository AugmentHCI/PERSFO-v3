import { Meteor } from 'meteor/meteor';
import { ANALYTICS_ADMIN, TOKEN_ADMIN } from '../../api/methods';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';

Meteor.publish("userpreferences", function publishTasks() {
    return UserPreferences.find({ userid: this.userId });
});

Meteor.publish("userpreferences-tokens", function publishTasks() {
    const user = Meteor.users.findOne(this.userId);
    if (user?.username == TOKEN_ADMIN || user?.username == ANALYTICS_ADMIN) {
        return UserPreferences.find({});
    } else {
        console.log("not authorized to access tokens");
        return UserPreferences.find({ userid: this.userId });
    }
});