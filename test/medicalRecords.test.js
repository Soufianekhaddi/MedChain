// Just for testing contracts if working withGanache. 
// run "truffle test" in terminal 

const MedicalRecords = artifacts.require("MedicalRecords");
const { assert } = require("chai");

contract("MedicalRecords", (accounts) => {
  const admin = accounts[0];
  const doctor1 = accounts[1];
  const doctor2 = accounts[2];
  const patient1 = accounts[3];
  const patient2 = accounts[4];

  let instance;

  beforeEach(async () => {
    instance = await MedicalRecords.new({ from: admin });
  });

  describe("Deployment", () => {
    it("should set the deployer as admin", async () => {
      const contractAdmin = await instance.admin();
      assert.equal(contractAdmin, admin, "Admin should be the deployer");
    });
  });

  describe("Doctor Registration", () => {
    it("should allow admin to register a doctor", async () => {
      const tx = await instance.registerDoctor(
        doctor1,
        "Dr. Ahmed Benali",
        "Cardiologie",
        "CHU Mohammed VI",
        { from: admin }
      );

      const info = await instance.getDoctorInfo(doctor1);
      assert.equal(info.name, "Dr. Ahmed Benali");
      assert.equal(info.specialty, "Cardiologie");
      assert.equal(info.exists, true);

      // Check event
      assert.equal(tx.logs[0].event, "DoctorRegistered");
    });

    it("should not allow non-admin to register a doctor", async () => {
      try {
        await instance.registerDoctor(
          doctor1,
          "Dr. Ahmed",
          "Cardiologie",
          "CHU",
          { from: patient1 }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Seul l'administrateur");
      }
    });

    it("should not allow duplicate doctor registration", async () => {
      await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
      try {
        await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "deja enregistre");
      }
    });
  });

  describe("Patient Registration", () => {
    it("should allow self-registration as patient", async () => {
      const tx = await instance.registerPatient(
        "Youssef El Amrani",
        "1995-03-15",
        "A+",
        { from: patient1 }
      );

      const info = await instance.getPatientInfo(patient1);
      assert.equal(info.name, "Youssef El Amrani");
      assert.equal(info.dateOfBirth, "1995-03-15");
      assert.equal(info.exists, true);

      assert.equal(tx.logs[0].event, "PatientRegistered");
    });

    it("should not allow a doctor to register as patient", async () => {
      await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
      try {
        await instance.registerPatient("Ahmed", "1990-01-01", "B+", { from: doctor1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "deja enregistree comme medecin");
      }
    });
  });

  describe("Access Control", () => {
    beforeEach(async () => {
      await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
      await instance.registerPatient("Youssef", "1995-03-15", "A+", { from: patient1 });
    });

    it("should allow patient to grant access to a doctor", async () => {
      await instance.grantAccess(doctor1, { from: patient1 });
      const hasAccess = await instance.checkAccess(patient1, doctor1);
      assert.equal(hasAccess, true);
    });

    it("should allow patient to revoke access", async () => {
      await instance.grantAccess(doctor1, { from: patient1 });
      await instance.revokeAccess(doctor1, { from: patient1 });
      const hasAccess = await instance.checkAccess(patient1, doctor1);
      assert.equal(hasAccess, false);
    });

    it("should not allow doctor without access to view records", async () => {
      try {
        await instance.getRecordCount(patient1, { from: doctor1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "pas acces");
      }
    });
  });

  describe("Medical Records", () => {
    beforeEach(async () => {
      await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
      await instance.registerPatient("Youssef", "1995-03-15", "A+", { from: patient1 });
      await instance.grantAccess(doctor1, { from: patient1 });
    });

    it("should allow authorized doctor to add a record", async () => {
      const tx = await instance.addRecord(
        patient1,
        "Hypertension",
        "Traitement medicamenteux",
        "Amlodipine 5mg",
        "Controle dans 3 mois",
        { from: doctor1 }
      );

      const count = await instance.getRecordCount(patient1, { from: doctor1 });
      assert.equal(count.toNumber(), 1);

      assert.equal(tx.logs[0].event, "RecordAdded");
    });

    it("should store record data correctly", async () => {
      await instance.addRecord(
        patient1,
        "Grippe",
        "Repos et hydratation",
        "Paracetamol 1g",
        "Revenir si fievre persiste",
        { from: doctor1 }
      );

      const record = await instance.getRecord(patient1, 0, { from: doctor1 });
      assert.equal(record.diagnosis, "Grippe");
      assert.equal(record.treatment, "Repos et hydratation");
      assert.equal(record.medication, "Paracetamol 1g");
    });

    it("should allow patient to view their own records", async () => {
      await instance.addRecord(
        patient1,
        "Grippe",
        "Repos",
        "Paracetamol",
        "Notes",
        { from: doctor1 }
      );

      const count = await instance.getRecordCount(patient1, { from: patient1 });
      assert.equal(count.toNumber(), 1);
    });

    it("should not allow unauthorized doctor to add record", async () => {
      await instance.registerDoctor(doctor2, "Dr. Sara", "Dermatologie", "CHU", { from: admin });
      try {
        await instance.addRecord(
          patient1,
          "Test",
          "Test",
          "Test",
          "Test",
          { from: doctor2 }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "pas acces");
      }
    });
  });

  describe("Role Detection", () => {
    it("should return correct roles", async () => {
      await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
      await instance.registerPatient("Youssef", "1995-03-15", "A+", { from: patient1 });

      const adminRole = await instance.getRole(admin);
      assert.equal(adminRole.toNumber(), 1);

      const doctorRole = await instance.getRole(doctor1);
      assert.equal(doctorRole.toNumber(), 2);

      const patientRole = await instance.getRole(patient1);
      assert.equal(patientRole.toNumber(), 3);

      const unknownRole = await instance.getRole(accounts[9]);
      assert.equal(unknownRole.toNumber(), 0);
    });
  });

  describe("Statistics", () => {
    it("should track patient and doctor counts", async () => {
      await instance.registerDoctor(doctor1, "Dr. Ahmed", "Cardiologie", "CHU", { from: admin });
      await instance.registerDoctor(doctor2, "Dr. Sara", "Dermatologie", "CHU", { from: admin });
      await instance.registerPatient("Youssef", "1995-03-15", "A+", { from: patient1 });

      const patientCount = await instance.getPatientCount();
      const doctorCount = await instance.getDoctorCount();

      assert.equal(patientCount.toNumber(), 1);
      assert.equal(doctorCount.toNumber(), 2);
    });
  });
});
