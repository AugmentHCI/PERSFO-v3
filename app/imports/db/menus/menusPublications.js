import { Meteor } from 'meteor/meteor';
import { MenusCollection } from '/imports/db/menus/MenusCollection';

Meteor.publish("menus", function publishTasks() {
    return MenusCollection.find();
});