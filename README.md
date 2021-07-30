# node-schedule-manager
The node-schedule-manager module is a simple job manager for distributed system, to ensure the exclusive job can be running at only one server at any given moment. This module use [MySQL](https://www.npmjs.com/package/mysql) as persistent layer and [node-cron](https://www.npmjs.com/package/node-cron) as job scheduler.

## Install

Install node-schedule-manager using npm:

```console
$ npm install node-schedule-manager
```

## Initialize

Since node-schedule-manager use MySQL as persistence layer, you must pass a MySQL connection pool config or an existing connection pool object to schedule manager to create MySQL connection. Upon database connection success, schedule manager will create two tables (schedule_job, schedule_job_log) to store the schedule job related data.

Initialize with connection pool config:

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


if(!initResult.success) {
  //init failed;
}else {
  //init success;
}

```

Initialize with connection poool Object:

```javascript
const mysql = require('mysql');
const ScheduleJobManager = require('node-schedule-manager').ScheduleJobManager;

let pool = mysql.createPool({
    host: '127.0.0.1',
  	port: '3306',
  	user: 'db_user',
  	password: 'db_password',
  	database: 'db',
  	waitForConnections: true,
  	connectionLimit: 5
});

let initResult = await ScheduleJobManager.initWithConnPool(pool);

if(!initResult.success) {
  //init failed;
}else {
  //init success;
}
```

## Cron Syntax
Schedule Manager use [node-cron](https://www.npmjs.com/package/node-cron) as job scheduler, so you can reference the Cron Syntax section of [node-cron](https://www.npmjs.com/package/node-cron) to learn how to write a correct cron job setting.

## Job Consumer
You must create a job consumer for each job to implement your job logic, here is an example:

```javascript
const JobConsumer = require('node-schedule-manager').JobConsumer;

class SampleJobConsumer extends JobConsumer {
  constructor() {
    super();
  }

  async run(job, jobLog) {
    //your job logic here;
    
    //compete job with execution result;
    await super.complete(jobLog, 'job execution result');
  }
}
module.exports = new SampleJobConsumer();
```

## Start a Job

After initialization and create a job consumer, you can use ScheduleJobManager to start a job, here is an example:

```javascript
let result = await ScheduleJobManager.newJob('jobName', '*/1 * * * *', {jobParam: 'value'}, '/SampleJobConsumer.js', true, 'ACTIVE');

if(!result.success) {
  //add job failed;
}

let startJobResult = await ScheduleJobManager.startJobById(result.job.getId());

if(!startJobResult.success) {
  //start job failed;
}
```



