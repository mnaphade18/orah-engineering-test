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

    // 2. For each group, query the student rolls to see which students match the filter for the group

    // 3. Add the list of students that match the filter to the group
  }
}
