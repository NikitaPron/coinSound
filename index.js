const price = document.querySelector('#price');

let needPrice;
let upOrDown;

let needCoin = 'ltcusdt';
let stream;


function startStream() {
    if(stream) stream.close();
    stream = new WebSocket(`wss://stream.binance.com:9443/ws/${needCoin}@bookTicker`);
    stream.onmessage = function(event) {
        let data = JSON.parse(event.data);
        console.log(data.b)
        showPrice(data.b);
        checkWatching(data.b);
    }
}



function showPrice(pr) {
    let percent = ((needPrice - pr) / pr * 100).toFixed(3);
    price.innerHTML = `${needCoin.toUpperCase()}: ${+pr} (до цены: ${percent}%)`;
}


// INPUT SETTERS
function setNeedCoin() {
    const input = document.querySelector('#needCoin');
    needCoin = input.value.toLowerCase();
}

function setNeedPrice() {
    const input = document.querySelector('#needPrice');
    needPrice = parseFloat(input.value);
}
// INPUT SETTERS



function checkWatching(prc) {
    if(upOrDown === 'up' && prc >= needPrice) {
        playAudio();
    }

    if(upOrDown === 'down' && prc <= needPrice) {
        playAudio();
    }


}

let audio = new Audio('sound.wav');
function playAudio() {
    audio.play();
}




function clearAll() {
    if(stream) {
        stream.close();
    }
    needPrice = '';
    needCoin = '';
    Array.from(document.querySelectorAll('input')).forEach(inp => inp.value = '');
    price.innerHTML = '';
}


// KEYHANDLERS


document.addEventListener('keydown', (event) => {
    if(event.key === 'F2') {
        clearAll()
    }

    if(event.key === 'Enter') {
        setNeedPrice();
        setNeedCoin();
    }
})

document.addEventListener('click', (event) => {
    if(event.target.classList.contains('up')) {
        document.querySelector('.down').classList.remove('active');
        event.target.classList.add('active');
        upOrDown = 'up';
    }

    if(event.target.classList.contains('down')) {
        document.querySelector('.up').classList.remove('active');
        event.target.classList.add('active');
        upOrDown = 'down';
    }
})


const btnStart = document.querySelector('#start');
btnStart.addEventListener('click', () => {
    setNeedPrice();
    setNeedCoin();
    startStream();
});

// KEYHANDLERS