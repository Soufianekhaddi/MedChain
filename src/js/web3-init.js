const MedChain = {
  web3: null,
  contract: null,
  accounts: [],
  currentAccount: null,
  currentRole: 0, // 0=unknown, 1=admin, 2=doctor, 3=patient

  /**
   * Initialize Web3, load contract, load accounts, update UI
   * @param {Object} opts - { onReady: async function, expectedRole: number|null }
   */
  init: async function (opts = {}) {
    try {
      await MedChain.initWeb3();
      await MedChain.loadContract();
      await MedChain.loadAccounts();
      MedChain.bindCommonEvents();
      MedChain.hideLoading();

      if (opts.onReady) {
        await opts.onReady();
      }
    } catch (err) {
      console.error("Erreur d'initialisation:", err);
      MedChain.hideLoading();
      MedChain.showToast("Erreur: Vérifiez que Ganache est lancé sur le port 7545", "error");
    }
  },

  initWeb3: async function () {
    MedChain.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    const isConnected = await MedChain.web3.eth.net.isListening();
    if (!isConnected) throw new Error("Cannot connect to Ganache");

    const dot = document.getElementById("network-dot");
    if (dot) dot.classList.remove("disconnected");

    const blockNum = await MedChain.web3.eth.getBlockNumber();
    const blockEl = document.getElementById("block-number");
    if (blockEl) blockEl.textContent = blockNum;
  },

  loadContract: async function () {
    const response = await fetch("/contracts/MedicalRecords.json");
    const artifact = await response.json();
    const networkId = await MedChain.web3.eth.net.getId();
    const deployed = artifact.networks[networkId];
    if (!deployed) {
      MedChain.showToast("Contrat non déployé. Exécutez: truffle migrate --reset", "error");
      return;
    }
    MedChain.contract = new MedChain.web3.eth.Contract(artifact.abi, deployed.address);
    const addrShort = deployed.address.slice(0, 8) + "..." + deployed.address.slice(-6);
    const contractEl = document.getElementById("contract-address");
    if (contractEl) contractEl.textContent = "Contrat: " + addrShort;
  },

  getExpectedRoleForPage: function () {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const pageRoleMap = {
      "/admin": 1,
      "/doctor": 2,
      "/patient": 3,
      "/": 0,
    };
    return pageRoleMap[path] !== undefined ? pageRoleMap[path] : 0;
  },

  loadAccounts: async function () {
    MedChain.accounts = await MedChain.web3.eth.getAccounts();
    const select = document.getElementById("account-select");
    if (!select) return;

    const expectedRole = MedChain.getExpectedRoleForPage();

    select.innerHTML = "";

    if (expectedRole === 0) {
      MedChain.accounts.forEach((acc, i) => {
        const opt = document.createElement("option");
        opt.value = acc;
        const short = acc.slice(0, 8) + "..." + acc.slice(-4);
        opt.textContent = `Compte ${i} (${short})`;
        select.appendChild(opt);
      });
    } else {
      for (let i = 0; i < MedChain.accounts.length; i++) {
        const acc = MedChain.accounts[i];
        try {
          const role = await MedChain.contract.methods.getRole(acc).call();
          if (parseInt(role) === expectedRole) {
            const opt = document.createElement("option");
            opt.value = acc;
            const short = acc.slice(0, 8) + "..." + acc.slice(-4);
            opt.textContent = `Compte ${i} (${short})`;
            select.appendChild(opt);
          }
        } catch (e) {
          console.error("Error checking role for account", i, e);
        }
      }
    }

    const saved = sessionStorage.getItem("medchain_account");
    const validOptions = Array.from(select.options).map(o => o.value);

    if (saved && validOptions.includes(saved)) {
      select.value = saved;
      MedChain.currentAccount = saved;
    } else if (validOptions.length > 0) {
      select.value = validOptions[0];
      MedChain.currentAccount = validOptions[0];
    } else {
      MedChain.currentAccount = MedChain.accounts[0];
      if (expectedRole !== 0) {
        MedChain.showToast("Aucun compte avec le rôle requis trouvé", "error");
      }
    }

    await MedChain.onAccountChange();
  },

  bindCommonEvents: function () {
    const select = document.getElementById("account-select");
    if (select) {
      select.addEventListener("change", async (e) => {
        MedChain.currentAccount = e.target.value;
        sessionStorage.setItem("medchain_account", MedChain.currentAccount);
        await MedChain.onAccountChange();
      });
    }

    const toggle = document.getElementById("sidebar-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("open");
      });
    }
  },

  onAccountChange: async function () {
    if (!MedChain.contract) return;
    try {
      const role = await MedChain.contract.methods.getRole(MedChain.currentAccount).call();
      MedChain.currentRole = parseInt(role);
      MedChain.updateRoleBadge();
      MedChain.updateBalance();
      MedChain.redirectIfNeeded();
    } catch (err) {
      console.error("Erreur getRole:", err);
    }
  },

  redirectIfNeeded: function () {
    const currentPage = window.location.pathname;
    const normalize = (p) => p.replace(/\/+$/, "") || "/";
    const current = normalize(currentPage);

    if (current === "/") return;

    const expectedRole = MedChain.getExpectedRoleForPage();

    if (expectedRole !== 0 && MedChain.currentRole !== expectedRole) {
      const rolePageMap = {
        0: "/",
        1: "/admin",
        2: "/doctor",
        3: "/patient",
      };
      const correctPage = rolePageMap[MedChain.currentRole] || "/";
      sessionStorage.setItem("medchain_account", MedChain.currentAccount);
      window.location.href = correctPage;
    }
  },

  updateRoleBadge: function () {
    const badge = document.getElementById("role-badge");
    if (!badge) return;
    badge.className = "role-badge";
    const roles = {
      0: ["Nouveau", "role-unknown"],
      1: ["Administrateur", "role-admin"],
      2: ["Médecin", "role-doctor"],
      3: ["Patient", "role-patient"],
    };
    const [text, cls] = roles[MedChain.currentRole] || roles[0];
    badge.textContent = text;
    badge.classList.add(cls);
  },

  updateBalance: async function () {
    const el = document.getElementById("account-balance");
    if (!el) return;
    const bal = await MedChain.web3.eth.getBalance(MedChain.currentAccount);
    const eth = parseFloat(MedChain.web3.utils.fromWei(bal, "ether")).toFixed(2);
    el.textContent = eth;
  },

  showToast: function (message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  },

  hideLoading: function () {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
      setTimeout(() => overlay.classList.add("hidden"), 800);
    }
  },

  extractError: function (err) {
    if (err.message && err.message.includes("revert")) {
      const match = err.message.match(/revert (.+?)(?:"|$)/);
      return match ? match[1] : "Transaction rejetée";
    }
    return err.message ? err.message.substring(0, 100) : "Erreur inconnue";
  },

  closeModal: function () {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("active");
  },

  renderRecordCard: function (r, docName, date) {
    return `<div class="record-card">
      <div class="record-header">
        <span class="record-id">Dossier #${r.id}</span>
        <span class="record-date">📅 ${date}</span>
      </div>
      <div class="record-body">
        <div class="record-field"><label>Diagnostic</label><span>${r.diagnosis}</span></div>
        <div class="record-field"><label>Traitement</label><span>${r.treatment}</span></div>
        <div class="record-field"><label>Médicaments</label><span>${r.medication}</span></div>
        <div class="record-field"><label>Médecin</label><span>${docName}</span></div>
        <div class="record-field full"><label>Notes</label><span>${r.notes}</span></div>
      </div>
    </div>`;
  },
};
