import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    socket = io(ENDPOINT);
    setPlayer(selfTurn ? PLAYERS[0] : PLAYERS[1]);
    setOpponent(selfTurn ? PLAYERS[1] : PLAYERS[0]);

    socket.on("opponentMove", ({ user, board }) => {
      setBoard(board);
      if (user !== socket.id) {
        setSelfTurn(true);
      }
    });

    socket.on("clearBoard", () => {
      setBoard(Array(9).fill(""));
      setWinner(null);
      setSelfTurn(localStorage.getItem("hosted") === "true");
    });

    socket.on("playerLeft", () => {
      alert("Opponent Has left!");
      socket.emit("disconnect");
      socket.off();
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
    if (player) {
      if (localStorage.getItem("hosted") === "true") {
        socket.emit("create", { roomName }, ({ error }) => {
          if (error) {
            alert(error);
            localStorage.setItem("roomName", "");
            history.goBack();
          }
        });
      } else {
        socket.emit("join", { roomName }, ({ error, board, current }) => {
          if (error) {
            alert(error);
            localStorage.setItem("roomName", "");
            history.goBack();
          } else if (board && current) {
            setBoard(board);
            if (player === current) {
              console.log("here");
              setSelfTurn(true);
            }
          }
        });
      }
    }
  }, [player]);

  useEffect(() => {
    checkWinner();
  }, [board]);

  const onClick = (pos) => {
    let tempboard = board;
    if (tempboard[pos] === "") {
      tempboard[pos] = player;
      setBoard(tempboard);
      setSelfTurn(!selfTurn);
      socket.emit("selfMove", { roomName, board });
    }
  };

  const checkWinner = () => {
    let winner = checkWin(board);
    if (winner) {
      setWinner(winner);
    }
  };

  const clearBoard = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setSelfTurn(localStorage.getItem("hosted") === "true");
    socket.emit("clearBoard", { roomName });
  };

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
