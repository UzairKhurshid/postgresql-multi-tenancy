import "reflect-metadata";
import { AppDataSource } from "./data-source";
import * as dotenv from "dotenv";

dotenv.config();

async function moveAppToSchema(appSlug: string) {
    try {


        await AppDataSource.initialize();
        console.log("✅ Data Source initialized");

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const appResult = await queryRunner.query(
            `SELECT id FROM app WHERE slug = $1`,
            [appSlug]
        );

        if (appResult.length === 0) {
            throw new Error(`❌ App with slug '${appSlug}' not found`);
        }
        const schemaName = `${appSlug}_schema`;

        console.log(`🚀 Moving app '${appSlug}' to schema '${schemaName}'...`);

        // Get app_id for the given slug

        const appId = appResult[0].id;
        console.log(`✅ Found app with ID: ${appId}`);

        // Create schema
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
        console.log(`✅ Created schema: ${schemaName}`);

        // Create tables in the new schema
        console.log("📋 Creating tables in new schema...");

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.workflow (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        app_id INTEGER NOT NULL
      )
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.workflow_nodes (
        id SERIAL PRIMARY KEY,
        workflow_id INTEGER NOT NULL,
        node_template_id INTEGER NOT NULL
      )
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.workflow_edges (
        id SERIAL PRIMARY KEY,
        from_node_id INTEGER NOT NULL,
        to_node_id INTEGER NOT NULL,
        workflow_id INTEGER NOT NULL
      )
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.workflow_execution (
        id SERIAL PRIMARY KEY,
        workflow_id INTEGER NOT NULL,
        status VARCHAR NOT NULL
      )
    `);

        console.log("✅ Tables created in new schema");

        // Move workflow data
        console.log("📦 Moving workflow data...");
        const workflowResult = await queryRunner.query(`
      INSERT INTO ${schemaName}.workflow (id, name, status, app_id)
      SELECT id, name, status, app_id
      FROM workflow
      WHERE app_id = $1
      RETURNING id
    `, [appId]);

        const workflowIds = workflowResult.map((w: any) => w.id);
        console.log(`✅ Moved ${workflowIds.length} workflow(s)`);

        // Move workflow_nodes data
        console.log("📦 Moving workflow nodes...");
        const nodesResult = await queryRunner.query(`
      INSERT INTO ${schemaName}.workflow_nodes (id, workflow_id, node_template_id)
      SELECT wn.id, wn.workflow_id, wn.node_template_id
      FROM workflow_nodes wn
      INNER JOIN workflow w ON wn.workflow_id = w.id
      WHERE w.app_id = $1
      RETURNING id
    `, [appId]);

        console.log(`✅ Moved ${nodesResult.length} workflow node(s)`);

        // Move workflow_edges data
        console.log("📦 Moving workflow edges...");
        const edgesResult = await queryRunner.query(`
      INSERT INTO ${schemaName}.workflow_edges (id, from_node_id, to_node_id, workflow_id)
      SELECT we.id, we.from_node_id, we.to_node_id, we.workflow_id
      FROM workflow_edges we
      INNER JOIN workflow w ON we.workflow_id = w.id
      WHERE w.app_id = $1
      RETURNING id
    `, [appId]);

        console.log(`✅ Moved ${edgesResult.length} workflow edge(s)`);

        // Move workflow_execution data
        console.log("📦 Moving workflow executions...");
        const executionsResult = await queryRunner.query(`
      INSERT INTO ${schemaName}.workflow_execution (id, workflow_id, status)
      SELECT we.id, we.workflow_id, we.status
      FROM workflow_execution we
      INNER JOIN workflow w ON we.workflow_id = w.id
      WHERE w.app_id = $1
      RETURNING id
    `, [appId]);

        console.log(`✅ Moved ${executionsResult.length} workflow execution(s)`);

        // Delete from original tables
        console.log("🗑️  Cleaning up original tables...");
        await queryRunner.query(`
      DELETE FROM workflow_execution
      WHERE workflow_id IN (SELECT id FROM workflow WHERE app_id = $1)
    `, [appId]);

        await queryRunner.query(`
      DELETE FROM workflow_edges
      WHERE workflow_id IN (SELECT id FROM workflow WHERE app_id = $1)
    `, [appId]);

        await queryRunner.query(`
      DELETE FROM workflow_nodes
      WHERE workflow_id IN (SELECT id FROM workflow WHERE app_id = $1)
    `, [appId]);

        await queryRunner.query(`
      DELETE FROM workflow WHERE app_id = $1
    `, [appId]);

        console.log("✅ Cleaned up original tables");

        await queryRunner.release();

        console.log(`\n✅ Successfully moved app '${appSlug}' to schema '${schemaName}'!`);
        console.log(`\n📊 Summary:`);
        console.log(`   - Workflows: ${workflowIds.length}`);
        console.log(`   - Nodes: ${nodesResult.length}`);
        console.log(`   - Edges: ${edgesResult.length}`);
        console.log(`   - Executions: ${executionsResult.length}`);
    } catch (error) {
        console.error("❌ Error moving app to schema:", error);
        throw error;
    } finally {
        await AppDataSource.destroy();
        console.log("✅ Database connection closed");
    }
}

// Get app slug from command line arguments
const appSlug = process.argv[2];

if (!appSlug) {
    console.error("❌ Error: Please provide an app slug as an argument");
    console.log("Usage: npm run move-app -- <app-slug>");
    console.log("Example: npm run move-app -- zapier");
    process.exit(1);
}

moveAppToSchema(appSlug);
