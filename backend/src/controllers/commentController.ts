import type { Request, Response } from "express";
import * as queries from "../db/queries";

import { getAuth } from "@clerk/express";

// Add comment to product (protected)
export const createComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: "Comment content are required" });
      return;
    }

    const existingProduct = await queries.getProductById(productId as string);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const comment = await queries.createComment({
      content,
      userId,
      productId: productId as string,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Delete comment (protected - owner only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { commentId } = req.params;

    // Check if comment exists and belongs to user
    const existingComment = await queries.getCommentById(commentId as string);
    if (!existingComment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    if (existingComment.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own comments" });
      return;
    }

    await queries.deleteComment(commentId as string);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment: ", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
