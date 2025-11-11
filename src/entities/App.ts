import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Workflow } from "./Workflow";

@Entity("app")
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Workflow, (workflow) => workflow.app)
  workflows: Workflow[];
}
