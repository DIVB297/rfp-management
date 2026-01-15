'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface RFP {
  _id: string;
  projectTitle: string;
  companyName: string;
  projectDescription: string;
  requirements: string;
  budget: number;
  deadline: string;
  selectedVendors: string[];
  status: string;
  createdAt: string;
}

interface VendorResponse {
  _id: string;
  vendorEmail: string;
  vendorName: string;
  proposedPrice?: number;
  timeline?: string;
  experience?: string;
  teamSize?: number;
  approach?: string;
  emailSubject?: string;
  emailBody?: string;
  receivedAt?: string;
  submittedAt?: string;
  status: string;
  attachments?: Array<{
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  }>;
  aiAnalysis?: {
    analysis?: {
      score?: number;
      recommendation?: string;
      strengths?: string[];
      weaknesses?: string[];
      concerns?: string[];
      budgetAnalysis?: string;
      timelineAnalysis?: string;
      riskAssessment?: string | {
        potentialRisks?: string[];
        riskLevel?: string;
      };
      keyInsights?: string;
      structuredDetails?: {
        coreCompetencies?: string[];
        deliverables?: string[];
        specialTerms?: string;
        uniqueSellingPoints?: string[];
      };
    };
  };
}

export default function RFPDetailPage() {
  const params = useParams();
  const rfpId = params.id as string;
  
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<VendorResponse | null>(null);

  useEffect(() => {
    const fetchRFP = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rfps/${rfpId}`);
        const data = await response.json();
        
        if (data.success) {
          setRfp(data.data);
        } else {
          setError(data.message || 'RFP not found');
        }
      } catch (err) {
        console.error('Error fetching RFP:', err);
        setError('Failed to load RFP');
      }
    };

    const fetchResponses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-responses/rfp/${rfpId}`);
        const data = await response.json();
        
        if (data.success) {
          setResponses(data.data);
        }
      } catch (err) {
        console.error('Error fetching responses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRFP();
    fetchResponses();
  }, [rfpId]);

  // Sort responses based on selected sort option
  const sortedResponses = [...responses].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = a.aiAnalysis?.analysis?.score || 0;
      const scoreB = b.aiAnalysis?.analysis?.score || 0;
      return scoreB - scoreA; // Highest score first
    } else {
      // Sort by date (receivedAt or submittedAt)
      const dateA = new Date(a.receivedAt || a.submittedAt || 0).getTime();
      const dateB = new Date(b.receivedAt || b.submittedAt || 0).getTime();
      return dateB - dateA; // Most recent first
    }
  });

  const handleAcceptResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to accept this vendor response? An acceptance email will be sent to the vendor.')) {
      return;
    }

    setAcceptingId(responseId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor-responses/${responseId}/accept`,
        { method: 'POST' }
      );
      const data = await response.json();

      if (data.success) {
        alert('Vendor response accepted! Acceptance email sent to vendor.');
        // Refresh the data
        const rfpResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rfps/${rfpId}`);
        const rfpData = await rfpResponse.json();
        if (rfpData.success) {
          setRfp(rfpData.data);
        }

        const responsesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-responses/rfp/${rfpId}`);
        const responsesData = await responsesResponse.json();
        if (responsesData.success) {
          setResponses(responsesData.data);
        }
      } else {
        alert('Failed to accept vendor response: ' + data.message);
      }
    } catch (error) {
      console.error('Error accepting vendor response:', error);
      alert('Error accepting vendor response. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RFP details...</p>
        </div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">RFP Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The RFP you are looking for does not exist.'}</p>
          <Link
            href="/rfps"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to RFPs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/rfps"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to RFPs
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{rfp.projectTitle}</h1>
              <p className="mt-2 text-gray-600">{rfp.companyName}</p>
            </div>
            {rfp.status === 'accepted' && (
              <div className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-3 rounded-lg shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-bold text-lg">RFP Accepted</div>
                    <div className="text-sm">Vendor has been notified</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RFP Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">RFP Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Project Description</h3>
              <p className="mt-1 text-gray-900">{rfp.projectDescription}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{rfp.requirements}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ${rfp.budget.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(rfp.deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${
                  rfp.status === 'open'
                    ? 'bg-green-100 text-green-800'
                    : rfp.status === 'accepted'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                    : rfp.status === 'closed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rfp.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Selected Vendors</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {rfp.selectedVendors && rfp.selectedVendors.length > 0 ? (
                  rfp.selectedVendors.map((vendor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {vendor}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No vendors selected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Responses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Vendor Responses ({responses.length})
              </h2>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      sortBy === 'date'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 Date
                  </button>
                  <button
                    onClick={() => setSortBy('score')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      sortBy === 'score'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⭐ AI Score
                  </button>
                </div>
              </div>
            </div>
          </div>

          {responses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No vendor responses yet for this RFP.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedResponses.map((response) => (
                <div key={response._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {response.vendorName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            response.status === 'analyzed'
                              ? 'bg-green-100 text-green-800'
                              : response.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : response.status === 'accepted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {response.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{response.vendorEmail}</p>

                      {response.emailSubject && (
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Subject:</span> {response.emailSubject}
                        </p>
                      )}

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {response.proposedPrice && (
                          <div>
                            <span className="text-xs text-gray-500">Proposed Price</span>
                            <p className="text-sm font-medium text-gray-900">
                              ${response.proposedPrice.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {response.timeline && (
                          <div>
                            <span className="text-xs text-gray-500">Timeline</span>
                            <p className="text-sm font-medium text-gray-900">{response.timeline}</p>
                          </div>
                        )}
                        {response.experience && (
                          <div>
                            <span className="text-xs text-gray-500">Experience</span>
                            <p className="text-sm font-medium text-gray-900">{response.experience}</p>
                          </div>
                        )}
                        {response.teamSize && (
                          <div>
                            <span className="text-xs text-gray-500">Team Size</span>
                            <p className="text-sm font-medium text-gray-900">{response.teamSize} members</p>
                          </div>
                        )}
                      </div>

                      {response.approach && (
                        <div className="mt-4">
                          <span className="text-xs text-gray-500">Approach</span>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                            {response.approach}
                          </p>
                        </div>
                      )}

                      {/* Attachments */}
                      {response.attachments && response.attachments.length > 0 && (
                        <div className="mt-4">
                          <span className="text-xs text-gray-500">Attachments ({response.attachments.length})</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {response.attachments.map((attachment: any, idx: number) => (
                              <a
                                key={idx}
                                href={`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-responses/attachment/${encodeURIComponent(attachment.path)}`}
                                download={attachment.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-blue-100 rounded text-xs border border-gray-300 hover:border-blue-400 transition-all cursor-pointer"
                                title={`Download ${attachment.filename}`}
                              >
                                <span>📎</span>
                                <span className="text-gray-700 truncate max-w-37.5">{attachment.filename}</span>
                                <span className="text-gray-500">({(attachment.size / 1024).toFixed(1)}KB)</span>
                                <span className="text-blue-600 ml-1">⬇</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {response.aiAnalysis?.analysis && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-blue-900">AI Analysis</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {response.aiAnalysis.analysis.score}/100
                            </span>
                          </div>

                          {response.aiAnalysis.analysis.recommendation && (
                            <p className="text-sm text-blue-800 mb-3">
                              {response.aiAnalysis.analysis.recommendation}
                            </p>
                          )}

                          {response.aiAnalysis.analysis.strengths && response.aiAnalysis.analysis.strengths.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-green-900 mb-1">Strengths:</p>
                              <ul className="text-xs text-green-800 list-disc list-inside space-y-0.5">
                                {response.aiAnalysis.analysis.strengths.map((strength, idx) => (
                                  <li key={idx}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {response.aiAnalysis.analysis.weaknesses && response.aiAnalysis.analysis.weaknesses.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-orange-900 mb-1">Concerns:</p>
                              <ul className="text-xs text-orange-800 list-disc list-inside space-y-0.5">
                                {response.aiAnalysis.analysis.weaknesses.map((concern, idx) => (
                                  <li key={idx}>{concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {response.receivedAt && (
                        <p className="text-xs text-gray-400 mt-3">
                          Received: {new Date(response.receivedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-4 shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                      >
                        Quick View
                      </button>
                      
                      {response.status === 'accepted' ? (
                        <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg text-center">
                          <div className="text-2xl mb-1">✓</div>
                          <div className="text-sm font-semibold">Accepted</div>
                        </div>
                      ) : rfp?.status === 'accepted' ? (
                        <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm text-center">
                          RFP Already Accepted
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcceptResponse(response._id)}
                          disabled={acceptingId === response._id}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            acceptingId === response._id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                          }`}
                        >
                          {acceptingId === response._id ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Accepting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span>✓</span>
                              Accept Proposal
                            </span>
                          )}
                        </button>
                      )}
                      
                      {response.aiAnalysis?.analysis?.score && (
                        <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium">AI Score</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {response.aiAnalysis.analysis.score}
                          </div>
                          <div className="text-xs text-blue-600">/100</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick View Modal */}
        {selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedResponse.vendorName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedResponse.vendorEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-light leading-none"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedResponse.status === 'analyzed'
                        ? 'bg-green-100 text-green-800'
                        : selectedResponse.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedResponse.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedResponse.status}
                  </span>
                </div>

                {/* Email Subject */}
                {selectedResponse.emailSubject && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Email Subject</h4>
                    <p className="text-gray-900">{selectedResponse.emailSubject}</p>
                  </div>
                )}

                {/* Proposal Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedResponse.proposedPrice && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Proposed Price</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        ${selectedResponse.proposedPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedResponse.timeline && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Timeline</h4>
                      <p className="text-xl font-semibold text-gray-900">{selectedResponse.timeline}</p>
                    </div>
                  )}
                  {selectedResponse.experience && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Experience</h4>
                      <p className="text-gray-900">{selectedResponse.experience}</p>
                    </div>
                  )}
                  {selectedResponse.teamSize && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Team Size</h4>
                      <p className="text-xl font-semibold text-gray-900">{selectedResponse.teamSize} members</p>
                    </div>
                  )}
                </div>

                {/* Email Content - Full Structured View */}
                {selectedResponse.emailBody && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">📧 Email Content</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedResponse.emailBody}
                      </p>
                    </div>
                  </div>
                )}

                {/* Approach (if different from email body) */}
                {selectedResponse.approach && selectedResponse.approach !== selectedResponse.emailBody && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">Approach Summary</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedResponse.approach}</p>
                  </div>
                )}

                {/* Attachments */}
                {selectedResponse.attachments && selectedResponse.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-3">
                      📎 Attachments ({selectedResponse.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedResponse.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-responses/attachment/${encodeURIComponent(attachment.path)}`}
                          download={attachment.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-400 transition-all cursor-pointer group"
                        >
                          <div className="text-2xl">📎</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                              {attachment.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.mimetype} • {(attachment.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">Download</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis - Deep Dive */}
                {selectedResponse.aiAnalysis?.analysis && (
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    {/* Header with Score */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-200">
                      <div>
                        <h4 className="text-2xl font-bold text-blue-900">🤖 AI Analysis Report</h4>
                        <p className="text-sm text-blue-700 mt-1">Comprehensive evaluation powered by GPT-4</p>
                      </div>
                      <div className="text-center bg-white rounded-lg p-4 shadow-md border-2 border-blue-300">
                        <div className="text-5xl font-bold text-blue-600">
                          {selectedResponse.aiAnalysis.analysis.score || 0}
                        </div>
                        <div className="text-sm font-semibold text-blue-600">/ 100</div>
                        <div className={`mt-2 text-xs font-bold ${
                          (selectedResponse.aiAnalysis.analysis.score || 0) >= 75 ? 'text-green-600' :
                          (selectedResponse.aiAnalysis.analysis.score || 0) >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {(selectedResponse.aiAnalysis.analysis.score || 0) >= 75 ? 'EXCELLENT' :
                           (selectedResponse.aiAnalysis.analysis.score || 0) >= 50 ? 'GOOD' : 'NEEDS REVIEW'}
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Badge */}
                    {selectedResponse.aiAnalysis.analysis.recommendation && (
                      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">📋</div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-blue-900 mb-1">Overall Recommendation</h5>
                            <p className="text-blue-800 font-medium">{selectedResponse.aiAnalysis.analysis.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Insights */}
                    {selectedResponse.aiAnalysis.analysis.keyInsights && (
                      <div className="mb-6 p-4 bg-linear-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">💡</div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-purple-900 mb-2">Executive Summary</h5>
                            <p className="text-sm text-purple-900 leading-relaxed">{selectedResponse.aiAnalysis.analysis.keyInsights}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strengths and Concerns - Side by Side */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {/* Strengths */}
                      {selectedResponse.aiAnalysis.analysis.strengths && selectedResponse.aiAnalysis.analysis.strengths.length > 0 && (
                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">✓</span>
                            <h5 className="text-base font-bold text-green-900">Strengths</h5>
                          </div>
                          <ul className="space-y-2">
                            {selectedResponse.aiAnalysis.analysis.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                                <span className="text-green-600 font-bold mt-0.5">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Concerns/Weaknesses */}
                      {((selectedResponse.aiAnalysis.analysis.weaknesses && selectedResponse.aiAnalysis.analysis.weaknesses.length > 0) || 
                       (selectedResponse.aiAnalysis.analysis.concerns && selectedResponse.aiAnalysis.analysis.concerns.length > 0)) && (
                        <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">⚠</span>
                            <h5 className="text-base font-bold text-orange-900">Concerns</h5>
                          </div>
                          <ul className="space-y-2">
                            {(selectedResponse.aiAnalysis.analysis.weaknesses || selectedResponse.aiAnalysis.analysis.concerns)?.map((concern, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                                <span className="text-orange-600 font-bold mt-0.5">•</span>
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Detailed Analysis Sections */}
                    <div className="space-y-4 mb-6">
                      <h5 className="text-base font-bold text-blue-900 flex items-center gap-2">
                        <span>📊</span> Detailed Analysis
                      </h5>
                      
                      {selectedResponse.aiAnalysis.analysis.budgetAnalysis && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                          <div className="flex items-start gap-3">
                            <div className="text-xl">💰</div>
                            <div className="flex-1">
                              <h6 className="text-sm font-bold text-gray-900 mb-1">Budget Analysis</h6>
                              <p className="text-sm text-gray-700 leading-relaxed">{selectedResponse.aiAnalysis.analysis.budgetAnalysis}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedResponse.aiAnalysis.analysis.timelineAnalysis && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                          <div className="flex items-start gap-3">
                            <div className="text-xl">⏱️</div>
                            <div className="flex-1">
                              <h6 className="text-sm font-bold text-gray-900 mb-1">Timeline Analysis</h6>
                              <p className="text-sm text-gray-700 leading-relaxed">{selectedResponse.aiAnalysis.analysis.timelineAnalysis}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedResponse.aiAnalysis.analysis.riskAssessment && (
                        <div className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-red-500">
                          <div className="flex items-start gap-3">
                            <div className="text-xl">🛡️</div>
                            <div className="flex-1">
                              <h6 className="text-sm font-bold text-gray-900 mb-1">Risk Assessment</h6>
                              {typeof selectedResponse.aiAnalysis.analysis.riskAssessment === 'string' ? (
                                <p className="text-sm text-gray-700 leading-relaxed">{selectedResponse.aiAnalysis.analysis.riskAssessment}</p>
                              ) : (
                                <div>
                                  {selectedResponse.aiAnalysis.analysis.riskAssessment.riskLevel && (
                                    <p className="text-sm font-semibold mb-2">Risk Level: <span className={`${
                                      selectedResponse.aiAnalysis.analysis.riskAssessment.riskLevel === 'High' ? 'text-red-600' :
                                      selectedResponse.aiAnalysis.analysis.riskAssessment.riskLevel === 'Medium' ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`}>{selectedResponse.aiAnalysis.analysis.riskAssessment.riskLevel}</span></p>
                                  )}
                                  {selectedResponse.aiAnalysis.analysis.riskAssessment.potentialRisks && (
                                    <ul className="list-disc list-inside space-y-1">
                                      {selectedResponse.aiAnalysis.analysis.riskAssessment.potentialRisks.map((risk, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">{risk}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Structured Details */}
                    {selectedResponse.aiAnalysis.analysis.structuredDetails && (
                      <div className="pt-4 border-t-2 border-blue-200">
                        <h5 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <span>🔍</span> Extracted Information
                        </h5>
                        <div className="space-y-4">
                        {selectedResponse.aiAnalysis.analysis.structuredDetails.coreCompetencies && 
                         selectedResponse.aiAnalysis.analysis.structuredDetails.coreCompetencies.length > 0 && (
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">🎯</span>
                              <h6 className="text-sm font-bold text-gray-900">Core Competencies</h6>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedResponse.aiAnalysis.analysis.structuredDetails.coreCompetencies.map((comp, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-semibold shadow-sm">
                                  {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedResponse.aiAnalysis.analysis.structuredDetails.deliverables && 
                         selectedResponse.aiAnalysis.analysis.structuredDetails.deliverables.length > 0 && (
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">📦</span>
                              <h6 className="text-sm font-bold text-gray-900">Deliverables</h6>
                            </div>
                            <ul className="space-y-2">
                              {selectedResponse.aiAnalysis.analysis.structuredDetails.deliverables.map((deliverable, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedResponse.aiAnalysis.analysis.structuredDetails.uniqueSellingPoints && 
                         selectedResponse.aiAnalysis.analysis.structuredDetails.uniqueSellingPoints.length > 0 && (
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">⭐</span>
                              <h6 className="text-sm font-bold text-gray-900">Unique Selling Points</h6>
                            </div>
                            <ul className="space-y-2">
                              {selectedResponse.aiAnalysis.analysis.structuredDetails.uniqueSellingPoints.map((usp, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-yellow-500 text-base">★</span>
                                  <span>{usp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedResponse.aiAnalysis.analysis.structuredDetails.specialTerms && (
                          <div className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">📋</span>
                              <h6 className="text-sm font-bold text-gray-900">Special Terms</h6>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedResponse.aiAnalysis.analysis.structuredDetails.specialTerms}
                            </p>
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Received Date */}
                {selectedResponse.receivedAt && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Received:</span>{' '}
                    {new Date(selectedResponse.receivedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
                
                {selectedResponse.status !== 'accepted' && rfp?.status !== 'accepted' && (
                  <button
                    onClick={() => {
                      setSelectedResponse(null);
                      handleAcceptResponse(selectedResponse._id);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Accept Proposal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
