const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "src")));

app.use("/contracts", express.static(path.join(__dirname, "build/contracts")));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "admin.html"));
});

app.get("/doctor", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "doctor.html"));
});

app.get("/patient", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "patient.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║   🏥 MedChain - Dossiers Médicaux Décentralisés         ║
  ║                                                          ║
  ║   Serveur démarré sur : http://localhost:${PORT}         ║
  ║                                                          ║
  ║   Pages:                                                 ║
  ║     /        → Inscription Patient                       ║
  ║     /admin   → Administration                            ║
  ║     /doctor  → Espace Médecin                            ║
  ║     /patient → Espace Patient                            ║
  ║                                                          ║
  ║   Assurez-vous que Ganache est lancé sur le port 7545    ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});
