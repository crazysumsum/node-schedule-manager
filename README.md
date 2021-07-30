# node-schedule-manager
The node-schedule-manager module is a simple job manager for distributed system, to ensure the exclusive job can be running at only one server at any given moment. This module use [MySQL](https://www.npmjs.com/package/mysql) as persistent layer and [node-cron](https://www.npmjs.com/package/node-cron) as job scheduler.

## Install

Install node-schedule-manager using npm:

```console
$ npm install node-schedule-manager
```

## Initialize

Since node-schedule-manager use MySQL as persistence layer, you must pass a MySQL connection pool config or an existing connection pool object to schedule manager to create MySQL connection. Upon database connection success, schedule manager will create two tables (schedule_job, schedule_job_log) to store the schedule job related data.

Initialize with connection poool config:

```javascript
const ScheduleJobManager = require('node-schedule-manager').ScheduleJobManager;

  let initResult = await ScheduleJobManager.initWithMySQLConfig({
    host: '127.0.0.1',
  	port: '3306',
  	user: 'db_user',
  	password: 'db_password',
  	database: 'db',
  	waitForConnections: true,
  	connectionLimit: 5
  });

  //initWithMySQLConfig with return an object with two properties:
  //success: indicate init success or not
  //err: error message
  if(!initResult.success) {
    console.log(initResult);
    return;
  }
  
```
