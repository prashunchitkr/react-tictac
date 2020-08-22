import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Board from "./components/Board";
import Welcome from "./components/Welcome";
import "./App.css";

function App() {
  return (
    <div className="container">
      <h1>TicTacToe</h1>
      <Router>
        <Route path="/" exact component={Welcome} />
        <Route path="/game" exact component={Board} />
      </Router>
    </div>
  );
}

export default App;
