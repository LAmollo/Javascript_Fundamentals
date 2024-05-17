//
//You will create a script that gathers data, processes it, and then outputs a consistent result as described by a specification. This is a very typical situation in industry, and this particular scenario has been modified from a real application. The data you will use is provided below.
//You will be provided with four different types of data:
//A CourseInfo object, which looks like this:
//{
  //"id": number,
  //"name": string,
//}

//An AssignmentGroup object, which looks like this:
//{
  //"id": number,
  //"name": string,
  // the ID of the course the assignment group belongs to
  //"course_id": number,
  // the percentage weight of the entire assignment group
  //"group_weight": number,
  //"assignments": [AssignmentInfo],
//}

//Each AssignmentInfo object within the assignments array looks like this:
//{
 //"id": number,
  //"name": string,
  // the due date for the assignment
  //"due_at": Date string,
  // the maximum points possible for the assignment
  //"points_possible": number,
//}

//An array of LearnerSubmission objects, which each look like this:
//{
    //"learner_id": number,
    //"assignment_id": number,
    //"submission": {
     // "submitted_at": Date string,
      //"score": number
    //}
//}

//Your goal is to analyze and transform this data such that the output of your program is an array of objects, each containing the following information in the following format:
//{
    // the ID of the learner for which this data has been collected
    //"id": number,
    // the learner’s total, weighted average, in which assignments
    // with more points_possible should be counted for more
    // e.g. a learner with 50/100 on one assignment and 190/200 on another
    // would have a weighted average score of 240/300 = 80%.
    //"avg": number,
    // each assignment should have a key with its ID,
    // and the value associated with it should be the percentage that
    // the learner scored on the assignment (submission.score / points_possible)
    //<assignment_id>: number,
    // if an assignment is not yet due, it should not be included in either
    // the average or the keyed dictionary of scores
//}

//</assignment_id>If an AssignmentGroup does not belong to its course (mismatching course_id), your program should throw an error, 
//letting the user know that the input was invalid. Similar data validation should occur elsewhere within the program.
//You should also account for potential errors in the data that your program receives. 
//What if points_possible is 0? You cannot divide by zero. What if a value that you are expecting to be a number is instead a string? 
//Use try/catch and other logic to handle these types of errors gracefully.
//If an assignment is not yet due, do not include it in the results or the average. 
//Additionally, if the learner’s submission is late (submitted_at is past due_at), 
//deduct 10 percent of the total points possible from their score for that assignment.
//Create a function named getLearnerData() that accepts these values as parameters, 
//in the order listed: (CourseInfo, AssignmentGroup, [LearnerSubmission]), and returns the formatted result, 
//which should be an array of objects as described above.
//You may use as many helper functions as you see fit.

const CourseInfo = {
  id: 451,
  name: "Introduction to JavaScript"
};
const AssignmentGroup = {
  id: 12345,
  name: "Fundamentals of JavaScript",
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: "Declare a Variable",
      due_at: "2023-01-25",
      points_possible: 50
    },
    {
      id: 2,
      name: "Write a Function",
      due_at: "2023-02-27",
      points_possible: 150
    },
    {
      id: 3,
      name: "Code the World",
      due_at: "3156-11-15",
      points_possible: 500
    }
  ]
};




function calculateWeightedAverage(assignments, submissions) {
    let totalScore = 0;
    let totalWeight = 0;
  
    assignments.forEach(assignment => {
      const submission = submissions.find(sub => sub.assignment_id === assignment.id);
      if (submission && submission.submitted_at <= assignment.due_at) {
        const latePenalty = submission.submitted_at > assignment.due_at ? 0.1 : 0;
        const score = submission.score - (submission.score * latePenalty);
        totalScore += score;
        totalWeight += assignment.points_possible;
      }
    });
  
    return totalWeight === 0 ? null : (totalScore / totalWeight) * 100;
  }
  
  function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    if (assignmentGroup.course_id !== courseInfo.id) {
      throw new Error("Invalid input: Assignment group does not belong to the provided course.");
    }
  
    const assignmentsMap = new Map(assignmentGroup.assignments.map(assignment => [assignment.id, assignment]));
    const learnerData = {};
  
    learnerSubmissions.forEach(submission => {
      if (!assignmentsMap.has(submission.assignment_id)) return;
  
      const assignment = assignmentsMap.get(submission.assignment_id);
      const scorePercentage = submission.submission.score / assignment.points_possible;
      if (isNaN(scorePercentage) || assignment.points_possible === 0) return;
  
      if (!learnerData[submission.learner_id]) {
        learnerData[submission.learner_id] = {
          id: submission.learner_id,
          avg: 0,
          ...Object.fromEntries(assignmentGroup.assignments.map(assignment => [assignment.id, null]))
        };
      }
  
      if (!assignment.due_at || new Date() <= new Date(assignment.due_at)) {
        learnerData[submission.learner_id][assignment.id] = scorePercentage * 100;
      }
    });
  
    Object.values(learnerData).forEach(learner => {
      learner.avg = calculateWeightedAverage(assignmentGroup.assignments, learnerSubmissions.filter(submission => submission.learner_id === learner.id));
    });
  
    return Object.values(learnerData).filter(data => data.avg !== null);
  }

  