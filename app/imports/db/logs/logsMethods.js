import { check } from 'meteor/check';
import { LogsCollection } from '/imports/db/logs/LogsCollection';

Meteor.methods({
    "log"(component, method, navigator, extra) {
        check(component, String);
        check(method, String);
        check(navigator, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        if (extra) {
            LogsCollection.insert({
                userid: this.userId,
                component: component,
                agent: navigator,
                method: method,
                extra: extra,
                timestamp: new Date(),
            });
        } else {
            LogsCollection.insert({
                userid: this.userId,
                component: component,
                agent: navigator,
                method: method,
                timestamp: new Date(),
            });
        }

    },
});