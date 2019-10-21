'use strict';

const CHUNK_COUNT_X = 20;
const CHUNK_COUNT_Y = 20;
const CHUNK_WIDTH = 248;
const CHUNK_HEIGHT = 175;

const MARK_RADIUS = 40;

let maps = new Map();
let width, height;
let chunkX = 0;
let chunkY = 0;
let offsetX = 0;
let offsetY = 0;

let points;

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
            else {
                if (maps.get(chunkName).complete && maps.get(chunkName).width !== 0) {
                    ctxt.drawImage(maps.get(chunkName), rightmost, bottommost, CHUNK_WIDTH, CHUNK_HEIGHT);
                }
            }

            bottommost += CHUNK_HEIGHT;
        }
        bottommost = -offsetY;
        rightmost += CHUNK_WIDTH;
    }

    const rangeLeft = chunkX * CHUNK_WIDTH + offsetX;
    const rangeRight = rangeLeft + width;
    const rangeTop = chunkY * CHUNK_HEIGHT + offsetY;
    const rangeButtom = rangeTop + height;

    if (typeof points !== 'undefined') {
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (rangeLeft - MARK_RADIUS <= point.x && point.x <= rangeRight + MARK_RADIUS
                && rangeTop - MARK_RADIUS <= point.y && point.y <= rangeButtom + MARK_RADIUS) {

                ctxt.fillStyle = 'rgba(0, 0, 0, .03)';
                for (let i = 1; i <= 5; i++) {
                    ctxt.beginPath();
                    ctxt.arc(point.x - rangeLeft + i * .8, point.y - rangeTop + i, MARK_RADIUS, 0, 2 * Math.PI, false);
                    ctxt.fill();
                }

                ctxt.fillStyle = 'rgb(0, 98, 255)';
                ctxt.beginPath();
                ctxt.arc(point.x - rangeLeft, point.y - rangeTop, MARK_RADIUS, 0, 2 * Math.PI, false);
                ctxt.fill();

                ctxt.fillStyle = 'rgb(33, 118, 255)';
                ctxt.beginPath();
                ctxt.arc(point.x - rangeLeft, point.y - rangeTop, MARK_RADIUS * .97, 0, 2 * Math.PI, false);
                ctxt.fill();
            }
        }
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

const changeCursor = (e) => {
    const x = e.clientX + chunkX * CHUNK_WIDTH + offsetX;
    const y = e.clientY + chunkY * CHUNK_HEIGHT + offsetY;

    const selecting = typeof (points.find(e =>
        Math.pow(e.x - x, 2) + Math.pow(e.y - y, 2)
        <= MARK_RADIUS * MARK_RADIUS)) !== 'undefined';

    const canvas = document.getElementById('map');
    canvas.style.cursor = selecting ? 'pointer' : 'move';
};

let isMouseDown, isMouseMoved;
let prevX, prevY;

const mouseDown = (e) => {
    isMouseDown = true;
    isMouseMoved = false;
    prevX = e.clientX - canvasRect.left;
    prevY = e.clientY - canvasRect.top;
};

const mouseMove = (e) => {
    isMouseMoved = true;
    changeCursor(e);

    if (!isMouseDown) return;

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
    isMouseDown = false;
};

const click = (e) => {
    if (isMouseMoved) return;

    const x = e.clientX + chunkX * CHUNK_WIDTH + offsetX;
    const y = e.clientY + chunkY * CHUNK_HEIGHT + offsetY;

    const point = points
        .find(e => Math.pow(e.x - x, 2) + Math.pow(e.y - y, 2) <= MARK_RADIUS * MARK_RADIUS);
    if (typeof point !== 'undefined') location.href = '/flood.html?p=' + point.name;
};

const initMapPosition = () => {
    const midX = CHUNK_WIDTH * CHUNK_COUNT_X / 2;
    const midY = CHUNK_HEIGHT * CHUNK_COUNT_Y / 2;

    const countLeft = Math.floor(height / CHUNK_HEIGHT / 2);
    const countUp = Math.floor(width / CHUNK_WIDTH / 2);

    chunkX = Math.floor(midX / CHUNK_WIDTH) - countLeft;
    chunkY = Math.floor(midY / CHUNK_HEIGHT) - countUp;

    offsetX = (midX - (chunkX + countLeft) * CHUNK_WIDTH) / 2;
    offsetY = (midY - (chunkY + countUp) * CHUNK_HEIGHT) / 2;
};

const loadPoints = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/restricted/points.json');
    xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
            points = JSON.parse(xhr.responseText);

            postRedisplay();
        }
    });
    xhr.send();
};

window.addEventListener('load', () => {
    adjustCanvas();

    initMapPosition();

    requestAnimationFrame(redisplay);

    const canvas = document.getElementById('map');
    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mouseup', mouseUp);
    canvas.addEventListener('mouseleave', mouseUp);
    canvas.addEventListener('click', click);

    loadPoints();
});

window.addEventListener('resize', () => {
    adjustCanvas();
    postRedisplay();
});
