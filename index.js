const fs = require('node:fs/promises');

fs.writeFile("outcome.txt", "270;market", (err) => {
    if (err) throw err;
    console.log("File saved!");
});