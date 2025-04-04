import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

// reading what user type in form and then sent with button as POST
import bodyParser from "body-parser";

//init 'const' before 'use' section
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 7007;

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json());

// log details
app.use(morgan("tiny"));



// Serve static files
app.use(express.static(__dirname + "/public"));

// Strona glowna startowa - zwraca widok startowy
app.get("/home", (req, res) => {
    // console.log(req.rawHeaders); 
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Gdy user klika link na stronie startowej "Dodaj wydatek" - wtedy ten endpoint przejmuje GET i zwraca widok do dodania outcome
app.get("/add-outcome", (req, res) => {
    // console.log(req.rawHeaders); 
    res.sendFile(path.join(__dirname, "public", "addOutcome.html"));
});

// Przejmij dane z formularza gdy user klika "Save" i wywoluje POST. 
app.post("/add-outcome", (req, res) => {
    console.log("Nowy wydatek, kwota: " + req.body.outcomeAmount);
    console.log("Nowy wydatek, nazwa: " + req.body["outcomeName"]);

    res.sendFile(path.join(__dirname, "public", "seeTodayOutcomeList.html"));
});

// Podstawowy do uruchomienia serwera
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
 