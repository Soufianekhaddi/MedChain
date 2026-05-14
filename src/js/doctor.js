const DoctorApp = {
  init: async function () {
    await MedChain.init({
      onReady: async () => {
        const form = document.getElementById("add-record-form");
        if (form) form.addEventListener("submit", async (e) => { e.preventDefault(); await DoctorApp.addRecord(); });
        await DoctorApp.loadDashboard();
      },
    });
  },

  loadDashboard: async function () {
    try {
      const info = await MedChain.contract.methods.getDoctorInfo(MedChain.currentAccount).call();
      document.getElementById("doctor-name").textContent = info.name;
      document.getElementById("doctor-specialty").textContent = "Spécialité: " + info.specialty;
      document.getElementById("doctor-hospital").textContent = "Hôpital: " + info.hospital;
      DoctorApp.loadAccessiblePatients();
    } catch (err) { console.error(err); }
  },

  loadAccessiblePatients: async function () {
    const rSel = document.getElementById("record-patient");
    const vSel = document.getElementById("doctor-view-patient");
    if (rSel) rSel.innerHTML = '<option value="">Sélectionner un patient...</option>';
    if (vSel) vSel.innerHTML = '<option value="">Choisir un patient...</option>';
    try {
      const count = await MedChain.contract.methods.getPatientCount().call();
      for (let i = 0; i < count; i++) {
        const addr = await MedChain.contract.methods.getPatientAddress(i).call();
        const hasAccess = await MedChain.contract.methods.checkAccess(addr, MedChain.currentAccount).call();
        if (hasAccess) {
          const info = await MedChain.contract.methods.getPatientInfo(addr).call();
          [rSel, vSel].forEach(sel => {
            if (!sel) return;
            const opt = document.createElement("option");
            opt.value = addr;
            opt.textContent = `${info.name} (${info.bloodGroup})`;
            sel.appendChild(opt);
          });
        }
      }
    } catch (err) { console.error(err); }
  },

  addRecord: async function () {
    const patient = document.getElementById("record-patient").value;
    const diagnosis = document.getElementById("record-diagnosis").value;
    const treatment = document.getElementById("record-treatment").value;
    const medication = document.getElementById("record-medication").value;
    const notes = document.getElementById("record-notes").value || "Aucune note";
    if (!patient || !diagnosis || !treatment || !medication) return MedChain.showToast("Veuillez remplir tous les champs obligatoires", "error");
    try {
      MedChain.showToast("Transaction en cours...", "info");
      await MedChain.contract.methods.addRecord(patient, diagnosis, treatment, medication, notes).send({ from: MedChain.currentAccount, gas: 500000 });
      MedChain.showToast("Dossier médical ajouté avec succès!", "success");
      document.getElementById("add-record-form").reset();
    } catch (err) { console.error(err); MedChain.showToast("Erreur: " + MedChain.extractError(err), "error"); }
  },

  loadPatientRecordsForDoctor: async function () {
    const patient = document.getElementById("doctor-view-patient").value;
    const container = document.getElementById("doctor-records-container");
    if (!patient) return MedChain.showToast("Sélectionnez un patient", "error");
    try {
      const count = await MedChain.contract.methods.getRecordCount(patient).call({ from: MedChain.currentAccount });
      if (parseInt(count) === 0) { container.innerHTML = '<div class="empty-state"><span class="empty-icon">📂</span><p>Aucun dossier trouvé</p></div>'; return; }
      let html = "";
      for (let i = parseInt(count) - 1; i >= 0; i--) {
        const r = await MedChain.contract.methods.getRecord(patient, i).call({ from: MedChain.currentAccount });
        let docName = r.doctor.slice(0, 10) + "...";
        try { const d = await MedChain.contract.methods.getDoctorInfo(r.doctor).call(); docName = d.name; } catch (e) {}
        const date = new Date(parseInt(r.createdAt) * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        html += MedChain.renderRecordCard(r, docName, date);
      }
      container.innerHTML = html;
    } catch (err) { console.error(err); MedChain.showToast("Erreur de chargement", "error"); }
  },
};

window.addEventListener("DOMContentLoaded", () => DoctorApp.init());
