// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./App";

// ReactDOM.render(React.createElement(App), document.getElementById("root"));

import App from "./App.svelte";

const app = new App({
  target: document.querySelector("#root"),
});

export default app;
