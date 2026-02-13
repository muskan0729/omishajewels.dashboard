import React, { useEffect, useState } from "react";
import "../css/documents.css";
import { useGet } from "../hooks/useGet";

const PayoutDoc = () => {
  const [activeSection, setActiveSection] = useState("payout-request");
  const [provider, setProvider] = useState("airpay"); // default until backend loads
  const [apiSections, setApiSections] = useState([]);

  // -----------------------------------------
  // 👉 LOAD PROVIDER FROM BACKEND
  // -----------------------------------------
  
  const { data: getmerchant } = useGet("/show-merchant/${id}");
  const [payoutGateway, setpayoutGateway] = useState(null);
  
    useEffect(() => {
      // Fetch selected Payout provider
      if (getmerchant?.data ) {
        setpayoutGateway(getmerchant.data.payout_at_onboard);
      }
    }, [getmerchant]);

  // console.log(getmerchant);
  console.log(payoutGateway);

// -----------------------------------------
// 👉 AIRPAY API DATA
// -----------------------------------------
  const CASHFREE_SECTIONS = [
  {
    id: "cashfree-request",
    title: "Create Payout Payment Request",
    type: "api1",
    endpoint: "POST https://live.spay.live/api/CF/payout/payment/request",
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by Spay for authentication" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique transaction ID (merchant side) Maximum 20 Characters" },
      { field: "beneficiary_name", type: "String", required: "Yes", description: "Beneficiary account holder's full name" },
      { field: "beneficiary_email", type: "String", required: "Yes", description: "Beneficiary's email address (for communication/receipt)" },
      { field: "beneficiary_phone", type: "String", required: "Yes", description: "Beneficiary's 10-digit mobile number" },
      { field: "amount", type: "String", required: "Yes", description: "Payout amount in INR" },
      { field: "beneficiary_account_number", type: "String", required: "Yes", description: "Beneficiary's bank account number" },
      { field: "beneficiary_ifsc", type: "String", required: "Yes", description: "Beneficiary's bank IFSC code" },
    ],
    request: {
      curl: `
curl --location https://live.spay.live/api/CF/payout/payment/request
--form 'token="Q9xRwseKPkXXXXXXXXtygT78wnHPji"
--form 'orderid="AKXXXXX"
--form "beneficiary_email=customer / enduser mail_id"
--form "beneficiary_phone=customer / enduser mobile no"
--form 'amount=10XX.00'
--form 'beneficiary_account_number="17459XXXXX"
--form 'beneficiary_ifsc="KKBK00XXXXX"
--form 'beneficiary_name=customer / enduser name'
      `,
    },
    successResponse: {
      curl: `
{
"status": "pending",
"statuscode": 200,
"message": "✅ Payout status: Pending,
"data": {
"message": "Transfer Initiated",
"bene_name": "name",
"customer_account": "xxxxxxx7325",
"amount": "1.00",
"client_ref_no": "AK00XXXXX1",
"txn_date": "2025-XX-1X 16:XX:49"
"rrn": "null"
}
      `,
    },
    errorExamples: [
      { code: "403", message: "Your Payout account is deactivated. Please contact the administrator.", cause: "Payout deactivated by Spay" },
      { code: "401", message: "Unauthorized", cause: "Invalid or expired token or Authorization header" },
      { code: "422", message: "Validator Error", cause: "Occurs when required fields (orderid, amount, beneficiary_name, beneficiary_phone, beneficiary_email) are missing or invalid. Example: {\"errors\":{\"orderid\":[\"The orderid has already been taken.\"],\"amount\":[\"The amount must be at least 1.\"],\"beneficiary_name\":[\"The name field is required.\"],\"beneficiary_phone\":[\"The beneficiary_phone field is required.\"],\"beneficiary_email\":[\"The beneficiary_email field is required.\"]}} " },
      { code: "500", message: "Internal Server Error", cause: "Unexpected server-side error" }
    ],
  },

  {
    id: "cashfree-status",
    title: "Check Payment Status",
    type: "api1",
    endpoint: 'GET https://live.spay.live/api/CF/payout/status',
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by SPay Dashboard" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique ID Enter by Merchant(order id)" },
    ],
    request: {
      curl: `
curl --location GET "https://dashboard.spay.live/api/CF/payout/status?
token = "Q9xRwseKPkMWXXXXXT78wnHPji&apitxnid=AK0XXXX"
      `
    },
    successResponse: {
      curl: `
{
"status": "success",
"statuscode": 200,
"data": {
"status": "SUCCESS",
"message": "Transaction Status Fetched",
"amount": "1XX.00",
"rrn": "522XXXX286",
"account_number": "xxxxxxx7325",
"ifsc_code": "KKBK0XXXX"
}
      `
    },
    failedResponse: {
      curl: `
{
"statuscode": 400,
"data": {
"status": "FAILED",
"message": "Transaction Status failed",
"amount": "null",
"rrn": "null",
"account_number": "null",
"ifsc_code": "null"
}
      `
    },

    errorExamples: [
        {
          code: "400",
          message: "Missing required fields:MID",
          cause: "Required query parameter not provided",
        },
        {
          code: "404",
          message: "payout method not found",
          cause: "Incorrect or non-existent apitxnid", 
        },
        {
          code: "401",
          message: "Unauthorized",
          cause: "Invalid or expired token or Authorization header",
        },
        {
          code: "422",
          message: "Validation failed",
          cause: "payment_id format is invalid",
        },
        {
          code: "500",
          message: "Internal Server Error",
          cause: "Unexpected server-side or cURL exception",
        },
      ],

    errorStatus:[
        {
          code: "initiated",
          message: "Payment has been initiated but not completed",
        },
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
    id: "cashfree-callback",
    title: "Callback Response",
    type: "callback",
    content: {
      endpoint: "https://dashboard.spay.live/api/cronjob/payoutcall_back",
      successResponse: `
{
"status": "success",
"txnid": "SPAYXXX0004",
"clienttxnid": "AKXXXXX",
"amount": "1.00",
"UTR": "6408204XXX"
"timestamp":"2025-XX-XX 15:27:47"
}
      `,
      failedResponse: `
{
"status":"failed",
"txnid":"SPAY2025XXXX",
"clienttxnid":"TXN0XXX59",
"amount":1.00,
"UTR":"null",
"timestamp":"2025-XX-XX 15:27:47"
}
      `
    }
  },
  {
      id: "important-notes",
      title: "Payout Integration Guidelines",
      type: "notes",
      content: [
        {
          title: "1. API Key & Credentials",
          description:
            "token, MID, and Key: Ensure that these values are securely stored and never shared in public forums or repositories. These credentials are sensitive and must be treated with high security to prevent unauthorized access during payout operations.",
        },
        {
          title: "2. Consistency in Identifiers",
          description:
            "apitxnid (for request API): This is the unique identifier you provide for each payout transaction. It must be unique for every payout request and should not be reused. Reusing an apitxnid can lead to incorrect payout processing or status reporting.",
        },
        {
          title: "3. Polling & Cron Jobs",
          description:
            "For high payout volumes, consider implementing polling or cron jobs to periodically check the payout status after the initial request. This ensures timely updates and reduces manual follow-ups.",
        },
        {
          title: "4. Error Handling & Retry Logic",
          description:
            "Always implement proper error handling when calling payout APIs. Include retry logic for transient errors like network issues or server downtime to ensure payouts are not missed or delayed.",
        },
        {
          title: "5. Payout Amount (INR)",
          description:
            "Ensure that the amount parameter is accurate in INR (Indian Rupees) and adheres to the limits set by SPay for payouts. Double-check the payout amounts before initiating the request to avoid failures.",
        },
        {
          title: "6. Beneficiary Data Validation",
          description:
            "Validate and sanitize beneficiary details such as name, account number, IFSC, email, and mobile. Invalid or incomplete beneficiary data can result in payout failures or delays.",
        },
        {
          title: "7. Security",
          description:
            "Always use HTTPS for secure communication to protect sensitive data such as API keys, beneficiary information, and payout details.",
        },
        {
          title: "8. PayOUT Account Deactivated",
          description:
            "This means your PayOUT account has been deactivated by SPay. Contact support or your system administrator to reactivate your account before initiating any payouts.",
        },
      ]
    },
];

