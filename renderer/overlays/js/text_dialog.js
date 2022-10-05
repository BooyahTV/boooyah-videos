const BLIP_SPEED = 58;
let discourse = null;

window.onload = () => {
  // const frame = document.getElementById('frame');
  // frame.style.display = 'none';


}

function writeDiscourse(initialDiscourse) {
  clearTimeout(discourse);
  // const frame = document.getElementById('frame');
  // frame.style.display = 'flex';
  const dialogue = document.getElementById('label');
  dialogue.innerHTML = '';

  //console.log('[result] ',msg)
  
  
  blip(initialDiscourse);
}

function stopBlip() {

    clearTimeout(discourse);
}

function blip(text) {
    if(!!!text) { return; }
    const char = text[0];
    const sound = document.getElementById('blip');
    sound.volume = 0.06;
    const dialogue = document.getElementById('label');
    let speed = BLIP_SPEED;

    sound.pause();
    sound.currentTime = 0;
    sound.play();

    // TODO: replace emotes

    dialogue.innerHTML += char;
    dialogue.scrollTop = dialogue.scrollHeight;

    discourse = setTimeout(blip.bind(null, text.substring(1)), speed);
}