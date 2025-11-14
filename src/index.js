import throttle from 'lodash.throttle';


const getVideo = () => document.querySelector('video-stream.html5-main-video, video');

let video = getVideo();
let canvas, ctx, overlay;
let sourceX, sourceY, sourceW, sourceH;
let aspectRatio = window.innerWidth / window.innerHeight;
let loopRunning = false;

const storage = browser.storage.local;

let blurValue = 15; // blur is something deprecated in js...
let opacity = 0.6;

browser.storage.onChanged.addListener((changes) => {
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
    ({ blur: blurValue = 15, opacity = 0.6 } = await storage.get(['blur', 'opacity']));

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

    const defaultColor = '#12121252';

    document.documentElement.style.setProperty('--yt-spec-general-background-a', '#18181873');
    document.documentElement.style.setProperty('--yt-spec-brand-background-primary', 'rgba(24,24,24,.45)');
    document.documentElement.style.setProperty('--ytd-searchbox-background', defaultColor);
    document.documentElement.style.setProperty('--yt-spec-brand-background-solid', defaultColor);
    document.documentElement.style.setProperty('--yt-spec-base-background', defaultColor);

    const setPropertyIfExists = (selector, propertyName, value) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.setProperty(propertyName, value, 'important');
            return true;
        }
    }

    setPropertyIfExists('ytd-app', 'background-color', 'transparent');
    setPropertyIfExists('.ytSearchboxComponentInputBoxDark', 'border-color', 'rgba(18, 18, 18, 0.1)');
    setPropertyIfExists('#masthead', 'backdrop-filter', 'blur(80px)');
    setPropertyIfExists('#masthead', 'background-color', 'rgba(0,0,0,0.1)');
    setPropertyIfExists('#container', 'background-color', 'rgba(0,0,0,0.3)');
    setPropertyIfExists('#cinematics-container', 'display', 'none');

    document.querySelectorAll('#voice-search-button, .ytSearchboxComponentInputBoxDark, #background.ytd-masthead').forEach((element) => {
        element.style.backgroundColor = defaultColor;
    });

    let liveChatStyled, cinematicsDisabled = false;

    const observer = new MutationObserver(() => {
        if (!cinematicsDisabled) cinematicsDisabled = setPropertyIfExists('#cinematics-container', 'display', 'none');
        if (!liveChatStyled) liveChatStyled = setPropertyIfExists('ytd-button-renderer.style-scope.ytd-live-chat-frame', 'backgroundColor', defaultColor);

        if (cinematicsDisabled && liveChatStyled) observer.disconnect(document);
    });

    setTimeout(() => {
        observer.disconnect(document);
    }, 5000);

    observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });

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