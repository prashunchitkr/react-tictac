import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Button from "../Button";
import { checkWin } from "../../utils";
import io from "socket.io-client";
import "./Board.css";

let socket;

const Board = () => {
  const PLAYERS = ["X", "O"];
  const [board, setBoard] = useState(Array(9).fill(""));
  const [selfTurn, setSelfTurn] = useState(
    localStorage.getItem("hosted") === "true"
  );
  const [winner, setWinner] = useState("");
  const [player, setPlayer] = useState("");
  const [opponent, setOpponent] = useState("");
  const roomName = localStorage.getItem("roomName");
  const ENDPOINT = "localhost:5000";
  const history = useHistory();

  const checkWinner = useCallback(() => {
    let winner = checkWin(board);
    if (winner) {
      setWinner(winner);
    }
  }, [board]);

  const onClick = (pos) => {
    let tempboard = board;
    if (tempboard[pos] === "") {
      tempboard[pos] = player;
      setBoard(tempboard);
      setSelfTurn(!selfTurn);
      socket.emit("selfMove", { board, roomName });
    }
  };

  const clearBoard = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setSelfTurn(localStorage.getItem("hosted") === "true");
    socket.emit("clearBoard", { roomName });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    setPlayer(selfTurn ? PLAYERS[0] : PLAYERS[1]);
    setOpponent(selfTurn ? PLAYERS[1] : PLAYERS[0]);

    if (localStorage.getItem("hosted") === "true") {
      console.log("creating room...");
      socket.emit("create", { roomName }, ({ error }) => {
        alert(error);
        localStorage.setItem("roomName", "");
        history.push("/");
      });
    } else {
      console.log("joining room...");
      socket.emit("join", { roomName }, ({ error }) => {
        alert(error);
        localStorage.setItem("roomName", "");
        history.goBack();
      });
    }

    socket.on("clearBoard", () => {
      setBoard(Array(9).fill(""));
      setWinner(null);
      setSelfTurn(localStorage.getItem("hosted") === "true");
    });

    socket.on("playerLeft", () => {
      console.log("playerleft");
      alert("Opponent Has left!");
      history.goBack();
    });

    socket.on("playerJoin", () => {
      alert("Opponent Has Joined");
    });

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.on("opponentMove", ({ user, board }) => {
      setBoard(board);
      if (user !== socket.id) {
        setSelfTurn(true); //why dont setSelfTurn(!selfTurn) work? Why's value of selfTurn still true although react extension shwos its false?
      }
    });
  }, []);

  useEffect(() => {
    checkWinner();
  }, [board]);

  return (
    <>
      <div className="player-indicator">
        {selfTurn ? `${player}'s Turn` : `${opponent}'s Turn`}
      </div>
      <div className="play-area">
        {board.map((val, i) => (
          <Button
            key={i}
            value={val}
            id={i}
            onClick={winner || !selfTurn ? null : onClick}
          />
        ))}
      </div>
      {winner ? <div className="winner">{winner} Wins!</div> : ""}
      <button className="clear" onClick={() => clearBoard()}>
        Reset
      </button>
    </>
  );
};

export default Board;
