'use strict';

const CHUNK_COUNT_X = 20;
const CHUNK_COUNT_Y = 20;
const CHUNK_WIDTH = 248;
const CHUNK_HEIGHT = 175;

let maps = new Map();
let width, height;
let chunkX = 0;
let chunkY = 0;
let offsetX = 0;
let offsetY = 0;

let needRedisplay = true;

const redisplay = () => {
    if (!needRedisplay) {
        requestAnimationFrame(redisplay);

        return;
    }

    needRedisplay = false;

    const ctxt = document.getElementById('map').getContext('2d');

    ctxt.clearRect(0, 0, width, height);

    let bottommost = -offsetY;
    let rightmost = -offsetX;

    for (let i = chunkX; i < CHUNK_COUNT_X; i++) {
        if (rightmost >= width) break;

        for (let j = chunkY; j < CHUNK_COUNT_Y; j++) {
            if (bottommost >= height) break;

            const chunkName = '' + i + '-' + j;

            if (!maps.has(chunkName)) loadMap(chunkName);
            else ctxt.drawImage(maps.get(chunkName), rightmost, bottommost, CHUNK_WIDTH, CHUNK_HEIGHT);

            bottommost += CHUNK_HEIGHT;
        }
        bottommost = -offsetY;
        rightmost += CHUNK_WIDTH;
    }

    requestAnimationFrame(redisplay);
};

const postRedisplay = () => {
    needRedisplay = true;
};

const loadMap = (chunkName) => {
    const  img = new Image();
    img.src = '/images/restricted/map/' + chunkName + '.png';
    img.addEventListener('load', postRedisplay);
    maps.set(chunkName, img);
};

let canvasRect;

let endCond = {};

const adjustCanvas = () => {
    const canvas = document.getElementById('map');

    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;

    if (width > CHUNK_WIDTH * CHUNK_COUNT_X) {
        endCond.chunkX = 0;
        endCond.offsetX = 0;
    } else {
        endCond.chunkX = CHUNK_COUNT_X - 1 - Math.floor(width / CHUNK_WIDTH);
        endCond.offsetX = CHUNK_WIDTH - width % CHUNK_WIDTH;
    }

    if (height > CHUNK_HEIGHT * CHUNK_COUNT_Y) {
        endCond.chunkY  = 0;
        endCond.offsetY = 0;
    } else {
        endCond.chunkY = CHUNK_COUNT_Y - 1 - Math.floor(height / CHUNK_HEIGHT);
        endCond.offsetY = CHUNK_HEIGHT - height % CHUNK_HEIGHT;
    }

    canvasRect = canvas.getBoundingClientRect();
};

let mouseDownP;
let prevX, prevY;

const mouseDown = (e) => {
    mouseDownP = true;
    prevX = e.clientX - canvasRect.left;
    prevY = e.clientY - canvasRect.top;
};

const mouseMove = (e) => {
    if (!mouseDownP) return;

    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;

    const moveX = prevX - currentX;
    const moveY = prevY - currentY;

    offsetX += moveX;
    offsetY += moveY;

    for (;;) {
        if (chunkX < endCond.chunkX && offsetX >= CHUNK_WIDTH) {
            offsetX -= CHUNK_WIDTH;
            ++chunkX;
        } else if (chunkX > 0 && offsetX < 0) {
            offsetX += CHUNK_WIDTH;
            --chunkX;
        } else {
            if (chunkX <= 0 && offsetX < 0) {
                chunkX = 0;
                offsetX = 0;
            } else if (chunkX >= endCond.chunkX && offsetX > endCond.offsetX) {
                chunkX = endCond.chunkX;
                offsetX = endCond.offsetX;
            }

            break;
        }
    }

    for (;;) {
        if (chunkY < endCond.chunkY && offsetY >= CHUNK_HEIGHT) {
            offsetY -= CHUNK_HEIGHT;
            ++chunkY;
        } else if (chunkY > 0 && offsetY < 0) {
            offsetY += CHUNK_HEIGHT;
            --chunkY;
        } else {
            if (chunkY <= 0 && offsetY < 0) {
                chunkY = 0;
                offsetY = 0;
            } else if (chunkY >= endCond.chunkY && offsetY > endCond.offsetY) {
                chunkY = endCond.chunkY;
                offsetY = endCond.offsetY;
            }

            break;
        }
    }

    postRedisplay();

    prevX = currentX;
    prevY = currentY;
}

const mouseUp = () => {
    mouseDownP = false;
};

addEventListener('load', () => {
    adjustCanvas();

    const canvas = document.getElementById('map');
    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mouseup', mouseUp);

    requestAnimationFrame(redisplay);
});

addEventListener('resize', () => {
    adjustCanvas();
    postRedisplay();
});
