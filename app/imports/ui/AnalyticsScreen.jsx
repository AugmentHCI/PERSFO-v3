
import { Box, Button, Container, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import { UserPreferences } from '../db/userPreferences/UserPreferences';
import { OrdersCollection } from '/imports/db/orders/OrdersCollection';
import { LogsCollection } from '/imports/db/logs/LogsCollection';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { HexadCollection } from '/imports/db/surveys/HexadCollection';
import uaparserjs from 'ua-parser-js';
import { LikertKey, LikertLegend, TableWrapper } from 'react-likert'

const SHOW_NB_PARTICIPANTS = true;
const SHOW_INTERN_VS_EXTERN = true;

const SHOW_STATISTICS = true;
const SHOW_ORDER_DETAIL = true;

const SHOW_INTERACTION_DATA = true;
const SHOW_NB_INTERACTIONS = true;
const SHOW_OS = true;
const SHOW_DEVICES = true;
const SHOW_METHODS = true;

const SHOW_RESQUE = true;

const useStyles = makeStyles(() => ({
    header: {
        margin: "20px",
    }
}));

const scale = [
    'Strongly disagree',
    'Disagree',
    'Somewhat disagree',
    'Neither agree nor disagree',
    'Somewhat agree',
    'Agree',
    'Strongly agree',
];

const options = {
    usePatterns: false,
    colors: ['#888', ['#ad72b5','#800e84','#4c084f'], [ '#48bf6f','#006f30','#00421c']],
};

const componentName = "AnalyticsScreen";
export const AnalyticsScreen = () => {

    const classes = useStyles();

    const { resqueResult, parsedFinishedUsers, nbFinishedUsers, allLogs, internBeerse, externBeerse, internGeel, externGeel, ffqs, allConfirmedOrders, confirmedOrders, nonVirtualConfirmedOrders } = useTracker(() => {
        const noDataAvailable = { resqueResult: [], parsedFinishedUsers: [], nbFinishedUsers: 0, allLogs: [], internBeerse: [], externBeerse: [], internGeel: [], externGeel: [], ffqs: [], confirmedOrders: [], nonVirtualConfirmedOrders: [] };

        const preferencesHandler = Meteor.subscribe("userpreferences-tokens");
        const ordersHandler = Meteor.subscribe("orders");
        const logsHandler = Meteor.subscribe("logs");
        const recipeHandler = Meteor.subscribe("recipes");
        const surveyHandler = Meteor.subscribe("survey-hexad");

        if (!Meteor.user() || !preferencesHandler.ready() || !ordersHandler.ready() || !logsHandler.ready() || !recipeHandler.ready() || !surveyHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const internBeerse = UserPreferences.find({ "ffqAnswers.status_survey": "intern" }).fetch();
        const externBeerse = UserPreferences.find({ "ffqAnswers.status_survey": "extern" }).fetch();
        const internGeel = UserPreferences.find({ "ffqAnswers.status_survey": "intern-geel" }).fetch();
        const externGeel = UserPreferences.find({ "ffqAnswers.status_survey": "extern-geel" }).fetch();

        const testUserIds = UserPreferences.find({ "ffqAnswers.status_survey": "test" }).fetch().map(user => user.userid);

        const ffqs = UserPreferences.find({ ffqAnswers: { $exists: true }, userid: { $nin: testUserIds } }).fetch();
        const finishedUsers = UserPreferences.find({ finished: { $exists: true }, userid: { $nin: testUserIds } }).fetch();
        const nbFinishedUsers = finishedUsers?.length;

        // mongo aggregate is not supported in meteor client
        const allConfirmedOrders = OrdersCollection.find({ "confirmed": true, userid: { $nin: testUserIds } }).fetch();
        const tempConfirmedOrders = _.groupBy(_.countBy(allConfirmedOrders, "userid"), (value, key) => value);
        const confirmedOrders = _.map(tempConfirmedOrders, (value, key) => { return { "nbOrders": key, "count": value.length } });

        const allNonVirtualConfirmedOrders = OrdersCollection.find({ "confirmed": true, "confirmedVirtual": false, userid: { $nin: testUserIds } }).fetch();
        const tempNonVirtualConfirmedOrders = _.groupBy(_.countBy(allNonVirtualConfirmedOrders, "userid"), (value, key) => value);
        const nonVirtualConfirmedOrders = _.map(tempNonVirtualConfirmedOrders, (value, key) => { return { "nbOrders": key, "count": value.length } });

        const allLogs = LogsCollection.find({ userid: { $nin: testUserIds } }).fetch();

        const resqueQuestions = HexadCollection.findOne({}).resqueSurveyEN.Questions;
        const parsedFinishedUsers = finishedUsers.map(user => {
            const logsUser = LogsCollection.find({ userid: user.userid }).fetch();
            const ordersUser = OrdersCollection.find({ userid: user.userid }).fetch();

            let osUsed = {};
            _.forEach(_.groupBy(logsUser, log => uaparserjs(log.agent).os.name), (value, os) => osUsed[os] = value.length);

            let goodRec = 0;
            let badRec = 0;
            let daysUsed = {};
            _.forEach(_.groupBy(logsUser, log => log.timestamp.toISOString().substring(0, 10)), (value, day) => {
                let todaysOrders = OrdersCollection.find({ userid: user.userid, orderday: day }).fetch();
                const todaysRecRecipeId = (_.find(user.lastRecommendations, rec => rec.date == day))?.recipeId;
                const todaysRecRecipe = RecipesCollection.findOne({ id: todaysRecRecipeId });
                let recommendationFollowed = _.find(todaysOrders, order => order.recipeId == todaysRecRecipeId) ? true : false;

                recommendationFollowed ? goodRec++ : badRec++;

                return daysUsed[day] = {
                    "interactions": value.length,
                    "nbOrders": todaysOrders.length,
                    "recommendedMeal": recommendationFollowed + " recipe: " + todaysRecRecipe?.name
                }
            });

            return {
                userid: user.userid,
                nbInteractions: logsUser.length,
                osUsed: osUsed,
                // daysUsed: daysUsed,
                recommendationAccuracy: Math.floor((goodRec / (goodRec + badRec)) * 100) + "%"
                // ordersByDay: _.groupBy(ordersUser, order => order.orderday),
                // recommendations: _.groupBy(user.lastRecommendations, "recipeId")
            }
        });


        // resque data
        let resqueResult = [];
        _.forEach(finishedUsers[0].resqueAnswers, (a, question) => {
            let temp = {
                prompt: _.find(resqueQuestions, q => q.ID == question).Title,
                responded: 0,
                'Strongly disagree': 0,
                'Disagree': 0,
                "Somewhat disagree": 0,
                'Neither agree nor disagree': 0,
                "Somewhat agree": 0,
                'Agree': 0,
                'Strongly agree': 0
            };
            _.forEach(finishedUsers, user => {
                const answer = user.resqueAnswers[question];
                temp["responded"]++;
                switch (+answer) {
                    case -3:
                        temp["Strongly disagree"]++;
                        break;
                    case -2:
                        temp["Disagree"]++;
                        break;
                    case -1:
                        temp["Somewhat disagree"]++;
                        break;
                    case 0:
                        temp["Neither agree nor disagree"]++;
                        break;
                    case 1:
                        temp["Somewhat agree"]++;
                        break;
                    case 2:
                        temp["Agree"]++;
                        break;
                    case 3:
                        temp["Strongly agree"]++;
                        break;
                    default:
                        console.log("should not happen")
                        break;
                }
            });
            temp["Strongly disagree"] = temp["Strongly disagree"] / temp["responded"];
            temp["Disagree"] = temp["Disagree"] / temp["responded"];
            temp["Somewhat disagree"] = temp["Somewhat disagree"] / temp["responded"];
            temp["Neither agree nor disagree"] = temp["Neither agree nor disagree"] / temp["responded"];
            temp["Somewhat agree"] = temp["Somewhat agree"] / temp["responded"];
            temp["Agree"] = temp["Agree"] / temp["responded"];
            temp["Strongly agree"] = temp["Strongly agree"] / temp["responded"];
            resqueResult.push(temp);
        });

        // {
        //     prompt: 'Likerts are useful', 
        //     responded: 35,
        //     'Strongly Disagree': 0.3, 
        //     'Disagree': 0.25, 
        //     'Undecided': 0, 
        //     'Agree': 0.22, 
        //     'Strongly Agree': 0.23 
        //   }



        return { resqueResult, parsedFinishedUsers, nbFinishedUsers, allLogs, internBeerse, externBeerse, internGeel, externGeel, ffqs, allConfirmedOrders, confirmedOrders, nonVirtualConfirmedOrders }
    });



    function VListItem(props) {
        return <li>{props.label}: {props.value}</li>;
    }

    function HListItem(props) {
        return <li style={{ "display": "inline-block", "marginLeft": "6px" }}>{props.label}: {props.value}</li>;
    }

    function PrettyPrint(props) {
        return <pre>{JSON.stringify(props.jsonObj, null, 2)}</pre>
    }

    return (
        <Container>
            {SHOW_NB_PARTICIPANTS ? <>
                <Typography className={classes.header} variant="h4">
                    Number of participants
                </Typography>
                <Typography className={classes.header} variant="body1">
                    {SHOW_INTERN_VS_EXTERN ? <>
                        Intern Beerse: {internBeerse.length}<br />
                        Extern Beerse: {externBeerse.length}<br />
                        Intern Geel: {internGeel.length}<br />
                        Extern Geel: {externGeel.length}<br />
                    </> : <></>}

                    Total number of participants: {internBeerse.length + externBeerse.length + internGeel.length + externGeel.length}
                </Typography></> : <></>}

            {SHOW_RESQUE ? <>
                <Typography className={classes.header} variant="h4">
                    Resque
                </Typography>
                <div>
                    <LikertLegend
                        scale={scale}
                        inline={true}
                        options={options}
                        size={12}
                        style={{ textAlign: 'right' }}
                    />
                    <TableWrapper scale={scale} options={options}>
                        {
                            CellRenderer =>
                                <table style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>prompt </th>
                                            <th style={{ textAlign: 'left', width: '3em' }}>n </th>
                                            <td style={{ width: '50%' }}> </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            resqueResult.map(({ prompt, responded, ...values }, i) =>
                                                <tr key={i}>
                                                    <td>{prompt}</td>
                                                    <td>{responded}</td>
                                                    <CellRenderer value={values} />
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                        }
                    </TableWrapper>
                </div>

            </> : <></>}

            {SHOW_STATISTICS ? <>
                <Typography className={classes.header} variant="h4">
                    General statistics
                </Typography>
                <Typography className={classes.header} variant="body1">
                    Number of complete ffqs: {ffqs.length}<br />
                    Number of finished users: {nbFinishedUsers}<br />
                    Number of user with confirmed orders: {_.sumBy(confirmedOrders, order => +order.count)}<br />
                </Typography>
                <PrettyPrint jsonObj={parsedFinishedUsers} />
                {SHOW_ORDER_DETAIL ? <>
                    <ul style={{ "listStyleType": "none" }}>
                        {confirmedOrders.map((orders, i) => <HListItem key={"nbOrder-" + i} value={orders.count} label={orders.nbOrders} />)}
                    </ul>
                    <Typography className={classes.header} variant="body1">
                        Number of user with orders at location: {_.sumBy(nonVirtualConfirmedOrders, order => +order.count)}<br />
                    </Typography>
                    <ul style={{ "listStyleType": "none" }}>
                        {nonVirtualConfirmedOrders.map((orders, i) => <HListItem key={"nbOrder-" + i} value={orders.count} label={orders.nbOrders} />)}
                    </ul>
                </> : <></>}
            </> : <></>}



            {SHOW_INTERACTION_DATA ? <>
                <Typography className={classes.header} variant="h4">
                    Log interaction data
                </Typography>
                {SHOW_NB_INTERACTIONS ? <>
                    <Typography className={classes.header} variant="body1">
                        Number of interactions per users:<br />
                    </Typography>
                    <ul style={{ "listStyleType": "none" }}>
                        {_.map(
                            _.groupBy(allLogs, "userid"), (value, key1) =>
                            <VListItem key={"nbOrder-" + key1} value={value.length} label={key1.substring(0, 5)} />
                        )}
                    </ul>
                </> : <></>}
                {SHOW_OS ? <>
                    <Typography className={classes.header} variant="body1">
                        User agents:<br />
                    </Typography>
                    <ul style={{ "listStyleType": "none" }}>
                        {_.map(_.groupBy(allLogs, agent => uaparserjs(agent.agent).os.name), (value, key1) => <HListItem key={"nbOrder-" + key1} value={value.length} label={key1} />)}
                    </ul>
                </> : <></>}
                {SHOW_DEVICES ? <>
                    <Typography className={classes.header} variant="body1">
                        Most used device models:<br />
                    </Typography>

                    <ul style={{ "listStyleType": "none" }}>
                        {_.map(_.groupBy(allLogs, agent => uaparserjs(agent.agent).device.model), (value, key1) => <VListItem key={"nbOrder-" + key1} value={value.length} label={key1} />)}
                    </ul>
                </> : <></>}
                {SHOW_METHODS ? <>
                    <Typography className={classes.header} variant="body1">
                        Most used methods:<br />
                    </Typography>
                    <ul style={{ "listStyleType": "none" }}>
                        {_.map(_.groupBy(allLogs, "method"), (value, key1) => <VListItem key={"nbOrder-" + key1} value={value.length} label={key1} />)}
                    </ul>
                </> : <></>}
            </> : <></>}

            <Button type="submit"
                variant="contained"
                color="primary"
                style={{ color: "white" }}
                onClick={() => Meteor.logout()}>
                {i18n.__("AppBarPersfo.logout")}
            </Button>
        </Container>
    );
}