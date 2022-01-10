import { Divider } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import AssessmentIcon from "@material-ui/icons/Assessment";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FeedbackIcon from '@material-ui/icons/Feedback';
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";
import {
  OpenFeedback, OpenMealDetails,
  OpenProgress,
  OpenSettings
} from "/imports/api/methods.js";

const useStyles = makeStyles(() => ({
  list: {
    width: 250,
  },
  drawerImage: {
    width: 250,
    height: 107,
  },
}));

const componentName = "PersfoDrawer";
export const PersfoDrawer = ({ drawerOpen, toggleDrawer }) => {
  const classes = useStyles();

  const handleHomeButton = () => {
    OpenMealDetails.set(null);
    OpenProgress.set(false);
    OpenSettings.set(false);
    OpenFeedback.set(false);
    Meteor.call("log", componentName, "handleHomeButton", navigator.userAgent);
  };

  const handleProgress = () => {
    OpenMealDetails.set(null);
    OpenProgress.set(true);
    OpenSettings.set(false);
    OpenFeedback.set(false);
    Meteor.call("log", componentName, "handleProgress", navigator.userAgent);
  };

  const handleSettings = () => {
    OpenMealDetails.set(null);
    OpenProgress.set(false);
    OpenSettings.set(true);
    OpenFeedback.set(false);
    Meteor.call("log", componentName, "handleSettings", navigator.userAgent);
  };

  const handleFeedback = () => {
    OpenMealDetails.set(null);
    OpenProgress.set(false);
    OpenSettings.set(false);
    OpenFeedback.set(true);
    Meteor.call("log", componentName, "handleFeedback", navigator.userAgent);
  };

  const logOut = () => {
    Meteor.call("log", componentName, "logOut", navigator.userAgent);
    Meteor.logout();
  }

  return (
    <SwipeableDrawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
    >
      <Box>
        <img className={classes.drawerImage} src="/images/logo.png" />
      </Box>
      <Divider />
      <div
        className={classes.list}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <List>
          <ListItem button key={"home"} onClick={() => handleHomeButton()}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.__("general.home")} />
          </ListItem>
          <ListItem button key={"progress"} onClick={() => handleProgress()}>
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.__("AppBarPersfo.progress")}/>
          </ListItem>
          <ListItem button key={"settings"} onClick={() => handleSettings()}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.__("AppBarPersfo.settings")} />
          </ListItem>
          <ListItem button key={"Feedback"} onClick={() => handleFeedback()}>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.__("AppBarPersfo.feedback")} />
          </ListItem>
          <Divider />
          <ListItem button key={"Logout"} onClick={() => logOut()}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.__("AppBarPersfo.logout")}/>
          </ListItem>
        </List>
      </div>
    </SwipeableDrawer>
  );
};
