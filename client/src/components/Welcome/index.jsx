import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  const [name, setName] = useState("");
  const btnStyle = {
    display: "inline-block",
    marginTop: "5px",
    marginBottom: "5px",
  };

  localStorage.setItem("roomName", name);

  const btnClick = (e, selfCreated) => {
    if (name !== "") {
      localStorage.setItem("hosted", selfCreated);
      localStorage.setItem("roomName", name);
    } else {
      e.preventDefault();
    }
  };

  return (
    <div className="container-join">
      <input
        type="text"
        placeholder="Name"
        className="input-text"
        onChange={(e) => setName(e.target.value)}
      />

      <Link to="/game" style={btnStyle}>
        <button className="btn" onClick={(e) => btnClick(e, true)}>
          Create
        </button>
      </Link>

      <Link to="/game" style={btnStyle}>
        <button className="btn" onClick={(e) => btnClick(e, false)}>
          Join
        </button>
      </Link>
    </div>
  );
};

export default Welcome;
