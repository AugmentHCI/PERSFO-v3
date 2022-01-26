import { CircularProgress, Tab, Tabs } from "@material-ui/core/";
import Box from "@material-ui/core/Box";
import { createTheme, makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { AppBarPersfo } from "./AppBarPersfo";
import { AuthenticationScreen } from "./AuthenticationScreen";
import { DetailScreen } from "./DetailScreen";
import { Done } from "./Done";
import { Feedback } from "./Feedback";
import { LanguageSurveyForm } from "./LanguageSurveyForm";
import { Onboarding } from "./Onboarding";
import { Preferences } from "./Preferences";
import { Progress } from "./Progress";
import { SurveyForm } from "./SurveyForm";
import { TabHomeScreen } from "./TabHomeScreen";
import { AllergiesContent } from "./tabs/AllergiesContent";
import { Food4MeContent } from "./tabs/Food4MeContent";
import { FoodPreferencesContext } from "./tabs/FoodPreferences";
import { IngredientsContent } from "./tabs/IngredientsContent";
import { NutrientsContent } from "./tabs/NutrientsContent";
import { PopularityContent } from "./tabs/PopularityContent";
import { getLocation } from "/imports/api/auxMethods";
import {
  FALLBACK_DATE, LAST_MENU_UPDATE, OpenFeedback, OpenMealDetails,
  OpenProgress, OpenRecommenderExplanations, OpenSettings
} from "/imports/api/methods.js";
import { MenusCollection } from '/imports/db/menus/MenusCollection';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { RecommendedRecipes } from '/imports/db/recommendedRecipes/RecommendedRecipes';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';


const persfoTheme = createTheme({
  palette: {
    primary: {
      main: "#F57D20",
    },
    secondary: {
      main: "#fff",
    },
    background: {
      default: "#F9F1EC",
    },
  },
  typography: {
    fontSize: 12,
  },
  overrides: {
    MuiAppBar: {
      root: {
        borderRadius: "0px 0px 40px 0px",
      }
    }
  }
});

const useStyles = makeStyles(() => ({
  tabs: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    height: "38px",
  },
}));

