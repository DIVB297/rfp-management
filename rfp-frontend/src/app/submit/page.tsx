'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitRFP() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    projectTitle: '',
    projectDescription: '',
    budget: '',
    deadline: '',
    requirements: ''
  });

  // Fetch available vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rfps/vendors`);
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const toggleVendor = (vendor: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendor) 
        ? prev.filter(v => v !== vendor)
        : [...prev, vendor]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof typeof formData]);
      });

      // Add selected vendors
      formDataToSend.append('selectedVendors', JSON.stringify(selectedVendors));

      // Handle file attachments
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput && fileInput.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formDataToSend.append('attachments', fileInput.files[i]);
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rfps`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        alert('RFP submitted successfully! You will receive a confirmation email shortly.');
        router.push('/rfps');
      } else {
        alert(data.message || 'Error submitting RFP');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting RFP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">RFP Management System</h1>
            </Link>
            <Link href="/rfps">
              <button className="text-blue-600 hover:text-blue-800">View All RFPs</button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Submit New RFP</h2>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($) *
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={4}
                placeholder="List your project requirements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (optional)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can upload up to 5 files (PDF, DOC, DOCX, XLS, XLSX, TXT - max 10MB each)
              </p>
            </div> */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Vendors to Notify *
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                {vendors.length === 0 ? (
                  <p className="text-gray-500 text-sm">Loading vendors...</p>
                ) : (
                  <div className="space-y-2">
                    {vendors.map((vendor) => (
                      <label key={vendor} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor)}
                          onChange={() => toggleVendor(vendor)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{vendor}</span>
                      </label>
                    ))}
                  </div>
                )}
                {vendors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      {selectedVendors.length === 0 
                        ? 'If no vendor is selected, all vendors will be notified.'
                        : `${selectedVendors.length} vendor${selectedVendors.length > 1 ? 's' : ''} selected`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit RFP'}
            </button>
            <Link href="/" className="flex-1">
              <button
                type="button"
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
