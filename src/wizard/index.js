import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { pages, wizardMachine } from "./machine";
import { useMachine } from "@xstate/react";

const browserHistory = createBrowserHistory();

const Wizard = ({ history }) => {
  const [current, send] = useMachine(wizardMachine(browserHistory), {
    devTools: true
  });

  useEffect(() => {
    const handlePopState = e => {
      if (current.context.index === -1) {
        history.goBack();
      }
    };

    window.addEventListener("popstate", handlePopState);

    const unlisten = browserHistory.listen((location, action) => {
      console.log(location.pathname.split("/"));
      if (
        action === "POP" &&
        location.pathname.split("/")[2] ===
          current.context.stack[current.context.index - 1]
      ) {
        console.log(
          "back: ",
          JSON.stringify({
            path: location.pathname.split("/")[2],
            stack: current.context.stack,
            index: current.context.index
          })
        );
        send("BACK", { historyBack: true });
      } else if (
        action === "POP" &&
        location.pathname.split("/")[2] ===
          current.context.stack[current.context.index + 1]
      ) {
        console.log(
          "next",
          JSON.stringify({
            path: location.pathname.split("/")[2],
            stack: current.context.stack,
            index: current.context.index
          })
        );
        send("NEXT", { page: location.pathname.split("/")[2] });
      } else {
        console.log(
          "else",
          JSON.stringify({
            path: location.pathname.split("/")[2],
            stack: current.context.stack,
            index: current.context.index
          })
        );
      }
    });
    return () => {
      unlisten();
      window.removeEventListener("popstate", handlePopState);
    };
  }, [current.context.index, current.context.stack, send, history]);

  if (current.context.index === -1) {
    return null;
  }

  const { Component, id } = pages[current.context.stack[current.context.index]];

  return (
    <>
      <Component />
      {pages[`page${id + 1}`] ? (
        <button onClick={() => send("NEXT", { page: `page${id + 1}` })}>
          NEXT
        </button>
      ) : null}
      <button onClick={() => send("BACK")}>BACK</button>
      <Redirect from="/wizard" to="/wizard/page1" />
    </>
  );
};
export default Wizard;
