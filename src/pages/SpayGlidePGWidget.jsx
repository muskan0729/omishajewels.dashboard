import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReviewPaymentModal from "../components/GlideModal/ReviewPaymentModal";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/login-background.jpg";
import { PaymentProvider } from "../contexts/PaymentContext";
import { useGlidePay } from '@paywithglide/glide-react';
import { paymentService } from "../services/paymentService"; // API calls

function SpayGlidePGWidget() {
    const navigate = useNavigate();
    const [pgModalOpen, setPGModalOpen] = useState(false);
    const [pgSessionId, setPGSessionId] = useState(null);
    const [decryptedSessionId, setDecryptedSessionId] = useState(null); // New state
    const glideAppId = import.meta.env.VITE_GLIDE_WIDGET_APP_ID;
    const [pgStatus, setStatus] = useState(""); // Track payment status
    const [pgTxHash, setTxHash] = useState(null); // Store transaction hash
    const [ loadingGlide, setLoadingGlide ] = useState(false); //Loader state

    const handleDecryptedSession = (sessionId) => {
        console.log("Decrypted session ID:", sessionId);
        setDecryptedSessionId(sessionId);
    };

    // Hook must be called at top level
    const { openGlidePay } = useGlidePay({
        app: glideAppId,      // Replace with actual App ID
        sessionId: decryptedSessionId, // Pass the state variable
        preferGaslessPayment: true,

         // Payment successful
        onSuccess: async (txHash) => {
            setStatus("success");
            setTxHash(txHash);
            setLoadingGlide(false); // stop loading
            console.log("Payment successful:", txHash);

            // we will call backend API to verify payment
            // Call backend API for success
            try {
                await paymentService.fetchPaymentSuccess({ sessionId: decryptedSessionId, txHash });
                console.log("Success API called");
            } catch (error) {
                console.error("Error calling success API:", error);
            }

            // Redirect back to review page
            navigate("/spay-glide-pgsuccess");
        },

        // Payment failed or error
        onError: async (error) => {
            setStatus("error");
            console.error("Payment error:", error);
            setLoadingGlide(false);

            // Call backend API for error
            try {
                await paymentService.fetchPaymentError({ sessionId: decryptedSessionId, error });
                console.log("Error API called");
            } catch (err) {
                console.error("Error calling error API:", err);
            }

            navigate("/spay-glide-pgerror");
        },

        // Payment cancelled by user
        onCancel: async () => {
            setStatus("cancelled");
            console.warn("Payment cancelled by user");
            setLoadingGlide(false);
            
            // Call backend API for cancel
            try {
                await paymentService.fetchPaymentCancel({ sessionId: decryptedSessionId });
                console.log("Cancel API called");
            } catch (err) {
                console.error("Error calling cancel API:", err);
            }

            navigate("/spay-glide-pgcancel");
        },
        
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const session = params.get("session_id");
        
        if (session) {
            setPGSessionId(session);
            setPGModalOpen(true);
        }
    }, []);

    const handlePgConfirm = async () => {
        if (!decryptedSessionId) return; // safety check

        setLoadingGlide(true); // show loading while Glide popup opens
        setPGModalOpen(false);

        try{
            await openGlidePay(); // wait for Glide popup to open
        } catch (error) {
            console.error("Glide pay open error:", error);
            setLoadingGlide(false);
        }
    };

    const handlePgCancel = () => {
        setPGModalOpen(false);
        console.log("We are cancelling payment");
        navigate("/spay-glide-pgcancel");
    }

    return (
        <section className="bg-gray-100 min-h-screen flex items-center justify-center px-6">
            <div
                className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-70" 
                style={{ backgroundImage: `url(${paymentGatewayBg})` }}
            ></div>

             {/* Loading Modal */}
            {loadingGlide && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl text-center">
                        <p className="text-lg font-semibold">Redirectint to Glide Gateway...</p>
                    </div>
                </div>
            )}
               
            {pgSessionId && (
                <PaymentProvider>
                    <ReviewPaymentModal
                        open={pgModalOpen}
                        pgSessionId={pgSessionId}
                        onConfirm={handlePgConfirm}
                        onClose={handlePgCancel}
                        // onClose={() => navigate("/spay-glide-pgcancel")} // redirect on close
                        onDecryptedSession={handleDecryptedSession}
                        loading={loadingGlide} // new prop
                    />
                </PaymentProvider>
            )}
        </section>
    );
}

export default SpayGlidePGWidget;