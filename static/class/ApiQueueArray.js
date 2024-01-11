class ApiQueueArray {
  constructor(maxSize, timeout = 5000, interval = 1000) {
    this.maxSize = maxSize;
    this.array = [];
    this.isProcessing = false;
    this.delay = 0;
    this.timeout = timeout;
    this.active = false;
    this.reduceInterval = interval;

    this.reduceDelay = async () => {
      if (this.delay > 0) {
        if (!this.isProcessing) this.delay -= this.reduceInterval;
        setTimeout(this.reduceDelay, this.reduceInterval);
      } else {
        if (this.array.length && this.array.length < this.maxSize)
          await this.executeCallback();
        this.active = false;
      }
    };
  }

  async push(func, ...args) {
    const wrappedFunc = async () => {
      await func(...args);
    };

    this.delay = this.timeout;
    if (!this.active) {
      this.active = true;
      this.reduceDelay();
    }

    if (this.isProcessing) {
      // If the callback is still being executed, add the element to the array
      this.array.push(wrappedFunc);
      return;
    }

    this.array.push(wrappedFunc);
    if (this.array.length >= this.maxSize && !this.isProcessing) {
      this.isProcessing = true;
      await this.executeCallback();
    }
  }

  async executeCallback() {
    const callbacksToProcess = this.array.slice(0, this.maxSize);
    this.array.splice(0, this.maxSize);

    const promises = callbacksToProcess.map(async (callback) => {
      await callback();
    });

    await Promise.all(promises);
    if (this.array.length >= this.maxSize) {
      await this.executeCallback();
    } else {
      this.isProcessing = false;
    }
  }
}
export default ApiQueueArray;
