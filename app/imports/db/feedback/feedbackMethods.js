import { check } from 'meteor/check';
import { FeedbackCollection } from '/imports/db/feedback/FeedbackCollection';

Meteor.methods({
    "feedback.submitNewFeedback"(feedback) {
        check(feedback, String);
    
        if (!this.userId) {
          throw new Meteor.Error("Not authorized.");
        }
    
        // todo: current preferences needed?
        // const userPreferences = UserPreferences.findOne({ userid: this.userId });
        // const recommendations = RecommendedRecipes.findOne({ userid: this.userId });
    
        FeedbackCollection.insert({
          userid: this.userId,
          feedback: feedback,
          timestamp: new Date(),
          // userPreferences: userPreferences,
          // recommendedRecipes: recommendations,
        });
      }
});
