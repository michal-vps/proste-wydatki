// CONSTRUCTION FUNCTION
// 1. START WITH UPPER CASE
const fs = require('node:fs/promises');

function AddOutcome(outcomeAmount, outcomeName){
    this.outcomeAmount = outcomeAmount;
    this.outcomeName = outcomeName;
    this.save = function (){
        console.log("Saving outcome in progress..")
        fs.writeFile("outcome.txt", "270;market", (err) => {
            if (err) throw err;
            console.log("File saved!");
        });
    }
    // this.outcomeDate = outcomeDate;
}