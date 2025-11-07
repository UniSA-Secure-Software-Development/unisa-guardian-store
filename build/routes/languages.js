"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locales_json_1 = __importDefault(require("../data/static/locales.json"));
const fs = require("fs");
module.exports = function getLanguageList() {
    return (req, res, next) => {
        const languages = [];
        let count = 0;
        let enContent;
        fs.readFile('frontend/dist/frontend/assets/i18n/en.json', 'utf-8', (err, content) => {
            if (err != null) {
                next(new Error(`Unable to retrieve en.json language file: ${err.message}`));
            }
            enContent = JSON.parse(content);
            fs.readdir('frontend/dist/frontend/assets/i18n/', (err, languageFiles) => {
                if (err != null) {
                    next(new Error(`Unable to read i18n directory: ${err.message}`));
                }
                languageFiles.forEach((fileName) => {
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    fs.readFile('frontend/dist/frontend/assets/i18n/' + fileName, 'utf-8', async (err, content) => {
                        if (err != null) {
                            next(new Error(`Unable to retrieve ${fileName} language file: ${err.message}`));
                        }
                        const fileContent = JSON.parse(content);
                        const percentage = await calcPercentage(fileContent, enContent);
                        const key = fileName.substring(0, fileName.indexOf('.'));
                        const locale = locales_json_1.default.find((l) => l.key === key);
                        const lang = {
                            key: key,
                            lang: fileContent.LANGUAGE,
                            icons: locale === null || locale === void 0 ? void 0 : locale.icons,
                            shortKey: locale === null || locale === void 0 ? void 0 : locale.shortKey,
                            percentage: percentage,
                            gauge: (percentage > 90 ? 'full' : (percentage > 70 ? 'three-quarters' : (percentage > 50 ? 'half' : (percentage > 30 ? 'quarter' : 'empty'))))
                        };
                        if (!(fileName === 'en.json' || fileName === 'tlh_AA.json')) {
                            languages.push(lang);
                        }
                        count++;
                        if (count === languageFiles.length) {
                            languages.push({ key: 'en', icons: ['gb', 'us'], shortKey: 'EN', lang: 'English', percentage: 100, gauge: 'full' });
                            languages.sort((a, b) => a.lang.localeCompare(b.lang));
                            res.status(200).json(languages);
                        }
                    });
                });
            });
        });
        async function calcPercentage(fileContent, enContent) {
            const totalStrings = Object.keys(enContent).length;
            let differentStrings = 0;
            return await new Promise((resolve, reject) => {
                try {
                    for (const key in fileContent) {
                        if (Object.prototype.hasOwnProperty.call(fileContent, key) && fileContent[key] !== enContent[key]) {
                            differentStrings++;
                        }
                    }
                    resolve((differentStrings / totalStrings) * 100);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    };
};
//# sourceMappingURL=languages.js.map