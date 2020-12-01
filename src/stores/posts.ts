import { BehaviorSubject, combineLatest, merge, Observable, of } from "rxjs";
import { distinctUntilChanged, map, share, shareReplay, switchMap, tap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { Log, Logger, logsStore, selectedLogIndexStore } from "./logs";
import { userSubject } from "./user";

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

const LOADING_POSTS = Symbol('LOADING_POSTS');

export const isPostsLoadingSubject = new BehaviorSubject<boolean>(false);
export const postsSubject: Observable<Object[] | null> = userSubject.pipe(
  switchMap((user) => {
    if (user) {
      isPostsLoadingSubject.next(true);

      Logger.logWithColor('rgb(180,0,100)', `Fetching Posts for User "${user.id}"`);

      return merge(of(LOADING_POSTS), fetchPosts(user.id));
    }

    return of(null);
  }),
  tap(posts => {
    if (posts !== LOADING_POSTS) {
      if (isPostsLoadingSubject.value) {
        isPostsLoadingSubject.next(false);
      }
    }
  }),
  map(posts => posts === LOADING_POSTS ? null : posts),
  distinctUntilChanged(),
  tap(posts => {
    Logger.logWithOptions(
      {
        color: posts ? 'rgb(255,0,140)' : undefined,
        stateData: { posts }
      },
      posts
        ? `Posts for User "${posts[0].userId}" fetched successfully`
        : `Posts are now "null"`,
    );
  }),
  shareReplay(1),
  // switchMap(posts => posts ? shareReplay(1) : of(posts)),
);

export const isPostsLoadingStore = combineLatest([isPostsLoadingSubject, selectedLogIndexStore, logsStore]).pipe(
  map(([isPostsLoading, selectedLogIndex, logs]) => (selectedLogIndex < 0 ? isPostsLoading : (logs[selectedLogIndex] as Log).data.isPostsLoading)),
  shareReplay(1),
);

export const postsStore = combineLatest([postsSubject, selectedLogIndexStore, logsStore]).pipe(
  map(([posts, selectedLogIndex, logs]) => (selectedLogIndex < 0 ? posts : (logs[selectedLogIndex] as Log).data.posts)),
  shareReplay(1),
);
