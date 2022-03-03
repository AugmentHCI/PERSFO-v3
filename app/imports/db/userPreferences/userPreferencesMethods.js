import { check } from 'meteor/check';
import { food4me } from '../../api/apiFFQ';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';

Meteor.methods({
    "users.setNewPassword"(username, newPassword, token) {
        if (token !== "sbpb@3$Dys&22e5QJv3KbBkY") {
            throw Error;
        }
        const user = Accounts.findUserByUsername(username);
        try {
            console.log(username);
        } catch (error) {}
        Accounts.setPassword(user._id, newPassword);
    },
    "users.addDislikes"(dislikes) {
        check(dislikes, Array);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        dislikes.forEach((dislike) => {
            UserPreferences.upsert(
                { userid: this.userId },
                { $addToSet: { dislikedIngredients: dislike } }
            );
        });
    },
    "users.deleteDislikes"() {
        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        const oldDislikedIngredients = UserPreferences.findOne({ userid: this.userId }).dislikedIngredients;

        if (oldDislikedIngredients && oldDislikedIngredients.length == 0) {
            // do nothing - already empty
        } else {
            UserPreferences.upsert(
                { userid: this.userId },
                { $set: { dislikedIngredients: [], oldDislikedIngredients: oldDislikedIngredients } }
            );
        }

    },
    "users.saveSurvey"(SurveyAnswers) {
        check(SurveyAnswers, Object);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        const cleanedData = Object.keys(SurveyAnswers)
            .filter(key => !key.includes("page"))
            .reduce((obj, key) => {
                obj[key] = SurveyAnswers[key];
                return obj;
            }, {});

        const ffqAnswers = Object.keys(cleanedData)
            .filter(key => !key.includes("HEXAD"))
            .reduce((obj, key) => {
                obj[key] = cleanedData[key];
                return obj;
            }, {});

        // duplication of above needed because object and not an array
        const hexadAnswers = Object.keys(cleanedData)
            .filter(key => key.includes("HEXAD"))
            .reduce((obj, key) => {
                obj[key] = cleanedData[key];
                return obj;
            }, {});

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { ffqAnswers: ffqAnswers, hexadAnswers: hexadAnswers } }
        );

        const userID = this.userId; // needed because this is different in HTTP call.
        food4me(ffqAnswers, userID);
    },
    "users.saveFinalSurvey"(SurveyAnswers) {
        check(SurveyAnswers, Object);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        const cleanedData = Object.keys(SurveyAnswers)
            .filter(key => !key.includes("page"))
            .reduce((obj, key) => {
                obj[key] = SurveyAnswers[key];
                return obj;
            }, {});

        const ffqAnswers = Object.keys(cleanedData)
            .filter(key => !key.includes("resque"))
            .reduce((obj, key) => {
                obj[key] = cleanedData[key];
                return obj;
            }, {});

        // duplication of above needed because object and not an array
        const resqueAnswers = Object.keys(cleanedData)
            .filter(key => key.includes("resque"))
            .reduce((obj, key) => {
                obj[key] = cleanedData[key];
                return obj;
            }, {});

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { finalFfqAnswers: ffqAnswers, resqueAnswers: resqueAnswers } }
        );
    },
    "users.savePartialSurvey"(SurveyAnswers) {
        check(SurveyAnswers, Object);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { partialAnswers: SurveyAnswers } }
        );
    },
    "users.savePartialFinalSurvey"(SurveyAnswers) {
        check(SurveyAnswers, Object);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { partialFinalAnswers: SurveyAnswers } }
        );
    },
    "users.updateLanguage"(languageBoolean) {
        check(languageBoolean, Boolean);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        const oldLanguage = UserPreferences.findOne({ userid: this.userId }).languageChosen;

        const newLanguage = oldLanguage === "en" ? "nl" : "en";

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { languageChosen: newLanguage } }
        );
    },
    "users.updateAllergens"(allergens) {
        check(allergens, Array);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { allergens: allergens } }
        );
    },
    "users.updateDietaries"(dietaries) {
        check(dietaries, Array);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { dietaries: dietaries } }
        );
    },
    "users.updateNutrientGoals"(nutrientGoals) {
        check(nutrientGoals, Object);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { nutrientGoals: nutrientGoals } }
        );
    },
    "users.updateActiveNutrientGoals"(activeNutrientGoals) {
        check(activeNutrientGoals, Object);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { activeNutrientGoals: activeNutrientGoals } }
        );
    },
    "users.handleLikeRecommendation"(recipeId, keep) {
        check(recipeId, String);

        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        if (!keep) {
            UserPreferences.update(
                { userid: this.userId },
                { $pull: { likedRecommendations: recipeId } }
            );
        } else {
            if (
                UserPreferences.find({
                    userid: this.userId,
                    likedRecommendations: { $in: [recipeId] },
                }).fetch().length > 0
            ) {
                // recommendation is not liked anymore
                UserPreferences.update(
                    { userid: this.userId },
                    { $pull: { likedRecommendations: recipeId } }
                );
            } else {
                UserPreferences.upsert(
                    { userid: this.userId },
                    { $addToSet: { likedRecommendations: recipeId } }
                );
            }
        }
    },
    "users.finishedICF"() {
        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { icfFinished: true } }
        );
    },
    "users.saveLanguage"(language) {
        if (!this.userId) {
            throw new Meteor.Error("Not authorized.");
        }

        console.log(language)

        UserPreferences.upsert(
            { userid: this.userId },
            { $set: { languageChosen: language.language_survey } }
        );
    }
});