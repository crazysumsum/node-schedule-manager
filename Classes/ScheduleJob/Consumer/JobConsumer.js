const Moment = require('moment');
const ScheduleJobLogRepository = require('../../Repositories/ScheduleJobLogRepository.js');
const ScheduleJobEventBus = require('../ScheduleJobEventBus.js');

class JobConsumer {
  constructor() {
  }

  on(jobName) {
    ScheduleJobEventBus.on('scheduleJob:' + jobName, this.run);
  }

  off(jobName) {
    ScheduleJobEventBus.off('scheduleJob:' + jobName, this.run);
  }

  async complete(jobLog, result) {
    jobLog.setEndTime(Moment().format('YYYY-MM-DD HH:mm:ss'));
    jobLog.setResult(result);
    let updateResult = await ScheduleJobLogRepository.update(jobLog);
    if(!updateResult.success)
      return updateResult;
    else {
      return {success:true};
    }
  }

  async run(job, jobLog) {
    this.complete(jobLog, '');
  }
}

module.exports = JobConsumer;
