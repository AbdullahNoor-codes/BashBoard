const pool = require("../db");
const moment = require('moment-timezone');

// const getAllTasks = async (req, res) => {
//   const { userId } = req.query; // Extract userId from query parameters
//   console.log(`user id: `, userId);
//   try {
//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }
//     const tasks = await pool.query(
//       "SELECT task_id, task_name, task_tags, task_desc, coming_from, is_in_progress, is_complete, moved_to, user_id, " +
//       "TO_CHAR(date, 'YYYY-MM-DD') AS date FROM tasks WHERE user_id = $1 ORDER BY date DESC",
//       [userId]
//     );
//     console.log(`tasks: `, tasks.rows);
//     res.status(200).json(tasks.rows);
//   } catch (err) {
//     console.error(`Error fetching tasks: ${err.message}`, err);
//     res
//       .status(500)
//       .json({ message: `Server error: ${err.message}`, error: err.message });
//   }
// };




const getAllTasks = async (req, res) => {
  const { userId } = req.query; // Extract userId from query parameters
  console.log(`user id: `, userId);
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get the current date in Asia/Karachi timezone in YYYY-MM-DD format
    const currentDateInAsiaKarachi = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Karachi',
    });

    const tasks = await pool.query(
      `
        SELECT task_id, task_name, task_tags, task_desc, coming_from, is_in_progress, is_complete, moved_to, user_id, 
               TO_CHAR(date, 'YYYY-MM-DD') AS date 
        FROM tasks 
        WHERE user_id = $1 
          AND NOT (is_complete = TRUE AND TO_CHAR(date, 'YYYY-MM-DD') != $2)
        ORDER BY date DESC
      `,
      [userId, currentDateInAsiaKarachi]
    );

    console.log(`tasks: `, tasks.rows);
    res.status(200).json(tasks.rows);
  } catch (err) {
    console.error(`Error fetching tasks: ${err.message}`, err);
    res
      .status(500)
      .json({ message: `Server error: ${err.message}`, error: err.message });
  }
};


const getSpecificTasks = async (req, res) => {
  const { id } = req.params;
  try {
    const tasks = await pool.query(
      "SELECT task_id, task_name, task_desc, coming_from, is_in_progress, is_complete, moved_to, user_id, " +
      "TO_CHAR(date, 'YYYY-MM-DD') AS date FROM tasks WHERE task_id = $1",
      [id]
    );
    res.status(200).json(tasks.rows);
  } catch (err) {
    console.error(`Error fetching task with ID ${id}: ${err.message}`, err);
    res
      .status(500)
      .json({ message: `Server error ${err.message}`, error: err.message });
  }
};




const createTask = async (req, res) => {
    const { task_id, task_name, task_tags, date, task_desc, coming_from, is_in_progress, is_complete, moved_to, user_id } = req.body;
    console.log(`Creating task: ${task_name}, User ID: ${user_id}`);
    console.log(`date`);
    console.log(date);
    try {
        const newTask = await pool.query(
            'INSERT INTO tasks (task_id, task_name, task_tags, task_desc, date, coming_from, is_in_progress, is_complete, moved_to, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [task_id, task_name, task_tags, task_desc, date, coming_from, is_in_progress, is_complete, moved_to, user_id]
        );
        console.log("Task created successfully:", newTask.rows[0]);
        res.status(201).json(newTask.rows[0]);
    } catch (err) {
        console.error(`Error creating task: ${err.message}`, err);
        res.status(500).json({ message: `Task could not be saved ${err.message}`, error: err.message });
    }
};




// const createTask = async (req, res) => {
//   const { task_id, task_name, task_tags, task_desc, coming_from, is_in_progress, is_complete, moved_to, user_id } = req.body;

//   // Log the task creation request
//   console.log(`Creating task: ${task_name}, User ID: ${user_id}`);

//   try {
//       const nowKarachi = moment().tz("Asia/Karachi");
//       const currentDateKarachi = nowKarachi.format();
//       console.log(`Generated date for task (Asia/Karachi): ${currentDateKarachi}`);

//       // Insert the task into the database with the generated date
//       const newTask = await pool.query(
//           'INSERT INTO tasks (task_id, task_name, task_tags, task_desc, date, coming_from, is_in_progress, is_complete, moved_to, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
//           [
//               task_id,
//               task_name,
//               task_tags,
//               task_desc,
//               currentDateKarachi, 
//               coming_from,
//               is_in_progress,
//               is_complete,
//               moved_to,
//               user_id
//           ]
//       );

