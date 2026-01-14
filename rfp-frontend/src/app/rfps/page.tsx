'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RFP {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  projectTitle: string;
  projectDescription: string;
  budget: number;
  deadline: string;
  requirements: string;
  status: string;
  submittedAt: string;
  selectedVendors?: string[];
  responseCount?: number;
  acceptedCount?: number;
}

interface SyncResult {
  processed: number;
  created: number;
  errors: number;
  emails?: Array<{
    from: string;
    subject: string;
    rfpId: string;
  }>;
}

export default function RFPsList() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rfps`);
      const data = await response.json();
      if (data.success) {
        setRfps(data.data);
      }
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      alert('Error loading RFPs');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rfps/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        alert('Status updated successfully');
        fetchRFPs();
        setSelectedRfp(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/sync`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSyncResult(data.data);
        // Refresh RFPs to update response counts
        await fetchRFPs();
        alert(`Sync completed! Processed ${data.data.processed} emails, created ${data.data.created} new responses.`);
      } else {
        alert('Failed to sync emails: ' + data.message);
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
      alert('Error syncing emails. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'under-review': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'accepted': 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">RFP Management System</h1>
            </Link>
            <Link href="/submit">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Submit New RFP
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">All RFPs</h2>
          
          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-white font-medium shadow-md ${
              syncing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {syncing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing Emails...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sync Vendor Emails
              </>
            )}
          </button>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✓ Sync Completed Successfully</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>• Processed: <strong>{syncResult.processed}</strong> emails</p>
              <p>• New responses created: <strong>{syncResult.created}</strong></p>
              {syncResult.errors > 0 && <p>• Errors: <strong className="text-red-600">{syncResult.errors}</strong></p>}
            </div>
            {syncResult.emails && syncResult.emails.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-green-900 mb-1">New Vendor Responses:</p>
                <ul className="text-sm text-green-800 list-disc list-inside">
                  {syncResult.emails.map((email, idx) => (
                    <li key={idx}>{email.from} - {email.subject}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading RFPs...</p>
          </div>
        ) : rfps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No RFPs submitted yet</p>
            <Link href="/submit">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Submit First RFP
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {rfps.map((rfp) => (
              <div key={rfp._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{rfp.projectTitle}</h3>
                    <p className="text-gray-600">{rfp.companyName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(rfp.status)}`}>
                    {rfp.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="text-gray-900">{rfp.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{rfp.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-gray-900">${rfp.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="text-gray-900">{new Date(rfp.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{rfp.projectDescription}</p>

                {/* Vendor Response Stats */}
                {(rfp.responseCount !== undefined) && (
                  <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">📧 Responses:</span>
                      <span className="font-semibold text-blue-600">{rfp.responseCount}</span>
                    </div>
                    {rfp.acceptedCount !== undefined && rfp.acceptedCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">✅ Accepted:</span>
                        <span className="font-semibold text-green-600">{rfp.acceptedCount}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/rfps/${rfp._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm inline-block"
                  >
                    View Details & Responses
                  </Link>
                  <button
                    onClick={() => setSelectedRfp(rfp)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Quick View
                  </button>
                  <select
                    value={rfp.status}
                    onChange={(e) => updateStatus(rfp._id, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing RFP details */}
        {selectedRfp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedRfp.projectTitle}</h3>
                <button
                  onClick={() => setSelectedRfp(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Company</h4>
                  <p className="text-gray-900">{selectedRfp.companyName}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Contact Person</h4>
                    <p className="text-gray-900">{selectedRfp.contactPerson}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Email</h4>
                    <p className="text-gray-900">{selectedRfp.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Phone</h4>
                    <p className="text-gray-900">{selectedRfp.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedRfp.status)}`}>
                      {selectedRfp.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Project Description</h4>
                  <p className="text-gray-900">{selectedRfp.projectDescription}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Budget</h4>
                    <p className="text-gray-900">${selectedRfp.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Deadline</h4>
                    <p className="text-gray-900">{new Date(selectedRfp.deadline).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Requirements</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRfp.requirements}</p>
                </div>

                {selectedRfp.selectedVendors && selectedRfp.selectedVendors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-1">Notified Vendors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRfp.selectedVendors.map((vendor, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {vendor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Submitted At</h4>
                  <p className="text-gray-900">{new Date(selectedRfp.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRfp(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
