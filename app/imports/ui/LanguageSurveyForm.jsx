import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import * as Survey from "survey-react";
import "survey-react/";
import "survey-react/survey.css";
import { HexadCollection } from "../db/surveys/HexadCollection";

const componentName = "LanguageSurveyForm";
export const LanguageSurveyForm = () => {

    const { json } = useTracker(() => {
        const noDataAvailable = { json: [] };

        const handlerHexad = Meteor.subscribe("survey-hexad");

        if (!Meteor.user() || !handlerHexad.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const surveys = HexadCollection.findOne({id:"1"});

        const languageQuestion = [surveys.languageSurvey];

        let pages = languageQuestion;

        let json = {
            pages: [],
            // showProgressBar: "bottom",
        };

        pages.forEach(page => {
            // per Page
            let description = page.Subtitle ? page.Subtitle : "";
            let questions = [];

            if (page.Questions) {
                // per question per page
                page.Questions.forEach(question => {
                    questions.push(parseQuestion(question));
                });
            }
            json.pages.push({ title: page.Title, description: description, name: page.ID, questions: questions })
        });
        return { json };
    });

    function parseQuestion(question) {
        const QuestionID = question.ID;
        const QuestionTitle = question.Title.replace(/<BR\/>/i, "\n");
        let visible = "true";

        // parse answer in SurveyJS format
        let answers = [];
        question.Answers.forEach(answer => {
            answers.push({ value: answer.Value, text: answer.Answer });
        })
        return {
            type: "radiogroup",
            choices: answers,
            isRequired: !question.optional,
            name: QuestionID,
            title: QuestionTitle,
            visibleIf: visible
        };
    }

    //Define a callback methods on survey complete
    const onComplete = (survey, options) => {

        let parsedOutput = { ...survey.data }; //clone
        _.each(survey.data, (value, key) => {
            parsedOutput[key] = value.value !== undefined ? value.value : value; // >= confusion 0 and undefined
        });

        if (parsedOutput.pageNo) {
            delete parsedOutput.pageNo;
        }

        //Write survey results into database
        Meteor.call('users.saveLanguage', parsedOutput);
        Meteor.call("log", componentName, "onComplete", navigator.userAgent);
    }

    var defaultThemeColors = Survey.StylesManager.ThemeColors["default"];
    defaultThemeColors["$main-color"] = "#F57D20";
    defaultThemeColors["$header-color"] = "#F57D20";
    defaultThemeColors["$body-background-color"] = "#F9F1EC";
    defaultThemeColors["$body-container-background-color"] = "#fff";
    Survey.StylesManager.applyTheme();

    let model = new Survey.Model(json);

    model.showQuestionNumbers = "off";

    // function saveSurveyData(model) {
    //     let data = model.data;
    //     data.pageNo = model.currentPageNo + 1;
    //     data["page" + data.pageNo] = new Date();
    //     Meteor.call('users.saveLanguage', data);
    // }

    // model.onComplete.add(function (model, options) {
    //     saveSurveyData(model);
    // });

    return (
        <Survey.Survey model={model} onComplete={onComplete} />
    );
};