<script lang="ts">
  import Loader from './Loader.svelte';
  import { afterUpdate, beforeUpdate } from 'svelte';

  import { prettyJSON } from './utils';
  import './stores/combined-stores';
  import { Logger, logsStore, selectedLogIndexStore } from './stores/logs';
  import {
    changeUserId,
    isUserLoadingStore,
    userIdStore,
    userStore,
  } from './stores/user';
  import { isPostsLoadingStore, postsStore } from './stores/posts';

  let logDiv;
  const availableUserIds = [1, 2, 3];

  function selectUser(userId: number) {
    const nextUserId = userId === $userIdStore ? null : userId;
    changeUserId(nextUserId);
  }

  let pendingScrollToEndOfLogList = false;

  beforeUpdate(() => {
    if (!logDiv) return;

    pendingScrollToEndOfLogList =
      logDiv.scrollHeight - logDiv.scrollTop <= logDiv.clientHeight + 120;
  });

  afterUpdate(() => {
    if (pendingScrollToEndOfLogList) {
      logDiv.scrollTo(0, logDiv.scrollHeight);
      pendingScrollToEndOfLogList = false;
    }
  });
</script>

<style>
  main {
    width: 100vw;
    height: 100vh;
    display: grid;
    grid-template-columns: 50% 50%;
  }

  .app {
    display: grid;
    grid-template-rows: auto auto auto 1fr auto 1fr;
    max-height: 100vh;
    padding: 1em;
    transition: filter 0.3s ease-out;
  }

  .app.in-past {
    filter: grayscale(1);
  }

  .user-id-list {
    display: flex;
    flex-wrap: wrap;
    padding: 1em 0;
  }
  .user-id {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 3em;
    min-width: 3em;
    border: 1px solid gray;
    font-size: 2em;
    margin: 0 1em 0 0;
    background-color: silver;
    color: white;
    cursor: pointer;
  }

  .user-id.active {
    background-color: rgb(0, 122, 204);
  }

  .user-detail,
  .posts-detail {
    background-color: antiquewhite;
    overflow-x: auto;
    max-height: 100%;
    padding: 1em;
    margin: 0 -1em;
  }

  .log-container {
    position: relative;
    overflow: auto;
    padding: 1em;
    padding-bottom: 100px;
    background-color: black;
    color: silver;
    font-family: monospace;
  }

  .log-item {
    padding: 0.2em 0;
  }

  .log-item:hover {
    background-color: rgb(32, 32, 32);
    cursor: pointer;
  }

  .log-item:not(.active) {
    opacity: 0.4;
  }

  .log-timestamp {
    color: gray;
  }

  .reset-log {
    position: fixed;
    bottom: 1em;
    right: 1em;
  }
</style>

<main>
  <div class="app" class:in-past={$selectedLogIndexStore >= 0}>
    <h1>Pick user</h1>
    <div class="user-id-list">
      {#each availableUserIds as availableUserId}
        <div
          class="user-id"
          class:active={availableUserId === $userIdStore}
          on:click={() => selectUser(availableUserId)}>
          {availableUserId}
        </div>
      {/each}
    </div>

    <h2>
      User
      {#if $isUserLoadingStore}
        <Loader />
      {/if}
    </h2>
    <pre
      class="user-detail">{$userStore ? prettyJSON($userStore) : 'null'}</pre>

    <h2>
      Posts
      {#if $isPostsLoadingStore}
        <Loader />
      {/if}
    </h2>
    <pre
      class="posts-detail">{$postsStore ? prettyJSON($postsStore) : 'null'}</pre>
  </div>
  <pre
    class="log-container"
    on:click|stopPropagation={() => Logger.selectLog(-1)}
    bind:this={logDiv}>
    {#each $logsStore as log, index}
      <div
        class="log-item"
        class:active={$selectedLogIndexStore < 0 ? true : index <= $selectedLogIndexStore}
        on:click|stopPropagation={() => Logger.selectLog(index)}>
        <span
          class="log-timestamp">{log.timestamp}</span>&nbsp;&nbsp;<span
          class="log-message"
          style={log.color ? `color: ${log.color};` : ''}>{log.message}</span>
      </div>
    {/each}
    <button
      class="reset-log"
      on:click={() => Logger.clearLogs()}>Clear console</button>
  </pre>
</main>
