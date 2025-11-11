import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Workflow } from "./Workflow";
import { WorkflowNode } from "./WorkflowNode";

@Entity("workflow_edges")
export class WorkflowEdge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "from_node_id" })
  fromNodeId: number;

  @Column({ name: "to_node_id" })
  toNodeId: number;

  @Column({ name: "workflow_id" })
  workflowId: number;

  @ManyToOne(() => Workflow, (workflow) => workflow.edges)
  @JoinColumn({ name: "workflow_id" })
  workflow: Workflow;

  @ManyToOne(() => WorkflowNode, (node) => node.outgoingEdges)
  @JoinColumn({ name: "from_node_id" })
  fromNode: WorkflowNode;

  @ManyToOne(() => WorkflowNode, (node) => node.incomingEdges)
  @JoinColumn({ name: "to_node_id" })
  toNode: WorkflowNode;
}
