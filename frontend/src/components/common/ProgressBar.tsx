import { FC } from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

const ProgressBar: FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex">
        {steps.map((step, index) => (
          <div key={index} className="flex-1">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-4 text-sm font-medium text-gray-700">{step}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="h-1 mt-4 -ml-4 -mr-4 bg-gray-300">
                <div
                  className={`h-1 ${index + 1 < currentStep ? 'bg-blue-600' : ''}`}
                  style={{ width: `${index + 1 < currentStep ? 100 : 0}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
