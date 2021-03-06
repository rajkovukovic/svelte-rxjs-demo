import { BehaviorSubject, combineLatest, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from "rxjs/operators";
import { Log, Logger, logsStore, selectedLogIndexStore } from "./logs";

function fetchUser(id: String | number) {
  return fromFetch(`https://jsonplaceholder.typicode.com/users/${id}`).pipe(switchMap(response => {
    if (response.ok) {
      // OK return data
      return response.json();
    } else {
      // Server is returning a status requiring the client to try something else.
      return of({ error: true, message: `Error ${response.status}` });
    }
  }));
}

export const userIdSubject = new BehaviorSubject<number | null>(null);

export const isUserLoadingSubject = new BehaviorSubject<boolean>(false);

export const userSubject = userIdSubject.pipe(
  switchMap(id => {
    if (id) {
      isUserLoadingSubject.next(true);

      Logger.logWithColor('cyan', `Fetching User "${id}"`);

      return fetchUser(id);
    }

    return of(null);
  }),
  tap(user => {

    if (isUserLoadingSubject.value) {
      isUserLoadingSubject.next(false);
    }

    Logger.logWithOptions(
      {
        color: user ? 'rgb(0,140,255)' : undefined,
        stateData: { user }
      },
      user
        ? `User "${user.id}" fetched successfully`
        : `User is now "null"`,
    );
  }),
  distinctUntilChanged(),
  shareReplay(1),
);

export function changeUserId(nextId: number) {
  userIdSubject.next(nextId);
}

export const userIdStore = combineLatest([userIdSubject, selectedLogIndexStore, logsStore]).pipe(
  map(([userId, selectedLogIndex, logs]) => (selectedLogIndex < 0 ? userId : (logs[selectedLogIndex] as Log).data.userId)),
  shareReplay(1),
);

export const isUserLoadingStore = combineLatest([isUserLoadingSubject, selectedLogIndexStore, logsStore]).pipe(
  map(([isUserLoading, selectedLogIndex, logs]) => (selectedLogIndex < 0 ? isUserLoading : (logs[selectedLogIndex] as Log).data.isUserLoading)),
  shareReplay(1),
);

export const userStore = combineLatest([userSubject, selectedLogIndexStore, logsStore]).pipe(
  map(([user, selectedLogIndex, logs]) => (selectedLogIndex < 0 ? user : (logs[selectedLogIndex] as Log).data.user)),
  shareReplay(1),
);
