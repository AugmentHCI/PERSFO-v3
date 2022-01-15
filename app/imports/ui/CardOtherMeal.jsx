import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography
} from "@material-ui/core/";
import { red } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteIcon from "@material-ui/icons/Favorite";
import React from "react";
import { OrderButton } from "./components/OrderButton";
import { getImage, getNutriscoreImage } from "/imports/api/apiPersfo";
import { LikeButton } from "./components/LikeButton";

const useStyles = makeStyles(() => ({
  root: {
    minWidth: "140px",
    maxWidth: "140px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: "20px",
  },
  cardTop: {
    width: "100%",
    display: "flex",
    textAlign: "inherit",
    flexDirection: "column",
    alignItems: "center",
  },
  menuImage: {
    width: "80px",
    height: "80px",
    borderRadius: "100px",
    marginTop: "8px",
    backgroundColor: "#fafafa",
  },
  menuTitle: {
    fontSize: "11px",
    fontWeight: 500,
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    letterSpacing: "0px",
    lineHeight: 1,
    textAlign: "center",
    color: "#717171",
  },
  menuTitleWarning: {
    fontSize: "11px",
    fontWeight: 500,
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase",
    letterSpacing: "0px",
    lineHeight: 1,
    textAlign: "center",
    color: red[500],
  },
  nutriscoreImage: {
    height: "24px",
    marginBottom: "8px",
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    background: "#fafafa",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "4px",
  },
}));

const componentName = "CardOtherMeal";
export const CardOtherMeal = ({ recipe, handleDetailsClick, allergensPresent, dietaryConflict, translatedName }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardActionArea
        className={classes.cardTop}
        onClick={() => handleDetailsClick()}
      >
        <CardMedia className={classes.menuImage} image={getImage(recipe)} />
        <CardContent className={classes.cardContent}>
          <Typography className={
            (allergensPresent || dietaryConflict) ?
              classes.menuTitleWarning
              :
              classes.menuTitle
          }>
            {String(translatedName).length > 36
              ? translatedName.slice(0, 36) + "..."
              : translatedName}
          </Typography>
          <img
            className={classes.nutriscoreImage}
            src={getNutriscoreImage(recipe)}
          />
        </CardContent>
      </CardActionArea>

      <CardActions className={classes.cardActions}>
        <LikeButton recipe={recipe}></LikeButton>
        <OrderButton recipe={recipe} allergensPresent={allergensPresent} dietaryConflict={dietaryConflict}></OrderButton>
      </CardActions>
    </Card >
  );
};
