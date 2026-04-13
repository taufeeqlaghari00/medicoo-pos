import { FileText, Scale, AlertTriangle, Gavel, BookOpen, Ban } from 'lucide-react'

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card p-10 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-amber-100 blur-3xl"/>

        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <FileText className="text-white" size={28}/>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Terms & Conditions</h1>
              <p className="text-slate-500 text-sm mt-1">Last updated: 01 January 2026 · Medicoo POS</p>
            </div>
          </div>

          <div className="text-slate-600 space-y-6 text-sm leading-relaxed">
            <p className="text-base">
              By using <span className="font-bold text-slate-800">Medicoo</span> you agree to these terms. Please read carefully.
              These terms govern your use of the POS software.
            </p>

            <Section icon={BookOpen} title="1. Acceptance of Terms">
              By installing, opening or operating Medicoo, you confirm that you are an authorized representative of
              a licensed pharmacy in Pakistan and agree to comply with all applicable laws including the DRAP Act 2012.
            </Section>

            <Section icon={Scale} title="2. License">
              Medicoo is provided to you as a non-exclusive, non-transferable license for use in your pharmacy. You
              may not resell, redistribute, or reverse-engineer the software without written permission from the
              service provider.
            </Section>

            <Section icon={AlertTriangle} title="3. Use of the System">
              You are responsible for the accuracy of data entered, including prices, batches, expiry dates and
              customer records. Medicoo is a tool — final responsibility for stock, tax and sales accuracy lies with
              the pharmacy.
            </Section>

            <Section icon={Ban} title="4. Prohibited Activities">
              You may not use Medicoo to sell prescription medicines without a valid prescription, store false tax
              information, or bypass regulatory requirements. Misuse will result in license termination.
            </Section>

            <Section icon={Gavel} title="5. Limitation of Liability">
              Medicoo is provided "as is" without warranties. The service provider is not liable for any loss of
              data, revenue, regulatory action or damages arising from use or inability to use the software.
            </Section>

            <Section icon={FileText} title="6. Taxes & Compliance">
              GST rates, NTN, STRN and all tax-related information must be configured correctly by the pharmacy.
              Medicoo calculates based on what you configure and does not guarantee compliance with FBR requirements.
            </Section>

            <Section icon={Scale} title="7. Governing Law">
              These terms are governed by the laws of the Islamic Republic of Pakistan. Any dispute shall be
              subject to the exclusive jurisdiction of the courts in the jurisdiction where the pharmacy is licensed.
            </Section>

            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-slate-700">
              <strong className="text-slate-900">Contact:</strong> For legal questions or license inquiries, contact the
              service provider <span className="font-bold text-amber-700">Taufeeq Laghari</span>.
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
        <Icon size={18} className="text-amber-600"/> {title}
      </h3>
      <p>{children}</p>
    </div>
  )
}
