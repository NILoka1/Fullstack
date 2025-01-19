const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'TaskMaster',
  password: '123456',
  port: 5432,
});

app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/users', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING username, password',
      [username, password]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/task/:userid', async (req, res) => {
  const { name, description, status, deadline } = req.body;
  const { userid } = req.params;

  try {
    const { rows } = await pool.query(
      `INSERT INTO task (name, description, status, userid, deadline) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, description, status, userid, deadline]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/grouptasks', async (req, res) => {
  const { name, description, status, deadline, groupid } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO grouptask (name, description, status, idgroup, deadlinedate) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, description, status, groupid, deadline]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/grouptasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    await pool.query('DELETE FROM grouptask WHERE idtask = $1', [taskId]);
    res.status(200).send('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post(`/Groups/:namegroup`, async (req, res) => {
  const { namegroup } = req.params

  try {
    const { rows } = await pool.query(
      `INSERT INTO groups (namegroup) VALUES ($1) RETURNING id`,
      [namegroup]
    )
    res.json(rows);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.post(`/UsersGroups/:userid`, async (req, res) => {
  const { userid } = req.params;
  const { groupid } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO usersgroups (iduser,idgroup) VALUES ($1,$2) RETURNING *`,
      [userid, groupid]
    )
    res.json(rows);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.delete(`/task/:taskid`, async (req, res) => {
  const { taskid } = req.params
  try {
    const { rows } = await pool.query(
      `DELETE FROM task WHERE id = $1`, [taskid])
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.delete(`/groupuser/:userid`, async (req, res) => {
  const { userid } = req.params
  const { idgroup } = req.query;
  try {
    const { rows } = await pool.query(
      `DELETE FROM usersgroups WHERE iduser = $1 AND idgroup = $2 `, [userid, idgroup])
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
})
app.put('/grouptasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE grouptask SET status = $1 WHERE idtask = $2 RETURNING *',
      [status, taskId]
    );

    if (rows.length === 0) {
      return res.status(404).send('Задача не найдена');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Ошибка при обновлении статуса задачи:', error);
    res.status(500).send('Ошибка сервера');
  }
});

app.delete(`/group/:groupid`, async (req, res) => {
  const { groupid } = req.params
  try {
    const { rows } = await pool.query(
      `DELETE FROM groups WHERE id = $1`, [groupid])
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.delete(`/groupUsers/:groupid`, async (req, res) => {
  const { groupid } = req.params
  try {
    const { rows } = await pool.query(
      `DELETE FROM usersgroups WHERE idgroup = $1`, [groupid])
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.delete(`/groupTasks/:groupid`, async (req, res) => {
  const { groupid } = req.params
  try {
    const { rows } = await pool.query(
      `DELETE FROM grouptask WHERE idgroup = $1`, [groupid])
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/GroupUsers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, username FROM users WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/GroupTask/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM grouptask WHERE idgroup = $1',
      [id]
    );
    res.json(rows);

  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    );
    if (rows.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/task/:userid', async (req, res) => {
  const { userid } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM task WHERE userid = $1',
      [userid]
    );

    if (rows.length === 0) {
      res.status(404).send('User not found');
    } else {
      const tasks = rows.map(task => ({
        ...task,
        deadline: task.deadline.toISOString(),
      }));

      res.json(tasks);
    }
  } catch (error) {
    console.error('Error searching task', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/taskupdate', async (req, res) => {
  const { id, name, description, status, userid, deadline } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE task 
           SET name = $1, description = $2, status = $3, userid = $4, deadline = $5 
           WHERE id = $6 
           RETURNING *`,
      [name, description, status, userid, deadline, id]
    );

    if (rows.length === 0) {
      res.status(404).send('Task not found');
    } else {
      // Возвращаем дату в локальном времени
      const task = rows[0];
      task.deadline = new Date(task.deadline).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
      res.json(task);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/groups/:userid', async (req, res) => {
  const userid = req.params.userid
  try {
    const usergroup = await pool.query(`SELECT * FROM usersgroups, groups where usersgroups.idgroup = groups.id AND usersgroups.iduser = $1`, [userid])

    res.json(usergroup.rows)
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/usergroup/:idgroup', async (req, res) => {
  const idgroup = req.params.idgroup
  try {
    const idusers = await pool.query(`SELECT * FROM usersgroups where idgroup = $1`, [idgroup])

    res.json(idusers.rows)
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).send('Internal Server Error');
  }
})


module.exports = app;