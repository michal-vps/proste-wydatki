import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 7007;

// Serve static files
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    console.log(req.rawHeaders); 
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/add-outcome", (req, res) => {
    console.log(req.rawHeaders); 
    res.sendFile(path.join(__dirname, "public", "addOutcome.html"));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});