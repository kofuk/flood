'use strict';

let width, height, imageWidth, imageHeight;

let depthPlace;
let depths;

const bgImage = new Image();

const drawBgImage = () => {
    const ctxt  = document.getElementById('flood').getContext('2d');

    ctxt.clearRect(0, 0, width, height);
    ctxt.drawImage(bgImage, 0, 0, imageWidth, imageHeight);
};

const drawWater = (points1, points2, offset) => {
    drawBgImage();

    const ctxt = document.getElementById('flood').getContext('2d');

    ctxt.fillStyle = 'rgba(0, 0, 255, .5)';

    ctxt.beginPath();

    if (offset === 0) {
        ctxt.moveTo(imageWidth * points1[0][0], imageHeight * points1[0][1]);

        for (let i = 1; i < points1.length; i++) {
            ctxt.lineTo(imageWidth * points1[i][0], imageHeight * points1[i][1]);
        }
    } else {
        ctxt.moveTo(imageWidth * (points1[0][0] + (points2[0][0] - points1[0][0]) * offset),
                    imageHeight * (points1[0][1] + (points2[0][1] - points1[0][1]) * offset));

        for (let i = 1; i < points1.length; i++) {
            ctxt.lineTo(imageWidth * (points1[i][0] + (points2[i][0] - points1[i][0]) * offset),
                        imageHeight * (points1[i][1] + (points2[i][1] - points1[i][1]) * offset));
        }
    }

    ctxt.closePath();
    ctxt.fill();
};

let startTime;
let points;
let speeds;

const proceedWithAnimation = () => {
    const passed = Date.now() - startTime;
    const index = Math.ceil(passed / 1000);

    if (index >= points.length) return;

    if (index === 0) {
        drawWater(points[0], null, 0);
    } else {
        const offset = passed / 1000 - index + 1;

        drawWater(points[index - 1], points[index], offset);
    }

    document.getElementById('speed').innerText = speeds[index];

    requestAnimationFrame(proceedWithAnimation);
};

const measure = () => {
    const canvas = document.getElementById('flood');
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    if (width * 3 / 4 > height) {
        imageHeight = height;
        imageWidth = height * 4 / 3;
    } else {
        imageHeight = width * 3 / 4;
        imageWidth = width;
    }
};

const parseQuery = () => {
    const uri = window.location.href;
    const start = uri.indexOf("?") + 1;
    const end = uri.indexOf("#") >= 0 ? uri.indexOf("#") : uri.length;

    if (start <= 0) return new Map();

    const queryString = uri.substring(start, end);

    const result = new Map();
    queryString.split("&").forEach(e => {
        const positionEq = e.indexOf("=");
        result.set(e.substring(0, positionEq), e.substring(positionEq + 1));
    });

    return result;
};

window.addEventListener('resize', () => {
    measure();

    const canvas = document.getElementById('flood');

    canvas.width = width;
    canvas.height = height;

    drawBgImage();
});

const init = (resp) => {
    const data = JSON.parse(resp);

    points = data['points'];
    depthPlace = data['depth_place'];
    speeds = data['speed'];
    depths = data['depth'];

    bgImage.src = data['img'];
    bgImage.addEventListener('load', () => {
        drawBgImage();
        requestAnimationFrame(() => {
            startTime = Date.now();
            proceedWithAnimation();
        });
    });

    document.getElementById('name').innerText = data['name'];
};

const loadData = (name) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
            if (200 <= xhr.status && xhr.status < 300) {
                init(xhr.responseText);
            } else {
                document.getElementById('name').innerText = 'エラーが発生しました';
            }
        }
    });
    xhr.open('GET', '/restricted/data/' + name + '.json');
    xhr.send();
};

window.addEventListener('load', () => {
    const canvas  = document.getElementById('flood');

    measure();

    canvas.width = width;
    canvas.height = height;

    const query = parseQuery();
    const place = query.get('p');

    if (typeof place === 'undefined') {
        document.getElementById('name').innerText = 'エラーが発生しました';

        return;
    }

    loadData(place);
});
