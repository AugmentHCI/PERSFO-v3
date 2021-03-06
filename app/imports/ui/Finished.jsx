
import { Box, Container, Link, Typography } from "@material-ui/core";
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

const componentName = "Finished";
export const Finished = () => {

    const classes = useStyles();

    const { code, report } = useTracker(() => {
        const noDataAvailable = { code: "", report: "" };

        const preferencesHandler = Meteor.subscribe("userpreferences");
        const ordersHandler = Meteor.subscribe("orders");

        if (!Meteor.user() || !preferencesHandler.ready() || !ordersHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });

        let orders = OrdersCollection.find({ userid: Meteor.userId() }).fetch();
        let confirmedOrders = OrdersCollection.find({ userid: Meteor.userId(), confirmed: true }).fetch();

        const code = (confirmedOrders?.length + 7) + "-" + userPreferences.finished.substring(0, 8) + "-" + (orders?.length + 13);

        const report = userPreferences?.food4me?.ReportUrl;
        return { code, report }
    });

    return (
        <Container>
            <Typography className={classes.header} variant="body1">
                {i18n.__("finished.thanks")}
            </Typography>
            <Typography className={classes.header} variant="body1">
                {i18n.__("finished.personal_code")}
            </Typography>
            <Typography align="center" variant="h3">{code}</Typography>
            <Typography className={classes.header} variant="body1">
                {i18n.__("finished.download")}
            </Typography>
            <Box textAlign='center'>
                <Link variant="h3" href={report}>{i18n.__("finished.report")}</Link>
            </Box>
        </Container>
    );
}