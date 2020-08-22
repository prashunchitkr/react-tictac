import React, { useState, useEffect, useCallback } from "react";
import Button from "../Button";
import { checkWin } from "../../utils";
import io from "socket.io-client";
import "./Board.css";

let socket;

const Board = () => {
  const PLAYERS = ["X", "O"];
  const [board, setBoard] = useState(Array(9).fill(""));
  const [p1Turn, setP1Turn] = useState(
    localStorage.getItem("hosted") === "true"
  );
  const [winner, setWinner] = useState(null);
  const [player, setPlayer] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const room = localStorage.getItem("roomName");
  const ENDPOINT = "localhost:5000";

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
      setP1Turn(!p1Turn);
      socket.emit("selfMove", { board, room });
    }
    checkWinner();
  };

  const clearBoard = () => {
    setBoard(Array(9).fill(""));
    setP1Turn(true);
    setWinner(null);
    setP1Turn(localStorage.getItem("hosted") === "true");
    socket.emit("clearBoard", { room });
  };

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("join", { room }, () => {});

    setPlayer(p1Turn ? PLAYERS[0] : PLAYERS[1]);
    setOpponent(p1Turn ? PLAYERS[1] : PLAYERS[0]);

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.on("opponentMove", ({ user, board }) => {
      setBoard(board);
      if (user !== socket.id) setP1Turn(!p1Turn);
    });
    checkWinner();
  }, [checkWinner]);

  useEffect(() => {
    socket.on("clearBoard", () => {
      setBoard(Array(9).fill(""));
      setWinner(null);
      setP1Turn(localStorage.getItem("hosted") === "true");
    });
  }, []);

  return (
    <>
      <div className="player-indicator">
        {p1Turn ? `${player}'s Turn` : `${opponent}'s Turn`}
      </div>
      <div className="play-area">
        {board.map((val, i) => (
          <Button
            key={i}
            value={val}
            id={i}
            onClick={winner || !p1Turn ? null : onClick}
          />
        ))}
      </div>
      {winner ? <div className="winner">{winner} Wins!</div> : ""}
      <button className="clear" onClick={() => clearBoard()}>
        Clear Board
      </button>
    </>
  );
};

export default Board;
