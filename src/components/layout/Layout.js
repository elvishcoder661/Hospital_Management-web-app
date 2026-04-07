import { Navbar } from "./Navbar";

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <footer className="bg-white border-t mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="font-bold text-2xl">
                Apollo<span className="text-primary">Care</span>
              </span>
              <p className="mt-4 text-muted-foreground text-sm">
                Providing world-class healthcare with compassion for over 25 years.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/doctors" className="hover:text-primary">Find a Doctor</a></li>
                <li><a href="/appointments" className="hover:text-primary">Book Appointment</a></li>
                <li><a href="/departments" className="hover:text-primary">Departments</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Specialties</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Cardiology</li>
                <li>Neurology</li>
                <li>Orthopedics</li>
                <li>Pediatrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1-800-APOLLO (Toll Free)</li>
                <li>Emergency: 911 / 108</li>
                <li>info@apollocare.health</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ApolloCare Hospitals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}