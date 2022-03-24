import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { initFFQ } from "../imports/api/apiFFQ";
import { initData } from "/imports/api/apiPersfo";
import "/imports/db/dbMethods.js";
import "/imports/db/dbPublications.js";
import "/imports/api/apiPersfo";

import { MenusCollection } from '/imports/db/menus/MenusCollection';
import { RecipesCollection } from '/imports/db/recipes/RecipesCollection';
import { IngredientCollection } from '/imports/db/ingredients/IngredientCollection';

import { RecommendedRecipes } from '/imports/db/recommendedRecipes/RecommendedRecipes';
import { UserPreferences } from '/imports/db/userPreferences/UserPreferences';
import { HexadCollection } from "/imports/db/surveys/HexadCollection";
import { DietaryRecommendations } from '/imports/db/dietaryRecommendations/DietaryRecommendations';

// hack to create the RecipesCollection. Upsert does not create a collection.
RecipesCollection.insert({
  _id: "1",
  value: "hack to create collection in meteor",
});
RecipesCollection.remove({ _id: "1" });
IngredientCollection.insert({
  _id: "1",
  value: "hack to create collection in meteor",
});
IngredientCollection.remove({ _id: "1" });
MenusCollection.insert({
  _id: "1",
  value: "hack to create collection in meteor",
});
MenusCollection.remove({ _id: "1" });
RecommendedRecipes.insert({
  _id: "1",
  value: "hack to create collection in meteor",
});
RecommendedRecipes.remove({ _id: "1" });
UserPreferences.insert({
  _id: "1",
  value: "hack to create collection in meteor",
});
UserPreferences.remove({ _id: "1" });
HexadCollection.insert({
  _id: "1",
  value: "hack to create collection in meteor",
});
HexadCollection.remove({ _id: "1" });

const SEED_USERNAME = "demo";
const SEED_PASSWORD = "persfo";


Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId }, {
      fields: { createdAt: 1 }
    });
  } else {
    this.ready();
  }
});
Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }

  initData();
  // initFFQ();
});
