'use strict';
let gBoard;
let gWinner = "white";
let isDraw = false;
let isWhitesTurn = true;
let gTurnCount = 1;
const init = () => {
    loadSounds()
    gBoard = buildBoard()
    console.table(gBoard)
    renderBoard(gBoard)
    updateScore()
    markTurn()
}

const buildBoard = () => {
    let board = []
    for (let i = 0; i < 8; i++) {
        let cells = []
        for (let j = 0; j < 8; j++) {
            if (i < 3 && (i + j) % 2 === 0) cells.push({ location: { row: i, col: j }, isWhitePiece: true, rank: 'soldier', isOccupied: true, isMarked: false, isSelected: false })
            else if (i > 4 && (i + j) % 2 === 0) cells.push({ location: { row: i, col: j }, isWhitePiece: false, rank: 'soldier', isOccupied: true, isMarked: false, isSelected: false })
            else cells.push({ location: { row: i, col: j }, isOccupied: false })
        }
        board.push(cells)
    }
    return board
}
function renderBoard(board) {
    let strHtml = '';
    for (let i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (let j = 0; j < board.length; j++) {
            let cell = board[i][j]
            strHtml += `<td data-pos="${i}-${j}" class="cell ${(i + j) % 2 == 0 ? "white" : "black"} ${cell.isMarked ? "mark" : ""}" onclick="cellClicked(this)" onclick="pieceClicked(this)">`;
            if (cell.isOccupied && cell.isWhitePiece && cell.rank === "soldier") strHtml += `<img class="white ${cell.rank} ${cell.isSelected ? "selected" : ""}" src="assets/white-piece.png" alt="" onclick="pieceClicked(this)">`
            else if (cell.isOccupied && !cell.isWhitePiece && cell.rank === "soldier") strHtml += `<img class="black ${cell.rank} ${cell.isSelected ? "selected" : ""}" src="assets/black-piece.png" alt=""onclick="pieceClicked(this)">`
            else if (cell.isOccupied && cell.isWhitePiece && cell.rank === "king") strHtml += `<img class="white ${cell.rank} ${cell.isSelected ? "selected" : ""}" src="assets/king-white-piece.png" alt=""onclick="pieceClicked(this)">`
            else if (cell.isOccupied && !cell.isWhitePiece && cell.rank === "king") strHtml += `<img class="black ${cell.rank} ${cell.isSelected ? "selected" : ""}" src="assets/king-black-piece.png" alt="" onclick="pieceClicked(this)">`
            strHtml += `</td>`
        }
        strHtml += '</tr>';
    }
    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
}
const openGameOverModal = () => {
    const elCover = document.querySelector(".cover")
    const elModal = document.querySelector(".game-over-modal")
    const elSubtitle = document.querySelector(".game-over-modal h5")
    elModal.style.top = "40%"
    setTimeout(() => {
        elModal.style.top = "35%"
    }, 700)
    if (!isDraw) elSubtitle.innerText = 'The winner is ' + gWinner + "!"
    else elSubtitle.innerText = 'DRAW!'
    elCover.style.display = "block"
}
const closeGameOverModal = () => {
    const elCover = document.querySelector(".cover")
    const elModal = document.querySelector(".game-over-modal")
    const elSubtitle = document.querySelector(".game-over-modal h5")
    elModal.style.top = "40%"
    setTimeout(() => {
        elModal.style.top = "-500px"
    }, 300)
    setTimeout(() => {
        elSubtitle.innerText = ''
    }, 1000)
    elCover.style.display = "none"
}
const openDrawModal = () => {
    if (gTurnCount === 1) return
    const elCover = document.querySelector(".cover")
    const elModal = document.querySelector(".draw-modal")
    const elSubtitle = document.querySelector(".draw-modal h3 span")
    elSubtitle.innerText = isWhitesTurn ? "WHITE" : "BLACK"

    elModal.style.left = "50%"
    elCover.style.display = "block"
}
const closeDrawModal = () => {
    const elCover = document.querySelector(".cover")
    const elModal = document.querySelector(".draw-modal")
    const elSubtitle = document.querySelector(".draw-modal h3 span")
    setTimeout(() => {
        elSubtitle.innerText = ''
    }, 1000)
    elModal.style.left = "-150vw"
    elCover.style.display = "none"
}
const updateScore = () => {
    const whiteScoreboard = document.querySelector(".score.white span")
    const blackScoreboard = document.querySelector(".score.black span")
    whiteScoreboard.innerText = whitePiecesCount
    blackScoreboard.innerText = blackPiecesCount
    if (whitePiecesCount === 0) {
        gWinner = "Black"
        victorySound.play()
        gameOver()
    } else if (blackPiecesCount === 0) {
        gWinner = "White"
        victorySound.play()
        gameOver()
    }
    if (gOnlyKingsMoveCounter === 15) {
        isDraw = true
        gameOver()
    }
}
const resign = () => {
    if (gTurnCount === 1) return
    gWinner = isWhitesTurn ? "Black" : "White"
    victorySound.play()
    gameOver()
}
const declineDraw = () => {
    closeDrawModal()
}
const acceptDraw = () => {
    closeDrawModal()
    isDraw = true
    gameOver()
}
const markTurn = () => {
    const turnDisplay = document.querySelector(".turn")
    if (isWhitesTurn) {
        turnDisplay.classList.add("white")
        turnDisplay.classList.remove("black")
        turnDisplay.innerText = "WHITE"
    } else {
        turnDisplay.classList.remove("white")
        turnDisplay.classList.add("black")
        turnDisplay.innerText = "BLACK"
    }
}
const gameOver = () => {
    if (isDraw) drawSound.play()
    openGameOverModal()
    gBoard = buildBoard()
    gPickedPos = null
    whitePiecesCount = 12
    blackPiecesCount = 12
    isRecursiveEating = false
    isWhitesTurn = true
    isDraw = false
    gPossibleMoves = []
    renderBoard(gBoard)
    markTurn()
    gTurnCount = 1
}
const restartGame = () => {
    gBoard = buildBoard()
    gPickedPos = null
    whitePiecesCount = 12
    blackPiecesCount = 12
    isDraw = false
    isRecursiveEating = false
    isCurrentlyEating = false
    isWhitesTurn = true
    gPossibleMoves = []
    renderBoard(gBoard)
    markTurn()
    updateScore()
    gTurnCount = 1
}


