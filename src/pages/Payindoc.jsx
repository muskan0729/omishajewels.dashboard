import React, { useEffect, useState } from "react";
import "../css/documents.css";
import { useGet } from "../hooks/useGet";

const PayinDoc = () => {
  const [activeSection, setActiveSection] = useState("payin-request");
  const [apiSections, setApiSections] = useState([]);
  const { data: WebhookUrl, loading: WebHookLoading } =
    useGet("/show-merchant/${id}");
console.log("webhookurl", WebhookUrl);
const merchant = WebhookUrl?.data;
const payinGateway = merchant?.payin_at_onboard;
const callbackUrl = merchant?.payin_callback;

useEffect(() => {
  if (!merchant) return;
  const AIRPAY_SECTIONS = [
  {
    id: "airpay-request",
    title: "Create Payin Payment Request",
    type: "api",
    endpoint: "POST https://dashboard.omishajewels.co.in/api/payin/request ",
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by Spay" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique transaction ID (merchant side) Maximum 20 Characters" },
      { field: "amount", type: "String", required: "Yes", description: "Transaction amount in INR" },
      { field: "name", type: "String", required: "Yes", description: "Customer's name" },     
      { field: "email", type: "String", required: "Yes", description: "Customer's email address" },
      { field: "phone", type: "String", required: "Yes", description: "Customer's 10-digit mobile number" },
    ],
    request: {
      curl: `
curl--location "https://dashboard.omishajewels.co.in/api/payin/request"
--form 'token="Sha6Nplm0pXXXXXxp8ABGQKUE6g"
--form 'orderid="TESTXXXX3117xX"
--form 'amount="10.00"
--form 'name="test_customer"
--form 'email="tXXX@gmail.com"
--form 'phone="1122XXXXX"
      `,
    },
    successResponse: {
      curl: `
{
"status_code": "200",
"status": "success",
"data": {
"qrcode_string": "upi://pay?
pa=XXXXXXX@ypbiz&pn=f59d23ac19020c989cd8566a4ea16646ad4e02f67516cedc3bd7d833
efdaXXXx&cu=INR&tn=Pay+to+f59d23ac19020c9XXXXXea16646ad4e02f67516cedc3bd7d833
efda516e&am=10.00&mam=10.00&mc=5999&mode=04&tr=XXXX 377960382&ver=1"
"txnid": "test09875645673"
}
      `,
    },
    errorExamples: [
      { code: "400", message: "Missing required fields: name,mobile, etc", cause: "Required fields are not included" },
      { code: "403", message: "Your PayIN account is deactivated. Please contact the administrator.", cause: "Payin deactivated by Admin" },
      { code: "409", message: "Transaction ID already exists", cause: "Duplicate orderid used" },
      { code: "401", message: "Unauthorized", cause: "Invalid or expired token or Authorization header" },
      { code: "422", message: "Amount must be more than ₹10", cause: "Invalid or zero amount" },
      { code: "500", message: "Internal Server Error", cause: "Unexpected server-side error" }
    ],
  },

  {
    id: "airpay-status",
    title: "Check Payment Status",
    type: "api",
    endpoint: "https://dashboard.omishajewels.co.in/api/payin/status",
    headers: "Content-Type: multipart/form-data; boundary=",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by SPay Dashboard" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique transaction identifier returned in the request api response" },
    ],
    request: {
      curl: `
curl--location POST "https://dashboard.omishajewels.co.in/api/payin/status"
--form token="Q9xRwseKPkXXXMWw6iseUtygT78wnHPji"
--form orderid="xi2TpoHXXXX0mSQU"
      `
    },
    successResponse: {
      curl: `
{
"message" : "Transaction Successfully done",
"success": "true",
"status": "success",
"Amount": "1.00",
"txnid" : "test2025101XXXXXXX,
}
      `
    },
    failedResponse: {
      curl: `
{
"Message": "Transaction failed",
"success": "false",
"Status": "FAILED",
"Amount": "1.00",
"txnid" : "test2025101XXXXXXX,
}
      `
    },

    errorExamples: [
        {
          code: "400",
          message: "Missing required fields:orderid ",
          cause: "Required query parameter not provided",
        },
        {
          code: "404",
          message: "Payin method not found",
          cause: "Incorrect or non-existent orderid", 
        },
        {
          code: "401",
          message: "Unauthorized",
          cause: "Invalid or expired token or Authorization header",
        },
        {
          code: "422",
          message: "Validation failed",
          cause: "orderid format is invalid",
        },
        {
          code: "500",
          message: "Internal Server Error",
          cause: "Unexpected server-side or cURL exception",
        },
      ],

    errorStatus:[
        {
          code: "success",
          message: "Payment was completed successfully",
        },
        {
          code: "failed",
          message: "Payment failed",
        },
        {
          code: "pending",
          message: "Payment is in process and pending confirmation",
        },
      ],     
    
  },

  {
    id: "airpay-callback",
    title: "Callback Response",
    type: "callback",
    content: {
      endpoint: callbackUrl || "Callback URL not configured",
      successResponse: `
{
"status": "success",
"txnid": "SPAYXXX0004",
"clienttxnid": "YUVXXXXX",
"amount": "1.00",
"transactionid": "6408204XXX"
"timestamp":"2025-XX-XX 15:27:47"
}
      `,
      failedResponse: `
{
"status":"failed",
"txnid":"SPAY2025XXXX",
"clienttxnid":"TXN0XXX59",
"amount":1.00,
"transactionid":"6544XXX39",
"timestamp":"2025-XX-XX 15:27:47"
}
      `
    }
  },
  
];
  setApiSections(AIRPAY_SECTIONS);
  setActiveSection("airpay-request");

}, [merchant]); // 🔥 VERY IMPORTANT

useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // remove if you want instant
  });
}, [activeSection]);
  
// useEffect(() => {
//   setApiSections(AIRPAY_SECTIONS);
//   setActiveSection("airpay-request");
// }, []);

  const activeApi = apiSections.find((s) => s.id === activeSection);
  // -----------------------------------------
  const renderContent = () => {
    if (!activeApi) return <p>Loading...</p>;

    switch (activeApi.type) {
      case "api":
        return (
          <>
            <div className="content-header">
              <h1>{activeApi.title}</h1>
              <br />
              <h4><span style={{ color: "green", fontWeight: 700 }}>ENDPOINT :</span><br /><br />{activeApi.endpoint}</h4>
              <br />
              <h4><span style={{ color: "green", fontWeight: 700 }}>HEADERS :</span><br /><br />{activeApi.headers}</h4>
            </div>

            <div className="parameters-section">
               <h2>Request Body Parameters</h2>
               <table className="parameters-table">
                 <thead>
                   <tr>
                     <th>Field</th>
                     <th>Type</th>
                     <th>Required</th>
                     <th>Description</th>
                   </tr>
                 </thead>
                 <tbody>
                   {activeApi.parameters.map((param, index) => (
                    <tr key={index}>
                      <td>
                        <code className="field-code">{param.field}</code>
                      </td>
                      <td>{param.type}</td>
                      <td>
                        <span
                          className={`required-badge ${
                            param.required === "Yes"
                              ? "required-yes"
                              : "required-no"
                          }`}
                        >
                          {param.required}
                        </span>
                      </td>
                      <td>{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="request-section">
              <h2>Sample Request </h2>
              <div className="code-block">
                <pre>{activeApi.request.curl}</pre>
              </div>
            </div>
            <div className="request-section">
              <h2>cURL success Response</h2>
              <div className="code-block">
                <pre>{activeApi.successResponse.curl}</pre>
              </div>
            </div>
            {activeApi.failedResponse && (
              <div className="request-section">
                <h2>cURL failed Response</h2>
                <div className="code-block">
                  <pre>{activeApi.failedResponse.curl}</pre>
                </div>
              </div>
            )}

            {activeApi.errorExamples && (
              <div className="error-examples-section">
                <h2>Error Response Examples</h2>  
                <table className="error-examples-table">
                  <thead>
                    <tr>
                      <th>Error Code</th>
                      <th>Message</th>
                      <th>Cause</th>
                    </tr>
                  </thead> 
                  <tbody>
                    {activeApi.errorExamples.map((error, index) => (
                      <tr key={index}>
                        <td>
                          <code className="error-code-badge">{error.code}</code>
                        </td>
                        <td>{error.message}</td>
                        <td>{error.cause}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeApi.errorStatus && (
              <div className="error-status-section mt-10">
                <h2>status values in data.status</h2>
                <table className="error-status-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Meaning</th>
                      {/* <th>Cause</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {activeApi.errorStatus.map((error, index) => (
                      <tr key={index}>
                        <td>
                          <code className="error-status-badge">{error.code}</code>
                        </td>
                        <td>{error.message}</td>
                      
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );

      case "callback":
        return (
          <div className="content-section">
            <h1>
              <b>{activeApi.title}</b>
            </h1>

            <div className="info-box">
              <h3>User Callback Endpoint</h3>
              <div className="endpoint-block">
                <code>{activeApi.content.endpoint}</code>
              </div>
            </div>

            <div className="response-examples">
              <div className="response-example">
                <h3 style={{ color: "#10b981" }}>
                  ✅ Callback Success Response
                </h3>
                <div className="code-block success-code">
                  <pre>{activeApi.content.successResponse}</pre>
                </div>
              </div>

              <div className="response-example">
                <h3 style={{ color: "#ef4444" }}>
                  ❌ Callback Failed Response
                </h3>
                <div className="code-block error-code">
                  <pre>{activeApi.content.failedResponse}</pre>
                </div>
                <p className="mt-15">
                  <strong>
                    <span className="text-red-400">Note:</span> Callback response{" "}
                    (<span className="text-red-400">success or failure</span>) will be sent to your webhook/callback endpoint. Failed response will be sent after 20 minutes if payment is not completed.
                  </strong>
                </p>
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="content-section">
            <h1>{activeApi.title}</h1>
            <div className="guidelines-box">
              <h3>Integration Guidelines</h3>
              <div className="guidelines-list">
                {activeApi.content.map((guideline, index) => (
                  <div key={index} className="guideline-item">
                    <h4 className="guideline-title">{guideline.title}</h4>
                    <p className="guideline-description">
                      {guideline.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

  
      default:
        return (
          <div className="content-section">
            <h1>{activeApi.title}</h1>
            <p>Content for this section is being prepared.</p>
          </div>
        );
    }
  };

  return (
    <div className="api-doc-container">

      {/* Sidebar */}
      <div className="api-doc-sidebar">
        <div className="sidebar-header">
          <h2>API Documentation</h2>

        </div>

        <nav className="sidebar-nav">
          {apiSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`nav-item ${activeSection === section.id ? "nav-item-active" : ""}`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="api-doc-content">
        <div className="content-wrapper">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PayinDoc;