//       console.log("Task created successfully:", newTask.rows[0]);

//       res.status(201).json(newTask.rows[0]);
//   } catch (err) {
//       console.error(`Error creating task: ${err.message}`, err);
//       res.status(500).json({ message: `Task could not be saved: ${err.message}`, error: err.message });
//   }
// };


const updateTask = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);

  let { task_name, task_tags, task_desc, date, coming_from, is_in_progress, is_complete, moved_to } = req.body;
  console.log(date);
  if (date) {
      date = new Date(date).toISOString().split("T")[0];
  }

  try {
      const updatedTask = await pool.query(
          'UPDATE tasks SET task_name = $1, task_tags= $2, task_desc= $3, date = $4, coming_from = $5, is_in_progress = $6, is_complete = $7, moved_to = $8 WHERE task_id = $9 RETURNING *',
          [task_name, task_tags, task_desc, date, coming_from, is_in_progress, is_complete, moved_to, id]
      );

      console.log("Task updated successfully:", updatedTask.rows[0]);
      res.status(200).json(updatedTask.rows[0]);
  } catch (err) {
      console.error(`Error updating task ID ${id}: ${err.message}`, err);
      res.status(500).json({ message: `Server error ${err.message}`, error: err.message });
  }
};


const bulkUpdateTasks = async (req, res) => {
  const { tasks } = req.body;

  // Validate tasks array
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid or empty tasks provided" });
  }

  try {
    // Prepare an array to store the results of all updates
    const updatedTasks = [];

    // Loop through each task in the tasks array
    for (const task of tasks) {
      const { task_id, ...updates } = task; // Extract the task ID and the fields to update

      // Validate task ID
      if (!task_id) {
        console.error(`Invalid task data: ${JSON.stringify(task)}`);
        continue; // Skip invalid tasks
      }

      // Validate that there are fields to update
      if (Object.keys(updates).length === 0) {
        console.error(`No fields to update for task ID: ${task_id}`);
        continue; // Skip tasks with no updates
      }

      // Dynamically construct the SET clause for the SQL query
      const setClause = Object.keys(updates)
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

      // Construct the SQL query
      const query = `
        UPDATE tasks 
        SET ${setClause}
        WHERE task_id = $${Object.keys(updates).length + 1}
        RETURNING *
      `;

      // Prepare the values for the query
      const updateValues = [...Object.values(updates), task_id];

      // Execute the query
      const result = await pool.query(query, updateValues);

      // Add the updated task to the results array
      if (result.rows.length > 0) {
        updatedTasks.push(result.rows[0]);
      }
    }

    // Return the response
    if (updatedTasks.length > 0) {
      console.log("Bulk update successful", updatedTasks);
      res.status(200).json({
        message: "Tasks updated successfully",
        updated_tasks: updatedTasks,
      });
    } else {
      res.status(400).json({ message: "No tasks were updated" });
    }
  } catch (err) {
    console.error(`Error in bulk updating tasks: ${err.message}`, err);
    res.status(500).json({
      message: `Server error: ${err.message}`,
      error: err.message,
    });
  }
};


const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE task_id = $1", [id]);
    console.log(`Task ID ${id} deleted successfully`);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(`Error deleting task ID ${id}: ${err.message}`, err);
    res
      .status(500)
      .json({ message: `Server error ${err.message}`, error: err.message });
  }
};


const getTaskReport = async (req, res) => {
  const { userId, date } = req.params;
  console.log(`Fetching report for user_id: ${userId}, date: ${date}`);

  try {
    // Query the database for the report
    const report = await pool.query(
      "SELECT data FROM reports WHERE user_id = $1 AND date = $2",
      [userId, date]
    );

    console.log(`Query result:`, report.rows);

    // If no report exists, return an empty object with a 200 status
    if (report.rows.length === 0) {
      console.log("No report exists for user_id:", userId, "and date:", date);
      return res.status(200).json({}); // Return an empty object
    }

    // Return the report data
    console.log("Returning report data:", report.rows[0].data); // Log the returned data
    res.status(200).json(report.rows[0].data);
  } catch (err) {
    console.error(`Error fetching Report of user_id ${userId}: ${err.message}`, err);
    res.status(500).json({
      message: `Server error: ${err.message}`,
      error: err.message,
    });
  }
};



module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getSpecificTasks,
  bulkUpdateTasks,
  getTaskReport
};
