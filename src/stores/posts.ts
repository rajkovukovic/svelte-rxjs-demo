import { combineLatest, Observable, of } from "rxjs";
import { distinctUntilChanged, shareReplay, switchMap, tap } from "rxjs/operators";
import { fromFetch } from 'rxjs/fetch';
import { Logger } from "./logs";
import { userIdStore, userStore } from "./user";

function fetchPosts(userId: String) {
  return fromFetch(`https://jsonplaceholder.typicode.com/posts/?userId=${userId}`).pipe(switchMap(response => {
    if (response.ok) {
      // OK return data
      return response.json();
    } else {
      // Server is returning a status requiring the client to try something else.
      return of({ error: true, message: `Error ${response.status}` });
    }
  }));
}

export const postsStore: Observable<Object[] | null> = combineLatest([userIdStore, userStore]).pipe(
  switchMap(([userId, user]) => {
    if (userId && userId === user?.id) {
      Logger.logWithColor('rgb(180,0,100)', `Fetching Posts for User "${user.id}"`);
      return fetchPosts(user.id);
    }

    return of(null);
  }),
  distinctUntilChanged(),
  tap(posts => {
    if (posts)
      Logger.logWithColor('rgb(255,0,140)', `Posts for User "${posts[0].userId}" fetched successfully`);
    else
      Logger.log(`Posts are now "null"`);
  }),
  shareReplay(1),
);
