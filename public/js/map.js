'use strict';

let maps = {};
let width, height;
let chunkX = 0;
let chunkY = 0;
let offsetX = 0;
let offsetY = 0;

const redisplay = () => {
    const ctxt = document.getElementById('map').getContext('2d');

    let bottommost, rightmost;

    for (let i = chunkX; i < 20; i++) {
        if (rightmost >= width) break;

        for (let j = chunkY; j < 20; j++) {
            if (bottommost >= height) break;

            const chunkName = '' + i + '-' + j;
            if (typeof maps[chunkName] === 'undefined') loadMap(chunkName);
            else ctxt.drawImage(maps[chunkName], rightmost, bottommost, 248, 175);

            bottommost += 175;
        }
        bottommost = 0;
        rightmost += 248;
    }
};

const loadMap = (chunkName) => {
    maps[chunkName] = new Image();
    maps[chunkName].src = '/images/map/' + chunkName + '.png';
    maps[chunkName].addEventListener('load', redisplay);
};

const adjustCanvas = () => {
    const canvas = document.getElementById('map');

    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;
};

addEventListener('load', () => {
    adjustCanvas();
    redisplay();
});

addEventListener('resize', () => {
    adjustCanvas();
    redisplay();
});
