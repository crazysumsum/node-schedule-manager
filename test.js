const ScheduleJobManager = require('./index.js').ScheduleJobManager;

async function test() {

  let initResult = await ScheduleJobManager.initWithMySQLConfig({
    host: '127.0.0.1',
  	port: '3306',
  	user: 'users',
  	password: 'Abcd1234',
  	database: 'users',
  	waitForConnections: true,
  	connectionLimit: 10
  });

  if(!initResult.success) {
    console.log(initResult);
    return;
  }

  console.log('init test success');


  //new job test;
  let newJobResult = await ScheduleJobManager.newJob('jobName', '*/1 * * * *', 123, '/testConsumer.js', false, 'ACTIVE');

  if(!newJobResult.success) {
    console.log(newJobResult);
    return;
  }

  console.log('new job test success');

  //delete job test;
  let deleteJobResult = await ScheduleJobManager.deleteJob(newJobResult.job.getId());

  if(!deleteJobResult.success) {
    console.log(deleteJobResult);
    return;
  }

  console.log('delete job success');

  //update job test;
  let newJobResult2 = await ScheduleJobManager.newJob('jobName', '*/1 * * * *', 123, '/testConsumer.js', false, 'ACTIVE');

  if(!newJobResult2.success) {
    console.log(newJobResult2);
    return;
  }

  let updateJob = newJobResult2.job;

  updateJob.setName('jobNameUpdate');
  updateJob.setCronSetting('*/1 * * * * *');
  updateJob.setParam('testing123');
  updateJob.setConsumer('/testConsumer.js');
  updateJob.setExclusive(false);
  updateJob.setStatus('DISABLE');

  let updateJobResult = await ScheduleJobManager.updateJob(updateJob);

  if(!updateJobResult.success) {
    console.log(updateJobResult);
    return;
  }

  console.log('update job success');


  //get job by id test;
  let getJobByIdResult = await ScheduleJobManager.getJobById(updateJob.getId());

  if(!getJobByIdResult.success) {
    console.log(getJobByIdResult);
    return;
  }
  console.log(getJobByIdResult.job);
  console.log('get job by id success');

  let getJobByStatusResult = await ScheduleJobManager.getJobsByStatus('DISABLE');

  if(!getJobByStatusResult.success) {
    console.log(getJobByStatusResult);
    return;
  }

  console.log(getJobByStatusResult.jobs);
  console.log('get job by status success');


  //start job by id test;
  let startJobByIdResult = await ScheduleJobManager.startJobById(getJobByStatusResult.jobs[0].getId());

  if(!startJobByIdResult.success) {
    console.log(startJobByIdResult);
    return;
  }

  console.log('Start job by id success');

  //restart job by id test;
  let restartJobByIdResult = await ScheduleJobManager.restartJobById(getJobByStatusResult.jobs[0].getId());

  if(!restartJobByIdResult) {
    console.log(restartJobByIdResult);
    return;
  }

  console.log('restart job by id success');


  //console.log(ScheduleJobManager.getRunningJobs());

  //stop job by id test;
  let stopJobByIdResult = await ScheduleJobManager.stopJobById(getJobByStatusResult.jobs[0].getId());

  if(!stopJobByIdResult) {
    console.log(stopJobByIdResult);
    return;
  }

  //console.log(ScheduleJobManager.getRunningJobs());
  console.log('stop job by id success');

  //start job by status test;
  let startJobByStatusResult = await ScheduleJobManager.startJobsByStatus('DISABLE');

  if(!startJobByStatusResult.success) {
    console.log(startJobByStatusResult);
    return;
  }

  console.log('start jobs by status success');

  await wait(5000);

  let runningJobs = ScheduleJobManager.getRunningJobs();
  for(var i = 0 ; i < runningJobs.length ; i++) {
    await ScheduleJobManager.stopJobById(runningJobs[i].getId());
    await ScheduleJobManager.deleteJob(runningJobs[i].getId());
  }

  let jobLogsResult = await ScheduleJobManager.getJobLog({order: 'asc', offset: 0, limit:2});
  if(!jobLogsResult.success) {
    console.log(jobLogsResult);
    return;
  }

  console.log(jobLogsResult.logs);
  console.log('get job log success');

  console.log('test success');
}

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}



test();
