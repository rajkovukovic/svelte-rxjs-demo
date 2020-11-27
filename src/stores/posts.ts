import { BehaviorSubject, merge, Observable, of } from "rxjs";
import { distinctUntilChanged, shareReplay, switchMap, tap } from "rxjs/operators";
import { fromFetch } from 'rxjs/fetch';
import { Logger } from "./logs";
import { userStore } from "./user";

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

export const isPostsLoadingStore = new BehaviorSubject<boolean>(false);

export const postsStore: Observable<Object[] | null> = userStore.pipe(
  switchMap((user) => {
    if (user) {
      Logger.logWithColor('rgb(180,0,100)', `Fetching Posts for User "${user.id}"`);

      isPostsLoadingStore.next(true);

      return merge(of(null), fetchPosts(user.id));
    }

    return of(null);
  }),
  distinctUntilChanged(),
  tap(posts => {

    if (posts) {
      isPostsLoadingStore.next(false);
      Logger.logWithColor('rgb(255,0,140)', `Posts for User "${posts[0].userId}" fetched successfully`);
    } else {
      Logger.log(`Posts are now "null"`);
    }
  }),
  shareReplay(1),
);
