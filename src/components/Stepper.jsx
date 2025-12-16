import React from "react";

const steps = [
  { id: 1, label: "Merchant Info" },
  { id: 2, label: "Company Info" },
  { id: 3, label: "Director Info" },
  { id: 4, label: "Scheme Selection" },
];

export const Stepper = ({ currentStep = 1 }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* STEP */}
              <div className="flex flex-col items-center flex-1">
                {/* CIRCLE */}
                <div
                  className={`
                    flex items-center justify-center
                    w-10 h-10 rounded-full border-2
                    font-semibold text-sm
                    transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-[#b58351] border-[#b58351] text-white"
                        : isActive
                        ? "border-[#b58351] text-[#b58351] bg-white shadow-md"
                        : "border-gray-300 text-gray-400 bg-white"
                    }
                  `}
                >
                  {step.id}
                </div>

                {/* LABEL */}
                <span
                  className={`
                    mt-2 text-sm font-medium text-center
                    transition-colors duration-300
                    ${
                      isActive
                        ? "text-[#b58351]"
                        : isCompleted
                        ? "text-[#615141]"
                        : "text-gray-400"
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>

              {index !== steps.length - 1 && (
              <div className="flex items-center flex-1 mx-2">
                {/* Line */}
                <div
                  className={`
                    flex-1 h-[2px]
                    transition-colors duration-300
                    ${
                      currentStep > step.id
                        ? "bg-[#b58351]"
                        : "bg-gray-300"
                    }
                  `}
                />

                {/* Arrow Head */}
                <div
                  className={`
                    w-0 h-0
                    border-t-4 border-b-4 border-l-6
                    border-t-transparent border-b-transparent
                    ${
                      currentStep > step.id
                        ? "border-l-[#b58351]"
                        : "border-l-gray-300"
                    }
                  `}
                />
              </div>
            )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
