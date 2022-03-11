
import { Box, Button, Container, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { UserPreferences } from '../db/userPreferences/UserPreferences';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';


const useStyles = makeStyles(() => ({
    header: {
        margin: "20px",
    },
    complete: {
        display: "flex",
        justifyContent: "center"
    }
}));

const componentName = "FinishedTokens";
export const FinishedTokens = () => {

    const classes = useStyles();

    const { codes } = useTracker(() => {
        const noDataAvailable = { codes: [] };

        const preferencesHandler = Meteor.subscribe("userpreferences-tokens");
        const ordersHandler = Meteor.subscribe("orders");

        if (!Meteor.user() || !preferencesHandler.ready() || !ordersHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const allFinishedUserPreferences = UserPreferences.find({ finished: { $exists: true } }).fetch();

        let codes = [];
        allFinishedUserPreferences.forEach(prefs => {
            let orders = OrdersCollection.find({ userid: prefs.userid }).fetch();
            let confirmedOrders = OrdersCollection.find({ userid: prefs.userid, confirmed: true }).fetch();

            // querying subfields not supported yet in mongo driver
            if (prefs.ffqAnswers?.status_survey !== "test")
                codes.push((confirmedOrders?.length + 7) + "-" + prefs.finished.substring(0, 8) + "-" + (orders?.length + 13));
        });

        return { codes }
    });

    function Code(props) {
        return <li>{props.code}</li>;
    }

    return (
        <Container>
            <ol>
                {codes.map((code, i) => <Code key={"code-" + i} code={code} />)}
            </ol>
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