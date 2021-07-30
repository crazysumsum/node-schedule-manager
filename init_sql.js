module.exports = {

  createScheduleJobTable :
  'CREATE TABLE IF NOT EXISTS `schedule_job` (' +
    '`job_id` int(100) NOT NULL AUTO_INCREMENT, ' +
    '`job_name` varchar(200) NOT NULL DEFAULT \'\', ' +
    '`job_param` longtext, ' +
    '`job_cron_setting` varchar(100) NOT NULL DEFAULT \'\', ' +
    '`consumer` varchar(1000) NOT NULL DEFAULT \'\', ' +
    '`exclusive` varchar(5) NOT NULL DEFAULT \'\', ' +
    '`status` varchar(10) NOT NULL DEFAULT \'\', ' +
    'PRIMARY KEY (`job_id`), ' +
    'UNIQUE KEY `job_name` (`job_name`) ' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8',

  createScheduleJobLogTable:
  'CREATE TABLE IF NOT EXISTS `schedule_job_log` (' +
    '`job_log_id` varchar(100) NOT NULL, ' +
    '`job_id` int(100) NOT NULL, ' +
    '`machine` varchar(100) DEFAULT NULL, ' +
    '`start_time` datetime NOT NULL, ' +
    '`end_time` datetime DEFAULT NULL, ' +
    '`result` longtext, ' +
    'PRIMARY KEY (`job_log_id`), ' +
    'KEY `job_id` (`job_id`) ' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
};
