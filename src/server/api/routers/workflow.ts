import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const workflowRouter = createTRPCRouter({
  // Create a new workflow
  create: privateProcedure
    .input(z.object({
      title: z.string(),
      prompt: z.string(),
      content: z.string(),
      type: z.string(),
      leadMessage: z.string(),
      generatedContent: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.workflow.create({
        data: {
          ...input,
          userId: ctx.auth.userId
        }
      });
    }),

  // Get all workflows for a user
  list: privateProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.workflow.findMany({
        where: {
          userId: ctx.auth.userId
        },
        include: {
          steps: {
            orderBy: {
              stepIndex: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }),

  // Get a specific workflow with its steps
  getById: privateProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.workflow.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.userId
        },
        include: {
          steps: {
            orderBy: {
              stepIndex: 'asc'
            }
          }
        }
      });
    }),

  // Update workflow
  update: privateProcedure
    .input(z.object({
      id: z.string(),
      prompt: z.string().optional(),
      content: z.string().optional(),
      leadMessage: z.string().optional(),
      generatedContent: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.workflow.update({
        where: {
          id,
          userId: ctx.auth.userId
        },
        data
      });
    }),

  // Save or update a workflow step
  saveStep: privateProcedure
    .input(z.object({
      workflowId: z.string(),
      stepName: z.string(),
      stepContent: z.string(),
      stepIndex: z.number(),
      status: z.enum(['pending', 'editing', 'complete'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if step already exists
      const existingStep = await ctx.db.workflowStep.findFirst({
        where: {
          workflowId: input.workflowId,
          stepName: input.stepName
        }
      });

      if (existingStep) {
        // Update existing step
        return await ctx.db.workflowStep.update({
          where: {
            id: existingStep.id
          },
          data: {
            stepContent: input.stepContent,
            status: input.status,
            stepIndex: input.stepIndex
          }
        });
      } else {
        // Create new step
        return await ctx.db.workflowStep.create({
          data: input
        });
      }
    }),

  // Get steps for a workflow
  getSteps: privateProcedure
    .input(z.object({
      workflowId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Verify user owns the workflow
      const workflow = await ctx.db.workflow.findFirst({
        where: {
          id: input.workflowId,
          userId: ctx.auth.userId
        }
      });

      if (!workflow) {
        throw new Error("Workflow not found or access denied");
      }

      return await ctx.db.workflowStep.findMany({
        where: {
          workflowId: input.workflowId
        },
        orderBy: {
          stepIndex: 'asc'
        }
      });
    }),

  // Delete workflow
  delete: privateProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.workflow.delete({
        where: {
          id: input.id,
          userId: ctx.auth.userId
        }
      });
    })
});
