// ai.js

const BOARD_SIZE = 19;
const EMPTY = 0;
const PLAYER_BLACK = 1;
const PLAYER_WHITE = 2;

function getPossibleMoves(currentBoard, player) {
    const moves = [];
    const emptyCells = new Set(); // Use a Set to avoid duplicate moves

    // If the board is empty, return the center move
    let hasStones = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] !== EMPTY) {
                hasStones = true;
                break;
            }
        }
        if(hasStones) break;
    }
    if (!hasStones) {
        return [{ r: Math.floor(BOARD_SIZE / 2), c: Math.floor(BOARD_SIZE / 2) }];
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] !== EMPTY) {
                // This cell has a stone, check its neighbors
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;

                        const nr = r + dr;
                        const nc = c + dc;

                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] === EMPTY) {
                            emptyCells.add(`${nr},${nc}`);
                        }
                    }
                }
            }
        }
    }

    for (const cell of emptyCells) {
        const [r, c] = cell.split(',').map(Number);
        if (!isThreeByThree(currentBoard, r, c, player)) {
            moves.push({ r, c });
        }
    }

    return moves;
}

function evaluateBoard(currentBoard) {
    let score = 0;

    const scores = {
        '5': 100000,
        '4_open': 10000,
        '4_blocked': 1000,
        '3_open': 1000,
        '3_blocked': 100,
        '2_open': 100,
        '2_blocked': 10,
    };

    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    function getLineScore(line, player) {
        const opponent = (player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
        const p = player.toString();
        const o = opponent.toString();
        const e = EMPTY.toString();
        const lineStr = line.map(String).join('');
        let patternScore = 0;

        if (lineStr.includes(p.repeat(5))) {
            return scores['5'];
        }
        if (lineStr.includes(`${e}${p}${p}${p}${p}${e}`)) {
            patternScore += scores['4_open'];
        }
        if (lineStr.includes(`${o}${p}${p}${p}${p}${e}`) || lineStr.includes(`${e}${p}${p}${p}${p}${o}`)) {
            patternScore += scores['4_blocked'];
        }
        if (lineStr.includes(`${e}${p}${p}${p}${e}`)) {
            patternScore += scores['3_open'];
        }
        if (lineStr.includes(`${o}${p}${p}${p}${e}`) || lineStr.includes(`${e}${p}${p}${p}${o}`)) {
            patternScore += scores['3_blocked'];
        }
        if (lineStr.includes(`${e}${p}${p}${e}`)) {
            patternScore += scores['2_open'];
        }
        if (lineStr.includes(`${o}${p}${p}${e}`) || lineStr.includes(`${e}${p}${p}${o}`)) {
            patternScore += scores['2_blocked'];
        }
        return patternScore;
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            for (const [dr, dc] of directions) {
                if (r + dr * 5 < BOARD_SIZE && r + dr * 5 >= 0 && c + dc * 5 < BOARD_SIZE && c + dc * 5 >= 0) {
                    const line = [];
                    for (let i = 0; i < 6; i++) {
                        line.push(currentBoard[r + i * dr][c + i * dc]);
                    }
                    score += getLineScore(line, PLAYER_BLACK);
                    score -= getLineScore(line, PLAYER_WHITE) * 1.1;
                }
            }
        }
    }
    return score;
}

