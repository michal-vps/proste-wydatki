import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import bodyParser from "body-parser"; // reading what user type in form and then sent with button as POST
import { MongoClient, ServerApiVersion } from "mongodb";

//init 'const' before 'use' section
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 7007;
const outcomeTable = "wydatki";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("tiny")); // log details
app.use(express.static(__dirname + "/public")); // Serve static files


//MongoDB Config
const uri =
  "mongodb+srv://michal:MUXoMLT321@cluster0.re1zc8a.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//hold db instance in variable for futher use
let db;

//check db connection
async function connectWithMongo() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("You successfully connected to MongoDB!");
    db = client.db("Cluster0"); // or whatever your DB name is

  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // only exit if it actually failed
  }
}
connectWithMongo().catch(console.dir);

// ROUTES - 
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
app.post("/add-outcome", async (req, res) => {
  const name = req.body["outcomeName"];
  const amount = req.body["outcomeName"];
  try {
    await db.collection(outcomeTable).insertOne({
      name,
      amount,
      addedDate: new Date(),
    });
    res.sendFile(path.join(__dirname, "public", "seeTodayOutcomeList.html"));
  } catch (err) {
    console.error("Insert failed:", err);
    res.status(500).send("Something went wrong.");
  }
});

app.get("/lista-wydatkow", async (req, res) => {
    try {
        const records = await db.collection(outcomeTable).find({}).toArray();
        res.status(200).json(records);
      } catch (e) {
        console.error("Error fetch records:", e);
        res.status(500).json({ error: "Failed to fetch records" });
      }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// alternatywnie uruchom app tylko gdy DB jest ready
// Start app only after DB is ready
// connectWithMongo().then(() => {
//     app.listen(port, () => {
//       console.log(`🚀 Server running at http://localhost:${port}`);
//     });
//   });