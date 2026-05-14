const PatientApp = {
  init: async function () {
    await MedChain.init({
      onReady: async () => {
        await PatientApp.loadDashboard();
      },
    });
  },

  loadDashboard: async function () {
    try {
      const info = await MedChain.contract.methods.getPatientInfo(MedChain.currentAccount).call();
      document.getElementById("patient-name").textContent = info.name;
      document.getElementById("patient-dob").textContent = "Né(e) le: " + info.dateOfBirth;
      document.getElementById("patient-blood").textContent = "Groupe sanguin: " + info.bloodGroup;
      PatientApp.loadGrantDoctorSelect();
      PatientApp.loadAccessList();
      PatientApp.loadMyRecords();
      PatientApp.loadAccessLogs();
    } catch (err) { console.error(err); }
  },

  loadGrantDoctorSelect: async function () {
    const select = document.getElementById("grant-doctor");
    if (!select) return;
    select.innerHTML = '<option value="">Sélectionner un médecin...</option>';
    try {
      const count = await MedChain.contract.methods.getDoctorCount().call();
      for (let i = 0; i < count; i++) {
        const addr = await MedChain.contract.methods.getDoctorAddress(i).call();
        const info = await MedChain.contract.methods.getDoctorInfo(addr).call();
        const hasAccess = await MedChain.contract.methods.checkAccess(MedChain.currentAccount, addr).call();
        if (!hasAccess) {
          const opt = document.createElement("option");
          opt.value = addr;
          opt.textContent = `${info.name} — ${info.specialty}`;
          select.appendChild(opt);
        }
      }
    } catch (err) { console.error(err); }
  },

  loadAccessList: async function () {
    const container = document.getElementById("access-list-container");
    if (!container) return;
    try {
      const count = await MedChain.contract.methods.getDoctorCount().call();
      let html = "", hasAny = false;
      for (let i = 0; i < count; i++) {
        const addr = await MedChain.contract.methods.getDoctorAddress(i).call();
        const hasAccess = await MedChain.contract.methods.checkAccess(MedChain.currentAccount, addr).call();
        if (hasAccess) {
          hasAny = true;
          const info = await MedChain.contract.methods.getDoctorInfo(addr).call();
          html += `<div class="access-item">
            <div class="access-item-info">
              <span class="access-item-name">${info.name}</span>
              <span class="access-item-specialty">${info.specialty} — ${info.hospital}</span>
            </div>
            <button class="btn btn-danger" onclick="PatientApp.revokeAccess('${addr}')">🚫 Révoquer</button>
          </div>`;
        }
      }
      container.innerHTML = hasAny ? html : '<div class="empty-state small"><p>Aucun médecin n\'a accès à vos dossiers</p></div>';
    } catch (err) { console.error(err); }
  },

  grantAccess: async function () {
    const doctor = document.getElementById("grant-doctor").value;
    if (!doctor) return MedChain.showToast("Sélectionnez un médecin", "error");
    try {
      MedChain.showToast("Transaction en cours...", "info");
      await MedChain.contract.methods.grantAccess(doctor).send({ from: MedChain.currentAccount, gas: 300000 });
      MedChain.showToast("Accès accordé avec succès!", "success");
      PatientApp.loadDashboard();
    } catch (err) { console.error(err); MedChain.showToast("Erreur: " + MedChain.extractError(err), "error"); }
  },

  revokeAccess: async function (doctor) {
    try {
      MedChain.showToast("Transaction en cours...", "info");
      await MedChain.contract.methods.revokeAccess(doctor).send({ from: MedChain.currentAccount, gas: 300000 });
      MedChain.showToast("Accès révoqué!", "success");
      PatientApp.loadDashboard();
    } catch (err) { console.error(err); MedChain.showToast("Erreur: " + MedChain.extractError(err), "error"); }
  },

  loadMyRecords: async function () {
    const container = document.getElementById("patient-records-container");
    if (!container) return;
    try {
      const count = await MedChain.contract.methods.getRecordCount(MedChain.currentAccount).call({ from: MedChain.currentAccount });
      if (parseInt(count) === 0) { container.innerHTML = '<div class="empty-state"><span class="empty-icon">📋</span><p>Aucun dossier médical trouvé</p></div>'; return; }
      let html = "";
      for (let i = parseInt(count) - 1; i >= 0; i--) {
        const r = await MedChain.contract.methods.getRecord(MedChain.currentAccount, i).call({ from: MedChain.currentAccount });
        let docName = r.doctor.slice(0, 10) + "...";
        try { const d = await MedChain.contract.methods.getDoctorInfo(r.doctor).call(); docName = d.name; } catch (e) {}
        const date = new Date(parseInt(r.createdAt) * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        html += MedChain.renderRecordCard(r, docName, date);
      }
      container.innerHTML = html;
    } catch (err) { console.error(err); container.innerHTML = '<div class="empty-state"><p>Erreur de chargement</p></div>'; }
  },

  loadAccessLogs: async function () {
    const tbody = document.getElementById("access-log-tbody");
    if (!tbody) return;
    try {
      const count = await MedChain.contract.methods.getAccessLogCount(MedChain.currentAccount).call({ from: MedChain.currentAccount });
      if (parseInt(count) === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Aucun historique</td></tr>'; return; }
      tbody.innerHTML = "";
      for (let i = parseInt(count) - 1; i >= 0; i--) {
        const log = await MedChain.contract.methods.getAccessLog(MedChain.currentAccount, i).call({ from: MedChain.currentAccount });
        let docName = log.doctor.slice(0, 10) + "...";
        try { const d = await MedChain.contract.methods.getDoctorInfo(log.doctor).call(); docName = d.name; } catch (e) {}
        const granted = new Date(parseInt(log.grantedAt) * 1000).toLocaleDateString("fr-FR");
        const revoked = log.isActive ? "—" : new Date(parseInt(log.revokedAt) * 1000).toLocaleDateString("fr-FR");
        const status = log.isActive ? '<span class="status-active">✅ Actif</span>' : '<span class="status-revoked">🚫 Révoqué</span>';
        tbody.innerHTML += `<tr><td>${docName}</td><td>${granted}</td><td>${revoked}</td><td>${status}</td></tr>`;
      }
    } catch (err) { console.error(err); }
  },
};

window.addEventListener("DOMContentLoaded", () => PatientApp.init());
