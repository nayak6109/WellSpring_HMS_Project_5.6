import React from "react";
import { useQuery } from "@tanstack/react-query";

import Layout from "../layout/Layout";
import "../styles/dashboard.css";

import {
  getDoctorCount,
  getPatientCount,
  getAppointmentCount
} from "../services/dashboardService";


export default function Dashboard() {

  const role = localStorage.getItem("role") || "USER";


  // ================= DOCTOR COUNT =================

  const {
    data: doctorCount = 0,
    isLoading: doctorLoading,
    isError: doctorError
  } = useQuery({

    queryKey: ["doctorCount"],

    queryFn: async () => {

      const res = await getDoctorCount();

      return res.data.length;

    },

    staleTime: 30 * 60 * 1000, // 30 minutes cache

    refetchOnWindowFocus: false

  });



  // ================= PATIENT COUNT =================

  const {
    data: patientCount = 0,
    isLoading: patientLoading,
    isError: patientError
  } = useQuery({

    queryKey: ["patientCount"],

    queryFn: async () => {

      const res = await getPatientCount();

      return res.data.length;

    },

    staleTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false

  });



  // ================= APPOINTMENT COUNT =================

  const {
    data: appointmentCount = 0,
    isLoading: appointmentLoading,
    isError: appointmentError
  } = useQuery({

    queryKey: ["appointmentCount"],

    queryFn: async () => {

      const res = await getAppointmentCount();

      return res.data.length;

    },

    staleTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false

  });



  // ================= LOADING =================

  if (
    doctorLoading ||
    patientLoading ||
    appointmentLoading
  ) {

    return (

      <Layout>

        <h2>
          Loading Dashboard...
        </h2>

      </Layout>

    );

  }



  // ================= ERROR =================

  if (
    doctorError ||
    patientError ||
    appointmentError
  ) {

    return (

      <Layout>

        <h2>
          Dashboard data load failed ❌
        </h2>

      </Layout>

    );

  }



  return (

    <Layout>


      <h1 className="dashboard-title">
        Hospital Dashboard
      </h1>



      <p className="dashboard-role">

        Logged in as:

        <b>
          {" "}{role}
        </b>

      </p>



      <div className="card-grid">


        {/* Doctor Card */}

        <div className="card">

          <h2>
            {doctorCount}
          </h2>

          <p>
            Doctors
          </p>

        </div>



        {/* Patient Card */}

        <div className="card">

          <h2>
            {patientCount}
          </h2>

          <p>
            Patients
          </p>

        </div>



        {/* Appointment Card */}

        <div className="card">

          <h2>
            {appointmentCount}
          </h2>

          <p>
            Appointments
          </p>

        </div>



        {/* Admin Card */}

        {
          role === "ADMIN" && (

            <div className="card admin-card">

              <h2>
                ADMIN
              </h2>

              <p>
                Panel
              </p>

            </div>

          )
        }



      </div>


    </Layout>

  );

}