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
    if (!text) {
        alert('Digite um texto para comprimir!');
        return;
    }

    const huffmanResult = huffmanCoding(text);
    const compressedSizeInBits = calculateCompressedSize(huffmanResult);

    compressedResult.innerHTML = `
        <p>Tamanho após compressão: ${compressedSizeInBits} bits</p>
        <p>Texto convertido: ${huffmanResult.encodedText}</p>

    `;

    let tableHTML = '<table><tr><th>Caractere</th><th>Código</th></tr>';
    for (const char in huffmanResult.huffmanCodes) {
        tableHTML += `<tr><td>${char}</td><td>${huffmanResult.huffmanCodes[char]}</td></tr>`;
    }
    tableHTML += '</table>';

    compressedResult.innerHTML += tableHTML;
    openHuffmanTreeInNewTab(huffmanResult.huffmanTree);
});

function huffmanCoding(text) {
    const freqMap = buildFrequencyMap(text);
    const huffmanTree = buildHuffmanTree(freqMap);
    const huffmanCodes = generateHuffmanCodes(huffmanTree);
    const encodedText = encodeText(text, huffmanCodes);

    return { huffmanTree, huffmanCodes, encodedText };
}

function buildFrequencyMap(text) {
    const freqMap = {};
    for (const char of text) {
        freqMap[char] = (freqMap[char] || 0) + 1;
    }
    return freqMap;
}

function buildHuffmanTree(freqMap) {
    const priorityQueue = Object.entries(freqMap)
        .map(([char, freq]) => ({ char, freq }))
        .sort((a, b) => a.freq - b.freq);

    while (priorityQueue.length > 1) {
        const left = priorityQueue.shift();
        const right = priorityQueue.shift();

        const newNode = {
            char: left.char + right.char,
            freq: left.freq + right.freq,
            left,
            right,
        };

        priorityQueue.push(newNode);
        priorityQueue.sort((a, b) => a.freq - b.freq);
    }

    return priorityQueue[0];
}

function generateHuffmanCodes(tree, prefix = '', codes = {}) {
    if (tree.char.length === 1) {
        codes[tree.char] = prefix;
    } else {
        generateHuffmanCodes(tree.left, prefix + '0', codes);
        generateHuffmanCodes(tree.right, prefix + '1', codes);
    }
    return codes;
}

function encodeText(text, huffmanCodes) {
    return text.split('').map(char => huffmanCodes[char]).join('');
}

function calculateCompressedSize(huffmanResult) {
    const { encodedText } = huffmanResult;
    return encodedText.length;
}

function openHuffmanTreeInNewTab(tree) {
    const newWindow = window.open('', '_blank'); 

    if (!newWindow) {
        alert('Por favor, permita pop-ups no seu navegador para visualizar a árvore.');
        return;
    }

    const treeHTML = generateTreeHTML(tree);
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Huffman Tree</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f0f0f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .huffman-node {
                    border: 1px solid black;
                    display: inline-block;
                    margin: 10px;
                    padding: 10px;
                    text-align: center;
                    font-size: 14px;
                    background-color: #f8f9fa;
                    border-radius: 50%; /* Torna os nós circulares */
                    width: 60px;
                    height: 60px;
                    line-height: 40px;
                }
                .huffman-children {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Árvore de Huffman</h1>
            ${treeHTML}
        </body>
        </html>
    `);

    newWindow.document.close(); 
}

function generateTreeHTML(node) {
    if (!node) return '';

    // Gera o HTML do nó atual
    let html = `<div class="huffman-node">`;
    if (node.char.length === 1) {
        // Nó folha: exibe o caractere e a frequência
        html += `${node.char}<br>(${node.freq})`;
    } else {
        // Nó intermediário: exibe apenas a frequência
        html += `(${node.freq})`;
    }
    html += `</div>`;

    // Adiciona os filhos do nó atual
    if (node.left || node.right) {
        html += `<div class="huffman-children">`;
        html += generateTreeHTML(node.left);
        html += generateTreeHTML(node.right);
        html += `</div>`;
    }

    return html;
}