import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import bodyParser from "body-parser"; // reading what user type in form and then sent with button as POST
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { format, differenceInCalendarDays, isValid } from "date-fns";
import { pl } from "date-fns/locale"; //do polskiego jezyka

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
  const amount = req.body["outcomeAmount"];
  try {
    await addOutcomeToMongo(name, amount);
    res.redirect("/outcome-list");
  } catch (err) {
    console.error("Insert failed:", err);
    res.status(500).send("Something went wrong.");
  }
});

app.get("/outcome-list", async (req, res) => {
  try {
    const expensesList = await db
      .collection(outcomeTable)
      .find({})
      .sort({ _id: -1 })
      .toArray();
    console.log(expensesList);
    const formattedRecords = expensesList.map((record) => {
      const date = new Date(record.addedDate);

      return {
        ...record,
        formattedDate: formatPolishRelativeDate(date),
      };
    });

    res.render("expenseList.ejs", {
      data: formattedRecords,
    });
  } catch (e) {
    console.error("Error fetch records:", e);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

app.get("/remove-expense/:id", async (req, res) => {
  const outcomeId = req.params.id;

  try {
    const result = await db
      .collection(outcomeTable)
      .deleteOne({ _id: new ObjectId(outcomeId) });

    if (result.deletedCount === 0) {
      console.warn("No document found with ID:", outcomeId);
      return res.status(404).json({
        error: `Nie znaleziono rekordu z ID: ${outcomeId}`,
      });
    }

    console.log("Usunięto dokument:", outcomeId);
    res.redirect("/outcome-list");
  } catch (error) {
    console.error("Błąd przy usuwaniu:", error);
    res.status(500).json({ error: "Wystąpił błąd podczas usuwania." });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function addOutcomeToMongo(name, amount) {
  await db.collection(outcomeTable).insertOne({
    name,
    amount,
    addedDate: new Date(),
  });
}

function formatPolishRelativeDate(date) {
  if (!isValid(date)) return "Brak daty";

  const daysAgo = differenceInCalendarDays(new Date(), date);

  if (daysAgo === 0) return "dziś";
  if (daysAgo === 1) return "wczoraj";
  if (daysAgo === 2) return "przedwczoraj";
  if (daysAgo === 3) return `${daysAgo} dni temu`;

  return format(date, "d MMMM", { locale: pl }); // optionally add 'HH:mm' or year if needed
}

// alternatywnie uruchom app tylko gdy DB jest ready
// Start app only after DB is ready
// connectWithMongo().then(() => {
//     app.listen(port, () => {
//       console.log(`🚀 Server running at http://localhost:${port}`);
//     });
//   });