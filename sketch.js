function setup() {
    createCanvas(400, 200);
    background(200);
    textSize(32);
    fill(0);
    text('Clique para tocar um som!', 10, 100);
}

function mousePressed() {
    let sound = new p5.Oscillator('sine');
    sound.freq(440); // Frequência de A4
    sound.start();
    sound.amp(0.5);
    sound.stop(0.5);
}
