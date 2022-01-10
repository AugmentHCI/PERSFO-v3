import React, { useState } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

const componentName = "AuthenticationScreen";
export const AuthenticationScreen = () => {

  const [existingUser, setExistingUser] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);

  const renderScreen = () => {
    if (forgotPassword) {
      return <ForgotPasswordForm setForgotPassword={setForgotPassword} />;
    } else {
      if (existingUser) {
        return (
          <LoginForm
            setExistingUser={setExistingUser}
            setForgotPassword={setForgotPassword}
          />
        );
      } else {
        return (
          <RegisterForm
            setExistingUser={setExistingUser}
            setForgotPassword={setForgotPassword}
          />
        );
      }
    }
  };

  return (
    <div className="main">{renderScreen()}</div>
  );
};
