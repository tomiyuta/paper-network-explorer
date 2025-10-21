import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  paper: router({
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        const searchUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(input.query)}&fields=paperId,title,abstract,year,citationCount,referenceCount,authors,venue,externalIds,url&limit=1`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) {
          throw new Error("論文の検索に失敗しました");
        }
        
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
          throw new Error("論文が見つかりませんでした");
        }
        
        return data.data[0];
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const url = `https://api.semanticscholar.org/graph/v1/paper/${input.id}?fields=paperId,title,abstract,year,citationCount,referenceCount,authors,venue,externalIds,url`;
        
        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("論文が見つかりませんでした");
          }
          throw new Error("論文詳細の取得に失敗しました");
        }
        
        return await response.json();
      }),

    getReferences: publicProcedure
      .input(z.object({ paperId: z.string(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        const url = `https://api.semanticscholar.org/graph/v1/paper/${input.paperId}/references?fields=paperId,title,year,citationCount&limit=${input.limit}`;
        
        console.log("Fetching references for:", input.paperId);
        const response = await fetch(url);
        console.log("References response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("References API error:", errorText);
          throw new Error(`参考文献の取得に失敗しました: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("References data:", { count: data.data?.length || 0 });
        return data;
      }),

    getCitations: publicProcedure
      .input(z.object({ paperId: z.string(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        const url = `https://api.semanticscholar.org/graph/v1/paper/${input.paperId}/citations?fields=paperId,title,year,citationCount&limit=${input.limit}`;
        
        console.log("Fetching citations for:", input.paperId);
        const response = await fetch(url);
        console.log("Citations response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Citations API error:", errorText);
          throw new Error(`引用論文の取得に失敗しました: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Citations data:", { count: data.data?.length || 0 });
        return data;
      }),
  }),
});

export type AppRouter = typeof appRouter;
