import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { App } from "./App";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";
import { WorkflowExecution } from "./WorkflowExecution";

@Entity("workflow")
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column({ name: "app_id" })
  appId: number;

  @ManyToOne(() => App, (app) => app.workflows)
  @JoinColumn({ name: "app_id" })
  app: App;

  @OneToMany(() => WorkflowNode, (node) => node.workflow)
  nodes: WorkflowNode[];

  @OneToMany(() => WorkflowEdge, (edge) => edge.workflow)
  edges: WorkflowEdge[];

  @OneToMany(() => WorkflowExecution, (execution) => execution.workflow)
  executions: WorkflowExecution[];
}
