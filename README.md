<p align="center">
  <img src="src/icon.png" alt="MedChain Logo" width="120" />
</p>

<h1 align="center">🏥 MedChain</h1>

<p align="center">
  <strong>Système Décentralisé de Gestion des Dossiers Médicaux sur Blockchain</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-^0.8.19-363636?style=for-the-badge&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?style=for-the-badge&logo=ethereum" alt="Ethereum" />
  <img src="https://img.shields.io/badge/Truffle-Framework-5E464D?style=for-the-badge&logo=truffle" alt="Truffle" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Web3.js-1.10.0-F16822?style=for-the-badge&logo=web3.js" alt="Web3.js" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <em>Projet académique — EMSI 4CIR · Blockchain & Sécurité</em>
</p>

---

## 📋 Table des Matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack Technologique](#-stack-technologique)
- [Prérequis](#-prérequis)
- [Installation & Déploiement](#-installation--déploiement)
- [Utilisation](#-utilisation)
- [Smart Contract](#-smart-contract)
- [Tests](#-tests)
- [Structure du Projet](#-structure-du-projet)
- [Sécurité](#-sécurité)
- [Auteur](#-auteur)
- [Licence](#-licence)

---

## 🎯 Présentation

**MedChain** est une application décentralisée (DApp) qui révolutionne la gestion des dossiers médicaux en exploitant la puissance de la blockchain Ethereum. Le système garantit la **confidentialité**, l'**intégrité** et la **traçabilité** des données médicales tout en plaçant le patient au centre du contrôle de ses informations de santé.

### Problématique

Les systèmes traditionnels de gestion des dossiers médicaux souffrent de :
- 🔓 **Vulnérabilité** aux modifications non autorisées
- 🏢 **Centralisation** excessive des données sensibles
- 🚫 **Manque de contrôle** du patient sur ses propres données
- 📊 **Absence de traçabilité** des accès aux dossiers

### Solution MedChain

MedChain répond à ces défis grâce à un smart contract Ethereum qui :
- ✅ Rend les dossiers **immuables** et **infalsifiables**
- ✅ **Décentralise** le stockage des données
- ✅ Donne au patient le **contrôle total** sur les permissions d'accès
- ✅ Enregistre un **journal d'audit** complet de tous les accès

---

## ✨ Fonctionnalités

### 👨‍💼 Administrateur
| Fonctionnalité | Description |
|---|---|
| Enregistrement des médecins | Ajout de médecins avec nom, spécialité et hôpital |
| Tableau de bord | Vue d'ensemble : nombre de patients, médecins et dossiers |
| Supervision | Consultation de la liste complète des patients et médecins |

### 👨‍⚕️ Médecin
| Fonctionnalité | Description |
|---|---|
| Ajout de dossiers | Création de dossiers médicaux (diagnostic, traitement, médicaments, notes) |
| Consultation | Accès aux dossiers des patients ayant accordé la permission |
| Profil | Visualisation de ses informations professionnelles |

### 🧑‍🤝‍🧑 Patient
| Fonctionnalité | Description |
|---|---|
| Auto-inscription | Enregistrement autonome avec nom, date de naissance et groupe sanguin |
| Gestion des accès | Accorder / Révoquer l'accès à un médecin spécifique |
| Consultation | Visualisation de ses propres dossiers médicaux |
| Journal d'audit | Historique complet des accès accordés et révoqués |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/CSS/JS)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  index   │  │  admin   │  │  doctor  │  │ patient │ │
│  │  (Login) │  │  (Panel) │  │  (Panel) │  │ (Panel) │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └──────────────┴──────────────┴─────────────┘     │
│                          │                               │
│                    web3-init.js                          │
│              (Web3 + Contract ABI)                       │
├─────────────────────────────────────────────────────────┤
│                  EXPRESS.JS SERVER (:3000)               │
│              Routing + Static File Serving               │
├─────────────────────────────────────────────────────────┤
│                   WEB3.JS PROVIDER                       │
│              Connection à Ganache (RPC)                  │
├─────────────────────────────────────────────────────────┤
│              ETHEREUM BLOCKCHAIN (GANACHE)               │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Smart Contract: MedicalRecords.sol       │  │
│  │                                                    │  │
│  │  • Structs: Patient, Doctor, Record, AccessLog    │  │
│  │  • Modifiers: onlyAdmin, onlyDoctor, onlyPatient  │  │
│  │  • Events: Registered, RecordAdded, Access*       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Stack Technologique

| Couche | Technologie | Rôle |
|---|---|---|
| **Smart Contract** | Solidity `^0.8.19` | Logique métier décentralisée |
| **Blockchain** | Ethereum (Ganache) | Réseau blockchain local |
| **Framework** | Truffle `^5.11.5` | Compilation, migration, tests |
| **Backend** | Node.js + Express `^4.18.2` | Serveur web & routing |
| **Frontend** | HTML5, CSS3, JavaScript | Interface utilisateur |
| **Web3** | Web3.js `^1.10.0` | Interaction avec la blockchain |
| **Tests** | Chai `^4.3.10` | Framework de test unitaire |
| **Typographie** | Inter, Space Grotesk | Design moderne |

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **[Node.js](https://nodejs.org/)** (v16 ou supérieur)
- **[Ganache](https://trufflesuite.com/ganache/)** (Interface graphique ou CLI)
- **[Truffle](https://trufflesuite.com/truffle/)** — Installé globalement :
  ```bash
  npm install -g truffle
  ```

---

## 🚀 Installation & Déploiement

### 1. Cloner le dépôt

```bash
git clone https://github.com/Soufianekhaddi/MedChain.git
cd MedChain
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer Ganache

Démarrez Ganache sur le port **7545** (configuration par défaut) :
- **Ganache GUI** : Créer un nouveau workspace → Port `7545`
- **Ganache CLI** :
  ```bash
  ganache --port 7545
  ```

### 4. Compiler & Déployer le Smart Contract

```bash
# Compiler le contrat
truffle compile

# Déployer sur Ganache
truffle migrate --reset
```

### 5. Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur **http://localhost:3000** 🎉

---

## 💻 Utilisation

### Pages de l'application

| Route | Page | Description |
|---|---|---|
| `/` | Connexion Patient | Authentification par nom, date de naissance et groupe sanguin |
| `/admin` | Panel Admin | Gestion des médecins, tableau de bord, statistiques |
| `/doctor` | Espace Médecin | Ajout et consultation de dossiers médicaux |
| `/patient` | Espace Patient | Gestion des accès, visualisation des dossiers |

### Workflow typique

```
1. Admin ──────► Enregistre un médecin
2. Patient ────► S'inscrit (auto-enregistrement)
3. Patient ────► Accorde l'accès au médecin
4. Médecin ────► Crée un dossier médical
5. Patient ────► Consulte ses dossiers
6. Patient ────► Révoque l'accès si nécessaire
```

---

## 📜 Smart Contract

### `MedicalRecords.sol`

Le smart contract est le cœur de MedChain. Il définit :

#### Structures de données

| Struct | Champs | Description |
|---|---|---|
| `Patient` | name, dateOfBirth, bloodGroup, address, exists, registeredAt | Profil patient |
| `Doctor` | name, specialty, hospital, address, exists, registeredAt | Profil médecin |
| `Record` | id, patient, doctor, diagnosis, treatment, medication, notes, createdAt | Dossier médical |
| `AccessLog` | doctor, grantedAt, revokedAt, isActive | Journal d'accès |

#### Fonctions principales

```solidity
// Inscription
registerPatient(name, dateOfBirth, bloodGroup)    // Auto-inscription patient
registerDoctor(address, name, specialty, hospital) // Admin uniquement

// Dossiers médicaux
addRecord(patient, diagnosis, treatment, medication, notes) // Médecin autorisé
getRecord(patient, index)                                    // Lecture contrôlée
getRecordCount(patient)                                      // Compteur

// Contrôle d'accès
grantAccess(doctor)      // Patient accorde l'accès
revokeAccess(doctor)     // Patient révoque l'accès
checkAccess(patient, doctor) // Vérification

// Rôles
getRole(address)  // 0=inconnu, 1=admin, 2=médecin, 3=patient
```

#### Modificateurs de sécurité

- `onlyAdmin` — Restreint aux administrateurs
- `onlyDoctor` — Restreint aux médecins enregistrés
- `onlyPatient` — Restreint aux patients enregistrés
- `patientExists` — Vérifie l'existence du patient
- `doctorExists` — Vérifie l'existence du médecin
- `hasAccess` — Vérifie les permissions d'accès

---

## 🧪 Tests

Le projet inclut une suite de tests complète couvrant tous les aspects du smart contract :

```bash
truffle test
```

### Couverture des tests

| Catégorie | Tests | Description |
|---|---|---|
| **Deployment** | 1 | Vérification de l'admin déployeur |
| **Doctor Registration** | 3 | Enregistrement, restrictions, doublons |
| **Patient Registration** | 2 | Auto-inscription, conflits de rôle |
| **Access Control** | 3 | Accord, révocation, refus d'accès |
| **Medical Records** | 4 | Création, stockage, lecture, autorisation |
| **Role Detection** | 1 | Détection des rôles (admin, médecin, patient, inconnu) |
| **Statistics** | 1 | Compteurs de patients et médecins |

---

## 📂 Structure du Projet

```
MedChain/
├── contracts/
│   └── MedicalRecords.sol      # Smart contract Solidity
├── migrations/
│   └── 1_deploy_contracts.js   # Script de déploiement Truffle
├── src/
│   ├── css/
│   │   └── style.css           # Styles globaux (glassmorphism, animations)
│   ├── js/
│   │   ├── web3-init.js        # Initialisation Web3 + ABI loading
│   │   ├── admin.js            # Logique du panel administrateur
│   │   ├── doctor.js           # Logique de l'espace médecin
│   │   └── patient.js          # Logique de l'espace patient
│   ├── index.html              # Page de connexion patient
│   ├── admin.html              # Panel d'administration
│   ├── doctor.html             # Interface médecin
│   ├── patient.html            # Interface patient
│   ├── icon.png                # Logo MedChain
│   └── icon1.png               # Logo alternatif
├── test/
│   └── medicalRecords.test.js  # Suite de tests (15 tests)
├── server.js                   # Serveur Express.js
├── truffle-config.js           # Configuration Truffle + Solc
├── package.json                # Dépendances NPM
└── .gitignore                  # Fichiers exclus du versioning
```

---

## 🔒 Sécurité

MedChain intègre plusieurs mécanismes de sécurité :

- **Contrôle d'accès basé sur les rôles (RBAC)** — Chaque fonction est protégée par des `modifiers` Solidity
- **Permissions granulaires** — Le patient décide qui peut accéder à ses données
- **Immuabilité des dossiers** — Les dossiers médicaux ne peuvent pas être modifiés une fois créés
- **Journal d'audit complet** — Chaque accès accordé/révoqué est horodaté sur la blockchain
- **Séparation des rôles** — Un compte ne peut pas être simultanément admin, médecin et patient
- **Optimisation du compilateur** — Solc optimizer activé (200 runs) pour des coûts de gas réduits

---

## 👨‍💻 Auteur

**Soufiane Khaddi** — Étudiant en 4ème année Cycle Ingénieur (4CIR) à l'EMSI

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<p align="center">
  <strong>⛓️ Construit avec la Blockchain · Sécurisé par le Chiffrement · Centré sur le Patient</strong>
</p>
