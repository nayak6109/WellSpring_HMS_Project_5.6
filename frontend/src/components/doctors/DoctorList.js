import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import "../styles/doctorlist.css";
import "../../styles/global.css";
import "../../styles/table.css";
import { showAlert } from "../common/Alert";

// Fetch function
const fetchAvailableDoctors = async () => {
  const res = await axios.get("/api/doctors/available");
  return res.data;
};

export default function DoctorList() {
  const {
    data: doctors = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["availableDoctors"],
    queryFn: fetchAvailableDoctors,
    staleTime: 5 * 60 * 1000, // 5 min cache (Instant load next time)
    refetchOnWindowFocus: false,
  });

  if (isError) {
    showAlert("error", "Error loading doctors");
  }

  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toUpperCase();

  const doctorsAvailableToday = doctors.filter(
    (doc) => doc.available && doc.schedule?.days?.includes(today)
  );

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        <h1 className="doctor-title">Available Doctors Today</h1>
        <div className="doctor-card">
          <div className="doctor-table-wrapper">
            <table className="data-table">
              <thead className="doctor-table-head">
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="doctor-table-body">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="table-message">
                      Loading doctors...
                    </td>
                  </tr>
                ) : doctorsAvailableToday.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-message">
                      No doctors available today
                    </td>
                  </tr>
                ) : (
                  doctorsAvailableToday.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td className="doctor-name">{doc.name}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.experience} yrs</td>
                      <td>
                        <span className="doctor-status">Available</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}