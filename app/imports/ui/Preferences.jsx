import { Button, FormControlLabel, Slider, Switch } from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { capitalizeFirstLetter, makeArrayOf } from "/imports/api/auxMethods";
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import MuiAlert from "@material-ui/lab/Alert";

const useStyles = makeStyles(() => ({
  mainWindow: {
    overflowY: "scroll",
  },
  title: {
    color: "#726f6c",
    margin: "16px 0px 16px 8px",
    fontSize: "18px",
    fontFamily: "Roboto",
    fontWeight: 600,
  },
  subtitle: {
    color: "#726f6c",
    marginBottom: "16px",
    fontSize: "13px",
    fontFamily: "Roboto",
    fontWeight: 200,
  },
  formContainer: {
    background: "white",
    borderRadius: "25px",
    padding: "16px",
    borderRadius: "30px 0px 0px 30px",
    marginLeft: "16px",
    color: "#717171",
    fontFamily: "sans-serif",
  },
  sliderContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "8px",
    marginRight: "-12px",
  },
  sliderTitle: {
    display: "flex",
    color: "#717171",
    fontSize: "12px",
  },
  slider: {
    display: "flex",
  },
  checkbox: {
    display: "flex",
    justifyContent: "space-between",
  },
  innerCheckbox: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    width: "120px",
    marginRight: "24px",
  },
  resetButton: {
    float: "right",
    color: red[500],
  }
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const componentName = "Preferences";
export const Preferences = () => {
  const classes = useStyles();

  const {
    EnergySlider,
    TotalFatSlider,
    SatfatSlider,
    SugarSlider,
    ProteinSlider,
    SaltSlider,
    FiberSlider,
    EnergySwitch,
    TotalFatSwitch,
    SatfatSwitch,
    SugarSwitch,
    ProteinSwitch,
    SaltSwitch,
    FiberSwitch,
    languageSwitch,
    languageChosen
  } = useTracker(() => {
    const noDataAvailable = {
      EnergySlider: 0,
      TotalFatSlider: 0,
      SatfatSlider: 0,
      SugarSlider: 0,
      ProteinSlider: 0,
      SaltSlider: 0,
      FiberSlider: 0,
      EnergySwitch: false,
      TotalFatSwitch: false,
      SatfatSwitch: false,
      SugarSwitch: false,
      ProteinSwitch: false,
      SaltSwitch: false,
      FiberSwitch: false,
      languageSwitch: false,
      languageChosen: ""
    };
    const handler = Meteor.subscribe("userpreferences");
    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }
    let nutrientGoals = [];
    let activeNutrientGoals = [];
    const userPreferences = UserPreferences.findOne({
      userid: Meteor.userId(),
    });
    let EnergySlider = 0,
      TotalFatSlider = 0,
      SatfatSlider = 0,
      SugarSlider = 0,
      ProteinSlider = 0,
      SaltSlider = 0,
      FiberSlider = 0,
      EnergySwitch = false,
      TotalFatSwitch = false,
      SatfatSwitch = false,
      SugarSwitch = false,
      ProteinSwitch = false,
      SaltSwitch = false,
      FiberSwitch = false;
    try {
      if (userPreferences.nutrientGoals) {
        nutrientGoals = userPreferences.nutrientGoals;

        EnergySlider = nutrientGoals["energy"];
        TotalFatSlider = nutrientGoals["totalFat"];
        SatfatSlider = nutrientGoals["satFat"];
        SugarSlider = nutrientGoals["sugar"];
        ProteinSlider = nutrientGoals["protein"];
        SaltSlider = nutrientGoals["salt"];
        FiberSlider = nutrientGoals["fiber"];
      }

      if (userPreferences.activeNutrientGoals) {
        activeNutrientGoals = userPreferences.activeNutrientGoals;

        EnergySwitch = activeNutrientGoals["energy"];
        TotalFatSwitch = activeNutrientGoals["totalFat"];
        SatfatSwitch = activeNutrientGoals["satFat"];
        SugarSwitch = activeNutrientGoals["sugar"];
        ProteinSwitch = activeNutrientGoals["protein"];
        SaltSwitch = activeNutrientGoals["salt"];
        FiberSwitch = activeNutrientGoals["fiber"];
      }

      const languageChosen = userPreferences.languageChosen
      const languageSwitch = languageChosen == "en";

      return {
        EnergySlider,
        TotalFatSlider,
        SatfatSlider,
        SugarSlider,
        ProteinSlider,
        SaltSlider,
        FiberSlider,
        EnergySwitch,
        TotalFatSwitch,
        SatfatSwitch,
        SugarSwitch,
        ProteinSwitch,
        SaltSwitch,
        FiberSwitch,
        languageSwitch,
        languageChosen
      };
    } catch (error) {
      return { ...noDataAvailable, isLoading: true };
    }
  });

  const languageSwitchChange = (event, newValue) => {
    Meteor.call("users.updateLanguage", newValue);
    Meteor.call("log", componentName, "languageSwitchChange", navigator.userAgent);
  };

  const energySliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: newValue,
      totalFat: TotalFatSlider,
      satFat: SatfatSlider,
      sugar: SugarSlider,
      protein: ProteinSlider,
      salt: SaltSlider,
      fiber: FiberSlider,
    });
    Meteor.call("log", componentName, "energySliderChange", navigator.userAgent);
  };
  const totalFatSliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: EnergySlider,
      totalFat: newValue,
      satFat: SatfatSlider,
      sugar: SugarSlider,
      protein: ProteinSlider,
      salt: SaltSlider,
      fiber: FiberSlider,
    });
    Meteor.call("log", componentName, "totalFatSliderChange", navigator.userAgent);
  };
  const satfatSliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: EnergySlider,
      totalFat: TotalFatSlider,
      satFat: newValue,
      sugar: SugarSlider,
      protein: ProteinSlider,
      salt: SaltSlider,
      fiber: FiberSlider,
    });
    Meteor.call("log", componentName, "satfatSliderChange", navigator.userAgent);
  };
  const sugarSliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: EnergySlider,
      totalFat: TotalFatSlider,
      satFat: SatfatSlider,
      sugar: newValue,
      protein: ProteinSlider,
      salt: SaltSlider,
      fiber: FiberSlider,
    });
    Meteor.call("log", componentName, "sugarSliderChange", navigator.userAgent);
  };
  const proteinSliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: EnergySlider,
      totalFat: TotalFatSlider,
      satFat: SatfatSlider,
      sugar: SugarSlider,
      protein: newValue,
      salt: SaltSlider,
      fiber: FiberSlider,
    });
    Meteor.call("log", componentName, "proteinSliderChange", navigator.userAgent);
  };
  const saltSliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: EnergySlider,
      totalFat: TotalFatSlider,
      satFat: SatfatSlider,
      sugar: SugarSlider,
      protein: ProteinSlider,
      salt: newValue,
      fiber: FiberSlider,
    });
    Meteor.call("log", componentName, "saltSliderChange", navigator.userAgent);
  };
  const fiberSliderChange = (event, newValue) => {
    Meteor.call("users.updateNutrientGoals", {
      energy: EnergySlider,
      totalFat: TotalFatSlider,
      satFat: SatfatSlider,
      sugar: SugarSlider,
      protein: ProteinSlider,
      salt: SaltSlider,
      fiber: newValue,
    });
    Meteor.call("log", componentName, "fiberSliderChange", navigator.userAgent);
  };

  const energySwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: newValue,
      totalFat: TotalFatSwitch,
      satFat: SatfatSwitch,
      sugar: SugarSwitch,
      protein: ProteinSwitch,
      salt: SaltSwitch,
      fiber: FiberSwitch,
    });
    Meteor.call("log", componentName, "energySwitchChange", navigator.userAgent);
  };
  const totalFatSwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: EnergySwitch,
      totalFat: newValue,
      satFat: SatfatSwitch,
      sugar: SugarSwitch,
      protein: ProteinSwitch,
      salt: SaltSwitch,
      fiber: FiberSwitch,
    });
    Meteor.call("log", componentName, "totalFatSwitchChange", navigator.userAgent);
  };
  const satfatSwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: EnergySwitch,
      totalFat: TotalFatSwitch,
      satFat: newValue,
      sugar: SugarSwitch,
      protein: ProteinSwitch,
      salt: SaltSwitch,
      fiber: FiberSwitch,
    });
    Meteor.call("log", componentName, "satfatSwitchChange", navigator.userAgent);
  };
  const sugarSwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: EnergySwitch,
      totalFat: TotalFatSwitch,
      satFat: SatfatSwitch,
      sugar: newValue,
      protein: ProteinSwitch,
      salt: SaltSwitch,
      fiber: FiberSwitch,
    });
    Meteor.call("log", componentName, "sugarSwitchChange", navigator.userAgent);
  };
  const proteinSwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: EnergySwitch,
      totalFat: TotalFatSwitch,
      satFat: SatfatSwitch,
      sugar: SugarSwitch,
      protein: newValue,
      salt: SaltSwitch,
      fiber: FiberSwitch,
    });
    Meteor.call("log", componentName, "proteinSwitchChange", navigator.userAgent);
  };
  const saltSwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: EnergySwitch,
      totalFat: TotalFatSwitch,
      satFat: SatfatSwitch,
      sugar: SugarSwitch,
      protein: ProteinSwitch,
      salt: newValue,
      fiber: FiberSwitch,
    });
    Meteor.call("log", componentName, "saltSwitchChange", navigator.userAgent);
  };
  const fiberSwitchChange = (event, newValue) => {
    Meteor.call("users.updateActiveNutrientGoals", {
      energy: EnergySwitch,
      totalFat: TotalFatSwitch,
      satFat: SatfatSwitch,
      sugar: SugarSwitch,
      protein: ProteinSwitch,
      salt: SaltSwitch,
      fiber: newValue,
    });
    Meteor.call("log", componentName, "fiberSwitchChange", navigator.userAgent);
  };

  const { allergens, allergenCheckboxes, dietaries, dietariesCheckboxes } = useTracker(() => {
    const noDataAvailable = {
      allergens: [],
      allergenCheckboxes: makeArrayOf(false, 34),
    };
    const recipeHandler = Meteor.subscribe("recipes");
    const preferencesHandler = Meteor.subscribe("userpreferences");

    if (!Meteor.user() || !recipeHandler.ready() || !preferencesHandler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }
    const recipe = RecipesCollection.findOne({});
    const preferences = UserPreferences.findOne({ userid: Meteor.userId() });
    let userAllergens = [];
    try {
      userAllergens = preferences.allergens;
    } catch (error) {
      // no allergens set yet
    }

    let tempAllergens = _.map(recipe.allergens, (value, allergen) => {
      let userPresent = _.find(userAllergens, (ua) => ua.allergen === allergen);
      userPresent = userPresent ? userPresent.present : 0;
      return {
        allergen: allergen,
        present: userPresent,
      };
    });
    const allergens = _.sortBy(tempAllergens, "allergen");
    const allergenCheckboxes = _.map(
      allergens,
      (allergen) => !!allergen.present
    );


    let userDietaries = [];
    try {
      userDietaries = preferences.dietaries;
    } catch (error) {
      // no allergens set yet
    }

    // const allDietaries = _.map(recipe.dietary_info, (value, key) => key); // TODO
    const allDietaries = ["kosher", "vegetarian", "halal", "vegan"].sort();
    let tempDietaries = allDietaries.map(dietary => {
      let userPresent = _.find(userDietaries, (ud) => ud.dietary === dietary);
      userPresent = userPresent ? userPresent.present : 0;
      return {
        dietary: dietary,
        present: userPresent,
      };
    });
    const dietaries = _.sortBy(tempDietaries, "dietary");
    const dietariesCheckboxes = _.map(
      dietaries,
      (dietary) => !!dietary.present
    );

    return { allergens, allergenCheckboxes, dietaries, dietariesCheckboxes };
  });

  const handleAllergenCheckboxChange = (event, i) => {
    let newArr = [...allergenCheckboxes];
    newArr[i] = event.target.checked;
    let listAllergens = [];
    for (let i = 0; i < newArr.length; i++) {
      let check = newArr[i];
      if (check) {
        listAllergens.push({
          allergen: allergens[i].allergen,
          present: 1,
        });
      }
    }
    Meteor.call("users.updateAllergens", listAllergens);
    Meteor.call("log", componentName, "handleAllergenCheckboxChange", navigator.userAgent);
  };

  const handleDietaryCheckboxChange = (event, i) => {
    let newArr = [...dietariesCheckboxes];
    newArr[i] = event.target.checked;
    let listDietaries = [];
    for (let i = 0; i < newArr.length; i++) {
      let check = newArr[i];
      if (check) {
        listDietaries.push({
          dietary: dietaries[i].dietary,
          present: 1,
        });
      }
    }
    Meteor.call("users.updateDietaries", listDietaries);
    Meteor.call("log", componentName, "handleDietaryCheckboxChange", navigator.userAgent);
  };

  const getAllergenBar = (allergen, i) => {
    return (
      <FormControlLabel
        className={classes.checkbox}
        key={"bar-" + allergen.allergen}
        control={
          <Switch
            color="primary"
            checked={allergenCheckboxes[i]}
            onChange={(e) => handleAllergenCheckboxChange(e, i)}
          />
        }
        label={capitalizeFirstLetter(allergen.allergen.split("_").join(" "))}
        labelPlacement="start"
      />
    );
  };

  const getDietaryBar = (dietary, i) => {
    return (
      <FormControlLabel
        className={classes.checkbox}
        key={"bar-" + dietary.dietary}
        control={
          <Switch
            color="primary"
            checked={dietariesCheckboxes[i]}
            onChange={(e) => handleDietaryCheckboxChange(e, i)} // TODO
          />
        }
        label={capitalizeFirstLetter(dietary.dietary.split("_").join(" "))}
        labelPlacement="start"
      />
    );
  };

  const reset = (e) => {
    e.preventDefault();
    setOpen(true);
    Meteor.call("users.deleteDislikes");
    Meteor.call("log", componentName, "reset", navigator.userAgent);
  };

  const [toastShown, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <div className={classes.mainWindow}>

        <h1 className={classes.title}>{i18n.__("preferences.dietary_info")}</h1>
        <div
          className={classes.formContainer}
          style={{ marginTop: "16px" }}
        >
          <p className={classes.subtitle}>{i18n.__("preferences.dietary_info_configuration")}</p>
          <div className={classes.form}>
            {_.map(dietaries, (dietary, i) => getDietaryBar(dietary, i))}
          </div>
        </div>

        <h1 className={classes.title}>{i18n.__("general.allergens")}</h1>
        <div
          className={classes.formContainer}
          style={{ marginTop: "16px", marginBottom: "10px" }}
        >
          <p className={classes.subtitle}>{i18n.__("preferences.allergens_configuration")}</p>
          <div className={classes.form}>
            {_.map(allergens, (allergen, i) => getAllergenBar(allergen, i))}
          </div>
        </div>

        <h1 className={classes.title}>{i18n.__("preferences.configure_goals")}</h1>
        <div className={classes.formContainer}>
          <h1 className={classes.subtitle}>{i18n.__("preferences.maximum_nutrients")}</h1>
          <div className={classes.form}>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>
                {i18n.__("general.energy")} ({EnergySlider} kcal)
              </div>
              <div className={classes.slider}>
                <Slider
                  disabled={!EnergySwitch}
                  value={EnergySlider}
                  onChange={energySliderChange}
                  min={0}
                  max={5000}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={EnergySwitch}
                  onChange={energySwitchChange}
                />
              </div>
            </div>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>
                {i18n.__("general.total_fat")} ({TotalFatSlider} g)
              </div>
              <div className={classes.slider}>
                <Slider
                  disabled={!TotalFatSwitch}
                  value={TotalFatSlider}
                  onChange={totalFatSliderChange}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={TotalFatSwitch}
                  onChange={totalFatSwitchChange}
                />
              </div>
            </div>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>
                {i18n.__("general.saturated_fats")} ({SatfatSlider} g)
              </div>
              <div className={classes.slider}>
                <Slider
                  disabled={!SatfatSwitch}
                  value={SatfatSlider}
                  onChange={satfatSliderChange}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={SatfatSwitch}
                  onChange={satfatSwitchChange}
                />
              </div>
            </div>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>{i18n.__("general.sugar")} ({SugarSlider} g)</div>
              <div className={classes.slider}>
                <Slider
                  disabled={!SugarSwitch}
                  value={SugarSlider}
                  onChange={sugarSliderChange}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={SugarSwitch}
                  onChange={sugarSwitchChange}
                />
              </div>
            </div>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>
                {i18n.__("general.proteins")} ({ProteinSlider} g)
              </div>
              <div className={classes.slider}>
                <Slider
                  disabled={!ProteinSwitch}
                  value={ProteinSlider}
                  onChange={proteinSliderChange}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={ProteinSwitch}
                  onChange={proteinSwitchChange}
                />
              </div>
            </div>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>{i18n.__("general.salt")} ({SaltSlider} g)</div>
              <div className={classes.slider}>
                <Slider
                  disabled={!SaltSwitch}
                  value={SaltSlider}
                  onChange={saltSliderChange}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={SaltSwitch}
                  onChange={saltSwitchChange}
                />
              </div>
            </div>
            <div className={classes.sliderContainer}>
              <div className={classes.sliderTitle}>{i18n.__("general.fibers")} ({FiberSlider} g)</div>
              <div className={classes.slider}>
                <Slider
                  disabled={!FiberSwitch}
                  value={FiberSlider}
                  onChange={fiberSliderChange}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
                <Switch
                  color="primary"
                  checked={FiberSwitch}
                  onChange={fiberSwitchChange}
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className={classes.title}>{i18n.__("preferences.languagePreferences")}</h1>
        <div className={classes.formContainer}>
          <h1 className={classes.subtitle}>{i18n.__("preferences.languageExplanation")}</h1>
          <div className={classes.form}>
            <FormControlLabel
              className={classes.checkbox}
              key={"bar-language"}
              control={
                <Switch
                  color="primary"
                  checked={languageSwitch}
                  onChange={languageSwitchChange}
                />
              }
              label={i18n.__("preferences.otherLanguage")}
              labelPlacement="start"
            />
          </div>
        </div>

        <h1 className={classes.title}>{i18n.__("preferences.resetDislikes")}</h1>
        <div
          className={classes.formContainer}
          style={{ marginTop: "16px", marginBottom: "16px", height: "80px" }}
        >
          <p className={classes.subtitle}>{i18n.__("preferences.resetDislikes_info")}</p>
          <Button onClick={reset} className={classes.resetButton}>RESET</Button>
        </div>
      </div>
      <Snackbar open={toastShown} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning">
          {i18n.__("preferences.resetted")}
        </Alert>
      </Snackbar>
    </>
  );
};
