import { Tab, Tabs } from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import CheckIcon from "@material-ui/icons/Check";
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import MuiAlert from "@material-ui/lab/Alert";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { LikeButton } from "./components/LikeButton";
import { OrderButton } from "./components/OrderButton";
import { getNutriscoreImage } from "/imports/api/apiPersfo";
import { getRecipePrice, getDietaryRecommendation } from "/imports/api/auxMethods";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';

const componentName = "DetailScreen";
export const DetailScreen = ({ recipe, allergensPresent, renderTabContent, tabTitles, translatedName, recommended }) => {
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
      height: componentHeight - 360 - 65 - heightBuffer + "px",
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

  const { status, userPreferences } = useTracker(() => {
    const noDataAvailable = {
      status: "test",
      userPreferences: {}
    };
    const handler = Meteor.subscribe("userpreferences");

    if (!Meteor.user() || !handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });

    const status = userPreferences.ffqAnswers.status_survey;

    return { status, userPreferences };
  });

  // Thank you message
  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  const [toastShown, setToast] = useState(true);

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
              <h1 className={String(translatedName).length < 40
                ? classes.menuTitle
                : classes.menuTitleLong}
                style={allergensPresent ? { color: red[300] } : {}}
              >
                {translatedName}
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
              <span className={classes.pricing}>{getRecipePrice(recipe, status)}</span>
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
        <Snackbar
          open={toastShown}
          autoHideDuration={6000}
          onClose={() => setToast(false)}
        >
          <Alert
            onClose={() => setToast(false)}
            icon={<CheckIcon fontSize="inherit" />}
            variant="outlined"
            severity="warning">
            { getDietaryRecommendation(recipe, userPreferences, recommended) }
          </Alert>
        </Snackbar>
      </div>
    )
  } else {
    return null; // no recipe loaded yet.
  }
};
