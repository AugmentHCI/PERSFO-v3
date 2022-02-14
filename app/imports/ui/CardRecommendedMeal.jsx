import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  FormControlLabel,
  IconButton,
  Typography
} from "@material-ui/core/";
import Checkbox from "@material-ui/core/Checkbox";
import { red } from "@material-ui/core/colors";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import { useTracker } from "meteor/react-meteor-data";
import React, { useState } from "react";
import { OpenRecommenderExplanations } from "../api/methods";
import { LikeButton } from "./components/LikeButton";
import { OrderButton } from "./components/OrderButton";
import { getImage, getNbDisliked, getNutriscoreImage } from "/imports/api/apiPersfo";
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';


const useStyles = makeStyles(() => ({
  menuImage: {
    minWidth: "80px",
    minHeight: "80px",
    borderRadius: "100px",
    marginLeft: "8px",
    backgroundColor: "#fafafa",
  },
  menuTitle: {
    fontSize: "12px",
    fontWeight: 500,
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    letterSpacing: "0px",
    lineHeight: 1,
    color: "#717171",
  },
  menuTitleWarning: {
    fontSize: "12px",
    fontWeight: 500,
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    letterSpacing: "0px",
    lineHeight: 1,
    color: red[500],
  },
  nutriscoreImage: {
    height: "24px",
    marginTop: "8px",
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    background: "#fafafa",
  },
  cardTop: {
    display: "flex",
    justifyContent: "flex-start",
  },
  cardContent: {
    alignSelf: "flex-start",
    padding: "8px",
  },
  sideCardActions: {
    display: "flex",
    flexDirection: "column",
    padding: "4px",
  },
  likeButton: {
    margin: "0 !important",
  },
  paper: {
    position: "absolute",
    width: "80%",
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
  },
  modalTitle: {
    fontFamily: "sans-serif",
    lineHeight: 1.5,
    fontWeight: 400,
  },
  checkbox: {
    justifyContent: "space-between",
    fontSize: "16px",
    fontWeight: 400,
  },
  ingredientList: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },
  dislikeOptions: {
    display: "flex",
    columnGap: "16px",
    marginTop: "32px",
    justifyContent: "flex-end",
  }
}));

