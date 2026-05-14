// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedicalRecords
 * @dev Système décentralisé de gestion des dossiers médicaux
 * @notice EMSI 4CIR - Blockchain
 */
contract MedicalRecords {


    struct Patient {
        string name;
        string dateOfBirth;
        string bloodGroup;
        address patientAddress;
        bool exists;
        uint256 registeredAt;
    }

    struct Doctor {
        string name;
        string specialty;
        string hospital;
        address doctorAddress;
        bool exists;
        uint256 registeredAt;
    }

    struct Record {
        uint256 id;
        address patient;
        address doctor;
        string diagnosis;
        string treatment;
        string medication;
        string notes;
        uint256 createdAt;
    }

    struct AccessLog {
        address doctor;
        uint256 grantedAt;
        uint256 revokedAt;
        bool isActive;
    }


    address public admin;
    uint256 private recordCounter;

    // Mappings
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => Record[]) private patientRecords;
    mapping(address => mapping(address => bool)) private accessPermissions; // patient => doctor => bool
    mapping(address => AccessLog[]) private patientAccessLogs;

    address[] public patientAddresses;
    address[] public doctorAddresses;


    event PatientRegistered(address indexed patientAddress, string name, uint256 timestamp);
    event DoctorRegistered(address indexed doctorAddress, string name, string specialty, uint256 timestamp);
    event RecordAdded(uint256 indexed recordId, address indexed patient, address indexed doctor, uint256 timestamp);
    event AccessGranted(address indexed patient, address indexed doctor, uint256 timestamp);
    event AccessRevoked(address indexed patient, address indexed doctor, uint256 timestamp);


    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l'administrateur peut effectuer cette action");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender].exists, "Seul un medecin enregistre peut effectuer cette action");
        _;
    }

    modifier onlyPatient() {
        require(patients[msg.sender].exists, "Seul un patient enregistre peut effectuer cette action");
        _;
    }

    modifier patientExists(address _patient) {
        require(patients[_patient].exists, "Ce patient n'existe pas");
        _;
    }

    modifier doctorExists(address _doctor) {
        require(doctors[_doctor].exists, "Ce medecin n'existe pas");
        _;
    }

    modifier hasAccess(address _patient) {
        require(
            msg.sender == _patient || 
            msg.sender == admin || 
            accessPermissions[_patient][msg.sender],
            "Vous n'avez pas acces aux dossiers de ce patient"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Register a new patient (self-registration)
     */
    function registerPatient(
        string memory _name,
        string memory _dateOfBirth,
        string memory _bloodGroup
    ) public {
        require(!patients[msg.sender].exists, "Patient deja enregistre");
        require(!doctors[msg.sender].exists, "Cette adresse est deja enregistree comme medecin");
        require(msg.sender != admin, "L'admin ne peut pas s'enregistrer comme patient");

        patients[msg.sender] = Patient({
            name: _name,
            dateOfBirth: _dateOfBirth,
            bloodGroup: _bloodGroup,
            patientAddress: msg.sender,
            exists: true,
            registeredAt: block.timestamp
        });

        patientAddresses.push(msg.sender);

        emit PatientRegistered(msg.sender, _name, block.timestamp);
    }

    /**
     * @dev Register a new doctor (admin only)
     */
    function registerDoctor(
        address _doctorAddress,
        string memory _name,
        string memory _specialty,
        string memory _hospital
    ) public onlyAdmin {
        require(!doctors[_doctorAddress].exists, "Medecin deja enregistre");
        require(!patients[_doctorAddress].exists, "Cette adresse est deja enregistree comme patient");
        require(_doctorAddress != admin, "L'admin ne peut pas etre enregistre comme medecin");

        doctors[_doctorAddress] = Doctor({
            name: _name,
            specialty: _specialty,
            hospital: _hospital,
            doctorAddress: _doctorAddress,
            exists: true,
            registeredAt: block.timestamp
        });

        doctorAddresses.push(_doctorAddress);

        emit DoctorRegistered(_doctorAddress, _name, _specialty, block.timestamp);
    }


    /**
     * @dev Add a medical record for a patient (doctor only, requires access)
     */
    function addRecord(
        address _patient,
        string memory _diagnosis,
        string memory _treatment,
        string memory _medication,
        string memory _notes
    ) public onlyDoctor patientExists(_patient) hasAccess(_patient) {
        recordCounter++;

        Record memory newRecord = Record({
            id: recordCounter,
            patient: _patient,
            doctor: msg.sender,
            diagnosis: _diagnosis,
            treatment: _treatment,
            medication: _medication,
            notes: _notes,
            createdAt: block.timestamp
        });

        patientRecords[_patient].push(newRecord);

        emit RecordAdded(recordCounter, _patient, msg.sender, block.timestamp);
    }

    /**
     * @dev Get all records for a patient (access controlled)
     */
    function getRecordCount(address _patient) public view hasAccess(_patient) returns (uint256) {
        return patientRecords[_patient].length;
    }

    /**
     * @dev Get a specific record by index
     */
    function getRecord(address _patient, uint256 _index) public view hasAccess(_patient) returns (
        uint256 id,
        address patient,
        address doctor,
        string memory diagnosis,
        string memory treatment,
        string memory medication,
        string memory notes,
        uint256 createdAt
    ) {
        require(_index < patientRecords[_patient].length, "Index de dossier invalide");
        Record memory r = patientRecords[_patient][_index];
        return (r.id, r.patient, r.doctor, r.diagnosis, r.treatment, r.medication, r.notes, r.createdAt);
    }

    /**
     * @dev Grant a doctor access to patient's records (patient only)
     */
    function grantAccess(address _doctor) public onlyPatient doctorExists(_doctor) {
        require(!accessPermissions[msg.sender][_doctor], "Acces deja accorde a ce medecin");

        accessPermissions[msg.sender][_doctor] = true;

        patientAccessLogs[msg.sender].push(AccessLog({
            doctor: _doctor,
            grantedAt: block.timestamp,
            revokedAt: 0,
            isActive: true
        }));

        emit AccessGranted(msg.sender, _doctor, block.timestamp);
    }

    /**
     * @dev Revoke a doctor's access to patient's records (patient only)
     */
    function revokeAccess(address _doctor) public onlyPatient doctorExists(_doctor) {
        require(accessPermissions[msg.sender][_doctor], "Ce medecin n'a pas acces a vos dossiers");

        accessPermissions[msg.sender][_doctor] = false;

        // Update the access log
        AccessLog[] storage logs = patientAccessLogs[msg.sender];
        for (uint256 i = logs.length; i > 0; i--) {
            if (logs[i - 1].doctor == _doctor && logs[i - 1].isActive) {
                logs[i - 1].revokedAt = block.timestamp;
                logs[i - 1].isActive = false;
                break;
            }
        }

        emit AccessRevoked(msg.sender, _doctor, block.timestamp);
    }

    /**
     * @dev Check if a doctor has access to a patient's records
     */
    function checkAccess(address _patient, address _doctor) public view returns (bool) {
        return accessPermissions[_patient][_doctor];
    }

    /**
     * @dev Get access logs count for a patient
     */
    function getAccessLogCount(address _patient) public view returns (uint256) {
        require(
            msg.sender == _patient || msg.sender == admin,
            "Seul le patient ou l'admin peut voir l'historique d'acces"
        );
        return patientAccessLogs[_patient].length;
    }

    /**
     * @dev Get a specific access log entry
     */
    function getAccessLog(address _patient, uint256 _index) public view returns (
        address doctor,
        uint256 grantedAt,
        uint256 revokedAt,
        bool isActive
    ) {
        require(
            msg.sender == _patient || msg.sender == admin,
            "Seul le patient ou l'admin peut voir l'historique d'acces"
        );
        require(_index < patientAccessLogs[_patient].length, "Index invalide");

        AccessLog memory log = patientAccessLogs[_patient][_index];
        return (log.doctor, log.grantedAt, log.revokedAt, log.isActive);
    }


    /**
     * @dev Get patient info
     */
    function getPatientInfo(address _patient) public view returns (
        string memory name,
        string memory dateOfBirth,
        string memory bloodGroup,
        uint256 registeredAt,
        bool exists
    ) {
        Patient memory p = patients[_patient];
        return (p.name, p.dateOfBirth, p.bloodGroup, p.registeredAt, p.exists);
    }

    /**
     * @dev Get doctor info
     */
    function getDoctorInfo(address _doctor) public view returns (
        string memory name,
        string memory specialty,
        string memory hospital,
        uint256 registeredAt,
        bool exists
    ) {
        Doctor memory d = doctors[_doctor];
        return (d.name, d.specialty, d.hospital, d.registeredAt, d.exists);
    }

    /**
     * @dev Get total number of patients
     */
    function getPatientCount() public view returns (uint256) {
        return patientAddresses.length;
    }

    /**
     * @dev Get total number of doctors
     */
    function getDoctorCount() public view returns (uint256) {
        return doctorAddresses.length;
    }

    /**
     * @dev Get patient address by index
     */
    function getPatientAddress(uint256 _index) public view returns (address) {
        require(_index < patientAddresses.length, "Index invalide");
        return patientAddresses[_index];
    }

    /**
     * @dev Get doctor address by index
     */
    function getDoctorAddress(uint256 _index) public view returns (address) {
        require(_index < doctorAddresses.length, "Index invalide");
        return doctorAddresses[_index];
    }

    /**
     * @dev Get the role of an address
     * Returns: 0 = unknown, 1 = admin, 2 = doctor, 3 = patient
     */
    function getRole(address _addr) public view returns (uint8) {
        if (_addr == admin) return 1;
        if (doctors[_addr].exists) return 2;
        if (patients[_addr].exists) return 3;
        return 0;
    }

    /**
     * @dev Get the total number of records in the system
     */
    function getTotalRecordCount() public view onlyAdmin returns (uint256) {
        return recordCounter;
    }
}
