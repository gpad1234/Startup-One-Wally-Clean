/**
 * Mock ontology data for testing the GraphView component
 * Represents a simple academic ontology hierarchy
 */

export const mockClasses = [
  {
    id: 'owl:Thing',
    label: 'Thing',
    description: 'Root of all classes',
    parent_classes: [],
    direct_properties: [],
    all_properties: [],
  },
  {
    id: 'demo:Person',
    label: 'Person',
    description: 'A human being',
    parent_classes: ['owl:Thing'],
    direct_properties: [
      {
        id: 'demo:name',
        label: 'name',
        required: true,
        inherited: false
      },
      {
        id: 'demo:email',
        label: 'email',
        required: true,
        inherited: false
      }
    ],
    all_properties: [
      {
        id: 'demo:name',
        label: 'name',
        required: true,
        inherited: false
      },
      {
        id: 'demo:email',
        label: 'email',
        required: true,
        inherited: false
      }
    ]
  },
  {
    id: 'demo:Professor',
    label: 'Professor',
    description: 'A university professor',
    parent_classes: ['demo:Person'],
    direct_properties: [
      {
        id: 'demo:department',
        label: 'department',
        required: true,
        inherited: false
      },
      {
        id: 'demo:office',
        label: 'office',
        required: false,
        inherited: false
      }
    ],
    all_properties: [
      {
        id: 'demo:name',
        label: 'name',
        required: true,
        inherited: true,
        source: 'demo:Person'
      },
      {
        id: 'demo:email',
        label: 'email',
        required: true,
        inherited: true,
        source: 'demo:Person'
      },
      {
        id: 'demo:department',
        label: 'department',
        required: true,
        inherited: false
      },
      {
        id: 'demo:office',
        label: 'office',
        required: false,
        inherited: false
      }
    ]
  },
  {
    id: 'demo:Student',
    label: 'Student',
    description: 'A university student',
    parent_classes: ['demo:Person'],
    direct_properties: [
      {
        id: 'demo:student_id',
        label: 'student_id',
        required: true,
        inherited: false
      },
      {
        id: 'demo:gpa',
        label: 'gpa',
        required: false,
        inherited: false
      }
    ],
    all_properties: [
      {
        id: 'demo:name',
        label: 'name',
        required: true,
        inherited: true,
        source: 'demo:Person'
      },
      {
        id: 'demo:email',
        label: 'email',
        required: true,
        inherited: true,
        source: 'demo:Person'
      },
      {
        id: 'demo:student_id',
        label: 'student_id',
        required: true,
        inherited: false
      },
      {
        id: 'demo:gpa',
        label: 'gpa',
        required: false,
        inherited: false
      }
    ]
  },
  {
    id: 'demo:Employee',
    label: 'Employee',
    description: 'A university employee',
    parent_classes: ['demo:Person'],
    direct_properties: [
      {
        id: 'demo:employee_id',
        label: 'employee_id',
        required: true,
        inherited: false
      },
      {
        id: 'demo:hire_date',
        label: 'hire_date',
        required: false,
        inherited: false
      }
    ],
    all_properties: [
      {
        id: 'demo:name',
        label: 'name',
        required: true,
        inherited: true,
        source: 'demo:Person'
      },
      {
        id: 'demo:email',
        label: 'email',
        required: true,
        inherited: true,
        source: 'demo:Person'
      },
      {
        id: 'demo:employee_id',
        label: 'employee_id',
        required: true,
        inherited: false
      },
      {
        id: 'demo:hire_date',
        label: 'hire_date',
        required: false,
        inherited: false
      }
    ]
  }
];

export const mockInstances = [
  {
    id: 'demo:prof_smith',
    label: 'Professor Smith',
    classId: 'demo:Professor',
    properties: {
      'demo:name': 'Dr. John Smith',
      'demo:email': 'john.smith@university.edu',
      'demo:department': 'Computer Science',
      'demo:office': 'Building A, Room 301'
    }
  },
  {
    id: 'demo:student_jones',
    label: 'Student Jones',
    classId: 'demo:Student',
    properties: {
      'demo:name': 'Alice Jones',
      'demo:email': 'alice.jones@university.edu',
      'demo:student_id': 'S12345',
      'demo:gpa': '3.8'
    }
  },
  {
    id: 'demo:emp_brown',
    label: 'Employee Brown',
    classId: 'demo:Employee',
    properties: {
      'demo:name': 'Robert Brown',
      'demo:email': 'robert.brown@university.edu',
      'demo:employee_id': 'E67890',
      'demo:hire_date': '2020-01-15'
    }
  }
];