const componentName = "CardRecommendedMeal";
export const CardRecommendedMeal = ({ recipe, handleDetailsClick, allergensPresent, dietaryConflict, translatedName }) => {
  const classes = useStyles();

  const { ingredients, thumbsDown, thumbsUp } = useTracker(() => {
    const noDataAvailable = { ingredients: [], thumbsDown: false, thumbsUp: false, };
    const handler = Meteor.subscribe("userpreferences");

    if (!Meteor.user() || _.isEmpty(recipe) || !handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    let tempIngredients = [];
    if (recipe.cleanedIngredients) {
      tempIngredients = recipe.cleanedIngredients;
    } else {
      console.error("no cleaned ingredients for: " + recipe.id);
    }
    const ingredients = tempIngredients.slice(0, 7);

    const thumbsUp =
      UserPreferences.find({
        userid: Meteor.userId(),
        likedRecommendations: { $in: [recipe.id] },
      }).fetch().length > 0;

    const dislikedIngredients = UserPreferences.findOne({ userid: Meteor.userId() }).dislikedIngredients;
    let tempThumbDown = false;
    if (dislikedIngredients) {
      tempThumbDown = getNbDisliked(recipe, dislikedIngredients) > 0;
    }
    const thumbsDown = tempThumbDown;

    return { ingredients, thumbsDown, thumbsUp };
  });

  const handleThumbsUp = () => {
    if (recipe) {
      Meteor.call("users.handleLikeRecommendation", recipe.id, true);
    }
    Meteor.call("log", componentName, "handleThumbsUp", navigator.userAgent);
  };

  // modal logic
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  function getModalStyle() {
    const top = 50; // percentages
    const left = 50;
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const [checkboxes, updateCheckboxes] = useState([false, false, false, false]);

  const handleModalCheckboxChange = (event, i) => {
    let newArr = [...checkboxes];
    newArr[i] = event.target.checked;
    updateCheckboxes(newArr);
    Meteor.call("log", componentName, "handleModalCheckboxChange", navigator.userAgent);
  };

  const handleModalOpen = () => {
    if (!thumbsDown) {
      // Meteor.call("users.handleLikeRecommendation", recipe.id, false);
      setOpen(true);
      Meteor.call("log", componentName, "handleModalOpen", navigator.userAgent);
    }
  };
  const handleModalClose = () => {
    Meteor.call("users.handleLikeRecommendation", recipe.id, false);
    setOpen(false);
    Meteor.call("log", componentName, "handleModalClose", navigator.userAgent);
  };

  const cancelModal = () => {
    setOpen(false);
    Meteor.call("log", componentName, "cancelModal", navigator.userAgent);
  };

  const sendModal = () => {
    let listOfDislikes = [];
    for (let i = 0; i < checkboxes.length; i++) {
      let check = checkboxes[i];
      if (check) {
        listOfDislikes.push(ingredients[i]);
      }
    }
    Meteor.call("users.addDislikes", listOfDislikes);
    setOpen(false);
    Meteor.call("log", componentName, "sendModal", navigator.userAgent);
    Meteor.call("recommender.updateRecommendations")
  };

  const handleWhyClick = () => {
    OpenRecommenderExplanations.set([recipe, allergensPresent, translatedName]);
    Meteor.call("log", componentName, "why", navigator.userAgent);
  }

  return (
    <Card>
      <div style={{ display: "flex" }}>
        <CardActionArea
          className={classes.cardTop}
          onClick={() => handleDetailsClick()}
        >
          <CardMedia
            className={classes.menuImage}
            image={getImage(recipe)}
          />
          <CardContent className={classes.cardContent}>
            <Typography className={
              (allergensPresent || dietaryConflict) ?
                classes.menuTitleWarning
                :
                classes.menuTitle
            }>
              {String(translatedName).length > 40
                ? translatedName.slice(0, 40) + "..."
                : translatedName}
            </Typography>
            <img
              className={classes.nutriscoreImage}
              src={getNutriscoreImage(recipe)}
            />
          </CardContent>
        </CardActionArea>

        <CardActions className={classes.sideCardActions}>
          <IconButton
            disabled={thumbsDown}
            onClick={() => handleThumbsUp()}
            className={classes.likeButton}
          >
            <ThumbUpIcon
              style={thumbsUp ? { color: "#F57D20" } : { color: "#f7ba8b" }}
            />
          </IconButton>
          <IconButton
            className={classes.likeButton}
            onClick={handleModalOpen}
          >
            <ThumbDownIcon
              style={
                thumbsDown ? { color: "#F57D20" } : { color: "#f7ba8b" }
              }
            />
          </IconButton>
        </CardActions>
      </div>
      <CardActions className={classes.cardActions}>
        <LikeButton recipe={recipe}></LikeButton>
        <Button
          size="large"
          color="primary"
          onClick={() => handleWhyClick()}
        >
          {i18n.__("general.more_info")}
        </Button>
        <OrderButton recipe={recipe} allergensPresent={allergensPresent} dietaryConflict={dietaryConflict}></OrderButton>
      </CardActions>

      <Modal open={open} onClose={handleModalClose}>
        <div style={modalStyle} className={classes.paper}>
          <h3 className={classes.modalTitle}>
            {i18n.__("recommendations.explanation")}
          </h3>
          <div className={classes.ingredientList}>
            {_.map(ingredients, (ingredient, i) => {
              return (
                <FormControlLabel
                  className={classes.checkbox}
                  key={i + "-checkbox"}
                  control={
                    <Checkbox
                      color="primary"
                      checked={checkboxes[i]}
                      onChange={(e) => handleModalCheckboxChange(e, i)}
                    />
                  }
                  label={ingredient}
                  labelPlacement="start"
                />
              );
            })}
          </div>
          <div className={classes.dislikeOptions}>
            <Button
              size="large"
              onClick={() => cancelModal()}
              color="primary"
            >
              {i18n.__("general.cancel")}
            </Button>
            <Button
              size="large"
              onClick={() => sendModal()}
              color="primary"
            >
              {i18n.__("general.send")}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