const componentName = "App";
export const App = () => {
  const classes = useStyles();

  const user = useTracker(() => Meteor.user());

  // drawer logic
  const [drawerOpen, setState] = useState(false);
  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState(open);
    Meteor.call("log", componentName, "toggleDrawer", navigator.userAgent);
  };

  // Shopping basket drawer logic
  const [shoppingBasketdrawerOpen, setStateShoppingBasket] = useState(false);
  const toggleShoppingBasketDrawer = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setStateShoppingBasket(open);
    Meteor.call("log", componentName, "toggleShoppingBasketDrawer", navigator.userAgent);
  };

  // tab logic
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
    Meteor.call("log", componentName, "handleChange", navigator.userAgent);
  };

  const [lastRecommenderUpdate, setLastRecommenderUpdate] = useState(undefined);

  const {
    GetOpenMealDetails,
    GetOpenProgress,
    GetOpenSettings,
    GetOpenFeedback,
    GetOpenRecommenderExplanations,
    menu,
    isLoading,
    doneForToday,
    icfFinished,
    surveyFinished,
    recommendedRecipe,
    languageChosen
  } = useTracker(() => {
    const GetOpenMealDetails = OpenMealDetails.get();
    const noDataAvailable = {
      menu: { courses: [] },
      doneForToday: false,
      icfFinished: true,
      surveyFinished: true,
      isLoading: true,
      languageChosen: "",
      recommendedRecipe: null // in case no meal is recommended, suggest a sandwhich
    };

    const menuHandler = Meteor.subscribe("menus");
    const recipesHandler = Meteor.subscribe("recipes");
    const preferencesHandler = Meteor.subscribe("userpreferences");
    const orderHandler = Meteor.subscribe("orders");
    const recommendationHandler = Meteor.subscribe("recommendedrecipes");

    const GetOpenProgress = OpenProgress.get();
    const GetOpenSettings = OpenSettings.get();
    const GetOpenFeedback = OpenFeedback.get();
    const GetOpenRecommenderExplanations = OpenRecommenderExplanations.get();

    if (!Meteor.user() || !menuHandler.ready() || !recipesHandler.ready() || !preferencesHandler.ready() || !orderHandler.ready() || !recommendationHandler.ready()) {
      return { ...noDataAvailable };
    }
    // // wait for menus, recipes, AND userpreferences to load before initializing recommendations
    // // recalculate new recommendation on every app startup

    const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });
    const status = userPreferences?.ffqAnswers?.status_survey;

    const now = new Date();
    const nowString = now.toISOString().substring(0, 10);

    const earlier = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().substring(0, 10);
    // pick specific date for demo
    // let menu = MenusCollection.findOne({ starting_date: "2021-12-07" });
    // pick menu of today TODO
    let menu = MenusCollection.findOne({
      starting_date: nowString,
      last_update: LAST_MENU_UPDATE,
      location: getLocation(status)
    });

    // pick menu of Fallback variable when no menu available today
    if (!menu) menu = MenusCollection.findOne({
      starting_date: FALLBACK_DATE,
      last_update: LAST_MENU_UPDATE,
      location: getLocation(status)
    });

    let randomConfirmedOrder = OrdersCollection.findOne({ userid: Meteor.userId(), orderday: nowString, confirmed: true });
    const doneForToday = randomConfirmedOrder !== undefined;

    const languageChosen = userPreferences?.languageChosen;
    if (languageChosen) i18n.setLocale(languageChosen);
    const icfFinished = userPreferences?.icfFinished;
    const surveyFinished = userPreferences?.ffqAnswers;

    let recommendedRecipeId = "";
    let tempRecommendation = null;
    let noMoreRecommendations = false;

    if (surveyFinished && languageChosen) {

      if (lastRecommenderUpdate === undefined || now.getTime() - lastRecommenderUpdate >= (10 * 1000)) {
        Meteor.call("recommender.updateRecommendations");
        setLastRecommenderUpdate(now.getTime());
      }

      try {
        const recommendedRecipes = RecommendedRecipes.findOne({ userid: Meteor.userId() }).recommendations;
        recommendedRecipeId = _.sortBy(recommendedRecipes, r => -r.totalRanking)[0].id;
      } catch (error) {
        // console.log("no recommendations anymore: " + error) // error should not be printed. 
        noMoreRecommendations = true;
      }

      if (!noMoreRecommendations) {
        tempRecommendation = RecipesCollection.findOne({ id: recommendedRecipeId });
      }
    }

    const recommendedRecipe = tempRecommendation;
    const isLoading = false;

    return { GetOpenMealDetails, GetOpenProgress, GetOpenSettings, GetOpenFeedback, GetOpenRecommenderExplanations, menu, isLoading, doneForToday, icfFinished, surveyFinished, recommendedRecipe, languageChosen };
  });

  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return <div {...other}>{value === index && <Box>{children}</Box>}</div>;
  }

  const getCoursesTabs = () => {
    if (!isLoading) {
      try {
        return menu.courses.map((course) => (
          <Tab
            style={{ minHeight: "32px" }}
            key={course.name}
            label={course.name}
          />
        ));
      } catch (error) {
        console.log(error);
        return (<></>)
      }

    }
  };

  const renderMealScreenTabContent = (tabValue) => {
    const recipe = GetOpenMealDetails[0];
    switch (tabValue) {
      case 0:
        return <NutrientsContent recipe={recipe} />;
      case 1:
        return <IngredientsContent recipe={recipe} />;
      case 2:
        return <AllergiesContent recipe={recipe} />;
      // case 3:
      //   return <SustainabilityContent recipe={recipe} />;
    }
    Meteor.call("log", componentName, "renderMealScreenTabContent", tabValue);
  };

  const renderExplanationTabContent = (tabValue) => {
    const recipe = GetOpenRecommenderExplanations[0];
    switch (tabValue) {
      case 0:
        return <Food4MeContent recipe={recipe} />;
      case 1:
        return <FoodPreferencesContext recipe={recipe} />;
      case 2:
        return <PopularityContent recipe={recipe} />;
    }
    Meteor.call("log", componentName, "renderExplanationTabContent", tabValue);
  };

  const switchRenderScreen = () => {
    let renderScreen = <div>{isLoading && <CircularProgress />}</div>;
    if (user) {
      if (languageChosen === undefined || languageChosen === "") {
        renderScreen = <LanguageSurveyForm />;
      } else {

        if (!icfFinished) {
          renderScreen = <Onboarding />;
        } else {

          if (!surveyFinished) {
            renderScreen = <SurveyForm />;
          } else {

            if (doneForToday) {
              renderScreen = <Done toggleShoppingBasketDrawer={toggleShoppingBasketDrawer}></Done>
            } else {

              if (GetOpenMealDetails == null) {
                if (GetOpenProgress) {
                  renderScreen = <Progress recommendedRecipe={recommendedRecipe} />;
                }

                else if (GetOpenSettings) {
                  renderScreen = <Preferences />;
                }

                else if (GetOpenFeedback) {
                  renderScreen = <Feedback />;
                }

                else if (GetOpenRecommenderExplanations) {
                  renderScreen = (
                    <DetailScreen
                      recipe={GetOpenRecommenderExplanations[0]}
                      allergensPresent={GetOpenRecommenderExplanations[1]}
                      renderTabContent={renderExplanationTabContent}
                      tabTitles={[i18n.__("general.questionnaire"), i18n.__("general.preferences"), i18n.__("general.popularity")]}
                    />
                  );
                }

                else {
                  renderScreen = (
                    <>
                      <div>{isLoading && <CircularProgress />}</div>
                      <Tabs
                        className={classes.tabs}
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {" "}
                        {getCoursesTabs()}{" "}
                      </Tabs>
                      {_.map(menu.courses, function (n, i) {
                        return (
                          <TabPanel key={i} value={value} index={i}>
                            <TabHomeScreen
                              recommendedRecipe={recommendedRecipe}
                              recipeURLs={menu.courses[i].recipes}
                              courseName={n.name} />
                          </TabPanel>
                        );
                      })}
                    </>
                  );
                }

              } else if (GetOpenMealDetails !== null) {
                renderScreen = (
                  <DetailScreen
                    recipe={GetOpenMealDetails[0]}
                    allergensPresent={GetOpenMealDetails[1]}
                    translatedName={GetOpenMealDetails[2]}
                    renderTabContent={renderMealScreenTabContent}
                    tabTitles={[i18n.__("general.nutrients"), i18n.__("general.ingredients"), i18n.__("general.allergens")]}
                  />
                );
              }
            }
          }
        }
      }

    } else {
      renderScreen = <AuthenticationScreen />;
    }

    return renderScreen;
  };

  return (
    <ThemeProvider theme={persfoTheme}>
      <AppBarPersfo
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        shoppingBasketdrawerOpen={shoppingBasketdrawerOpen}
        toggleShoppingBasketDrawer={toggleShoppingBasketDrawer}
        surveyFinished={surveyFinished}
        icfFinished={icfFinished}
        doneForToday={doneForToday} />

      <div className="main">{switchRenderScreen()}</div>
    </ThemeProvider>
  );
};
