
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
import { PieChart, Pie, BarChart, Bar, LabelList, Label, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter } from 'recharts';


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
    colors: ['#888', ['#ad72b5', '#800e84', '#4c084f'], ['#48bf6f', '#006f30', '#00421c']],
};

const data01 = [
    {
        "x": 100,
        "y": 200,
        "z": 200
    },
    {
        "x": 120,
        "y": 100,
        "z": 260
    },
    {
        "x": 170,
        "y": 300,
        "z": 400
    },
    {
        "x": 140,
        "y": 250,
        "z": 280
    },
    {
        "x": 150,
        "y": 400,
        "z": 500
    },
    {
        "x": 110,
        "y": 280,
        "z": 200
    }
];
const data02 = [
    {
        "x": 200,
        "y": 260,
        "z": 240
    },
    {
        "x": 240,
        "y": 290,
        "z": 220
    },
    {
        "x": 190,
        "y": 290,
        "z": 250
    },
    {
        "x": 198,
        "y": 250,
        "z": 210
    },
    {
        "x": 180,
        "y": 280,
        "z": 260
    },
    {
        "x": 210,
        "y": 220,
        "z": 230
    }
];


const componentName = "AnalyticsScreen";
export const AnalyticsScreen = () => {

    const classes = useStyles();

    const { pieChartSex, barChartDevices, barChartOs, barChartLocationParticipant, barChartBirthYear, barChartWeight, resqueResult, parsedFinishedUsers, nbFinishedUsers, allLogs, ffqs, allOrders, confirmedOrders, nonVirtualConfirmedOrders } = useTracker(() => {
        const noDataAvailable = { pieChartSex: [], barChartDevices: [], barChartOs: [], barChartLocationParticipant: [], barChartBirthYear: [], barChartWeight: [], resqueResult: [], parsedFinishedUsers: [], nbFinishedUsers: 0, allLogs: [], ffqs: [], allOrders: [], confirmedOrders: [], nonVirtualConfirmedOrders: [] };

        const preferencesHandler = Meteor.subscribe("userpreferences-tokens");
        const ordersHandler = Meteor.subscribe("orders");
        const logsHandler = Meteor.subscribe("logs");
        const recipeHandler = Meteor.subscribe("recipes");
        const surveyHandler = Meteor.subscribe("survey-hexad");

        if (!Meteor.user() || !preferencesHandler.ready() || !ordersHandler.ready() || !logsHandler.ready() || !recipeHandler.ready() || !surveyHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const testUserIds = UserPreferences.find({ "ffqAnswers.status_survey": "test" }).fetch().map(user => user.userid);
        const ffqs = UserPreferences.find({ ffqAnswers: { $exists: true }, userid: { $nin: testUserIds } }).fetch();

        const barChartLocationParticipant = [
            {
                location: "Beerse",
                intern: UserPreferences.find({ "ffqAnswers.status_survey": "intern" }).fetch().length,
                extern: UserPreferences.find({ "ffqAnswers.status_survey": "extern" }).fetch().length,
            },
            {
                location: "Geel",
                intern: UserPreferences.find({ "ffqAnswers.status_survey": "intern-geel" }).fetch().length,
                extern: UserPreferences.find({ "ffqAnswers.status_survey": "extern-geel" }).fetch().length,
            }
        ];

        const barChartBirthYear = _.map(_.countBy(ffqs, user => user.ffqAnswers.Year_of_Birth), (value, key) => { return { year: key, count: value } });
        const barChartWeight = _.map(_.countBy(ffqs, user => Math.floor(user.ffqAnswers.Weight / 10) * 10), (value, key) => { return { weight: key + "+", count: value } });
        const pieChartSex = _.map(_.countBy(ffqs, user => user.ffqAnswers.Sex), (value, key) => { return { sex: key, count: value } });

        const finishedUsers = UserPreferences.find({ finished: { $exists: true }, userid: { $nin: testUserIds } }).fetch();
        const nbFinishedUsers = finishedUsers?.length;

        // mongo aggregate is not supported in meteor client
        const orders = OrdersCollection.find({ userid: { $nin: testUserIds } }).fetch();
        const tempOrders = _.groupBy(_.countBy(orders, "userid"), (value, key) => +value);
        const allOrders = _.map(tempOrders, (value, key) => { return { "nbOrders": +key, "count": +value.length } });

        const allConfirmedOrders = OrdersCollection.find({ "confirmed": true, userid: { $nin: testUserIds } }).fetch();
        const tempConfirmedOrders = _.groupBy(_.countBy(allConfirmedOrders, "userid"), (value, key) => +value);
        const confirmedOrders = _.map(tempConfirmedOrders, (value, key) => { return { "nbOrders": +key, "count": value.length } });

        const allNonVirtualConfirmedOrders = OrdersCollection.find({ "confirmed": true, "confirmedVirtual": false, userid: { $nin: testUserIds } }).fetch();
        const tempNonVirtualConfirmedOrders = _.groupBy(_.countBy(allNonVirtualConfirmedOrders, "userid"), (value, key) => +value);
        const nonVirtualConfirmedOrders = _.map(tempNonVirtualConfirmedOrders, (value, key) => { return { "nbOrders": +key, "count": value.length } });

        const allLogs = LogsCollection.find({ userid: { $nin: testUserIds } }).fetch();
        const barChartOs = _.map(_.countBy(allLogs, agent => uaparserjs(agent.agent).os.name), (value, key) => { return { os: key, count: value } })
        const barChartDevices = _.map(_.countBy(allLogs, agent => uaparserjs(agent.agent).device.model), (value, key) => { return { device: key, count: value } })

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

        return { pieChartSex, barChartOs, barChartDevices, barChartLocationParticipant, barChartBirthYear, barChartWeight, resqueResult, parsedFinishedUsers, nbFinishedUsers, allLogs, ffqs, allOrders, confirmedOrders, nonVirtualConfirmedOrders }
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

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ x, y, cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x2 = cx + radius * Math.cos(-midAngle * RADIAN);
        const y2 = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <>
                <text x={x} y={y} dominantBaseline="central" fill="#8884d8">
                    {pieChartSex[index].sex}
                </text>
                <text x={x2} y={y2} fill="white" dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
            </>
        );
    };

    return (
        <Container>
            {SHOW_NB_PARTICIPANTS ? <>
                <Typography className={classes.header} variant="h4">
                    {ffqs.length} participants ({nbFinishedUsers} completely finished)
                </Typography>
                {SHOW_INTERN_VS_EXTERN ? <>
                    <BarChart width={730} height={250} data={barChartLocationParticipant}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" />
                        <YAxis label={{ value: "Number of participants", angle: -90, position: "insideBottomLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="intern" fill="#8884d8">
                            <LabelList dataKey="intern" position="top" />
                        </Bar>
                        <Bar dataKey="extern" fill="#82ca9d">
                            <LabelList dataKey="extern" position="top" />
                        </Bar>
                    </BarChart>
                    <BarChart width={730} height={250} data={barChartBirthYear}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis label={{ value: "Number of participants", angle: -90, position: "insideBottomLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Birth Year">
                            <LabelList dataKey="count" position="top" />
                        </Bar>
                    </BarChart>
                    <BarChart width={730} height={250} data={barChartWeight}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="weight" />
                        <YAxis label={{ value: "Number of participants", angle: -90, position: "insideBottomLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Weight">
                            <LabelList dataKey="count" position="top" />
                        </Bar>
                    </BarChart>
                    <PieChart width={730} height={250}>
                        <Pie data={pieChartSex} dataKey="count" nameKey="sex" cx="50%" cy="50%" fill="#8884d8" outerRadius={80} label={renderCustomizedLabel} />
                    </PieChart>
                </> : <></>}
            </> : <></>}

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
                    {/* Number of complete ffqs: {ffqs.length}<br /> */}
                    {/* Number of finished users: {nbFinishedUsers}<br /> */}
                    {/* Number of user with confirmed orders: {_.sumBy(confirmedOrders, order => +order.count)}<br /> */}
                </Typography>

                {SHOW_ORDER_DETAIL ? <>
                    <ScatterChart width={window.innerWidth - 60} height={730}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis dataKey="count" name="#users" type="number" label />
                        <XAxis dataKey="nbOrders" name="#orders" type="number" label />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Confirmed orders" data={confirmedOrders} fill="#8884d8" />
                        <Scatter name="Confirmed order (not virtual)" data={nonVirtualConfirmedOrders} fill="#82ca9d" />
                        <Scatter name="All orders" data={allOrders} fill="#ca828b" />
                    </ScatterChart>
                </> : <></>}
            </> : <></>}



            {SHOW_INTERACTION_DATA ? <>
                <Typography className={classes.header} variant="h4">
                    Log interaction data
                </Typography>
                {SHOW_NB_INTERACTIONS ? <>
                    {/* <Typography className={classes.header} variant="body1">
                        Number of interactions per users:<br />
                    </Typography>
                    <ul style={{ "listStyleType": "none" }}>
                        {_.map(
                            _.groupBy(allLogs, "userid"), (value, key1) =>
                            <VListItem key={"nbOrder-" + key1} value={value.length} label={key1.substring(0, 5)} />
                        )}
                    </ul> */}
                </> : <></>}
                {SHOW_OS ? <>
                    <Typography className={classes.header} variant="body1">
                        Operating systems:<br />
                    </Typography>
                    <BarChart width={730} height={250} data={barChartOs}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="os" />
                        <YAxis label={{ value: "Number of usages", angle: -90, position: "insideBottomLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Operating system">
                            <LabelList dataKey="count" position="top" />
                        </Bar>
                    </BarChart>
                </> : <></>}
                {SHOW_DEVICES ? <>
                    <Typography className={classes.header} variant="body1">
                        Most used device models:<br />
                    </Typography>
                    <BarChart width={window.innerWidth - 40} height={250} data={barChartDevices}
                        margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="device" />
                        <YAxis label={{ value: "Number of usages", angle: -90, position: "insideBottomLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Device">
                            <LabelList dataKey="count" position="top" />
                        </Bar>
                    </BarChart>
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

            <PrettyPrint jsonObj={parsedFinishedUsers} />


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