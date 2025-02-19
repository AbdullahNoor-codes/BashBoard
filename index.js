const express = require("express");
const axios = require("axios");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
require("dotenv").config();
const pool = require("./db");
const cron = require("node-cron");
const moment = require("moment-timezone");

// Database connection test
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully:", res.rows[0]);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5001",
    "https://bash-board.vercel.app",
    "http://localhost:5000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/login", authRoutes);
app.use("/apis/tasks", taskRoutes);
app.use("/report", reportRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Database connection and APIs are running fine!");
});




// Function to fetch and send reports to Slack
// const sendReportsToSlack = async () => {
//   try {
//     // Get the previous day's date
//     const nowKarachi = moment().tz("Asia/Karachi");
//     const previousDate = nowKarachi.clone().subtract(1, "day").format("YYYY-MM-DD");
    
//     // Fetch all users
//     const usersRes = await pool.query("SELECT user_id, username FROM users");
//     const users = usersRes.rows;
//     // const users = [{user_id:"9bf2c314-4631-483d-9be9-258844da48cd"}]
//     // const users = [{user_id:"3d8b7e31-fd11-4065-be8d-d4acc1e24322"}]
    
//     for (const user of users) {
//       const userId = user.user_id;
//       const userName = user.username;
      
//       // Fetch the report for the previous day
//       const reportRes = await pool.query(
//         "SELECT data FROM reports WHERE user_id = $1 AND date = $2",
//         [userId, previousDate]
//       );
      
//       if (reportRes.rows.length === 0) {
//         console.log(`No report found for user ${userName} on ${previousDate}`);
//         continue; // Skip if no report exists
//       }
      
//       const reportData = reportRes.rows[0].data;
//       let slackMessage = "-----------------------------------------------------------------\n"
//       // Build the Slack message
//       slackMessage = `*User:* ${userName}\n`;
//       slackMessage += `*Date:* ${previousDate}\n\n`;
      
//       // Helper function to format tags
//       const formatTags = (task) => {
//         const tags = [];
//         if (task.is_complete) tags.push("Done");
//         if (task.is_in_progress) tags.push("In Progress");
//         if (task.task_tags && task.task_tags.length > 0) tags.push(...task.task_tags);
//         return tags.length > 0 ? `(${tags.join(", ")})` : "";
//       };
      
//       // Deep Work Session 1 (dws1)
//       const dws1Tasks = reportData.dws1 || [];
//       slackMessage += "*Deep Work Session 1:*\n";
//       if (dws1Tasks.length > 0) {
//         dws1Tasks.forEach((task, index) => {
//           const taskDesc = task.task_desc || ""; // Add task description if available
//           slackMessage += `${index + 1}. ${task.task_name} ${formatTags(task)}\n`;
//           if (taskDesc) slackMessage += `    - ${taskDesc}\n`; // Indented description
//         });
//       } else {
//         slackMessage += "No tasks\n";
//       }
//       slackMessage += "\n";
      
//       // Deep Work Session 2 (dws2)
//       const dws2Tasks = reportData.dws2 || [];
//       slackMessage += "*Deep Work Session 2:*\n";
//       if (dws2Tasks.length > 0) {
//         dws2Tasks.forEach((task, index) => {
//           const taskDesc = task.task_desc || ""; // Add task description if available
//           slackMessage += `${index + 1}. ${task.task_name} ${formatTags(task)}\n`;
//           if (taskDesc) slackMessage += `    - ${taskDesc}\n`; // Indented description
//         });
//       } else {
//         slackMessage += "No tasks\n";
//       }
//       slackMessage += "\n";
      
//       // Deep Work Session 3 (dws3)
//       const dws3Tasks = reportData.dws3 || [];
//       slackMessage += "*Deep Work Session 3:*\n";
//       if (dws3Tasks.length > 0) {
//         dws3Tasks.forEach((task, index) => {
//           const taskDesc = task.task_desc || ""; // Add task description if available
//           slackMessage += `${index + 1}. ${task.task_name} ${formatTags(task)}\n`;
//           if (taskDesc) slackMessage += `    - ${taskDesc}\n`; // Indented description
//         });
//       } else {
//         slackMessage += "No tasks\n";
//       }
//       slackMessage += "\n";
      
//       // Remote Work Session (rws)
//       const rwsTasks = reportData.rws || [];
//       slackMessage += "*Remote Work Session:*\n";
//       if (rwsTasks.length > 0) {
//         rwsTasks.forEach((task, index) => {
//           const taskDesc = task.task_desc || ""; // Add task description if available
//           slackMessage += `${index + 1}. ${task.task_name} ${formatTags(task)}\n`;
//           if (taskDesc) slackMessage += `    - ${taskDesc}\n`; // Indented description
//         });
//       } else {
//         slackMessage += "No tasks\n";
//       }
//       slackMessage += "\n";
      
