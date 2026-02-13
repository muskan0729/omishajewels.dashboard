import React, { useEffect, useState } from "react";
import "../css/documents.css";
import { useGet } from "../hooks/useGet";

const PayinDoc = () => {
  const [activeSection, setActiveSection] = useState("payin-request");
  const [provider, setProvider] = useState("airpay"); // default until backend loads
  const [apiSections, setApiSections] = useState([]);
  // -----------------------------------------
  // 👉 LOAD PROVIDER FROM BACKEND
  // -----------------------------------------
  
  const { data: getmerchant } = useGet("/show-merchant/${id}");
  const [payinGateway, setpayinGateway] = useState(null);
  
    useEffect(() => {
      // Fetch selected payin provider
      if (getmerchant?.data ) {
        setpayinGateway(getmerchant.data.payin_at_onboard);
      }
    }, [getmerchant]);

  console.log(getmerchant);
  console.log(payinGateway);

  // -----------------------------------------
  // 👉 AIRPAY API DATA
  // -----------------------------------------

  const AIRPAY_SECTIONS = [
  {
    id: "airpay-request",
    title: "Create Payin Payment Request",
    type: "api",
    endpoint: "POST https://live.spay.live/api/AP/payin/request",
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by Spay" },
      { field: "orderid", type: "String", required: "Yes", description: "Unique transaction ID (merchant side) Maximum 20 Characters" },
      { field: "amount", type: "String", required: "Yes", description: "Transaction amount in INR" },
      { field: "buyer_email", type: "String", required: "Yes", description: "Customer's email address" },
      { field: "buyer_phone", type: "String", required: "Yes", description: "Customer's 10-digit mobile number" },
    ],
    request: {
      curl: `
curl--location "https://live.spay.live/api/AP/payin/request"
--form 'token="Sha6Nplm0pXXXXXxp8ABGQKUE6g"
--form 'orderid="TESTXXXX3117xX"
--form 'amount="10.00"
--form 'buyer_email="tXXX@gmail.com"
--form 'buyer_phone="1122XXXXX"
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
"txnid": "SPAY2025101711XXXX45"
}
      `,
    },
    errorExamples: [
      { code: "400", message: "Missing required fields: name,mobile, etc", cause: "Required fields are not included" },
      { code: "403", message: "Your PayIN account is deactivated. Please contact the administrator.", cause: "Payin deactivated by Spay" },
      { code: "409", message: "Transaction ID already exists", cause: "Duplicate apitxnid used" },
      { code: "401", message: "Unauthorized", cause: "Invalid or expired token or Authorization header" },
      { code: "422", message: "Amount must be a positive numeric value", cause: "Invalid or zero amount" },
      { code: "500", message: "Internal Server Error", cause: "Unexpected server-side error" }
    ],
  },

  {
    id: "airpay-status",
    title: "Check Payment Status",
    type: "api",
    endpoint: "POST https://live.spay.live/api/AP/payin/status",
    headers: "Content-Type: multipart/form-data; boundary=",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by SPay Dashboard" },
      { field: "order_id", type: "String", required: "Yes", description: "Unique transaction identifier returned in the request api response" },
    ],
    request: {
      curl: `
curl--location POST "https://live.spay.live/api/AP/payin/status"
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
"txnid" : "SPAY2025101XXXXXXX,
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
"txnid" : "SPAY2025101XXXXXXX,
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
      endpoint: "https://soulfuloverseas.com/airpayipn",
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
  {
      id: "important-notes",
      title: "Payin Integration Guidelines",
      type: "notes",
      content: [
        {
          title: "1. API Key & Credentials",
          description:
            "token, Mid and Key: Ensure that these values are securely stored and never shared in public forums or repositories. These credentials are sensitive and must be treated with high security to prevent unauthorized access.",
        },
        {
          title: "2. Consistency in Identifiers",
          description:
            "apitxnid (for request API): This is the unique identifier you provide for each transaction. It should be unique for every transaction request and should not be reused. Reusing an apitxnid for multiple transactions can lead to erroneous results in the payin flow and in status checks.",
        },
        {
          title: "3. Polling & Cron Jobs",
          description:
            "If you have high transaction volumes, consider implementing polling or using a cron job to check the transaction status periodically after the initial request. This ensures that the system remains responsive and reduces manual intervention.",
        },
        {
          title: "4. Error Handling & Retry Logic",
          description:
            "Always implement proper error handling when calling the APIs. Ensure that you have logic in place to gracefully handle any errors that may arise, such as network issues or server downtime.",
        },
        {
          title: "5. Transaction Amount (INR)",
          description:
            "Ensure that the amount parameter is provided accurately in INR (Indian Rupees) and does not exceed the allowable limits specified by SPay. Double-check the transaction amounts before initiating the request.",
        },
        {
          title: "6. Customer Data Validation",
          description:
            "Always validate and sanitize customer input such as name, email, and mobile to ensure no invalid or harmful data is sent. Invalid or incomplete customer data may result in transaction failures or status errors.",
        },
        {
          title: "7. Security",
          description:
            "Always use HTTPS for secure communication to protect sensitive data like API keys, customer information, and transaction details.",
        },
        {
          title: "8. PayIN Account Deactivated",
          description:
            "This means your PayIN account has been deactivated by Spay. Please contact support or the system administrator to reactivate your account.",
        },
      ],
    },
];


  // -----------------------------------------
  // 👉 PAYU API
  // -----------------------------------------

  const PAYU_SECTIONS = [
  {
    id: "payu-request",
    title: "Create Payin Payment Request",
    type: "api",

    endpoint: "POST https://live.spay.live/api/CF/payin/request",
    headers: "Content-Type: application/x-www-form-urlencoded",

    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by Spay" },
      { field: "apitxnid", type: "String", required: "Yes", description: "Unique transaction ID (merchant side) Maximum 20 Characters" },
      { field: "amount", type: "String", required: "Yes", description: "Transaction amount in INR" },
      { field: "firstname", type: "String", required: "Yes", description: "Customer first Name" },
      { field: "email", type: "String", required: "Yes", description: "Customer email address" },
      { field: "phone", type: "String", required: "Yes", description: "Customer Mobile number" },
      { field: "r_url", type: "String", required: "Yes", description: "Return url to redirect after payment" },
    ],

    request: {
      curl: `
curl--location 'https://live.spay.live/api/CF/payin/request' 
--form 'token="Sha6Nplm0pXXXXXxp8ABGQKUE6g"
--form 'amount="10.00"
--form 'apitxnid="TESTXXXX3117xX"
--form 'firstname="Username"
--form 'email="tXXX@gmail.com"
--form 'phone="1122XXXXX"
--form 'r_url="example.live"
      `,
    },

    successResponse: {
      curl: `
{
  "status": "success",
  "message": "Payment initialized successfully",
  "order_id": "XXXX",
  "redirect_url": "uXXXXXy?
  pa=XXXXXXX@ypbiz&pn=f59d23ac19020c989cd8566a4ea16646ad4e02f67516cedc3bd7d833
  efdaXXXx&cu=INR&tn=Pay+to+f59d23ac19020c9XXXXXea16646ad4e02f67516cedc3bd7d833
  efda516e&am=10.00&mam=10.00&mc=5999&mode=04&tr=XXXX 377960382&ver=1"
  "txnid": "SPAY2025101711XXXX45"
}
      `,
    },

    errorExamples: [
      { code: "400", message: "Missing required fields: firstname,mobile,email etc", cause: "Required fields are not included" },
      { code: "403", message: "Your PayIN account is deactivated. Please contact the administrator.", cause: "Payin deactivated by Spay" },
      { code: "409", message: "Transaction ID already exists", cause: "Duplicate apitxnid used" },
      { code: "401", message: "Unauthorized", cause: "Invalid or expired token or Authorization header" },
      { code: "422", message: "Amount must be a positive numeric value", cause: "Invalid or zero amount" },
      { code: "500", message: "Internal Server Error", cause: "Unexpected server-side error" },
    ],
  },

  {
    id: "payu-status",
    title: "Check Payment Status",
    type: "api",

    endpoint: "POST https://live.spay.live/api/CF/payin/status",
    headers: "Content-Type: multipart/form-data; boundary=",

    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by SPay Dashboard" },
      { field: "apitxnid", type: "String", required: "Yes", description: "Unique transaction identifier returned in the request api response" },
    ],

    request: {
      curl: `
curl--location "https://live.spay.live/api/CF/payin/status”
--form token="Q9xRwseKPkXXXMWw6iseUtygT78wnHPji"
--form orderid="xi2TpoHXXXX0mSQU"'
      `,
    },

    successResponse: {
      curl: `
{
"message" : "Transaction Successfully done",
"success": "true",
"status": "success",
"Amount": "1.00",
"txnid" : "SPAY2025101XXXXXXX,
}
      `,
    },

    failedResponse: {
      curl: `
{
"Message": "Transaction failed",
"success": "false",
"Status": "FAILED",
"Amount": "1.00",
"txnid" : "SPAY2025101XXXXXXX,
}
      `,
    },

    errorExamples: [
        {
          code: "400",
          message: "Missing required fields:apitxnid",
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
    id: "payu-callback",
    title: "Callback Response",
    type: "callback",

    content: {
      endpoint: "https://soulfuloverseas.com/airpayipn",

      successResponse: `
{
"status": "success",
"txnid": "SPAYXXX0004",
"clienttxnid": "YUVXXXXX",
"amount": "1.00",
"UTR": "6408204XXX"
"timestamp":"2025-XX-XX 15:27:47"
"http_code":"200"
}
      `,

      failedResponse: `
{
"status":"failed",
"txnid":"SPAY2025XXXX",
"clienttxnid":"TXN0XXX59",
"amount":1.00,
"UTR": "6408204XXX"
"timestamp":"2025-XX-XX 15:27:47"
"http_code":"500"
}
      `,
    },
  },

  {
      id: "important-notes",
      title: "Payin Integration Guidelines",
      type: "notes",
      content: [
        {
          title: "1. API Key & Credentials",
          description:
            "token, Mid and Key: Ensure that these values are securely stored and never shared in public forums or repositories. These credentials are sensitive and must be treated with high security to prevent unauthorized access.",
        },
        {
          title: "2. Consistency in Identifiers",
          description:
            "apitxnid (for request API): This is the unique identifier you provide for each transaction. It should be unique for every transaction request and should not be reused. Reusing an apitxnid for multiple transactions can lead to erroneous results in the payin flow and in status checks.",
        },
        {
          title: "3. Polling & Cron Jobs",
          description:
            "If you have high transaction volumes, consider implementing polling or using a cron job to check the transaction status periodically after the initial request. This ensures that the system remains responsive and reduces manual intervention.",
        },
        {
          title: "4. Error Handling & Retry Logic",
          description:
            "Always implement proper error handling when calling the APIs. Ensure that you have logic in place to gracefully handle any errors that may arise, such as network issues or server downtime.",
        },
        {
          title: "5. Transaction Amount (INR)",
          description:
            "Ensure that the amount parameter is provided accurately in INR (Indian Rupees) and does not exceed the allowable limits specified by SPay. Double-check the transaction amounts before initiating the request.",
        },
        {
          title: "6. Customer Data Validation",
          description:
            "Always validate and sanitize customer input such as name, email, and mobile to ensure no invalid or harmful data is sent. Invalid or incomplete customer data may result in transaction failures or status errors.",
        },
        {
          title: "7. Security",
          description:
            "Always use HTTPS for secure communication to protect sensitive data like API keys, customer information, and transaction details.",
        },
        {
          title: "8. PayIN Account Deactivated",
          description:
            "This means your PayIN account has been deactivated by Spay. Please contact support or the system administrator to reactivate your account.",
        },
      ],
    },
];

// -----------------------------------------
// 👉 BUSYBOX API DATA
// -----------------------------------------
const BUSYBOX_SECTIONS = [
  {
    id: "busybox-request",
    title: "Create Payin Payment Request",
    type: "api",
    endpoint: "POST https://live.spay.live/api/bb/payin/request",
    headers: "Content-Type: application/json",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by Spay" },
      { field: "order_id", type: "String", required: "Yes", description: "Unique transaction ID (merchant side) Maximum 20 Characters"},
      { field: "amount", type: "String", required: "Yes", description: "Transaction amount in INR"},
      { field: "buyer_email", type: "String", required: "Yes", description: "Customer's email address"},
      { field: "buyer_phone", type: "String", required: "Yes", description: "Customer's 10-digit mobile number" },
      { field: "buyer_name", type: "String", required: "Yes", description: "Customer's name"},
    ],
    request: {
      curl: `
curl--location 'https://live.spay.live/api/bb/payin/request' 
--form 'token="Sha6Nplm0pXXXXXxp8ABGQKUE6g"'
--form 'orderid="TESTXXXX3117xX"'
--form 'amount="10.00"'
--form 'buyer_email="tXXX@gmail.com"'
--form 'buyer_phone="1122XXXXX"'
--form 'buyer_name="test"'
      `,
    },
    successResponse: {
      curl: `
{
  "status": "success",
  "txnid": "SPXX009854XXXX",
  "upi_link": "upi://pay?
  pa=XXXXXXX@ypbiz&pn=f59d23ac19020c989cd8566a4ea16646ad4e02f67516cedc3bd7d833
  efdaXXXx&cu=INR&tn=Pay+to+f59d23ac19020c9XXXXXea16646ad4e02f67516cedc3bd7d833
  efda516e&am=10.00&mam=10.00&mc=5999&mode=04&tr=XXXX 377960382&ver=1"
}
      `,
    },
    errorExamples: [
      { code: "400", message: "Missing required fields: name,mobile, etc", cause: "Required fields are not included"},
      { code: "403", message: "Your PayIN account is deactivated. Please contact the administrator.", cause: "Payin deactivated by Spay" },
      { code: "409", message: "Transaction ID already exists", cause: "Duplicate apitxnid used"},
      { code: "401", message: "Unauthorized", cause: "Invalid or expired token or Authorization header" },
      { code: "422", message: "Amount must be a positive numeric value", cause: "Invalid or zero amount" },
      { code: "500", message: "Internal Server Error", cause: "Unexpected server-side error" },
    ],
  },
  {
    id: "busybox-status",
    title: "Check Payment Status",
    type: "api",
    endpoint: "POST https://live.spay.live/api/bb/payin/status",
    headers: "Content-Type: multipart/form-data; boundary=",
    parameters: [
      { field: "token", type: "String", required: "Yes", description: "API key/token provided by SPay Dashboard"},
      { field: "order_id", type: "String", required: "Yes", description: "Unique transaction identifier returned in the request api response"},
    ],
    request: {
      curl: `
curl--location 'POST https://live.spay.live/api/bb/payin/status' 
--form token="Q9xRwseKPkXXXMWw6iseUtygT78wnHPji"
--form order_id="xi2TpoHXXXX0mSQU"
      `,
    },
    successResponse: {
      curl: `
{
"message" : "Transaction Successfully done",
"success": "true",
"status": "success",
"Amount": "1.00",
"txnid" : "SPAY2025101XXXXXXX,
}
      `,
    },
    failedResponse: {
      curl: `
{
"Message": "Transaction failed",
"success": "false",
"Status": "FAILED",
"Amount": "1.00",
"txnid" : "SPAY2025101XXXXXXX,
}
      `,
    },
    errorExamples: [
     {
          code: "400",
          message: "Missing required fields:MID",
          cause: "Required query parameter not provided",
        },
        {
          code: "404",
          message:"Payin method not found",
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
    id: "busybox-callback",
    title: "Callback Response",
    type: "callback",
    content: {
      endpoint: "https://soulfuloverseas.com/airpayipn",
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
      `,
    },
  },
  {
   id: "important-notes",
      title: "Payin Integration Guidelines",
      type: "notes",
      content: [
      {
          title: "1. API Key & Credentials",
          description:
            "token, Mid and Key: Ensure that these values are securely stored and never shared in public forums or repositories. These credentials are sensitive and must be treated with high security to prevent unauthorized access.",
        },
        {
          title: "2. Consistency in Identifiers",
          description:
            "apitxnid (for request API): This is the unique identifier you provide for each transaction. It should be unique for every transaction request and should not be reused. Reusing an apitxnid for multiple transactions can lead to erroneous results in the payin flow and in status checks.",
        },
        {
          title: "3. Polling & Cron Jobs",
          description:
            "If you have high transaction volumes, consider implementing polling or using a cron job to check the transaction status periodically after the initial request. This ensures that the system remains responsive and reduces manual intervention.",
        },
        {
          title: "4. Error Handling & Retry Logic",
          description:
            "Always implement proper error handling when calling the APIs. Ensure that you have logic in place to gracefully handle any errors that may arise, such as network issues or server downtime.",
        },
        {
          title: "5. Transaction Amount (INR)",
          description:
            "Ensure that the amount parameter is provided accurately in INR (Indian Rupees) and does not exceed the allowable limits specified by SPay. Double-check the transaction amounts before initiating the request.",
        },
        {
          title: "6. Customer Data Validation",
          description:
            "Always validate and sanitize customer input such as name, email, and mobile to ensure no invalid or harmful data is sent. Invalid or incomplete customer data may result in transaction failures or status errors.",
        },
        {
          title: "7. Security",
          description:
            "Always use HTTPS for secure communication to protect sensitive data like API keys, customer information, and transaction details.",
        },
        {
          title: "8. PayIN Account Deactivated",
          description:
            "This means your PayIN account has been deactivated by Spay. Please contact support or the system administrator to reactivate your account.",
      },
    ],
  },
];


  // -----------------------------------------
  // 👉 APPLY PROVIDER DATA
  // -----------------------------------------

  useEffect(() => {
  if (payinGateway === "Airpay") {
    setApiSections(AIRPAY_SECTIONS);
    setActiveSection("airpay-request");

  } else if (payinGateway === "pay_u") {
    setApiSections(PAYU_SECTIONS);
    setActiveSection("payu-request");

  } else if (payinGateway === "Glide") {
    setApiSections(BUSYBOX_SECTIONS);
    setActiveSection("busybox-request");
  }
}, [payinGateway]);

  const activeApi = apiSections.find((s) => s.id === activeSection);

  // -----------------------------------------
  // 👉 SAME RENDER UI AS YOUR ORIGINAL FILE
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

