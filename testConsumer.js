const JobConsumer = require('./index.js').JobConsumer;

class TestConsumer extends JobConsumer {
  constructor() {
    super();
  }

  async run(job, jobLog) {
    await super.complete(jobLog, 'testing');
  }
}

module.exports = new TestConsumer();
