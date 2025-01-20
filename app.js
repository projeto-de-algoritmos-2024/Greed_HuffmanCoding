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

    const decompressedText = decompressText(huffmanResult.encodedText, huffmanResult.huffmanCodes);
    compressedResult.innerHTML += `
        <p><strong>Texto descomprimido:</strong> ${decompressedText}</p>
    `;

    if (decompressedText === text) {
        compressedResult.innerHTML += '<p style="color: green;">A descompressão foi bem-sucedida!</p>';
    } else {
        compressedResult.innerHTML += '<p style="color: red;">A descompressão falhou!</p>';
    }

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

function generateTreeHTML(node, level = 0, nodeId = 'root') {
    if (!node) return '';

    const currentId = `${nodeId}-${level}`;
    let html = `<div class="huffman-node-container" id="${currentId}">`;
    html += `<div class="huffman-node">`;

    if (node.char.length === 1) {
        html += `${node.char}<br>(${node.freq})`;
    } else {
        html += `(${node.freq})`;
    }

    html += `</div>`;

    if (node.left || node.right) {
        html += `<div class="huffman-children">`;
        html += generateTreeHTML(node.left, level + 1, `${currentId}-left`);
        html += generateTreeHTML(node.right, level + 1, `${currentId}-right`);
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

function drawConnections(tree) {
    const svgLines = [];
    const nodes = document.querySelectorAll('.huffman-node-container');

    nodes.forEach(node => {
        const parentId = node.id;
        const parentElement = document.getElementById(parentId);
        const parentNode = parentElement?.querySelector('.huffman-node');

        const children = parentElement?.querySelector('.huffman-children')?.children;

        if (children) {
            Array.from(children).forEach(child => {
                const childNode = child.querySelector('.huffman-node');
                if (childNode) {
                    const parentRect = parentNode.getBoundingClientRect();
                    const childRect = childNode.getBoundingClientRect();

                    const x1 = parentRect.left + parentRect.width / 2;
                    const y1 = parentRect.top + parentRect.height;
                    const x2 = childRect.left + childRect.width / 2;
                    const y2 = childRect.top;

                    svgLines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="2"/>`);
                }
            });
        }
    });

    const svg = `<svg class="huffman-connections">${svgLines.join('')}</svg>`;
    document.body.insertAdjacentHTML('afterbegin', svg);
}

const css = `
    .huffman-node-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
    }

    .huffman-node {
        border: 1px solid black;
        display: inline-block;
        margin: 5px;
        padding: 10px;
        text-align: center;
        font-size: 14px;
        background-color: #f8f9fa;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        line-height: 40px;
        position: relative;
        z-index: 2;
    }

    .huffman-children {
        display: flex;
        justify-content: space-around;
        width: 100%;
    }

    .huffman-connections {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
    }
`;

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
                ${css}
            </style>
        </head>
        <body>
            <h1>Árvore de Huffman</h1>
            ${treeHTML}
            <script>
                (${drawConnections.toString()})();
            </script>
        </body>
        </html>
    `);

    newWindow.document.close();
}

function decompressText(encodedText, huffmanCodes) {
    const reverseCodes = Object.entries(huffmanCodes).reduce((acc, [char, code]) => {
        acc[code] = char;
        return acc;
    }, {});

    let currentCode = '';
    let decodedText = '';

    for (const bit of encodedText) {
        currentCode += bit;

        if (reverseCodes[currentCode]) {
            decodedText += reverseCodes[currentCode];
            currentCode = '';
        }
    }

    return decodedText;
}