// -----------------------------------------
// 👉 BUSYBOX API DATA
// -----------------------------------------
const BUSYBOX_SECTIONS = [
  {
    id: "busybox-request",
    title: "Create Payout Payment Request",
    type: "api1",
    endpoint: "POST https://live.spay.live/api/bb/payout/payment/request",
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by Spay for authentication" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique transaction ID (merchant side) Maximum 20 Characters" },
      { field: "beneficiary_name", type: "String", required: "Yes", description: "Beneficiary account holder's full name" },
      { field: "beneficiary_email", type: "String", required: "Yes", description: "Beneficiary's email address (for communication/receipt)" },
      { field: "beneficiary_phone", type: "String", required: "Yes", description: "Beneficiary's 10-digit mobile number" },
      { field: "amount", type: "String", required: "Yes", description: "Payout amount in INR" },
      { field: "beneficiary_account_number", type: "String", required: "Yes", description: "Beneficiary's bank account number" },
      { field: "beneficiary_ifsc", type: "String", required: "Yes", description: "Beneficiary's bank IFSC code" },
    ],
    request: {
      curl: `
curl --location https://live.spay.live/api/bb/payout/payment/request
--form 'token="Q9xRwseKPkXXXXXXXXtygT78wnHPji"
--form 'orderid="AKXXXXX"
--form "beneficiary_email=customer / enduser mail_id"
--form "beneficiary_phone=customer / enduser mobile no"
--form 'amount=10XX.00'
--form 'beneficiary_account_number="17459XXXXX"
--form 'beneficiary_ifsc="KKBK00XXXXX"
--form 'beneficiary_name=customer / enduser name'
      `,
    },
    successResponse: {
      curl: `
{
"status": "pending",
"statuscode": 200,
"message": "✅ Payout status: Pending,
"data": {
"message": "Transfer Initiated",
"bene_name": "name",
"customer_account": "xxxxxxx7325",
"amount": "1.00",
"client_ref_no": "AK00XXXXX1",
"txn_date": "2025-XX-1X 16:XX:49"
"rrn": "null"
}
      `,
    },
    errorExamples: [
      { code: "403", message: "Your Payout account is deactivated. Please contact the administrator.", cause: "Payout deactivated by Spay" },
      { code: "401", message: "Unauthorized", cause: "Invalid or expired token or Authorization header" },
      { code: "422", message: "Validator Error", cause: "Occurs when required fields (orderid, amount, beneficiary_name, beneficiary_phone, beneficiary_email) are missing or invalid. Example: {\"errors\":{\"orderid\":[\"The orderid has already been taken.\"],\"amount\":[\"The amount must be at least 1.\"],\"beneficiary_name\":[\"The name field is required.\"],\"beneficiary_phone\":[\"The beneficiary_phone field is required.\"],\"beneficiary_email\":[\"The beneficiary_email field is required.\"]}} " },
      { code: "500", message: "Internal Server Error", cause: "Unexpected server-side error" }
    ],
  },

  {
    id: "cashfree-status",
    title: "Check Payment Status",
    type: "api1",
    endpoint: 'GET https://live.spay.live/api/bb/payout/status',
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by SPay Dashboard" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique ID Enter by Merchant(order id)" },
    ],
    request: {
      curl: `
curl --location GET "https://dashboard.spay.live/api/bb/payout/status?
token = "Q9xRwseKPkMWXXXXXT78wnHPji&apitxnid=AK0XXXX"
      `
    },
    successResponse: {
      curl: `
{
"status": "success",
"statuscode": 200,
"data": {
"status": "SUCCESS",
"message": "Transaction Status Fetched",
"amount": "1XX.00",
"rrn": "522XXXX286",
"account_number": "xxxxxxx7325",
"ifsc_code": "KKBK0XXXX"
}
      `
    },
    failedResponse: {
      curl: `
{
"statuscode": 400,
"data": {
"status": "FAILED",
"message": "Transaction Status failed",
"amount": "null",
"rrn": "null",
"account_number": "null",
"ifsc_code": "null"
}
      `
    },

    errorExamples: [
        {
          code: "400",
          message: "Missing required fields:MID",
          cause: "Required query parameter not provided",
        },
        {
          code: "404",
          message: "payout method not found",
          cause: "Incorrect or non-existent apitxnid", 
        },
        {
          code: "401",
          message: "Unauthorized",
          cause: "Invalid or expired token or Authorization header",
        },
        {
          code: "422",
          message: "Validation failed",
          cause: "payment_id format is invalid",
        },
        {
          code: "500",
          message: "Internal Server Error",
          cause: "Unexpected server-side or cURL exception",
        },
      ],

    errorStatus:[
        {
          code: "initiated",
          message: "Payment has been initiated but not completed",
        },
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
    id: "busybox-callback",
    title: "Callback Response",
    type: "callback",
    content: {
      endpoint: "https://dashboard.spay.live/api/cronjob/payoutcall_back",
      successResponse: `
{
"status": "success",
"txnid": "SPAYXXX0004",
"clienttxnid": "AKXXXXX",
"amount": "1.00",
"UTR": "6408204XXX"
"timestamp":"2025-XX-XX 15:27:47"
}
      `,
      failedResponse: `
{
"status":"failed",
"txnid":"SPAY2025XXXX",
"clienttxnid":"TXN0XXX59",
"amount":1.00,
"UTR":"null",
"timestamp":"2025-XX-XX 15:27:47"
}
      `
    }
  },
  {
    id: "important-notes",
    title: "Payout Integration Guidelines",
    type: "notes",
    content: [
      {
        title: "1. API Key & Credentials",
        description:
          "token, MID, and Key: Ensure that these values are securely stored and never shared in public forums or repositories. These credentials are sensitive and must be treated with high security to prevent unauthorized access during payout operations.",
      },
      {
        title: "2. Consistency in Identifiers",
        description:
          "apitxnid (for request API): This is the unique identifier you provide for each payout transaction. It must be unique for every payout request and should not be reused. Reusing an apitxnid can lead to incorrect payout processing or status reporting.",
      },
      {
        title: "3. Polling & Cron Jobs",
        description:
          "For high payout volumes, consider implementing polling or cron jobs to periodically check the payout status after the initial request. This ensures timely updates and reduces manual follow-ups.",
      },
      {
        title: "4. Error Handling & Retry Logic",
        description:
          "Always implement proper error handling when calling payout APIs. Include retry logic for transient errors like network issues or server downtime to ensure payouts are not missed or delayed.",
      },
      {
        title: "5. Payout Amount (INR)",
        description:
          "Ensure that the amount parameter is accurate in INR (Indian Rupees) and adheres to the limits set by SPay for payouts. Double-check the payout amounts before initiating the request to avoid failures.",
      },
      {
        title: "6. Beneficiary Data Validation",
        description:
          "Validate and sanitize beneficiary details such as name, account number, IFSC, email, and mobile. Invalid or incomplete beneficiary data can result in payout failures or delays.",
      },
      {
        title: "7. Security",
        description:
          "Always use HTTPS for secure communication to protect sensitive data such as API keys, beneficiary information, and payout details.",
      },
      {
        title: "8. PayOUT Account Deactivated",
        description:
          "This means your PayOUT account has been deactivated by SPay. Contact support or your system administrator to reactivate your account before initiating any payouts.",
      },
    ]
  },
];

  // -----------------------------------------
  // 👉 APPLY PROVIDER DATA
  // -----------------------------------------

  useEffect(() => {
  if (payoutGateway === "cashfree") {
    setApiSections(CASHFREE_SECTIONS);
    setActiveSection("cashfree-request");

  } else if (payoutGateway === "busybox") {
    setApiSections(BUSYBOX_SECTIONS);
    setActiveSection("busybox-request");
  
    // BULK_PE DOCS HAVE TO BE CHANGED
  }  else if (payoutGateway === "bulk_pe") {
    setApiSections(BUSYBOX_SECTIONS);
    setActiveSection("busybox-request");
  }
}, [payoutGateway]);

  const activeApi = apiSections.find((s) => s.id === activeSection);

  // -----------------------------------------
  // 👉 SAME RENDER UI AS YOUR ORIGINAL FILE
  // -----------------------------------------
  const renderContent = () => {
    if (!activeApi) return <p>Loading...</p>;

    switch (activeApi.type) {
      case "api1":
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

export default PayoutDoc;

