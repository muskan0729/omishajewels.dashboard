import Button from "./Button";

export const ConfirmModal = ({
  showConfirmModal,
  handleConfirmModal,
  action,
  heading,
  body,
}) => {
  return (
    <div>
      {showConfirmModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => handleConfirmModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r  from-[#b58351] to-[#b6916d] text-white font-medium rounded-t-lg px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{heading}</h3>
              <Button
                onClick={() => handleConfirmModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p>{body}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4 m-2">
              <Button
                type="button"
                onClick={() => handleConfirmModal(false)}
                className="cursor-pointer px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-white bg-gray-500 hover:bg-gray-700 transition"
              >
                No
              </Button>
              <Button
                onClick={action}
                type="button"
                className="cursor-pointer text-white  bg-gradient-to-t from-[#b58351] to-[#b6916d] 
                hover:brightness-110 focus:ring-6 focus:outline-none focus:ring-yellow-100 font-medium
                rounded-lg text-sm w-full sm:w-auto
                px-5 py-2.5 text-center"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
