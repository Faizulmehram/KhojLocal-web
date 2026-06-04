import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...');

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    if (!sessionId) {
      setStatus('failed');
      setMessage('Invalid payment session');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setStatus('failed');
        setMessage('Please login to verify payment');
        return;
      }

      const user = JSON.parse(userStr);
      const token = user.token;
      
      const response = await axios.get(
        `${API_BASE_URL}/api/stripe/verify-session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.paymentStatus === 'paid') {
        setStatus('success');
        setMessage('Payment successful! Your booking/order has been confirmed.');
      } else {
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Failed to verify payment. Please contact support.');
    }
  };

  const handleContinue = () => {
    if (bookingId) {
      navigate('/my-bookings');
    } else if (orderId) {
      navigate('/my-orders');
    } else {
      navigate('/main');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === 'verifying' && (
            <>
              <Loader className="h-16 w-16 text-violet-600 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={handleContinue}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition"
              >
                {bookingId ? 'View My Bookings' : orderId ? 'View My Orders' : 'Go to Main Page'}
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/main')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Go to Main Page
                </button>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition"
                >
                  View Bookings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
