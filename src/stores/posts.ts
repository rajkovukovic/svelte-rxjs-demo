import { Observable, of } from "rxjs";
import { shareReplay, switchMap, tap } from "rxjs/operators";
import { Logger } from "./logs";
import { userStore } from "./user";

function fetchPosts(userId: String) {
  return fetch(`https://jsonplaceholder.typicode.com/posts/?userId=${userId}`).then(response => response.json());
}

export const postsStore: Observable<Object[] | null> = userStore.pipe(
  switchMap((user) => {
    if (user) {
      Logger.logWithColor('rgb(180,0,100)', `Fetching Posts for User "${user.id}"`);
      return fetchPosts(user.id);
    }

    return of(null);
  }),

  tap(posts => {
    if (posts)
      Logger.logWithColor('rgb(255,0,140)', `Posts for User "${posts[0].userId}" fetched successfully`);
    else
      Logger.log(`Posts are now "null"`);
  }),

  shareReplay(1),
);
