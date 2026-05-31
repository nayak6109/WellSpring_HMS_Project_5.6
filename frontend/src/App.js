
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

/* ===== ADMIN ===== */
import AdminAccount from "./pages/admin/AdminAccount";
import DoctorSchedulePage from "./pages/admin/DoctorSchedulePage";
import AdminInbox from "./pages/admin/AdminInbox";
import AdminReply from "./pages/admin/AdminReply";

/* ===== DOCTOR ===== */
import DoctorAccount from "./pages/doctor/DoctorAccount";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";
import DoctorSlip from "./pages/doctor/DoctorSlip";

import VisitView from "./pages/visit/VisitView";
import VisitEdit from "./pages/visit/VisitEdit";

/* ===== PATIENT ===== */
import PatientAccount from "./pages/patient/PatientAccount";
import OnlineAppointmentModal from "./components/appointments/OnlineAppointmentModal";

/* ===== STAFF ===== */
import AppointmentAccount from "./pages/staffAccount/AppointmentStaffAccount";
import PharmacyAccount from "./pages/staffAccount/PharmacyStaffAccount";
import BillingAccount from "./pages/staffAccount/BillingStaffAccount";
import LabAccount from "./pages/staffAccount/LabStaffAccount";

/* ===== PUBLIC ===== */
import WellSpringHome from "./components/home/WellSpringHome";
import DoctorList from "./components/doctors/DoctorList";
import Contact from "./pages/visit/Contact";

/* ===== LOGIN ===== */
import LoginSelect from "./pages/login/LoginSelect";
import AdminLogin from "./pages/login/AdminLogin";
import DoctorLogin from "./pages/login/DoctorLogin";
import PatientLogin from "./pages/login/PatientLogin";
import PatientRegister from "./pages/login/PatientRegister";
import AppointmentLogin from "./pages/staffLogin/AppointmentStaffLogin";
import PharmacyLogin from "./pages/staffLogin/PharmacyStaffLogin";
import BillingLogin from "./pages/staffLogin/BillingStaffLogin";
import LabLogin from "./pages/staffLogin/LabStaffLogin";

/* ===== PRIVATE ===== */
import Dashboard from "./components/Dashboard";
import Appointment from "./components/appointments/Appointment";
import PrivateRoute from "./routes/PrivateRoute";

/* ===== GLOBAL ===== */
import Navbar from "./components/common/Navbar";
import "./styles/global.css";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>

          {/* ===== PUBLIC ===== */}
          <Route path="/" element={<WellSpringHome />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/contact" element={<Contact />} />

          {/* ===== LOGIN ===== */}
          <Route path="/login" element={<LoginSelect />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/doctor" element={<DoctorLogin />} />
          <Route path="/login/patient" element={<PatientLogin />} />
          <Route path="/patient-register" element={<PatientRegister />} />
          <Route path="/login/appointment" element={<AppointmentLogin />} />
          <Route path="/login/pharmacy" element={<PharmacyLogin />} />
          <Route path="/login/billing" element={<BillingLogin />} />
          <Route path="/login/lab" element={<LabLogin />} />

          {/* ===== ADMIN ===== */}
          <Route
            path="/admin/account"
            element={
              <PrivateRoute roleRequired={["ADMIN"]}>
                <AdminAccount />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/doctor-schedule"
            element={
              <PrivateRoute roleRequired={["ADMIN"]}>
                <DoctorSchedulePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/inbox"
            element={
              <PrivateRoute roleRequired={["ADMIN"]}>
                <AdminInbox />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/reply/:id"
            element={
              <PrivateRoute roleRequired={["ADMIN"]}>
                <AdminReply />
              </PrivateRoute>
            }
          />

          {/* ===== DOCTOR ===== */}
          <Route
            path="/doctor/account"
            element={
              <PrivateRoute roleRequired={["DOCTOR"]}>
                <DoctorAccount />
              </PrivateRoute>
            }
          />

          <Route
            path="/doctor/consultation/:id"
            element={
              <PrivateRoute roleRequired={["DOCTOR"]}>
                <DoctorConsultation />
              </PrivateRoute>
            }
          />

          <Route path="/doctor-slip/:id" 
          element={<DoctorSlip />
            } 
        />

         <Route
          path="/visits/patient/:id"
         element={
       <PrivateRoute roleRequired={["DOCTOR"]}>
      <VisitView />
    </PrivateRoute>
  }
/>

     <Route
  path="/visits/:id"
  element={
    <PrivateRoute roleRequired={["DOCTOR"]}>
      <VisitView />
    </PrivateRoute>
  }
/>

            <Route
               path="/visits/edit/:id"
               element={
                 <PrivateRoute roleRequired={["DOCTOR"]}>
               <VisitEdit />
             </PrivateRoute>
              }
          />

          {/* ===== PATIENT ===== */}
          <Route
            path="/patient/account"
            element={
              <PrivateRoute roleRequired={["PATIENT"]}>
                <PatientAccount />
              </PrivateRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <PrivateRoute roleRequired={["ADMIN","PATIENT","APPOINTMENT"]}>
                <Appointment />
              </PrivateRoute>
            }
          />

          <Route
           path="/online_book_appointment"
              element={
             <PrivateRoute roleRequired={["PATIENT"]}>
            <OnlineAppointmentModal />
             </PrivateRoute>
             }
        />

          {/* ===== APPOINTMENT STAFF ===== */}
          <Route
            path="/appointmentStaff/account"
            element={
              <PrivateRoute roleRequired={["APPOINTMENT"]}>
                <AppointmentAccount />
              </PrivateRoute>
            }
          />


          {/* ===== PHARMACY STAFF ===== */}
          <Route
            path="/pharmacyStaff/account"
            element={
              <PrivateRoute roleRequired={["PHARMACY"]}>
                <PharmacyAccount />
              </PrivateRoute>
            }
          />

          {/* ===== BILLING STAFF ===== */}
          <Route
            path="/billingStaff/account"
            element={
              <PrivateRoute roleRequired={["BILLING"]}>
                <BillingAccount />
              </PrivateRoute>
            }
          />

          {/* ===== LAB STAFF ===== */}
             <Route
                   path="/labStaff/account"
                   element={
                   <PrivateRoute roleRequired={["LAB"]}>
                   <LabAccount />
               </PrivateRoute>
            }
        />

          {/* ===== COMMON DASHBOARD ===== */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;