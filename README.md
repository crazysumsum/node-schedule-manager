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

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```


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
## Job API Doc

Schedule Job Object
```javascript
let getJobByIdResult = await ScheduleJobManager.getJobById(jobId);
let job = getJobByIdResult.job;

//return Job ID;
job.getId();
//return Job Name;
job.getName();
//return Job Parameters;
job.getParam();
//return Job Cron Setting;
job.getCronSetting();
//return Job Consumer file path;
job.getConsumer();
//return Job exclusive indicator;
job.getExclusive();
//return Job Status;
job.getStats();

//set job name;
job.setName('jobname');
//set job parameters;
job.setParam({jobPara: 'value'});
//set job status;
job.setStatus('DISABLE');
```

New Job
```javascript

/*
* Add new Job to database;
* @Param {String} jobName - Job Name, must unique
* @Param {String} jobCron - Job Cron Setting
* @Param {String or JSON Object} jobParam - Job parameters
* @Param {String} jobConsumer - Path to job consumer file, base on project root
* @Param {Boolean} exclusive - if true, job can be running at only one server at any given moment
* @Param {String} jobStatus - custom job status
* @return {Object}
*   {Boolean} success - indicate add job success or not
*   {String} err - Error message
*   {ScheduleJob} job - Schedule Job Object
*/
let result = await ScheduleJobManager.newJob('jobName', jobCron, jobParam, jobConsumer, exclusive, jobStatus);
```
Update Job
```javascript

/*
* Update job
* @Param {ScheduleJob} job - Schedule Job Object
* @return {Object}
*   {Boolean} success - indicate update job success or not
*   {String} err - Error message
*/
let getJobByIdResult = await ScheduleJobManager.getJobById(jobId);
let job = getJobByIdResult.job;
let result = await ScheduleJobManager.updateJob(job);
```

Delete Job
```javascript

/*
* Delete job
* @Param {String} jobId - JobID
* @return {Object}
*   {Boolean} success - indicate delete job success or not
*   {String} err - Error message
*/
let result = await ScheduleJobManager.deleteJob(jobId);
```
Get Job by ID
```javascript

/*
* Get Job By Id
* @Param {String} jobId - JobID
* @return {Object}
*   {Boolean} success - indicate get job id success or not
*   {String} err - Error message
*   {ScheduleJob} job - Schedule Job Object
*/
let result = await ScheduleJobManager.getJobById(jobId);
let job = result.job;
```

Get Jobs by Status
```javascript

/*
* Get Jobs By Status
* @Param {String} Job Status
* @return {Object}
*   {Boolean} success - indicate get job by status success or not
*   {String} err - Error message
*   {Array} jobs - Schedule Job Array
*/
let result = await ScheduleJobManager.getJobsByStatus('ACTIVE');
let jobs = result.jobs;
```

Get running jobs
```javascript

/*
* Get running jobs
* @return {Array} jobs - Schedule Job Array
*
*/
let jobs = ScheduleJobManager.getRunningJobs();
```

Start Job by Id
```javascript

/*
* Start Job By Id
* @Param {String} jobId - JobID
* @return {Object}
*   {Boolean} success - indicate start job by id success or not
*   {String} err - Error message
*/
let result = await ScheduleJobManager.startJobById(jobId);
```

Start Job by Status
```javascript

/*
* Start Job By Status
* @Param {String} Job Status
* @return {Object}
*   {Boolean} success - indicate start job by status success or not
*   {String} err - Error message
*/
let result = await ScheduleJobManager.startJobsByStatus('ACTIVE');
```

Restart Job by Id
```javascript

/*
* Restart Job By Id
* @Param {String} Job Id
* @return {Object}
*   {Boolean} success - indicate restart job by id success or not
*   {String} err - Error message
*/
let result = await ScheduleJobManager.restartJobById(jobId);
```

Stop Job By Id
```javascript

/*
* Stop Job By Id
* @Param {String} Job Id
* @return {Object}
*   {Boolean} success - indicate stop job by id success or not
*   {String} err - Error message
*/
let result = await ScheduleJobManager.stopJobById(jobId);
```

## Job Log API Doc

Schedule Job Log Object
```javascript

let jobLogsResult = await ScheduleJobManager.getJobLog({order: 'asc', offset: 0, limit:10});
let jobLog = jobLogsResult.logs[0];

//get job log id;
jobLog.getId();
//get job id;
jobLog.getJobId();
//get job machine ip;
jobLog.getMachine();
//get job start time;
jobLog.getStartTime();
//get job end time;
jobLog.getEndTime();
//get job execution result;
jobLog.getResult();
```

Get Job Log
```javascript

/*
* Get Job Log order by job start time;
* @Param {JSON Object}
*   {Number} offset - result starting offset
*   {Number} limit - result limit
*   {String} order - result order, 'DESC' or 'ASC'
* @Param {String} jobId - get job log by job id, default value is '' with return all job log
* @return {Object}
*   {Boolean} success - indicate get job log success or not
*   {String} err - Error message
*   {Array} logs - Job Log array
*/

//get job log for all job;
let jobLogsResult = await ScheduleJobManager.getJobLog({order: 'ASC', offset: 0, limit:10});
let jobLogs = jobLogsResult.logs;

//get job log for jobid = 1;
let jobLogsResult = await ScheduleJobManager.getJobLog({order: 'ASC', offset: 0, limit:10}, '1');
let jobLogs = jobLogsResult.logs;
```
