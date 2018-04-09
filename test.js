let xml2js = require('xml2js');
let fs = require('fs');
let jsonBuilder = new xml2js.Builder({
    rootName: 'bean',
    xmldec: {
        version: '1.0',
        'encoding': 'GBK',
        'standalone': false
    }
});
let xmlParser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

let basePath = 'data/';
let destdir = "data1/";
let sourceLanguage;
let sourceLanguageFile = 'OfficialSite.xml';
let languageFiles;

getObjectFromFile(basePath + sourceLanguageFile).then((result) => {
    sourceLanguage = result;
    return getFileNames(basePath);
}).then((result) => {
    languageFiles = result;
    for (let item of languageFiles) {
        dealLanguage(item);
    }
});

function dealLanguage(filename) {
    getObjectFromFile(basePath + filename).then((result) => {
        let language = {
            "localizationDictionary": {
                "$": {
                    "culture": result["localizationDictionary"]["$"]["culture"]
                },
                "texts": {
                    "text": []
                }
            }
        };
        for (let item of sourceLanguage["localizationDictionary"]["texts"]["text"]) {
            value = getItemValue(result["localizationDictionary"]["texts"]["text"], item["$"]["name"]);
            if (value) {
                language["localizationDictionary"]["texts"]["text"].push({
                    "_": value,
                    "$": {
                        "name": item["$"]["name"]
                    }
                })
            } else {
                value = item["$"]["value"] ? item["$"]["value"] : item["_"];
                language["localizationDictionary"]["texts"]["text"].push({
                    "_": value,
                    "$": {
                        "name": item["$"]["name"]
                    }
                })
            }
        }
        fs.writeFileSync(destdir + filename, jsonBuilder.buildObject(JSON.parse(JSON.stringify(language))));
    });
}

function getItemValue(array, name) {
    for (let item of array) {
        if (item["$"]["name"] === name) {
            let value = item["$"]["value"]
            return value ? value : item["_"];
        }
    }
    return undefined;
}

function getObjectFromFile(filename) {
    return new Promise((resolve) => {
        let sourceBuffer = fs.readFileSync(filename, 'utf-8');
        xmlParser.parseString(sourceBuffer, function (err, result) {
            resolve(result);
        });
    });
}

function getFileNames(path) {
    return new Promise((resolve) => {
        let result = [];
        let files = fs.readdir(path, function (error, files) {
            files.forEach((file) => {
                result.push(file);
            });
            resolve(result);
        });
    })
}

