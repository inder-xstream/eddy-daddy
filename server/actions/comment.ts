"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-helper";

export type CommentWithUser = {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  isLiked?: boolean;
  replyCount?: number;
};

// Create a new comment or reply
export async function createComment(data: {
  content: string;
  videoId: string;
  parentId?: string;
}): Promise<{ success: boolean; comment?: CommentWithUser; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "You must be logged in to comment" };
    }
    const user = session.user;

    const { content, videoId, parentId } = data;

    // Validate content
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (content.length > 2000) {
      return { success: false, error: "Comment is too long (max 2000 characters)" };
    }

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return { success: false, error: "Video not found" };
    }

    // If this is a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return { success: false, error: "Parent comment not found" };
      }

      // Ensure parent belongs to the same video
      if (parentComment.videoId !== videoId) {
        return { success: false, error: "Parent comment does not belong to this video" };
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        videoId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    revalidatePath(`/video/${videoId}`);

    return {
      success: true,
      comment: {
        ...comment,
        isLiked: false,
        replyCount: 0,
      },
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

// Get comments for a video with pagination
export async function getComments(data: {
  videoId: string;
  parentId?: string | null;
  cursor?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  comments?: CommentWithUser[];
  nextCursor?: string | null;
  error?: string;
}> {
  try {
    const { videoId, parentId = null, cursor, limit = 10 } = data;

    // Get authenticated user (if any)
    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch {
      // User not authenticated, continue as anonymous
    }

    // Build where clause
    const where = {
      videoId,
      parentId: parentId === undefined ? null : parentId,
      ...(cursor && {
        createdAt: {
          lt: new Date(cursor),
        },
      }),
    };

    // Fetch comments
    const comments = await prisma.comment.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine if there are more
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Check if there are more comments
    const hasMore = comments.length > limit;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;

    // Get like status for authenticated user
    let likedCommentIds: string[] = [];
    if (userId) {
      const likes = await prisma.commentLike.findMany({
        where: {
          userId,
          commentId: {
            in: commentsToReturn.map((c) => c.id),
          },
        },
        select: {
          commentId: true,
        },
      });
      likedCommentIds = likes.map((like) => like.commentId);
    }

    // Format comments
    const formattedComments: CommentWithUser[] = commentsToReturn.map((comment) => ({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      videoId: comment.videoId,
      parentId: comment.parentId,
      likesCount: comment.likesCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      isLiked: likedCommentIds.includes(comment.id),
      replyCount: comment._count.replies,
    }));

    return {
      success: true,
      comments: formattedComments,
      nextCursor: hasMore ? commentsToReturn[commentsToReturn.length - 1].createdAt.toISOString() : null,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "You must be logged in to delete a comment" };
    }
    const user = session.user;

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    // Check if user owns the comment or is admin
    if (comment.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "You can only delete your own comments" };
    }

    // Delete the comment (cascade will delete replies and likes)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/video/${comment.videoId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

// Toggle like on a comment
export async function toggleCommentLike(commentId: string): Promise<{
  success: boolean;
  isLiked?: boolean;
  likesCount?: number;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "You must be logged in to like a comment" };
    }
    const user = session.user;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return {
        success: true,
        isLiked: false,
        likesCount: Math.max(0, comment.likesCount - 1),
      };
    } else {
      // Like
      await prisma.$transaction([
        prisma.commentLike.create({
          data: {
            userId: user.id,
            commentId,
          },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likesCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        success: true,
        isLiked: true,
        likesCount: comment.likesCount + 1,
      };
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

// Update comment content
export async function updateComment(data: {
  commentId: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "You must be logged in to edit a comment" };
    }
    const user = session.user;

    const { commentId, content } = data;

    // Validate content
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (content.length > 2000) {
      return { success: false, error: "Comment is too long (max 2000 characters)" };
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    // Check if user owns the comment
    if (comment.userId !== user.id) {
      return { success: false, error: "You can only edit your own comments" };
    }

    // Update the comment
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
      },
    });

    revalidatePath(`/video/${comment.videoId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, error: "Failed to update comment" };
  }
}
