const Moment = require('moment');
const Cron = require('node-cron');
const IP = require('ip');
const AppRoot = require('app-root-path');

const MySQL = require('../Util/MySQL.js');
const ScheduleJob = require('../Entities/ScheduleJob.js');
const ScheduleJobLog = require('../Entities/ScheduleJobLog.js');
const ScheduleJobRepository = require('../Repositories/ScheduleJobRepository.js');
const ScheduleJobLogRepository = require('../Repositories/ScheduleJobLogRepository.js');
const ScheduleJobEventBus = require('./ScheduleJobEventBus.js');
const InitSQL = require('../../init_sql.js');

class ScheduleJobManager {
  constructor() {
    this.runningJob = [];
  }

  async initWithConnPool(pool) {
    MySQL.setPool(pool);
    let result = await this.init();
    return result;
  }

  async initWithMySQLConfig(config) {
    MySQL.createPool(config);
    let result = await this.init();
    return result;
  }

  async init() {
    let result = await MySQL.testConnection();

    if(!result.success)
      return result;

    try {
      let createScheduleJobTableSql = InitSQL.createScheduleJobTable;
      let createScheduleJobLogTableSql = InitSQL.createScheduleJobLogTable;
      //create schedule_job table;
      await MySQL.query(createScheduleJobTableSql, []);
      //create schedule_job_log table;
      await MySQL.query(createScheduleJobLogTableSql, []);

      return {success: true};
    }catch(err) {
      return {success: false, err: err.toString()};
    }
  }

  async getJobLog(opt = {offset: 0, limit: 10, order: 'DESC'}, jobId = '') {
    let result = await ScheduleJobLogRepository.getLog(jobId, opt.offset, opt.limit, opt.order);
    return result;
  }

  async newJob(name, cronSetting, param, consumer, exclusive, status) {
    try {
      let job = new ScheduleJob({
        job_id: '',
        job_name: name,
        job_param: param,
        job_cron_setting: cronSetting,
        consumer: consumer,
        exclusive: exclusive,
        status: status
      });

      let result = await ScheduleJobRepository.newJob(job);

      if(result.success) {
        job.setId(result.jobId);
        return {success:true, job:job};
      }

      return result;

    }catch(err) {
      return {success: false, err: err.toString()};
    }
  }

  async updateJob(job) {
    let result = await ScheduleJobRepository.updateJob(job);
    return result;
  }

  async deleteJob(jobId) {
    let result = await ScheduleJobRepository.deleteJob(jobId);
    return result;
  }

  async getJobById(jobId) {
    let result = await ScheduleJobRepository.getJobById(jobId);
    return result;
  }

  async getJobsByStatus(status) {
    let result = await ScheduleJobRepository.getJobsByStatus(status);
    return result;
  }

  getRunningJobs() {
    let jobs = [];
    for(var i = 0 ; i < this.runningJob.length ; i++) {
      jobs.push(this.runningJob[i].job);
    }
    return jobs;
  }

  //start the job if not running;
  async startJobById(jobId) {
    //prevent dublicate running job;
    if(this.isRunningJob(jobId))
      return {success:true};

    let getJobResult = await this.getJobById(jobId);
    if(!getJobResult.success)
      return getJobResult;

    let result = await this.startJobs([getJobResult.job]);
    return result;
  }

  //start jobs by status if not running;
  async startJobsByStatus(status) {
    let getJobResult = await ScheduleJobRepository.getJobsByStatus(status);
    if(!getJobResult.success) {
      return getJobResult;
    }

    let jobs = getJobResult.jobs;

    //prevent dublicate running job;
    for(var i = 0 ; i < jobs.length ; i++) {
      if(this.isRunningJob(jobs[i].getId()))
        jobs.splice(i);
    }

    return await this.startJobs(jobs);
  }

  async restartJobById(jobId) {
    //if running, stop the job;
    let stopResult = true;
    if(this.isRunningJob(jobId)) {
      stopResult = this.stopJobById(jobId);
    }

    if(!stopResult)
      return {success:false, err: 'stop job failed'};

    let startResult = await this.startJobById(jobId);

    return startResult;
  }

  stopJobById(jobId) {
    for(var i = 0 ; i < this.runningJob.length ; i++) {
      if(jobId + '' === this.runningJob[i].job.getId() + '') {
        this.runningJob[i].task.stop();
        this.runningJob[i].consumer.off(this.runningJob[i].job.getName());
        this.runningJob.splice(i);
        return true;
      }
    }
    return false;
  }

  async startJobs(jobs) {

    for(let i = 0 ; i < jobs.length ; i++) {
      let jobId = jobs[i].getId();
      let cronSetting = jobs[i].getCronSetting();
      try {

        //load job consumer class from app root;
        let consumer = require(AppRoot + jobs[i].getConsumer());
        consumer.on(jobs[i].getName());

        let task = Cron.schedule(cronSetting, async () => {

          //reload the job entity in case any param update;
          let getJobResult = await ScheduleJobRepository.getJobById(jobId);

          if(!getJobResult.success) {
            return getJobResult;
          }

          let job = getJobResult.job;

          try {
            let machine = IP.address();
            let jobLogId = job.getId();
            let cronSettingArr = cronSetting.split(' ');

            //joblogid is a primary key in database;
            if(cronSettingArr.length >= 6) {
              jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDHHmmss');
            }else if(cronSettingArr[0] !== '*') {
              jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDHHmm');
            }else if(cronSettingArr[1] !== '*') {
              jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDHH');
            }else if(cronSettingArr[2] !== '*') {
              jobLogId = jobLogId + '-' + Moment().format('YYYYMMDD');
            }else if(cronSettingArr[3] !== '*') {
              jobLogId = jobLogId + '-' + Moment().format('YYYYMM');
            }else if(cronSettingArr[4] !== '*') {
              jobLogId = jobLogId + '-' + Moment().format('YYYYMMDDE');
            }

            //if not exclusive job, add ip address as part of joblogid to prevent duplicate key;
            if(!job.getExclusive()) {
              jobLogId = jobLogId + '-' + machine;
            }

            let log = new ScheduleJobLog({
              job_log_id: jobLogId,
              job_id: job.getId(),
              machine: machine,
              start_time: Moment().format('YYYY-MM-DD HH:mm:ss'),
              end_time: null,
              result: ''
            });

            let newLogResult = await ScheduleJobLogRepository.newLog(log);

            if(!newLogResult.success)
              return newLogResult;

            //emit job event;
            ScheduleJobEventBus.emit('scheduleJob:' + job.getName(), job, log);

            return {success:true};

          }catch(err) {
            return {success: false, err:err.toString()};
          }
    		});

        this.runningJob.push({
          job: jobs[i],
          task: task,
          consumer: consumer
        });

      }catch(err) {
        return {success:false, err: err.toString()};
      }
    }
    return {success:true};
  }

  isRunningJob(jobId) {
    for(var i = 0 ; i < this.runningJob.length ; i++) {
      if(jobId + '' === this.runningJob[i].job.getId() + '')
        return true;
    }
    return false;
  }

}
module.exports = new ScheduleJobManager();
