class ScheduleJob {
  constructor(dataObj) {
    this.id = dataObj.job_id;
    this.name = dataObj.job_name;
    this.cronSetting = dataObj.job_cron_setting;
    this.consumer = dataObj.consumer;
    this.status = dataObj.status;
    this.param = dataObj.job_param;
    this.exclusive = dataObj.exclusive;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getParam() {
    return this.param;
  }

  getCronSetting() {
    return this.cronSetting;
  }

  getConsumer() {
    return this.consumer;
  }

  getExclusive() {
    return this.exclusive;
  }

  getStats() {
    return this.status;
  }

  setId(id) {
    this.id = id;
  }

  setName(name) {
    this.name = name;
  }

  setParam(param) {
    this.param = param;
  }

  setCronSetting(cronSetting) {
    this.cronSetting = cronSetting;
  }

  setConsumer(consumer) {
    this.consumer = consumer;
  }

  setExclusive(exclusive) {
    this.exclusive = exclusive;
  }

  setStatus(status) {
    this.status = status;
  }

}

module.exports = ScheduleJob;
