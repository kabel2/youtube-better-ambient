import throttle from 'lodash.throttle';

import { storageLocal } from './shared/storage';

const getVideo = () => document.querySelector('video-stream.html5-main-video, video');

let video = getVideo();
let canvas, ctx, overlay;
let sourceX, sourceY, sourceW, sourceH;
let aspectRatio = window.innerWidth / window.innerHeight;
let loopRunning = false;

let blurValue = 15; // blur is something deprecated in js...
let opacity = 0.6;

storageLocal.onChanged.addListener((changes) => {
    for (const item in changes) {
        switch (item) {
            case "blur":
                blurValue = changes[item].newValue;
                break;
            case "opacity":
                opacity = changes[item].newValue;
                break;
        }
    }
    canvas.style.opacity = opacity.toString();
    overlay.style.backdropFilter = `blur(${blurValue}px)`;
});

const calculateSourceRect = () => {
    let videoW = video.videoWidth;
    let videoH = video.videoHeight;
    aspectRatio = window.innerWidth / window.innerHeight;

    if (videoW / videoH > aspectRatio) {
        sourceW = aspectRatio * videoH;
        sourceX = (videoW - sourceW) / 2;
        sourceY = 0;
        sourceH = videoH;
    } else {
        sourceH = videoW / aspectRatio;
        sourceY = (videoH - sourceH) / 2;
        sourceX = 0;
        sourceW = videoW;
    }
}

const drawToCanvas = () => {
    ctx.drawImage(
        video,
        sourceX, sourceY, sourceW, sourceH,
        0, 0, window.innerWidth, window.innerHeight
    );
    if (!loopRunning) return;
    video.requestVideoFrameCallback(drawToCanvas);
}

const initialize = async () => {
    ({ blur: blurValue = 15, opacity = 0.6 } = await storageLocal.get(['blur', 'opacity']));

    canvas = document.createElement('canvas');
    canvas.style.inset = '0';
    canvas.style.position = 'fixed';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-2';
    canvas.style.opacity = opacity.toString();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    overlay = document.createElement('div');
    overlay.style.zIndex = '-1';
    overlay.style.opacity = '1';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.inset = '0';
    overlay.style.position = 'fixed';
    overlay.style.backdropFilter = `blur(${blurValue}px)`;

    document.body.appendChild(canvas);
    document.body.appendChild(overlay);

    ctx = canvas.getContext('2d');

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        calculateSourceRect();
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceW, sourceH,
            0, 0, window.innerWidth, window.innerHeight
        );
    });

    video.addEventListener('loadedmetadata', calculateSourceRect);

    video.addEventListener('resize', calculateSourceRect);

    calculateSourceRect();
    loopRunning = true;
    drawToCanvas();

    window.matchMedia('(display-mode: fullscreen)').addEventListener("change", ({ matches }) => {
        if (matches) {
            loopRunning = false;
        } else {
            if (loopRunning) return;
            loopRunning = true;
            drawToCanvas();
        }
    });

    const videoObserver = new MutationObserver(throttle(() => {
        video = getVideo();
    }, 200));
    videoObserver.observe(document.body, { childList: true, subtree: true });
}

const detectVideoAndInit = () => {
    video = getVideo();
    if (video?.src) {
        initialize();
        return;
    }

    let observer = new MutationObserver(() => {
        video = getVideo();
        if (video?.src) {
            observer.disconnect();
            initialize();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

detectVideoAndInit();