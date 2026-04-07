import axios from "axios";
import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Search, UserPlus, Phone, Mail, Activity, X, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5051";
const defaultForm = { name: "", age: "", gender: "", phone: "", email: "", bloodGroup: "" };

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null); // null = add mode, object = edit mode
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = () => {
    axios.get(`${API}/patients`)
      .then(res => setPatients(res.data))
      .catch(err => console.log("Fetch error:", err));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Open modal in ADD mode
  const openAddModal = () => {
    setEditingPatient(null);
    setForm(defaultForm);
    setErrors({});
    setIsFormOpen(true);
  };

  // Open modal in EDIT mode — pre-fill form with patient data
  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || "",
      bloodGroup: patient.bloodGroup || "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name is required";
    if (!form.age || Number(form.age) <= 0) e.age = "Valid age is required";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.phone || form.phone.trim().length < 7) e.phone = "Valid phone is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      email: form.email.trim(),
      bloodGroup: form.bloodGroup.trim(),
    };

    try {
      setSubmitting(true);

      if (editingPatient) {
        // ── UPDATE ──
        const res = await axios.put(`${API}/patients/${editingPatient.id}`, payload);
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? res.data : p));
        showToast("Patient updated successfully.");
      } else {
        // ── ADD ──
        const res = await axios.post(`${API}/addPatient`, payload);
        setPatients(prev => [res.data, ...prev]);
        showToast("Patient registered successfully.");
      }

      setIsFormOpen(false);
      setForm(defaultForm);
      setErrors({});
      setEditingPatient(null);
    } catch (err) {
      console.log("Submit error:", err);
      showToast(
        editingPatient ? "Failed to update patient." : "Failed to register patient.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Delete patient "${patient.name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(patient.id);
      await axios.delete(`${API}/patients/${patient.id}`);
      setPatients(prev => prev.filter(p => p.id !== patient.id));
      showToast("Patient deleted successfully.");
    } catch (err) {
      console.log("Delete error:", err);
      showToast("Failed to delete patient.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Directory</h1>
            <p className="text-gray-500 mt-2">Manage patient records and information.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" /> Register Patient
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Patient Details</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Blood Group</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No patients found.</td>
                  </tr>
                ) : (
                  filtered.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-400">{patient.age} yrs • {patient.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Phone className="h-3 w-3" /> {patient.phone}
                          </span>
                          {patient.email && (
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <Mail className="h-3 w-3" /> {patient.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-50 text-red-600 font-bold text-xs">
                          {patient.bloodGroup || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center w-fit gap-1">
                          <Activity className="h-3 w-3" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(patient)}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(patient)}
                            disabled={deletingId === patient.id}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            {deletingId === patient.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPatient ? "Edit Patient" : "Register New Patient"}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number" min="1"
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                    {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Blood Group</label>
                    <input
                      placeholder="e.g. O+"
                      className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email (Optional)</label>
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {submitting
                      ? (editingPatient ? "Saving..." : "Registering...")
                      : (editingPatient ? "Save Changes" : "Complete Registration")
                    }
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