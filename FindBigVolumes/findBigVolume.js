export class findBigVolume {
    constructor(coin, needVolume) {
        this.coin = coin;
        this.createStream(coin, needVolume);
    }

    showVolume(volume, price) {
        const time = new Date();

        const mainParent = document.querySelector('.allVolumes');
        const volumeDiv = createNewDiv('volumeDiv', '', mainParent);
        
        createNewDiv('volumeV', '('+(this.coin)+')' + volume.toFixed() + '$', volumeDiv);
        createNewDiv('priceV', price, volumeDiv);
        createNewDiv('timeV', `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`, volumeDiv);
    }

    createStream(coin, needVolume) {
        const stream = new WebSocket(`wss://stream.binance.com:9443/ws/${coin.toLowerCase()}@aggTrade`);
        document.addEventListener('keydown', (event) => {
            if(event.key === 'z') {
                stream.close();
            }
        })

        console.log('Ищу большие объёмы на: ' + coin);
        stream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const volume = +data.q * +data.p;
            if(volume > needVolume) {
                this.showVolume(volume, +data.p);
            }
        }
    }
}


function createNewDiv(className, text, parent) {
    const div = document.createElement('div');
    if(className) div.classList.add(className);
    if(text) div.innerHTML = text;
    if(parent) parent.append(div);
    return div;
}