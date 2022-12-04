import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { CreateStudentGroupInput } from '../interface/group.interface'
import { Group } from "./group.entity"

@Entity()
export class GroupStudent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  group_id: number

  @Column()
  incident_count: number

  @ManyToOne(() => Group, (group) => group.students)
  @JoinColumn({ name: 'group_id' })
  group: Group

  public prepareToCreate(input: CreateStudentGroupInput) {
      this.student_id = input.student_id
      this.group_id = input.group_id
      this.incident_count = input.incident_count
  }
}
