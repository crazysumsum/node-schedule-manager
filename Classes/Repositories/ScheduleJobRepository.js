const MySQL = require('../Util/MySQL.js');
const ScheduleJob = require('../Entities/ScheduleJob.js');

class ScheduleJobRepository {
  constructor() {
  }

  static async newJob(job) {
    try {

      let jobParam = '';
      if(ScheduleJobRepository.isJSONString(job.getParam()))
        jobParam = JSON.stringify(job.getParam());
      else
        jobParam = job.getParam();

      let sql = 'INSERT INTO schedule_job (job_name, job_param, job_cron_setting, consumer, exclusive, status) VALUES (?,?,?,?,?,?)';
      let sqlData = [
        job.getName(),
        (ScheduleJobRepository.isJSONString(job.getParam())) ? JSON.stringify(job.getParam()) : job.getParam(),
        job.getCronSetting(),
        job.getConsumer(),
        (job.getExclusive()) ? 'true' : 'false',
        job.getStats()
      ];
      let result = await MySQL.query(sql, sqlData);

      if(result.affectedRows + '' !== '1') {
        return {success: false, err:'insert job failed'};
      }

      return {success: true, jobId: result.insertId};
    }catch(err) {
      return {success: false, err: err.toString()};
    }
  }

  static async updateJob(job) {
    try {
      let sql = 'UPDATE schedule_job SET job_name = ?, job_param = ?, job_cron_setting = ?, consumer = ?, exclusive = ?, status = ? WHERE job_id = ?';
      let sqlData = [
        job.getName(),
        (ScheduleJobRepository.isJSONString(job.getParam())) ? JSON.stringify(job.getParam()) : job.getParam(),
        job.getCronSetting(),
        job.getConsumer(),
        (job.getExclusive()) ? 'true' : 'false', job.getStats(),
        job.getId()
      ];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success: false, err:'update job failed'};
      }
      return {success: true};
    }catch(err) {
      return {success: false, err:err.toString()};
    }
  }

  static async deleteJob(jobId) {
    try {
      let sql = 'DELETE FROM schedule_job WHERE job_id = ?';
      let sqlData = [jobId];
      let result = await MySQL.query(sql, sqlData);
      if(result.affectedRows + '' !== '1') {
        return {success:false, err:'delete job failed'};
      }
      return {success:true};
    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async getJobById(jobId) {
    try {
      let sql = 'SELECT * FROM schedule_job WHERE job_id = ? limit 1';
      let sqlData = [jobId];
      let result = await MySQL.query(sql, sqlData, {selectQuery: true})

      if(result.length === 0)
        return {success:false, err:'get job by id failed'};

      (result[0].exclusive === 'true') ? result[0].exclusive = true : result[0].exclusive = false;
      (ScheduleJobRepository.isJSONString(result[0].job_param)) ? result[0].job_param = JSON.parse(result[0].job_param) : result[0].job_param;

      let job = new ScheduleJob(result[0]);

      return {success:true, job:job};
    }catch(err) {
      return {success:false, err: err.toString()};
    }
  }

  static async getJobsByStatus(status) {
    try {
      let sql = 'SELECT * FROM schedule_job WHERE status = ?';
      let sqlData = [status];
      let result = await MySQL.query(sql, sqlData, {selectQuery: true});
      let jobs = [];

      for(let i = 0 ; i < result.length ; i++) {

        (result[i].exclusive === 'true') ? result[i].exclusive = true : result[i].exclusive = false;
        (ScheduleJobRepository.isJSONString(result[i].job_param)) ? result[i].job_param = JSON.parse(result[i].job_param) : result[i].job_param;

        let job = new ScheduleJob(result[i]);
        jobs.push(job);
      }

      return {success:true, jobs:jobs};

    }catch(err) {
      return {success:false, err:err.toString()};
    }
  }

  static isJSONString(str) {
    try {
      JSON.parse(str);
      return true;
    }catch(err) {
      return false;
    }
  }
}

module.exports = ScheduleJobRepository;
