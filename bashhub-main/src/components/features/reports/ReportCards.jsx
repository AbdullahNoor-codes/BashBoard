import React from 'react';

function ReportCard({ data }) {
  const sections = [
    { id: 'dws1', title: 'Deep Work Session 1' },
    { id: 'dws2', title: 'Deep Work Session 2' },
    { id: 'dws3', title: 'Deep Work Session 3' },
    { id: 'rws', title: 'Remote Sessions' },
    { id: 'current-tasks', title: 'Current Tasks' }
  ];

  return (
    <div className="flex flex-col w-full max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-md">
      {/* Date Display */}
      <div className="p-4 border-b border-gray-200 bg-gray-100">
        <h2 className="text-lg font-semibold">{data.date}</h2>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-3 pb-2 border-b">
              {section.title}
            </h3>
            {data.sections[section.id]?.length > 0 ? (
              <ul className="space-y-2">
                {data.sections[section.id].map((task, index) => (
                  <li 
                    key={index} 
                    className={`text-gray-700 ${
                      task.includes('(Done)') ? 'text-green-600' :
                      task.includes('(Continue)') ? 'text-blue-600' :
                      task.includes('(Tomorrow)') ? 'text-gray-600' : ''
                    }`}
                  >
                    • {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No tasks for this section.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportCard;