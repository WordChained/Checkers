'use strict';
let eatingSound
let movingSound
let promotionSound
let badSound
let victorySound
let drawSound
const loadSounds = () => {
    eatingSound = new Audio('assets/eating.wav');
    movingSound = new Audio('assets/checkers-sound.wav');
    promotionSound = new Audio('assets/promotion.wav');
    badSound = new Audio('assets/burn.mp3')
    victorySound = new Audio('assets/victory.wav')
    drawSound = new Audio('assets/draw.mp3')
}