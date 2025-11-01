"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkData = exports.seePatch = exports.readFiles = exports.getDataFromFile = exports.writeToFile = exports.checkDiffs = void 0;
const vulnCodeSnippet_1 = require("../routes/vulnCodeSnippet");
const Diff = require('diff');
const fs = require('fs');
const fixesPath = 'data/static/codefixes';
const cacheFile = 'rsn/cache.json';
const colors = require('colors/safe');
function readFiles() {
    const files = fs.readdirSync(fixesPath);
    const keys = files.filter((file) => file.endsWith('.ts'));
    return keys;
}
exports.readFiles = readFiles;
function writeToFile(json) {
    fs.writeFileSync(cacheFile, JSON.stringify(json, null, '\t'));
}
exports.writeToFile = writeToFile;
function getDataFromFile() {
    const data = fs.readFileSync(cacheFile).toString();
    return JSON.parse(data);
}
exports.getDataFromFile = getDataFromFile;
function filterString(text) {
    text = text.replace(/\r/g, '');
    return text;
}
const checkDiffs = async (keys) => {
    const data = keys.reduce((prev, curr) => {
        return {
            ...prev,
            [curr]: {
                added: [],
                removed: []
            }
        };
    }, {});
    for (const val of keys) {
        await (0, vulnCodeSnippet_1.retrieveCodeSnippet)(val.split('_')[0], true)
            .then(snippet => {
            process.stdout.write(val + ': ');
            const fileData = fs.readFileSync(fixesPath + '/' + val).toString();
            const diff = Diff.diffLines(filterString(fileData), filterString(snippet.snippet));
            let line = 0;
            for (const part of diff) {
                if (part.removed)
                    continue;
                const prev = line;
                line += part.count;
                if (!(part.added))
                    continue;
                for (let i = 0; i < part.count; i++) {
                    if (!snippet.vulnLines.includes(prev + i + 1) && !snippet.neutralLines.includes(prev + i + 1)) {
                        process.stdout.write(colors.red.inverse(prev + i + 1 + ''));
                        process.stdout.write(' ');
                        data[val].added.push(prev + i + 1);
                    }
                    else if (snippet.vulnLines.includes(prev + i + 1)) {
                        process.stdout.write(colors.red.bold(prev + i + 1 + ' '));
                    }
                    else if (snippet.neutralLines.includes(prev + i + 1)) {
                        process.stdout.write(colors.red(prev + i + 1 + ' '));
                    }
                }
            }
            line = 0;
            let norm = 0;
            for (const part of diff) {
                if (part.added) {
                    norm--;
                    continue;
                }
                const prev = line;
                line += part.count;
                if (!(part.removed))
                    continue;
                let temp = norm;
                for (let i = 0; i < part.count; i++) {
                    if (!snippet.vulnLines.includes(prev + i + 1 - norm) && !snippet.neutralLines.includes(prev + i + 1 - norm)) {
                        process.stdout.write(colors.green.inverse((prev + i + 1 - norm + '')));
                        process.stdout.write(' ');
                        data[val].removed.push(prev + i + 1 - norm);
                    }
                    else if (snippet.vulnLines.includes(prev + i + 1 - norm)) {
                        process.stdout.write(colors.green.bold(prev + i + 1 - norm + ' '));
                    }
                    else if (snippet.neutralLines.includes(prev + i + 1 - norm)) {
                        process.stdout.write(colors.green(prev + i + 1 - norm + ' '));
                    }
                    temp++;
                }
                norm = temp;
            }
            process.stdout.write('\n');
        })
            .catch(err => {
            console.log(err);
        });
    }
    return data;
};
exports.checkDiffs = checkDiffs;
async function seePatch(file) {
    const fileData = fs.readFileSync(fixesPath + '/' + file).toString();
    const snippet = await (0, vulnCodeSnippet_1.retrieveCodeSnippet)(file.split('_')[0], true);
    const patch = Diff.structuredPatch(file, file, filterString(snippet.snippet), filterString(fileData));
    console.log(colors.bold(file + '\n'));
    for (const hunk of patch.hunks) {
        for (const line of hunk.lines) {
            if (line[0] === '-') {
                console.log(colors.red(line));
            }
            else if (line[0] === '+') {
                console.log(colors.green(line));
            }
            else {
                console.log(line);
            }
        }
    }
    console.log('---------------------------------------');
}
exports.seePatch = seePatch;
function checkData(data, fileData) {
    const filesWithDiff = [];
    for (const key in data) {
        const fileDataValueAdded = fileData[key].added.sort((a, b) => a - b);
        const dataValueAdded = data[key].added.sort((a, b) => a - b);
        const fileDataValueRemoved = fileData[key].added.sort((a, b) => a - b);
        const dataValueAddedRemoved = data[key].added.sort((a, b) => a - b);
        if (fileDataValueAdded.length === dataValueAdded.length && fileDataValueRemoved.length === dataValueAddedRemoved.length) {
            if (!dataValueAdded.every((val, ind) => fileDataValueAdded[ind] === val)) {
                console.log(colors.red(key));
                filesWithDiff.push(key);
            }
            if (!dataValueAddedRemoved.every((val, ind) => fileDataValueRemoved[ind] === val)) {
                console.log(colors.red(key));
                filesWithDiff.push(key);
            }
        }
        else {
            console.log(colors.red(key));
            filesWithDiff.push(key);
        }
    }
    return filesWithDiff;
}
exports.checkData = checkData;
//# sourceMappingURL=rsnUtil.js.map