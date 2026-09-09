"use client";

import { feedAPI, type FeedQuery } from "@/lib/api/feed";
import type { IPost } from "@/types/post";
import { useEffect, useRef, useState } from "react";

// Owns server data and request lifetime; has no dependency on the feed's layout.
export function useFeedData(
  userId: string | null,
  filter: FeedQuery["filter"],
) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = useRef(1);
  const generation = useRef(0);
  const request = useRef<AbortController | null>(null);
  const moreAvailable = useRef(true);

  const loadMoreData = async () => {
    if (request.current || !moreAvailable.current) return;
    const controller = new AbortController();
    request.current = controller;
    const currentGeneration = generation.current;
    const requestedPage = page.current;
    const isCurrent = () =>
      !controller.signal.aborted && generation.current === currentGeneration;
    setLoading(true);
    setError(null);
    try {
      const query = { page: requestedPage, limit: 10, filter };
      const response = userId
        ? await feedAPI.getFeed(query, controller.signal)
        : await feedAPI.getPublicFeed(query, controller.signal);
      if (!isCurrent()) return;
      if (!response.success)
        throw new Error(response.message || "피드를 불러오는데 실패했습니다.");

      setPosts((previous) => {
        const ids = new Set(previous.map((post) => post.id));
        return [
          ...previous,
          ...response.data.filter((post) => !ids.has(post.id)),
        ];
      });
      setLikedPosts((previous) =>
        Array.from(
          new Set([
            ...previous,
            ...response.data
              .filter((post) => post.isLiked)
              .map((post) => post.id),
          ]),
        ),
      );
      moreAvailable.current = response.pagination.hasMore;
      setHasMore(response.pagination.hasMore);
      page.current = requestedPage + 1;
    } catch (cause) {
      if (!isCurrent()) return;
      setError(
        cause instanceof Error
          ? cause.message
          : "피드를 불러오는데 실패했습니다.",
      );
      if (requestedPage === 1) {
        moreAvailable.current = false;
        setHasMore(false);
      }
    } finally {
      if (isCurrent()) {
        request.current = null;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    generation.current += 1;
    request.current?.abort();
    request.current = null;
    page.current = 1;
    moreAvailable.current = true;
    setPosts([]);
    setLikedPosts([]);
    setHasMore(true);
    void loadMoreData();
    return () => {
      generation.current += 1;
      request.current?.abort();
      request.current = null;
    };
    // Requests are scoped to the account and filter, not render-created callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter]);

  return {
    posts,
    setPosts,
    likedPosts,
    setLikedPosts,
    hasMore,
    loading,
    error,
    loadMoreData,
  };
}
