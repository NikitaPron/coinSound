export function saveSignals(arr) {
    localStorage.setItem('signals', JSON.stringify(arr));
}


export function clearSignals(arr) {
    localStorage.removeItem('signals');
}


export function getSignals() {
    return JSON.parse(localStorage.getItem('signals'));
}