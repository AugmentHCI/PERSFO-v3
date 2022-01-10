import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import MuiAlert from "@material-ui/lab/Alert";
import { Meteor } from "meteor/meteor";
import React, { useState } from "react";

const useStyles = makeStyles(() => ({
  title: {
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "Roboto",
    margin: "4px",
    marginTop: "20px",
    color: "#726f6c",
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const componentName = "Feedback";
export const Feedback = () => {
  const classes = useStyles();

  const [feedback, setFeedback] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setOpen(true);
    Meteor.call("feedback.submitNewFeedback", feedback);
    Meteor.call("log", componentName, "submit", navigator.userAgent);
    setFeedback("");
  };

  const [toastShown, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <h1 className={classes.title}>
        {i18n.__("feedback.thanks")}
      </h1>

      <form className={classes.form} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          multiline
          rows={12}
          id="username"
          label="Feedback"
          name="username"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          autoFocus
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={submit}
          style={{ color: "white" }}
        >
          {i18n.__("feedback.submit")}
        </Button>
      </form>
      <Snackbar open={toastShown} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
        {i18n.__("feedback.thanks_submitted")}
        </Alert>
      </Snackbar>
    </Container>
  );
};
