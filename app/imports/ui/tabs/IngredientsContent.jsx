import { Button, Tab, Tabs } from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteIcon from "@material-ui/icons/Favorite";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';

export const IngredientsContent = ({ recipe }) => {

    const [componentHeight, setComponentHeight] = useState(window.innerHeight);

    const useStyles = makeStyles(() => ({
        subtitle: {
            color: "#717171",
            width: "100%",
            display: "flex",
            fontSize: "12px",
            alignItems: "center",
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: "0px",
            textTransform: "uppercase",
        },
        ingredientBox: {
            padding: "8px",
            border: "1px solid #F57D20",
            borderRadius: "10px",
            color: "#F57D20",
        },
    }));

    const classes = useStyles();

    const { ingredients } = useTracker(() => {
        const noDataAvailable = {
            ingredients: []
        };
        const handler = Meteor.subscribe("userpreferences");

        if (!Meteor.user() || !handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });

        const cleanedIngredients = userPreferences.languageChosen === "nl" ? recipe.cleanedIngredients : recipe.cleanedIngredientsEN;

        let tempIngredients = [];
        if (cleanedIngredients) {
            tempIngredients = cleanedIngredients;
        }
        const ingredients = tempIngredients;

        return {  ingredients };
    });


    if (_.isEmpty(ingredients) || ingredients[0] === "")
        render = (
            <p style={{ color: "#afafaf", fontSize: "11px", padding: "8px" }}>
                {" "}{i18n.__("errors.no_ingredients")}{" "}
            </p>
        );
    return (
        <>
            <h1 className={classes.subtitle}>{" "}{i18n.__("general.ingredients")}{" "}</h1>
            <div style={{
                overflowY: "scroll",
                height: componentHeight - 325 - 65 - 30 - 60 + "px"
            }}>
                <div
                    style={{
                        display: "flex",
                        columnGap: "8px",
                        flexWrap: "wrap",
                        rowGap: "8px",
                    }}
                >
                    {_.map(ingredients, function (a, i) {
                        return (
                            <div className={classes.ingredientBox} key={i}>
                                {a}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};