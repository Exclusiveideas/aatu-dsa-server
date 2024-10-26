const fs = require('fs');

const generateStudents = () => {
  const levels = [100, 200, 300, 400, 500];
  const students = [];

  levels.forEach((level) => {
    for (let i = 1; i <= 150; i++) {
      const student = {
        name: `Student ${level}-${i}`,
        matricNumber: `${level}/20/1/${String(i).padStart(4, '0')}`,
        level: level
      };
      students.push(student);
    }
  });

  return students;
};

const students = generateStudents();
fs.writeFileSync('data/students.json', JSON.stringify(students, null, 2), 'utf-8');
console.log('Students data generated and saved to data/students.json');
