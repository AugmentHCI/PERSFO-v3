import React, { useState } from "react";
import { capitalizeFirstLetter } from "/imports/api/auxMethods";
import { useTracker } from "meteor/react-meteor-data";
import { makeStyles } from "@material-ui/core/styles";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import { green, red } from "@material-ui/core/colors";

export const AllergiesContent = ({ recipe }) => {

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
        allergenBox: {
            padding: "8px",
            border: "1px solid " + green[300],
            borderRadius: "10px",
            color: green[300],
        },
        activeAllergenBox: {
            padding: "8px",
            border: "1px solid " + red[300],
            background: red[300],
            borderRadius: "10px",
            color: "white",
        },
    }));

    const classes = useStyles();

    const { userAllergens, recipeAllergens } = useTracker(() => {
        const noDataAvailable = {
            userAllergens: [],
            recipeAllergens: [],
        };
        const handler = Meteor.subscribe("userpreferences");
        if (!recipe || !Meteor.user() || !handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });

        const userAllergens = userPreferences?.allergens ? _.map(userPreferences?.allergens, a => a.allergen) : [];

        const recipeAllergens = _.without(
            _.map(_.toPairs(recipe.allergens), (n) => {
                if (n[1] == 1) return n[0];
            }),
            undefined
        ).sort();

        return { userAllergens, recipeAllergens };
    });


    let render = _.map(recipeAllergens, (allergy, i) => {
        let className = userAllergens.includes(allergy) ? classes.activeAllergenBox : classes.allergenBox;
        return (
            <div className={className} key={i}>
                {capitalizeFirstLetter(allergy.replace(/_/g, " "))}
            </div>
        );
    });

    if (_.isEmpty(recipeAllergens))
        render = (
            <p style={{ color: "#afafaf", fontSize: "11px", padding: "8px" }}>
                {" "}{i18n.__("general.no_data")}{" "}
            </p>
        );

    return (
        <>
            <h1 className={classes.subtitle}>Allergens</h1>
            <div style={{ overflowY: "scroll", height: componentHeight - 325 - 65 - 30 - 60 + "px" }}>
                <div
                    style={{
                        display: "flex",
                        columnGap: "8px",
                        flexWrap: "wrap",
                        rowGap: "8px",
                    }}
                >
                    {render}
                </div>
            </div>
        </>
    );
};