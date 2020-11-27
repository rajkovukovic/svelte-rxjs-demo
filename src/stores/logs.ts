import { BehaviorSubject } from "rxjs";

interface Log {
  timestamp: string;
  message: string;
  color: string;
}

let lastLogTime = Date.now();

function formatTime(timeInMilliseconds: number) {
  const result = '+' + (timeInMilliseconds / 1000).toFixed(3);
  return result.length < 10 ?
    ' '.repeat(10 - result.length) + result
    : result;
}

export const logsStore = new BehaviorSubject<Log[]>([]);

function logWithConfig(
  msgs: any[],
  color: string | null = null,
  prefix: string = '',
  suffix: string = '',
) {
  const logs = logsStore.value;
  const timestamp = formatTime(Date.now() - lastLogTime);
  lastLogTime = Date.now();
  msgs.forEach((msg, index) => logs.push({
    timestamp,
    message: index === 0
      ? prefix + String(msg)
      : index === msgs.length - 1
        ? String(msg) + suffix
        : String(msg),
    color,
  }));
  logsStore.next(logs);
}

export class Logger {
  static log(...args) {
    logWithConfig(args);
  }

  static logWithPrefix(prefix: string, ...restArgs) {
    logWithConfig(restArgs, undefined, prefix);
  }

  static logWithColor(color: string, ...restArgs) {
    logWithConfig(restArgs, color);
  }

  static logWithPrefixAndColor(prefix: string, color: string, ...restArgs) {
    logWithConfig(restArgs, color, prefix);
  }
}
