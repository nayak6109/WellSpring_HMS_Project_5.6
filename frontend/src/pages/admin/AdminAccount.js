import React, { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../services/authService";

import api from "../../services/api";
import "../../styles/accountProfile.css";
import "../../styles/global.css"
import "../../styles/table.css"
import Navbar from "../../components/common/Navbar";
import { showAlert } from "../../components/common/Alert";
import {formatDisplayDate, formatTimeRange} from "../../utils/dateTimeUtils";


/* ================= MODALS ================= */
import DoctorScheduleModal from "../../components/doctors/DoctorScheduleModal";
import WalkinAppointmentBookModal from "../../components/appointments/WalkinAppointmentBookModal";
import AppointmentUpdateModal from "../../components/appointments/AppointmentUpdateModal";
import DoctorRegisterModal from "../../components/doctors/DoctorRegisterModal";
import PharmacyStaffRegisterModal from "../../components/staff/PharmacyStaffRegisterModal";
import BillingStaffRegisterModal from "../../components/staff/BillingStaffRegisterModal";
import AppointmentStaffRegisterModal from "../../components/staff/AppointmentStaffRegisterModal";
import LabStaffRegisterModal from "../../components/staff/LabStaffRegisterModal";
import DoctorUpdateModal from "../../components/doctors/DoctorUpdateModal";
import SlotSelectModal from "../../components/appointments/SlotSelectModal";

/* ================= SERVICES ================= */
import { updateAppointmentByAdmin } from "../../services/appointmentService";

/* ================= MODAL CONSTANTS ================= */
const MODAL = {
  DOCTOR_REGISTER: "DOCTOR_REGISTER",
  PHARMACY_REGISTER: "PHARMACY_REGISTER",
  BILLING_REGISTER: "BILLING_REGISTER",
  APPOINTMENT_REGISTER: "APPOINTMENT_REGISTER",
  LAB_REGISTER: "LAB_REGISTER",
  DOCTOR_UPDATE: "DOCTOR_UPDATE",
  APPOINTMENT_BOOK: "APPOINTMENT_BOOK",
  APPOINTMENT_EDIT: "APPOINTMENT_EDIT",
  SLOT_SELECT: "SLOT_SELECT",
  DOCTOR_SCHEDULE: "DOCTOR_SCHEDULE",
};

/* ================= ADMIN DASHBOARD COMPONENT ================= */
export default function AdminAccount() {
  const token = localStorage.getItem("token");
  const authHeader = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const {
  data: admin,
  isLoading,
  isError,
  error,
} = useQuery({

  queryKey:["adminProfile"],

  queryFn:getMyProfile,

  staleTime:30 * 60 * 1000,

  refetchOnWindowFocus:false

});
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pharmacyStaff, setPharmacyStaff] = useState([]);
  const [billingStaff, setBillingStaff] = useState([]);
  const [appointmentStaff, setAppointmentStaff] = useState([]);
  const [labStaff, setLabStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activePage, setActivePage] = useState("DASHBOARD");

  const [search, setSearch] = useState(""); // 🔍 NEW

 const [location, setLocation] = useState(null);

  
  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    if (!token) return;

    const loadDashboard = async () => {
      try {
        const [doctorsRes, patientsRes,pharmacyRes,billingRes,appointmentStaffRes, labStaffRes,appointmentsRes,locationRes] = await Promise.all([
                                   
                                   api.get("/doctors", authHeader),
                                   api.get("/patients", authHeader),
                                   api.get("/pharmacy-staff", authHeader),
                                   api.get("/billing-staff", authHeader),
                                   api.get("/appointment-staff", authHeader),
                                   api.get("/lab-staff", authHeader),
                                   api.get("/appointments", authHeader),
                                   api.get("/hospital/location", authHeader)
                                ]);

        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);
        setPharmacyStaff(pharmacyRes.data);
        setBillingStaff(billingRes.data);
        setAppointmentStaff(appointmentStaffRes.data);
        setLabStaff(labStaffRes.data);
        setAppointments(appointmentsRes.data);
          setLocation(locationRes.data); // ✅ Set hospital location
      } catch (err) {
    console.log(err);

    console.log("Status:", err.response?.status);
    console.log("URL:", err.config?.url);
    console.log("Response:", err.response?.data);

    showAlert("error", "Failed to load admin dashboard ❌");
}
    };

    loadDashboard();
  }, [authHeader, token]);

    

  /* ================= FETCH HELPERS ================= */
  const fetchDoctors = async () => {
    const res = await api.get("/doctors", authHeader);
    setDoctors(res.data);
  };
  const fetchPharmacyStaff = async () => {
  const res = await api.get("pharmacy-staff", authHeader);
  setPharmacyStaff(res.data);
};

