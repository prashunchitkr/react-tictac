import React, { useState, useEffect, useCallback } from "react";
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
      setSelfTurn(!selfTurn);
      socket.emit("selfMove", { board, room });
    }
  };

  const clearBoard = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setSelfTurn(localStorage.getItem("hosted") === "true");
    socket.emit("clearBoard", { room });
  };

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("join", { room }, () => {});

    setPlayer(selfTurn ? PLAYERS[0] : PLAYERS[1]);
    setOpponent(selfTurn ? PLAYERS[1] : PLAYERS[0]);

    socket.on("clearBoard", () => {
      setBoard(Array(9).fill(""));
      setWinner(null);
      setSelfTurn(localStorage.getItem("hosted") === "true");
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
        Clear Board
      </button>
    </>
  );
};

export default Board;
