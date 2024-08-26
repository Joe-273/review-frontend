export default class {
  constructor() {
    this.logs = []
  }

  // 添加日志记录
  log(level, message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [${level}] ${message}`
    this.logs.push(logEntry)
  }

  // 记录不同级别的日志
  info(message) {
    this.log('INFO', message + '\n')
  }

  warn(message) {
    this.log('WARN', message + '\n')
  }

  error(message) {
    this.log('ERROR', message + '\n')
  }

  // 返回所有日志内容作为字符串
  getLogs() {
    return this.logs.join('\n')
  }

  // 清空日志
  clearLogs() {
    this.logs = []
  }
}
