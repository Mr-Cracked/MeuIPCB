import React from "react";
import { login } from "../api";

function LoginButton() {
    return <button onClick={login}>Login com Microsoft</button>;
}

export default LoginButton;
