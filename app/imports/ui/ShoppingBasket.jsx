import { Button, Divider, IconButton, Snackbar, SwipeableDrawer, Typography } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { grey } from '@material-ui/core/colors';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { getImage } from '../api/apiPersfo';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';

const useStyles = makeStyles(() => ({
    list: {
        width: 300,
    },
    counterButtons: {
        maxHeight: "10px"
    },
    deleteButtons: {
        marginRight: "10px"
    },
    header: {
        marginTop: "20px",
        alignSelf: "center",
    },
    complete: {
        margin: "10px",
        minWidth: "280px"
    },
    undoToast: {
        marginBottom: "40px"
    }
}));

const GroupedButtons = ({ recipeId }) => {
    const { counter } = useTracker(() => {
        const noDataAvailable = { counter: 1 };
        const handler = Meteor.subscribe("orders");
        if (!handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        // find only orders made today
        const now = new Date();
        const order = OrdersCollection.findOne({
            userid: Meteor.userId(),
            orderday: now.toISOString().substring(0, 10),
            recipeId: recipeId
        });
        const counter = order.amount;
        return { counter };
    });

    handleIncrement = () => {
        Meteor.call('orders.incrementOrder', recipeId);
        Meteor.call("log", "GroupedButtons", "handleIncrement", navigator.userAgent, recipeId);
    };

    handleDecrement = () => {
        if (counter > 1) {
            Meteor.call('orders.decrementOrder', recipeId);
            Meteor.call("log", "GroupedButtons", "handleDecrement", navigator.userAgent, recipeId);
        }
    };

    return (
        <ButtonGroup size="small" aria-label="small outlined button group" orientation="vertical">
            <Button onClick={handleIncrement}>+</Button>
            <Button variant="contained" disabled={true}>{counter}</Button>
            <Button onClick={this.handleDecrement} disabled={counter <= 1}>-</Button>
        </ButtonGroup>
    );
}

const componentName = "ShoppingBasket";
export const ShoppingBasket = ({ drawerOpen, toggleDrawer }) => {

    const [componentHeight, setComponentHeight] = useState(window.innerHeight);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [deletedRecipe, setDeletedRecipe] = useState({ name: "", recipeId: "" });
    const [deletedOrderAmount, setDeletedOrderAmount] = useState(0);

    const classes = useStyles();

    const { orders, totalPrice } = useTracker(() => {
        const noDataAvailable = { orders: [], totalPrice: 0 };
        const handler = Meteor.subscribe("orders");
        const recipeHandler = Meteor.subscribe("recipes");

        if (!handler.ready() || !recipeHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        // find only orders made today
        const now = new Date();
        const orders = OrdersCollection.find({
            userid: Meteor.userId(),
            orderday: now.toISOString().substring(0, 10),
        }).fetch();

        let totalPriceTemp = 0;
        orders.forEach(order => {
            const recipe = RecipesCollection.findOne({ id: order.recipeId });
            totalPriceTemp += (recipe.current_sell_price.pricing * order.amount);
        });

        const totalPrice = totalPriceTemp;

        return { orders, totalPrice };
    });

    const handleRemove = (order) => () => {
        setOpenConfirmation(true);
        setDeletedOrderAmount(order.amount);
        setDeletedRecipe(RecipesCollection.findOne({ id: order.recipeId }));
        Meteor.call('orders.removeOrder', order.recipeId);
        Meteor.call("log", componentName, "handleRemove", navigator.userAgent, order.recipeId);
    };

    const handleCloseConfirmation = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenConfirmation(false);
    };

    const handleUndoDelete = (deletedRecipe, deletedOrderAmount) => {
        Meteor.call('orders.undoRemoveOrder', deletedRecipe.id, deletedOrderAmount);
        setOpenConfirmation(false);
        Meteor.call("log", componentName, "handleUndoDelete", navigator.userAgent, deletedRecipe.id);
    };

    const submit = () => {
        Meteor.call('orders.confirmOrders');
        toggleDrawer(false).call(); // not sure why call is needed here, but does not work without.
        Meteor.call("log", componentName, "confirmOrders", navigator.userAgent);
    }

    const submitVirtual = () => {
        Meteor.call('orders.confirmVirtualOrders');
        toggleDrawer(false).call(); // not sure why call is needed here, but does not work without.
        Meteor.call("log", componentName, "confirmVirtualOrders", navigator.userAgent);
    }

    const action = (
        <>
            <Button color="secondary" size="small" onClick={() => handleUndoDelete(deletedRecipe, deletedOrderAmount)}>
                {i18n.__("general.cancel")}
            </Button>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseConfirmation}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </>
    );

    return (
        <SwipeableDrawer
            anchor="right"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
        >
            <Typography className={classes.header} variant="h4" color="primary">
                {i18n.__("shopping.shopping_cart")}
            </Typography>
            {orders.length > 0 ?
                <div
                    style={{
                        overflowY: "scroll",
                        height: componentHeight - 120 + "px",
                    }}
                >
                    <List className={classes.list}>
                        {orders.map((value) => {
                            const labelId = `checkbox-list-secondary-label-${value.recipeId}`;
                            const recipe = RecipesCollection.findOne({ id: value.recipeId });
                            return (
                                <div key={value.recipeId}>
                                    <ListItem button>
                                        <ListItemAvatar>
                                            <Avatar
                                                alt={`Avatar n°${value.recipeId}`}
                                                src={getImage(recipe)}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText id={labelId} primary={recipe.name} secondary={"prijs: € " + recipe.current_sell_price.pricing.toFixed(2)} />
                                        <DeleteIcon className={classes.deleteButtons} onClick={handleRemove(value)} style={{ color: grey[500] }} />
                                        <GroupedButtons recipeId={value.recipeId} className={classes.counterButtons}></GroupedButtons>
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </div>
                            );
                        })}
                    </List>
                </div>
                :
                <Typography className={classes.header} variant="body1" style={{ height: componentHeight - 120 + "px" }} >
                    {i18n.__("shopping.empty")}
                </Typography>
            }
            <Typography className={classes.header} variant="subtitle1" color="primary">
                {i18n.__("shopping.total_price")}{": € " + totalPrice.toFixed(2)}
            </Typography>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.complete}
                disabled={orders.length > 0 ? false : true}
                onClick={submitVirtual}
                style={{ color: "white" }}
            >
                {i18n.__("shopping.virtual_confirm")} ({orders.reduce((s, f) => s + f.amount, 0)})
            </Button>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.complete}
                disabled={orders.length > 0 ? false : true}
                onClick={submit}
                style={{ color: "white" }}
            >
                {i18n.__("shopping.confirm")} ({orders.reduce((s, f) => s + f.amount, 0)})
            </Button>
            <Snackbar
                open={openConfirmation}
                autoHideDuration={2500}
                onClose={handleCloseConfirmation}
                message={"Removed: " + deletedRecipe.name}
                action={action}
                className={classes.undoToast}
            />
        </SwipeableDrawer >
    );
};
