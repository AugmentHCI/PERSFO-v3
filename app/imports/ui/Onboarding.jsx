import { Box, StepButton } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import Stepper from '@material-ui/core/Stepper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState } from "react";

const useStyles = makeStyles((persfoTheme) => ({
    main: {
        maxWidth: 800, 
        margin:"auto", 
    },
    title: {
        fontSize: "13px",
        fontWeight: 600,
        fontFamily: "Roboto",
        margin: "4px",
        marginTop: "20px",
        color: "#726f6c",
    },
    drawerImage: {
        width: 250,
        height: 107,
    },
}));

const componentName = "Onboarding";
export const Onboarding = () => {
    const classes = useStyles();

    const steps = [
        {
            label: i18n.__("icf.step1_label"),
            description: i18n.__("icf.step1_description"),
        },
        {
            label: i18n.__("icf.step2_label"),
            description: i18n.__("icf.step2_description"),
        },
        {
            label: i18n.__("icf.step3_label"),
            description: i18n.__("icf.step3_description"),
        },
        {
            label: i18n.__("icf.step4_label"),
            description: i18n.__("icf.step4_description"),
        },
        {
            label: i18n.__("icf.step5_label"),
            description: i18n.__("icf.step5_description"),
        },
        {
            label: i18n.__("icf.step6_label"),
            description: i18n.__("icf.step6_description"),
        },
        {
            label: i18n.__("icf.step7_label"),
            description: i18n.__("icf.step7_description"),
        },
        {
            label: i18n.__("icf.step8_label"),
            description: i18n.__("icf.step8_description"),
        },
        {
            label: i18n.__("icf.step9_label"),
            description: i18n.__("icf.step9_description"),
        },
        {
            label: i18n.__("icf.step10_label"),
            description: i18n.__("icf.step10_description"),
        }
    ];

    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.keys(completed).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();
    };

    const handleNext = () => {
        const newActiveStep =
            isLastStep() && !allStepsCompleted()
                ? // It's the last step, but not all steps have been completed,
                // find the first step that has been completed
                steps.findIndex((step, i) => !(i in completed))
                : activeStep + 1;
        setActiveStep(newActiveStep);
        Meteor.call("log", componentName, "handleNext", navigator.userAgent, newActiveStep);

    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        Meteor.call("log", componentName, "handleBack", navigator.userAgent, activeStep);

    };

    const handleStep = (step) => () => {
        setActiveStep(step);
        Meteor.call("log", componentName, "handleStep", navigator.userAgent, activeStep);

    };

    const handleComplete = () => {
        if (activeStep == steps.length - 1) {
            Meteor.call("users.finishedICF");
        }
        const newCompleted = completed;
        newCompleted[activeStep] = true;
        setCompleted(newCompleted);
        handleNext();
        Meteor.call("log", componentName, "handleComplete", navigator.userAgent);
    };

    return (
        <Box className={classes.main}>
            <Stepper nonLinear activeStep={activeStep} orientation="vertical" style={{ backgroundColor: "transparent" }}>
                {steps.map((step, index) => (
                    <Step key={step.label} completed={completed[index]}>
                        <StepButton color="inherit" onClick={handleStep(index)}>
                            {step.label}
                        </StepButton>
                        <StepContent>
                            <Typography>{step.description}</Typography>
                            <Box sx={{ mb: 2 }}>
                                <div>
                                    <Button
                                        variant="contained"
                                        onClick={handleComplete}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        {index === steps.length - 1 ? i18n.__("general.i_agree") : i18n.__("general.continue")}
                                    </Button>
                                    <Button
                                        disabled={index === 0}
                                        onClick={handleBack}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        {i18n.__("general.back")}
                                    </Button>
                                </div>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};
