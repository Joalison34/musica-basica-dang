const title = "CMSP Plataformas Hacks";
const titleElement = document
    .getElementById("title")
    .querySelector("span");
let index = 0;
let isDeleting = false;

function type() {
    const currentText = title.slice(0, index);
    titleElement.textContent = currentText;

    if (isDeleting) {
        index--;
        if (index < 0) {
            isDeleting = false;
            index = 0;
            setTimeout(type, 800);
        } else {
            setTimeout(type, 80);
        }
    } else {
        index++;
        if (index > title.length) {
            isDeleting = true;
            setTimeout(type, 5000);
        } else {
            setTimeout(type, 150);
        }
    }
}

type();
