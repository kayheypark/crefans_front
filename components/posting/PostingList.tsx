"use client";

import { useState, useEffect } from "react";
import { Spin, Empty, message } from "antd";
import PostingCard from "./PostingCard";
import { PostingResponse } from "@/types/posting";
import { postingApi } from "@/lib/api/posting";

interface PostingListProps {
  userId?: string;
}

export default function PostingList({ userId }: PostingListProps) {
  const [postings, setPostings] = useState<PostingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostings();
  }, [userId]);

  const loadPostings = async () => {
    try {
      setLoading(true);
      const response = await postingApi.getPostings({
        page: 1,
        limit: 10,
        user_sub: userId,
        status: "PUBLISHED",
      });
      
      if (response.success) {
        setPostings(response.data.postings);
      }
    } catch (error: any) {
      console.error("Failed to load postings:", error);
      message.error("포스팅 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostingUpdate = (updatedPosting: PostingResponse) => {
    setPostings(prev => 
      prev.map(posting => 
        posting.id === updatedPosting.id ? updatedPosting : posting
      )
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (postings.length === 0) {
    return <Empty description="포스팅이 없습니다." />;
  }

  return (
    <div>
      {postings.map((posting) => (
        <PostingCard
          key={posting.id}
          posting={posting}
          onUpdate={handlePostingUpdate}
        />
      ))}
    </div>
  );
}