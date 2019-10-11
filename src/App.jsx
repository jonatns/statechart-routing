import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Wizard from "./wizard";
import "./App.css";

const Home = ({ history }) => (
  <>
    <h1>Home</h1>
    <button onClick={() => history.push("/wizard")}>Wizard</button>
  </>
);

const App = () => (
  <div className="App">
    <Router>
      <Route exact path="/" component={Home} />
      <Route path="/wizard" component={Wizard} />
    </Router>
  </div>
);

export default App;
