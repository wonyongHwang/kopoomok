
// threebythree.js

const TBT_EMPTY = 0;
const TBT_BOARD_SIZE = 19;

/**
 * Checks if a line of 5 cells is an "open three".
 * An open three is a line of three stones with empty cells at both ends (e.g., 0PPP0).
 * @param {number[]} line - An array of 5 cell values.
 * @param {number} player - The player to check for.
 * @returns {boolean} - True if the line is an open three.
 */
function isLineOpenThree(line, player) {
    const p = player;
    const e = TBT_EMPTY;
    return line[0] === e && line[1] === p && line[2] === p && line[3] === p && line[4] === e;
}

/**
 * Checks if placing a stone at (r, c) creates a 3x3 violation.
 * A 3x3 violation occurs when a single move creates two or more open threes.
 *
 * @param {number[][]} board - The game board.
 * _@param {number} r - The row of the move.
 * _@param {number} c - The column of the move.
 * _@param {number} player - The player making the move.
 * _@returns {boolean} - True if the move creates a 3x3 violation.
*/
// function isThreeByThree(board, r, c, player) {
//     if (board[r][c] !== TBT_EMPTY) {
//         return false; // Cell is not empty
//     }

//     let openThreeCount = 0;
//     const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // Horizontal, Vertical, Diagonals

//     // Temporarily place the stone to check the resulting board state
//     board[r][c] = player;

//     for (const [dr, dc] of directions) {
//         // For each direction, check the 5-cell line centered on the new move
//         const line = [];
//         let isValidLine = true;
//         for (let i = -2; i <= 2; i++) {
//             const nr = r + i * dr;
//             const nc = c + i * dc;

//             if (nr >= 0 && nr < TBT_BOARD_SIZE && nc >= 0 && nc < TBT_BOARD_SIZE) {
//                 line.push(board[nr][nc]);
//             } else {
//                 isValidLine = false;
//                 break;
//             }
//         }

//         if (isValidLine && isLineOpenThree(line, player)) {
//             openThreeCount++;
//         }
//     }

//     // Revert the temporary move
//     board[r][c] = TBT_EMPTY;

//     return openThreeCount >= 2;
// }
const DIRS = [[0,1],[1,0],[1,1],[1,-1]];
const OPEN3 = [
  /\.XX\.X\./, /\.X\.XX\./, /\.\.XXX\./, /\.XXX\.\./
];

function isThreeByThree(board, r, c, player) {
  if (board[r][c] !== TBT_EMPTY) return false;
  board[r][c] = player;

  let cnt = 0;
  for (const [dr, dc] of DIRS) {
    // 9칸 라인(-4..+4)
    let s = '';
    for (let i = -4; i <= 4; i++) {
      const nr = r + i*dr, nc = c + i*dc;
      if (nr < 0 || nr >= TBT_BOARD_SIZE || nc < 0 || nc >= TBT_BOARD_SIZE) s += '#';
      else s += (board[nr][nc] === TBT_EMPTY) ? '.' :
               (board[nr][nc] === player ? 'X' : 'O');
    }
    // 중앙 앵커(새로 둔 수가 포함된 열린3)만 인정
    if (s[4] === 'X' && OPEN3.some(re => re.test(s))) cnt++;
  }
  board[r][c] = TBT_EMPTY;
  return cnt >= 2;
}
