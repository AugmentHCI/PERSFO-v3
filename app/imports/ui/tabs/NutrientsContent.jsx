import { makeStyles } from "@material-ui/core/styles";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import {
    calculateNutrientforRecipe
} from "/imports/api/apiPersfo";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import { NutrientsBar } from "/imports/ui/components/NutrientsBar";

export const NutrientsContent = ({ recipe }) => {

    const [componentHeight, setComponentHeight] = useState(window.innerHeight);

    //in component style due to dynamic height.
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
        }
    }));

    const classes = useStyles();

    const { nutrientGoals } = useTracker(() => {
        const noDataAvailable = { nutrientGoals: {} };
        const handler = Meteor.subscribe("userpreferences");
        if (!recipe || !Meteor.user() || !handler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });

        let nutrientGoals = {};
        try {
            const userNutrientGoals = userPreferences.nutrientGoals;
            const userActiveNutrientGoals = userPreferences.activeNutrientGoals;
            _.keys(userActiveNutrientGoals).forEach((key) => {
                if (userActiveNutrientGoals[key]) {
                    nutrientGoals[key] = userNutrientGoals[key] + 0.0000001; // otherwise considered false
                }
            });
        } catch (error) { }
        return { nutrientGoals };
    });

    const r = recipe.nutrition_info;
    let kcal = calculateNutrientforRecipe(recipe, "kcal");
    let fat = calculateNutrientforRecipe(recipe, "fat");
    let sat = calculateNutrientforRecipe(recipe, "saturated_fat");
    let sug = calculateNutrientforRecipe(recipe, "sugar");
    let prot = calculateNutrientforRecipe(recipe, "protein");
    let fibr = calculateNutrientforRecipe(recipe, "fibre");
    let potss = calculateNutrientforRecipe(recipe, "potassium");
    let ukcal = "";
    try {
        ukcal = r.kcal.unit;
    } catch (e) { }
    let ufat = "";
    try {
        ufat = r.fat.unit;
    } catch (e) { }
    let usat = "";
    try {
        usat = r.saturated_fat.unit;
    } catch (e) { }
    let usug = "";
    try {
        usug = r.sugar.unit;
    } catch (e) { }
    let uprot = "";
    try {
        uprot = r.protein.unit;
    } catch (e) { }
    let ufibr = "";
    try {
        ufibr = r.fibre.unit;
    } catch (e) { }
    let upotss = "";
    try {
        upotss = r.potassium.unit;
    } catch (e) { }

    let noData = null;
    if (_.sum([kcal, fat, sat, sug, prot, fibr, potss]) == 0)
        noData = (
            <p style={{ color: "#afafaf", fontSize: "11px", padding: "8px" }}>
                {" "}{i18n.__("general.no_data")}{" "}
            </p>
        );

    return (
        <>
            <h1 className={classes.subtitle}>
                {i18n.__("general.nutrients")}
            </h1>
            <div
                style={{
                    overflowY: "scroll",
                    height: componentHeight - 325 - 65 - 30 - 60 + "px",
                }}
            >
                {noData}
                {kcal == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.energy")}
                        value={kcal}
                        maxValue={
                            nutrientGoals["energy"] ? nutrientGoals["energy"] : 2500
                        }
                        unit={ukcal}
                        color={nutrientGoals["energy"] ? "#F57D20" : undefined}
                    />
                )}
                {fat == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.total_fat")}
                        value={fat}
                        maxValue={
                            nutrientGoals["totalFat"] ? nutrientGoals["totalFat"] : 77
                        }
                        color={nutrientGoals["totalFat"] ? "#F57D20" : undefined}
                        unit={ufat}
                    />
                )}
                {sat == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.saturated_fats")}
                        value={sat}
                        maxValue={nutrientGoals["satFat"] ? nutrientGoals["satFat"] : 20}
                        color={nutrientGoals["satFat"] ? "#F57D20" : undefined}
                        unit={usat}
                    />
                )}
                {sug == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.sugar")}
                        value={sug}
                        maxValue={nutrientGoals["sugar"] ? nutrientGoals["sugar"] : 36}
                        color={nutrientGoals["sugar"] ? "#F57D20" : undefined}
                        unit={usug}
                    />
                )}
                {prot == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.proteins")}
                        value={prot}
                        maxValue={
                            nutrientGoals["protein"] ? nutrientGoals["protein"] : 56
                        }
                        color={nutrientGoals["protein"] ? "#F57D20" : undefined}
                        unit={uprot}
                    />
                )}
                {fibr == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.fibers")}
                        value={fibr}
                        maxValue={nutrientGoals["fiber"] ? nutrientGoals["fiber"] : 30}
                        color={nutrientGoals["fiber"] ? "#F57D20" : undefined}
                        unit={ufibr}
                    />
                )}
                {potss == 0 ? null : (
                    <NutrientsBar
                        title={i18n.__("general.potasium")}
                        value={potss}
                        maxValue={6000}
                        unit={upotss}
                    />
                )}
            </div>
        </>
    );
};