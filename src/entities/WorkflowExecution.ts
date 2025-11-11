import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Workflow } from "./Workflow";

@Entity("workflow_execution")
export class WorkflowExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "workflow_id" })
  workflowId: number;

  @Column()
  status: string;

  @ManyToOne(() => Workflow, (workflow) => workflow.executions)
  @JoinColumn({ name: "workflow_id" })
  workflow: Workflow;
}
