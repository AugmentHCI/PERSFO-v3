import { AppBar, IconButton } from "@material-ui/core/";
import Badge from '@material-ui/core/Badge';
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import MenuIcon from "@material-ui/icons/Menu";
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { useTracker } from "meteor/react-meteor-data";
import i18n from 'meteor/universe:i18n';
import React, { useEffect, useState } from "react";
import { AdherenceTimeline } from "./AdherenceTimeline";
import { PersfoDrawer } from "./PersfoDrawer";
import { ShoppingBasket } from "./ShoppingBasket";
import { getImage } from "/imports/api/apiPersfo";
import {
  OpenFeedback, OpenMealDetails,
  OpenProgress,
  OpenSettings,
  OpenRecommenderExplanations
} from "/imports/api/methods.js";
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';

const useStyles = makeStyles(() => ({
  header: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
  },
  mealScreenHeader: {
    display: "flex",
    height: "100px",
    alignItems: "flex-start"
  },
  backButton: {
    marginLeft: "8px",
    marginTop: "8px",
    background: "rgba(148,148,148,0.6)",
  },
  menuButton: {
    marginLeft: "8px",
  },
  shoppingButton: {
    marginLeft: "auto",
    marginRight: "30px"
  },
  title: {
    fontSize: "13px",
    fontFamily: "sans-serif",
    color: "white",
    margin: 0,
    fontWeight: 400,
    opacity: 0.8,
    alignSelf: "left",
  },
  initTitle: {
    fontSize: "15px",
    fontFamily: "sans-serif",
    color: "white",
    margin: 10,
    fontWeight: 400,
    opacity: 0.8,
    marginTop: "18px"
  },
}));

const componentName = "AppBarPersfo";
export const AppBarPersfo = ({ drawerOpen, toggleDrawer, shoppingBasketdrawerOpen, toggleShoppingBasketDrawer, surveyFinished, icfFinished, doneForToday }) => {
  const classes = useStyles();

  const user = useTracker(() => Meteor.user());

  const [background, setBackground] = useState("none");

  const { GetOpenMealDetails, GetOpenProgress, GetOpenSettings, GetOpenFeedback, GetOpenRecommenderExplanations } = useTracker(
    () => {
      const GetOpenMealDetails = OpenMealDetails.get();
      const GetOpenProgress = OpenProgress.get();
      const GetOpenSettings = OpenSettings.get();
      const GetOpenFeedback = OpenFeedback.get();
      const GetOpenRecommenderExplanations = OpenRecommenderExplanations.get();
      return { GetOpenMealDetails, GetOpenProgress, GetOpenSettings, GetOpenFeedback, GetOpenRecommenderExplanations };
    }
  );

  const { nbOrders } = useTracker(() => {
    const noDataAvailable = { nbOrders: 0, doneForToday: false, onboardingFinished: true };
    const handler = Meteor.subscribe("orders");

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    // find only orders made today
    const now = new Date();
    const nowString = now.toISOString().substring(0, 10);

    const nbOrders = OrdersCollection.find({
      userid: Meteor.userId(),
      orderday: nowString,
    }).fetch().length;

    return { nbOrders };
  });

  document.addEventListener("backbutton", onBackKeyDown, false);

  function onBackKeyDown() {
    closeMealScreen();
  }

  const closeMealScreen = () => {
    OpenMealDetails.set(null);
    OpenRecommenderExplanations.set(null);
    setBackground("none");
    Meteor.call("log", componentName, "closeMealScreen", navigator.userAgent);
  };

  useEffect(() => {
    if (GetOpenMealDetails !== null || GetOpenRecommenderExplanations !== null) {
      let url;
      try {
        url = getImage(GetOpenMealDetails[0]);
      } catch (error) {
        url = getImage(GetOpenRecommenderExplanations[0]);
      }
      if (url === "/images/Image-not-found.png") {
        url = undefined;
      }
      setBackground("url('" + url + "')");
    }
  });

  const switchHeader = () => {
    if (!user) return i18n.__("AppBarPersfo.welcome");
    if (GetOpenMealDetails !== null || GetOpenRecommenderExplanations !== null) return ""; // no title, meal image is displayed

    if (!icfFinished) return i18n.__("AppBarPersfo.icf");
    if (!surveyFinished) return i18n.__("AppBarPersfo.survey");

    // menu item header titles
    if (GetOpenProgress) return i18n.__("AppBarPersfo.progress");
    if (GetOpenSettings) return i18n.__("AppBarPersfo.settings");
    if (GetOpenFeedback) return i18n.__("AppBarPersfo.feedback");

    // last step, user could be finished
    if (doneForToday) return i18n.__("AppBarPersfo.thanks");

    return i18n.__("AppBarPersfo.title");
  };

  return (
    <AppBar
      position="sticky"
      style={{
        backgroundImage: background, backgroundSize: "cover", backgroundPosition: 'center center',
        '&:before': {
          position: 'absolute',
          width: '100%',
          height: '100%',
          content: '""',
          display: 'block',
          background: '#000',
          opacity: '0.6'
        }
      }}
    >
      {
        (() => {
          // Normal header
          if (user && GetOpenMealDetails == null && GetOpenRecommenderExplanations == null && icfFinished && surveyFinished) {
            return (
              <>
                <div className={classes.header}>
                  <IconButton
                    className={classes.menuButton}
                    color="secondary"
                    onClick={toggleDrawer(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <h1 className={classes.title}>{switchHeader()}</h1>
                  <div className={classes.shoppingButton}>
                    {!doneForToday ?
                      <Badge badgeContent={nbOrders} color="secondary" onClick={toggleShoppingBasketDrawer(true)}>
                        <ShoppingCartIcon color="secondary" />
                      </Badge>
                      :
                      <></>}
                  </div>
                </div>
                <AdherenceTimeline />
              </>
            )
            // Mealscreen header
          } else if (user && icfFinished && surveyFinished) {
            return (
              <div className={classes.mealScreenHeader}>
                <IconButton className={classes.backButton} color="secondary" onClick={() => closeMealScreen()}>
                  <ArrowBackIcon />
                </IconButton>
              </div>
            )
            // Initial header (not logged in)
          } else {
            return (
              <h1 className={classes.initTitle}>{switchHeader()}</h1>
            )
          }
        })()
      }
      < PersfoDrawer drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      <ShoppingBasket drawerOpen={shoppingBasketdrawerOpen} toggleDrawer={toggleShoppingBasketDrawer} />
    </AppBar>
  );
};
