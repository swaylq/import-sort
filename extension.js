// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { commands, window, Range, Position } = require('vscode');

const isImportLine = (line) => {
    const firstCharacter = getCharacter(line, 1);
    return firstCharacter === 'import';
};

const getCharacter = (line, index) => {
    const text = line.text;
    const arr = text.match(/\S+/g);
    if (!arr) return '';
    return arr[index - 1] || '';
};

const replaceLines = (document, editorBuilder, sIndex, eIndex) => {
    const lines = [];
    for (let i = sIndex; i <= eIndex; i ++) {
        lines.push(document.lineAt(i));
    }
    lines.sort((a, b) => {
        if (getCharacter(a, 2) < getCharacter(b, 2)) {
            return -1;
        }
        if (getCharacter(a, 2) > getCharacter(b, 2)) {
            return 1;
        }
        return 0;
    });
    const newLines = lines.reduce((pre, line) => pre += `${line.text}\n`, '');
    editorBuilder.replace(new Range(new Position(sIndex, 0), new Position(eIndex, document.lineAt(eIndex).text.length)), newLines.substring(0, newLines.length - 1));
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const activate = (context) => {
    console.log('Congratulations, your extension "import-sort" is now active!');
    const disposable = commands.registerCommand('extension.sort', () => {
        const editor = window.activeTextEditor;
        const document = editor.document;
        const lineNumber = document.lineCount;
        if (!editor) return;
        editor.edit((editorBuilder) => {
            let index = 0;
            let currentLine;
            let tempIndex = index;
            // todo: annotation ignore
            while (index < lineNumber) {
                currentLine = document.lineAt(index);                
                if (isImportLine(currentLine)) {
                    tempIndex = index;
                    while (isImportLine(currentLine) && index < lineNumber - 1) {
                        index += 1;
                        currentLine = document.lineAt(index);
                    }
                    // if it's not the end of line, index += 1
                    if (isImportLine(currentLine)) {
                        replaceLines(document, editorBuilder, tempIndex, index);
                    } else {
                        replaceLines(document, editorBuilder, tempIndex, index - 1);
                    }
                    index += 1;
                } else {
                    index += 1;
                }
            }
        })
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
const deactivate = () => {
    console.log('Extension "import-sort" is now deactivate');
}

exports.activate = activate;
exports.deactivate = deactivate;