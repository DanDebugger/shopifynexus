import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { db } from "../db.server";
import { sessionTable } from "./schema.server";
import { eq, inArray } from "drizzle-orm";

export class DrizzleSessionStorage implements SessionStorage {
  public async storeSession(session: Session): Promise<boolean> {
    try {
      await db.insert(sessionTable).values({
        id: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires ? new Date(session.expires) : null,
        accessToken: session.accessToken || "",
        userId: session.onlineAccessInfo?.associated_user.id,
        firstName: session.onlineAccessInfo?.associated_user.first_name,
        lastName: session.onlineAccessInfo?.associated_user.last_name,
        email: session.onlineAccessInfo?.associated_user.email,
        accountOwner: session.onlineAccessInfo?.associated_user.account_owner || false,
        locale: session.onlineAccessInfo?.associated_user.locale,
        collaborator: session.onlineAccessInfo?.associated_user.collaborator || false,
        emailVerified: session.onlineAccessInfo?.associated_user.email_verified || false,
      }).onDuplicateKeyUpdate({
        set: {
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          expires: session.expires ? new Date(session.expires) : null,
          accessToken: session.accessToken || "",
          userId: session.onlineAccessInfo?.associated_user.id,
          firstName: session.onlineAccessInfo?.associated_user.first_name,
          lastName: session.onlineAccessInfo?.associated_user.last_name,
          email: session.onlineAccessInfo?.associated_user.email,
          accountOwner: session.onlineAccessInfo?.associated_user.account_owner || false,
          locale: session.onlineAccessInfo?.associated_user.locale,
          collaborator: session.onlineAccessInfo?.associated_user.collaborator || false,
          emailVerified: session.onlineAccessInfo?.associated_user.email_verified || false,
        }
      });
      return true;
    } catch (error) {
      console.error("Error storing session:", error);
      return false;
    }
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    try {
      const result = await db.select().from(sessionTable).where(eq(sessionTable.id, id));
      if (result.length === 0) return undefined;
      const rawSession = result[0];
      const session = new Session({
        id: rawSession.id,
        shop: rawSession.shop,
        state: rawSession.state,
        isOnline: rawSession.isOnline,
      });
      if (rawSession.expires) {
        session.expires = new Date(rawSession.expires);
      }
      session.scope = rawSession.scope || undefined;
      session.accessToken = rawSession.accessToken;
      return session;
    } catch (error) {
      console.error("Error loading session:", error);
      return undefined;
    }
  }

  public async deleteSession(id: string): Promise<boolean> {
    try {
      await db.delete(sessionTable).where(eq(sessionTable.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      if (ids.length === 0) return true;
      await db.delete(sessionTable).where(inArray(sessionTable.id, ids));
      return true;
    } catch (error) {
      console.error("Error deleting sessions:", error);
      return false;
    }
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const results = await db.select().from(sessionTable).where(eq(sessionTable.shop, shop));
      return results.map(rawSession => {
        const session = new Session({
          id: rawSession.id,
          shop: rawSession.shop,
          state: rawSession.state,
          isOnline: rawSession.isOnline,
        });
        if (rawSession.expires) {
          session.expires = new Date(rawSession.expires);
        }
        session.scope = rawSession.scope || undefined;
        session.accessToken = rawSession.accessToken;
        return session;
      });
    } catch (error) {
      console.error("Error finding sessions by shop:", error);
      return [];
    }
  }
}
