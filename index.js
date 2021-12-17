const app = document.querySelector('#app');
const price = document.querySelector('#price');
let needPrice;
let upOrDown;

let currentCoin = 'ltcusdt';
let arrCoins = [
    'btcusdt', 'ltcusdt', 'atomusdt', 'ftmusdt', 'dogeusdt', 'lunausdt'
]
let stream;




fillApp()


function startStream(coin) {
    stream = new WebSocket(`wss://stream.binance.com:9443/ws/${coin}@bookTicker`);
    stream.onmessage = function(event) {
        let data = JSON.parse(event.data);
        console.log(data.b)
        showPrice(data.b);
        checkWatching(data.b);
    }
}




function fillApp() {
    arrCoins.forEach(coin => {
        let divCoin = document.createElement('div');
        divCoin.innerHTML = coin;
        app.append(divCoin);
        divCoin.addEventListener('click', setCurrent);
    })
}

function setCurrent() {
    if(stream) stream.close();
    clearSelection();
    this.classList.add('selected');


    changeCurrentCoin(this.innerHTML);
    setTimeout(() => startStream(currentCoin), 1000);
}

function clearSelection() {
    Array.from(app.children).forEach(div => div.classList.remove('selected'));
}

function changeCurrentCoin(newCoin) {
    currentCoin = newCoin;
}



function showPrice(pr) {
    price.innerHTML = `${currentCoin.toUpperCase()}: ${+pr}`;
}



document.addEventListener('keydown', (event) => {
    if(event.key === 'q') {
        stream.close();
    }

    if(event.key === 'Enter') {
        setNeedPrice()
    }
})


function setNeedPrice() {
    const input = document.querySelector('#needPrice');
    needPrice = parseFloat(input.value);
}


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