import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Heart, Loader2, AlertTriangle } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

const DonationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [donationAmount, setDonationAmount] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const donationId = params.get('donation_id');
    
    console.log("=== DONATION SUCCESS PAGE ===");
    console.log("Session ID:", sessionId);
    console.log("Donation ID:", donationId);
    
    if (sessionId) {
      verifyPayment(sessionId, donationId);
    } else {
      setStatus('error');
      setMessage('No payment session found');
    }
  }, [location]);

  const verifyPayment = async (sessionId, donationId) => {
    try {
      console.log("Calling verify API...");
      const response = await fetch(`http://localhost:5000/Rebuildhub/donations/verify-payment?session_id=${sessionId}&donation_id=${donationId}`);
      const result = await response.json();
      
      console.log("Verify response:", result);
      
      if (result.success) {
        setStatus('success');
        setMessage('Your donation has been successfully processed!');
        setDonationAmount(result.donation?.amount);
        showAlert('Your donation has been successfully processed!', { variant: 'success' });
      } else {
        setStatus('error');
        setMessage(result.message || 'Payment verification failed');
        showAlert(result.message || 'Payment verification failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Failed to verify payment. Please contact support.');
      showAlert('Failed to verify payment. Please contact support.', { variant: 'error' });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Verifying your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl border border-blue-200">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Payment Successful!</h3>
            <p className="text-blue-600 mb-2">{message}</p>
            {donationAmount && (
              <p className="text-lg font-semibold text-green-600 mb-4">
                Amount: LKR {donationAmount.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Your contribution will help save lives and support disaster-affected communities.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Error</h3>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}
        
        <button
          onClick={() => navigate('/resources')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          Return to Resources
        </button>
      </div>
    </div>
  );
};

export default DonationSuccess;