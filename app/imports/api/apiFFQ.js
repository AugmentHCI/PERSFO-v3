import { HexadCollection } from "../db/surveys/HexadCollection";
import { UserPreferences } from "../db/userPreferences/UserPreferences";

const quisperToken = "dOETXx7hPv7aJHKUMlLfJ3NxhEY9UFEe8UPf19K9";
const url = "https://quisper.onsafecape.gr/FFQ/questionnaire?lang=";
const food4meURL = "https://api.quisper.eu/ffq-personalised-nutrition-advice/beta/ffq-food4me-l1/1";

var fs = require("fs");

export function initFFQ() {
    let call = HTTP.call("GET", url + "nl-NL", {
        headers: {
            Accept: "application/json",
        },
    });

    if (call.data) {
        HexadCollection.upsert({ id: "1" }, { $set: { ffqSurvey: call.data.Groups, ffqVersion: call.data.Version } });
    }

    let callEN = HTTP.call("GET", url + "en-US", {
        headers: {
            Accept: "application/json",
        },
    });
    if (callEN.data) {
        HexadCollection.upsert({ id: "1" }, { $set: { ffqSurveyEN: callEN.data.Groups, ffqVersion: callEN.data.Version } });
    }
}

export function food4me(FFQ, userID) {
    let call = HTTP.call("POST", food4meURL, {
        headers: {
            "x-api-key": quisperToken,
            Accept: "application/json",
        },
        data: { "Questionnaire": { "Questions": FFQ } }
    }
    );
    if (call.data) {
        console.log("food4me: food4me data for user loaded:" + userID);
        UserPreferences.upsert(
            { userid: userID },
            { $set: { food4me: call.data } }
        );
    } else {
        console.log("food4me: no food4me data for user:" + userID);
    }
}

