import clsx from "clsx";

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function Progress({
  currentStep,
  totalSteps,
  labels,
  className,
}: ProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={clsx("w-full", className)}>
      {/* Progress Bar */}
      <div className="relative h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[#2563EB] transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && "bg-[#2563EB] text-white",
                  isCurrent && "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20",
                  !isCompleted && !isCurrent && "bg-[#E5E7EB] text-[#6B7280]"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              {labels && labels[index] && (
                <span
                  className={clsx(
                    "text-xs mt-1.5 text-center max-w-[80px]",
                    isCurrent ? "text-[#2563EB] font-medium" : "text-[#6B7280]"
                  )}
                >
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
