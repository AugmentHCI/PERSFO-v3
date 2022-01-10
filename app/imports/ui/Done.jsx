import { Button, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";


const useStyles = makeStyles(() => ({
    header: {
        margin: "20px",
    },
    complete: {
        display: "flex",
        justifyContent: "center"
    }
}));

const componentName = "Done";
export const Done = () => {

    const classes = useStyles();

    const undo = () => {
        Meteor.call("orders.undoConfirmation");
        Meteor.call("log", componentName, "undo", navigator.userAgent);
    }

    return (
        <Container>
            <Typography className={classes.header} variant="body1">
                {i18n.__("done.thanks")}
            </Typography>
            <div className={classes.complete}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={undo}
                    style={{ color: "white" }} >
                    {i18n.__("done.undo")}
                </Button>
            </div>
        </Container>
    );
}