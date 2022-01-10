import { Box } from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { getNutriscore } from "../api/apiPersfo";
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';

const useStyles = makeStyles(() => ({
  letter: {
    font: "11px roboto",
    fontWeight: 100,
    textAlign: "center",
  },
  auxLetter: {
    font: "11px roboto",
    fontWeight: 100,
    textAlign: "center",
  },
}));

const AColor = "#006738";
const BColor = "#8EC63E";
const CColor = "#F5E303";
const DColor = "#F8931D";
const EColor = "#BF1E2E";

const getColor = (day) => {
  switch (day) {
    case "A":
      return AColor;
    case "B":
      return BColor;
    case "C":
      return CColor;
    case "D":
      return DColor;
    case "E":
      return EColor;
    case null:
      return "#4d4d4d";
    case undefined:
      return undefined;
  }
};

const getLetter = (input) => {
  return input === null ? "?" : input;
};

export const AdherenceTimeline = () => {
  const classes = useStyles();

  const { day1, day2, day3, day4, day5 } = useTracker(() => {
    const noDataAvailable = {
      day1: undefined,
      day2: undefined,
      day3: undefined,
      day4: undefined,
      day5: undefined,
    };
    const orderHandler = Meteor.subscribe("orders");
    const recipeHandler = Meteor.subscribe("recipes");

    if (!orderHandler.ready() || !recipeHandler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }
    // find five last orders
    let start = new Date();
    start.setDate(start.getDate() - 5);
    start.setHours(0, 0, 0, 0);
    let end = new Date();
    const orders = OrdersCollection.find(
      {
        userid: Meteor.userId(),
        timestamp: { $gte: start, $lt: end },
      },
      { sort: { timestamp: -1 } }
    ).fetch();

    const groupedOrders = _.groupBy(orders, "orderday");
    let nutries = _.map(groupedOrders, (value, key) => {
      return { day: key, score: badestNutriscore(value) };
    });

    function badestNutriscore(orderArray) {
      if (!orderArray.length > 0) return undefined;
      let nutriResult = "A";
      let countNulls = 0;
      orderArray.forEach((order) => {
        let recipe = RecipesCollection.findOne({
          id: order.recipeId,
        });
        let tempNutriscore = getNutriscore(recipe);
        if (tempNutriscore === null) {
          countNulls++;
        } else {
          nutriResult =
            tempNutriscore > nutriResult ? tempNutriscore : nutriResult;
        }
      });
      if (countNulls === orderArray.length) {
        return null;
      }
      return nutriResult;
    }

    let temp = new Date();
    let today = temp.toISOString().substring(0, 10);
    let day1ago = new Date(temp.setDate(temp.getDate() - 1))
      .toISOString()
      .substring(0, 10);
    let day2ago = new Date(temp.setDate(temp.getDate() - 1))
      .toISOString()
      .substring(0, 10);
    let day3ago = new Date(temp.setDate(temp.getDate() - 1))
      .toISOString()
      .substring(0, 10);
    let day4ago = new Date(temp.setDate(temp.getDate() - 1))
      .toISOString()
      .substring(0, 10);

    let day1Temp, day2Temp, day3Temp, day4Temp, day5Temp;
    try {
      day1Temp = _.find(nutries, (n) => n.day === day4ago).score;
    } catch (error) {
      // no order for this day
    }
    try {
      day2Temp = _.find(nutries, (n) => n.day === day3ago).score;
    } catch (error) {
      // no order for this day
    }
    try {
      day3Temp = _.find(nutries, (n) => n.day === day2ago).score;
    } catch (error) {
      // no order for this day
    }
    try {
      day4Temp = _.find(nutries, (n) => n.day === day1ago).score;
    } catch (error) {
      // no order for this day
    }
    try {
      day5Temp = _.find(nutries, (n) => n.day === today).score;
    } catch (error) {
      // no order for this day
    }
    const day1 = day1Temp;
    const day2 = day2Temp;
    const day3 = day3Temp;
    const day4 = day4Temp;
    const day5 = day5Temp;

    return { day1, day2, day3, day4, day5 };
  });

  return (
    <Box className={classes.root}>
      <svg
        width="303"
        height="47"
        viewBox="0 0 303 47"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50.5 15C50.5 21.9036 44.9036 27.5 38 27.5C31.0964 27.5 25.5 21.9036 25.5 15C25.5 8.09644 31.0964 2.5 38 2.5C44.9036 2.5 50.5 8.09644 50.5 15Z"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <path
          d="M100.5 15C100.5 21.9036 94.9036 27.5 88 27.5C81.0964 27.5 75.5 21.9036 75.5 15C75.5 8.09644 81.0964 2.5 88 2.5C94.9036 2.5 100.5 8.09644 100.5 15Z"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <path
          d="M150.5 15C150.5 21.9036 144.904 27.5 138 27.5C131.096 27.5 125.5 21.9036 125.5 15C125.5 8.09644 131.096 2.5 138 2.5C144.904 2.5 150.5 8.09644 150.5 15Z"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <path
          d="M200.5 15C200.5 21.9036 194.904 27.5 188 27.5C181.096 27.5 175.5 21.9036 175.5 15C175.5 8.09644 181.096 2.5 188 2.5C194.904 2.5 200.5 8.09644 200.5 15Z"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <path
          d="M250.5 15C250.5 21.9036 244.904 27.5 238 27.5C231.096 27.5 225.5 21.9036 225.5 15C225.5 8.09644 231.096 2.5 238 2.5C244.904 2.5 250.5 8.09644 250.5 15Z"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <path
          d="M300.5 15C300.5 21.9036 294.904 27.5 288 27.5C281.096 27.5 275.5 21.9036 275.5 15C275.5 8.09644 281.096 2.5 288 2.5C294.904 2.5 300.5 8.09644 300.5 15Z"
          stroke="url(#paint0_linear)"
          strokeWidth="5"
        />
        <circle cx="38" cy="15" r="8" fill={getColor(day1)} />
        <circle cx="88" cy="15" r="8" fill={getColor(day2)} />
        <circle cx="138" cy="15" r="8" fill={getColor(day3)} />
        <circle cx="188" cy="15" r="8" fill={getColor(day4)} />
        <circle cx="238" cy="15" r="8" fill={getColor(day5)} />
        <line
          x1="51"
          y1="14.5"
          x2="76"
          y2="14.5"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <line
          x1="7.01723e-09"
          y1="14.5"
          x2="25"
          y2="14.5"
          stroke="url(#paint1_linear)"
          strokeWidth="5"
        />
        <line
          x1="100"
          y1="14.5"
          x2="125"
          y2="14.5"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <line
          x1="153"
          y1="14.5"
          x2="178"
          y2="14.5"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <line
          x1="203"
          y1="14.5"
          x2="228"
          y2="14.5"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <line
          x1="250"
          y1="14.5"
          x2="275"
          y2="14.5"
          stroke="#F9F1EC"
          strokeWidth="5"
        />
        <text x="34" y="19" className="letter">
          {getLetter(day1)}
        </text>
        <text x="84" y="19" className="letter">
          {getLetter(day2)}
        </text>
        <text x="134" y="19" className="letter">
          {getLetter(day3)}
        </text>
        <text x="184" y="19" className="letter">
          {getLetter(day4)}
        </text>
        <text x="234" y="19" className="letter">
          {getLetter(day5)}
        </text>

        <text x="225" y="39" className="auxLetter">
          {i18n.__("general.today")}
        </text>

        <text x="15" y="39" className="auxLetter">
          {i18n.__("general.five_days_ago")}
        </text>

        <defs>
          <linearGradient
            id="paint0_linear"
            x1="268.5"
            y1="15"
            x2="325"
            y2="15"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E7E8E9" />
            <stop offset="1" stopColor="#E7E8E9" stopOpacity="0.44" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="1.57888e-06"
            y1="7.99999"
            x2="23"
            y2="10.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E7E8E9" stopOpacity="0" />
            <stop offset="1" stopColor="#E7E8E9" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};