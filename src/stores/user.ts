import { BehaviorSubject, of, merge } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { distinctUntilChanged, shareReplay, switchMap, tap } from "rxjs/operators";
import { Logger } from "./logs";

function fetchUser(id: String) {
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

export const userIdStore = new BehaviorSubject<string | null>(null);
// export const isUserLoadingStore = new BehaviorSubject<boolean>(false);

export const userStore = userIdStore.pipe(
  switchMap(id => {
    if (id) {
      Logger.logWithColor('rgb(0,100,180)', `Fetching User "${id}"`);
      return merge(of(null), fetchUser(id));
    }

    return of(null);
  }),
  distinctUntilChanged(),
  tap(user => {
    if (user)
      Logger.logWithColor('rgb(0,140,255)', `User "${user.id}" fetched successfully`);
    else
      Logger.log(`User is now "null"`);
  }),
  shareReplay(1),
);
