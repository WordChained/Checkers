
'use strict';
let gPickedPos = null;
let whitePiecesCount = 12
let blackPiecesCount = 12
let gPossibleMoves = []
let isRecursiveEating = false
let isCurrentlyEating = false

//rules to end game:
let gOnlyKingsMoveCounter = 0

const playTurn = (destinationRow, destinationCol) => {
    console.log(gPickedPos.row + "|" + gPickedPos.col, "==>", destinationRow + "|" + destinationCol);
    if (gBoard[gPickedPos.row][gPickedPos.col].rank === "king") {//if king
        if (isEnemyPieceInRoute(destinationRow - gPickedPos.row, destinationCol - gPickedPos.col)) {
            kingEat(destinationRow, destinationCol, gPickedPos.row, gPickedPos.col)
            eatingSound.play()
            gOnlyKingsMoveCounter = 0;
        }
        else {
            gOnlyKingsMoveCounter++;
            updateScore()
            if (gOnlyKingsMoveCounter === 15) {
                endTurn()
                return
            }
            move(destinationRow, destinationCol, gPickedPos.row, gPickedPos.col)
        }
    }
    else {//if soldier
        if (Math.abs(gPickedPos.row - destinationRow) === 2 || Math.abs(gPickedPos.col - destinationCol) === 2) {
            eat(destinationRow, destinationCol, gPickedPos.row, gPickedPos.col)
            eatingSound.play()
            gOnlyKingsMoveCounter = 0;
        } else {
            move(destinationRow, destinationCol, gPickedPos.row, gPickedPos.col)
            gOnlyKingsMoveCounter = 0;
        }
    }
}
const isEnemyPieceInRoute = (rowDiff, colDiff) => {
    const row = gPickedPos.row
    const col = gPickedPos.col
    if (rowDiff > 0) {
        if (colDiff > 0) {
            //down right
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row + i][col + i].isOccupied && gBoard[row + i][col + i].isMarked) return true
            }
        } else {
            //down left
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row + i][col - i].isOccupied && gBoard[row + i][col - i].isMarked) return true
            }
        }
    } else {
        if (colDiff > 0) {
            //up right
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row - i][col + i].isOccupied && gBoard[row - i][col + i].isMarked) return true
            }
        } else {
            //up left
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row - i][col - i].isOccupied && gBoard[row - i][col - i].isMarked) return true
            }
        }
    }
    return false
}
const endTurn = () => {
    gTurnCount++
    cancelPick()
    gPossibleMoves = []
    //to pass the turn...
    gPickedPos = null
    isWhitesTurn = !isWhitesTurn
    isRecursiveEating = false
    isCurrentlyEating = false
    isGameOver()
    markTurn()
    isLegalMoveLeft()
    countPiecesAndRank()
}
const move = (destinationRow, destinationCol, row, col) => {
    if (isCurrentlyEating) return
    isAbleToEat()
    gBoard[destinationRow][destinationCol] = gBoard[row][col]
    gBoard[destinationRow][destinationCol].location = { row: destinationRow, col: destinationCol }
    gBoard[row][col] = { location: { row, col }, isOccupied: false }
    movingSound.play()
    if (
        gBoard[destinationRow][destinationCol].rank === "soldier" && (
            (gBoard[destinationRow][destinationCol].isWhitePiece && gBoard[destinationRow][destinationCol].location.row === 7)
            ||
            (!gBoard[destinationRow][destinationCol].isWhitePiece && gBoard[destinationRow][destinationCol].location.row === 0)
        )
    ) {
        crownSoldier(gBoard[destinationRow][destinationCol])
        setTimeout(() => {
            promotionSound.play()
        }, 200)
    }
    renderBoard(gBoard)
    cancelPick()
    endTurn()
}
const eat = (destinationRow, destinationCol, row, col) => {
    //find out direction:
    const rowDiff = row - destinationRow//if diff < 0 we are going down
    const colDiff = col - destinationCol// if diff <0 we are going left
    gBoard[destinationRow][destinationCol] = gBoard[row][col]
    gBoard[destinationRow][destinationCol].location = { row: destinationRow, col: destinationCol }

    if (rowDiff < 0) {//turn the enemy piece to an empty cell
        if (colDiff < 0) {
            //down right
            gBoard[row + 1][col + 1].isWhitePiece ? whitePiecesCount-- : blackPiecesCount--;
            gBoard[row + 1][col + 1] = { location: { row: row + 1, col: col + 1 }, isOccupied: false }
        } else {
            //down left
            gBoard[row + 1][col - 1].isWhitePiece ? whitePiecesCount-- : blackPiecesCount--;
            gBoard[row + 1][col - 1] = { location: { row: row + 1, col: col - 1 }, isOccupied: false }
        }
    } else {
        if (colDiff < 0) {
            //up right
            gBoard[row - 1][col + 1].isWhitePiece ? whitePiecesCount-- : blackPiecesCount--;
            gBoard[row - 1][col + 1] = { location: { row: row - 1, col: col + 1 }, isOccupied: false }
        } else {
            //up left
            gBoard[row - 1][col - 1].isWhitePiece ? whitePiecesCount-- : blackPiecesCount--;
            gBoard[row - 1][col - 1] = { location: { row: row - 1, col: col - 1 }, isOccupied: false }
        }
    }

    gBoard[row][col] = { location: { row, col }, isOccupied: false }//turn the former location to an empty cell
    renderBoard(gBoard)
    // console.log("number of black pieces:", blackPiecesCount, "|", "number of white pieces:", whitePiecesCount);
    // console.log(destinationRow + 1);
    // console.log(destinationCol - 1);
    if (//checking if can continue eating by checking if theres a possible targeted enemy piece around
        (destinationRow + 1 < 8 && destinationCol + 1 < 8 && gBoard[destinationRow + 1][destinationCol + 1].isMarked && gBoard[destinationRow + 1][destinationCol + 1].isOccupied)
        ||
        (destinationRow + 1 < 8 && destinationCol - 1 >= 0 && gBoard[destinationRow + 1][destinationCol - 1].isMarked && gBoard[destinationRow + 1][destinationCol - 1].isOccupied)
        ||
        (destinationRow - 1 >= 0 && destinationCol + 1 < 8 && gBoard[destinationRow - 1][destinationCol + 1].isMarked && gBoard[destinationRow - 1][destinationCol + 1].isOccupied)
        ||
        (destinationRow - 1 >= 0 && destinationCol - 1 >= 0 && gBoard[destinationRow - 1][destinationCol - 1].isMarked && gBoard[destinationRow - 1][destinationCol - 1].isOccupied)
    ) {
        gBoard[destinationRow][destinationCol].isMarked = false
        // console.log("keep eating")
        gPickedPos = { row: destinationRow, col: destinationCol }
        isRecursiveEating = true
        unMarkAll()
        checkAndMarkPossibleMoves(destinationRow, destinationCol, gBoard[destinationRow][destinationCol].isWhitePiece, "soldier", true)
        isCurrentlyEating = true
        renderBoard(gBoard)
    }
    else {
        console.log("end turn!");
        cancelPick()
        endTurn()
        gBoard[destinationRow][destinationCol].isSelected = false
        if ((gBoard[destinationRow][destinationCol].isWhitePiece && gBoard[destinationRow][destinationCol].location.row === 7)
            ||
            (!gBoard[destinationRow][destinationCol].isWhitePiece && gBoard[destinationRow][destinationCol].location.row === 0)) {
            crownSoldier(gBoard[destinationRow][destinationCol])
            setTimeout(() => {
                promotionSound.play()
            }, 200)
        }
        unMarkAll()
        renderBoard(gBoard)
    }
}
const kingEat = (destinationRow, destinationCol, row, col) => {

    //loop by the difference between destination and gPickedPos and unmark all the cells
    const rowDiff = row - destinationRow
    const colDiff = col - destinationCol
    if (rowDiff < 0) {//turn the enemy piece to an empty cell
        if (colDiff < 0) {
            //down right
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row + i][col + i].isOccupied && gBoard[row + i][col + i].isMarked) isWhitesTurn ? blackPiecesCount-- : whitePiecesCount--
                gBoard[row + i][col + i] = { location: { row: row + i, col: col + i }, isOccupied: false }

            }
        } else {
            //down left
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row + i][col - i].isOccupied && gBoard[row + i][col - i].isMarked) isWhitesTurn ? blackPiecesCount-- : whitePiecesCount--
                gBoard[row + i][col - i] = { location: { row: row + i, col: col - i }, isOccupied: false }
            }
        }
    } else {
        if (colDiff < 0) {
            //up right
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row - i][col + i].isOccupied && gBoard[row - i][col + i].isMarked) isWhitesTurn ? blackPiecesCount-- : whitePiecesCount--
                gBoard[row - i][col + i] = { location: { row: row - i, col: col + i }, isOccupied: false }
            }
        } else {
            //up left
            for (let i = 1; i < Math.abs(rowDiff); i++) {
                if (gBoard[row - i][col - i].isOccupied && gBoard[row - i][col - i].isMarked) isWhitesTurn ? blackPiecesCount-- : whitePiecesCount--
                gBoard[row - i][col - i] = { location: { row: row - i, col: col - i }, isOccupied: false }
            }
        }
    }
    gBoard[destinationRow][destinationCol] = gBoard[row][col]
    gBoard[destinationRow][destinationCol].location = { row: destinationRow, col: destinationCol }
    gBoard[row][col] = { location: { row, col }, isOccupied: false }

    //check is there are other possible cells to eat
    isRecursiveEating = true
    unMarkAll()
    checkAndMarkPossibleMoves(destinationRow, destinationCol, gBoard[destinationRow][destinationCol].isWhitePiece, "king", true)
    gPickedPos = { row: destinationRow, col: destinationCol }

    let isMoreToEat = false
    gBoard.forEach(row => {
        row.forEach(cell => {
            if (cell.isOccupied && cell.isMarked) isMoreToEat = true
        })
    })

    if (isMoreToEat) {
        console.log("keep eating")
        updateScore()
        renderBoard(gBoard)
        isCurrentlyEating = true
    }
    else {
        isRecursiveEating = false
        console.log("end turn!");
        cancelPick()
        endTurn()
        unMarkAll()
        gBoard[destinationRow][destinationCol].isSelected = false
        renderBoard(gBoard)
    }

}
const cellClicked = (cell) => {
    let row = +cell.dataset.pos[0]
    let col = +cell.dataset.pos[2]
    if (!gBoard[row][col].isOccupied && !gBoard[row][col].isMarked) {
        const selectedCell = document.querySelector(".selected")
        if (!!selectedCell) {
            cancelPick()
        }
    }
    if (!!gPickedPos && isLegalMove(row, col)) playTurn(row, col)
}
const pieceClicked = (piece) => {
    if (isCurrentlyEating) return
    const selectedCell = document.querySelector(".selected")
    if (!!selectedCell) {
        cancelPick()
        gPickedPos = null
    }
    let elCell = piece.parentElement
    let row = +elCell.dataset.pos[0]
    let col = +elCell.dataset.pos[2]
    if (!gBoard[row][col].isOccupied || (gBoard[row][col].isOccupied && isWhitesTurn != gBoard[row][col].isWhitePiece)) return//checking to see i cant pick an empty cell
    const isWhite = gBoard[row][col].isWhitePiece
    const rank = gBoard[row][col].rank
    checkAndMarkPossibleMoves(row, col, isWhite, rank)

    //cheking possible moves..
    let markedCellExists = false
    gBoard.forEach(row => {
        row.forEach(cell => {
            if (cell.isMarked) markedCellExists = true
        })
    })
    if (!markedCellExists) return

    gBoard[row][col].isSelected = true
    gPickedPos = { row, col }
    renderBoard(gBoard)
}
const cancelPick = (ev) => {
    if (gPickedPos === null || isCurrentlyEating) return
    if (ev && (ev.target.classList[0] === "cell" || ev.target.parentElement.classList[0] === "cell")) return;
    const selectedCells = document.querySelector(".selected")
    if (!!selectedCells) {
        gBoard.forEach(row => {
            row.forEach(cell => {
                cell.isSelected = false
                cell.isMarked = false
            })
        })
        // selectedCells.classList.remove("selected")
        gPickedPos = null
    }
    isRecursiveEating = false
    renderBoard(gBoard)
}
const isLegalMove = (row, col) => {
    if (gBoard[row][col].isOccupied || !gBoard[row][col].isMarked) return false
    const rowDiff = gPickedPos.row - row
    const colDiff = gPickedPos.col - col
    if (gBoard[gPickedPos.row][gPickedPos.col].rank === "soldier") {//soldier
        if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
            return true
        } else if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            if (rowDiff < 0) {//turn the enemy piece to an empty cell
                if (colDiff < 0) {
                    //down right
                    if (gPickedPos.row + 1 < 8 && gPickedPos.col + 1 < 8 && gBoard[gPickedPos.row + 1][gPickedPos.col + 1].isOccupied
                        &&
                        gBoard[gPickedPos.row + 1][gPickedPos.col + 1].isWhitePiece === isWhitesTurn) return false
                } else {
                    //down left
                    if (gPickedPos.row + 1 < 8 && gPickedPos.col - 1 >= 0 && gBoard[gPickedPos.row + 1][gPickedPos.col - 1].isOccupied
                        &&
                        gBoard[gPickedPos.row + 1][gPickedPos.col - 1].isWhitePiece === isWhitesTurn) return false
                }
            } else {
                if (colDiff < 0) {
                    //up right
                    if (gPickedPos.row - 1 >= 0 && gPickedPos.col + 1 < 8 && gBoard[gPickedPos.row - 1][gPickedPos.col + 1].isOccupied
                        &&
                        gBoard[gPickedPos.row - 1][gPickedPos.col + 1].isWhitePiece === isWhitesTurn) return false

                } else {
                    //up left
                    if (gPickedPos.row - 1 >= 0 && gPickedPos.col - 1 >= 0 && gBoard[gPickedPos.row - 1][gPickedPos.col - 1].isOccupied
                        &&
                        gBoard[gPickedPos.row - 1][gPickedPos.col - 1].isWhitePiece === isWhitesTurn) return false
                }
            }
            //eating
            return true
        } else return false
    } else {//king
        //implement king legal moves logic
        if (Math.abs(rowDiff) != Math.abs(colDiff)) return false
        if (rowDiff < 0) {//turn the enemy piece to an empty cell
            if (colDiff < 0) {
                //down right
                for (let i = 1; i < Math.abs(rowDiff); i++) {
                    if (gPickedPos.row + i > 7 || gPickedPos.col + i > 8) break
                    if (gBoard[gPickedPos.row + i][gPickedPos.col + i].isOccupied && gBoard[gPickedPos.row + i][gPickedPos.col + i].isWhitePiece === isWhitesTurn) return false

                }
            } else {
                //down left
                for (let i = 1; i < Math.abs(rowDiff); i++) {
                    if (gPickedPos.row + i > 7 || gPickedPos.col - i < 0) break
                    if (gBoard[gPickedPos.row + i][gPickedPos.col - i].isOccupied && gBoard[gPickedPos.row + i][gPickedPos.col - i].isWhitePiece === isWhitesTurn) return false
                }
            }
        } else {
            if (colDiff < 0) {
                //up right
                for (let i = 1; i < Math.abs(rowDiff); i++) {
                    if (gPickedPos.row - i < 0 || gPickedPos.col + i > 7) break
                    if (gBoard[gPickedPos.row - i][gPickedPos.col + i].isOccupied && gBoard[gPickedPos.row - i][gPickedPos.col + i].isWhitePiece === isWhitesTurn) return false
                }
            } else {
                //up left
                for (let i = 1; i < Math.abs(rowDiff); i++) {
                    if (gPickedPos.row - i < 0 || gPickedPos.col - i < 0) break
                    if (gBoard[gPickedPos.row - i][gPickedPos.col - i].isOccupied && gBoard[gPickedPos.row - i][gPickedPos.col - i].isWhitePiece === isWhitesTurn) return false
                }
            }
        }
        return true
    }
}
const checkAndMarkPossibleMoves = (row, col, isWhite, rank, isUnmarked = false) => {
    gPossibleMoves = []
    let isCellEmpty = !gBoard[row][col].isOccupied
    let isEnemyPiece = gBoard[row][col].isOccupied && (gBoard[row][col].isWhitePiece != isWhite)
    if (rank === "king") {
        //fill out king moves

        if (isRecursiveEating) {
            //down right
            for (let i = 1; i < (8 - row) && i < (8 - col); i++) {
                if (row + i + 1 < 8 && col + i + 1 < 8 && (gBoard[row + i][col + i].isWhitePiece != isWhite) && !gBoard[row + i + 1][col + i + 1].isOccupied && (!gBoard[row + i][col + i].isMarked && gBoard[row + i][col + i].isOccupied)) {
                    if (!isUnmarked && !checkEatenPiecesAround(row, col)) break
                    gBoard[row + i + 1][col + i + 1].isMarked = true
                    gBoard[row + i][col + i].isMarked = true
                    gPossibleMoves.push({ row: row + i + 1, col: col + i + 1 })
                } else break
            }
            //down left
            for (let i = 1; i < (8 - row) && i < col + 1; i++) {
                if (row + i + 1 < 8 && col - i - 1 >= 0 && (gBoard[row + i][col - i].isWhitePiece != isWhite) && !gBoard[row + i + 1][col - i - 1].isOccupied && (!gBoard[row + i][col - i].isMarked && gBoard[row + i][col - i].isOccupied)) {
                    if (!isUnmarked && !checkEatenPiecesAround(row, col)) break
                    gBoard[row + i + 1][col - i - 1].isMarked = true
                    gBoard[row + i][col - i].isMarked = true
                    gPossibleMoves.push({ row: row + i + 1, col: col - i - 1 })
                } else break
            }
            //up left
            for (let i = 1; i < row + 1 && i < col + 1; i++) {
                if (row - i - 1 >= 0 && col - i - 1 >= 0 && (gBoard[row - i][col - i].isWhitePiece != isWhite) && !gBoard[row - i - 1][col - i - 1].isOccupied && (!gBoard[row - i][col - i].isMarked && gBoard[row - i][col - i].isOccupied)) {
                    if (!isUnmarked && !checkEatenPiecesAround(row, col)) break
                    gBoard[row - i - 1][col - i - 1].isMarked = true
                    gBoard[row - i][col - i].isMarked = true
                    gPossibleMoves.push({ row: row - i - 1, col: col - i - 1 })
                } else break
            }
            //up right
            for (let i = 1; i < row + 1 && i < (8 - col); i++) {
                if (row - i - 1 >= 0 && col + i + 1 < 8 && (gBoard[row - i][col + i].isWhitePiece != isWhite) && !gBoard[row - i - 1][col + i + 1].isOccupied && (!gBoard[row - i][col + i].isMarked && gBoard[row - i][col + i].isOccupied)) {
                    if (!isUnmarked && !checkEatenPiecesAround(row, col)) break
                    gBoard[row - i - 1][col + i + 1].isMarked = true
                    gBoard[row - i][col + i].isMarked = true
                    gPossibleMoves.push({ row: row - i - 1, col: col + i + 1 })
                } else break
            }
        }
        else {
            //down right
            for (let i = 1; i < (8 - row) && i < (8 - col); i++) {
                if (gBoard[row + i][col + i].isOccupied && gBoard[row + i][col + i].isWhitePiece === isWhite) break
                else if (!gBoard[row + i][col + i].isOccupied) {
                    gBoard[row + i][col + i].isMarked = true
                    gPossibleMoves.push({ row: row + i, col: col + i })
                }
                else if (row + i + 1 < 8 && col + i + 1 < 8 && (gBoard[row + i][col + i].isWhitePiece != isWhite) && !gBoard[row + i + 1][col + i + 1].isOccupied) {
                    gBoard[row + i + 1][col + i + 1].isMarked = true
                    gBoard[row + i][col + i].isMarked = true
                    gPossibleMoves.push({ row: row + i + 1, col: col + i + 1 })
                    isRecursiveEating = true;
                } else break;
            }
            //down left
            for (let i = 1; i < (8 - row) && i < col + 1; i++) {
                if (gBoard[row + i][col - i].isOccupied && gBoard[row + i][col - i].isWhitePiece === isWhite) break
                else if (!gBoard[row + i][col - i].isOccupied) {
                    gBoard[row + i][col - i].isMarked = true
                    gPossibleMoves.push({ row: row + i, col: col - i })
                }
                else if (row + i + 1 < 8 && col - i - 1 >= 0 && (gBoard[row + i][col - i].isWhitePiece != isWhite) && !gBoard[row + i + 1][col - i - 1].isOccupied) {
                    gBoard[row + i + 1][col - i - 1].isMarked = true
                    gBoard[row + i][col - i].isMarked = true
                    gPossibleMoves.push({ row: row + i + 1, col: col - i - 1 })
                    isRecursiveEating = true;
                } else break
            }
            //up left
            for (let i = 1; i < row + 1 && i < col + 1; i++) {
                if (gBoard[row - i][col - i].isOccupied && gBoard[row - i][col - i].isWhitePiece === isWhite) break
                else if (!gBoard[row - i][col - i].isOccupied) {
                    gBoard[row - i][col - i].isMarked = true
                    gPossibleMoves.push({ row: row - i, col: col - i })
                }
                else if (row - i - 1 >= 0 && col - i - 1 >= 0 && (gBoard[row - i][col - i].isWhitePiece != isWhite) && !gBoard[row - i - 1][col - i - 1].isOccupied) {
                    gBoard[row - i - 1][col - i - 1].isMarked = true
                    gBoard[row - i][col - i].isMarked = true
                    gPossibleMoves.push({ row: row - i - 1, col: col - i - 1 })
                    isRecursiveEating = true;
                } else break
            }
            //up right
            for (let i = 1; i < row + 1 && i < (8 - col); i++) {
                if (gBoard[row - i][col + i].isOccupied && gBoard[row - i][col + i].isWhitePiece === isWhite) break
                else if (!gBoard[row - i][col + i].isOccupied) {
                    gBoard[row - i][col + i].isMarked = true
                    gPossibleMoves.push({ row: row - i, col: col + i })
                }
                else if (row - i - 1 >= 0 && col + i + 1 < 8 && (gBoard[row - i][col + i].isWhitePiece != isWhite) && !gBoard[row - i - 1][col + i + 1].isOccupied) {
                    gBoard[row - i - 1][col + i + 1].isMarked = true
                    gBoard[row - i][col + i].isMarked = true
                    gPossibleMoves.push({ row: row - i - 1, col: col + i + 1 })
                    isRecursiveEating = true;
                } else break
            }
        }
    }
    else {
        if (isRecursiveEating) {
            if (//checking if can continue eating by checking if theres a possible targeted enemy piece around
                isUnmarked ||
                ((row + 1 < 8 && col + 1 < 8 && gBoard[row + 1][col + 1].isMarked && gBoard[row + 1][col + 1].isOccupied)
                    ||
                    (row + 1 < 8 && col - 1 >= 0 && gBoard[row + 1][col - 1].isMarked && gBoard[row + 1][col - 1].isOccupied)
                    ||
                    (row - 1 >= 0 && col + 1 < 8 && gBoard[row - 1][col + 1].isMarked && gBoard[row - 1][col + 1].isOccupied)
                    ||
                    (row - 1 >= 0 && col - 1 >= 0 && gBoard[row - 1][col - 1].isMarked && gBoard[row - 1][col - 1].isOccupied)
                )) {
                if (!isEnemyPiece && row - 2 >= 0 && col + 2 < 8 && gBoard[row - 1][col + 1].isOccupied && (gBoard[row - 1][col + 1].isWhitePiece != isWhite) && !gBoard[row - 2][col + 2].isOccupied && !gBoard[row - 2][col + 2].isMarked) {
                    gBoard[row - 1][col + 1].isMarked = true;
                    gBoard[row - 2][col + 2].isMarked = true;
                    gPossibleMoves.push({ row: row - 2, col: col + 2 });
                }
                if (!isEnemyPiece && row - 2 >= 0 && col - 2 >= 0 && gBoard[row - 1][col - 1].isOccupied && (gBoard[row - 1][col - 1].isWhitePiece != isWhite) && !gBoard[row - 2][col - 2].isOccupied && !gBoard[row - 2][col - 2].isMarked) {
                    gBoard[row - 1][col - 1].isMarked = true;
                    gBoard[row - 2][col - 2].isMarked = true;
                    gPossibleMoves.push({ row: row - 2, col: col - 2 });
                }
                if (!isEnemyPiece && row + 2 < 8 && col + 2 < 8 && gBoard[row + 1][col + 1].isOccupied && (gBoard[row + 1][col + 1].isWhitePiece != isWhite) && !gBoard[row + 2][col + 2].isOccupied && !gBoard[row + 2][col + 2].isMarked) {
                    gBoard[row + 1][col + 1].isMarked = true;
                    gBoard[row + 2][col + 2].isMarked = true;
                    gPossibleMoves.push({ row: row + 2, col: col + 2 });
                }
                if (!isEnemyPiece && row + 2 < 8 && col - 2 >= 0 && gBoard[row + 1][col - 1].isOccupied && (gBoard[row + 1][col - 1].isWhitePiece != isWhite) && !gBoard[row + 2][col - 2].isOccupied && !gBoard[row + 2][col - 2].isMarked) {
                    gBoard[row + 1][col - 1].isMarked = true;
                    gBoard[row + 2][col - 2].isMarked = true;
                    gPossibleMoves.push({ row: row + 2, col: col - 2 });
                }
            }

        }
        if (!isRecursiveEating && isWhite) {//white
            if (isWhite && !isCellEmpty && !isEnemyPiece && row + 1 < 8 && col + 1 < 8 && !gBoard[row + 1][col + 1].isOccupied) {
                gPossibleMoves.push({ row: row + 1, col: col + 1 });
                gBoard[row + 1][col + 1].isMarked = true;
            }
            if (isWhite && !isCellEmpty && !isEnemyPiece && row + 1 < 8 && col - 1 >= 0 && !gBoard[row + 1][col - 1].isOccupied) {
                gPossibleMoves.push({ row: row + 1, col: col - 1 });
                gBoard[row + 1][col - 1].isMarked = true
            }
            if (!isEnemyPiece && row + 2 < 8 && col + 2 < 8 && gBoard[row + 1][col + 1].isOccupied && (gBoard[row + 1][col + 1].isWhitePiece != isWhite) && !gBoard[row + 2][col + 2].isOccupied) {
                gBoard[row + 1][col + 1].isMarked = true;
                gBoard[row + 2][col + 2].isMarked = true;
                gPossibleMoves.push({ row: row + 2, col: col + 2 });
                isRecursiveEating = true
            }
            if (!isEnemyPiece && row + 2 < 8 && col - 2 >= 0 && gBoard[row + 1][col - 1].isOccupied && (gBoard[row + 1][col - 1].isWhitePiece != isWhite) && !gBoard[row + 2][col - 2].isOccupied) {
                gBoard[row + 1][col - 1].isMarked = true;
                gBoard[row + 2][col - 2].isMarked = true;
                gPossibleMoves.push({ row: row + 2, col: col - 2 });
                isRecursiveEating = true
            }
        }
        else if (!isRecursiveEating && !isWhite) {//black
            if (!isWhite && !isCellEmpty && !isEnemyPiece && row - 1 >= 0 && col + 1 < 8 && !gBoard[row - 1][col + 1].isOccupied) {
                gPossibleMoves.push({ row: row - 1, col: col + 1 });
                gBoard[row - 1][col + 1].isMarked = true;
            }
            if (!isWhite && !isCellEmpty && !isEnemyPiece && row - 1 >= 0 && col - 1 >= 0 && !gBoard[row - 1][col - 1].isOccupied) {
                gPossibleMoves.push({ row: row - 1, col: col - 1 });
                gBoard[row - 1][col - 1].isMarked = true;
            }
            if (!isEnemyPiece && row - 2 >= 0 && col + 2 < 8 && gBoard[row - 1][col + 1].isOccupied && (gBoard[row - 1][col + 1].isWhitePiece != isWhite) && !gBoard[row - 2][col + 2].isOccupied) {
                gBoard[row - 1][col + 1].isMarked = true;
                gBoard[row - 2][col + 2].isMarked = true;
                gPossibleMoves.push({ row: row - 2, col: col + 2 });
                isRecursiveEating = true
            }
            if (!isEnemyPiece && row - 2 >= 0 && col - 2 >= 0 && gBoard[row - 1][col - 1].isOccupied && (gBoard[row - 1][col - 1].isWhitePiece != isWhite) && !gBoard[row - 2][col - 2].isOccupied) {
                gBoard[row - 1][col - 1].isMarked = true;
                gBoard[row - 2][col - 2].isMarked = true;
                gPossibleMoves.push({ row: row - 2, col: col - 2 });
                isRecursiveEating = true
            }
        }
    }
    renderBoard(gBoard)
    let moves = [...gPossibleMoves]
    if (isRecursiveEating) {
        moves.forEach(move => {
            // if (gBoard[row][col].rank === "king") isUnmarked = true
            checkAndMarkPossibleMoves(move.row, move.col, isWhite, rank, isUnmarked)
        })
    }
}
const unMarkAll = () => {
    gBoard.forEach(row => {
        row.forEach(cell => {
            cell.isMarked = false
        })
    })
    renderBoard(gBoard)
}
const checkEatenPiecesAround = (row, col) => {
    return (
        row + 1 < 8 && col + 1 < 8 && gBoard[row + 1][col + 1].isOccupied && gBoard[row + 1][col + 1].isMarked
        ||
        row + 1 < 8 && col - 1 >= 0 && gBoard[row + 1][col - 1].isOccupied && gBoard[row + 1][col - 1].isMarked
        ||
        row - 1 >= 0 && col - 1 >= 0 && gBoard[row - 1][col - 1].isOccupied && gBoard[row - 1][col - 1].isMarked
        ||
        row - 1 >= 0 && col + 1 < 8 && gBoard[row - 1][col + 1].isOccupied && gBoard[row - 1][col + 1].isMarked
    )
}
const crownSoldier = (cell) => {
    cell.rank = "king"
    //play promotion sound
}
const isAbleToEat = () => {
    const cellsToBurn = []
    gBoard.forEach(row => {
        row.forEach(cell => {
            const row = cell.location.row
            const col = cell.location.col
            const isWhite = cell.isWhitePiece
            if (isWhite != isWhitesTurn) return
            if (cell.rank === "soldier") {
                if (isWhite) {
                    if (row + 2 < 8 && col + 2 < 8 && gBoard[row + 1][col + 1].isOccupied && (gBoard[row + 1][col + 1].isWhitePiece != isWhite) && !gBoard[row + 2][col + 2].isOccupied) {
                        cellsToBurn.push(cell)
                    }
                    if (row + 2 < 8 && col - 2 >= 0 && gBoard[row + 1][col - 1].isOccupied && (gBoard[row + 1][col - 1].isWhitePiece != isWhite) && !gBoard[row + 2][col - 2].isOccupied) {
                        cellsToBurn.push(cell)
                    }
                } else {
                    if (row - 2 >= 0 && col + 2 < 8 && gBoard[row - 1][col + 1].isOccupied && (gBoard[row - 1][col + 1].isWhitePiece != isWhite) && !gBoard[row - 2][col + 2].isOccupied) {
                        cellsToBurn.push(cell)
                    }
                    if (row - 2 >= 0 && col - 2 >= 0 && gBoard[row - 1][col - 1].isOccupied && (gBoard[row - 1][col - 1].isWhitePiece != isWhite) && !gBoard[row - 2][col - 2].isOccupied) {
                        cellsToBurn.push(cell)
                    }
                }
            } else {
                //down right row+ col+
                for (let i = 1; i < (8 - row) && i < (8 - col); i++) {
                    if (!gBoard[row + i][col + i].isOccupied) continue
                    else if (gBoard[row + i][col + i].isWhitePiece === isWhitesTurn) break
                    else if (row + i + 1 < 8 && col + i + 1 < 8 &&
                        gBoard[row + i][col + i].isWhitePiece != isWhitesTurn
                        &&
                        gBoard[row + i][col + i].isOccupied
                        &&
                        !gBoard[row + i + 1][col + i + 1].isOccupied) cellsToBurn.push(cell)
                    else if (row + i + 1 < 8 && col + i + 1 < 8 &&
                        gBoard[row + i][col + i].isOccupied
                        &&
                        gBoard[row + i + 1][col + i + 1].isOccupied) break
                }
                //down left row+ col-
                for (let i = 1; i < (8 - row) && i < col + 1; i++) {
                    if (!gBoard[row + i][col - i].isOccupied) continue
                    else if (gBoard[row + i][col - i].isWhitePiece === isWhitesTurn) break
                    else if (row + i + 1 < 8 && col - i - 1 >= 0
                        &&
                        gBoard[row + i][col - i].isOccupied
                        &&
                        gBoard[row + i][col - i].isWhitePiece != isWhitesTurn
                        &&
                        !gBoard[row + i + 1][col - i - 1].isOccupied) cellsToBurn.push(cell)
                    else if (row + i + 1 < 8 && col - i - 1 >= 0
                        &&
                        gBoard[row + i][col - i].isOccupied
                        &&
                        gBoard[row + i + 1][col - i - 1].isOccupied) break
                }
                //up left row- col-
                for (let i = 1; i < row + 1 && i < col + 1; i++) {
                    if (!gBoard[row - i][col - i].isOccupied) continue
                    else if (gBoard[row - i][col - i].isWhitePiece === isWhitesTurn) break
                    else if (row - i - 1 >= 0 && col - i - 1 >= 0
                        &&
                        gBoard[row - i][col - i].isOccupied
                        &&
                        gBoard[row - i][col - i].isWhitePiece != isWhitesTurn
                        &&
                        !gBoard[row - i - 1][col - i - 1].isOccupied) cellsToBurn.push(cell)
                    else if (row - i - 1 >= 0 && col - i - 1 >= 0
                        &&
                        gBoard[row - i][col - i].isOccupied
                        &&
                        gBoard[row - i - 1][col - i - 1].isOccupied) break
                }
                //up right row- col +
                for (let i = 1; i < row + 1 && i < (8 - col); i++) {
                    if (!gBoard[row - i][col + i].isOccupied) continue
                    else if (gBoard[row - i][col + i].isWhitePiece === isWhitesTurn) break
                    else if (row - i - 1 >= 0 && col + i + 1 < 8
                        &&
                        gBoard[row - i][col + i].isOccupied
                        &&
                        gBoard[row - i][col + i].isWhitePiece != isWhitesTurn
                        &&
                        !gBoard[row - i - 1][col + i + 1].isOccupied) cellsToBurn.push(cell)
                    else if (row - i - 1 >= 0 && col + i + 1 < 8
                        &&
                        gBoard[row - i][col + i].isOccupied
                        &&
                        gBoard[row - i - 1][col + i + 1].isOccupied) break
                }

            }
        })

    })
    if (cellsToBurn.length > 0) {
        gOnlyKingsMoveCounter = 0
        badSound.play();
    }
    cellsToBurn.forEach(cell => {
        gBoard[cell.location.row][cell.location.col].isWhitePiece ? whitePiecesCount-- : blackPiecesCount--
        gBoard[cell.location.row][cell.location.col] = { location: { row: cell.location.row, col: cell.location.col }, isOccupied: false }
    })
    cancelPick()
}
const isLegalMoveLeft = () => {
    let movesLeft = false;
    gBoard.forEach(gameRow => {
        gameRow.forEach(cell => {
            const row = cell.location.row
            const col = cell.location.col
            if (!cell.isOccupied || cell.isWhitePiece != isWhitesTurn) return
            if (cell.rank === "king" || cell.isWhitePiece) {//white or king
                //down right
                if (row + 1 < 8 && col + 1 < 8 && !gBoard[row + 1][col + 1].isOccupied) {
                    movesLeft = true
                    return
                }
                else if (row + 2 < 8 && col + 2 < 8 && !gBoard[row + 2][col + 2].isOccupied) {
                    movesLeft = true
                    return
                }

                if (row + 1 < 8 && col - 1 >= 0 && !gBoard[row + 1][col - 1].isOccupied) {
                    movesLeft = true
                    return
                }
                else if (row + 2 < 8 && col - 2 >= 0 && !gBoard[row + 2][col - 2].isOccupied) {
                    movesLeft = true
                    return
                }
            }
            if (cell.rank === "king" || !cell.isWhitePiece) {//black or king
                if (row - 1 >= 0 && col + 1 < 8 && !gBoard[row - 1][col + 1].isOccupied) {
                    movesLeft = true
                    return
                }
                else if (row - 2 >= 0 && col + 2 < 8 && !gBoard[row - 2][col + 2].isOccupied) {
                    movesLeft = true
                    return
                }

                if (row - 1 >= 0 && col - 1 >= 0 && !gBoard[row - 1][col - 1].isOccupied) {
                    movesLeft = true
                    return
                }
                else if (row - 2 >= 0 && col - 2 >= 0 && !gBoard[row - 2][col - 2].isOccupied) {
                    movesLeft = true
                    return
                }
            }
        })
        if (movesLeft) return
    })
    if (!movesLeft) {
        gameOver()
        updateScore()
    }
}
const countPiecesAndRank = () => {
    let whiteSoldierCount = 0
    let blackSoldierCount = 0
    let whiteKingCount = 0
    let blackKingCount = 0
    gBoard.forEach(row => {
        row.forEach(cell => {
            if (cell.isOccupied && cell.isWhitePiece && cell.rank === "soldier") whiteSoldierCount++
            else if (cell.isOccupied && !cell.isWhitePiece && cell.rank === "soldier") blackSoldierCount++
            else if (cell.isOccupied && cell.isWhitePiece && cell.rank === "king") whiteKingCount++
            else if (cell.isOccupied && !cell.isWhitePiece && cell.rank === "king") blackKingCount++
        })
    })
    if ((whiteKingCount === 2 && blackKingCount === 1) || blackKingCount === 2 && whiteKingCount === 1) {
        isDraw = true
        gameOver()
        updateScore()
    }
}
