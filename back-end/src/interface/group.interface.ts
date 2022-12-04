export interface CreateGroupInput {
  name: string
  number_of_weeks: number,
  roll_states: string,
  incidents: number,
  ltmt: '<' | '>',
}

export interface UpdateGroupInput {
  id: number
  name?: string,
  number_of_weeks?: number,
  roll_states?: string,
  incidents?: number,
  ltmt?: '<' | '>',
}

export interface CreateStudentGroupInput {
    student_id: number,
    group_id: number,
    incident_count: number
}
