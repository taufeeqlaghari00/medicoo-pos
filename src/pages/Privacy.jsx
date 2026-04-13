import { Shield, Lock, Database, Eye, UserCheck, Mail } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-100 blur-3xl"/>

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Shield className="text-white" size={28}/>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Privacy Policy</h1>
              <p className="text-slate-500 text-sm mt-1">Effective date: 01 January 2026 · Medicoo POS</p>
            </div>
          </div>

          <div className="prose max-w-none text-slate-600 space-y-6 text-sm leading-relaxed">
            <p className="text-base">
              At <span className="font-bold text-slate-800">Medicoo</span>, we value the privacy of our users — pharmacies, staff and customers.
              This policy explains how we collect, use and protect the information handled by the POS system.
            </p>

            <Section icon={Database} title="1. Data We Store Locally">
              All sales, inventory, customers, suppliers and employee records are stored <strong>offline</strong> inside
              your browser's secure IndexedDB. No data leaves your device unless you explicitly enable cloud sync.
            </Section>

            <Section icon={Lock} title="2. Admin & Employee Information">
              The admin account holds authority over all settings. Employee information (name, CNIC, phone, salary)
              is protected behind the admin password and should only be accessed by authorized personnel.
            </Section>

            <Section icon={Eye} title="3. Customer Records">
              Customer name, phone number, purchase history and outstanding udhaar are used solely to provide
              accurate billing and credit management. We never share customer data with third parties.
            </Section>

            <Section icon={UserCheck} title="4. Your Rights">
              You can view, edit or delete any record at any time. Deleting a customer or employee removes their
              information immediately from the local database. Voided sales are retained for audit purposes.
            </Section>

            <Section icon={Shield} title="5. Security">
              Medicoo uses modern encryption standards in transit. Admin passwords should be changed from the
              default on first login. Never share your admin credentials with anyone.
            </Section>

            <Section icon={Mail} title="6. Contact">
              For privacy concerns, please contact the pharmacy administrator or the service provider
              <span className="font-bold text-brand-700"> Taufeeq Laghari</span>.
            </Section>

            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-100 text-slate-700">
              <strong className="text-slate-900">DRAP Compliance:</strong> Medicoo is designed to assist Pakistani pharmacies
              in maintaining records required by the Drug Regulatory Authority of Pakistan. Licensed pharmacists remain
              responsible for regulatory compliance.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg font-black text-slate-800 mb-2">
        <Icon size={18} className="text-brand-600"/> {title}
      </h3>
      <p>{children}</p>
    </div>
  )
}
