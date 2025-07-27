import type { Express } from "express";
import type { IStorage } from "./storage";
import { authenticateAdmin as requireAdminAuth } from "./supabase-auth";
import { db } from "./db";
import { authors, articles } from "@shared/schema";
import { eq, desc, like, or, sql } from "drizzle-orm";

export function registerAuthorRoutes(app: Express, storage: IStorage) {
  // Get all authors with search
  app.get("/api/admin/authors", requireAdminAuth as any, async (req: any, res) => {
    try {
      const { search } = req.query;
      
      const baseQuery = db
        .select({
          id: authors.id,
          name: authors.name,
          email: authors.email,
          bio: authors.bio,
          createdAt: authors.createdAt,
          articleCount: sql<number>`count(${articles.id})::int`,
        })
        .from(authors)
        .leftJoin(articles, eq(articles.authorId, authors.id))
        .groupBy(authors.id);

      const query = search 
        ? baseQuery.where(
            or(
              like(authors.name, `%${search}%`),
              like(authors.email, `%${search}%`)
            )
          )
        : baseQuery;

      const result = await query.orderBy(desc(authors.createdAt));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching authors:", error);
      res.status(500).json({ message: "Error al obtener autores" });
    }
  });

  // Get single author
  app.get("/api/admin/authors/:id", requireAdminAuth as any, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const [author] = await db
        .select()
        .from(authors)
        .where(eq(authors.id, parseInt(id)));
      
      if (!author) {
        return res.status(404).json({ message: "Autor no encontrado" });
      }
      
      res.json(author);
    } catch (error) {
      console.error("Error fetching author:", error);
      res.status(500).json({ message: "Error al obtener autor" });
    }
  });

  // Create author
  app.post("/api/admin/authors", requireAdminAuth as any, async (req: any, res) => {
    try {
      const { name, email, bio } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ message: "Nombre y email son requeridos" });
      }

      // Check if email already exists
      const [existing] = await db
        .select()
        .from(authors)
        .where(eq(authors.email, email));
      
      if (existing) {
        return res.status(400).json({ message: "Ya existe un autor con ese email" });
      }

      const [newAuthor] = await db
        .insert(authors)
        .values({
          name,
          email,
          bio: bio || null,
        })
        .returning();
      
      // Log action
      console.log(`[ADMIN ACTION] User: ${req.user.username}, Action: create author`, newAuthor);
      
      res.json(newAuthor);
    } catch (error) {
      console.error("Error creating author:", error);
      res.status(500).json({ message: "Error al crear autor" });
    }
  });

  // Update author
  app.put("/api/admin/authors/:id", requireAdminAuth as any, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, email, bio } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ message: "Nombre y email son requeridos" });
      }

      // Check if email already exists for another author
      const [existing] = await db
        .select()
        .from(authors)
        .where(eq(authors.email, email));
      
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ message: "Ya existe otro autor con ese email" });
      }

      const [updatedAuthor] = await db
        .update(authors)
        .set({
          name,
          email,
          bio: bio || null,
        })
        .where(eq(authors.id, parseInt(id)))
        .returning();
      
      if (!updatedAuthor) {
        return res.status(404).json({ message: "Autor no encontrado" });
      }
      
      // Log action
      console.log(`[ADMIN ACTION] User: ${req.user.username}, Action: update author`, updatedAuthor);
      
      res.json(updatedAuthor);
    } catch (error) {
      console.error("Error updating author:", error);
      res.status(500).json({ message: "Error al actualizar autor" });
    }
  });

  // Delete author
  app.delete("/api/admin/authors/:id", requireAdminAuth as any, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reassignTo } = req.query;
      
      // Check if author has articles
      const [articleCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(articles)
        .where(eq(articles.authorId, parseInt(id)));
      
      if (articleCount.count > 0) {
        // If reassignTo is provided, reassign articles to another author
        if (reassignTo) {
          await db
            .update(articles)
            .set({ authorId: parseInt(reassignTo as string) })
            .where(eq(articles.authorId, parseInt(id)));
          
          console.log(`[ADMIN ACTION] Reassigned ${articleCount.count} articles from author ${id} to author ${reassignTo}`);
        } else {
          // Return list of other authors to reassign to
          const otherAuthors = await db
            .select({ id: authors.id, name: authors.name })
            .from(authors)
            .where(sql`${authors.id} != ${parseInt(id)}`);
          
          return res.status(400).json({ 
            message: `Este autor tiene ${articleCount.count} artículo(s). Debes reasignarlos a otro autor antes de eliminar.`,
            articleCount: articleCount.count,
            availableAuthors: otherAuthors
          });
        }
      }

      const [deletedAuthor] = await db
        .delete(authors)
        .where(eq(authors.id, parseInt(id)))
        .returning();
      
      if (!deletedAuthor) {
        return res.status(404).json({ message: "Autor no encontrado" });
      }
      
      // Log action
      console.log(`[ADMIN ACTION] User: ${req.user.username}, Action: delete author`, deletedAuthor);
      
      res.json({ message: "Autor eliminado correctamente" });
    } catch (error) {
      console.error("Error deleting author:", error);
      res.status(500).json({ message: "Error al eliminar autor" });
    }
  });
}