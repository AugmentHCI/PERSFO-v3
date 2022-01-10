import { Tab, Tabs } from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import React, { useState } from "react";
import { LikeButton } from "./components/LikeButton";
import { OrderButton } from "./components/OrderButton";
import { getNutriscoreImage } from "/imports/api/apiPersfo";

const componentName = "DetailScreen";
export const DetailScreen = ({ recipe, allergensPresent, renderTabContent, tabTitles }) => {
  const [componentHeight, setComponentHeight] = useState(window.innerHeight);
  const [heightBuffer, setHeightBuffer] = useState(window.innerHeight >= 640 ? 60 : 0);

  //in component style due to dynamic height.
  const useStyles = makeStyles(() => ({
    mealTitleCard: {
      display: "flex",
      borderRadius: "60px 60px 0px 0px",
      width: "auto",
      height: "200px",
      marginTop: "12px",
      flexDirection: "column",
      background: "white",
    },
    menuTitle: {
      fontSize: "16px",
      fontWeight: 600,
      width: "184px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      textTransform: "uppercase",
      letterSpacing: "0px",
      lineHeight: 1.5,
      color: "#717171",
      fontFamily: "sans-serif",
    },
    menuTitleLong: {
      fontSize: "12px",
      fontWeight: 600,
      width: "184px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      textTransform: "uppercase",
      letterSpacing: "0px",
      lineHeight: 1.2,
      color: "#717171",
      fontFamily: "sans-serif",
    },
    nutriscore: {
      height: "32px",
    },
    tabFont: {
      fontSize: "10px",
    },
    pricing: {
      color: "#F57D20",
      fontFamily: "sans-serif",
      fontSize: "32px",
    },
    tabContent: {
      height: componentHeight - 325 - 65 - heightBuffer + "px",
      background: "white",
      padding: "8px",
      fontSize: "14px",
      fontFamily: "sans-serif",
    },
    gapInBetween: {
      display: "flex",
      flexDirection: "column",
      rowGap: "8px",
      justifyContent: "space-between"
    }
  }));

  const classes = useStyles();

  // tab logic
  const [tabValue, setTabValue] = useState(0);

  const changeTab = (event, newValue) => {
    setTabValue(newValue);
    Meteor.call("log", componentName, "changeTab", navigator.userAgent, newValue);
  };

  if (recipe) {
    return (
      <div className={classes.gapInBetween}>
        <div className={classes.mealTitleCard}>
          <div style={{ padding: "24px 24px 0px 24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1 className={String(recipe.name).length < 40
                ? classes.menuTitle
                : classes.menuTitleLong}
                style={allergensPresent ? { color: red[300] } : {}}
              >
                {recipe.name}
              </h1>
              {allergensPresent ? <WarningRoundedIcon style={{ color: red[300] }} /> : <></>}
              <img
                className={classes.nutriscore}
                src={getNutriscoreImage(recipe)}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <LikeButton recipe={recipe}></LikeButton>
              <span className={classes.pricing}>{"€" + recipe.current_sell_price?.pricing?.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <Tabs
              value={tabValue}
              onChange={changeTab}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              scrollButtons="auto"
              centered={true}
            >
              {_.map(tabTitles, (title, i) => {
                return (<Tab
                  key={title + "-" + i}
                  label={<span className={classes.tabFont}>{title}</span>}
                />)
              })}
            </Tabs>
          </div>
        </div>
        <div className={classes.tabContent}>
          {renderTabContent(tabValue)}
        </div>
        <OrderButton recipe={recipe} allergensPresent={allergensPresent} floating={true}></OrderButton>
      </div>
    )
  } else {
    return null; // no recipe loaded yet.
  }
};
