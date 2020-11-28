import { BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";

export interface AppState {
  userId: number;
  user: Object;
  isUserLoading: boolean;
  posts: Object;
  isPostsLoading: boolean;
};
export interface Log {
  timestamp: string;
  message: string;
  color: string;
  data: AppState;
}

export interface LogOptions {
  color?: string;
  stateData: Partial<AppState>;
}

let lastLogTime = Date.now();

function formatTime(timeInMilliseconds: number) {
  const result = '+' + (timeInMilliseconds / 1000).toFixed(3);
  return result.length < 10 ?
    ' '.repeat(10 - result.length) + result
    : result;
}

const logsSubject = new BehaviorSubject<Log[]>([]);

const selectedLogIndexSubject = new BehaviorSubject(-1);

export const logsStore = logsSubject.asObservable();

export const selectedLogIndexStore = selectedLogIndexSubject.asObservable();

function logWithConfig(
  msgs: any[],
  color: string | null = null,
  stateData: Partial<AppState> = null,
) {
  window['combinedStores'].pipe(
    take(1),
  ).subscribe(([
    userId,
    user,
    isUserLoading,
    posts,
    isPostsLoading,
  ]) => {
    const logs = logsSubject.value;
    const timestamp = formatTime(Date.now() - lastLogTime);
    lastLogTime = Date.now();

    msgs.forEach((msg, index) => logs.push({
      timestamp,
      message: String(msg),
      color,
      data: {
        userId,
        user,
        isUserLoading,
        posts,
        isPostsLoading,
        ...stateData,
      }
    }));
    logsSubject.next(logs);
  });

}

export class Logger {
  static log(...args) {
    logWithConfig(args);
  }

  static logWithColor(color: string, ...restArgs) {
    logWithConfig(restArgs, color);
  }

  static logWithOptions(options: LogOptions, ...restArgs) {
    logWithConfig(restArgs, options.color, options.stateData);
  }

  static selectLog(index: number) {
    if (index >= logsSubject.value.length - 1) {
      selectedLogIndexSubject.next(-1);
    } else {
      selectedLogIndexSubject.next(index);
    }
  }

  static clearLogs() {
    selectedLogIndexSubject.next(-1);
    logsSubject.next([]);
  }
}
