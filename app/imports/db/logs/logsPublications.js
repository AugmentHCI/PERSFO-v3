import { Meteor } from 'meteor/meteor';
import { ANALYTICS_ADMIN } from '../../api/methods';
import { LogsCollection } from '/imports/db/logs/LogsCollection';

Meteor.publish("logs", function publishTasks() {
    const user = Meteor.users.findOne(this.userId);
    if (user?.username == ANALYTICS_ADMIN) {
        return LogsCollection.find({});
    } else {
        console.log("not authorized to access tokens");
        return LogsCollection.find({ userid: this.userId });
    }
});