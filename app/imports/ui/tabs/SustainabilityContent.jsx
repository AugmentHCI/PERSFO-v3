import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { getEcoImage } from "/imports/api/apiPersfo";

export const SustainabilityContent = ({ recipe }) => {

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
            lineHeight: 1,
            letterSpacing: "0px",
            textTransform: "uppercase",
        },
    }));

    const classes = useStyles();

    return (
        <>
            <h1 className={classes.subtitle}>{i18n.__("sustainability.sustainability")}</h1>
            <div style={{
                overflowY: "scroll", 
                height: componentHeight - 325 - 65 - 30 - 60 + "px",
            }}>
                <h1 className={classes.subtitle}>{i18n.__("sustainability.labels")}</h1>
                <p style={{ color: "#afafaf", fontSize: "11px", padding: "8px" }}>
                    {" "}{i18n.__("general.no_data")}{" "}
                </p>
                <h1 className={classes.subtitle}>{i18n.__("sustainability.co2")}</h1>
                <p style={{ color: "#afafaf", fontSize: "11px", padding: "8px" }}>
                    <img
                        className={classes.ecoscore}
                        src={getEcoImage(recipe)}
                    />
                </p>
            </div>
        </>
    );
};