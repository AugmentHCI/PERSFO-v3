import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { RecommendedRecipes } from '/imports/db/recommendedRecipes/RecommendedRecipes';
import { ExplanationSnackbar } from "/imports/ui/components/ExplanationSnackbar";
import { NutrientsBar } from "/imports/ui/components/NutrientsBar";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';


const componentName = "FoodPreferencesContext"
export const FoodPreferencesContext = ({ recipe }) => {

    const [componentHeight, setComponentHeight] = useState(window.innerHeight);

    const useStyles = makeStyles(() => ({
        subtitle: {
            color: "#717171",
            width: "100%",
            display: "flex",
            fontSize: "12px",
            alignItems: "center",
            fontWeight: 600,
            letterSpacing: "0px",
            textTransform: "uppercase",
            marginBottom: "-15px",
            marginTop: "-5px",
        },
        auxiliaryText: {
            color: "#afafaf",
            fontSize: "11px",
            padding: "8px"
        },
        statNum: {
            color: "#F57D20",
            fontWeight: 600,
            fontSize: "14px",
        },
    }));

    const classes = useStyles();

    const { recommendationIngredients, filteredIngredients, totalValue } = useTracker(() => {
        const noDataAvailable = { filteredIngredients: [], filteredIngredients: [], totalValue: 0 };
        const recommendationHandler = Meteor.subscribe("recommendedrecipes");
        const orderHandler = Meteor.subscribe("orders");
        const recipeHandler = Meteor.subscribe("recipes");
        const userpreferencesHandler = Meteor.subscribe("userpreferences");

        if (!recipe || !Meteor.user() || !recommendationHandler.ready() || !orderHandler.ready() || !recipeHandler.ready() || !userpreferencesHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const recommendedRecipes = RecommendedRecipes.findOne({ userid: Meteor.userId() }).recommendations;
        const recommendation = _.sortBy(recommendedRecipes, r => -r.pop)[0];
        const recommendationIngredients = recommendation.cleanedIngredients;
        const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });


        if(userPreferences.orderBasedRecommendations) {

        } else {

        }

        const allOrders = OrdersCollection.find({ recipeId: recipe.id, userid: Meteor.userId() }).fetch()

        let allIngredients = {};
        allOrders.forEach(order => {
            let ingredients = RecipesCollection.findOne({ id: order.recipeId })?.cleanedIngredients;
            ingredients.forEach((ingredient) => {
                allIngredients[ingredient] = allIngredients[ingredient] ? allIngredients[ingredient] + 1 : 1;
            });
        });
        const favoriteIngredients = _.sortBy(_.map(allIngredients, (count, ingredient) => {
            return { "name": ingredient, "value": count }
        }), s => -s.value);

        const filteredIngredients = _.filter(favoriteIngredients, fav => {
            return _.includes(recommendationIngredients, fav.name);
        });

        let totalValue = 0;
        filteredIngredients.forEach(e => totalValue += Math.abs(e.value));

        return { filteredIngredients, favoriteIngredients, totalValue };
    });

    const [toastShown, setToast] = useState(false);

    const handleInfo = () => {
        setToast(true);
        Meteor.call("log", componentName, "handleInfo", navigator.userAgent);
    };

    // TODO real match number
    return (
        <>
            <h1 className={classes.subtitle}>
                {i18n.__("general.preferences") + " (25%)"}
                <IconButton onClick={handleInfo}>
                    <HelpOutlineIcon />
                </IconButton>
            </h1>
            <div style={{
                overflowY: "scroll",
                height: componentHeight - 325 - 65 - 30 - 60 + "px",
            }}>
                <p className={classes.auxiliaryText}>
                    Deze maaltijd heeft een match van <span className={classes.statNum}>{" " + Math.round(Math.random() * 100) + "% "}</span> met je eerder gekozen maaltijden.
                    {filteredIngredients.length > 0 ? " Onderstaande ingrediënten hebben bijgedragen aan de score." : ""}
                </p>
                {filteredIngredients.length > 0 ?
                    <>
                        {_.map(filteredIngredients, (ingredient) => {
                            return (
                                <NutrientsBar
                                    key={ingredient.name + "-key"}
                                    title={ingredient.name}
                                    value={Math.abs(ingredient.value) / totalValue}
                                    maxValue={1}
                                    hideMaxValue={true}
                                    color={"#F57D20"}
                                    unit={"%"}
                                />
                            )
                        })}
                    </>
                    :
                    <>
                    </>
                }
            </div>
            <ExplanationSnackbar toastShown={toastShown} setToast={setToast} text={i18n.__("general.preferences_explanation")}></ExplanationSnackbar>
        </>
    )

};