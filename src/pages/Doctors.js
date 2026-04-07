import axios from "axios";
import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Search, MapPin, Star, Clock, Filter, Plus, X, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5051";
const defaultForm = { name: "", specialty: "", department: "", experience: 0, consultationFee: 100, bio: "" };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchDoctors(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchDoctors = (search = "") => {
    axios.get(`${API}/doctors${search ? `?search=${search}` : ""}`)
      .then(res => setDoctors(res.data))
      .catch(err => console.log("Fetch error:", err));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setForm(defaultForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      department: doctor.department,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio || "",
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name is required";
    if (!form.specialty || form.specialty.trim().length < 2) e.specialty = "Specialty is required";
    if (!form.department || form.department.trim().length < 2) e.department = "Department is required";
    if (Number(form.experience) < 0) e.experience = "Experience must be positive";
    if (Number(form.consultationFee) < 0) e.consultationFee = "Fee must be positive";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      department: form.department.trim(),
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
      bio: form.bio.trim(),
    };

    try {
      setSubmitting(true);
      if (editingDoctor) {
        const res = await axios.put(`${API}/doctors/${editingDoctor.id}`, payload);
        setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? res.data : d));
        showToast("Doctor updated successfully.");
      } else {
        const res = await axios.post(`${API}/addDoctor`, payload);
        setDoctors(prev => [res.data, ...prev]);
        showToast("Doctor added successfully.");
      }
      setIsFormOpen(false);
      setForm(defaultForm);
      setErrors({});
      setEditingDoctor(null);
    } catch (err) {
      console.log("Submit error:", err);
      showToast(editingDoctor ? "Failed to update doctor." : "Failed to add doctor.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete Dr. ${doctor.name}? This cannot be undone.`)) return;
    try {
      setDeletingId(doctor.id);
      await axios.delete(`${API}/doctors/${doctor.id}`);
      setDoctors(prev => prev.filter(d => d.id !== doctor.id));
      showToast("Doctor deleted successfully.");
    } catch (err) {
      console.log("Delete error:", err);
      showToast("Failed to delete doctor.", "error");
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

      <div className="bg-blue-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
              <p className="text-gray-500 text-lg">Book appointments with the best doctors and specialists.</p>
            </div>
            <button onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-6 py-2.5 shadow-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Add Doctor
            </button>
          </div>
          <div className="mt-8 flex gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                placeholder="Search by name, specialty, or department..."
                className="pl-10 h-12 w-full rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="h-12 rounded-xl px-4 bg-white border border-gray-200 hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-5 w-5" /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {doctors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No doctors found. Add one to get started.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, idx) => (
              <motion.div key={doctor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <div className="overflow-hidden rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group bg-white h-full flex flex-col">
                  <div className="p-6 flex gap-4 items-start border-b border-gray-50">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
                        alt={doctor.name}
                        className="w-20 h-20 rounded-2xl object-cover shadow-md"
                      />
                      <span className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${doctor.available ? "bg-green-500" : "bg-red-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium text-sm mb-1">{doctor.specialty}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Apollo Hospital, City
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Experience</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-400" /> {doctor.experience} Years
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Rating</p>
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {doctor.rating || 4.5}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">Consultation</p>
                        <p className="font-bold text-gray-900">${doctor.consultationFee}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(doctor)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(doctor)} disabled={deletingId === doctor.id}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium disabled:opacity-50">
                          <Trash2 className="h-3 w-3" />
                          {deletingId === doctor.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIsFormOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input placeholder="Dr. John Doe" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Specialty</label>
                    <input placeholder="e.g. Cardiologist" value={form.specialty}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    {errors.specialty && <p className="text-xs text-red-500">{errors.specialty}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input placeholder="e.g. Cardiology" value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Experience (Years)</label>
                    <input type="number" min="0" value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    {errors.experience && <p className="text-xs text-red-500">{errors.experience}</p>}
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                    <input type="number" min="0" value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-medium text-gray-700">Short Bio</label>
                    <input placeholder="A brief description..." value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsFormOpen(false)}
                    className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                    {submitting ? "Saving..." : editingDoctor ? "Save Changes" : "Add Doctor"}
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