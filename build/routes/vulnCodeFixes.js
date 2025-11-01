"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCorrectFix = exports.serveCodeFixes = exports.readFixes = void 0;
const accuracy = require('../lib/accuracy');
const challengeUtils = require('../lib/challengeUtils');
const fs = require('fs');
const yaml = require('js-yaml');
const FixesDir = 'data/static/codefixes';
const CodeFixes = {};
const readFixes = (key) => {
    if (CodeFixes[key]) {
        return CodeFixes[key];
    }
    const files = fs.readdirSync(FixesDir);
    const fixes = [];
    let correct = -1;
    for (const file of files) {
        if (file.startsWith(`${key}_`)) {
            const fix = fs.readFileSync(`${FixesDir}/${file}`).toString();
            const metadata = file.split('_');
            const number = metadata[1];
            fixes.push(fix);
            if (metadata.length === 3) {
                correct = parseInt(number, 10);
                correct--;
            }
        }
    }
    CodeFixes[key] = {
        fixes: fixes,
        correct: correct
    };
    return CodeFixes[key];
};
exports.readFixes = readFixes;
const serveCodeFixes = () => (req, res, next) => {
    const key = req.params.key;
    const fixData = (0, exports.readFixes)(key);
    if (fixData.fixes.length === 0) {
        res.status(404).json({
            error: 'No fixes found for the snippet!'
        });
        return;
    }
    res.status(200).json({
        fixes: fixData.fixes
    });
};
exports.serveCodeFixes = serveCodeFixes;
const checkCorrectFix = () => async (req, res, next) => {
    const key = req.body.key;
    const selectedFix = req.body.selectedFix;
    const fixData = (0, exports.readFixes)(key);
    if (fixData.fixes.length === 0) {
        res.status(404).json({
            error: 'No fixes found for the snippet!'
        });
    }
    else {
        let explanation;
        if (fs.existsSync('./data/static/codefixes/' + key + '.info.yml')) {
            const codingChallengeInfos = yaml.load(fs.readFileSync('./data/static/codefixes/' + key + '.info.yml', 'utf8'));
            const selectedFixInfo = codingChallengeInfos === null || codingChallengeInfos === void 0 ? void 0 : codingChallengeInfos.fixes.find(({ id }) => id === selectedFix + 1);
            if (selectedFixInfo === null || selectedFixInfo === void 0 ? void 0 : selectedFixInfo.explanation)
                explanation = res.__(selectedFixInfo.explanation);
        }
        if (selectedFix === fixData.correct) {
            await challengeUtils.solveFixIt(key);
            res.status(200).json({
                verdict: true,
                explanation
            });
        }
        else {
            accuracy.storeFixItVerdict(key, false);
            res.status(200).json({
                verdict: false,
                explanation
            });
        }
    }
};
exports.checkCorrectFix = checkCorrectFix;
//# sourceMappingURL=vulnCodeFixes.js.map