---
title: "File I/O"
date: 2022-01-28T09:44:59-07:00
draft: true
---

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
