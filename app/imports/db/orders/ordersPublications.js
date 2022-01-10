import { OrdersCollection } from '/imports/db/orders/OrdersCollection';

Meteor.publish("orders", function publishTasks() {
    return OrdersCollection.find({ }); // publish all orders for popularity score
});