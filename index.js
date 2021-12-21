let signals = [];
let audio = new Audio('sound.wav');


function startStream(coin, updateFunc) {
    stream = new WebSocket(`wss://stream.binance.com:9443/ws/${coin}@bookTicker`);
    stream.onmessage = function(event) {
        let data = JSON.parse(event.data);
        let bestPrice = data.b;
        updateFunc(bestPrice);
    }
    return stream;
}

function createSignal() {

    let obj = {
        coin: getNeedCoin(),
        currPrice: 0,
        needPrice: getNeedPrice(),
        upOrDown: getUpOrDown(),
        div: createDiv(signals.length),
        update: '',
        stream: '',
    }
    obj.update = function(bestPrice) {
        obj.currPrice = bestPrice;
        updateUI(obj.div, obj.currPrice, obj.needPrice, obj.coin);
        checkWatching(obj.upOrDown, obj.currPrice, obj.needPrice);
    },
    obj.stream = startStream(obj.coin, obj.update);

    signals.push(obj);
}



function createDiv(index) {
    const signal = document.createElement('div');
    signal.classList.add('signal');

    const signalText = document.createElement('div');
    signalText.classList.add('signalText');

    const btnDelete = document.createElement('button');
    btnDelete.classList.add('btnDelete');
    btnDelete.innerHTML = 'Delete';

    btnDelete.addEventListener('click', () => {
        signals[index].stream.close();
        signals[index] = '';
        signal.remove();
    })

    document.querySelector('.signals').append(signal);
    signal.append(signalText, btnDelete);

    return signalText;
}


function updateUI(div, prc, needPrice, needCoin) {
    let percent = ((needPrice - prc) / prc * 100).toFixed(3);
    div.innerHTML = `${needCoin.toUpperCase()}: ${+prc} (до цены: ${percent}%)`;
}


// INPUT SETTERS
function getNeedCoin() {
    const input = document.querySelector('#needCoin');
    return input.value.toLowerCase();
}

function getNeedPrice() {
    const input = document.querySelector('#needPrice');
    return parseFloat(input.value);
}

function getUpOrDown() {
    let text = document.querySelector('.active').innerHTML;
    if(text === 'Жду вверх') {
        return 'up';
    } else {
        return 'down';
    }
}
// INPUT SETTERS



function checkWatching(upOrDown, prc, needPrice) {
    if(upOrDown === 'up' && prc >= needPrice) {
        audio.play();
    }

    if(upOrDown === 'down' && prc <= needPrice) {
        audio.play();
    }
}


function clearAll() {
    signals.forEach(signal => signal.stream.close());
    signals = [];
    Array.from(document.querySelectorAll('input')).forEach(inp => inp.value = '');
    document.querySelector('.signals').innerHTML = '';
}


// KEYHANDLERS


document.addEventListener('keydown', (event) => {
    if(event.key === 'F2') {
        clearAll()
    }
})

document.addEventListener('click', (event) => {
    if(event.target.classList.contains('up')) {
        document.querySelector('.down').classList.remove('active');
        event.target.classList.add('active');
    }

    if(event.target.classList.contains('down')) {
        document.querySelector('.up').classList.remove('active');
        event.target.classList.add('active');
    }
})


const btnStart = document.querySelector('#start');
btnStart.addEventListener('click', () => {
    createSignal();
});

// KEYHANDLERS