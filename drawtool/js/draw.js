/**
 * @license
 * Copyright 2019 Koki Fukuda
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const img = new Image();
let width, height, aspect, imgWidth, imgHeight;
let canvasRect;
const points = [];

const draw = () => {
    const ctxt = document.getElementById('drawArea').getContext('2d');

    ctxt.clearRect(0, 0, width, height);

    ctxt.drawImage(img, 0, 0, imgWidth, imgHeight);

    if (points.length === 0) {
        requestAnimationFrame(draw);
        return;
    }

    if (points.length >= 2) {
        ctxt.fillStyle = 'rgba(0, 0, 255, .5)';

        ctxt.beginPath();

        ctxt.moveTo(imgWidth * points[0][0], imgHeight * points[0][1]);

        for (let i = 1; i < points.length; i++)
            ctxt.lineTo(imgWidth * points[i][0], imgHeight * points[i][1]);

        ctxt.closePath();
        ctxt.fill();
    }

    ctxt.fillStyle = 'rgb(0, 98, 255)';

    for (let i = 0; i < points.length; i++) {
        ctxt.beginPath();
        ctxt.arc(imgWidth * points[i][0], imgHeight * points[i][1], 5, 0, 2 * Math.PI, false);
        ctxt.fill();
    }

    requestAnimationFrame(draw);
};

let isMouseDown;
let editingIndex;

const mouseDown = (e) => {
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;

    for (let i = 0; i < points.length; i++) {
        if (Math.pow(currentX - (imgWidth * points[i][0]), 2)
            + Math.pow(currentY - (imgHeight * points[i][1]), 2) < 25) {
            editingIndex = i

            prevX = currentX;
            prevY = currentY;

            isMouseDown = true;
            break;
        }
    }
};

let prevX, prevY;

const mouseMove = (e) => {
    if (!isMouseDown) return;

    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;

    points[editingIndex][0] += (currentX - prevX) / imgWidth;
    points[editingIndex][1] += (currentY - prevY) / imgHeight;

    if (points[editingIndex][0] < 0) points[editingIndex][0] = 0;
    if (points[editingIndex][0] > 1) points[editingIndex][0] = 1;
    if (points[editingIndex][1] < 0) points[editingIndex][1] = 0;
    if (points[editingIndex][1] > 1) points[editingIndex][1] = 1;

    prevX = currentX;
    prevY = currentY;
};

const mouseUp = () => {
    isMouseDown = false;
};

const copy = (string) => {
    const tmp = document.createElement("div");
    const pre = document.createElement('pre');

    pre.style.userSelect = 'auto';

    tmp.appendChild(pre).textContent = string;

    tmp.style.position = 'fixed';
    tmp.style.right = '200%';

    document.body.appendChild(tmp);
    document.getSelection().selectAllChildren(tmp);

    var result = document.execCommand("copy");

    document.body.removeChild(tmp);

    return result;
};

const measure = () => {
    const canvas = document.getElementById('drawArea');

    canvasRect = canvas.getBoundingClientRect();

    canvas.width = width = canvas.clientWidth;
    canvas.height = height = canvas.clientHeight;

    aspect = img.naturalWidth / img.naturalHeight;

    const vpAspect = width / height;

    if (vpAspect > aspect) {
        imgHeight = height;
        imgWidth = height * aspect;
    } else {
        imgHeight = width / aspect;
        imgWidth = width;
    }
};

window.addEventListener('resize', () => {
    measure();
});

window.addEventListener('load', () => {
    alert('Press A to add point, C to copy as JSON.');

    const canvas = document.getElementById('drawArea');

    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 65) points.push([.5, .5]);
        else if (e.keyCode === 67) copy(JSON.stringify(points));
    });

    canvas.addEventListener('mousedown', mouseDown);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('mouseup', mouseUp);
    canvas.addEventListener('mouseleave', () => { isMouseDown = false; });

    img.src = '/image.jpg';
    img.addEventListener('load', () => {
        measure();

        requestAnimationFrame(draw);
    });
});
