import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { RecommendedRecipes } from '/imports/db/recommendedRecipes/RecommendedRecipes';
import { ExplanationSnackbar } from "/imports/ui/components/ExplanationSnackbar";
import { NutrientsBar } from "/imports/ui/components/NutrientsBar";

const componentName = "Food4MeContent";
export const Food4MeContent = ({ recipe }) => {

    const [componentHeight, setComponentHeight] = useState(window.innerHeight);

    const useStyles = makeStyles(() => ({
        ecoscore: {
            height: "64px",
        },
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
    }));

    const classes = useStyles();

    const { lowExplanations, highExplanations, totalValue } = useTracker(() => {
        const noDataAvailable = { lowExplanations: [], highExplanations: [] };
        const recommendationHandler = Meteor.subscribe("recommendedrecipes");
        if (!recipe || !Meteor.user() || !recommendationHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const recommendedRecipes = RecommendedRecipes.findOne({ userid: Meteor.userId() }).recommendations;
        const explanations = _.filter(_.sortBy(recommendedRecipes, r => -r.food4meRanking)[0].explanations, e => e.value !== 0);

        let totalValue = 0;
        explanations.forEach(e => totalValue += Math.abs(e.value));

        const lowExplanations = _.filter(explanations, e => e.rating == "LOW");
        const highExplanations = _.filter(explanations, e => e.rating == "HIGH");

        return { lowExplanations, highExplanations, totalValue };
    });

    const [toastShown, setToast] = useState(false);

    const handleInfo = () => {
        setToast(true);
        Meteor.call("log", componentName, "handleInfo", navigator.userAgent);
    };

    const getListNutrients = (explanations) => {
        let combined = _.map(explanations, (e => i18n.__("food4me." + e.food4me)));
        let result = "";
        for (let i = 0; i < combined.length; i++) {
            if (i !== combined.length - 1) {
                result += combined[i] + ", ";
            } else if (i == 0) {
                result += combined[i];
            } else {
                result += i18n.__("general.and") + " " + combined[i];
            }
        }
        return result;
    }

    return (
        <>
            <h1 className={classes.subtitle}>
                {i18n.__("general.personal_advise") + " (65%)"}
                <IconButton onClick={handleInfo}>
                    <HelpOutlineIcon />
                </IconButton>
            </h1>
            <div style={{
                overflowY: "scroll",
                height: componentHeight - 325 - 65 - 30 - 60 + "px",
            }}>
                {lowExplanations.length > 0 ?
                    <>
                        <p className={classes.auxiliaryText}>
                            {i18n.__("food4me.plus_part_1") + " " + getListNutrients(lowExplanations) + i18n.__("food4me.plus_part_2")}
                        </p>
                        {_.map(lowExplanations, (explanation) => {
                            return (
                                <NutrientsBar
                                    key={explanation.food4me + "-key"}
                                    title={i18n.__("food4me." + explanation.food4me)}
                                    value={(Math.abs(explanation.value) / totalValue)}
                                    maxValue={1}
                                    hideMaxValue={true}
                                    color={"#F57D20"}
                                    unit={"%"}
                                />
                            )
                        })}</> :
                    <></>
                }

                {highExplanations.length > 0 ?
                    <>
                        <p className={classes.auxiliaryText}>
                            {i18n.__("food4me.min_part_1") + " " + getListNutrients(highExplanations) + " " + i18n.__("food4me.min_part_2")}
                        </p>
                        {_.map(highExplanations, (explanation) => {
                            return (
                                <NutrientsBar
                                    key={explanation.food4me + "-key"}
                                    title={i18n.__("food4me." + explanation.food4me)}
                                    value={Math.abs(explanation.value) / totalValue}
                                    maxValue={1}
                                    hideMaxValue={true}
                                    color={"#F57D20"}
                                    unit={"%"}
                                />
                            )
                        })}</> :
                    <></>
                }
            </div>
            <ExplanationSnackbar toastShown={toastShown} setToast={setToast} text={i18n.__("food4me.explanation")}></ExplanationSnackbar>
        </>
    );
};