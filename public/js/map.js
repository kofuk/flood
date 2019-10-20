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

    let bottommost = 0
    let rightmost = 0;

    for (let i = chunkX; i < 20; i++) {
        if (rightmost >= width) break;

        for (let j = chunkY; j < 20; j++) {
            if (bottommost >= height) break;

            const chunkName = '' + i + '-' + j;

            if (!maps.has(chunkName)) loadMap(chunkName);
            else ctxt.drawImage(maps.get(chunkName), rightmost, bottommost, 248, 175);

            bottommost += 175;
        }
        bottommost = 0;
        rightmost += 248;
    }

    requestAnimationFrame(redisplay);
};

const loadMap = (chunkName) => {
    const  img = new Image();
    img.src = '/images/restricted/map/' + chunkName + '.png';
    img.addEventListener('load', postRedisplay);
    maps.set(chunkName, img);
};

const adjustCanvas = () => {
    const canvas = document.getElementById('map');

    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;
};

const postRedisplay = () => {
    needRedisplay = true;
};

addEventListener('load', () => {
    adjustCanvas();

    requestAnimationFrame(redisplay);
});

addEventListener('resize', () => {
    adjustCanvas();
    postRedisplay();
});