//       // Current Tasks
//       const currentTasks = reportData["current-tasks"] || [];
//       slackMessage += "*Current Tasks:*\n";
//       if (currentTasks.length > 0) {
//         currentTasks.forEach((task, index) => {
//           const taskDesc = task.task_desc || ""; // Add task description if available
//           slackMessage += `${index + 1}. ${task.task_name} ${formatTags(task)}\n`;
//           if (taskDesc) slackMessage += `    - ${taskDesc}\n`; // Indented description
//         });
//       } else {
//         slackMessage += "No tasks\n";
//       }
//       slackMessage = "-----------------------------------------------------------------"
//       // Send the message to Slack
//       await sendMessageToSlack(slackMessage);
//     }
//   } catch (error) {
//     console.error("Error sending reports to Slack:", error.message);
//   }
// };



const sendReportsToSlack = async () => {
  try {
    // Get the previous day's date in the "Asia/Karachi" timezone
    const nowKarachi = moment().tz("Asia/Karachi");
    const previousDate = nowKarachi.clone().subtract(1, "day").format("YYYY-MM-DD");

    // Fetch all users from the database
    const usersRes = await pool.query("SELECT user_id, username FROM users");
    const users = usersRes.rows;

    // Loop through each user to fetch their report
    for (const user of users) {
      const userId = user.user_id;
      const userName = user.username;

      // Fetch the report for the previous day
      const reportRes = await pool.query(
        "SELECT data FROM reports WHERE user_id = $1 AND date = $2",
        [userId, previousDate]
      );

      // Skip if no report exists for the user on the previous day
      if (reportRes.rows.length === 0) {
        console.log(`No report found for user ${userName} on ${previousDate}`);
        continue;
      }

      const reportData = reportRes.rows[0].data;
      let slackMessage = "-----------------------------------------------------------------\n";

      // Build the Slack message header
      slackMessage += `*User:* ${userName}\n`;
      slackMessage += `*Date:* ${previousDate}\n\n`;

      // Helper function to format tags for tasks
      const formatTags = (task) => {
        const tags = [];
        if (task.is_complete) tags.push("Done");
        if (task.is_in_progress) tags.push("In Progress");
        if (task.task_tags && task.task_tags.length > 0) tags.push(...task.task_tags);
        return tags.length > 0 ? `(${tags.join(", ")})` : "";
      };

      // Function to add tasks to the Slack message
      const addTasksToMessage = (tasks, sessionName) => {
        slackMessage += `*${sessionName}:*\n`;
        if (tasks.length > 0) {
          tasks.forEach((task, index) => {
            const taskDesc = task.task_desc || ""; // Add task description if available
            slackMessage += `${index + 1}. ${task.task_name} ${formatTags(task)}\n`;
            if (taskDesc) slackMessage += `    - ${taskDesc}\n`; // Indented description
          });
        } else {
          slackMessage += "No tasks\n";
        }
        slackMessage += "\n";
      };

      // Add Deep Work Session 1 (dws1) tasks
      addTasksToMessage(reportData.dws1 || [], "Deep Work Session 1");

      // Add Deep Work Session 2 (dws2) tasks
      addTasksToMessage(reportData.dws2 || [], "Deep Work Session 2");

      // Add Deep Work Session 3 (dws3) tasks
      addTasksToMessage(reportData.dws3 || [], "Deep Work Session 3");

      // Add Remote Work Session (rws) tasks
      addTasksToMessage(reportData.rws || [], "Remote Work Session");

      // Add Current Tasks
      addTasksToMessage(reportData["current-tasks"] || [], "Current Tasks");

      // Add footer separator
      slackMessage += "-----------------------------------------------------------------\n";

      // Send the message to Slack
      await sendMessageToSlack(slackMessage);
    }
  } catch (error) {
    console.error("Error sending reports to Slack:", error.message);
  }
};

// Scheduler to send reports to Slack at 8 AM Asia/Karachi
// cron.schedule(
//   "30 1 * * *", // 8 AM in 24-hour format
//   () => {
//     sendMessageToSlack();
//   },
//   {
//     timezone: "Asia/Karachi", // Explicitly specify the timezone
//   }
// );


