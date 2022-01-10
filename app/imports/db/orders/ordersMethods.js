import { check } from 'meteor/check';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';

Meteor.methods({
    "orders.handleOrder"(recipeId) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        // check if order was already made today
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        const orders = OrdersCollection.find({
            userid: this.userId,
            recipeId: recipeId,
            orderday: nowString,
        }).fetch();
        const ordered = orders.length > 0;

        // if not ordered yet today, add the order
        if (!ordered) {
            OrdersCollection.insert({
                userid: this.userId,
                recipeId: recipeId,
                timestamp: now,
                orderday: nowString,
                amount: 1
            });
        } else {
            // user cancelled order
            OrdersCollection.remove({
                userid: this.userId,
                recipeId: recipeId,
                orderday: nowString,
            });
        }
    },
    "orders.incrementOrder"(recipeId) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        // check if order was already made today
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        const orders = OrdersCollection.find({
            userid: this.userId,
            recipeId: recipeId,
            orderday: nowString,
        }).fetch();
        const ordered = orders.length > 0;

        // if not ordered yet today, add the order
        if (!ordered) {
            OrdersCollection.insert({
                userid: this.userId,
                recipeId: recipeId,
                timestamp: now,
                orderday: nowString,
                amount: 1
            });
        } else {
            // increment order
            OrdersCollection.update({
                userid: this.userId,
                recipeId: recipeId,
                orderday: nowString,
            }, { $inc: { amount: 1}})
        }
    },
    "orders.decrementOrder"(recipeId) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        // check if order was already made today
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        const orders = OrdersCollection.find({
            userid: this.userId,
            recipeId: recipeId,
            orderday: nowString,
        }).fetch();
        const ordered = orders.length > 0;

        // if not ordered yet today, do not change old order
        if (!ordered) {
            
        } else {
            // decrement order
            OrdersCollection.update({
                userid: this.userId,
                recipeId: recipeId,
                orderday: nowString,
            }, { $inc: { amount: -1}})
        }
    },
    "orders.removeOrder"(recipeId) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        // check if order was already made today
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        const orders = OrdersCollection.find({
            userid: this.userId,
            recipeId: recipeId,
            orderday: nowString,
        }).fetch();
        const ordered = orders.length > 0;

        // if not ordered yet today, add the order
        if (!ordered) {

        } else {
            // user cancelled order
            OrdersCollection.remove({
                userid: this.userId,
                recipeId: recipeId,
                orderday: nowString,
            });
        }
    },
    "orders.undoRemoveOrder"(recipeId, amount) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        // check if order was already made today
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        const orders = OrdersCollection.find({
            userid: this.userId,
            recipeId: recipeId,
            orderday: nowString,
        }).fetch();
        const ordered = orders.length > 0;

        // if not ordered yet today, add the order
        if (!ordered) {
            OrdersCollection.insert({
                userid: this.userId,
                recipeId: recipeId,
                timestamp: now,
                orderday: nowString,
                amount: amount
            });
        }
    },
    "orders.confirmOrders"(){
        // only filter today's orders
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        OrdersCollection.upsert({
            userid: this.userId,
            orderday: nowString,
        }, {$set: {confirmed: true}});
    },
    "orders.undoConfirmation"(){
        // only filter today's orders
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);
        OrdersCollection.upsert({
            userid: this.userId,
            orderday: nowString,
        }, {$set: {confirmed: false}});
    }
});