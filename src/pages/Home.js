import { Layout } from "../components/layout/Layout";
import { motion } from "framer-motion";
import {
  Search, Calendar, Stethoscope, FileText, ShieldPlus,
  Pill, HeartPulse, Brain, Bone, Baby, Eye, Activity,
} from "lucide-react";
import { Link } from "wouter";

const quickActions = [
  { title: "Book Appointment", icon: Calendar, color: "bg-blue-100 text-blue-600", href: "/appointments" },
  { title: "Find Doctors", icon: Stethoscope, color: "bg-teal-100 text-teal-600", href: "/doctors" },
  { title: "Lab Tests", icon: FileText, color: "bg-purple-100 text-purple-600", href: "/departments" },
  { title: "Health Insurance", icon: ShieldPlus, color: "bg-green-100 text-green-600", href: "/" },
  { title: "Buy Medicines", icon: Pill, color: "bg-orange-100 text-orange-600", href: "/" },
];

const conditions = [
  { title: "Cardiology", icon: HeartPulse },
  { title: "Neurology", icon: Brain },
  { title: "Orthopedics", icon: Bone },
  { title: "Pediatrics", icon: Baby },
  { title: "Ophthalmology", icon: Eye },
  { title: "General Health", icon: Activity },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-70" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-6 border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                World-class healthcare is now closer
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                Your Health is Our <br />
                <span className="text-blue-600">Top Priority</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0">
                Book appointments, access records, and consult top specialists all in one place.
              </p>
              <div className="flex max-w-md mx-auto lg:mx-0 bg-white p-2 rounded-2xl shadow-lg border">
                <div className="flex-1 flex items-center px-4">
                  <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    placeholder="Search doctors, specialties, or conditions..."
                    className="border-0 focus:outline-none w-full text-sm h-10 bg-transparent"
                  />
                </div>
                <button className="h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800&h=900"
                alt="Doctor"
                className="rounded-[2.5rem] shadow-2xl object-cover h-[600px] w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldPlus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Verified Professionals</p>
                  <p className="text-xl font-bold">500+ Doctors</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="font-semibold text-sm text-center">{action.title}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Specialties</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Find experienced specialists for specific health conditions.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {conditions.map((c, i) => {
              const Icon = c.icon;
              return (
                <Link href={`/doctors?department=${c.title.toLowerCase()}`} key={i}>
                  <div className="bg-white p-6 rounded-2xl border hover:border-blue-400 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer">
                    <Icon className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-sm">{c.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/departments">
              <button className="rounded-full px-8 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-colors">
                View All Specialties
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              ["2M+", "Patients Served"],
              ["500+", "Expert Doctors"],
              ["50+", "Specialties"],
              ["25+", "Years Experience"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="text-4xl lg:text-5xl font-bold mb-2">{stat}</p>
                <p className="text-blue-100 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}