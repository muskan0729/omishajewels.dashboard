import { useEffect, useState } from "react";
import Button from "../components/Button";
import Table from "../components/Table";
import Logo from "../images/logo.png";
import Placeholder from "../images/placeholder.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

export const ViewComplain = () => {
  const [errors, setErrors] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [ticketData, setTicketData] = useState([]);
  const [editData, setEditData] = useState(null);
 
  const toast = useToast();
  const navigate = useNavigate();
  const { execute: executeTicket, loading: creating } =
    usePost("/store-ticket");

  const [ticketFormData, setTicketFormData] = useState({
    user_id: "",
    subject: "",
    description: "",
    attachment: "",
    assigned_to: "",
  });

  // ✅ Use your hook to fetch schemes
  const { data, loading, error, refetch } = useGet("/get-tickets");
  const { execute: updateTicket, loading: updating } = usePost(
    editData ? `/update-ticket/${editData.id}` : ""
  );

  console.log("Ticket Data:", data);

  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];
  const priorityOptions = ["High", "Medium", "Low"];

  // Converts "in_progress" -> "In Progress", "resolved" -> "Resolved"
  const formatForUI = (str) => {
    if (!str) return "N/A";
    return str
      .split("_") // ["in", "progress"]
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // ["In", "Progress"]
      .join(" "); // "In Progress"
  };

  // ✅ Format data whenever "data" changes
  useEffect(() => {
    if (data?.data) {
      const formattedData = data.data.map((item) => ({
        id:item.id ?? "N/A",
        ticket_id: item.ticket_id ?? "N/A",
        user_name: item.user?.name ?? "N/A",
        subject: item.subject ?? "N/A",
        description: item.description ?? "N/A",
        status: formatForUI(item.status),
        priority: formatForUI(item.priority),
        assigned_to: item.assigned_to ?? "N/A",
        created_at: new Date(item.created_at).toLocaleString(),
        action: (
          <Button
            onClick={() => handleEdit(item)}
            className="cursor-pointer bg-[#b58351] hover:bg-[#615141] text-white text-xs font-medium px-3 py-1.5 rounded-md"
          >
            Edit
          </Button>
        ),
      }));

      setTicketData(formattedData);
    }
  }, [data]);

  useEffect(() => {
    if (showModal) {
      if (editData) {
        setTicketFormData({
          user_id: editData.user_id || "",
          subject: editData.subject || "",
          description: editData.description || "",
          attachment: "", // file cannot be prefilled
          assigned_to: editData.assigned_to || "",
        });
      } else {
        // Reset form for new record
        setTicketFormData({
          user_id: "",
          subject: "",
          description: "",
          attachment: "",
          assigned_to: "",
        });
      }
    }
  }, [showModal, editData]);

  // useEffect(() => {
  // document.body.style.overflow = showModal ? "hidden" : "auto";
  // }, [showModal]);


  const handleEdit = (ticket) => {
    console.log("Editing:", ticket);
    setEditData(ticket);
    setShowModal(true);
  };

  const complainColumns = [
    { header: "Complain Id", accessor: "ticket_id" },
    { header: "Name", accessor: "user_name" },
    { header: "Subject", accessor: "subject" },
    { header: "Description", accessor: "description" },
    { header: "Status", accessor: "status" },
    { header: "Priority", accessor: "priority" },
    { header: "Send Message", accessor: "send" },
    { header: "View Message", accessor: "view" },
    { header: "Issue Image", accessor: "image" },
    { header: "Assigned To", accessor: "assigned_to" },
    { header: "Created At", accessor: "created_at" },
    { header: "Action", accessor: "action" },
  ];

  /**Logic to handle the dropdowns, modals and image modals inside table. */
  const complainsWithModifications = ticketData.map((row) => ({
    ...row,
    status: (
      <select
        className="p-2.5 mb-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
        value={row.status}
        onChange={(e) => {
          const newStatus = e.target.value;
          setTicketData((prev) =>
            prev.map((item) =>
              item.ticket_id === row.ticket_id
                ? { ...item, status: newStatus }
                : item
            )
          );
        }}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    ),

    priority: (
      <select
        className="p-2.5 mb-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
        value={row.priority}
        onChange={(e) => {
          const newPriority = e.target.value;
          setTicketData((prev) =>
            prev.map((item) =>
              item.ticket_id === row.ticket_id
                ? { ...item, priority: newPriority }
                : item
            )
          );
        }}
      >
        {priorityOptions.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
    ),

    send: (
      <Button
        onClick={() => setShowSendMessageModal(!showSendMessageModal)}
        className="bg-[#b58351] hover:bg-[#615141] text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
      >
        Send Message
      </Button>
    ),

    view: (
      <Button
        onClick={() => setShowViewMessageModal(!showViewMessageModal)}
        className="bg-[#b58351] hover:bg-[#615141] text-white text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
      >
        View Message
      </Button>
    ),

    image: (
      <Button
        className="cursor-pointer"
        onClick={() => setShowImageModal(!showImageModal)}
      >
        <img src={Logo ? Logo : Placeholder} alt="" />
      </Button>
    ),
  }));

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setTicketFormData({
      ...ticketFormData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...ticketFormData };

      const res = editData
        ? await updateTicket(payload)
        : await executeTicket(payload);
      console.log("Ticket Submission Response:", res);
      toast.success(
        editData
          ? "Complaint updated successfully!"
          : "Ticket submitted successfully!"
      );
      if (res) {
        setTicketFormData({
          user_id: "",
          subject: "",
          description: "",
          attachment: "",
          assigned_to: "",
        });
        setShowModal(!showModal);
        refetch();
        navigate("/view-complain");
      }
    } catch (err) {
      console.error("Error submitting ticket:", err);
      toast.error(
        Object.values(err?.errors || { error: ["Something went wrong"] })[0][0]
      );
    }
  };

  return (
    <>
      {/* <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  flex justify-between items-center mb-3 p-2.5">
        <h4 className="font-bold text-white text-lg py-2">View Complain</h4>
        <Button
          type="button"
          className="cursor-pointer"
          variant="AddNewBtn"
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          Raise Complain
        </Button>
      </div>
      <Table
        columns={complainColumns}
        data={complainsWithModifications}
        showStatusFilter={false}
      /> */}

      {/* <div className="w-full flex justify-center py-8">
      <div className="w-full max-w-[1140px] px-4 lg:px-6 space-y-6">

        return (
  
    {/* Outer container with padding */}

      <div className="w-full flex justify-center py-8">
        <div className="w-full max-w-[1140px] px-4 lg:px-6 space-y-6">
          {/* -------- HEADER: View Complain -------- */}
          <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  flex justify-between items-center rounded-lg p-4 shadow-md">
            <h4 className="font-bold text-white text-lg">View Complain</h4>
            <Button
              type="button"
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}  
              className="bg-white border border-sky-200 text-sky-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-50 hover:border-sky-300 transition-all duration-200"
            >
              Raise Complain
            </Button>



          </div>

          <Table
            columns={complainColumns}
            data={complainsWithModifications}
            showStatusFilter={false}
            endPoint="/delete-ticket"
            setData={setTicketData}
          />


        </div>
      </div>

      {/* -------- MODALS -------- */}
      

      {showModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2"
        onClick={() => setShowModal(false)}
      >
        {/* Modal Box */}
        <div
          className="
            bg-white rounded-lg shadow-xl w-full
            max-w-[90%]
            sm:max-w-lg
            md:max-w-xl
            lg:max-w-lg
            xl:max-w-md
            max-h-[90vh]
            overflow-y-auto
            p-4 sm:p-6
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-gradient-to-r from-[#f4e1c1] to-[#e6b35a] px-5 py-3 rounded-t-lg">
            <h4 className="font-bold text-white text-base sm:text-lg">
              {editData ? "Edit Complaint" : "Register Complaint"}
            </h4>

            <Button
              onClick={() => setShowModal(false)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition"
            >
              ✕
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 px-2">
              {/* User Id */}
              <input
                type="text"
                name="user_id"
                value={ticketFormData.user_id}
                onChange={handleChange}
                placeholder="User Id"
                className={`w-full text-sm px-3 py-2 rounded-lg border ${
                  errors?.user_id ? "border-red-500" : "border-gray-300"
                }`}
                required
              />

              {/* Subject */}
              <input
                type="text"
                name="subject"
                value={ticketFormData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className={`w-full text-sm px-3 py-2 rounded-lg border ${
                  errors?.subject ? "border-red-500" : "border-gray-300"
                }`}
                required
              />

              {/* Description */}
              <textarea
                name="description"
                value={ticketFormData.description}
                onChange={handleChange}
                placeholder="Description"
                rows={4}
                className={`w-full text-sm px-3 py-2 rounded-lg border resize-none ${
                  errors?.description ? "border-red-500" : "border-gray-300"
                }`}
                required
              />

              {/* Attachment */}
              <input
                type="file"
                name="attachment"
                onChange={handleChange}
                className={`w-full text-sm px-3 py-2 rounded-lg border ${
                  errors?.attachment ? "border-red-500" : "border-gray-300"
                }`}
              />

              {/* Assigned To */}
              <input
                type="text"
                name="assigned_to"
                value={ticketFormData.assigned_to}
                onChange={handleChange}
                placeholder="Assigned To"
                className={`w-full text-sm px-3 py-2 rounded-lg border ${
                  errors?.assigned_to ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                disabled={creating || updating}
                className="
                  cursor-pointer w-full sm:w-auto sm:min-w-[150px]
                  bg-gradient-to-r from-[#b58351] to-[#d7a874]
                  text-white rounded-lg px-6 py-2.5 text-sm
                  focus:ring-6 focus:outline-none focus:ring-yellow-100 font-medium
                  hover:brightness-110 focus:ring-6 focus:outline-none focus:ring-yellow-100 font-medium 
                  "
              >
                {editData
                  ? updating
                    ? "Updating..."
                    : "Update"
                  : creating
                  ? "Submitting..."
                  : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      )}

      {showViewMessageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 overflow-y-scroll"
          onClick={() => setShowViewMessageModal(false)}
        >
          <div
            className="bg-white border rounded-lg shadow-lg max-w-3xl w-full mx-2 p-6 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white bg-gradient-to-r  from-[#f4e1c1] to-[#e6b35a] 
              font-medium rounded-t-lg text-sm px-5 py-3 flex justify-between items-center"
            >
              <h4 className="font-bold text-white text-lg py-2">
                View Message
              </h4>
              <Button
                onClick={() => setShowViewMessageModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            <div class="flex justify-end mt-3">
              <div class="block relative max-w-xs bg-[#b58351] text-white p-3 px-4 rounded-2xl rounded-br-none shadow-md">
                <p class="text-lg leading-relaxed">Chat 1</p>
                <p class="text-xs leading-relaxed text-gray-200">
                  {new Date().toLocaleString()}
                </p>
                <span class="absolute right-[-3px] bottom-0 w-2 h-2 bg-[#b58351] rotate-45 rounded-sm"></span>
              </div>
            </div>

            <div class="flex justify-end mt-3">
              <div class="block relative max-w-xs bg-[#b58351] text-white p-3 px-4 rounded-2xl rounded-br-none shadow-md">
                <p class="text-lg leading-relaxed">Chat 2</p>
                <p class="text-xs leading-relaxed text-gray-200">
                  {new Date().toLocaleString()}
                </p>
                <span class="absolute right-[-3px] bottom-0 w-2 h-2 bg-[#b58351] rotate-45 rounded-sm"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white border rounded-lg shadow-lg max-w-3xl w-full mx-2 p-6 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white bg-gradient-to-r  from-[#f4e1c1] to-[#e6b35a] 
              font-medium rounded-t-lg text-sm px-5 py-3 flex justify-between items-center"
            >
              <h4 className="font-bold text-white text-lg py-2">
                Image of Issue
              </h4>
              <Button
                onClick={() => setShowImageModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            <img src={Logo ? Logo : Placeholder} alt="" />
          </div>
        </div>
      )}
    </>
  );
};
