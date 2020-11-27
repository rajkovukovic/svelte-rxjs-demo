import { BehaviorSubject, of, merge } from "rxjs";
import { distinctUntilChanged, shareReplay, switchMap, tap } from "rxjs/operators";
import { Logger } from "./logs";

function fetchUser(id: String) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(response => response.json());
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
