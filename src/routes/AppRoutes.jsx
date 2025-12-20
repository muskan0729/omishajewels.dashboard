import { Routes, Route } from "react-router-dom";

import Scheme from "../pages/Scheme";
import Loadwallet from "../pages/LoadWallet";
import Payinsettlement from "../pages/PayinSettlement";
import Payoutrequest from "../pages/Payoutrequest";
import LoginForm from "../pages/LoginForm";
import RegisterForm from "../pages/RegisterForm";
import VerifyOtp from "../pages/VerifyOtp";
import MerchantSuccess from "../pages/MerchantSuccess";

import MemberUserForm from "../pages/MemberUserForm";
import { MemberOnboardForm } from "../pages/MemberOnboardForm";
import { Member } from "../pages/Member";
import { Dashboard } from "../pages/Dashboard";
import UpiStatement from "../pages/UpiStatement";
import CryptoStatement from "../pages/CryptoStatement";
import PayoutStatement from "../pages/PayoutStatement";
import { ViewComplain } from "../pages/ViewComplain";
import OnboardBank from "../pages/OnboardBank";
import { PayinRequest } from "../pages/PayinRequest";
import Payindoc from "../pages/payindoc";
import Acc_upi_setlement from "../pages/Acc_upi_setlement";
import Acc_topup_settlement from "../pages/Acc_topup_settlement";
import PayoutDoc from "../pages/PayoutDoc";
import ApiSetting from "../pages/ApiSetting";
import FileUpload from "../pages/FileUpload";
import { Profile } from "../pages/Profile";
import Layout from "../components/Layout";
import PrivateRoute from "../components/PrivateRoute";
import SpayGlidePGWidget from "../pages/SpayGlidePGWidget";
import SpayGlidePGCancel from "../pages/SpayGlidePGCancel";
import SpayGlidePGSuccess from "../pages/SpayGlidePGSuccess";
import SpayGlidePGError from "../pages/SpayGlidePGError";
import MerchantDetails from "../pages/MerchantDetails";

const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/spay-glide-pgwidget" element={ <SpayGlidePGWidget/> } />
            <Route path="/spay-glide-pgsuccess" element={ <SpayGlidePGSuccess/> } />
            <Route path="/spay-glide-pgcancel" element={ <SpayGlidePGCancel/> } />
            <Route path="/spay-glide-pgerror" element={ <SpayGlidePGError/> } />
            <Route path="/" element={<LoginForm />} />
             <Route path="/register" element={<RegisterForm />} />
             <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/MemberUserForm" element={<MemberUserForm />} />
            <Route path="/merchant-success" element={<MerchantSuccess />} />

            <Route element={<Layout />}>
                <Route 
                    path="/profile" 
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/payout-request"
                    element={
                        <PrivateRoute>
                            <Payoutrequest />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/payin-request"
                    element={
                        <PrivateRoute>
                            <PayinRequest />
                        </PrivateRoute>
                    }
                />
                <Route 
                    path="/scheme"
                    element={
                        <PrivateRoute role={"admin"}>
                            <Scheme />
                        </PrivateRoute>
                    } 
                />
                <Route
                    path="/load-wallet"
                    element={
                    <PrivateRoute role={"admin"}>
                        <Loadwallet />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payin-settlement"
                    element={
                    <PrivateRoute role={"admin"}>
                        <Payinsettlement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/member-list"
                    element={
                    <PrivateRoute role={"admin"}>
                        <Member />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/member-create"
                    element={
                    <PrivateRoute role={"admin"}>
                        <MemberOnboardForm />
                    </PrivateRoute>
                    }
                />
                <Route
                path = "/MerchantDetails/:id"
                element = {
                    <PrivateRoute role = {"admin"}>
                        <MerchantDetails />
                    </PrivateRoute>
                }
                />
                <Route
                    path="/upi-statement"
                    element={
                    <PrivateRoute>
                        <UpiStatement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payout-statement"
                    element={
                    <PrivateRoute>
                        <PayoutStatement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/crypto-statement"
                    element={
                    <PrivateRoute>
                        <CryptoStatement />
                    </PrivateRoute>
                    }
                />
                <Route
  path="/file-upload"
  element={
    <PrivateRoute>
      <FileUpload />
    </PrivateRoute>
  }
/>
                <Route
                    path="/view-complain"
                    element={
                    <PrivateRoute>
                        <ViewComplain />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/onboard-bank"
                    element={
                    <PrivateRoute role={"admin"}>
                        <OnboardBank />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payin-doc"
                    element={
                    <PrivateRoute role={"user"}>
                        <Payindoc />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payout-doc"
                    element={
                    <PrivateRoute role={"user"}>
                        <PayoutDoc />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/topup-statement"
                    element={
                    <PrivateRoute>
                        <Acc_topup_settlement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/settlement-payin-statement"
                    element={
                    <PrivateRoute>
                        <Acc_upi_setlement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/api-settings"
                    element={
                    <PrivateRoute>
                        <ApiSetting />
                    </PrivateRoute>
                    }
                /> 
            </Route>
        </Routes>
    )
}

export default AppRoutes;