import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import MuiAlert from "@material-ui/lab/Alert";
import React, { useState } from "react";
import { RecipeComponent } from './RecipeComponent';
import { getElementID } from "/imports/api/apiPersfo";

const useStyles = makeStyles((persfoTheme) => ({
  titleContent: {
    display: "flex",
    alignItems: "center",
    height: "40px",
  },
  title: {
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "Roboto",
    margin: "4px",
    color: "#726f6c",
  },
  info: {
    position: "relative",
    top: persfoTheme.spacing(0.5),
    left: persfoTheme.spacing(1),
  },
  otherMeals: {
    display: "flex",
    overflowX: "scroll",
    columnGap: "16px",
    padding: "4px",
  },
}));

// recipeURL come from menu --> courses
const componentName = "TabHomeScreen";
export const TabHomeScreen = ({ recommendedRecipe, recipeURLs, courseName }) => {
  const classes = useStyles();

  // const handleInfo = () => {
  //   OpenRecommenderExplanations.set([recommendedRecipe])
  //   // setToast(true);
  //   Meteor.call("log", componentName, "handleInfo", navigator.userAgent);
  // };

  const [componentHeight, setComponentHeight] = useState(window.innerHeight);

  // Info message
  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  const [toastShown, setToast] = useState(false);

  return (
    <>
      {componentHeight >= 640 ? (
        <div className={classes.titleContent}>
          <h1 className={classes.title}>{i18n.__("app.today_options")}{" " + courseName}</h1>
          <IconButton></IconButton>
        </div>
      ) : null}
      <div className={classes.otherMeals}>
        {_.map(recipeURLs, function (recipe, i) {
          return (
            <RecipeComponent
              recipeId={getElementID(recipeURLs[i])}
              type="other"
              key={getElementID(recipeURLs[i])} // key needed for list
            ></RecipeComponent>
          );
        })}
      </div>

      {(recommendedRecipe !== null) ?
        (
          <>
            <div className={classes.titleContent}>
              <h1 className={classes.title}>{i18n.__("app.today_recommendation")}</h1>
              {/* <IconButton onClick={handleInfo}>
                <HelpOutlineIcon />
              </IconButton> */}
            </div>
            <div style={{ padding: "4px" }}>
              <RecipeComponent
                recipeId={recommendedRecipe.id}
                type="recommended"
              ></RecipeComponent>
            </div>
          </>
        ) :
        <></>
      }

      <Snackbar
        open={toastShown}
        autoHideDuration={6000}
        onClose={() => setToast(false)}
      >
        <Alert onClose={() => setToast(false)} severity="info">
          {i18n.__("app.temp_explanation")}
        </Alert>
      </Snackbar>
    </>
  );
};