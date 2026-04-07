import { Layout } from "../components/layout/Layout";
import { motion } from "framer-motion";
import { HeartPulse, Brain, Bone, Baby, Eye, Cigarette, Activity, Stethoscope } from "lucide-react";
import { Link } from "wouter";

const iconMap = {
  Cardiology: HeartPulse,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Ophthalmology: Eye,
  Pulmonology: Cigarette,
  General: Activity,
};

const departments = [
  { id: 1, name: "Cardiology", description: "Comprehensive heart care including diagnostics, surgery, and rehabilitation.", doctorCount: 12 },
  { id: 2, name: "Neurology", description: "Advanced treatment for brain, spine, and nervous system disorders.", doctorCount: 8 },
  { id: 3, name: "Orthopedics", description: "Expert care for bones, joints, ligaments, tendons, and muscles.", doctorCount: 15 },
  { id: 4, name: "Pediatrics", description: "Dedicated healthcare services for infants, children, and adolescents.", doctorCount: 10 },
  { id: 5, name: "Ophthalmology", description: "Complete eye care from routine exams to advanced surgical procedures.", doctorCount: 6 },
  { id: 6, name: "Pulmonology", description: "Specialized care for respiratory and lung-related conditions.", doctorCount: 5 },
];

export default function Departments() {
  return (
    <Layout>
      {/* Header */}
      <div className="bg-blue-50 border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Centers of Excellence
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Our hospital is equipped with state-of-the-art technology and specialized departments to provide comprehensive care.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, idx) => {
            const Icon = iconMap[dept.name] || Stethoscope;
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/doctors?department=${dept.name.toLowerCase()}`}>
                  <div className="p-8 h-full rounded-2xl border border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{dept.name}</h3>
                    <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                      {dept.description}
                    </p>
                    <div className="flex items-center text-sm font-semibold text-blue-600">
                      <span>{dept.doctorCount} Specialists</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}