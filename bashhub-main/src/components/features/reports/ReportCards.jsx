import React from "react";

function ReportCard({ data }) {
  console.log("ReportCard");
  console.log(data);

  const sections = [
    { id: "dws1", title: "Deep Work Session 1" },
    { id: "dws2", title: "Deep Work Session 2" },
    { id: "dws3", title: "Deep Work Session 3" },
    { id: "rws", title: "Remote Sessions" },
    { id: "current-tasks", title: "Current Tasks" },
  ];

  return (
    <div className="flex flex-col w-full max-w-[100vw] bg-white border border-gray-200 rounded-lg shadow-md">
      {/* Date Display */}
      <div className="p-4 border-b border-gray-200 bg-gray-100">
        <h2 className="text-lg font-semibold">{data.date}</h2>
      </div>
      {/* Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section) => {
          const tasksInSection = data.sections[section.id];
          if (!tasksInSection) return null;

          return (
            <div key={section.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-3 pb-2 border-b">
                {section.title}
              </h3>
              {tasksInSection.length > 0 ? (
                <ul className="space-y-4 pl-4">
                  {tasksInSection.map((task, index) => (
                    <li key={index}>
                      {/* Title with Bullet Point */}
                      <h4 className="text-base font-medium text-gray-800 flex items-center">
                        • <span className="ml-2">{task.task_name}</span>
                      </h4>
                      {/* Description */}
                      {task.task_desc && (
                        <p className="text-xs text-gray-600 mt-1 pl-4">
                          {task.task_desc}
                        </p>
                      )}
                      {/* Tags */}
                      {task.task_tags?.length > 0 ||
                      task.is_complete ||
                      task.is_in_progress ? (
                        <div className="mt-1 pl-4 flex items-center gap-2">
                          {/* Tags */}
                          {task.task_tags?.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-blue-500 bg-blue-100 px-1 py-0.5 rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                          {/* Status */}
                          {task.is_complete && (
                            <span className="text-[10px] text-green-500 bg-green-100 px-1 py-0.5 rounded-sm">
                              Done
                            </span>
                          )}
                          {task.is_in_progress && (
                            <span className="text-[10px] text-yellow-500 bg-yellow-100 px-1 py-0.5 rounded-sm">
                              In Progress
                            </span>
                          )}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No tasks for this section.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReportCard;
