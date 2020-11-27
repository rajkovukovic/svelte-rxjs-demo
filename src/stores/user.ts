import { BehaviorSubject, of } from "rxjs";
import { shareReplay, switchMap, tap } from "rxjs/operators";
import { Logger } from "./logs";

function fetchUser(id: String) {
  return fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(response => response.json());
}

export const userIdStore = new BehaviorSubject<string | null>(null);

export const userStore = userIdStore.pipe(
  switchMap(id => {
    if (id) {
      Logger.logWithColor('rgb(0,100,180)', `Fetching User "${id}"`);
      return fetchUser(id);
    }

    return of(null);
  }),

  tap(user => {
    if (user)
      Logger.logWithColor('rgb(0,140,255)', `User "${user.id}" fetched successfully`);
    else
      Logger.log(`User is now "null"`);
  }),

  shareReplay(1),
);
