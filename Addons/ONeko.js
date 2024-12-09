(function () {
    const nekoEl = document.createElement("div");
    let nekoPosX = -16;
    let nekoPosY = -16;
    let mousePosX = 0;
    let mousePosY = 0;
    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;
    const nekoSpeed = 10;
    const spriteSets = {
        idle: [[-3, -3]],
        alert: [[-7, -3]],
        scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
        scratchWallN: [[0, 0], [0, -1]],
        scratchWallS: [[-7, -1], [-6, -2]],
        scratchWallE: [[-2, -2], [-2, -3]],
        scratchWallW: [[-4, 0], [-4, -1]],
        tired: [[-3, -2]],
        sleeping: [[-2, 0], [-2, -1]],
        N: [[-1, -2], [-1, -3]],
        NE: [[0, -2], [0, -3]],
        E: [[-3, 0], [-3, -1]],
        SE: [[-5, -1], [-5, -2]],
        S: [[-6, -3], [-7, -2]],
        SW: [[-5, -3], [-6, -1]],
        W: [[-4, -2], [-4, -3]],
        NW: [[-1, 0], [-1, -1]],
    };

    function create() {
        let existingNeko = document.querySelector("#oneko");

        if (existingNeko != null) {
            nekoEl = existingNeko;
        } else {
            nekoEl.id = "oneko";
            nekoEl.style.width = "32px";
            nekoEl.style.height = "32px";
            nekoEl.style.position = "fixed";
            nekoEl.style.pointerEvents = "none";
            nekoEl.style.backgroundImage = "url('https://i.imgur.com/ok5b9Sz.gif')";
            nekoEl.style.filter = "invert(1)";
            nekoEl.style.imageRendering = "pixelated";
            nekoEl.style.left = `${nekoPosX - 16}px`;
            nekoEl.style.top = `${nekoPosY - 16}px`;
            nekoEl.style.zIndex = "9999";

            document.body.appendChild(nekoEl);
        }

        document.onmousemove = (event) => {
            mousePosX = event.clientX;
            mousePosY = event.clientY;
        };

        window.onekoInterval = setInterval(frame, 100);
    }

    function setSprite(name, frame) {
        const sprite = spriteSets[name][frame % spriteSets[name].length];
        nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    }

    function idle() {
        idleTime += 1;

        if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
            const availableIdleAnimations = ["sleeping", "scratchSelf"];
            idleAnimation = availableIdleAnimations[Math.floor(Math.random() * availableIdleAnimations.length)];
        }

        switch (idleAnimation) {
            case "sleeping":
                setSprite("tired", 0);
                if (++idleAnimationFrame > 192) idleAnimation = null;
                break;
            case "scratchSelf":
                setSprite(idleAnimation, idleAnimationFrame);
                if (++idleAnimationFrame > 9) idleAnimation = null;
                break;
            default:
                setSprite("idle", 0);
        }
    }

    function frame() {
        frameCount += 1;
        const targetX = Math.min(Math.max(0, mousePosX), window.innerWidth);
        const targetY = Math.min(Math.max(1, mousePosY - 32), window.innerHeight - 1);
        const diffX = nekoPosX - targetX;
        const diffY = nekoPosY - targetY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

        if (distance < nekoSpeed || (distance < 48 && Math.abs(diffY) < 16)) {
            idle();
            return;
        }

        idleAnimation = null;
        idleAnimationFrame = 0;
        const direction = (diffY / distance > 0.5 ? "N" : "") + (diffY / distance < -0.5 ? "S" : "") +
            (diffX / distance > 0.5 ? "W" : "") + (diffX / distance < -0.5 ? "E" : "");
        setSprite(direction, frameCount);

        nekoPosX -= (diffX / distance) * nekoSpeed;
        nekoPosY -= (diffY / distance) * nekoSpeed;

        nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
        nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
    }

    create();
})();
