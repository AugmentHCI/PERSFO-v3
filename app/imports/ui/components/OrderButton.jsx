import { Button } from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import CheckIcon from "@material-ui/icons/Check";
import MuiAlert from "@material-ui/lab/Alert";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';


const useStyles = makeStyles(() => ({
    OrderAllergyPresentFloatingButton: {
        color: "white",
        backgroundColor: red[300] + "!important", // important needed, if not only updates after random click...
        borderRadius: "14px",
    },
    OrderAllergyPresentButton: {
        color: red[500],
    },
    OrderButton: {
        color: "#F57D20",
    },
    OrderFloatingButton: {
        color: "white",
        backgroundColor: "#F57D20" + "!important",
        borderRadius: "14px",
    },
    OrderedFloatingButton: {
        color: "#F57D20",
        backgroundColor: red[100] + "!important",
        borderRadius: "14px",
    },
}));

const componentName = "OrderButton";
export const OrderButton = ({ recipe, allergensPresent, dietaryConflict, floating }) => {
    const classes = useStyles();

    // order logic
    const handleOrder = () => {
        if (recipe) {
            if (!ordered) setToast(true);
            Meteor.call("orders.handleOrder", recipe.id);
            Meteor.call("log", componentName, "handleOrder", navigator.userAgent);
        }
    };

    const { ordered, confirmed } = useTracker(() => {
        const noDataAvailable = { ordered: false };
        const handler = Meteor.subscribe("orders");
        if (!handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }
        if (!recipe) return { ...noDataAvailable };

        // find only orders made today
        const now = new Date();
        const nowString = now.toISOString().substring(0, 10);

        const orders = OrdersCollection.find({
            userid: Meteor.userId(),
            recipeId: recipe.id,
            orderday: nowString,
        }).fetch();
        const ordered = orders.length > 0;

        let randomConfirmedOrderToday = OrdersCollection.findOne({ userid: Meteor.userId(), orderday: nowString, confirmed: true });
        const confirmed = randomConfirmedOrderToday !== undefined;

        return { ordered, confirmed };
    });

    // Thank you message
    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }
    const [toastShown, setToast] = useState(false);

    return (
        <>
            <Button
                className={
                    ordered ?
                        classes.OrderedFloatingButton
                        :
                        floating ?
                            (
                                (allergensPresent || dietaryConflict) ?
                                    classes.OrderAllergyPresentFloatingButton
                                    :
                                    classes.OrderFloatingButton
                            )
                            :
                            (
                                (allergensPresent || dietaryConflict) ?
                                    classes.OrderAllergyPresentButton
                                    :
                                    classes.OrderButton
                            )
                }
                aria-label="add"
                size="large"
                onClick={() => handleOrder()}
                disabled={confirmed}

            >
                {ordered ? i18n.__("orderLogic.ordered") : i18n.__("orderLogic.order")}
            </Button>
            <Snackbar
                open={toastShown}
                autoHideDuration={6000}
                onClose={() => setToast(false)}
            >
                <Alert
                    onClose={() => setToast(false)}
                    icon={<CheckIcon fontSize="inherit" />}
                    variant={(allergensPresent || dietaryConflict) ? "filled" : "outlined"}
                    severity={(allergensPresent || dietaryConflict) ? "error" : "warning"}>
                    {(allergensPresent || dietaryConflict) ? i18n.__("shopping.warning") : i18n.__("shopping.added")}
                </Alert>
            </Snackbar>
        </>
    )

}