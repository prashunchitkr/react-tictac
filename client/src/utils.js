function checkWin(board) {
  const conditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < conditions.length; i++) {
    let condition = conditions[i];
    if (
      board[condition[0]] === board[condition[1]] &&
      board[condition[0]] === board[condition[2]] &&
      board[condition[0]] !== ""
    ) {
      return board[condition[0]];
    }
  }
  return false;
}

export { checkWin };
