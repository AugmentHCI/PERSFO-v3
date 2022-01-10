import { LinearProgress } from "@material-ui/core/";
import { withStyles } from "@material-ui/core/styles";
import React from "react";


export const NutrientsBar = ({ title, value, maxValue, unit, color, hideMaxValue }) => {
    if (value >= maxValue) {
        maxValue = value;
    }
    const normalise = ((value - 0) * 100) / (maxValue - 0);
    return (
        <div style={{ padding: "4px", marginBottom: "8px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                }}
            >
                <div style={{ color: "#717171", fontSize: "12px" }}>
                    {title}
                </div>
                <div style={{ color: "#717171", fontSize: "12px" }}>
                    {hideMaxValue ? (value * 100).toFixed(1) : value.toLocaleString()}
                    {hideMaxValue ? "" : "/"}
                    <span style={{ color: color }}>
                        {hideMaxValue ? "" : (maxValue < 0.001 ? 0 : maxValue.toLocaleString())}
                    </span>
                    &nbsp;{String(unit)}
                </div>
            </div>
            <BorderLinearProgress variant="determinate" value={normalise} />
        </div>
    );
};

const BorderLinearProgress = withStyles((theme) => ({
    colorPrimary: {
        backgroundColor:
            theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
    }
}))(LinearProgress);