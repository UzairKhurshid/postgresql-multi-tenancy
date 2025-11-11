import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { WorkflowNode } from "./WorkflowNode";

@Entity("node_templates")
export class NodeTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @OneToMany(() => WorkflowNode, (node) => node.nodeTemplate)
  workflowNodes: WorkflowNode[];
}
