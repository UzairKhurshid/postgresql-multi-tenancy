import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { App } from "./entities/App";
import { Workflow } from "./entities/Workflow";
import { NodeTemplate } from "./entities/NodeTemplate";
import { WorkflowNode } from "./entities/WorkflowNode";
import { WorkflowEdge } from "./entities/WorkflowEdge";
import { WorkflowExecution } from "./entities/WorkflowExecution";

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Data Source initialized");

    const appRepository = AppDataSource.getRepository(App);
    const workflowRepository = AppDataSource.getRepository(Workflow);
    const nodeTemplateRepository = AppDataSource.getRepository(NodeTemplate);
    const workflowNodeRepository = AppDataSource.getRepository(WorkflowNode);
    const workflowEdgeRepository = AppDataSource.getRepository(WorkflowEdge);
    const workflowExecutionRepository =
      AppDataSource.getRepository(WorkflowExecution);

    // Create node templates
    console.log("📝 Creating node templates...");
    const triggerTemplate = await nodeTemplateRepository.save({
      name: "Webhook Trigger",
      type: "trigger",
    });

    const actionTemplate = await nodeTemplateRepository.save({
      name: "HTTP Request",
      type: "action",
    });

    const filterTemplate = await nodeTemplateRepository.save({
      name: "Filter",
      type: "filter",
    });

    const transformTemplate = await nodeTemplateRepository.save({
      name: "Data Transform",
      type: "transform",
    });

    console.log("✅ Node templates created");

    // Create 3 apps with workflows
    const apps = [
      { name: "Zapier", slug: "zapier" },
      { name: "Make", slug: "make" },
      { name: "n8n", slug: "n8n" },
    ];

    console.log("📱 Creating apps and workflows...");

    for (const appData of apps) {
      // Create app
      const app = await appRepository.save(appData);
      console.log(`  ✅ Created app: ${appData.name}`);

      // Create workflow for each app
      const workflow = await workflowRepository.save({
        name: `${appData.name} Main Workflow`,
        status: "active",
        appId: app.id,
      });
      console.log(`  ✅ Created workflow: ${workflow.name}`);

      // Create nodes for the workflow
      const node1 = await workflowNodeRepository.save({
        workflowId: workflow.id,
        nodeTemplateId: triggerTemplate.id,
      });

      const node2 = await workflowNodeRepository.save({
        workflowId: workflow.id,
        nodeTemplateId: filterTemplate.id,
      });

      const node3 = await workflowNodeRepository.save({
        workflowId: workflow.id,
        nodeTemplateId: transformTemplate.id,
      });

      const node4 = await workflowNodeRepository.save({
        workflowId: workflow.id,
        nodeTemplateId: actionTemplate.id,
      });

      console.log(`  ✅ Created ${4} nodes for workflow`);

      // Create edges (connections between nodes)
      // node1 -> node2 -> node3 -> node4
      await workflowEdgeRepository.save({
        workflowId: workflow.id,
        fromNodeId: node1.id,
        toNodeId: node2.id,
      });

      await workflowEdgeRepository.save({
        workflowId: workflow.id,
        fromNodeId: node2.id,
        toNodeId: node3.id,
      });

      await workflowEdgeRepository.save({
        workflowId: workflow.id,
        fromNodeId: node3.id,
        toNodeId: node4.id,
      });

      console.log(`  ✅ Created ${3} edges for workflow`);

      // Create execution records
      await workflowExecutionRepository.save({
        workflowId: workflow.id,
        status: "completed",
      });

      await workflowExecutionRepository.save({
        workflowId: workflow.id,
        status: "running",
      });

      console.log(`  ✅ Created ${2} execution records`);
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Apps: ${apps.length}`);
    console.log(`   - Workflows: ${apps.length}`);
    console.log(`   - Node Templates: 4`);
    console.log(`   - Total Nodes: ${apps.length * 4}`);
    console.log(`   - Total Edges: ${apps.length * 3}`);
    console.log(`   - Total Executions: ${apps.length * 2}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log("✅ Database connection closed");
  }
}

seed();
