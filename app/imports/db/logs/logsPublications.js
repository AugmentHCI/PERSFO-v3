import { Meteor } from 'meteor/meteor';
import { LogsCollection } from '/imports/db/logs/LogsCollection';

Meteor.publish("logs", function publishTasks() {
    return LogsCollection.find({ userid: this.userId });
});