import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import React from "react";


export const ExplanationSnackbar = ({ toastShown, setToast, text }) => {

    // Info message
    function Alert(props) {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    return (
        <Snackbar
            open={toastShown}
            autoHideDuration={8000}
            onClose={() => setToast(false)}
        >
            <Alert onClose={() => setToast(false)} severity="info">
                {text}
            </Alert>
        </Snackbar>
    )
}