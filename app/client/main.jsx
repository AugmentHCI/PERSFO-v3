import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App';
import i18n from 'meteor/universe:i18n';
import { Tracker } from 'meteor/tracker';
import '/i18n/en.i18n.json';
import '/i18n/nl.i18n.json';

// const deviceLocale = getLang();

// i18n.setOptions({
//   defaultLocale: deviceLocale,
//   sameLocaleOnServerConnection: true
// });

Meteor.startup(() => {
  Tracker.autorun(() => {
    const user = Meteor.user();

    // if (user) {
    //   const locale = user.profile.lang || deviceLocale;
    i18n.setLocale('nl');
    // } else {
    //   i18n.setLocale(deviceLocale);
    // }
  });

  // wait for menus, recipes, AND userpreferences to load before initializing recommendations
  // recalculate new recommendation on every app startup
  // Meteor.call("recommender.updateRecommendations");

  render(<App />, document.getElementById('react-target'));
});

// function getLang() {
//   const defaultLang = 'nl';
//   const locales = ['nl', defaultLang];

//   let result =
//     (navigator.languages && navigator.languages[0]) ||
//     navigator.language ||
//     navigator.browserLanguage ||
//     navigator.userLanguage ||
//     defaultLang;

//   result = result.substring(0, 2)

//   if (!locales.includes(result)) {
//     result = defaultLang;
//   }

//   console.log(result);

//   return result;
// }