const processTasksForSession = async (sessionId) => {
  try {
    const usersRes = await pool.query("SELECT user_id FROM users");
    const users = usersRes.rows;

    // const users = [{user_id:"9bf2c314-4631-483d-9be9-258844da48cd"}]

    // Get the current time in Asia/Karachi timezone
    const nowKarachi = moment().tz("Asia/Karachi");

    let currentDate;
    if (sessionId === "rws") {
      currentDate = nowKarachi.clone().subtract(1, "day").format("YYYY-MM-DD");
    } else {
      currentDate = nowKarachi.format("YYYY-MM-DD");
    }

    console.log(`running for date: ${currentDate}`);

    for (const user of users) {
      const userId = user.user_id;

      // Fetch all tasks for the user
      const alltasksRes = await pool.query(
        "SELECT * FROM tasks WHERE user_id = $1",
        [userId]
      );
      const allTasks = alltasksRes.rows;

      console.log("All tasks:");
      console.log(allTasks);

      // Filter future tasks to move
      const futureTasksToMove = allTasks.filter(
        (task) =>
          task.is_in_progress &&
          task.coming_from === sessionId &&
          moment(task.date).format("YYYY-MM-DD") > currentDate
      ).map((task) => task.task_id);

      console.log("futureTasksToMove");
      console.log(futureTasksToMove);

      // Fetch tasks matching the date condition
      const tasksRes = await pool.query(
        `SELECT * FROM tasks 
         WHERE user_id = $1 
         AND (date AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Karachi' <= $2
         AND coming_from = $3`,
        [userId, `${currentDate} 23:59:59`, sessionId] // Use currentDate with end-of-day time
      );

      const tasks = tasksRes.rows;

      console.log("Tasks matching date condition:");
      console.log(tasks);

      // Filter tasks to create a report from
      const filteredTasksToCreateReportFrom = tasks.filter(
        (task) =>
          (task.is_complete &&
            moment(task.date).format("YYYY-MM-DD") === currentDate) ||
          task.is_in_progress
      );

      console.log("filteredTasksToCreateReportFrom");
      console.log(filteredTasksToCreateReportFrom);

      // Prepare report data
      const reportData = filteredTasksToCreateReportFrom.map((task) => ({
        task_name: task.task_name,
        task_desc: task.task_desc,
        task_tags: task.task_tags,
        is_complete: task.is_complete,
        is_in_progress: task.is_in_progress,
      }));

      // Save report to the database
      await pool.query(
        `
        INSERT INTO reports (user_id, date, data)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, date)
        DO UPDATE SET data = jsonb_set(reports.data, ARRAY[$4], $5::jsonb)
        `,
        [
          userId,
          currentDate, // Use the adjusted currentDate
          JSON.stringify({ [sessionId]: reportData }), // Initial data if inserting
          sessionId, // Session key for jsonb_set
          JSON.stringify(reportData), // Session data to update
        ]
      );

      console.log(`Report saved for session ${sessionId} and user ${userId}`);

      // Update tasks
      let taskIdsToUpdate = tasks
        .filter((task) => !task.is_complete)
        .map((task) => task.task_id);
      taskIdsToUpdate = [...taskIdsToUpdate, ...futureTasksToMove];

      if (taskIdsToUpdate.length > 0) {
        await pool.query(
          `UPDATE tasks SET coming_from = 'current-tasks' WHERE task_id = ANY($1)`,
          [taskIdsToUpdate]
        );
        console.log(
          `Updated ${taskIdsToUpdate.length} tasks for session ${sessionId} and user ${userId}`
        );
      }

      // Special handling for rws
      if (sessionId === "rws") {
        // Fetch the existing report data for the user and date
        const existingReportRes = await pool.query(
          "SELECT data FROM reports WHERE user_id = $1 AND date = $2",
          [userId, currentDate]
        );
        let existingData = {};
        if (existingReportRes.rows.length > 0) {
          existingData = existingReportRes.rows[0].data; // Extract existing report data
        }

        // Fetch "current-tasks" from the tasks table
        const currentTasksRes = await pool.query(
          "SELECT * FROM tasks WHERE user_id = $1 AND coming_from = 'current-tasks'",
          [userId]
        );
        const currentTasks = currentTasksRes.rows;

        // Prepare "current-tasks" report data
        const currentTasksReportData = currentTasks.map((task) => ({
          task_name: task.task_name,
          task_desc: task.task_desc,
          task_tags: task.task_tags,
          is_complete: task.is_complete,
          is_in_progress: task.is_in_progress,
        }));

        // Merge "current-tasks" data into the existing report data
        existingData["current-tasks"] = currentTasksReportData;

        // Update the report in the database
        await pool.query(
          `
          INSERT INTO reports (user_id, date, data)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, date)
          DO UPDATE SET data = $4::jsonb
          `,
          [
            userId,
            currentDate, // Use the same date format as in the query
            JSON.stringify(existingData), // Initial data if inserting
            JSON.stringify(existingData), // Merged data to update
          ]
        );

        console.log(`Added 'current-tasks' data to report for user ${userId}`);
        // await sendReportsToSlack();
      }
    }
  } catch (error) {
    console.error(`Error processing tasks for session ${sessionId}:`, error);
  }
};

// cron.schedule(
//   "30 13 * * *",
//   () => {
//     processTasksForSession("dws1");
//   },
//   {
//     timezone: "Asia/Karachi", // Explicitly specify the timezone
//   }
// );

// // Scheduler for dws2 (2 PM Asia/Karachi)
// cron.schedule(
//   "0 16 * * *", // 2 PM in 24-hour format
//   () => {
//     processTasksForSession("dws2");
//   },
//   {
//     timezone: "Asia/Karachi", // Explicitly specify the timezone
//   }
// );

// // Scheduler for dws3 (3 PM Asia/Karachi)
// cron.schedule(
//   "0 18 * * *", // 3 PM in 24-hour format
//   () => {
//     processTasksForSession("dws3");
//   },
//   {
//     timezone: "Asia/Karachi", // Explicitly specify the timezone
//   }
// );

// // Scheduler for rws (4 PM Asia/Karachi)
// cron.schedule(
//   "0 0 * * *", // 4 PM in 24-hour format
//   () => {
//     processTasksForSession("rws");
//   },
//   {
//     timezone: "Asia/Karachi", // Explicitly specify the timezone
//   }
// );

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
