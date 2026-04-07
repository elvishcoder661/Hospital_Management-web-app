import axios from "axios";
import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, Stethoscope, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const API = "http://localhost:5051";
const defaultForm = { patientName: "", doctorId: "", date: "", time: "", notes: "" };

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = () => {
    axios.get(`${API}/appointments`)
      .then(res => setAppointments(res.data))
      .catch(err => console.log("Fetch error:", err));
  };

  const fetchDoctors = () => {
    axios.get(`${API}/doctors`)
      .then(res => setDoctors(res.data))
      .catch(err => console.log("Doctors fetch error:", err));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e = {};
    if (!form.patientName || form.patientName.trim().length < 2) e.patientName = "Patient name is required";
    if (!form.doctorId) e.doctorId = "Please select a doctor";
    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const doctor = doctors.find(d => d.id === Number(form.doctorId));

    try {
      setSubmitting(true);
      const res = await axios.post(`${API}/addAppointment`, {
        patientName: form.patientName.trim(),
        doctorId: Number(form.doctorId),
        doctorName: doctor ? doctor.name : "Assigned Doctor",
        department: doctor ? doctor.department : "",
        date: form.date,
        time: form.time,
        notes: form.notes.trim(),
      });
      setAppointments(prev => [res.data, ...prev]);
      setIsBookOpen(false);
      setForm(defaultForm);
      setErrors({});
      showToast("Appointment booked successfully.");
    } catch (err) {
      console.log("Submit error:", err);
      showToast("Failed to book appointment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(`${API}/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? res.data : a));
      showToast("Status updated.");
    } catch (err) {
      console.log("Status error:", err);
      showToast("Failed to update status.", "error");
    }
  };

  const handleDelete = async (apt) => {
    if (!window.confirm(`Delete appointment for "${apt.patientName}"?`)) return;
    try {
      setDeletingId(apt.id);
      await axios.delete(`${API}/appointments/${apt.id}`);
      setAppointments(prev => prev.filter(a => a.id !== apt.id));
      showToast("Appointment deleted.");
    } catch (err) {
      console.log("Delete error:", err);
      showToast("Failed to delete appointment.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-2">Manage your upcoming and past consultations.</p>
          </div>
          <button onClick={() => setIsBookOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-xl h-12 px-6 shadow-lg shadow-blue-200 text-sm font-medium hover:bg-blue-700 transition-colors">
            <CalendarIcon className="h-5 w-5" /> Book New Appointment
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No appointments yet. Book one to get started.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="overflow-hidden rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-white">
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Date Badge */}
                  <div className="bg-blue-50 p-4 rounded-xl text-center min-w-[120px] border border-blue-100">
                    <p className="text-blue-600 font-bold text-xl">
                      {format(new Date(apt.date), "dd MMM")}
                    </p>
                    <p className="text-gray-400 text-sm font-medium mt-1 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />{apt.time}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" /> Patient
                      </p>
                      <p className="font-semibold text-gray-900 text-lg">{apt.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <Stethoscope className="h-4 w-4" /> Doctor
                      </p>
                      <p className="font-medium text-gray-900">{apt.doctorName || "Assigned Doctor"}</p>
                      <p className="text-xs text-gray-400">{apt.department}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      apt.status === "completed" ? "bg-green-100 text-green-700" :
                      apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {apt.status}
                    </span>
                    <div className="flex gap-2 items-center">
                      {apt.status === "scheduled" && (
                        <>
                          <button onClick={() => handleStatusChange(apt.id, "completed")}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Done
                          </button>
                          <button onClick={() => handleStatusChange(apt.id, "cancelled")}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-medium">
                            <XCircle className="h-4 w-4" /> Cancel
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(apt)} disabled={deletingId === apt.id}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium disabled:opacity-50">
                        <Trash2 className="h-3 w-3" />
                        {deletingId === apt.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {isBookOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIsBookOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Book an Appointment</h2>
                <button onClick={() => setIsBookOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Patient Name</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Enter full name"
                    value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  />
                  {errors.patientName && <p className="text-xs text-red-500">{errors.patientName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Select Doctor</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  >
                    <option value="">Select a doctor...</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialty}</option>
                    ))}
                  </select>
                  {errors.doctorId && <p className="text-xs text-red-500">{errors.doctorId}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <input type="date"
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <input type="time"
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                    {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Reason for visit (Optional)</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Briefly describe your symptoms..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsBookOpen(false)}
                    className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}