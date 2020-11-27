import { combineLatest } from "rxjs";
import { postsSubject, isPostsLoadingSubject } from "./posts";
import { userIdSubject, userSubject, isUserLoadingSubject } from "./user";

window['combinedStores'] = combineLatest([
  userIdSubject,
  userSubject,
  isUserLoadingSubject,
  postsSubject,
  isPostsLoadingSubject,
]);