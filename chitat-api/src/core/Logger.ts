import fs from 'fs';
import path from 'path';

type LogLevel = 'LOG' | 'INFO' | 'ERROR' | 'WARN';

interface LogColors {
  [key: string]: string;
}

const colors: LogColors = {
  LOG: '\x1b[0m',      // white
  INFO: '\x1b[36m',    // cyan
  ERROR: '\x1b[31m',   // red
  WARN: '\x1b[33m',    // yellow
  RESET: '\x1b[0m',
};

const icons: LogColors = {
  LOG: '',
  INFO: 'ℹ️',
  ERROR: '❌',
  WARN: '⚠️',
};

class Logger {

  private stream?: fs.WriteStream

  public openLoggingFile() {
    const fileName = `log-${Date.now()}.txt`
    this.info(`Логи сессии будут записаны в файл \`${fileName}\``)
    this.stream = fs.createWriteStream(path.join(__dirname, '../../', 'logs', fileName), { flags: 'a' });
  }

  public closeLoggingFile(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stream) {
        this.stream.end(`\n~ ~ ~ Завершение записи`)
      } else {
        resolve();
      }
    })
  }

  private message(level: LogLevel, message: string, data?: unknown): void {
    const now = new Date()
    const timestamp = [now.getHours(), now.getMinutes(), now.getSeconds()];
    const date = [now.getDay(), now.getMonth(), now.getFullYear()]
    const color = colors[level];
    const icon = icons[level];

    const textColor = `${color}[${timestamp.join(":")}] ${icon} ${colors.RESET}${message}`

    if (this.stream && !this.stream.destroyed) {

      const textLogging = `${date.join('-')} [${timestamp.join(":")}] ${icon} ${message}`

      this.stream.write(textLogging + '\n', (err) => {
        if (err) {
          console.error(`Ошибка записи лога:`, err)
        }
      })
    }
    console.log(textColor, data ?? '');
  }

  log(message: string, data?: unknown): void {
    this.message('LOG', message, data)
  }

  info(message: string, data?: unknown): void {
    this.message('INFO', message, data);
  }

  error(message: string, data?: unknown): void {
    this.message('ERROR', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.message('WARN', message, data);
  }
}

export const logger = new Logger();
