export interface Comment {
  id: string;
  post_slug: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  // 关联的用户信息
  user?: {
    id: string;           // ✅ 添加 id 字段
    username: string;
    avatar_url: string | null;
  };
  // 回复列表
  replies?: Comment[];
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;           // ✅ 添加 id 字段
    username: string;
    avatar_url: string | null;
  };
}

export interface CreateCommentDto {
  post_slug: string;
  content: string;
  parent_id?: string | null;
}

export interface UpdateCommentDto {
  content: string;
}

