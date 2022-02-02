---
title: "File I/O"
date: 2022-01-28T09:44:59-07:00
draft: true
---

## What is it?

File reading and writing is the same as the keyboard, its just another stream of input/output. The easist way to start using file i/o in java is the file class.

### File Input

```java

//import

import java.io.file;

//Declare and Instantiate File

File <file_variable_name> = new File(<file_name>);
File myFile =  new File("data.txt");

//Attach Scanner

Scanner <scanner_name> = new Scanner(<file_variable_name>);
Scanner inFile = new Scanner(myFile);

//Read File contents using Scanner Methods
next, nextLine, nextInt, nextDouble, etc.
```

### File Output

```java
//Import
import java.io.PrintWriter;

//Declare and Instatnaiate PrintWriter

PrintWriter myfile = new PrinWriter("data.txt");

```

### Using File I/O

```java

String inputFileName = "MyData1.txt";
String outputFileName = "MyResults.txt";
// open input file and attach a Scanner for reading
File inputFile = new File(inputFileName);
Scanner inFile = new Scanner(inputFile);
// open output file and attach a PrintWriter
PrintWriter outFile = new PrintWriter(outputFileName);
// write header to output file
outFile.printf("%-15s%-5s%n", "Name", "Average");
outFile.println("-----------------------");
// throw away the first two lines of the input file
inFile.nextLine(); inFile.nextLine();

while (inFile.hasNext()) {
  // get name
  String name = inFile.next();
  // get Exam 1 score
  double exam1 = inFile.nextDouble();
  // get Exam 2 score
  double exam2 = inFile.nextDouble();
  // compute exam average
  double avg = (exam1 + exam2) / 2.0;
  // write exam average to output file
  outFile.printf("%-15s%5.2f%n", name, avg);
}
// close files when done reading and writing
inFile.close();
outFile.close();
```

### Excpetion Handling

When using File I/O errors must be handled.

#### Complile Time errors

code wont compile and run

#### Run Time errors

Code encounters an error at runtime. Ex: / by 0

### How to handle an error

#### Try and Catch blocks

Everything in the try block will be attempetd. If it encoutners and error, it will kick to the catch block. Inside of a program you can have more than one `try catch` block and the `Exception` block is the most generic and will catch any error. Always plan for errors, there is no situatuin where you can prevent every error.

```java
public static void main(String[] args) {
  System.out.println("--- 1 ---");
  f(10, 5);
  System.out.println("--- 2 ---");
  g(10, 5);
  System.out.println("--- 3 ---");
  g(10, 0);
  System.out.println("--- 4 ---");
  f(10, 0);
  System.out.println("--- 5 ---");
}

static void f(int x, int y) {
  System.out.printf("f(%d, %d) --> ", x, y);
  int z = x / y;
  System.out.printf("%d / %d is %d\n", x, y, z);
}

static void g(int x, int y) {
  try {
    System.out.printf("g(%d, %d) --> ", x, y);
    int z = x / y;
    System.out.printf("%d / %d is %d\n", x, y, z);
  } catch (Exception e) {
    System.out.println("Caught: " + e);
  }
}
```

### Checked vs Unchecked Exceptions
