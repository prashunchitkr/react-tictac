import React from "react";
import "./Button.css";

const Button = ({ value, id, onClick }) => {
  return (
    <div
      className={value === "" ? "box" : "box occupied"}
      id={`box-${id}`}
      onClick={() => onClick ?  onClick(id) : null}
    >
      {value}
    </div>
  );
};

export default Button;
