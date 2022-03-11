
import { Box, Button, Container, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { UserPreferences } from '../db/userPreferences/UserPreferences';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';
import { LogsCollection } from '/imports/db/logs/LogsCollection';


const useStyles = makeStyles(() => ({
    header: {
        margin: "20px",
    },
    complete: {
        display: "flex",
        justifyContent: "center"
    }
}));

const componentName = "AnalyticsScreen";
export const AnalyticsScreen = () => {

    const classes = useStyles();

    const { nbFinishedUsers, allLogs, internBeerse, externBeerse, internGeel, externGeel, ffqs, allConfirmedOrders, confirmedOrders, nonVirtualConfirmedOrders } = useTracker(() => {
        const noDataAvailable = { nbFinishedUsers: 0, allLogs: [], internBeerse: [], externBeerse: [], internGeel: [], externGeel: [], ffqs: [], confirmedOrders: [], nonVirtualConfirmedOrders: [] };

        const preferencesHandler = Meteor.subscribe("userpreferences-tokens");
        const ordersHandler = Meteor.subscribe("orders");
        const logsHandler = Meteor.subscribe("logs");

        if (!Meteor.user() || !preferencesHandler.ready() || !ordersHandler.ready() || !logsHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const internBeerse = UserPreferences.find({ "ffqAnswers.status_survey": "intern" }).fetch();
        const externBeerse = UserPreferences.find({ "ffqAnswers.status_survey": "extern" }).fetch();
        const internGeel = UserPreferences.find({ "ffqAnswers.status_survey": "intern-geel" }).fetch();
        const externGeel = UserPreferences.find({ "ffqAnswers.status_survey": "extern-geel" }).fetch();

        const testUserIds = UserPreferences.find({ "ffqAnswers.status_survey": "test" }).fetch().map(user => user.userid);

        const ffqs = UserPreferences.find({ ffqAnswers: { $exists: true }, userid: { $nin: testUserIds } }).fetch();
        const nbFinishedUsers = UserPreferences.find({ finished: { $exists: true }, userid: { $nin: testUserIds } }).fetch()?.length;

        // mongo aggregate is not supported in meteor client
        const allConfirmedOrders = OrdersCollection.find({ "confirmed": true, userid: { $nin: testUserIds } }).fetch();
        const tempConfirmedOrders = _.groupBy(_.countBy(allConfirmedOrders, "userid"), (value, key) => value);
        const confirmedOrders = _.map(tempConfirmedOrders, (value, key) => { return { "nbOrders": key, "count": value.length } });

        const allNonVirtualConfirmedOrders = OrdersCollection.find({ "confirmed": true, "confirmedVirtual": false, userid: { $nin: testUserIds } }).fetch();
        const tempNonVirtualConfirmedOrders = _.groupBy(_.countBy(allNonVirtualConfirmedOrders, "userid"), (value, key) => value);
        const nonVirtualConfirmedOrders = _.map(tempNonVirtualConfirmedOrders, (value, key) => { return { "nbOrders": key, "count": value.length } });


        const allLogs = LogsCollection.find({ userid: { $nin: testUserIds } }).fetch();
        console.log(allLogs.length);

        console.log(_.groupBy(allLogs, "component"));
        console.log(_.groupBy(allLogs, "method"));
        console.log(_.groupBy(allLogs, "agent"));

        return { nbFinishedUsers, allLogs, internBeerse, externBeerse, internGeel, externGeel, ffqs, allConfirmedOrders, confirmedOrders, nonVirtualConfirmedOrders }
    });

    function Order(props) {
        return <li>{props.label}: {props.value}</li>;
    }

    return (
        <Container>
            <Typography className={classes.header} variant="h4">
                Number of participants
            </Typography>
            <Typography className={classes.header} variant="body1">
                Intern Beerse: {internBeerse.length}<br />
                Extern Beerse: {externBeerse.length}<br />
                Intern Geel: {internGeel.length}<br />
                Extern Geel: {externGeel.length}<br />
                Total number of participants: {internBeerse.length + externBeerse.length + internGeel.length + externGeel.length}
            </Typography>

            <Typography className={classes.header} variant="h4">
                General statistics
            </Typography>
            <Typography className={classes.header} variant="body1">
                Number of complete ffqs: {ffqs.length}<br />
                Number of finished users: {nbFinishedUsers}<br />
                Number of user with confirmed orders: {_.sumBy(confirmedOrders, order => +order.count)}<br />
            </Typography>

            <ul style={{ "listStyleType": "none" }}>
                {_.map(_.groupBy(allLogs, "method"), (value, key1) => <Order key={"nbOrder-" + key} value={value.length} label={key1} />)}
            </ul>


            <ul style={{ "listStyleType": "none" }}>
                {confirmedOrders.map((orders, i) => <Order key={"nbOrder-" + i} value={orders.count} label={orders.nbOrders} />)}
            </ul>
            Number of user with orders at location: {_.sumBy(nonVirtualConfirmedOrders, order => +order.count)}<br />
            <ul style={{ "listStyleType": "none" }}>
                {nonVirtualConfirmedOrders.map((orders, i) => <Order key={"nbOrder-" + i} value={orders.count} label={orders.nbOrders} />)}
            </ul>

            {/* <ol>
                {codes.map((code, i) => <Code key={"code-" + i} code={code} />)}
            </ol> */}
            <Button type="submit"
                variant="contained"
                color="primary"
                style={{ color: "white" }}
                onClick={() => Meteor.logout()}>
                {i18n.__("AppBarPersfo.logout")}
            </Button>
        </Container>
    );
}