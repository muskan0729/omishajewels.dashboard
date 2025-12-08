import { useEffect, useState, useContext } from "react";
import Modal from "../GlideModal/UI/Modal";
import { PaymentContext } from "../../contexts/PaymentContext";
import { paymentService } from "../../services/paymentService";

export default function ReviewPaymentModal({
    open,
    pgSessionId,
    onConfirm,
    onClose,
    onDecryptedSession,
    loading: glideLoading = false, // receive loading from parent
}) {
    const { token } = useContext(PaymentContext);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    
    useEffect(() => {
        if (!pgSessionId) return;
        
        (async () => {
            const res = await paymentService.fetchReviewPayment(pgSessionId, token);
            if (res?.data) {
                const decryptedSessionId = res.data.session_id;

                setDetails({
                    sessionId: res.data.session_id,
                    amount: res.data.amount,
                    total: res.data.amount, // if total = amount (or modify later)
                    merchantName: res.data.merchant?.name ?? "",
                    merchantLogo: res.data.merchant?.logo ?? "", // only if available
                });

                // Send decrypted session ID back to landing component
                if (onDecryptedSession) onDecryptedSession(decryptedSessionId);
            }
            setLoading(false);
        })();
    }, [pgSessionId, token, onDecryptedSession]);

    if (!details || loading) {
        return (
            <Modal open={open}>
                <div className="py-10 text-center">Loading...</div>
            </Modal>
        );
    }

    const { merchantName, merchantLogo, amount, total, sessionId } = details;

    return (
        <Modal open={open}>
            <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    {/* <img src={merchantLogo} className="w-12 h-12 rounded-lg" alt="merchant" /> */}
                    <div>
                        <p className="text-xl font-semibold">{merchantName}</p>
                        <p className="text-sm text-gray-500">Payment Request</p>
                    </div>
                </div>

                <p className="text-2xl font-bold mb-1 text-center">Review Payment</p>
                <p className="text-center text-gray-500 mb-6">
                    Please confirm the details
                </p>

                {/* Amount Box */}
                <div className="space-y-4">
                    <div className="p-4 bg-gray-100 rounded-xl">
                        <div className="flex justify-between">
                            <p>Amount</p>
                            <p>₹ {amount}</p>
                        </div>
                        <hr className="my-2 opacity-40" />
                        <div className="flex justify-between font-semibold text-lg">
                            <p>Total</p>
                            <p>₹ {total}</p>
                        </div>
                    </div>

                    {/* Session ID */}
                    <div className="p-4 bg-gray-100 rounded-xl">
                        {/* <p className="text-sm text-gray-500">Session ID</p>
                        <p>{sessionId}</p> */}
                        <p className="text-xs text-orange-600 mt-1">
                            Valid for 10 minutes
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <button
                    onClick={onConfirm}
                    disabled={glideLoading} // disable while Glide is opening
                    className={`w-full py-3 rounded-xl mt-6 text-lg font-semibold ${
                        glideLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#615141] text-white"
                    }`}
                >
                    {glideLoading ? "Opening Payment..." : "Confirm & Continue"}
                </button>
                <button
                    onClick={onClose}
                    className="w-full mt-3 text-gray-500 text-sm underline"
                >
                Cancel
                </button>

                <p className="text-center text-xs text-gray-400 mt-6">
                Secured by <span className="font-semibold">Spay Fintech pvt ltd</span>
                </p>
            </div>
        </Modal>
    );
}