import { useTracker } from "meteor/react-meteor-data";
import React from "react";
import * as Survey from "survey-react";
import "survey-react/";
import "survey-react/survey.css";
import { HexadCollection } from "../db/surveys/HexadCollection";
import { UserPreferences } from '../db/userPreferences/UserPreferences';

const componentName = "FinalSurveyForm";
export const FinalSurveyForm = () => {

    const { json, prevData } = useTracker(() => {
        const noDataAvailable = { json: [] };

        const handlerHexad = Meteor.subscribe("survey-hexad");
        const preferencesHandler = Meteor.subscribe("userpreferences");

        if (!Meteor.user() || !handlerHexad.ready() || !preferencesHandler.ready()) {
            return { ...noDataAvailable, isLoading: true };
        }

        const userPreferences = UserPreferences.findOne({ userid: Meteor.userId() });
        const surveysCollection = HexadCollection.findOne({ id: "1" });

        const language = userPreferences.languageChosen;

        let surveyFFQ = surveysCollection.ffqSurvey;
        let surveys = surveysCollection.resqueSurveyEN; //todo

        if (language == "en") {
            surveyFFQ = surveysCollection.ffqSurveyEN;
            surveys = surveysCollection.resqueSurveyEN;
        }

        let pages = [].concat(surveys, surveyFFQ);

        let json = {
            pages: [],
            showProgressBar: "bottom",
        };

        pages.forEach(page => {
            // per Page
            let description = page.Subtitle ? page.Subtitle : "";
            let questions = [];

            if (page.Questions) {
                // per question per page
                page.Questions.forEach(question => {
                    // if (question.ID !== 'Year_of_Birth' && question.ID !== 'Sex' && question.ID !== 'Height')
                        questions.push(parseQuestion(question));
                });

                // in case of combined questions
            } if (page.CombinedQuestions) {
                page.CombinedQuestions.forEach(subQuestion => {

                    let dependsOn = subQuestion.DependsOn;
                    let disabledWhen = subQuestion.DisabledWhen;
                    // per question per page
                    subQuestion.Questions.forEach(question => {
                        // question.Title = question.Title + " - " + subQuestion.Title;
                        question.Title = subQuestion.Title;
                        question.DependsOnParent = dependsOn;
                        question.DisabledWhenParent = disabledWhen;
                        questions.push(parseQuestion(question));
                    });
                });
            }
            json.pages.push({ title: page.Title, description: description, name: page.ID, questions: questions })
        });

        const prevData = userPreferences?.partialFinalAnswers;

        return { json, prevData };
    });

    function parseQuestion(question) {
        const QuestionID = question.ID;
        const QuestionTitle = question.Title.replace(/<BR\/>/i, "\n");
        let visible = "true";

        if (question.DependsOn) {
            visible = "{" + question.DependsOn + "}!=" + question.DisabledWhen + "and {" + question.DependsOn + "} notempty";
        }

        if (question.DependsOnParent) {
            visible = visible + "and {" + question.DependsOnParent + "}!=" + question.DisabledWhenParent;
        }

        switch (question.QuestionType) {
            case 0:
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
            case 2:
                return {
                    type: "text",
                    name: QuestionID,
                    title: QuestionTitle,
                    placeHolder: "",
                    isRequired: !question.optional,
                    autoComplete: "name",
                    visibleIf: visible
                }
            default:
                break;
        }
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
        Meteor.call('users.saveFinalSurvey', parsedOutput);
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

    model.sendResultOnPageNext = true;

    function saveSurveyData(model) {
        let data = model.data;
        data.pageNo = model.currentPageNo + 1;
        data["page" + data.pageNo] = new Date();
        Meteor.call('users.savePartialFinalSurvey', data);
    }

    model.onPartialSend.add(function (model) {
        saveSurveyData(model);
    });

    model.onComplete.add(function (model, options) {
        saveSurveyData(model);
    });

    if (prevData) {
        let data = prevData;
        model.data = data;
        if (data.pageNo) {
            model.currentPageNo = data.pageNo;
        }
    }

    return (
        <Survey.Survey model={model} onComplete={onComplete} />
    );
};