const fetchBillingStaff = async () => {
  const res = await api.get("/billing-staff", authHeader);
  setBillingStaff(res.data);
};

const fetchAppointmentStaff = async () => {
  const res = await api.get("appointment-staff", authHeader);
  setAppointmentStaff(res.data);
};
const fetchLabStaff = async () => {
  const res = await api.get("/lab-staff", authHeader);
  setLabStaff(res.data);
};
const fetchAppointments = async () => {
    const res = await api.get("/appointments", authHeader);
    setAppointments(res.data);
  };


  /* ================= SEARCH FILTERS ================= */
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d =>
      `${d.id} ${d.name} ${d.specialization}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [doctors, search]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      `${p.id} ${p.name} ${p.mobile}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [patients, search]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a =>
      `${a.id} ${a.patient?.name || ""} ${a.doctor?.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [appointments, search]);

  /* ================= MODAL HANDLERS ================= */
  const openModal = (type, data = null) => {
    setActiveModal(type);
    if (type === MODAL.DOCTOR_UPDATE || type === MODAL.DOCTOR_SCHEDULE) setSelectedDoctor(data);
    if (type === MODAL.APPOINTMENT_EDIT) setSelectedAppointment(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedDoctor(null);
    setSelectedAppointment(null);
  };

  /* ================= APPOINTMENT UPDATE (ADMIN) ================= */
  const handleAppointmentUpdate = async (formData) => {
    try {
      const payload = {
        disease: formData.disease,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        doctorId: formData.doctorId,
      };

      await updateAppointmentByAdmin(selectedAppointment.id, payload);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id
            ? { ...a, ...payload, doctor: doctors.find((d) => d.id === payload.doctorId) || a.doctor }
            : a
        )
      );

      showAlert("success", "Appointment updated successfully ✅");
      closeModal();
    } catch (err) {
      showAlert("error", "Appointment update failed ❌");
    }
  };

  if(isLoading){
  return <h3>Loading admin profile...</h3>;
}

if(isError){
  console.log("Profile error:",error);
  return <h3>Failed to load profile</h3>;
}

if(!admin){
  return <h3>No admin data found</h3>;
}

  return (
   <div className="doctor-profile-container admin-dashboard">

  <Navbar openModal={openModal} MODAL={MODAL} />

  <div className="admin-grid">
    {/* ================= ADMIN PROFILE ================= */}
    <div className="profile-card admin-profile">
      <div className="profile-header">
        <div>
          <h2>👑 Admin Dashboard</h2>
          <span className="profile-subtitle">Hospital Management System</span>
        </div>
        <span className="status-badge success">ACTIVE</span>
        
      </div>
      

      <div className="profile-body">
        <ProfileField label="Username" value={admin.username} />
        <ProfileField label="Email" value={admin.email} />
        <ProfileField label="Role" value={<span className="role-badge admin">ADMIN</span>} />
      </div>
    </div>

    {/* ================= ADMINISTRATION ================= */}
    <div className="appointments-card admin-actions">
      <h3>Administration</h3>

      {/* Row 1 */}
      <div className="action-row">
        <button className="action-btn appointment-btn" onClick={() => openModal(MODAL.APPOINTMENT_BOOK)}>
          📅 Book Appointment
        </button>
        <button className="action-btn doctor-btn" onClick={() => openModal(MODAL.DOCTOR_REGISTER)}>
          🩺 Register Doctor
        </button>
         <button className="action-btn pharmacyStaff-btn" onClick={() => openModal(MODAL.PHARMACY_REGISTER)}>
           💊 Register Pharmacy Staff
         </button>
         <button className="action-btn billingStaff-btn" onClick={() => openModal(MODAL.BILLING_REGISTER)}>
            💳 Register Billing Staff
           </button>
    <button className="action-btn appointmentStaff-btn" onClick={() => openModal(MODAL.APPOINTMENT_REGISTER)}>
             📅 Register Appointment Staff
       </button>
           <button className="action-btn labStaff-btn" onClick={() => openModal(MODAL.LAB_REGISTER)}>
         🧪 Register Lab Staff
        </button>
       </div>

      {/* Row 2 */}
      <div className="action-row">
        <button className="action-btn appointment-btn" onClick={() => { setActivePage("APPOINTMENTS"); setSearch(""); }}>
          📅 Appointments
        </button>
        <button className="action-btn doctor-btn" onClick={() => { setActivePage("DOCTORS"); setSearch(""); }}>
          🩺 Doctors
        </button>
        <button className="action-btn patient-btn" onClick={() => { setActivePage("PATIENTS"); setSearch(""); }}>
          🧑‍🤝‍🧑 Patients
        </button>
      </div>
       <div className="action-row">
            <button className="action-btn pharmacyStaff-btn" onClick={() => setActivePage("PHARMACY")}>
              💊 Pharmacy Staff
             </button>
            <button className="action-btn billingStaff-btn" onClick={() => setActivePage("BILLING")}>
               💳 Billing Staff
            </button>
            <button className="action-btn appointmentStaff-btn" onClick={() => setActivePage("APPOINTMENT_STAFF")}>
              📅 Appointment Staff
             </button>
             <button className="action-btn labStaff-btn" onClick={() => setActivePage("LAB_STAFF")}>
              🧪 Lab Staff
             </button>
    </div>

      {/* Row 3 */}
      <div className="action-row">
        <button className="action-btn location-btn" onClick={() => setActivePage("SET_LOCATION")}>
          📍 Set Location
        </button>
        <button className="action-btn location-btn" onClick={() => setActivePage("SHOW_LOCATION")}>
          🗺 Show My Location
        </button>
      </div>
    </div>
  </div>

                     {/* ================= DOCTORS TABLE ================= */}
{activePage === "DOCTORS" && (
  <div className="doctors-fullwidth">
    <DataTable
      title="Doctors List"
      headers={[
        "Doctor ID",
        "Name",
        "Specialization",
        "Experience",
        "Available",
        "Visiting Hour",
        "Visiting Days",
        "Schedule",
        "Action"
      ]}
      data={filteredDoctors}
      renderRow={(d) => {

        const visitingHour =
          d.schedule?.startTime && d.schedule?.endTime
            ? formatTimeRange(d.schedule.startTime, d.schedule.endTime)
            : "Not Set";

        const visitingDays =
          d.schedule?.days?.length > 0
            ? d.schedule.days
                .map(day => day.charAt(0) + day.slice(1).toLowerCase())
                .join(", ")
            : "Not Set";

        const today = new Date()
          .toLocaleString("en-US", { weekday: "long" })
          .toUpperCase();

        const availableToday =
          d.available && d.schedule?.days?.includes(today);

        return (
          <>
            <td>
              <span style={{ color: "#64748b" }}>#</span>
              {d.id}
            </td>

            <td>{d.name}</td>

            <td>{d.specialization}</td>

            <td>{d.experience} yrs</td>

            <td>
              <span className={availableToday ? "status-active" : "status-inactive"}>
                {availableToday ? "● Available" : "○ Offline"}
              </span>
            </td>

            <td>
              <div className="visiting-hour-box">
                {visitingHour}
              </div>
            </td>

            <td>
              <div
                className="visiting-hour-box"
                style={{
                  background: "#f0fdf4",
                  color: "#15803d",
                  borderColor: "#dcfce7"
                }}
              >
                {visitingDays}
              </div>
            </td>

            {/* Schedule column */}
            <td>
              <button
                className="btn-schedule"
                onClick={() => openModal(MODAL.DOCTOR_SCHEDULE, d)}
              >
                📅 Schedule
              </button>
            </td>

            {/* Action column */}
            <td>
              <button
                className="btn-edit-doctor"
                onClick={() => openModal(MODAL.DOCTOR_UPDATE, d)}
              >
                ✏️ Edit
              </button>
            </td>
          </>
        );
      }}
    />
  </div>
)}
  
  {/* ================= PHARMACY STAFF TABLE ============================= */}
      {activePage === "PHARMACY" && (
  <div className="appointments-card doctors-fullwidth">
    <DataTable
      title="Pharmacy Staff List"
       headers={["ID", "Full Name","Age", "Gender","Mobile","Aadhaar","Address","Email"]}
      data={pharmacyStaff}
      renderRow={(p) => (
        <>
          <td>{p.id}</td>
          <td>{p.fullName}</td>   {/* ✅ name ki jagah fullName */}
          <td>{p.age}</td>
          <td>{p.gender}</td>
          <td>{p.mobile}</td>
          <td>{p.aadhaarNumber}</td>
          <td>{p.address}</td>
          <td>{p.email}</td>
        </>
      )}
    />
  </div>
)}

  {/* ================= BILLING STAFF TABLE ============================= */}
  {activePage === "BILLING" && (
  <div className="appointments-card doctors-fullwidth">
    <DataTable
      title="Billing Staff List"
       headers={["ID", "Full Name","Age", "Gender","Mobile","Aadhaar","Address","Email"]}
      data={billingStaff}
      renderRow={(b) => (
        <>
          <td>{b.id}</td>
          <td>{b.fullName}</td>   {/* ✅ name ki jagah fullName */}
          <td>{b.age}</td>
          <td>{b.gender}</td>
          <td>{b.mobile}</td>
          <td>{b.aadhaarNumber}</td>
          <td>{b.address}</td>
          <td>{b.email}</td>
        </>
      )}
    />
  </div>
)}
 
        {/* ================= APPOINTMENT STAFF TABLE ================= */}

      {activePage === "APPOINTMENT_STAFF" && (
  <div className="appointments-card doctors-fullwidth">
    <DataTable
      title="Appointment Desk Staff"
      headers={["ID", "Full Name","Age", "Gender","Mobile","Aadhaar","Address","Email"]}
      data={appointmentStaff}
      renderRow={(a) => (
        <>
          <td>{a.id}</td>
          <td>{a.fullName}</td>   {/* ✅ name ki jagah fullName */}
          <td>{a.age}</td>
          <td>{a.gender}</td>
          <td>{a.mobile}</td>
          <td>{a.aadhaarNumber}</td>
          <td>{a.address}</td>
          <td>{a.email}</td>
        </>
      )}
    />
  </div>
)}  

      {/* ================= LAB STAFF TABLE ================= */}

      {activePage === "LAB_STAFF" && (
  <div className="appointments-card doctors-fullwidth">
    <DataTable
      title="Lab Staff List"
      headers={["ID", "Full Name","Age", "Gender","Mobile","Aadhaar","Address","Email"]}
      data={labStaff}
      renderRow={(l) => (
        <>
          <td>{l.id}</td>
          <td>{l.fullName}</td>
          <td>{l.age}</td>
          <td>{l.gender}</td>
          <td>{l.mobile}</td>
          <td>{l.aadhaarNumber}</td>
          <td>{l.address}</td>
          <td>{l.email}</td>
        </>
      )}
    />
  </div>
)}

  {/* ================= PATIENTS TABLE ================= */}
      {activePage === "PATIENTS" && (
        <div className="appointments-card doctors-fullwidth">
          <DataTable
            title="Patients List"
            headers={["Patient ID", "Name", "Gender", "Mobile", "Address"]}
            data={filteredPatients}
            renderRow={(p) => (
              <>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.gender}</td>
                <td>{p.mobile}</td>
                <td>{p.address}</td>
              </>
            )}
          />
        </div>
      )}

      {/* ================= APPOINTMENTS TABLE ================= */}
      {activePage === "APPOINTMENTS" && (
        <div className="appointments-card appointmnets-fullwidth">
          <DataTable
            title="Appointments List"
            headers={["Appointment ID","Patient","Doctor","Disease","Date","Time","Status","Action"]}
            data={filteredAppointments}
            renderRow={(a) => (
              <>
                <td>{a.id}</td>
                <td>{a.patient?.name || a.patientName}</td>
                <td>{a.doctor?.name || a.doctorName}</td>
                <td>{a.disease?.name || a.disease}</td>
                <td>{formatDisplayDate(a.appointmentDate)}</td>
                <td>{formatTimeRange(a.slotStartTime, a.slotEndTime)}</td>
                <td>
                  <span className={a.status === "CANCELLED" ? "status-inactive" : "status-active"}>
                    {a.status}
                  </span>
                </td>
                    <td> <button className="btn-primary" onClick={() => openModal(MODAL.APPOINTMENT_EDIT, a)}>
                     ✏ Edit </button>
                 </td>
              </>
            )}
          />
        </div>
      )}
          
            {/* ==========================  SET HOSPITAL LOCATION   ===============================*/}
 {activePage === "SET_LOCATION" && (
  <div className="modal-overlay">
    <div className="appointment-card location-card">
      <div className="modal-header">
        <h3>📍 Set Hospital Location</h3>
        <button className="close-btn" onClick={() => setActivePage("")}>
          ✖
        </button>
      </div>

      <div className="location-grid">
        <div className="profile-field">
          <label>Latitude</label>
          <input
            type="number"
            step="any"
            value={location?.lat || ""}
            onChange={(e) =>
              setLocation({ ...(location || {}), lat: parseFloat(e.target.value) })
            }
            placeholder="Eg: 23.288299"
          />
        </div>

        <div className="profile-field">
          <label>Longitude</label>
          <input
            type="number"
            step="any"
            value={location?.lng || ""}
            onChange={(e) =>
              setLocation({ ...(location || {}), lng: parseFloat(e.target.value) })
            }
            placeholder="Eg: 85.294631"
          />
        </div>

       <button
  className="btn-primary full-width"
  onClick={async () => {
    if (location?.lat == null || location?.lng == null) {
      showAlert("error", "Please enter valid latitude & longitude");
      return;
    }

    try {
      await api.post(
        "/hospital/location",
        {
          lat: location.lat,
          lng: location.lng,
        },
        authHeader
      );

      showAlert("success", "Hospital location saved ✅");
      setActivePage("");
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to save hospital location ❌");
    }
  }}> Save Hospital Location
     </button>
      </div>
    </div>
  </div>
)}


          {/* ========================= SHOW LOCATION SECTION ========================= */}
{activePage === "SHOW_LOCATION" && (
  <div className="appointments-card">
    <h3>📍 Hospital & My Location</h3>

    <div className="location-display-grid">
      
      {/* ================= HOSPITAL LOCATION BOX ================= */}
      <div className="location-box">
        <h4>🏥 SpringWell Hospital Location</h4>
        {location ? (
          <>
            <p><strong>Latitude:</strong> {location.lat}</p>
            <p><strong>Longitude:</strong> {location.lng}</p>
            <button
              className="btn-primary full-width"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                  "_blank"
                )
              }
            >
              🗺 View Hospital
            </button>
          </>
        ) : (
          <p>No hospital location set</p>
        )}
      </div>
    </div>
  </div>
)}


      {/* ================= MODALS (SAB SAFE HAI) ================= */}
      {activeModal === MODAL.SLOT_SELECT && (
        <SlotSelectModal doctors={doctors} onClose={closeModal} onSlotsSaved={fetchDoctors} />
      )}
      {activeModal === MODAL.DOCTOR_REGISTER && (
        <DoctorRegisterModal onClose={closeModal} onRegistered={fetchDoctors} />
      )}
         {activeModal === MODAL.PHARMACY_REGISTER && (
        <PharmacyStaffRegisterModal onClose={closeModal} onRegistered={fetchPharmacyStaff} />
      )}
          {activeModal === MODAL.BILLING_REGISTER && (
         <BillingStaffRegisterModal onClose={closeModal} onRegistered={fetchBillingStaff} />
       )}
        {activeModal === MODAL.APPOINTMENT_REGISTER && (
        <AppointmentStaffRegisterModal onClose={closeModal} onRegistered={fetchAppointmentStaff} />
       )}
         {activeModal === MODAL.LAB_REGISTER && (
       <LabStaffRegisterModal onClose={closeModal} onRegistered={fetchLabStaff} />
      )}
         {activeModal === MODAL.DOCTOR_UPDATE && selectedDoctor && (
        <DoctorUpdateModal doctor={selectedDoctor} onClose={closeModal} onUpdated={fetchDoctors} />
      )}
      {activeModal === MODAL.APPOINTMENT_BOOK && (
        <WalkinAppointmentBookModal doctors={doctors} onClose={closeModal} onSaved={fetchAppointments} />
      )}
      {activeModal === MODAL.APPOINTMENT_EDIT && selectedAppointment && (
        <AppointmentUpdateModal
          appointment={selectedAppointment}
          doctors={doctors}
          onClose={closeModal}
          onUpdate={handleAppointmentUpdate}
        />
      )}
      {activeModal === MODAL.DOCTOR_SCHEDULE && selectedDoctor && (
        <DoctorScheduleModal doctorId={selectedDoctor.id} onClose={closeModal} onSaved={fetchDoctors} />
      )}
    </div>
  );
}

/* ================= SMALL REUSABLE COMPONENTS ================= */
const ProfileField = ({ label, value }) => (
  <div className="profile-field">
    <label>{label}</label>
    <span>{value || "-"}</span>
  </div>
);

/* ================= DATA TABLE WITH SEARCH ================= */
const DataTable = ({ title, headers, data, renderRow }) => {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div className="appointments-card">
      <div className="table-header">
        <h3>{title}</h3>
        <input
          type="text"
          className="table-search"
          placeholder="ID / Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredData.length === 0 ? (
        <p>No data found</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>{headers.map((h) => (<th key={h}>{h}</th>))}</tr>
          </thead>
          <tbody>{filteredData.map((item) => (<tr key={item.id}>{renderRow(item)}</tr>))}</tbody>
        </table>
      )}
    </div>

  );
};