function minimax(currentBoard, depth, alpha, beta, maximizingPlayer, parentMove = null) {
    const node = {
        isMaximizing: maximizingPlayer,
        alpha: alpha,
        beta: beta,
        children: [],
        pruned: false,
        parentMove: parentMove
    };

    if (depth === 0) {
        node.score = evaluateBoard(currentBoard);
        return { score: node.score, node: node };
    }

    const possibleMoves = getPossibleMoves(currentBoard, maximizingPlayer ? PLAYER_BLACK : PLAYER_WHITE);
    if (possibleMoves.length === 0) {
        node.score = evaluateBoard(currentBoard);
        return { score: node.score, node: node };
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of possibleMoves) {
            currentBoard[move.r][move.c] = PLAYER_BLACK;
            const result = minimax(currentBoard, depth - 1, alpha, beta, false, move);
            currentBoard[move.r][move.c] = EMPTY;

            result.node.move = move;
            node.children.push(result.node);

            maxEval = Math.max(maxEval, result.score);
            alpha = Math.max(alpha, result.score);
            if (beta <= alpha) {
                result.node.pruned = true;
                node.pruned = true; // Mark parent that a prune occurred within its children
                break;
            }
        }
        node.score = maxEval;
        return { score: maxEval, node: node };
    } else {
        let minEval = Infinity;
        for (const move of possibleMoves) {
            currentBoard[move.r][move.c] = PLAYER_WHITE;
            const result = minimax(currentBoard, depth - 1, alpha, beta, true, move);
            currentBoard[move.r][move.c] = EMPTY;

            result.node.move = move;
            node.children.push(result.node);

            minEval = Math.min(minEval, result.score);
            beta = Math.min(beta, result.score);
            if (beta <= alpha) {
                result.node.pruned = true;
                node.pruned = true;
                break;
            }
        }
        node.score = minEval;
        return { score: minEval, node: node };
    }
}

async function getAIMove(currentBoard, depth = 2) {
    const progressElement = document.getElementById('ai-progress');
    if (progressElement) {
        progressElement.style.display = 'block';
        progressElement.textContent = 'AI is thinking... 0%';
    }

    let bestMove = null;
    let bestValue = -Infinity;
    let bestTree = null;
    const currentBoardCopy = JSON.parse(JSON.stringify(currentBoard));

    const possibleMoves = getPossibleMoves(currentBoardCopy, PLAYER_BLACK);
    if (possibleMoves.length === 0) return null;

    if (possibleMoves.length === 1 && possibleMoves[0].r === Math.floor(BOARD_SIZE/2)){
        if (progressElement) progressElement.style.display = 'none';
        // For the first move, the tree is trivial
        const tree = { move: possibleMoves[0], score: 0, children: [] };
        return { move: possibleMoves[0], tree: tree };
    }

    const allMoveScores = [];
    let movesProcessed = 0;
    for (const move of possibleMoves) {
        currentBoardCopy[move.r][move.c] = PLAYER_BLACK;
        const result = minimax(currentBoardCopy, depth, -Infinity, Infinity, false);
        currentBoardCopy[move.r][move.c] = EMPTY;

        result.node.move = move; // Attach move to the root of the subtree
        allMoveScores.push({ move: move, score: result.score, tree: result.node });

        if (result.score > bestValue) {
            bestValue = result.score;
            bestMove = move;
            bestTree = result.node;
        }

        movesProcessed++;
        const progress = Math.round((movesProcessed / possibleMoves.length) * 100);
        if (progressElement) {
            progressElement.textContent = `AI is thinking... ${progress}%`;
        }

        await new Promise(resolve => setTimeout(resolve, 0));
    }

    const scoresGrid = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(undefined));
    for (const { move, score } of allMoveScores) {
        scoresGrid[move.r][move.c] = score;
    }
    displayAIEvaluation(scoresGrid);

    if (progressElement) {
        progressElement.style.display = 'none';
    }

    return { move: bestMove, tree: bestTree };
}

function checkWin(row, col, player, currentBoard) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dr, dc] of directions) {
        let count = 1;
        // Count stones in the positive direction
        for (let i = 1; i < 6; i++) { // Check up to 5 stones away
            const r = row + i * dr;
            const c = col + i * dc;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
                count++;
            } else {
                break;
            }
        }
        // Count stones in the negative direction
        for (let i = 1; i < 6; i++) { // Check up to 5 stones away
            const r = row - i * dr;
            const c = col - i * dc;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
                count++;
            } else {
                break;
            }
        }

        // Check if the total count is exactly 5
        if (count === 5) {
            return true;
        }
    }
    return false;
}

function displayAIEvaluation(scores) {
    const aiEvaluationDisplay = document.getElementById("ai-evaluation-display");
    if (!aiEvaluationDisplay) return;

    aiEvaluationDisplay.innerHTML = "";
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const evalCell = document.createElement("div");
            evalCell.classList.add("eval-cell");
            if (scores[r][c] !== undefined) {
                evalCell.textContent = scores[r][c].toFixed(0);
            }
            aiEvaluationDisplay.appendChild(evalCell);
        }
    }
}