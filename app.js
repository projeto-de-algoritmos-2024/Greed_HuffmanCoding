const inputText = document.getElementById('inputText');
const bitSize = document.getElementById('bitSize');
const compressButton = document.getElementById('compressButton');
const compressedResult = document.getElementById('compressedResult');

inputText.addEventListener('input', () => {
    const text = inputText.value;
    const sizeInBits = text.length * 8;
    bitSize.textContent = sizeInBits;
});

compressButton.addEventListener('click', () => {
    const text = inputText.value;
    const compressedSizeInBits = "XX";
    compressedResult.textContent = `Tamanho após compressão: ${compressedSizeInBits} bits`;
});