export function WorkflowProgress({ steps }: { steps: WorkflowStep[] }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 border-b">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${
                        step.status === 'complete' 
                            ? 'bg-green-500' 
                            : step.status === 'editing'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                    }`} />
                    <span className="text-xs ml-1">{step.name}</span>
                    {index < steps.length - 1 && (
                        <div className="h-px w-8 bg-gray-300 mx-2" />
                    )}
                </div>
            ))}
        </div>
    );
}