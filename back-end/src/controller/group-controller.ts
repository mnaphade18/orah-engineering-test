import { NextFunction, Request, Response } from "express"
import { getRepository } from "typeorm"
import { flatMap } from "lodash"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { Group  } from "../entity/group.entity"
import { GroupStudent } from "../entity/group-student.entity"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { Roll } from "../entity/roll.entity"

const ONE_WEEK = 6.048e+8

export class GroupController {
  private studentRollRepository = getRepository(StudentRollState)
  private groupRepository = getRepository(Group)
  private groupStudentRepository = getRepository(GroupStudent)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    
    // Return the list of all groups
    return this.groupRepository.find()
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    
    // Add a Group
    const { body: params } = request


    console.log(params, 'BOdy')

    const input: CreateGroupInput = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
    }
    const group = new Group()
    group.prepareToCreate(input)

    const result = await this.groupRepository.save(group)

    return result
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    
    // Update a Group
    const { body } = request

    this.groupRepository.findOne(body.id).then(group => {
        const updateInput: UpdateGroupInput = {
          id: group.id,
          name: body.name,
          number_of_weeks: body.number_of_weeks,
          roll_states: body.roll_states,
          incidents: body.incidents,
          ltmt: body.ltmt,
        }
        group.prepareToUpdate(updateInput)

        // TODO: add udpate group logic to clear previous data
        return this.groupRepository.save(group)
    })
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    
    // Delete a Group
    let groupToRemove = await this.groupRepository.findOne(request.params.id)
    await this.groupRepository.remove(groupToRemove)
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
        
    // Return the list of Students that are in a Group
    const group_id = request.params.id

    return this.groupStudentRepository.find({ group_id })
  }


  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
  
    // 1. Clear out the groups (delete all the students from the groups)
    this.groupStudentRepository.clear()

    // 2. For each group, query the student rolls to see which students match the filter for the group
    const groups = await this.groupRepository.find()
    const studentGroups = await Promise.all(groups.map(g => this.formStudentGroups(g)))

    // 3. Add the list of students that match the filter to the group
    this.groupRepository.save(studentGroups)
  }

  async formStudentGroups(group: Group) {
      const weekOffset = new Date(Date.now() - ONE_WEEK * group.number_of_weeks)

      const students = await this.studentRollRepository
          .createQueryBuilder('student_roll')
          .innerJoin(Roll, "roll", "roll.id = student_roll.roll_id")
          .addSelect('student_roll.student_id as student_id')
          .addSelect(`${group.id} as group_id`)
          .addSelect('COUNT(student_roll.id) as incident_count')
          .where("student_roll.state in (:...state)", { state: group.roll_states.split(',') })
          .andWhere("roll.completed_at > :week", { week: weekOffset })
          .groupBy('student_roll.student_id')
          .having(`count(student_roll.id) ${group.ltmt} :incidents`, { incidents: group.incidents })
          .getRawMany()

      group.students = students.map(s => {
              const input = new GroupStudent()
              input.prepareToCreate(s)

              return input
          })
      group.student_count = students.length
      group.run_at = new Date()

      return group
  }
}
