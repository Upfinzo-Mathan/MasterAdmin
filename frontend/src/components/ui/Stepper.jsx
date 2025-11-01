import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export function Stepper({ steps, currentStep, className }) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isCurrent
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center",
                  isCurrent || isCompleted
                    ? "text-blue-600"
                    : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300",
                  isCompleted ? "bg-blue-600" : "bg-gray-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

