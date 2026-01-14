import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">RFP Management System</h1>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to RFP Management
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit and manage your Request for Proposals with ease
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/submit">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Submit RFP</h3>
              <p className="text-gray-600">
                Create and submit a new Request for Proposal with all your project details
              </p>
            </div>
          </Link>

          <Link href="/rfps">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">View RFPs & Sync Responses</h3>
              <p className="text-gray-600">
                Browse all RFPs, sync vendor email responses, and manage proposals
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 bg-blue-50 border-l-4 border-blue-500 p-6 max-w-4xl mx-auto">
          <h4 className="text-lg font-semibold text-blue-900 mb-2">Features</h4>
          <ul className="text-blue-800 space-y-2">
            <li>✓ Easy RFP submission with file attachments</li>
            <li>✓ Automatic email notifications to selected vendors</li>
            <li>✓ One-click email sync for vendor responses</li>
            <li>✓ AI-powered vendor analysis and scoring</li>
            <li>✓ Accept vendors with automatic email notifications</li>
            <li>✓ Sort responses by date or AI score</li>
            <li>✓ Track RFP status in real-time</li>
            <li>✓ Simple and intuitive interface</li>
          </ul>
        </div>
      </main>
    </div>
  );
}