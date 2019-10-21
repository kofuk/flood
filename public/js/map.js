'use strict';

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

    for (let i = chunkX; i < 20; i++) {
        if (rightmost >= width) break;

        for (let j = chunkY; j < 20; j++) {
            if (bottommost >= height) break;

            const chunkName = '' + i + '-' + j;

            if (!maps.has(chunkName)) loadMap(chunkName);
            else ctxt.drawImage(maps.get(chunkName), rightmost, bottommost, 248, 175);

            bottommost += 175;
        }
        bottommost = -offsetY;
        rightmost += 248;
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

    //TODO: (screen width) > (map width)
    endCond.chunkX = 18 - Math.floor(width / 248);
    endCond.offsetX = width % 248;
    //TODO: (screen height) > (map height)
    endCond.chunkY = 20 - Math.floor(height / 175);
    endCond.offsetY = height % 175;

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
        if (chunkX < endCond.chunkX && offsetX >= 248) {
            offsetX -= 248;
            ++chunkX;
        } else if (chunkX > 0 && offsetX < 0) {
            offsetX += 248;
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
        if (chunkY < endCond.chunkY && offsetY >= 175) {
            offsetY -= 175;
            ++chunkY;
        } else if (chunkY > 0 && offsetY < 0) {
            offsetY += 175;
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
