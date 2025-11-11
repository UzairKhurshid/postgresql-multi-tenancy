import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Workflow } from "./Workflow";
import { NodeTemplate } from "./NodeTemplate";
import { WorkflowEdge } from "./WorkflowEdge";

@Entity("workflow_nodes")
export class WorkflowNode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "workflow_id" })
  workflowId: number;

  @Column({ name: "node_template_id" })
  nodeTemplateId: number;

  @ManyToOne(() => Workflow, (workflow) => workflow.nodes)
  @JoinColumn({ name: "workflow_id" })
  workflow: Workflow;

  @ManyToOne(() => NodeTemplate, (template) => template.workflowNodes)
  @JoinColumn({ name: "node_template_id" })
  nodeTemplate: NodeTemplate;

  @OneToMany(() => WorkflowEdge, (edge) => edge.fromNode)
  outgoingEdges: WorkflowEdge[];

  @OneToMany(() => WorkflowEdge, (edge) => edge.toNode)
  incomingEdges: WorkflowEdge[];
}
