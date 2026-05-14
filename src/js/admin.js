const AdminApp = {

  init: async function () {
    await MedChain.init({
      onReady: async () => {
        const docForm = document.getElementById("register-doctor-form");
        if (docForm) {
          docForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await AdminApp.registerDoctor();
          });
        }
        const patForm = document.getElementById("register-patient-form");
        if (patForm) {
          patForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await AdminApp.registerPatient();
          });
        }
        await AdminApp.loadDashboard();
      },
    });
  },

  loadDashboard: async function () {
    try {
      const docCount = await MedChain.contract.methods.getDoctorCount().call();
      const patCount = await MedChain.contract.methods.getPatientCount().call();
      let recCount = 0;
      try {
        recCount = await MedChain.contract.methods.getTotalRecordCount().call({ from: MedChain.currentAccount });
      } catch (e) {}
      const blockNum = await MedChain.web3.eth.getBlockNumber();

      document.getElementById("stat-doctors").textContent = docCount;
      document.getElementById("stat-patients").textContent = patCount;
      document.getElementById("stat-records").textContent = recCount;
      document.getElementById("stat-blocks").textContent = blockNum;

      const blockEl = document.getElementById("block-number");
      if (blockEl) blockEl.textContent = blockNum;

      AdminApp.loadDoctorsList();
      AdminApp.loadPatientsList();
      AdminApp.populateAvailableAccounts();
    } catch (err) {
      console.error("Erreur loadDashboard:", err);
    }
  },
  populateAvailableAccounts: async function () {
    const docSelect = document.getElementById("doc-address");
    const patSelect = document.getElementById("pat-address");

    if (docSelect) docSelect.innerHTML = '<option value="">Sélectionner un compte...</option>';
    if (patSelect) patSelect.innerHTML = '<option value="">Sélectionner un compte...</option>';

    for (let i = 0; i < MedChain.accounts.length; i++) {
      const role = await MedChain.contract.methods.getRole(MedChain.accounts[i]).call();
      if (parseInt(role) === 0) {
        const label = `Compte ${i} (${MedChain.accounts[i].slice(0, 10)}...)`;
        if (docSelect) {
          const opt = document.createElement("option");
          opt.value = MedChain.accounts[i];
          opt.textContent = label;
          docSelect.appendChild(opt);
        }
        if (patSelect) {
          const opt = document.createElement("option");
          opt.value = MedChain.accounts[i];
          opt.textContent = label;
          patSelect.appendChild(opt);
        }
      }
    }
  },

  registerDoctor: async function () {
    const addr = document.getElementById("doc-address").value;
    const name = document.getElementById("doc-name").value;
    const spec = document.getElementById("doc-specialty").value;
    const hosp = document.getElementById("doc-hospital").value;
    if (!addr || !name || !spec || !hosp) return MedChain.showToast("Veuillez remplir tous les champs", "error");

    try {
      MedChain.showToast("Transaction en cours...", "info");
      await MedChain.contract.methods.registerDoctor(addr, name, spec, hosp).send({ from: MedChain.currentAccount, gas: 500000 });
      MedChain.showToast(`Dr. ${name} enregistré avec succès!`, "success");
      document.getElementById("register-doctor-form").reset();
      AdminApp.loadDashboard();
    } catch (err) {
      console.error(err);
      MedChain.showToast("Erreur: " + MedChain.extractError(err), "error");
    }
  },

  registerPatient: async function () {
    const addr = document.getElementById("pat-address").value;
    const name = document.getElementById("pat-name").value;
    const dob = document.getElementById("pat-dob").value;
    const blood = document.getElementById("pat-blood").value;
    if (!addr || !name || !dob || !blood) return MedChain.showToast("Veuillez remplir tous les champs", "error");

    try {
      MedChain.showToast("Transaction en cours...", "info");
      await MedChain.contract.methods.registerPatient(name, dob, blood).send({ from: addr, gas: 500000 });
      MedChain.showToast(`Patient ${name} enregistré avec succès!`, "success");
      document.getElementById("register-patient-form").reset();
      AdminApp.loadDashboard();
    } catch (err) {
      console.error(err);
      MedChain.showToast("Erreur: " + MedChain.extractError(err), "error");
    }
  },

  loadDoctorsList: async function () {
    const tbody = document.getElementById("doctors-tbody");
    if (!tbody) return;
    try {
      const count = await MedChain.contract.methods.getDoctorCount().call();
      if (parseInt(count) === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aucun médecin enregistré</td></tr>';
        return;
      }
      tbody.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const addr = await MedChain.contract.methods.getDoctorAddress(i).call();
        const info = await MedChain.contract.methods.getDoctorInfo(addr).call();
        const date = new Date(parseInt(info.registeredAt) * 1000).toLocaleDateString("fr-FR");
        tbody.innerHTML += `<tr>
          <td>${i + 1}</td><td>${info.name}</td><td>${info.specialty}</td><td>${info.hospital}</td>
          <td class="address-cell">${addr.slice(0, 8)}...${addr.slice(-6)}</td><td>${date}</td>
        </tr>`;
      }
    } catch (err) { console.error(err); }
  },

  loadPatientsList: async function () {
    const tbody = document.getElementById("patients-tbody");
    if (!tbody) return;
    try {
      const count = await MedChain.contract.methods.getPatientCount().call();
      if (parseInt(count) === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Aucun patient enregistré</td></tr>';
        return;
      }
      tbody.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const addr = await MedChain.contract.methods.getPatientAddress(i).call();
        const info = await MedChain.contract.methods.getPatientInfo(addr).call();
        const date = new Date(parseInt(info.registeredAt) * 1000).toLocaleDateString("fr-FR");
        tbody.innerHTML += `<tr>
          <td>${i + 1}</td><td>${info.name}</td><td>${info.dateOfBirth}</td><td>${info.bloodGroup}</td>
          <td class="address-cell">${addr.slice(0, 8)}...${addr.slice(-6)}</td><td>${date}</td>
        </tr>`;
      }
    } catch (err) { console.error(err); }
  },
};

window.addEventListener("DOMContentLoaded", () => AdminApp.init());
